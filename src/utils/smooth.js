/*
Smooth.js version 0.1.7

Turn arrays into smooth functions.

Copyright 2012 Spencer Cohen
Licensed under MIT license (see "Smooth.js MIT license.txt")
 */

const hasProp = {}.hasOwnProperty;

const sin = Math.sin;
const PI = Math.PI;

const sinc = (x) => {
  if (x === 0) {
    return 1;
  } else {
    return sin(PI * x) / (PI * x);
  }
};

const makeLanczosWindow = (a) => {
  return function(x) {
    return sinc(x / a);
  };
};

const makeSincKernel = (window) => {
  return function(x) {
    return sinc(x) * window(x);
  };
};

const deepValidation = true;

export const Enum = {

  /*Interpolation methods */
  METHOD_NEAREST: 'nearest',
  METHOD_LINEAR: 'linear',
  METHOD_CUBIC: 'cubic',
  METHOD_LANCZOS: 'lanczos',
  METHOD_SINC: 'sinc',

  /*Input clipping modes */
  CLIP_CLAMP: 'clamp',
  CLIP_ZERO: 'zero',
  CLIP_PERIODIC: 'periodic',
  CLIP_MIRROR: 'mirror',

  /* Constants for control over the cubic interpolation tension */
  CUBIC_TENSION_DEFAULT: 5,
  CUBIC_TENSION_CATMULL_ROM: 0
};

const defaultConfig = {
  method: Enum.METHOD_LANCZOS,
  cubicTension: Enum.CUBIC_TENSION_DEFAULT,
  clip: Enum.CLIP_CLAMP,
  scaleTo: 0,
  sincFilterSize: 2,
  sincWindow: function(x) {
    return Math.exp(-x*x);
  }
};


/*Index clipping functions */

const clipClamp = (i, n) => Math.max(0, Math.min(i, n - 1));

const clipPeriodic = (i, n) => {
  i = i % n;
  if (i < 0) {
    i += n;
  }
  return i;
};

const clipMirror = (i, n) => {
  var period;
  period = 2 * (n - 1);
  i = clipPeriodic(i, period);
  if (i > n - 1) {
    i = period - i;
  }
  return i;
};


/*
Abstract scalar interpolation class which provides common functionality for all interpolators

Subclasses must override interpolate().
 */

class AbstractInterpolator {
  constructor(array, config) {
    this.array = Array.prototype.slice.call(array, 0);
    this.length = this.array.length;
    if (!(this.clipHelper = {
      clamp: this.clipHelperClamp,
      zero: this.clipHelperZero,
      periodic: this.clipHelperPeriodic,
      mirror: this.clipHelperMirror
    }[config.clip])) {
      throw "Invalid clip: " + config.clip;
    }
  }

  getClippedInput(i) {
    if ((0 <= i && i < this.length)) {
      return this.array[i];
    } else {
      return this.clipHelper(i);
    }
  }

  clipHelperClamp(i) {
    return this.array[clipClamp(i, this.length)];
  }

  clipHelperZero() {
    return 0;
  }

  clipHelperPeriodic(i) {
    return this.array[clipPeriodic(i, this.length)];
  }

  clipHelperMirror(i) {
    return this.array[clipMirror(i, this.length)];
  }

  interpolate() {
    throw 'Subclasses of AbstractInterpolator must override the interpolate() method.';
  }
}


class NearestInterpolator extends AbstractInterpolator {
  interpolate (t) {
    return this.getClippedInput(Math.round(t));
  }
}

class LinearInterpolator extends AbstractInterpolator {
  interpolate(t) {
    var k;
    k = Math.floor(t);
    t -= k;
    return (1 - t) * this.getClippedInput(k) + t * this.getClippedInput(k + 1);
  }
}

class CubicInterpolator extends AbstractInterpolator {
  constructor(array, config){
    super(array, config);
    this.tangentFactor = 1 - Math.max(0, Math.min(1, config.cubicTension));
  }

  getTangent(k) {
    return this.tangentFactor * (this.getClippedInput(k + 1) - this.getClippedInput(k - 1)) / 2;
  }

  interpolate(t) {
    let k, m, p, t2, t3;
    k = Math.floor(t);
    m = [this.getTangent(k), this.getTangent(k + 1)];
    p = [this.getClippedInput(k), this.getClippedInput(k + 1)];
    t -= k;
    t2 = t * t;
    t3 = t * t2;
    return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
  }
}

class SincFilterInterpolator extends AbstractInterpolator {
  constructor(array, config) {
    super(array, config);
    this.a = config.sincFilterSize;
    if (!config.sincWindow) {
      throw 'No sincWindow provided';
    }
    this.kernel = makeSincKernel(config.sincWindow);
  }

  interpolate(t) {
    let j, k, n, ref, ref1, sum;
    k = Math.floor(t);
    sum = 0;
    for (n = j = ref = k - this.a + 1, ref1 = k + this.a; ref <= ref1 ? j <= ref1 : j >= ref1; n = ref <= ref1 ? ++j : --j) {
      sum += this.kernel(t - n) * this.getClippedInput(n);
    }
    return sum;
  }
}

const getColumn = (arr, i) => {
  let j, len, results, row;
  results = [];
  for (j = 0, len = arr.length; j < len; j++) {
    row = arr[j];
    results.push(row[i]);
  }
  return results;
};

