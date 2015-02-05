
export var hexkeyToPos = function (hexkey) {
  var split = hexkey.split(',');
  return {x: Number(split[0]), y: Number(split[1])};
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

export var axialHexManhattanDistance = function (x1, y1, x2, y2) {
  return (Math.abs(x1 - x2)
      + Math.abs(x1 - x2 + y1 - y2)
      + Math.abs(y1 - y2)) / 2;
};
