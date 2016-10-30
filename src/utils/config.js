import { floor } from './Maths';

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
    SIZE[size] = floor(SIZE[size]);
  }
}

export function getSize () {
  return SIZE;
}
