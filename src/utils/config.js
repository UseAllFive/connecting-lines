import { round } from './Maths';

export const DEBUG = true;

let SIZE = {};
let DATA = {};

export function setData(data) {
  DATA = Object.assign(DATA, data);
}

export function getData() { return DATA };

export function setSize (sSize) {
  SIZE = Object.assign(SIZE, sSize);
  for (const size of Object.keys(SIZE)) {
    SIZE[size] = round(SIZE[size]);
  }
}

export function setMinHeight(h) {
  SIZE.minHeight = round(h);
}

export function getSize () {
  return SIZE;
}
