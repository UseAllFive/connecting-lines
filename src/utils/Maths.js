export const round = (n) =>  ~~(n + .5);
export const floor = (n) => n >> 0;
export const random = (max, min) => {
  min = min || 0;
  return Math.random() * (max - min) + min;
};

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
