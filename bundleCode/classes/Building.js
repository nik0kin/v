var Unit = require('./Unit');

var Building = function (className, existingPiece) {
  var that = Unit(className, existingPiece);
  if (existingPiece) {
    return that;
  }
  that.setAttr('currentProduction', false);

  return that;
};

module.exports = Building;
