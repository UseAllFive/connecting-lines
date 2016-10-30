import { Container, Text, Point, loader as Loader, Sprite } from 'pixi.js/src';
import ColorDot from './ColorDot';
import { getData } from '../../utils/config';
import { random } from '../../utils/Maths';

const data = getData();
const MAX_HEIGHT = 120 / 3;
const MAX_WIDTH = 200 / 3;

const style = {
  fontFamily: 'SangBleu BP',
  fontSize: 21,
  fill: 0x000000,
  align: 'left'
}

export default class Block extends Container {
  /**
   * @constructor
   * @param title
   * @param radius
   */
  constructor(props) {
    super();

    const { title, links, images } = props;

    this.addImages(images);
    this.addTitle(title);
    this.addLinks(links)
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
      sprite.alpha = .5;

      this.addChild(sprite);
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

  addTitle(title) {
    this.title = new Text(title, style);
    this.title.position.x = 15;
    this.addChild(this.title);
  }

  updateTitle(title) {
    if(this.title) this.title.txt = title;
  }
}
