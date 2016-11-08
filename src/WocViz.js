import dat from 'dat-gui'
import Stats from 'stats-js'
import attachFastClick from 'fastclick';
import {
  Graphics,
  Container } from 'pixi.js/src';
import { groupBy, find } from 'lodash';
import { TweenMax, TimelineMax } from 'gsap';

import { setSize, getSize, DEBUG, IS_MOBILE, setMobile, setData, getData, setMinHeight } from './utils/config';
import { roundRandom, random, round, addCurveSegment } from './utils/Maths';
import { loadAssets, loadFonts } from './utils/loader';
import Renderer from './components/renderer/renderer';
import Block from './components/block/Block';

const GUI_PARAMS = function() {
  this.lineSegments = 150;
  this.noisePowerMin = 2.5;
  this.noisePowerMax = 4;
  this.strokeWidth = 0.5;
  this.sketch = false;
}

const guiParams = new GUI_PARAMS();

/**
 * @class WocViz
 * @constructor
 * @see index.js for params description
 */
class WocViz {

  constructor(props) {
    const { width, height, autoRender, forceCanvas, canvasContainer, data, showDebug, isMobile } = props;

    this.autoRender = autoRender || true;
    this.canvasContainer = canvasContainer;
    this.forceCanvas = forceCanvas || false;

    setMobile(isMobile || false);

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

    if(DEBUG) {
      this.startStats();
      // this.startGUI();
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

    // const { w, h } = getSize();

    this.renderer = new Renderer(this.forceCanvas);
    this.canvasContainer.appendChild(this.renderer.view);
    attachFastClick(this.canvasContainer);

    this.scene = new Container();
    this.scene.interactive = true;
  }

  addObjects() {
    const { blocks } = this.data;
    this.blocks = [];
    this.maxWidthBlock = 0;

    for (const blockData of blocks) {
      const block = new Block(blockData);
      block.on('over', this.onBlockOver.bind(this));
      block.on('clickDot', this.onDotClick.bind(this));
      this.blocks.push(block);
      this.scene.addChild(block);
      this.maxWidthBlock = round(Math.max(this.maxWidthBlock, block.width));
    }

    this.calculatePositionBlocks();
    setMinHeight(this.scene.height + 75);
    this.resizeRenderer();

  }

  onBlockOver(event) {
    this.generateLines(event.title);
  }

  onDotClick(event) {
    this.generateLines(null, event.indexType);
  }

  calculatePoint(width, rowY, offset, row, i) {
    offset = offset || {x: 0, y: 0};
    const { wr } = getSize();
    const area = (wr / row);
    return {
      x: area * i + random(area - width),
      y: random(rowY + random(IS_MOBILE() ? 5 : 20, IS_MOBILE() ? 0 : 0), offset.y + rowY)
    };
  }

  calculatePositionBlocks() {
    const { wr } = getSize();

    let flagHasChanged = false;
    const tempMaxPerRow = round(wr / (this.maxWidthBlock * (IS_MOBILE() ? 1 : 1.5)));
    if(!this.maxPerRow) {
      this.maxPerRow = tempMaxPerRow;
      flagHasChanged = true;
    } else {
      if(this.maxPerRow !== tempMaxPerRow) {
        flagHasChanged = true;
        this.maxPerRow = tempMaxPerRow;
      }
    }

    if(flagHasChanged) {
      this.rows = [];
      let addedCols = 0;
      while(addedCols < this.blocks.length) {
        const cols = roundRandom(1, this.maxPerRow);
        this.rows.push(cols);
        addedCols += cols;
      }
    }

    let index = 0;
    let rowY = 0;

    for (const row of this.rows) {
      for (let i = 0; i < row; i++) {
        if(index >= this.blocks.length ) {
          break;
        }
        const block = this.blocks[index];
        const offset = {x: 10, y: rowY === 0 ? 30 : 0};
        const point = this.calculatePoint(block.width, rowY, offset, row, i);
        block.x = point.x;
        block.y = point.y;
        index++;
      }
      rowY += IS_MOBILE() ? 90 : 180;
    }

    // this.generateLines();
  }

  showLine(block) {
    this.generateLines(block);
  }

  showLineColour(colour) {
    this.generateLines(null, colour);
  }

  generateLines(blockTitle, indexType = null) {

    TweenMax.killAll();

    if(this.containerLines) {
      this.containerLines.destroy(true);
      this.scene.removeChild(this.containerLines);
      this.containerLines = null;
    }

    let dots = [];
    let referenceBlock = find(this.blocks, (block) => {
      return block.blockTitle === blockTitle
    });

    if(blockTitle) {
      for (const block of this.blocks) {
        // console.log(block.links, referenceBlock.links);
        if(block === referenceBlock) {
          dots = dots.concat(block.dots);
        } else {
          for (const dot of block.dots) {
            if(referenceBlock.links.indexOf(dot.indexType) > -1 ) {
              dots.push(dot);
            }
          }
        }
      }
    } else {
      for (const block of this.blocks) {
        for (const dot of block.dots) {
          if(dot.indexType === indexType) {
            dots.push(dot);
          }
        }
      }
    }

    const groupDots = groupBy(dots, (dot) => dot.dotType);
    this.containerLines = new Container();
    this.scene.addChild(this.containerLines);

    this.lines = [];

    // const ctx = this.renderer.view.getContext('2d');
    // console.log(ctx);
    //
    console.log(groupDots);

    for (const group of Object.keys(groupDots)) {
      const line = new Graphics();
      this.containerLines.addChild(line);

      const points = [];
      let color;

      for (const dot of groupDots[group]) {
        const { x, y } = dot.getGlobalPoint();
        color = dot.color;
        points.push([x, y]);
      }

      this.lines.push({line: line, color: color});
      // line.lineStyle(0.5, color);
      // line.moveTo(points[0][0], points[0][1]);

      // ctx.moveTo(points[0][0], points[0][1]);
      // ctx.beginPath();
      // ctx.lineWidth = 0.5;
      // ctx.strokeStyle = color;
      //

      // timeline.duration(1);

      // let curvePoints = [];

      const timeline = new TimelineMax({
        paused: true,
        duration: 1,

        onStart: function(l, c, x, y) {
          l.moveTo(x, y);
          l.lineStyle(0.5, color);
        }.bind(this, line, color, points[0][0], points[0][1]),

        onComplete: function(l) {
          // console.log('finish curve');
          // l.stroke();
          l.endFill();
        }.bind(this, line)

      });

      for (let i = 0; i < points.length - 1; i++) {

        const curvePoints = addCurveSegment(i, points);
      //   // let counter = 0;
      //   // setTimeout(addCurveSegment, 100 * i, line, i, points);
      // }

        for (let j = 0; j < curvePoints.length; j++) {

          const objRef = {
            x: j === 0 ? points[i][0] : curvePoints[j - 1].x,
            y: j === 0 ? points[i][1] : curvePoints[j - 1].y
          };

          timeline.add(TweenMax.to(objRef, 0.0025, {
            x: curvePoints[j].x,
            y: curvePoints[j].y,
            onStart: function(o, l) {
              // console.log(o);
              l.moveTo(o.x, o.y);
            }.bind(this, objRef, line),
            onUpdate: function(o, l) {
              // console.log(o);
              l.lineTo(o.x, o.y);
            }.bind(this, objRef, line),
            ease: 'linear'
          }));

          // setTimeout(() => { }, 100 * counter);
          // counter++;
        };


      }

      timeline.play();


      // line.endFill();

      // console.log(curvePoints);

      // line.endFill();

    }

    // TweenMax.to(this.containerLines, .5, {
    //   alpha: 1
    // })
    setMinHeight(this.scene.height + 75);
    this.resizeRenderer();
  }

  startGUI() {
    this.gui = new dat.GUI()
    this.gui.domElement.style.display = DEBUG ? 'block' : 'none';

    this.gui.add(guiParams, 'lineSegments', 10, 300).step(1).onChange(this.generateLines.bind(this));
    this.gui.add(guiParams, 'noisePowerMin', 1, 25).onChange(this.generateLines.bind(this));
    this.gui.add(guiParams, 'noisePowerMax', 1, 25).onChange(this.generateLines.bind(this));
    this.gui.add(guiParams, 'strokeWidth', 0.1, 5).onChange(this.generateLines.bind(this));
    this.gui.add(guiParams, 'sketch').onChange(this.generateLines.bind(this));

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
    this.renderer.resize(getSize().wr, Math.max(getSize().minHeight, getSize().hr));
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
