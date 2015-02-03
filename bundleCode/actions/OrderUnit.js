var _ = require('lodash');

var validateCancelOrder = function (M, params) {

};

var validateMove = function (M, params) {

};

var validateOrder = {
  'CancelOrder': validateCancelOrder,
  'Move': validateMove
};

var validateQ = function (M, actionOwnerRel, actionParams) {
  // validate unitId
  var unit = M.getPiece(actionParams.unitId);
  if (!unit) {
    throw 'unitId not found: ' + actionParams.unitId;
  }

  if (unit.ownerId !== actionOwnerRel) {
    throw 'unit not owned by player: ' + unit.ownerId;
  }

  // validate orders
  _.each(actionParams.orders, function (order, key) {
    if (!order.type || !validateOrder[order.type]) {
      throw 'order: ' + key + ' invalid order type';
    }
    validateOrder[order.type](M, order);
  });
};

exports.validateQ = validateQ;


var doQ = function (M, actionOwnerRel, actionParams) {

};

exports.doQ = doQ;