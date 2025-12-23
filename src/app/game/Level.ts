import { Container, Sprite, Texture } from "pixi.js";

import type { LevelData, TileData } from "./LevelLoader";

const TILE_SIZE = 32;

export class Level extends Container {
  private tileSprites: Map<string, Sprite> = new Map();
  private levelData: LevelData;
  public widthInTiles: number;
  public heightInTiles: number;

  constructor(levelData: LevelData) {
    super();

    this.levelData = levelData;
    this.widthInTiles = levelData.width;
    this.heightInTiles = levelData.height;

    this.createTiles();

    // Position will be set by GameScreen to center the level
  }

  private createTiles(): void {
    // Create sprites for all non-air tiles
    this.levelData.tiles.forEach((tileData) => {
      const sprite = new Sprite(Texture.from(tileData.sprite));

      // Position the sprite
      sprite.x = tileData.x * TILE_SIZE;
      sprite.y = tileData.y * TILE_SIZE;

      // Set size to tile size
      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;

      // Store reference for later (e.g., removing coins)
      const key = `${tileData.x},${tileData.y}`;

      this.tileSprites.set(key, sprite);

      this.addChild(sprite);
    });
  }

  /**
   * Get tiles at a specific grid position
   */
  public getTilesAt(gridX: number, gridY: number): TileData[] {
    return this.levelData.tiles.filter(
      (tile) => tile.x === gridX && tile.y === gridY,
    );
  }

  /**
   * Get all solid tiles (grass blocks)
   */
  public getSolidTiles(): TileData[] {
    return this.levelData.tiles.filter((tile) => tile.type === "grass");
  }

  /**
   * Get all hazard tiles (spikes)
   */
  public getHazardTiles(): TileData[] {
    return this.levelData.tiles.filter((tile) => tile.type === "spike");
  }

  /**
   * Get all collectible tiles (coins)
   */
  public getCoinTiles(): TileData[] {
    return this.levelData.tiles.filter((tile) => tile.type === "coin");
  }

  /**
   * Get door tile
   */
  public getDoorTile(): TileData | undefined {
    return this.levelData.tiles.find((tile) => tile.type === "door");
  }

  /**
   * Remove a coin from the level
   */
  public removeCoin(gridX: number, gridY: number): void {
    const key = `${gridX},${gridY}`;
    const sprite = this.tileSprites.get(key);

    if (sprite) {
      this.removeChild(sprite);
      sprite.destroy();
      this.tileSprites.delete(key);
    }

    // Also remove from level data
    const index = this.levelData.tiles.findIndex(
      (tile) =>
        tile.type === "coin" && tile.x === gridX && tile.y === gridY,
    );

    if (index !== -1) {
      this.levelData.tiles.splice(index, 1);
    }
  }

  /**
   * Convert pixel position to grid coordinates
   */
  public pixelToGrid(pixelX: number, pixelY: number): { x: number; y: number } {
    return {
      x: Math.floor(pixelX / TILE_SIZE),
      y: Math.floor(pixelY / TILE_SIZE),
    };
  }

  /**
   * Convert grid coordinates to pixel position (center of tile)
   */
  public gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * TILE_SIZE + TILE_SIZE / 2,
      y: gridY * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}
