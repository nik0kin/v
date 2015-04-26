var _ = require('lodash');

var utils = require('../utils/mUtils'),
    randomUtils = require('../utils/randomUtils'),
    createUnit = utils.createUnit;

var getRandomSpaceId = function (M) {
  var spaces = M.getSpaces(),
      keys = _.keys(spaces),
      randomIndex = randomUtils.getRandomInt(0, keys.length - 1);
  return spaces[keys[randomIndex]].boardSpaceId;
};

var gameStartHook = function (M) {
  var playerRels = M.getPlayerRels();
  
  var usedSpaceIds = [];
  var getUnusedRandomSpaceId = function () {
    var possibleSpaceId;
    do {
      possibleSpaceId = getRandomSpaceId(M);
      M.log(possibleSpaceId + ' ' + JSON.stringify(usedSpaceIds));
    } while (_.indexOf(usedSpaceIds, possibleSpaceId) !== -1);
    usedSpaceIds.push(possibleSpaceId);
    return possibleSpaceId;
  };

  // create 2 units per player, each set on a random space
  _.each(playerRels, function (playerRelId) {
    var spaceId = getUnusedRandomSpaceId();
    M.log('placing starting couple at ' + spaceId);
    var viking = createUnit('Viking', playerRelId, spaceId);
    viking.save(M);
    var shieldMaiden = createUnit('ShieldMaiden', playerRelId, spaceId);
    shieldMaiden.save(M);
    var worker = createUnit('Worker', playerRelId, spaceId);
    worker.save(M);

    var meadHall = createUnit('MeadHall', playerRelId, spaceId);
    meadHall.save(M);
  });

  return M.persistQ();
};

module.exports = gameStartHook;
