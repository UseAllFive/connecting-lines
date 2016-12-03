import { Graphics } from 'pixi.js/src';
import { IS_MOBILE } from '../../utils/config';

export default class ColorDot extends Graphics {
  constructor(blockId, blockSlug, indexType, data) {
    super();

    const radius = IS_MOBILE() ? 1.5 : 3;
    const { color, id, slug } = data;

    this.dotType = id;
    this.color = color;
    this.indexType = indexType;
    this.blockId = blockId;
    this.blockSlug = blockSlug;
    this.dotSlug = slug;

    this.callbackBind = this.eventHandler.bind(this);

    this.beginFill(color);
    this.drawCircle(0, 0, radius);
    this.endFill();
    this.addEvents();
  }

  destroy(val) {
    this.buttonMode = false;
    this.interactive = false;
    const events = ['tap', 'click'];
    for (const event of events) {
      this.off(event, this.callbackBind);
    }
    super.destroy(val);
  }

  addEvents() {
    this.buttonMode = true;
    this.interactive = true;
    const events = ['tap', 'click'];
    for (const event of events) {
      this.on(event, this.callbackBind);
    }
  }

  eventHandler() {
    this.emit('clickDot', {
      blockSlug: this.blockSlug,
      indexType: this.indexType,
      dotSlug: this.dotSlug,
    });
  }

  getGlobalPoint() {
    return this.toGlobal({x: 0, y: 0});
  }
}
