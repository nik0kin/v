var _ = require('lodash'),
    Q = require('q'),
    fs = require('fs')
    path = require('path');

var VMAP_DIRECTORY = path.resolve(__dirname, '../maps') + '/';

// temp crude code (assume every space is movable)
var mSpacesToHashmap = function (M) {
  var spaces = M.getSpaces();

  var hashMap = {};

  _.each(spaces, function (space) {
    hashMap[space.boardSpaceId] = space;
  });

  return hashMap;
};

exports.mSpacesToHashmap = mSpacesToHashmap;

// to get the JSON of the map, I should probably cache this
var getVMapQ = function (mapName) {
  var filePath = VMAP_DIRECTORY + mapName + '.vmap';
  return Q.promise(function (resolve, reject) {
    fs.readFile(filePath, function (err, file) {
      if (err) {
        return reject(err);
      }
      var mapJSON = JSON.parse(file.toString());
      resolve(mapJSON);
    });
  });
};

exports.getVMapQ = getVMapQ;
