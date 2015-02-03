var PF = require('pathfinding');


exports.getPath = function (startPos, endPos, hashMap) {
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
