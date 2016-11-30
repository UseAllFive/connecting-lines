import {
  autoDetectRenderer,
  CanvasRenderer,
} from 'pixi.js';
import { getSize } from '../../utils/config';

const options = {
  resolution: window.devicePixelRatio || 1,
  antialias: true,
  backgroundColor: 0xFFFFFF,
  roundPixels: true,
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

    instance.plugins.interaction.autoPreventDefault = false;

    return instance;
  }
}
