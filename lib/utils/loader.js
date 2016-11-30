import { loader as Loader } from 'pixi.js';

let spans = [];
let mainContainer = null;

export const loadFonts = (fonts, container) => {
  spans = [];
  mainContainer = container;
  for (const font of fonts) {
    const span = document.createElement('span');
    span.innerHTML = `loading font ${font}`;
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.style.top = 0;
    span.style.left = 0;
    span.style['pointer-events'] = 'none';
    spans.push(span);
    container.appendChild(span);
  }
}

export const loadAssets = (assets, assetsFolder, callback) => {
  if(assets.length < 1) {
    callback();
    return;
  }

  for (const asset of assets) {
    Loader.add(asset.id, assetsFolder + asset.src);
  }

  Loader.once('complete', callback);
  Loader.load();
}

export const destroyLoader = () => {
  spans.forEach((span) => {
    mainContainer.removeChild(span);
    span = null;
  })
  spans = null;
  for (const asset in Loader.resources) {
    if (Loader.resources.hasOwnProperty(asset)) {
      Loader.resources[asset].texture.destroy(true);
      Loader.resources[asset] = null;
    }
  }
}
