import { Container, Text, Point, Graphics, loader as Loader, Sprite } from 'pixi.js/src';
import { TweenMax, Power4 } from 'gsap';
import ColorDot from './ColorDot';
import { getData, IS_MOBILE, getArrowScale, getArrowScaleMobile } from '../../utils/config';
import { random, TWO_PI, ANGLE_TO_RAD } from '../../utils/Maths';
import Arrow from '../arrow/arrow';
import { shuffle } from 'lodash';
import { styleTitle, styleTitleMobile, styleInfo, styleInfoMobile, styleLink, styleLinkMobile } from './styles';

const data = getData();
const HOVER_PERC = 1.1;

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
  constructor(props, maxImageWidth, maxImageHeight, showDebug) {
    super();

    this.showDebug = showDebug;

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
    this.imageContainer.alpha = 0.2;
    this.imageContainer.x = 25;
    this.imageContainer.y = 30;
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
    this.selected = false;

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
    const events = IS_MOBILE() ? ['tap'] : ['click', 'mouseover', 'mouseout'];
    for (const event of events) {
      this.on(event, this.callbackRef);
    }
  }

  eventHandler(event) {
    switch(event.type) {
      case 'tap':
      case 'click':
        if(event.target instanceof ColorDot === false) {
          if(this.selected) {
            this.emit('clickedLink', this.blockSlug);
          } else {
            this.emit('over', {blockSlug: this.blockSlug});
            this.onFirstClick();
          }
          this.selected = !this.selected;
        }

        // if(event.currentTarget instanceof Text) {
        //   event.stopPropagation();
        //   if(event.target.alpha === 0) return;
        //   this.emit('clickedLink', this.blockSlug);
        //   return;
        // }
        break;

      case 'mouseover':
        this.hoverImage();
        break;

      case 'mouseout':
        if(!this.selected) this.hoverImage(false);
        break;

    }
  }

  onFirstClick() {
    TweenMax.killTweensOf([this.imageContainer, this.arrow, this.link]);
    TweenMax.to(this.imageContainer, 0.5, {alpha: 0.6, ease: Power4.easeOut});
    TweenMax.to(this.arrow, .25, {alpha: 1, x: this.arrow.__startPos + 10, delay: .2});
    TweenMax.to(this.link, .25, {alpha: 1, x: this.link.__startPos + 10, delay: .2});
  }

  onMouseOut() {
    TweenMax.killTweensOf(this.imageContainer);
    TweenMax.killTweensOf(this.arrow);
    TweenMax.killTweensOf(this.link);

    TweenMax.to(this.imageContainer, .5, {alpha: .5});
    TweenMax.to(this.arrow, .25, {alpha: 0, x: this.arrow.__startPos});
    TweenMax.to(this.link, .25, {alpha: 0, x: this.link.__startPos});
    this.selected = false;
    // this.animateImages();
    this.hoverImage(false);

  }

  animateImages() {
    // let i = 0;
    this.imageContainer.children.forEach((image) => {
      TweenMax.killTweensOf(image);

      // const animProps = {
      //   // scale: image.scale.x,
      //   x: image.x,
      //   y: image.y,
      // }

      // const scale = animIn ? image.__scale : image.__originalScale;
      const x = image.__originalPosition.x;
      const y = image.__originalPosition.y;

      TweenMax.to(image, .25, {
        x, y,
        ease: Power4.easeOut
      })

      // TweenMax.to(animProps, .25, {
      //   x, y,
      //   ease: Power4.easeOut,
      //   onUpdate: function(image, props) {
      //     // image.scale.x = props.scale;
      //     // image.scale.y = props.scale;
      //     image.x = props.x,
      //     image.y = props.y
      //   },
      //   onUpdateParams: [image, animProps]
      // })
    });
  }

  hoverImage(animIn = true) {
    TweenMax.killTweensOf([this.imageContainer, this.title, this.title.position, this.info, this.info.position]);
    if (animIn) {
      TweenMax.to(this.imageContainer, 0.5, {alpha: 0.4, ease: Power2.easeOut});
    } else {
      TweenMax.to(this.imageContainer, 0.5, {alpha: 0.2, ease: Power2.easeOut});
    }
  }

  createHitTest() {
    const { x, y, width, height } = this.getBounds();
    this.pivot = new Point(x, y);

    this.hitTest.x = x;
    this.hitTest.y = y;

    this.hitTest.clear();
    this.hitTest.beginFill(0xFf00ff, this.showDebug ? 0.1 : 0);
    this.hitTest.drawRect(0, 0, width, height);
    this.hitTest.endFill();
    this.resetScaleImages();
  }

  addImages(images) {
    let addedImages = 0;

    const angle = TWO_PI / 3;
    // const startRotation = (IS_MOBILE() ? 0 : (random(0, 180) * ANGLE_TO_RAD));
    const startRotation = (IS_MOBILE() ? 0 : ANGLE_TO_RAD);

    // multiply my this value, so we know how much bigger
    // the image will be
    // in this case, 50% bigger than the normal scale

    images = shuffle(images);
    for (const asset of images) {
      const { texture } = Loader.resources[asset];

      const isPortrait = texture.width < texture.height;
      const scale = isPortrait
        ? this.maxImageHeight / texture.height
        : this.maxImageWidth / texture.width;

      const sprite = new Sprite(texture);

      sprite.__originalScale = (IS_MOBILE() ? scale / 2 : scale) * random(0.7, 1);
      sprite.__scale = sprite.__originalScale * HOVER_PERC;
      sprite.__angle = (angle * addedImages) - startRotation;

      sprite.pivot = new Point(sprite.width / 2, sprite.height / 2);
      sprite.scale.x = sprite.__scale;
      sprite.scale.y = sprite.__scale;

      const spacingPercentage = .78;
      const spacingMousePerc = .71;

      const width = texture.width * sprite.__scale;
      const height = texture.height * sprite.__scale;

      sprite.__originalPosition = new Point(
        (width * spacingPercentage) * Math.cos(sprite.__angle),
        (height * spacingPercentage) * Math.sin(sprite.__angle)
      );

      sprite.__mouseOnPosition = new Point(
        (width * spacingMousePerc) * Math.cos(sprite.__angle),
        (height * spacingMousePerc) * Math.sin(sprite.__angle)
      );

      switch(addedImages) {
        case 0:
          if(this.showDebug) sprite.tint = 0xFF0000;
          break;

        case 1:
          // pos.x = Math.min(pos.x, this.imageContainer.width);
          if(this.showDebug) sprite.tint = 0xFFFF00;
          break;

        case 2:
          // pos.y = Math.min(pos.y, this.imageContainer.height);
          if(this.showDebug) sprite.tint = 0x00FF00;
          break;
      }

      addedImages++;

      sprite.x = sprite.__originalPosition.x;
      sprite.y = sprite.__originalPosition.y;

      this.imageContainer.addChild(sprite);

      // breaks after 1 image added on mobile
      if(IS_MOBILE()) {
        break;
      }
    }
  }

  resetScaleImages() {
    this.imageContainer.children.forEach((block) => {
      block.scale.x = block.__originalScale;
      block.scale.y = block.__originalScale;
    })
  }

  reemitDotClick(event) {
    this.emit('clickDot', event);
  }

  addLinks(links) {
    this.reemitDotClickBind = this.reemitDotClick.bind(this);
    this.linksContainer = new Container();
    this.linksContainer.position.y = IS_MOBILE() ? 0 : 2;
    this.dots = [];

    const { types } = data;

    let row = -1;
    let col = 0;
    const offset = IS_MOBILE() ? 5 : 8;

    if(!links) return

    for (const link of links) {
      const dot = new ColorDot(
        this.id,
        this.blockSlug,
        link,
        types[link]
      );
      dot.position.x = ( col % 2 ) * offset;
      dot.on('clickDot', this.reemitDotClickBind);

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
    this.info.position.y = this.title.height;
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
