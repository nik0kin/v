var Unit = require('./Unit');

var Viking = function (existingPiece) {
  var that = Unit('Viking', existingPiece);
  if (existingPiece) {
    return that;
  }
  that.setAttr('speed', 5);
  that.setAttr('bonusInit', [5, 15]);
  that.setAttr('initiative', 50 + that.getBonusInitiative());

  return that;
};

module.exports = Viking;
