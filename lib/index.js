import Stats from 'stats-js'
import attachFastClick from 'fastclick';
import { Graphics, Container } from 'pixi.js/src';
import { groupBy, find, filter } from 'lodash';
import { TweenMax, TimelineMax } from 'gsap';
import { data as defaultData } from './data/data.js';

import {
  setSize,
  getSize,
  setFontSizes,
  IS_MOBILE,
  setMobile,
  setData,
  getData,
  setMinHeight,
  setArrowScale,
  setArrowScaleMobile,
} from './utils/config';

import {
  roundRandom,
  random,
  round,
  addCurveSegment
} from './utils/Maths';

import { loadAssets, loadFonts, destroyLoader } from './utils/loader';
import Renderer from './components/renderer/renderer';
import Block from './components/block/Block';

/**
 * @class WocViz
 * @constructor
 * @see index.js for params description
 */
class WocViz {

  /**
   * @method init
   * public method to start the viz
   * everything here was previously on constructor
   */
  init(props) {
    const {
      width,
      height,
      autoRender,
      forceCanvas,
      canvasContainer,
      maxImageWidth,
      maxImageHeight,
      data,
      retina,
      fontSizes,
      arrowSize,
      arrowSizeMobile,
      showDebug,
      safeZone,
      animationTimingMultiplier,
      onReady,
      onLinkClick,
      isMobile } = props;

    this.retina = retina;
    this.safeZone = safeZone || {
      width: 200,
      height: 200,
      x: 0,
      y: 0,
    };

    this.autoRender = autoRender || true;
    this.canvasContainer = canvasContainer || document.body;
    this.forceCanvas = forceCanvas;
    this.onReady = onReady;
    this.onLinkClick = onLinkClick || function(){};
    this.animationTimingMultiplier = animationTimingMultiplier || .6;

    this.maxImageWidth = maxImageWidth || 200;
    this.maxImageHeight = maxImageHeight || 200;

    setMobile(isMobile || false);

    this.renderer = null;
    this.scene    = null;
    this.counter  = 0;
    this.gui      = null;
    this.showDebug = showDebug || false;

    setData(data || defaultData);
    this.data = getData();

    const defaultFontSizes = {
      title: 30,
      titleMobile: 18,
      info: 20,
      infoMobile: 11,
      link: 16,
      linkMobile: 9,
    }

    if(fontSizes) {
      for (const size in fontSizes) {
        if (fontSizes.hasOwnProperty(size)) {
          defaultFontSizes[size] = fontSizes[size]
        }
      }
    }

    setFontSizes(defaultFontSizes);
    setArrowScale(arrowSize || 1.2);
    setArrowScaleMobile(arrowSizeMobile || .8);

    this.createRender();

    setSize({
      w: (width || window.innerWidth),
      w2: (width || window.innerWidth) / 2,
      wr: (width || window.innerWidth),
      h: (height || window.innerHeight),
      h2: (height || window.innerHeight) / 2,
      hr: (height || window.innerHeight),
    })

    const fontNames = [
      'sangbleu-light',
      'sectra-book',
      'castledown-regular'
    ]

    loadFonts(fontNames, this.canvasContainer);

    const { assets, assetsFolder } = this.data;
    loadAssets(assets, assetsFolder, () => { this.onAssetsComplete() });
  }

  /**
   * @method destroy
   * @param {bool} destroyCanvas also remove the canvas element from dom
   */
  destroy(destroyCanvas = true) {

    TweenMax.ticker.removeEventListener('tick', this.update);

    this.sceneHitTest.off(IS_MOBILE() ? 'tap' : 'click', this.refOnHideAllLines);

    if(this.stats) document.body.removeChild(this.stats.domElement);
    this.stats = null;

    this.blocks.forEach((block) => {
      block.destroy(true);
      block = null;
    })

    if(this.timelines) {
      this.timelines.forEach((t) => {
        t.kill();
        t = null;
      });
    }

    this.blocks = null;
    this.lines = null;
    this.timelines = null;
    this.maxPerRow = null;
    this.rows = null;

    if(this.containerLines) {
      TweenMax.killTweensOf(this.containerLines);
      this.containerLines.destroy(true);
    }
    if(this.sceneHitTest) this.sceneHitTest.destroy(true);
    if(this.containerLines) this.containerLines.destroy(true);

    this.containerLines = null;
    this.sceneHitTest = null;

    destroyLoader();

    this.scene.destroy(true);
    this.scene = null;
    this.renderer.destroy(destroyCanvas);
    // if(this.raf) cancelAnimationFrame(this.raf);
    // this.raf = null;
  }

