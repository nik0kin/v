var Building = require('./Building');

var MeadHall = function (existingPiece) {
  var that = Building('MeadHall', existingPiece);
  if (existingPiece) {
    return that;
  }
  that.setAttr('bonusInit', [1, 20]);
  that.setAttr('initiative', 70 + that.getBonusInitiative());

  return that;
};

module.exports = MeadHall;
