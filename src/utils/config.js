import { floor } from './Maths';

export const DEBUG = true;

let SIZE = {};

export function setSize (size) {
  SIZE = size;
  for (size of Object.keys(SIZE)) {
    SIZE[size] = floor(SIZE[size]);
  }
}

export function getSize () {
  return SIZE;
}

// export const SIZE = { };