  /**
   * @event onAssetsComplete
   * triggered when all assets are loaded and starts the visualisation
   */
  onAssetsComplete() {
    this.addObjects();

    if(this.showDebug) {
      this.startStats();
    }

    if(this.onReady) this.onReady();
    if(this.autoRender) {
      TweenMax.ticker.addEventListener('tick', this.update, this, true, 1);
      // this.update();
    }
  }

  /**
   * @method startStats
   * puts the FPS meter on the page
   */
  startStats() {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = 0;
    this.stats.domElement.style.display = this.showDebug ? 'block' : 'none';
    this.stats.domElement.style.left = 0;
    this.stats.domElement.style.zIndex = 50;
    document.body.appendChild(this.stats.domElement);
  }

  /**
   * @method createRender
   * creates the PIXI render and the scene (Container)
   * where all objects are placed
   */
  createRender() {

    this.renderer = new Renderer(this.forceCanvas, this.retina);
    this.canvasContainer.appendChild(this.renderer.view);
    attachFastClick(this.canvasContainer);
    this.renderer.plugins.interaction.autoPreventDefault = false;

    this.scene = new Container();
    this.scene.interactive = true;

    this.sceneHitTest = new Graphics();
    this.sceneHitTest.interactive = true;
    this.scene.addChild(this.sceneHitTest);
  }

  /**
   * @method addEvents
   * bind events to the Scene (Container) to hide all lines when
   * user taps on empty scene
   */
  addEvents() {
    this.refOnHideAllLines = this.onHideAllLines.bind(this);
    this.refOnCompletClean = this.onCompleteClean.bind(this);
    this.sceneHitTest.on(IS_MOBILE() ? 'tap' : 'click', this.refOnHideAllLines);
  }

  /**
   * @event hideAllLines
   * checks if the target event is a Block and returns
   * otherwuse, cleans the scene and tweens
   */
  onHideAllLines(event) {
    if(event.target instanceof Block) {
      return;
    }

    this.hideAllOpenedBlocks();
    this.clean();
  }

  /**
   * @method hideAllOpenedBlocks
   * @param blockNotToBeHidSlug {string} slug of the block not to be hid
   * Force mouseOut state for all blocks when lines are destroyed
   */
  hideAllOpenedBlocks(blockNotToBeHidSlug) {
    this.blocks.forEach((block) => {
      if(block.blockSlug !== blockNotToBeHidSlug) block.onMouseOut();
    });
  }

  /**
   * @method addObjects
   * adds the blocks to the scene
   */
  addObjects() {
    const { blocks } = this.data;
    this.blocks = [];
    this.maxWidthBlock = 0;
    this.callbackRefs = {
      'over': this.onBlockOver.bind(this),
      'clickDot': this.onDotClick.bind(this),
    };

    for (const blockData of blocks) {
      const block = new Block(blockData, this.maxImageWidth, this.maxImageHeight, this.showDebug);
      block.on('over', this.callbackRefs['over']);
      block.on('clickDot', this.callbackRefs['clickDot']);
      block.on('clickedLink', this.onLinkClick);

      this.blocks.push(block);
      this.scene.addChild(block);
      this.maxWidthBlock = round(Math.max(this.maxWidthBlock, block.width));
    }

    this.addEvents();
    this.calculatePositionBlocks();
    setMinHeight(this.scene.height + 10);
    this.resizeRenderer();

  }

  /**
   * @event onBlockOver
   * triggered when the block is hovered
   * generates the lines
   * if it's mobile, it hides the opened ones
   */
  onBlockOver (event) {
    this.hideAllOpenedBlocks(event.blockSlug);
    this.generateLines(event.blockSlug);
  }

  /**
   * @event onDotClick
   * triggered when the the dots are clicked
   * shows the lines only with the same indexType (id from data.js)
   */
  onDotClick(event) {
    this.hideAllOpenedBlocks();
    this.generateLines(event.blockSlug, event.dotSlug);
  }

  /**
   * @method calculatePoint
   * @param width {nunber} block width
   * @param rowY {number} row Y position
   * @param offset {object} x,y offset positions
   * @param i {int} block index
   */
  calculatePoint(width, rowY, offset, row, i) {
    offset = offset || {x: 0, y: 0};
    offset.y = IS_MOBILE() ? 5 : 35;
    offset.x = IS_MOBILE() ? 5 : 35;
    const { wr } = getSize();
    const area = (wr / row);
    const returnPoint = {
      x: area * i + random(area - (width + offset.x)),
      y: rowY + offset.y
    }

    const safeX = this.safeZone.x + this.safeZone.width;
    const safeY = this.safeZone.y + this.safeZone.height;

    if(returnPoint.y < safeY) {
      returnPoint.x = Math.max(returnPoint.x, safeX);
    }

    return returnPoint;
  }