const makeScaledFunction = (f, baseScale, scaleRange) => {
  let scaleFactor, translation;
  if (scaleRange.join === '0,1') {
    return f;
  } else {
    scaleFactor = baseScale / (scaleRange[1] - scaleRange[0]);
    translation = scaleRange[0];
    return function(t) {
      return f(scaleFactor * (t - translation));
    };
  }
};

const getType = (x) => Object.prototype.toString.call(x).slice('[object '.length, -1);

const validateNumber = (n) => {
  if (isNaN(n)) {
    throw 'NaN in Smooth() input';
  }
  if (getType(n) !== 'Number') {
    throw 'Non-number in Smooth() input';
  }
  if (!isFinite(n)) {
    throw 'Infinity in Smooth() input';
  }
};

const validateVector = (v, dimension) => {
  let j, len, n;
  if (getType(v) !== 'Array') {
    throw 'Non-vector in Smooth() input';
  }
  if (v.length !== dimension) {
    throw 'Inconsistent dimension in Smooth() input';
  }
  for (j = 0, len = v.length; j < len; j++) {
    n = v[j];
    validateNumber(n);
  }
};

const isValidNumber = (n) => {
  return (getType(n) === 'Number') && isFinite(n) && !isNaN(n);
};

const normalizeScaleTo = (s) => {
  let invalidErr;
  invalidErr = "scaleTo param must be number or array of two numbers";
  switch (getType(s)) {
    case 'Number':
      if (!isValidNumber(s)) {
        throw invalidErr;
      }
      s = [0, s];
      break;
    case 'Array':
      if (s.length !== 2) {
        throw invalidErr;
      }
      if (!(isValidNumber(s[0]) && isValidNumber(s[1]))) {
        throw invalidErr;
      }
      break;
    default:
      throw invalidErr;
  }
  return s;
};

const shallowCopy = (obj) => {
  let copy, k, v;
  copy = {};
  for (k in obj) {
    if (!hasProp.call(obj, k)) continue;
    v = obj[k];
    copy[k] = v;
  }
  return copy;
};

const Smooth = (arr, config) => {
  let baseDomainEnd, dimension, i, interpolator, interpolatorClass, interpolators, k, n, properties, smoothFunc, v;
  if (config == null) {
    config = {};
  }
  properties = {};
  config = shallowCopy(config);
  properties.config = shallowCopy(config);
  if (config.scaleTo == null) {
    config.scaleTo = config.period;
  }
  if (config.sincFilterSize == null) {
    config.sincFilterSize = config.lanczosFilterSize;
  }
  for (k in defaultConfig) {
    if (!hasProp.call(defaultConfig, k)) continue;
    v = defaultConfig[k];
    if (config[k] == null) {
      config[k] = v;
    }
  }
  if (!(interpolatorClass = {
    nearest: NearestInterpolator,
    linear: LinearInterpolator,
    cubic: CubicInterpolator,
    lanczos: SincFilterInterpolator,
    sinc: SincFilterInterpolator
  }[config.method])) {
    throw "Invalid method: " + config.method;
  }
  if (config.method === 'lanczos') {
    config.sincWindow = makeLanczosWindow(config.sincFilterSize);
  }
  if (arr.length < 2) {
    return;
    throw 'Array must have at least two elements';
  }
  properties.count = arr.length;
  smoothFunc = (function() {
    let j, l, len, len1;
    switch (getType(arr[0])) {
      case 'Number':
        properties.dimension = 'scalar';
        if(deepValidation) {
          for (j = 0, len = arr.length; j < len; j++) {
            n = arr[j];
            validateNumber(n);
          }
        }
        interpolator = new interpolatorClass(arr, config);
        return function(t) {
          return interpolator.interpolate(t);
        };
      case 'Array':
        properties.dimension = dimension = arr[0].length;
        if (!dimension) {
          throw 'Vectors must be non-empty';
        }
        if(deepValidation) {
          for (l = 0, len1 = arr.length; l < len1; l++) {
            v = arr[l];
            validateVector(v, dimension);
          }
        }
        interpolators = (function() {
          let o, ref, results;
          results = [];
          for (i = o = 0, ref = dimension; 0 <= ref ? o < ref : o > ref; i = 0 <= ref ? ++o : --o) {
            results.push(new interpolatorClass(getColumn(arr, i), config));
          }
          return results;
        })();
        return function(t) {
          let len2, o, results;
          results = [];
          for (o = 0, len2 = interpolators.length; o < len2; o++) {
            interpolator = interpolators[o];
            results.push(interpolator.interpolate(t));
          }
          return results;
        };
      default:
        throw "Invalid element type: " + (getType(arr[0]));
    }
  })();
  if (config.clip === 'periodic') {
    baseDomainEnd = arr.length;
  } else {
    baseDomainEnd = arr.length - 1;
  }
  config.scaleTo || (config.scaleTo = baseDomainEnd);
  properties.domain = normalizeScaleTo(config.scaleTo);
  smoothFunc = makeScaledFunction(smoothFunc, baseDomainEnd, properties.domain);
  properties.domain.sort();

  /*copy properties */
  for (k in properties) {
    if (!hasProp.call(properties, k)) continue;
    v = properties[k];
    smoothFunc[k] = v;
  }
  return smoothFunc;
};

for (const k in Enum) {
  if (!hasProp.call(Enum, k)) continue;
  const v = Enum[k];
  Smooth[k] = v;
}

Smooth.deepValidation = true;

export default Smooth;
