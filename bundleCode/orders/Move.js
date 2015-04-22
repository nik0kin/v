var _ = require('lodash');

var hexPathfinding = require('../utils/hexPathfinding'),
    mapUtils = require('../utils/mapUtils');

var executeMove = function (unit, params, M) {
  var moveMetaData = {
        orderType: 'Move',
        params: params,
        path: []
      },
      unitSpeed = unit.getAttr('speed'),
      stepsToGo = unitSpeed - unit.getAttr('stepsUsed'),
      stepsUsed = 0,
      finalPos,
      doneMoving = false;

  // prepare map hashmap (block enemy spots)
  var hashMap = mapUtils.mSpacesToHashmap(M);

  // generate a path
  var startPos = moveMetaData.startPos = finalPos = unit.getLocationPos(),
      endPos = params,
      path = hexPathfinding.getPath(startPos, endPos, hashMap);
  console.log(path);
  path = _.rest(path);
  // loop check each space in path
  _.each(path, function (pos) {
    if (doneMoving) { return; }

    // max steps depends on a units 'speed'
    if (stepsToGo <= 0) {
      moveMetaData.allStepsUsed = true;
      doneMoving = true;
      return;
    }

    // check if that space is full

    // if no path or full space, remove order


    // step on space
    stepsToGo--;
    stepsUsed++;
    finalPos = pos;
    moveMetaData.path.push(pos);

    // if unit reaches destination, remove order
    if (endPos.x === pos.x && endPos.y === pos.y) {
      moveMetaData.reachedDestination = true;
      doneMoving = true;
    }
  });

  if (moveMetaData.reachedDestination) {
    moveMetaData.doNextOrder = true;
  }

  // move unit
  unit.setLocation(finalPos.x + ',' + finalPos.y);
  unit.setAttr('stepsUsed', unitSpeed - stepsToGo);

  if (stepsUsed === 0) {
    moveMetaData.obsolete = true;
  } else {
    moveMetaData.stepsUsed = stepsUsed;
  }

  return moveMetaData;
};

exports.execute = executeMove;