  /**
   * @method calculatePositionBlocks
   * calculates the block position depending on the screen size
   */
  calculatePositionBlocks() {
    const { wr } = getSize();

    let flagHasChanged = false;
    const tempMaxPerRow = round(wr / (this.maxWidthBlock * (IS_MOBILE() ? 1.2 : 1.5)));
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
      let rowHeight = 0;
      for (let i = 0; i < row; i++) {
        if(index >= this.blocks.length ) {
          break;
        }
        const block = this.blocks[index];
        const offset = {x: 0, y: 0};
        const point = this.calculatePoint(block.width, rowY, offset, row, i);
        block.x = point.x;
        block.y = point.y;
        index++;
        rowHeight = Math.max(rowHeight, block.height);
      }
      rowY += rowHeight + 25;
    }
  }

  /**
   * @method startReferences
   * starts arrays where objects are stored
   */
  startReferences() {
    this.containerLines = new Container();
    this.scene.addChild(this.containerLines);
    this.lines = [];
    this.timelines = [];
  }

  onCompleteClean(cb) {
    this.containerLines.destroy(true);
    this.scene.removeChild(this.containerLines);
    this.containerLines = null;

    this.startReferences();
    if(cb) cb();
  }

  /**
   * @method clean
   * clean TweenMax tweens
   * clean lines
   * @param cb {function} calback function to be called after the lines are destroyed, if no lines are created, just calls {cb} directly
   */
  clean(cb) {
    if(this.containerLines) {
      if(this.timelines) this.timelines.forEach((t) => {
        t.kill();
      });

      TweenMax.killTweensOf(this.containerLines);
      TweenMax.to(this.containerLines, .15, {
        alpha: 0, onComplete: this.refOnCompletClean, onCompleteParams: [cb]
      })

      return;
    }

    this.startReferences();
    if(cb) cb();
  }

  /**
   * @method generateLines
   * first tweens lines out, destroy current objects and then generate new linns
   * @param blockSlug {string} block slug to decide which block to start animation from
   * @param dotSlug {string} dot slug drawn
   */
  generateLines(blockSlug, dotSlug = null) {
    this.clean(() => {
      this.calculateLines(blockSlug, dotSlug);
    })
  }

  /**
   * @method calculateLines
   * calculates the lines position, curves and starts animation based on blockTitle and indexType
   * @param slug {string} slug reference to decide which block to start animation from
   * @param dotSlug {string} dot slug drawn
   */
  calculateLines(blockSlug, dotSlug = null) {

    let dots = [];
    let referenceBlock = find(this.blocks, (block) => {
      return block.blockSlug === blockSlug
    });

    if(blockSlug && !dotSlug) {
      for (const block of this.blocks) {
        // console.log(block.links, referenceBlock.links);
        if(block === referenceBlock) {
          dots = dots.concat(block.dots);
        } else {
          for (const dot of block.dots) {
            if(referenceBlock.linksSlugs.indexOf(dot.dotSlug) > -1 ) {
              dots.push(dot);
            }
          }
        }
      }
    } else {
      for (const block of this.blocks) {
        for (const dot of block.dots) {
          if(dot.dotSlug === dotSlug) {
            dots.push(dot);
          }
        }
      }
    }

    // sort dots to be the rollovered first
    const sortedFirstDots = filter(dots, (dot) => dot.blockSlug === blockSlug);
    const sortedLastDots = filter(dots, (dot) => dot.blockSlug !== blockSlug);
    const sortedDots = [].concat(sortedFirstDots).concat(sortedLastDots);

    const groupDots = groupBy(sortedDots, (dot) => dot.dotSlug);

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

      const timeline = new TimelineMax({
        paused: true,

        onStart: function(l, c, x, y) {
          l.moveTo(x, y);
          l.lineStyle(1, color);
        },
        onStartParams: [line, color, points[0][0], points[0][1]],

        onComplete: function(l) {
          // console.log('finish curve');
          // l.stroke();
          l.endFill();

        },
        onCompleteParams: [line]


      });

      this.timelines.push(timeline);

      for (let i = 0; i < points.length - 1; i++) {

        const curvePoints = addCurveSegment(i, points);

        for (let j = 0; j < curvePoints.length; j++) {

          const objRef = {
            x: j === 0 ? points[i][0] : curvePoints[j - 1].x,
            y: j === 0 ? points[i][1] : curvePoints[j - 1].y
          };

          const time = (1 / curvePoints.length) * this.animationTimingMultiplier;
          timeline.add(
            TweenMax.to(objRef, time, {
              x: curvePoints[j].x,
              y: curvePoints[j].y,
              onComplete: function(o, l) {
                // try catch due to TweenMax not cleaning properly
                try {
                  l.lineTo(o.x, o.y);
                } catch(e) {
                  console.log(e);
                }
              },
              onCompleteParams: [objRef, line],
              ease: 'linear',
            })
          );
        };
      }
      timeline.play();
    }
  }

  lineTo(objRef, line) {
    line.lineTo(objRef.x, objRef.y);
  }

  /**
   * @method update
   * render container/stage on every frame
   */
  update() {
    if(this.stats) this.stats.begin();

    this.renderer.render(this.scene);

    if(this.stats) this.stats.end()
    // if(this.autoRender) this.raf = requestAnimationFrame(this.update.bind(this));
  }

  /**
   * @method resizeRenderer
   * resizes the stage to the container size
   */
  resizeRenderer() {
    this.renderer.resize(getSize().wr, round(this.scene.height));
    const scale = 1 / this.renderer.resolution;
    this.renderer.view.style.width = this.renderer.width * scale + 'px';
    this.renderer.view.style.height = this.renderer.height * scale + 'px';

    this.clean(() => {
      this.sceneHitTest.clear();
      this.sceneHitTest.beginFill(0xFf00ff, this.showDebug ? 0.1 : 0);
      this.sceneHitTest.drawRect(0, 0, this.renderer.width, this.scene.height);
      this.sceneHitTest.endFill();
    });
  }

  /**
  * @summary Public API
  */

  /**
   * @method showBlockLines
   * @param blockSlug {string} block to show based on slug
   */
  showBlockLines(blockSlug){
    var block;
    this.hideAllOpenedBlocks();
    this.generateLines(blockSlug);
    // Select block
    block = find(this.blocks, {blockSlug: blockSlug});
    block.emit('over', {blockSlug: blockSlug});
    block.onFirstClick();
    block.selected = true;
  }

  /**
   * @method showOnlyLines
   * @param lineSlug {array} dot slug to show
   * @param lineSlug {string} dot slug to show
   */
  showOnlyLines(lineSlugs) {
    var self = this;
    var locationToScroll = false;
    var windowScroll = $('body').scrollTop();
    var animateObj = {};

    self.hideAllOpenedBlocks();
    if (lineSlugs.constructor === Array) {
      lineSlugs.forEach(function (line) {
        for (var i = 0; i < self.blocks.length; i++) {
          var block = self.blocks[i];
          if (block.linksSlugs.indexOf(line) > -1) {
            if (!locationToScroll || block._bounds.minY < locationToScroll) {
              locationToScroll = block._bounds.minY;
            }
          }
        };
      });
      if (lineSlugs.length > 0) {
        animateObj = {scrollTop: locationToScroll};
      }
      $('body').animate(
        animateObj,
        Math.abs(windowScroll - locationToScroll) + 250,
        function() {
          self.clean(function () {
            lineSlugs.forEach(function (line) {
              self.calculateLines(null, line);
            });
          });
        }
      );
    } else if (lineSlugs) {
      for (var i = 0; i < self.blocks.length; i++) {
        var block = self.blocks[i];
        if (block.linksSlugs.indexOf(lineSlugs) > -1) {
          if (!locationToScroll || block._bounds.minY < locationToScroll) {
            locationToScroll = block._bounds.minY;
          }
        }
      };
      if (lineSlugs) {
        animateObj = {scrollTop: locationToScroll};
      }
      $('body').animate(
        animateObj,
        Math.abs(windowScroll - locationToScroll) + 250,
        function() {
          self.generateLines(null, lineSlugs);
        }
      );
    }
  }

  /**
   * @event onKeyUp
   * public onKeyUp event
   */
  onKeyUp() {
  }

  /**
   * @event onResize
   * event to resize the renderer based on the contaner size
   * @param w {number} container width
   * @param h {number} container height
   */
  onResize(w, h) {
    w = w || window.innerWidth;
    h = h || window.innerHeight;

    setSize({
      w: w,
      w2: w / 2,
      wr: w,
      h: h,
      h2: h / 2,
      hr: h,
    })

    this.calculatePositionBlocks();
    this.resizeRenderer();

  }
}

export default WocViz;

window.WocViz = WocViz; // eslint-disable-line
