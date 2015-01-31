var lodash = require('lodash');

var Viking = require('../classes/Viking'),
    ShieldMaiden = require('../classes/ShieldMaiden');

var ClassMap = {
  'viking': Viking,
  'shieldmaiden': ShieldMaiden
};

var createUnit = function (className, playerRelId, locationId) {
  var newUnit = ClassMap[className.toLowerCase()]();
  newUnit.setOwner(playerRelId);
  newUnit.setLocation(locationId);
  return newUnit;
};

exports.createUnit = createUnit;

var loadPieceIntoClass = function (piece) {
  return ClassMap[piece.class.toLowerCase()](piece);
};

exports.loadPieceIntoClass = loadPieceIntoClass;

// returns a map[id] = Unit
var loadPiecesIntoClasses = function (pieces) {
  var pieceMap = {};

  _.each(pieces, function (piece) {
    pieceMap[piece.id] = loadPieceIntoClass();
  });

  return pieceMap;
};

exports.loadPiecesIntoClasses = loadPiecesIntoClasses;
