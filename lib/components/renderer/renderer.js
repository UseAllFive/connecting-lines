import {
  autoDetectRenderer,
  CanvasRenderer,
} from 'pixi.js/src';
import { getSize } from '../../utils/config';

const options = {
  resolution: 1,
  antialias: true,
  backgroundColor: 0xFFFFFF,
  roundPixels: true,
}

export default class Renderer {
  constructor(forceCanvas, retina) {

    const { w, h } = getSize();
    options.resolution = retina ? window.devicePixelRatio || 1 : options.resolution;

    let instance;

    if(forceCanvas) {
      instance = new CanvasRenderer(w, h, options);
    } else {
      instance = autoDetectRenderer(w, h, options);
    }

    return instance;
  }
}
