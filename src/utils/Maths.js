export const round = (n) =>  ~~(n + .5);
export const floor = (n) => n >> 0;
export const random = (max, min) => {
  min = min || 0;
  return Math.random() * (max - min) + min;
};

export const coin = () => Math.random() <= .5 ? 1 : -1;

export const roundRandom = (max, min) => {
  return round( random(max, min) );
}

export const RAD_TO_ANGLE = 180 / Math.PI;
export const ANGLE_TO_RAD = Math.PI / 180;

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const distance = (v1, v2) => Math.sqrt( Math.pow((v2.x - v1.x), 2) + Math.pow((v2.y - v1.y), 2) );
