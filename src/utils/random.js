import { getSize, getData } from './config';
import { random, floor } from './Maths';

const { data } = getData();

export const getRandomTitles = () => {
  const r = Math.floor((data.length - 1) * Math.random() + .5);
  return data[r].title;
}

export const getRandomMinMaxVectorScreen = (minX, minY, maxX, maxY) => {
  const { wr, hr } = getSize();
  const x = floor(random(wr - maxX, minX));
  const y = floor(random(hr - maxY, minY));

  return { x, y };
}
