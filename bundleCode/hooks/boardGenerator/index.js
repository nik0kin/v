var Q = require('q');

var MapUtils = require('../../utils/mapUtils'),
    generateRandomMap = require('./randomMapGenerator').generateRandomMap,
    generateImportedMap = require('./vmapImporter').generateImportedMap;

module.exports = function (customBoardSettings, vikingRules) {

  // to use .vmap map format
  if (customBoardSettings.mapName) {
    return MapUtils.getVMapQ(customBoardSettings.mapName)
      .then(function (mapJSON) {
        var board = generateImportedMap(mapJSON);
        return board;
      });
  }

  // else: random maps!
  return Q.promise(function (resolve, reject) {
    var board = generateRandomMap(customBoardSettings, vikingRules);
    resolve(board);
  });
};
