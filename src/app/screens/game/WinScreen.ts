import { Container, Sprite, Texture } from "pixi.js";
import { animate } from "motion";

import { engine } from "../../getEngine";
import { Button } from "../../ui/Button";

import { StartScreen } from "./StartScreen";

export class WinScreen extends Container {
  public static assetBundles = ["game-ui", "main"];

  private background: Sprite;
  private menuButton: Button;

  constructor() {
    super();

    // Create background
    this.background = new Sprite(Texture.from("game-ui/YouWin.png"));
    this.background.anchor.set(0.5);
    this.addChild(this.background);

    // Create menu button
    this.menuButton = new Button({
      text: "Back to Menu",
      width: 250,
      height: 100,
    });
    this.menuButton.onPress.connect(() => this.handleMenu());
    this.addChild(this.menuButton);
  }

  private async handleMenu(): Promise<void> {
    await engine().navigation.showScreen(StartScreen);
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

    // Position button
    this.menuButton.x = width / 2;
    this.menuButton.y = height * 0.7;
  }
}
