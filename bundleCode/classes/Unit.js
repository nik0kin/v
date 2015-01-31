
var Unit = function (className, _piece) {
  var that = {};

  var piece,
      isNew = false;

  //// CONSTRUCTOR ////
  if (_piece) {
    // load already savedPiece
    piece = _piece;
  } else {
    // create new piece
    isNew = true;
    piece = {
      class: className,
      attributes: {}
    };
  }

  //// Public Methods ////

  that.getId = function () {
    return piece.id;
  };

  that.getClass = function () {
    return className;
  };

  that.setOwner = function (ownerId) {
    piece.ownerId = ownerId;
  };

  that.setLocation = function (locationId) {
    piece.locationId = locationId;
  };

  that.setAttr = function (key, value) {
    piece.attributes[key] = value;
  };

  that.save = function (M) {
    if (!isNew) {
      M.setPiece(piece.id, piece);
    } else {
      M.addPiece(piece);
    }
  };

  return that;
};

module.exports = Unit;
