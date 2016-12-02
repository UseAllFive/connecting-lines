import { Container, Text, Point, Graphics, loader as Loader, Sprite } from 'pixi.js/src';
import { TweenMax } from 'gsap';
import ColorDot from './ColorDot';
import { getData, IS_MOBILE, getArrowScale, getArrowScaleMobile } from '../../utils/config';
import { random } from '../../utils/Maths';
import Arrow from '../arrow/arrow';
import { styleTitle, styleTitleMobile, styleInfo, styleInfoMobile, styleLink, styleLinkMobile } from './styles';

const data = getData();

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
  constructor(props, maxImageWidth, maxImageHeight) {
    super();

    const { title, links, images, body, link, url, id, slug } = props;

    this.maxImageWidth = maxImageWidth;
    this.maxImageHeight = maxImageHeight;

    this.linkURL = url;
    this.blockTitle = title;
    this.links = links || [];
    this.linksSlugs = [];
    this.links.forEach((link) => {this.linksSlugs.push(data.types[link].slug)});

    this.id = id;
    this.blockSlug = slug;

    this.hitTest = new Graphics();
    this.addChild(this.hitTest);

    this.imageContainer = new Container();
    this.imageContainer.alpha = .5;
    this.addChild(this.imageContainer);

    this.callbackRef = this.eventHandler.bind(this);

    this.addImages(images);
    this.addInformation(title, body, link, url);
    this.addLinks(links)
    this.createHitTest();
    this.addEvents();
  }

  destroy(val) {
    this.linksSlugs = null;

    TweenMax.killTweensOf(this.imageContainer);
    TweenMax.killTweensOf(this.info);
    TweenMax.killTweensOf(this.arrow);
    TweenMax.killTweensOf(this.link);

    let events = IS_MOBILE() ? ['tap'] : ['mouseover', 'mouseout'];
    for (const event of events) {
      this.off(event, this.callbackRef);
    }

    this.imageContainer.children.forEach((child) => {
      TweenMax.killTweensOf(child);
      child.destroy(true);
    })

    this.imageContainer.destroy(true);
    this.imageContainer = null;

    this.buttonMode = false;
    this.interactive = false;

    this.dots.forEach((dot) => dot.destroy(true));
    this.dots = null;

    this.title.destroy(true);
    this.info.destroy(true);

    this.link.interactive = false;
    events = ['click', 'tap'];
    for (const event of events) {
      this.link.off(event, this.callbackRef);
    }
    this.link.destroy(true);
    this.arrow.destroy(true);

    this.title = null;
    this.info = null;
    this.link = null;
    this.arrow = null;

    this.children.forEach((child) => child.destroy(true));

    super.destroy(val);
  }

  addEvents() {
    this.buttonMode = true;
    this.interactive = true;
    const events = IS_MOBILE() ? ['tap'] : ['mouseover', 'mouseout'];
    for (const event of events) {
      this.on(event, this.callbackRef);
    }
  }

  eventHandler(event) {
    switch(event.type) {
      case 'click':
        if(event.target.alpha === 0) return;
        this.emit('clickedLink', this.blockSlug);
        break;

      case 'tap':
        if(event.currentTarget instanceof Text) {
          event.stopPropagation();
          if(event.target.alpha === 0) return;
          window.open(this.linkURL);
          return;
        }
      case 'mouseover':
        this.emit('over', {blockSlug: this.blockSlug});
        this.onMouseOver();
        break;

      case 'mouseout':
        this.onMouseOut();
        break;
    }
  }

  onMouseOver() {
    TweenMax.killTweensOf(this.imageContainer);
    TweenMax.killTweensOf(this.arrow);
    TweenMax.killTweensOf(this.link);

    TweenMax.to(this.imageContainer, .5, {alpha: .35});
    TweenMax.to(this.arrow, .25, {alpha: 1, x: this.arrow.__startPos + 10, delay: .1});
    TweenMax.to(this.link, .25, {alpha: 1, x: this.link.__startPos + 10, delay: .1});
    this.animateImages();
  }

  onMouseOut() {
    TweenMax.killTweensOf(this.imageContainer);
    TweenMax.killTweensOf(this.arrow);
    TweenMax.killTweensOf(this.link);

    TweenMax.to(this.imageContainer, .5, {alpha: .5});
    TweenMax.to(this.arrow, .25, {alpha: 0, x: this.arrow.__startPos});
    TweenMax.to(this.link, .25, {alpha: 0, x: this.link.__startPos});
    this.animateImages(false);
  }

  animateImages(animIn = true) {
    this.imageContainer.children.forEach((image) => {
      TweenMax.killTweensOf(image);
      TweenMax.to(image.scale, .25, {
        x: image.__scale + (!animIn ? 0 : -.015),
        y: image.__scale + (!animIn ? 0 : -.015),
      });
    });
  }

  createHitTest() {
    this.hitTest.clear();
    this.hitTest.beginFill(0xFf00ff, 0);
    this.hitTest.drawRect(0, 0, this.width, this.height);
    this.hitTest.endFill();
  }

  addImages(images) {
    let addedImages = 0;
    const offset = IS_MOBILE() ? 5 : 15;

    for (const asset of images) {
      const { texture } = Loader.resources[asset];

      const isPortrait = texture.width < texture.height;
      const scale = isPortrait ?
        this.maxImageHeight / texture.height :
        this.maxImageWidth / texture.width;

      const sprite = new Sprite(texture);
      sprite.__scale = IS_MOBILE() ? scale / 2 : scale;
      sprite.pivot = new Point(sprite.width / 2, sprite.height / 2);
      sprite.scale.x = sprite.__scale;
      sprite.scale.y = sprite.__scale;
      // sprite.scale.set( sprite.__scale );

      const pos = new Point();

      switch(addedImages) {
        case 0:
          pos.x = sprite.width / 2 + random(5, offset);
          pos.y = sprite.height / 2 + random(5, offset);
          // sprite.tint = 0xFF0000;
          break;

        case 1:
          pos.x = this.imageContainer.width + sprite.width / 2 + 10 + random(5, offset);
          pos.y = sprite.height / 2 + random(5, offset);
          // sprite.tint = 0xFFFF00;
          break;

        case 2:
          pos.x = sprite.width / 2 + random(offset / 2, offset + 10);
          pos.y = this.imageContainer.height + sprite.height / 2 + 10 + random(0, offset);
          // sprite.tint = 0x00FF00;
          break;
      }

      addedImages++;

      sprite.x = pos.x;
      sprite.y = pos.y;

      this.imageContainer.addChild(sprite);


      // breaks after 1 image added on mobile
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
    const offset = IS_MOBILE() ? 7 : 14;

    if(!links) return

    for (const link of links) {
      const dot = new ColorDot(
        this.id,
        this.blockSlug,
        link,
        types[link]
      );
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

    this.title = new Text(title, IS_MOBILE() ? styleTitleMobile() : styleTitle());
    // this.title.resolution = window.devicePixelRatio;
    this.title.position.x = IS_MOBILE() ? 15 : 30;
    this.addChild(this.title);

    this.info = new Text(info, IS_MOBILE() ? styleInfoMobile() : styleInfo());
    // this.info.resolution = window.devicePixelRatio;
    this.info.position.x = IS_MOBILE() ? 6 : 32;
    this.info.position.y = this.title.height + offset;
    this.info.__startPos = this.info.position.x;
    this.addChild(this.info);

    this.link = new Text(linkCopy.toUpperCase(), IS_MOBILE() ? styleLinkMobile() : styleLink());
    // this.link.resolution = window.devicePixelRatio;
    this.link.alpha = 0;
    this.link.position.x = IS_MOBILE() ? 6 : 22;
    this.link.position.y = this.info.position.y + this.info.height + (IS_MOBILE() ? offset : offset + 3);
    this.link.__startPos = this.link.position.x;
    this.addChild(this.link);

    this.link.buttonMode = true;
    this.link.interactive = true;
    const events = ['click', 'tap'];
    for (const event of events) {
      this.link.on(event, this.callbackRef);
    }

    this.arrow = new Arrow();
    this.arrow.alpha = 0;
    this.arrow.scale.set(IS_MOBILE() ? getArrowScaleMobile() : getArrowScale());
    this.arrow.position.x = this.link.position.x + this.link.width + (IS_MOBILE() ? 0 : 3);
    this.arrow.position.y = this.link.position.y + this.arrow.height / 2;
    this.arrow.__startPos = this.arrow.position.x;
    this.addChild(this.arrow);

  }

  updateTitle(title) {
    if(this.title) this.title.txt = title;
  }
}
