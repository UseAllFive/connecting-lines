import dat from 'dat-gui'
import Stats from 'stats-js'
import {
  Graphics,
  Container } from 'pixi.js/src';
import { groupBy } from 'lodash';

import { setSize, getSize, DEBUG, setData, getData, setMinHeight } from './utils/config';
import { roundRandom, random, round } from './utils/Maths';
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

    console.log(width);

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

    const { w, h } = getSize();

    this.renderer = new Renderer(this.forceCanvas);
    this.canvasContainer.appendChild(this.renderer.view);

    this.scene = new Container();
    this.scene.interactive = true;
  }

  addObjects() {
    const { blocks } = this.data;
    this.blocks = [];
    this.maxWidthBlock = 0;

    for (const blockData of blocks) {
      const block = new Block(blockData);
      this.maxWidthBlock = round(Math.max(this.maxWidthBlock, block.width));
      this.blocks.push(block);
      this.scene.addChild(block);
    }

    this.calculatePositionBlocks();

  }

  calculatePoint(width, rowY, offset, row, i) {
    offset = offset || {x: 0, y: 0};
    const { wr } = getSize();
    const area = (wr / row);
    return {
      x: area * i + random(area - width),
      y: random(rowY + random(20, -10), offset.y + rowY)
    };
  }

  calculatePositionBlocks() {
    const { wr } = getSize();
    const maxPerRow = round(wr / (this.maxWidthBlock * 1.5));
    const rows = [];
    let addedCols = 0;
    while(addedCols < this.blocks.length) {
      const cols = roundRandom(1, maxPerRow);
      rows.push(cols);
      addedCols += cols;
    }

    let index = 0;
    let rowY = 0;

    for (const row of rows) {
      for (let i = 0; i < row; i++) {
        if(index >= this.blocks.length ) {
          break;
        }
        const block = this.blocks[index];
        const offset = {x: 0, y: rowY === 0 ? 20 : 0};
        const point = this.calculatePoint(block.width, rowY, offset, row, i);
        block.x = point.x;
        block.y = point.y;
        index++;
      }
      rowY += 180;
    }

    this.generateLines();

    setMinHeight(this.scene.height + 75);
    this.resizeRenderer();
  }

  generateLines() {
    if(this.containerLines) {
      this.containerLines.destroy(true);
      this.containerLines = null;
    }

    let dots = [];
    for (const block of this.blocks) {
      dots = dots.concat(block.dots);
    }

    const groupDots = groupBy(dots, (dot) => dot.dotType);
    this.containerLines = new Container();

    let first = false;

    for (const group of Object.keys(groupDots)) {
      const line = new Graphics();
      first = true;
      this.containerLines.addChild(line);

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

    this.scene.addChild(this.containerLines);
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

  resizeRenderer() {
    this.renderer.resize(getSize().w, Math.max(getSize().minHeight, getSize().h));
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

    this.calculatePositionBlocks();
    this.resizeRenderer();

  }
}

export default WocViz;
