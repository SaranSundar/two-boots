import { Container, Sprite, Texture } from "pixi.js";

import { Label } from "../../ui/Label";

export class CoinCounter extends Container {
  private coinIcon: Sprite;
  private countLabel: Label;

  constructor() {
    super();

    // Create coin icon
    this.coinIcon = new Sprite(Texture.from("ZileanCoin.png"));
    this.coinIcon.width = 32;
    this.coinIcon.height = 32;
    this.coinIcon.x = 0;
    this.coinIcon.y = 0;
    this.addChild(this.coinIcon);

    // Create count label
    this.countLabel = new Label({
      text: "0",
      style: {
        fill: 0xffffff,
        fontSize: 28,
        fontWeight: "bold",
        stroke: { color: 0x000000, width: 4 },
      },
    });
    this.countLabel.anchor.set(0, 0.5);
    this.countLabel.x = 40;
    this.countLabel.y = 16;
    this.addChild(this.countLabel);
  }

  public updateCount(count: number): void {
    this.countLabel.text = count.toString();
  }
}
