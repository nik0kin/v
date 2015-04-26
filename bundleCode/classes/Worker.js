var Unit = require('./Unit');

var Worker = function (existingPiece) {
  var that = Unit('Worker', existingPiece);
  if (existingPiece) {
    return that;
  }
  that.setAttr('speed', 6);
  that.setAttr('bonusInit', [1, 10]);
  that.setAttr('initiative', 20 + that.getBonusInitiative());

  return that;
};

module.exports = Worker;
