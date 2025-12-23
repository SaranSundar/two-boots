import { Container, Sprite, Texture } from "pixi.js";
import { animate } from "motion";

import { engine } from "../../getEngine";
import { Button } from "../../ui/Button";

import { GameScreen } from "./GameScreen";

export class StartScreen extends Container {
  public static assetBundles = ["game-ui", "main"];

  private background: Sprite;
  private startButton: Button;

  constructor() {
    super();

    // Create background
    this.background = new Sprite(Texture.from("game-ui/StartScreen.png"));
    this.background.anchor.set(0.5);
    this.addChild(this.background);

    // Create start button
    this.startButton = new Button({
      text: "Start Game",
      width: 250,
      height: 100,
    });
    this.startButton.onPress.connect(() => this.handleStart());
    this.addChild(this.startButton);
  }

  private async handleStart(): Promise<void> {
    await engine().navigation.showScreen(GameScreen);
  }

  public async show(): Promise<void> {
    // Fade in
    this.alpha = 0;
    await animate(this, { alpha: 1 } as any, { duration: 0.5, ease: "linear" });
  }

  public async hide(): Promise<void> {
    // Fade out
    await animate(this, { alpha: 0 } as any, { duration: 0.3, ease: "linear" });
  }

  public resize(width: number, height: number): void {
    // Center background
    this.background.x = width / 2;
    this.background.y = height / 2;

    // Scale background to fit
    const scale = Math.min(width / this.background.texture.width, height / this.background.texture.height);

    this.background.scale.set(scale);

    // Position start button
    this.startButton.x = width / 2;
    this.startButton.y = height * 0.7;
  }
}
