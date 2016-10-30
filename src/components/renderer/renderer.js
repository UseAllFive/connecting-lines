import {
  autoDetectRenderer,
  CanvasRenderer,
} from 'pixi.js/src';
import { getSize } from '../../utils/config';

const options = {
  resolution: window.devicePixelRatio,
  antialias: true,
  backgroundColor: 0xFFFFFF
}

let instance = null;

export default class Renderer {
  constructor(forceCanvas) {

    const { wr, hr } = getSize();

    if(!instance) {
      if(forceCanvas) {
        instance = new CanvasRenderer(wr, hr, options);
      } else {
        instance = autoDetectRenderer(wr, hr, options);
      }
    }

    return instance;
  }
}
