var Unit = require('./Unit');

var ShieldMaiden = function (existingPiece) {
  var that = Unit('ShieldMaiden', existingPiece);
  that.setAttr('speed', 4);
  that.setAttr('bonusInit', [1, 10]);
  that.setAttr('initiative', 40 + that.getBonusInitiative());

  return that;
};

module.exports = ShieldMaiden;
