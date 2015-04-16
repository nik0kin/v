var _ = require('lodash');

var mUtils = require('../utils/mUtils');

var OrdersMap = {
  'Move': require('../orders/Move')
};

var progressRoundHook = function (M) {
  var allUnits = mUtils.loadPiecesIntoClasses(M.getPieces()),
      metaData = {};

  // sort units by initiative decending
  var sortedByInitiativeUnits = _.sortBy(allUnits, function (unit, id) {
    return -unit.getAttr('initiative');
  });

  // attempt to execute lowest index Order of each unit
  var executeNextOrder = function (unit, id) {
    var order = unit.getNextOrder();
    if (!order) {
      return;
    }

    M.log('id' + id + ' ordertype: ' + order.type);
    M.log('id' + id + ' params: ' + JSON.stringify(order.params));
  
    var orderOrder = OrdersMap[order.type];

    if (orderOrder) {
      orderOrder.execute(unit, order.params);
    }
  };

  _.each(sortedByInitiativeUnits, function (unit) {
    var id = unit.getId();
    M.log('id' + id + ' - ' + unit.getAttr('initiative') + 'i');
    executeNextOrder(unit, id);
  });

  return metaData;
};

module.exports = progressRoundHook;
