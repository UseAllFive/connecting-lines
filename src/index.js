import WocViz from './WocViz';
import { parse } from 'query-string';

/**
 * @summary
 * where all data is hardcoded
 */
import { data } from './data.js';

/**
 * @type {WocViz}
 * @param {object} data JSON or Object to use as Database
 * @param {number} width of the canvas
 * @param {number} height of the canvas
 * @param {boolean} autoRender whether or not to use internal loop to render the scene
 * @param {object} canvasContainer where to add the canvas dom element
 * @param {boolean} showDebug show debug UI
 * @param {boolean} forceCanvas force the 2d Context over letting the system decide whether to use WebGL or not
 * @param {boolean} isMobile detect and pass if the component is rendered on mobile
 */

console.log(parse(window.location.search));

const is_mobile = parse(window.location.search) ? parse(window.location.search).mobile : false;

const app = new WocViz({
  data,
	width: window.innerWidth,
	height: window.innerHeight,
  autoRender: true,
  canvasContainer: document.body,
  showDebug: false,
  forceCanvas: false,
  isMobile: is_mobile,
});

/**
 * @method update
 * if {boolean} autoRender set as false
 * you need to update the view manually inside a loop
 * using the following method
 */
// app.update().bind(app);

/**
 * @summary
 * add your event listeners here
 */
window.onresize = () => { app.onResize(window.innerWidth, window.innerHeight) };
window.onkeyup = app.onKeyUp.bind(app);
