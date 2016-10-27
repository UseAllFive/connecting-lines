import { Graphics } from 'pixi.js/src';

export default class ColorDot extends Graphics {
  constructor(data) {
    super();
    const radius = 3;
    const { color, id/*, value */ } = data;

    this.dotType = id;
    this.color = color;

    // console.log(data);

    this.beginFill(color);
    this.drawCircle(0, 0, radius);
    this.endFill();
  }

  getGlobalPoint() {
    return this.toGlobal({x: 0, y: 0});
  }
}
