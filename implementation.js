import WocViz from './lib/index';
import { parse } from 'query-string';

/**
 * @summary
 * where all data is hardcoded
 */
import { data } from './data-example.js';

const is_mobile = parse(window.location.search) ? parse(window.location.search).mobile : false;

// instantiate the viz
const app = new WocViz();

/**
 * @method init
 * all properties have a default value if none is passed
 * @see lib/index.js for more info
 *
 * @param {object} data JSON or Object to use as Database
 * @param {number} width of the canvas
 * @param {number} height of the canvas
 * @param {boolean} autoRender whether or not to use internal loop to render the scene
 * @param {object} canvasContainer where to add the canvas dom element
 * @param {boolean} showDebug show debug UI
 * @param {boolean} forceCanvas force the 2d Context over letting the system decide whether to use WebGL or not
 * @param {boolean} isMobile detect and pass if the component is rendered on mobile
 */
app.init({
  data,
	width: window.innerWidth,
	height: window.innerHeight,
  autoRender: true,
  canvasContainer: document.body,
  showDebug: false,
  forceCanvas: true,
  isMobile: is_mobile,
  onReady: onAppReady
});

/**
 * @event onAppReady
 * put your callback for when the assets are ready and the
 * component is ready to render
 */
const onAppReady = () => {
  // app.showBlockLines('safety-curtain');
  // app.showOnlyLines('architecture');
}

/**
 * @method update
 * if {boolean} autoRender set as false
 * you need to update the view manually inside a loop
 * using the following method
 */
// app.update().bind(app);

/**
 * @method showOnlyLines
 * hides all lines inside the app and shows only the ones selected
 * @param slug {string} dot slug
 * @see data.js
 */
// app.showOnlyLines('architecture');

/**
 * @method showBlockLines
 * hides all lines inside the app and shows only the ones from the selected Block slug
 * @param slug {string} block slug to show the lines
 * @see data.js
 */
// app.showBlockLines('safety-curtain');

/**
 * @event
 * add your event listeners here
 */
window.onresize = () => { app.onResize(window.innerWidth, window.innerHeight) };
// window.onkeyup = app.onKeyUp.bind(app);
