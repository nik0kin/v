var Unit = require('./Unit');

var Viking = function (existingPiece) {
  var that = Unit('Viking', existingPiece);
  that.setAttr('speed', 5);

  return that;
};

module.exports = Viking;
