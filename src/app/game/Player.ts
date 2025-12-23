import { Container, Sprite, Texture } from "pixi.js";

import type { Level } from "./Level";

const TILE_SIZE = 32;

export interface CollisionResult {
  hitSpike: boolean;
  hitDoor: boolean;
  hitCoin: { x: number; y: number } | null;
}

export class Player extends Container {
  private sprite: Sprite;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private isOnGround: boolean = false;

  // Hitbox (slightly smaller than sprite for better feel)
  private hitboxWidth = 28;
  private hitboxHeight = 30;

  // Constants
  private readonly MOVE_SPEED = 3;
  private readonly JUMP_FORCE = -12;
  private readonly GRAVITY = 0.6;
  private readonly MAX_FALL_SPEED = 15;

  constructor() {
    super();

    // Create player sprite
    this.sprite = new Sprite(Texture.from("Ezreal.png"));
    this.sprite.anchor.set(0.5);
    this.sprite.width = TILE_SIZE;
    this.sprite.height = TILE_SIZE;

    this.addChild(this.sprite);
  }

  public update(level: Level): CollisionResult {
    // 1. Apply horizontal velocity
    this.x += this.velocityX;
    this.checkHorizontalCollision(level);

    // 2. Apply gravity
    this.velocityY = Math.min(
      this.velocityY + this.GRAVITY,
      this.MAX_FALL_SPEED,
    );

    // 3. Apply vertical velocity
    this.y += this.velocityY;
    const result = this.checkVerticalCollision(level);

    return result;
  }

  public moveLeft(): void {
    this.velocityX = -this.MOVE_SPEED;
  }

  public moveRight(): void {
    this.velocityX = this.MOVE_SPEED;
  }

  public stopMove(): void {
    this.velocityX = 0;
  }

  public jump(): void {
    if (this.isOnGround) {
      this.velocityY = this.JUMP_FORCE;
      this.isOnGround = false;
    }
  }

  /**
   * Check horizontal collision with solid tiles
   */
  private checkHorizontalCollision(level: Level): void {
    const solidTiles = level.getSolidTiles();

    // Get player bounds in world space
    const left = this.x - this.hitboxWidth / 2;
    const right = this.x + this.hitboxWidth / 2;
    const top = this.y - this.hitboxHeight / 2;
    const bottom = this.y + this.hitboxHeight / 2;

    for (const tile of solidTiles) {
      // Tile bounds in world space (level is positioned at level.x, level.y)
      const tileLeft = level.x + tile.x * TILE_SIZE;
      const tileRight = level.x + (tile.x + 1) * TILE_SIZE;
      const tileTop = level.y + tile.y * TILE_SIZE;
      const tileBottom = level.y + (tile.y + 1) * TILE_SIZE;

      // Check if overlapping
      if (
        right > tileLeft &&
        left < tileRight &&
        bottom > tileTop &&
        top < tileBottom
      ) {
        // Resolve collision by pushing player out
        if (this.velocityX > 0) {
          // Moving right, push left
          this.x = tileLeft - this.hitboxWidth / 2;
        } else if (this.velocityX < 0) {
          // Moving left, push right
          this.x = tileRight + this.hitboxWidth / 2;
        }

        this.velocityX = 0;
      }
    }
  }

  /**
   * Check vertical collision with solid tiles
   */
  private checkVerticalCollision(level: Level): CollisionResult {
    const result: CollisionResult = {
      hitSpike: false,
      hitDoor: false,
      hitCoin: null,
    };

    this.isOnGround = false;

    const solidTiles = level.getSolidTiles();

    // Get player bounds in world space
    const left = this.x - this.hitboxWidth / 2;
    const right = this.x + this.hitboxWidth / 2;
    const top = this.y - this.hitboxHeight / 2;
    const bottom = this.y + this.hitboxHeight / 2;

    for (const tile of solidTiles) {
      // Tile bounds in world space
      const tileLeft = level.x + tile.x * TILE_SIZE;
      const tileRight = level.x + (tile.x + 1) * TILE_SIZE;
      const tileTop = level.y + tile.y * TILE_SIZE;
      const tileBottom = level.y + (tile.y + 1) * TILE_SIZE;

      // Check if overlapping
      if (
        right > tileLeft &&
        left < tileRight &&
        bottom > tileTop &&
        top < tileBottom
      ) {
        // Resolve collision by pushing player out
        if (this.velocityY > 0) {
          // Falling down, push up
          this.y = tileTop - this.hitboxHeight / 2;
          this.velocityY = 0;
          this.isOnGround = true;
        } else if (this.velocityY < 0) {
          // Jumping up, push down
          this.y = tileBottom + this.hitboxHeight / 2;
          this.velocityY = 0;
        }
      }
    }

    // Check for spike collision
    result.hitSpike = this.checkHazardCollision(level);

    // Check for door collision
    result.hitDoor = this.checkDoorCollision(level);

    // Check for coin collision
    result.hitCoin = this.checkCoinCollision(level);

    return result;
  }

  /**
   * Check if player is touching a spike
   */
  private checkHazardCollision(level: Level): boolean {
    const hazards = level.getHazardTiles();

    const left = this.x - this.hitboxWidth / 2;
    const right = this.x + this.hitboxWidth / 2;
    const top = this.y - this.hitboxHeight / 2;
    const bottom = this.y + this.hitboxHeight / 2;

    for (const tile of hazards) {
      const tileLeft = level.x + tile.x * TILE_SIZE;
      const tileRight = level.x + (tile.x + 1) * TILE_SIZE;
      const tileTop = level.y + tile.y * TILE_SIZE;
      const tileBottom = level.y + (tile.y + 1) * TILE_SIZE;

      if (
        right > tileLeft &&
        left < tileRight &&
        bottom > tileTop &&
        top < tileBottom
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if player is touching the door
   */
  private checkDoorCollision(level: Level): boolean {
    const door = level.getDoorTile();

    if (!door) return false;

    const left = this.x - this.hitboxWidth / 2;
    const right = this.x + this.hitboxWidth / 2;
    const top = this.y - this.hitboxHeight / 2;
    const bottom = this.y + this.hitboxHeight / 2;

    const tileLeft = level.x + door.x * TILE_SIZE;
    const tileRight = level.x + (door.x + 1) * TILE_SIZE;
    const tileTop = level.y + door.y * TILE_SIZE;
    const tileBottom = level.y + (door.y + 1) * TILE_SIZE;

    return (
      right > tileLeft &&
      left < tileRight &&
      bottom > tileTop &&
      top < tileBottom
    );
  }

  /**
   * Check if player is touching a coin
   */
  private checkCoinCollision(level: Level): { x: number; y: number } | null {
    const coins = level.getCoinTiles();

    const left = this.x - this.hitboxWidth / 2;
    const right = this.x + this.hitboxWidth / 2;
    const top = this.y - this.hitboxHeight / 2;
    const bottom = this.y + this.hitboxHeight / 2;

    for (const tile of coins) {
      const tileLeft = level.x + tile.x * TILE_SIZE;
      const tileRight = level.x + (tile.x + 1) * TILE_SIZE;
      const tileTop = level.y + tile.y * TILE_SIZE;
      const tileBottom = level.y + (tile.y + 1) * TILE_SIZE;

      if (
        right > tileLeft &&
        left < tileRight &&
        bottom > tileTop &&
        top < tileBottom
      ) {
        return { x: tile.x, y: tile.y };
      }
    }

    return null;
  }

  /**
   * Reset player state
   */
  public reset(): void {
    this.velocityX = 0;
    this.velocityY = 0;
    this.isOnGround = false;
  }
}
