import { round } from './Maths';

let SIZE = {};
let DATA = {};
let is_mobile = false;
let fontSizes;
let arrowScale;
let arrowScaleMobile;

export function setArrowScale(val) { arrowScale = val; }
export function getArrowScale() { return arrowScale; }

export function setArrowScaleMobile(val) { arrowScaleMobile = val;}
export function getArrowScaleMobile() { return arrowScaleMobile; }

export function setFontSizes(val) { fontSizes = val; }
export function getFontSizes() { return fontSizes; }

export function setMobile(val) { is_mobile = val; }
export function IS_MOBILE() { return is_mobile; }


export function getData() { return DATA };
export function setData(data) {
  DATA = Object.assign(DATA, data);
}

export function setSize (sSize) {
  SIZE = Object.assign(SIZE, sSize);
  for (const size of Object.keys(SIZE)) {
    SIZE[size] = round(SIZE[size]);
  }
}

export function getSize () { return SIZE; }
export function setMinHeight(h) { SIZE.minHeight = round(h); }
