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
    
    const { w, h } = getSize();

    if(!instance) {
      if(forceCanvas) {
        instance = new CanvasRenderer(w, h, options);
      } else {
        instance = autoDetectRenderer(w, h, options);
      }
    }

    return instance;
  }
}
