var _ = require('lodash');

exports.generateImportedMap = function (vmapJSON) {
  var board = [];

  _.each(vmapJSON.board, function (minSpace) {
    var space = {};

    space.id = minSpace.id;
    space.class = 'MoveableSpace';

    space.attributes = {};
    space.attributes.terrainType = minSpace.terrainType;

    board.push(space);
  });

  return board;
};
