var Q = require('q'),
    fs = require('fs'),
    path = require('path');

var generateRandomMap = require('./randomMapGenerator').generateRandomMap,
    generateImportedMap = require('./vmapImporter').generateImportedMap;

module.exports = function (customBoardSettings, vikingRules) {
  return Q.promise(function (resolve, reject) {
    if (customBoardSettings.mapName) {
      var filePath = path.resolve(__dirname + '../../../maps/' + customBoardSettings.mapName + '.vmap');
      fs.readFile(filePath, function (err, file) {
        if (err) {
          return reject(err);
        }
        var mapJSON = JSON.parse(file.toString());
        var board = generateImportedMap(mapJSON);
        resolve(board);
      });
      return;
    }

    var board = generateRandomMap(customBoardSettings, vikingRules);
    resolve(board);
  });
};
