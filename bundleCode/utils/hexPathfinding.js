var PF = require('pathfinding'),
    _ = require('lodash');


exports.getPath = function (startPos, endPos, hashMap) {
  console.log('generating a path from ' + JSON.stringify(startPos) + ' to ' + JSON.stringify(endPos));
  var hexGrid = new PF.AxialHexGrid(hashMap);

  var finder = new PF.AStarFinder({
    dontPassDeltasToHeuristic: true,
    heuristic: PF.Heuristic.hexManhattan
  });

  var path = finder.findPath(startPos.x, startPos.y, endPos.x, endPos.y, hexGrid);

  var posPath = [];
  _.each(path, function (pos) {
    posPath.push({x: pos[0], y: pos[1]});
  });

  return posPath;
};
