var _ = require('lodash');

// temp crude code (assume every space is movable)
var mSpacesToHashmap = function (M) {
  var spaces = M.getSpaces();

  var hashMap = {};

  _.each(spaces, function (space) {
    hashMap[space.boardSpaceId] = true;
  });

  return hashMap;
};

exports.mSpacesToHashmap = mSpacesToHashmap;
