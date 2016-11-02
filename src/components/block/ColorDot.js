import { Graphics } from 'pixi.js/src';
import { IS_MOBILE } from '../../utils/config';

export default class ColorDot extends Graphics {
  constructor(data) {
    super();
    const radius = IS_MOBILE() ? 1.5 : 3;
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
