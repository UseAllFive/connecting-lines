import { Container, Text, Point, Graphics, loader as Loader, Sprite } from 'pixi.js/src';
import { TweenMax } from 'gsap';
import ColorDot from './ColorDot';
import { getData } from '../../utils/config';
import { random } from '../../utils/Maths';
import Arrow from '../arrow/arrow';
import { styleTitle, styleInfo, styleLink } from './styles';

const data = getData();
const MAX_HEIGHT = 120 / 3;
const MAX_WIDTH = 200 / 3;

export default class Block extends Container {
  /**
   * @constructor
   * @param title
   * @param radius
   */
  constructor(props) {
    super();

    const { title, links, images, body, link, url } = props;

    this.linkURL = url;

    this.hitTest = new Graphics();
    this.addChild(this.hitTest);

    this.imageContainer = new Container();
    this.imageContainer.alpha = .7;
    this.addChild(this.imageContainer);

    this.addImages(images);
    this.addInformation(title, body, link, url);
    this.addLinks(links)
    this.createHitTest();
    this.addEvents();

  }

  addEvents() {
    this.buttonMode = true;
    this.interactive = true;
    const events = ['tap', 'click', 'mouseover', 'mouseout'];
    for (const event of events) {
      this.on(event, this.eventHandler.bind(this));
    }
  }

  eventHandler(event) {
    switch(event.type) {
      case 'tap':
      case 'click':
        window.open(this.linkURL);
        break;

      case 'mouseover':
        TweenMax.to(this.imageContainer, .5, {alpha: .35, overwrite: -1});
        TweenMax.to(this.info, .25, {alpha: 1, x: this.info.__startPos + 10, overwrite: -1});
        TweenMax.to(this.arrow, .25, {alpha: 1, x: this.arrow.__startPos + 10, delay: .1, overwrite: -1});
        TweenMax.to(this.link, .25, {alpha: 1, x: this.link.__startPos + 10, delay: .1, overwrite: -1});
        break;

      case 'mouseout':
        TweenMax.to(this.imageContainer, .5, {alpha: .7, overwrite: -1});
        TweenMax.to(this.info, .25, {alpha: 0, x: this.info.__startPos, delay: .1, overwrite: -1});
        TweenMax.to(this.arrow, .25, {alpha: 0, x: this.arrow.__startPos, overwrite: -1});
        TweenMax.to(this.link, .25, {alpha: 0, x: this.link.__startPos, overwrite: -1});
        break;
    }
  }

  createHitTest() {
    this.hitTest.beginFill(0xFFFFFF, 0);
    this.hitTest.drawRect(0, 0, this.width, this.height);
    this.hitTest.endFill();
  }

  addImages(images) {
    let addedImages = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let offset = 20;

    for (const asset of images) {
      const { texture } = Loader.resources[asset];

      const isPortrait = texture.width < texture.height;
      const scale = isPortrait ?
        MAX_HEIGHT / texture.height :
        MAX_WIDTH / texture.width;

      const sprite = new Sprite(texture);
      sprite.scale.set(scale)

      lastWidth = sprite.width;
      lastHeight = sprite.height;

      const pos = new Point();

      switch(addedImages) {
        case 0:
          pos.x = random(0, 20);
          pos.y = random(0, 20);
          break;

        case 1:
          pos.x = lastWidth + offset + random(0, 20);
          pos.y = offset + random(0, 20);
          break;

        case 2:
          pos.x = offset + random(0, 20);
          pos.y = lastHeight + offset + random(0, 20);
          break;
      }

      addedImages++;

      sprite.x = pos.x;
      sprite.y = pos.y;

      this.imageContainer.addChild(sprite);
    }
  }

  addLinks(links) {
    this.linksContainer = new Container();
    this.linksContainer.position.y = 2;
    this.dots = [];

    const { types } = data;

    let row = -1;
    let col = 0;
    const offset = 7;
    for (const link of links) {
      const dot = new ColorDot(types[link]);
      dot.position.x = ( col % 2 ) * offset;

      if(col % 2 === 0 ) row++;

      col++;
      dot.position.y = row * offset;

      this.dots.push(dot);

      this.linksContainer.addChild(dot);
    }
    this.linksContainer.position.y = offset;
    this.addChild(this.linksContainer);
  }

  addInformation(title, info, linkCopy) {
    const offset = 2;

    this.title = new Text(title, styleTitle);
    this.title.position.x = 15;
    this.addChild(this.title);

    this.info = new Text(info, styleInfo);
    this.info.alpha = 0;
    this.info.position.x = 15;
    this.info.position.y = this.title.height + offset;
    this.info.__startPos = this.info.position.x;
    this.addChild(this.info);

    this.link = new Text(linkCopy.toUpperCase(), styleLink);
    this.link.alpha = 0;
    this.link.position.x = 15;
    this.link.position.y = this.info.position.y + this.info.height + offset + 3;
    this.link.__startPos = this.link.position.x;
    this.addChild(this.link);

    this.arrow = new Arrow();
    this.arrow.alpha = 0;
    this.arrow.position.x = this.link.position.x + this.link.width + 3;
    this.arrow.position.y = this.link.position.y + 1;
    this.arrow.__startPos = this.arrow.position.x;
    this.addChild(this.arrow);

  }

  updateTitle(title) {
    if(this.title) this.title.txt = title;
  }
}
