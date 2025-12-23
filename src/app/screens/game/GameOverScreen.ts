import { Container, Sprite, Texture } from "pixi.js";
import { animate } from "motion";
import type { ObjectTarget } from "motion/react";

import { engine } from "../../getEngine";
import { Button } from "../../ui/Button";

import { GameScreen } from "./GameScreen";
import { StartScreen } from "./StartScreen";

export class GameOverScreen extends Container {
  public static assetBundles = ["game-ui", "main"];

  private background: Sprite;
  private retryButton: Button;
  private menuButton: Button;

  constructor() {
    super();

    // Create background
    this.background = new Sprite(Texture.from("game-ui/GAMEOVER.png"));
    this.background.anchor.set(0.5);
    this.addChild(this.background);

    // Create retry button
    this.retryButton = new Button({
      text: "Retry",
      width: 200,
      height: 90,
    });
    this.retryButton.onPress.connect(() => this.handleRetry());
    this.addChild(this.retryButton);

    // Create menu button
    this.menuButton = new Button({
      text: "Menu",
      width: 200,
      height: 90,
    });
    this.menuButton.onPress.connect(() => this.handleMenu());
    this.addChild(this.menuButton);
  }

  private async handleRetry(): Promise<void> {
    await engine().navigation.showScreen(GameScreen);
  }

  private async handleMenu(): Promise<void> {
    await engine().navigation.showScreen(StartScreen);
  }

  public async show(): Promise<void> {
    // Fade in
    this.alpha = 0;
    await animate(this, { alpha: 1 } as ObjectTarget<this>, {
      duration: 0.5,
      ease: "linear",
    });
  }

  public async hide(): Promise<void> {
    // Fade out
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
      ease: "linear",
    });
  }

  public resize(width: number, height: number): void {
    // Center background
    this.background.x = width / 2;
    this.background.y = height / 2;

    // Scale background to fit
    const scale = Math.min(
      width / this.background.texture.width,
      height / this.background.texture.height,
    );

    this.background.scale.set(scale);

    // Position buttons
    this.retryButton.x = width / 2;
    this.retryButton.y = height * 0.6;

    this.menuButton.x = width / 2;
    this.menuButton.y = height * 0.75;
  }
}
