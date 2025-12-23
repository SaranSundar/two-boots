import { Container, Graphics } from "pixi.js";
import { FancyButton } from "@pixi/ui";

export class VirtualControls extends Container {
  public leftButton!: FancyButton;
  public rightButton!: FancyButton;
  public jumpButton!: FancyButton;

  public leftPressed = false;
  public rightPressed = false;
  public jumpPressed = false;

  constructor() {
    super();

    // Only show on touch devices
    if (!this.shouldShow()) {
      this.visible = false;
      // Initialize dummy buttons even when hidden
      this.leftButton = new FancyButton({ defaultView: new Graphics() });
      this.rightButton = new FancyButton({ defaultView: new Graphics() });
      this.jumpButton = new FancyButton({ defaultView: new Graphics() });

      return;
    }

    // Create left arrow button
    this.leftButton = this.createArrowButton("left");
    this.leftButton.onDown.connect(() => (this.leftPressed = true));
    this.leftButton.onUp.connect(() => (this.leftPressed = false));
    this.addChild(this.leftButton);

    // Create right arrow button
    this.rightButton = this.createArrowButton("right");
    this.rightButton.onDown.connect(() => (this.rightPressed = true));
    this.rightButton.onUp.connect(() => (this.rightPressed = false));
    this.addChild(this.rightButton);

    // Create jump button
    this.jumpButton = this.createJumpButton();
    this.jumpButton.onDown.connect(() => (this.jumpPressed = true));
    this.jumpButton.onUp.connect(() => (this.jumpPressed = false));
    this.addChild(this.jumpButton);
  }

  private createArrowButton(direction: "left" | "right"): FancyButton {
    const size = 80;

    // Create arrow graphic
    const arrow = new Graphics();

    arrow.circle(size / 2, size / 2, size / 2);
    arrow.fill({ color: 0xffffff, alpha: 0.7 });

    // Draw arrow triangle
    if (direction === "left") {
      arrow.moveTo(size * 0.6, size * 0.3);
      arrow.lineTo(size * 0.3, size * 0.5);
      arrow.lineTo(size * 0.6, size * 0.7);
    } else {
      arrow.moveTo(size * 0.4, size * 0.3);
      arrow.lineTo(size * 0.7, size * 0.5);
      arrow.lineTo(size * 0.4, size * 0.7);
    }

    arrow.closePath();
    arrow.fill({ color: 0x000000, alpha: 0.8 });

    const button = new FancyButton({
      defaultView: arrow,
      anchor: 0,
    });

    return button;
  }

  private createJumpButton(): FancyButton {
    const size = 100;

    // Create jump button graphic
    const jumpGraphic = new Graphics();

    jumpGraphic.circle(size / 2, size / 2, size / 2);
    jumpGraphic.fill({ color: 0xffffff, alpha: 0.7 });

    jumpGraphic.circle(size / 2, size / 2, size / 3);
    jumpGraphic.fill({ color: 0x000000, alpha: 0.8 });

    const button = new FancyButton({
      defaultView: jumpGraphic,
      anchor: 0,
    });

    return button;
  }

  /**
   * Position controls on screen
   */
  public positionControls(width: number, height: number): void {
    if (!this.shouldShow()) return;

    const margin = 20;
    const buttonSpacing = 90;

    // Position left button
    this.leftButton.x = margin;
    this.leftButton.y = height - 80 - margin;

    // Position right button
    this.rightButton.x = margin + buttonSpacing;
    this.rightButton.y = height - 80 - margin;

    // Position jump button
    this.jumpButton.x = width - 100 - margin;
    this.jumpButton.y = height - 100 - margin;
  }

  /**
   * Check if touch controls should be shown
   */
  public shouldShow(): boolean {
    return "ontouchstart" in window;
  }
}
