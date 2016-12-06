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

    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1, 1);

    options.resolution = retina ? window.devicePixelRatio || 1 : options.resolution;
    options.view = canvas;

    return forceCanvas
      ? new CanvasRenderer(w, h, options)
      : autoDetectRenderer(w, h, options);
  }
}
