import dat from 'dat-gui'
import Stats from 'stats-js'
import { autoDetectRenderer, Container } from 'pixi.js/src';
import { SIZE, DEBUG } from './utils/config';
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

    SIZE.w = width;
    SIZE.w2 = width / 2;
    SIZE.wr = width / window.devicePixelRatio;
    SIZE.h = height;
    SIZE.h2 = height / 2;
    SIZE.hr = height / window.devicePixelRatio;

    // this.loadFonts();
    this.startStats();
    this.createRender(canvasContainer);
    this.addObjects();
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

    this.renderer = autoDetectRenderer(SIZE.w, SIZE.h, options);
    canvasContainer.appendChild(this.renderer.view)

    this.scene = new Container();
    this.scene.interactive = true;
  }

  addObjects() {
    const objNum = data.length;
    for (let i = 0; i < objNum; i++) {

      const radius = 10 + 100 * Math.random();
      const { x, y } = getRandomMinMaxVectorScreen(radius);

      const blockData = data[i];
      blockData.radius = radius;

      const block = new Block(blockData)
      block.position.x = x;
      block.position.y = y;

      this.scene.addChild(block);
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

    SIZE.w = w;
    SIZE.w2 = w / 2;
    SIZE.wr = w / window.devicePixelRatio;
    SIZE.h = h;
    SIZE.h2 = h / 2;
    SIZE.hr = h / window.devicePixelRatio;

    this.renderer.resize(SIZE.w, SIZE.h);
  }
}

export default WocViz;
