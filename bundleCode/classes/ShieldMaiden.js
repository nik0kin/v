var Unit = require('./Unit');

var ShieldMaiden = function (existingPiece) {
  var that = Unit('ShieldMaiden', existingPiece);
  that.setAttr('speed', 4);

  return that;
};

module.exports = ShieldMaiden;
