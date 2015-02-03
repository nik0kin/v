var _ = require('lodash');

var validateCancelOrder = function (M, unit, orderParams, actionParams) {
  var orderIndex = orderParams.orderIndex;
  if (!unit.attributes.orders[orderIndex]) {
    throw 'invalid CancelOrder orderIndex: ' + orderIndex;
  }

  // validate no conflicting CancelOrders (no multiple orderIndex or all:true)
  var count = 0;
  _.each(actionParams.orders, function (order) {
    if (order.type === 'CancelOrder' && order.params.orderIndex !== undefined
        && order.params.orderIndex === orderIndex) {
      count++;
    }
  });

  if (count > 1) {
    throw 'multiple CancelOrder orderIndex detected: ' + orderIndex;
  }
};

var validateMove = function (M, unit, orderParams, actionParams) {
  var spaceId = orderParams.x + ',' + orderParams.y,
      space = M.getSpace(spaceId);
    if (!space) {
      throw 'invalid Move space x,y does not exist: ' + spaceId;
    }
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
    validateOrder[order.type](M, unit, order.params, actionParams);
  });
};

exports.validateQ = validateQ;


var doQ = function (M, actionOwnerRel, actionParams) {

};

exports.doQ = doQ;