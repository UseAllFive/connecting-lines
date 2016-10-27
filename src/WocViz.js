import dat from 'dat-gui'
import Stats from 'stats-js'
import {
  autoDetectRenderer,
  // CanvasRenderer,
  Graphics,
  Container } from 'pixi.js/src';
import { groupBy } from 'lodash';

import { setSize, getSize, DEBUG } from './utils/config';
import { getRandomMinMaxVectorScreen } from './utils/random';
import Block from './components/block/block';
import { data } from './data';

class WocViz {

  constructor(props) {
    this.autoRender = props.autoRender || true;
    const { width, height, canvasContainer } = props;

    this.renderer = null;
    this.scene    = null;
    this.counter  = 0;
    this.gui      = null;

    setSize({
      w: width,
      w2: width / 2,
      wr: width / window.devicePixelRatio,
      h: height,
      h2: height / 2,
      hr: height / window.devicePixelRatio,
    })

    // this.loadFonts();
    this.startStats();
    this.createRender(canvasContainer);
    this.addObjects();
    this.generateLines();
    this.startGUI();

    if(this.autoRender) this.update();
  }

  startStats() {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = 0;
    this.stats.domElement.style.display = DEBUG ? 'block' : 'none';
    this.stats.domElement.style.left = 0;
    this.stats.domElement.style.zIndex = 50;
    document.body.appendChild(this.stats.domElement);
    document.querySelector('.help').style.display = this.stats.domElement.style.display == 'block' ? "none" : "block";
  }

  createRender(canvasContainer) {
    const options = {
      resolution: window.devicePixelRatio,
      antialias: true,
      backgroundColor: 0xFFFFFF
    }

    const { w, h } = getSize();
    // this.renderer = new CanvasRenderer(w, h, options);
    this.renderer = autoDetectRenderer(w, h, options);
    canvasContainer.appendChild(this.renderer.view)

    this.scene = new Container();
    this.scene.interactive = true;
  }

  addObjects() {

    const objNum = data.length;
    this.blocks = [];
    for (let i = 0; i < objNum; i++) {

      const radius = 10 + 100 * Math.random();

      const blockData = data[i];
      blockData.radius = radius;

      const block = new Block(blockData);
      const { x, y } = getRandomMinMaxVectorScreen(7, 7, block.width, block.height);
      block.position.x = x;
      block.position.y = y;

      this.blocks.push(block);

      this.scene.addChild(block);
    }
  }

  generateLines() {
    let dots = [];
    for (const block of this.blocks) {
      dots = dots.concat(block.dots);
    }

    const groupDots = groupBy(dots, (dot) => dot.dotType);

    let first = false;

    for (const group of Object.keys(groupDots)) {
      const line = new Graphics();
      first = true;
      this.scene.addChild(line);

      for (const dot of groupDots[group]) {
        const { x, y } = dot.getGlobalPoint();
        if(first) {
          line.moveTo(x, y);
          first = false;
        } else {
          line.lineStyle(0.5, dot.color);
          line.lineTo(x, y);
        }
      }

      line.endFill();

    }
  }

  startGUI() {
    this.gui = new dat.GUI()
    this.gui.domElement.style.display = DEBUG ? 'block' : 'none';

    // let cameraFolder = this.gui.addFolder('Camera');
    // cameraFolder.add(this.camera.position, 'x', -400, 400);
    // cameraFolder.add(this.camera.position, 'y', -400, 400);
    // cameraFolder.add(this.camera.position, 'z', -400, 400);

  }

  update() {
    if(this.autoRender) this.stats.begin();

    this.renderer.render(this.scene);

    if(this.autoRender) this.stats.end()
    if(this.autoRender) requestAnimationFrame(this.update.bind(this));
  }

  /*
  events
  */

  onKeyUp() {
  }

  onResize(w, h) {
    w = w || window.innerWidth;
    h = h || window.innerHeight;

    setSize({
      w: w,
      w2: w / 2,
      wr: w / window.devicePixelRatio,
      h: h,
      h2: h / 2,
      hr: h / window.devicePixelRatio,
    })

    this.renderer.resize(getSize().w, getSize().h);
  }
}

export default WocViz;
