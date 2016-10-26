import { SIZE } from './config';
import { data } from '../data';

export const getRandomTitles = () => {
  const r = Math.floor((data.length - 1) * Math.random() + .5);
  return data[r].title;
}

export const getRandomMinMaxVectorScreen = (radius) => {
  const tryX = Math.random() * SIZE.wr;
  const tryY = Math.random() * SIZE.hr;

  const x = Math.max(radius, Math.min(tryX, tryX - radius));
  const y = Math.max(radius, Math.min(tryY, tryY - radius));

  return { x, y };
}
