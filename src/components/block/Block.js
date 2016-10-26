import { Container, Text } from 'pixi.js/src';
import ColorDot from './ColorDot';
import { types } from '../../data';

const style = {
  fontFamily: 'SangBleu BP',
  fontSize: 18,
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
    let row = -1;
    const offset = 3;
    for (var i = 0; i < links.length; i++) {
      const link = types[links[i]];
      const { color } = link;

      const dot = new ColorDot(color);
      dot.position.x = ( i % 2 ) * offset;
      if(i % 2 === 0 ) row++;
      dot.position.y = row * offset;

      this.linksContainer.addChild(dot);
    }
    this.addChild(this.linksContainer);
  }

  addTitle(title) {
    this.title = new Text(title, style);
    this.title.position.x = 10;
    this.addChild(this.title);
  }

  updateTitle(title) {
    if(this.title) this.title.txt = title;
  }
}
