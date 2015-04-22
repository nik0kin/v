var Unit = require('./Unit');

var MeadHall = function (existingPiece) {
  var that = Unit('MeadHall', existingPiece);
  if (existingPiece) {
    return that;
  }
  that.setAttr('bonusInit', [1, 20]);
  that.setAttr('initiative', 70 + that.getBonusInitiative());

  return that;
};

module.exports = MeadHall;
