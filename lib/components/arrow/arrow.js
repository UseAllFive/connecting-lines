import { Graphics } from 'pixi.js';

export default class Arrow extends Graphics {
  constructor() {
    super();

    this.beginFill(0x000000);
    this.moveTo(0, 3);
    this.lineTo(13, 3);
    this.lineTo(13, 0);
    this.lineTo(20, 3.5);
    this.lineTo(13, 7);
    this.lineTo(13, 4);
    this.lineTo(0, 4);
    this.lineTo(0, 3);
  }
}
