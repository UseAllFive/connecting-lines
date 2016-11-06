import Smooth from './smooth';

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
const distanceArrayPoint = (a,b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));

export const addCurveSegment = (context, i, points) => {
  let averageLineLength, du, end, j, k, pieceCount, pieceLength, ref, ref1, ref2, ref3, start, t, u;
  const s = new Smooth(points, {
    method: 'cubic',
  	clip: 'clamp',
  	cubicFilterSize: 10,
  });

  averageLineLength = 1;
  pieceCount = 4;
  for (t = j = 0, ref = 1 / pieceCount; j < 1; t = j += ref) {
    ref1 = [s(i + t), s(i + t + 1 / pieceCount)];
    start = ref1[0];
    end = ref1[1];

    pieceLength = distanceArrayPoint(start, end);
    du = averageLineLength / pieceLength;
    for (u = k = 0, ref2 = 1 / pieceCount, ref3 = du; ref3 > 0 ? k < ref2 : k > ref2; u = k += ref3) {
      const val = s(i + t + u);
      context.lineTo(val[0], val[1]);
    }
  }
  const valend = s(i + 1);
  context.lineTo(valend[0], valend[1]);
};
