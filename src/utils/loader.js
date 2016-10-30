import { loader as Loader } from 'pixi.js/src';

export const loadFonts = (fonts, container) => {
  for (const font of fonts) {
    const span = document.createElement('span');
    span.innerHTML = `loading font ${font}`;
    span.style.position = 'absolute';
    span.style.visibility = 'hidden';
    span.style.top = 0;
    span.style.left = 0;
    span.style['pointer-events'] = 'none';
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
