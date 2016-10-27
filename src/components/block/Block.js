import { Container, Text } from 'pixi.js/src';
import ColorDot from './ColorDot';
import { types } from '../../data';

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

    const { title, types } = props;

    // this.graph = new Graphics();
    // this.graph.lineStyle(0);
    // this.graph.beginFill(0xFFFFFF * Math.random(), 1);
    // this.graph.drawCircle(0, 0, radius);
    // this.graph.endFill();
    // this.addChild(this.graph);

    this.addTitle(title);
    this.addLinks(types)
  }

  addLinks(links) {
    this.linksContainer = new Container();
    this.linksContainer.position.y = 2;
    this.dots = [];
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
