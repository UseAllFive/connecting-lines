import { Container, Graphics } from 'pixi.js/src';

export default class ColorDot extends Container {
  constructor(color) {
    super();
    const radius = 1;

    const graph = new Graphics();
    graph.beginFill(color);
    graph.drawCircle(0, 0, radius);
    graph.endFill();

    this.addChild(graph);
  }
}
