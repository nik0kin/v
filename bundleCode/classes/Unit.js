var _ = require('lodash');

var randomUtils = require('../utils/randomUtils');

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
      attributes: {
        orders: []
      }
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

  that.getAttr = function (key) {
    return piece.attributes[key];
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

  that.getBonusInitiative = function () {
    var bonusInit = piece.attributes.bonusInit;
    if (!bonusInit) {
      return 0;
    }
    return randomUtils.getRandomInt(bonusInit[0], bonusInit[1]);
  };

  that.getNextOrder = function () {
    return _.first(piece.attributes.orders);
  };

  that.removeOrder = function (index) {
    piece.attributes.orders.splice(index, 1);
  };

  return that;
};

module.exports = Unit;
