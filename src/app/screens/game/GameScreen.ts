import { Container } from "pixi.js";

import { engine } from "../../getEngine";
import { Level } from "../../game/Level";
import { LevelLoader } from "../../game/LevelLoader";
import { Player } from "../../game/Player";
import { CoinCounter } from "../../game/ui/CoinCounter";

import { GameOverScreen } from "./GameOverScreen";
import { WinScreen } from "./WinScreen";

export class GameScreen extends Container {
  public static assetBundles = ["game"];

  private camera: Container;
  private uiLayer: Container;

  private level!: Level;
  private player!: Player;

  private currentLevelNum: number = 1;
  private coinsCollected: number = 0;
  private coinCounter!: CoinCounter;

  // Keyboard state
  private keys = { left: false, right: false, space: false };

  private paused = false;
  private gameOver = false;

  // Keyboard handlers (bound methods for proper cleanup)
  private keyDownHandler = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") this.keys.left = true;
    if (e.key === "ArrowRight") this.keys.right = true;
    if (e.key === " " || e.key === "Spacebar") {
      this.keys.space = true;
      e.preventDefault(); // Prevent page scroll
    }
  };

  private keyUpHandler = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") this.keys.left = false;
    if (e.key === "ArrowRight") this.keys.right = false;
    if (e.key === " " || e.key === "Spacebar") {
      this.keys.space = false;
      e.preventDefault();
    }
  };

  constructor() {
    super();

    // Create camera container (holds level and player)
    this.camera = new Container();
    this.addChild(this.camera);

    // Create UI layer (unscaled, always on top)
    this.uiLayer = new Container();
    this.addChild(this.uiLayer);

    // Create coin counter
    this.coinCounter = new CoinCounter();
    this.uiLayer.addChild(this.coinCounter);
  }

  public async show(): Promise<void> {
    // Setup keyboard input
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);

    // Play background music
    engine().audio.bgm.play("game/sounds/GameMusic.wav", {
      volume: 0.3,
      loop: true,
    });

    // Load first level
    await this.loadLevel(1);
  }

  public async hide(): Promise<void> {
    // CRITICAL: Remove keyboard listeners
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);

    // Music will be paused automatically by engine on visibility change
  }

  public update(): void {
    if (this.paused || this.gameOver || !this.player || !this.level) return;

    // Update player movement from input
    if (this.keys.left) {
      this.player.moveLeft();
    } else if (this.keys.right) {
      this.player.moveRight();
    } else {
      this.player.stopMove();
    }

    if (this.keys.space) {
      this.player.jump();
    }

    // Update player physics and get collision results
    const collision = this.player.update(this.level);

    // Handle collision results
    if (collision.hitSpike) {
      this.handleLose();
    }

    if (collision.hitDoor) {
      this.handleWin();
    }

    if (collision.hitCoin) {
      this.level.removeCoin(collision.hitCoin.x, collision.hitCoin.y);
      this.coinsCollected++;
      this.coinCounter.updateCount(this.coinsCollected);
    }

    // Check if player fell off the world
    const levelBottom = this.level.y + this.level.heightInTiles * 32;

    if (this.player.y > levelBottom + 100) {
      this.handleLose();
    }
  }

  private async loadLevel(levelNum: number): Promise<void> {
    try {
      // Load level data
      const levelData = await LevelLoader.loadLevel(levelNum);

      this.currentLevelNum = levelNum;

      // Remove old level and player if they exist
      if (this.level) {
        this.camera.removeChild(this.level);
        this.level.destroy();
      }

      if (this.player) {
        this.camera.removeChild(this.player);
        this.player.destroy();
      }

      // Create new level
      this.level = new Level(levelData);

      // Center the level in the camera
      this.level.x = -(this.level.widthInTiles * 32) / 2;
      this.level.y = -(this.level.heightInTiles * 32) / 2;

      this.camera.addChild(this.level);

      // Create player at spawn position (adjusted for level offset)
      this.player = new Player();
      this.player.x = levelData.playerStart.x + this.level.x;
      this.player.y = levelData.playerStart.y + this.level.y;
      this.camera.addChild(this.player);

      // Reset game state
      this.gameOver = false;

      // Trigger resize to position camera
      if (this.parent) {
        const app = engine();

        this.resize(app.renderer.width, app.renderer.height);
      }
    } catch (error) {
      console.error(`Failed to load level ${levelNum}:`, error);

      // If level doesn't exist, show completion screen
      if (levelNum > 1) {
        await this.handleGameComplete();
      }
    }
  }

  private handleWin(): void {
    if (this.gameOver) return;

    this.gameOver = true;

    // Check if this was the last level
    if (this.currentLevelNum >= 4) {
      // All levels completed!
      setTimeout(async () => {
        await this.handleGameComplete();
      }, 500);
    } else {
      // Auto-load next level after short delay
      setTimeout(async () => {
        await this.loadLevel(this.currentLevelNum + 1);
      }, 500);
    }
  }

  private handleLose(): void {
    if (this.gameOver) return;

    this.gameOver = true;

    // Navigate to game over screen after delay
    setTimeout(async () => {
      await engine().navigation.showScreen(GameOverScreen);
    }, 1000);
  }

  private async handleGameComplete(): Promise<void> {
    // All levels completed!
    await engine().navigation.showScreen(WinScreen);
  }

  public resize(width: number, height: number): void {
    // Scale camera to fit level (2x scale for retro look)
    const scale = 2;

    this.camera.scale.set(scale);
    this.camera.position.set(width / 2, height / 2);

    // Position UI elements
    this.coinCounter.x = 20;
    this.coinCounter.y = 20;
  }

  public async pause(): Promise<void> {
    this.paused = true;
  }

  public async resume(): Promise<void> {
    this.paused = false;
  }

  public blur(): void {
    // Auto-pause when window loses focus (handled by Navigation)
  }
}
