import dat from 'dat-gui'
import Stats from 'stats-js'
import {
  Graphics,
  Container } from 'pixi.js/src';
import { groupBy } from 'lodash';

import { setSize, getSize, DEBUG, setData, getData } from './utils/config';
import { getRandomMinMaxVectorScreen } from './utils/random';
import { loadAssets, loadFonts } from './utils/loader';
import Renderer from './components/renderer/renderer';
import Block from './components/block/Block';

/**
 * @class WocViz
 * @constructor
 * @see index.js for params description
 */
class WocViz {

  constructor(props) {
    const { width, height, autoRender, forceCanvas, canvasContainer, data, showDebug } = props;

    this.autoRender = autoRender || true;
    this.canvasContainer = canvasContainer;
    this.forceCanvas = forceCanvas || false;

    this.renderer = null;
    this.scene    = null;
    this.counter  = 0;
    this.gui      = null;
    this.showDebug = showDebug || false;

    setData(data);
    this.data = getData();

    setSize({
      w: width,
      w2: width / 2,
      wr: width / window.devicePixelRatio,
      h: height,
      h2: height / 2,
      hr: height / window.devicePixelRatio,
    })

    const fontNames = [
      'SangBleu BP',
      'GT Sectra Trial',
      'Castledown'
    ]

    loadFonts(fontNames, this.canvasContainer);

    const { assets, assetsFolder } = this.data;
    loadAssets(assets, assetsFolder, () => { this.onAssetsComplete() });
  }

  onAssetsComplete() {
    this.createRender();
    this.addObjects();
    this.generateLines();

    if(this.showDebug) {
      this.startStats();
      this.startGUI();
    }

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
  }

  createRender() {

    this.renderer = new Renderer(this.forceCanvas);
    this.canvasContainer.appendChild(this.renderer.view);

    this.scene = new Container();
    this.scene.interactive = true;
  }

  addObjects() {

    const { blocks } = this.data;
    this.blocks = [];
    for (let i = 0; i < blocks.length; i++) {

      const blockData = blocks[i];

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
    if(this.stats) this.stats.begin();

    this.renderer.render(this.scene);

    if(this.stats) this.stats.end()
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
