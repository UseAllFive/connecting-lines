import dat from 'dat-gui'
import Stats from 'stats-js'
import * as PIXI from 'pixi.js';

class WocViz {

  constructor(props) {
    this.autoRender = props.autoRender || true;
    const { width, height } = props;

    this.renderer = null;
    this.scene    = null;
    this.counter  = 0;
    this.gui      = null;
    this.DEBUG    = true;

    this.SIZE = {
      w: width ,
      w2: width / 2,
      wr: width / window.devicePixelRatio,
      h: height,
      h2: height / 2,
      hr: height / window.devicePixelRatio,
    };

    this.startStats();
    this.createRender();
    this.addObjects();
    this.startGUI();

    if(this.autoRender) this.update();
  }

  startStats() {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = 0;
    this.stats.domElement.style.display = this.DEBUG ? 'block' : 'none';
    this.stats.domElement.style.left = 0;
    this.stats.domElement.style.zIndex = 50;
    document.body.appendChild(this.stats.domElement);
    document.querySelector('.help').style.display = this.stats.domElement.style.display == 'block' ? "none" : "block";
  }

  createRender() {
    const options = {
      resolution: window.devicePixelRatio,
      antialias: true,
    }

    this.renderer = PIXI.autoDetectRenderer(this.SIZE.w, this.SIZE.h, options);

    document.body.appendChild(this.renderer.view)

    this.scene = new PIXI.Container();
    this.scene.interactive = true;
  }

  addObjects() {
    const objNum = 10;
    for (let i = 0; i < objNum; i++) {

      const container = new PIXI.Container();
      const graph = new PIXI.Graphics();
      const radius = 10 + 100 * Math.random();

      const tryX = Math.random() * this.SIZE.wr;
      const tryY = Math.random() * this.SIZE.hr;

      const xx = Math.max(radius, Math.min(tryX, tryX - radius));
      const yy = Math.max(radius, Math.min(tryY, tryY - radius));

      graph.lineStyle(0);
      graph.beginFill(0xFFFFFF * Math.random(), 1);
      graph.drawCircle(0, 0, radius);
      graph.endFill();

      container.position.x = xx;
      container.position.y = yy;

      container.addChild(graph);

      this.scene.addChild(container);
    }
  }

  startGUI() {
    this.gui = new dat.GUI()
    this.gui.domElement.style.display = this.DEBUG ? 'block' : 'none';

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

  onKeyUp(e) {
    let key = e.which || e.keyCode;
    switch(key)
    {
      // leter D
      case 68:
        this.DEBUG = !this.DEBUG;
        if(this.stats)    this.stats.domElement.style.display = !this.DEBUG ? "none" : "block";
        if(this.gui)      this.gui.domElement.style.display = !this.DEBUG ? "none" : "block";
        if(this.controls) this.controls.enabled = this.DEBUG;
        if(document.querySelector('.help')) document.querySelector('.help').style.display = this.DEBUG ? "none" : "block";
        break;
    }
  }

  onResize(w, h) {
    w = w || window.innerWidth;
    h = h || window.innerHeight;

    this.SIZE = {
      w: w ,
      w2: w / 2,
      wr: w / this.renderer.resolution,
      h: h,
      h2: h / 2,
      hr: h / this.renderer.resolution,
    };

    this.renderer.resize(this.SIZE.w, this.SIZE.h);
  }
}

export default WocViz;
