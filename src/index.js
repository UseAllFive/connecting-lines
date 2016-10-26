import WocViz from './WocViz';

const app = new WocViz({
	width: window.innerWidth,
	height: window.innerHeight,
  canvasContainer: document.body
});
window.onresize = app.onResize.bind(app);
window.onkeyup = app.onKeyUp.bind(app);
