
export var hexkeyToPos = function (hexkey) {
  var split = hexkey.split(',');
  return {x: split[0], y: split[1]};
};

export var posTohexkey = function (posOrX, y) {
  if (typeof posOrX === 'object') {
    return posOrX.x + ',' + posOrX.y;
  } else {
    return posOrX + ',' + y;
  }
};

// http://www.redblobgames.com/grids/hexagons

export var hexlibToAxial = function (x, y) {
  return {
    x: -x - y,
    y: y
  };
};

export var axialToHexlib = function (x, y) {
  return {
    x: -x - y,
    y: y
  };
};
