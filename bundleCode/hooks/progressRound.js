var _ = require('lodash');

var mUtils = require('../utils/mUtils');

var OrdersMap = {
  'Move': require('../orders/Move'),
  'ProduceUnit': require('../orders/ProduceUnit'),
};

var progressRoundHook = function (M) {
  var allUnits = mUtils.loadPiecesIntoClasses(M.getPieces()),
      metaData = {
        orders: []
      };

  // reset units turn variables
  _.each(allUnits, function (unit, id) {
    unit.resetTurnVars();
  });

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
      var orderMetadata = orderOrder.execute(unit, order.params, M);

      orderMetadata.unitId = id;

      if (!orderMetadata.obsolete) {
        metaData.orders.push(orderMetadata);
      }

      if (orderMetadata.removeOrder || orderMetadata.doNextOrder) {
        unit.removeOrder(0);
      }
      if (orderMetadata.doNextOrder) {
        executeNextOrder(unit, id);
      }
      unit.save(M);
    }
  };

  _.each(sortedByInitiativeUnits, function (unit) {
    var id = unit.getId();
    M.log('id' + id + ' - ' + unit.getAttr('initiative') + 'i');
    executeNextOrder(unit, id);
  });

  M.log(JSON.stringify(metaData));

  return M.persistQ()
    .then(function () {
      return metaData;
    });
};

module.exports = progressRoundHook;
