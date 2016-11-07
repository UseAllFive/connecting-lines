import { Container, Text, Point, Graphics, loader as Loader, Sprite } from 'pixi.js/src';
import { TweenMax } from 'gsap';
import ColorDot from './ColorDot';
import { getData, IS_MOBILE } from '../../utils/config';
import { random } from '../../utils/Maths';
import Arrow from '../arrow/arrow';
import { styleTitle, styleTitleMobile, styleInfo, styleInfoMobile, styleLink, styleLinkMobile } from './styles';

const data = getData();
const MAX_HEIGHT = 120 / 2.5;
const MAX_WIDTH = 200 / 2.5;

export default class Block extends Container {
  /**
   * @constructor
   * @param title
   * @param links
   * @param images
   * @param body
   * @param link
   * @param url
   */
  constructor(props) {
    super();

    const { title, links, images, body, link, url } = props;

    this.linkURL = url;
    this.blockTitle = title;
    this.links = links;

    this.hitTest = new Graphics();
    this.addChild(this.hitTest);

    this.imageContainer = new Container();
    this.imageContainer.alpha = .5;
    this.addChild(this.imageContainer);

    this.maxWidthBlock = 0;

    this.addImages(images);
    this.addInformation(title, body, link, url);
    this.addLinks(links)
    this.createHitTest();
    this.addEvents();


  }

  addEvents() {
    this.buttonMode = true;
    this.interactive = true;
    const events = ['mouseover', 'mouseout'];
    for (const event of events) {
      this.on(event, this.eventHandler.bind(this));
    }
  }

  eventHandler(event) {
    switch(event.type) {
      case 'tap':
      case 'click':
        // this.emit('click', {title: this.blockTitle});
        window.open(this.linkURL);
        break;

      case 'mouseover':
        this.emit('over', {title: this.blockTitle});
        TweenMax.to(this.imageContainer, .5, {alpha: .35, overwrite: 'all'});
        TweenMax.to(this.info, .25, {alpha: 1, x: this.info.__startPos + 10, overwrite: 'all'});
        TweenMax.to(this.arrow, .25, {alpha: 1, x: this.arrow.__startPos + 10, delay: .1, overwrite: 'all'});
        TweenMax.to(this.link, .25, {alpha: 1, x: this.link.__startPos + 10, delay: .1, overwrite: 'all'});
        break;

      case 'mouseout':
        this.emit('out', {title: this.blockTitle});
        TweenMax.to(this.imageContainer, .5, {alpha: .5, overwrite: 'all'});
        TweenMax.to(this.info, .25, {alpha: 0, x: this.info.__startPos, delay: .1, overwrite: 'all'});
        TweenMax.to(this.arrow, .25, {alpha: 0, x: this.arrow.__startPos, overwrite: 'all'});
        TweenMax.to(this.link, .25, {alpha: 0, x: this.link.__startPos, overwrite: 'all'});
        break;
    }
  }

  createHitTest() {
    this.hitTest.clear();
    this.hitTest.beginFill(0xFf00ff, 0);
    this.hitTest.drawRect(0, 0, this.maxWidthBlock, this.height);
    this.hitTest.endFill();

    console.log(this.maxWidthBlock);
  }

  addImages(images) {
    let addedImages = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let lastX = 0;
    let lastY = 0;
    const offset = IS_MOBILE() ? 5 : 15;

    for (const asset of images) {
      const { texture } = Loader.resources[asset];

      const isPortrait = texture.width < texture.height;
      const scale = isPortrait ?
        MAX_HEIGHT / texture.height :
        MAX_WIDTH / texture.width;

      const sprite = new Sprite(texture);
      sprite.scale.set(IS_MOBILE() ? scale / 2 : scale );

      const pos = new Point();

      switch(addedImages) {
        case 0:
          pos.x = random(5, offset);
          pos.y = random(5, offset);
          // sprite.tint = 0xFF0000;
          break;

        case 1:
          pos.x = lastX + lastWidth + 5 + random(0, offset);
          pos.y = random(5, offset);
          // sprite.tint = 0xFFFF00;
          break;

        case 2:
          pos.x = random(offset / 2, offset + 10);
          pos.y = lastY + lastHeight + 5 + random(0, offset);
          // sprite.tint = 0x00FF00;
          break;
      }

      addedImages++;

      sprite.x = lastX = pos.x;
      sprite.y = lastY = pos.y;

      this.imageContainer.addChild(sprite);

      lastWidth = Math.max(lastWidth, sprite.width);
      lastHeight = Math.max(lastHeight, sprite.height);

      this.maxWidthBlock = Math.max(this.maxWidthBlock, lastX + lastWidth);

      if(IS_MOBILE()) {
        break;
      }
    }
  }

  addLinks(links) {
    this.linksContainer = new Container();
    this.linksContainer.position.y = IS_MOBILE() ? 0 : 2;
    this.dots = [];

    const { types } = data;

    let row = -1;
    let col = 0;
    const offset = IS_MOBILE() ? 3.5 : 7;
    for (const link of links) {
      const dot = new ColorDot(link, types[link]);
      dot.blockTitle = this.blockTitle;
      dot.position.x = ( col % 2 ) * offset;
      dot.on('clickDot', (event) => {
        this.emit('clickDot', event);
      })

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

    this.title = new Text(title, IS_MOBILE() ? styleTitleMobile : styleTitle);
    // this.title.resolution = window.devicePixelRatio;
    this.title.position.x = IS_MOBILE() ? 7 : 15;
    this.addChild(this.title);
    this.maxWidthBlock = Math.max(this.maxWidthBlock, this.title.width + this.title.position.x);

    this.info = new Text(info, IS_MOBILE() ? styleInfoMobile : styleInfo);
    // this.info.resolution = window.devicePixelRatio;
    this.info.alpha = 0;
    this.info.position.x = IS_MOBILE() ? 7 : 15;
    this.info.position.y = this.title.height + offset;
    this.info.__startPos = this.info.position.x;
    this.addChild(this.info);
    this.maxWidthBlock = Math.max(this.maxWidthBlock, this.info.width + this.info.position.x);

    this.link = new Text(linkCopy.toUpperCase(), IS_MOBILE() ? styleLinkMobile : styleLink);
    // this.link.resolution = window.devicePixelRatio;
    this.link.alpha = 0;
    this.link.position.x = IS_MOBILE() ? 7 : 15;
    this.link.position.y = this.info.position.y + this.info.height + offset + 3;
    this.link.__startPos = this.link.position.x;
    this.addChild(this.link);
    this.maxWidthBlock = Math.max(this.maxWidthBlock, this.link.width + this.link.position.x);

    this.link.buttonMode = true;
    this.link.interactive = true;
    const events = ['tap', 'click'];
    for (const event of events) {
      this.link.on(event, this.eventHandler.bind(this));
    }

    this.arrow = new Arrow();
    this.arrow.alpha = 0;
    this.arrow.scale.set(IS_MOBILE() ? 0.4 : 1);
    this.arrow.position.x = this.link.position.x + this.link.width + (IS_MOBILE() ? 1.5 : 3);
    this.arrow.position.y = (this.link.position.y + 1) + this.arrow.height / 2;
    this.arrow.__startPos = this.arrow.position.x;
    this.addChild(this.arrow);
    this.maxWidthBlock = Math.max(this.maxWidthBlock, this.arrow.width + this.arrow.position.x);

  }

  updateTitle(title) {
    if(this.title) this.title.txt = title;
  }
}
