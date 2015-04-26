var _ = require('lodash');

var MeadHall = require('../classes/MeadHall');

var Viking = require('../classes/Viking'),
    ShieldMaiden = require('../classes/ShieldMaiden'),
    Worker = require('../classes/Worker');

var ClassMap = {
  'meadhall': MeadHall,

  'viking': Viking,
  'shieldmaiden': ShieldMaiden,
  'worker': Worker
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
    if (ClassMap[piece.class.toLowerCase()]) {
      pieceMap[piece.id] = loadPieceIntoClass(piece);
    }
  });

  return pieceMap;
};

exports.loadPiecesIntoClasses = loadPiecesIntoClasses;
