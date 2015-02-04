var _ = require('lodash'),
    should = require('should');

var OrderUnit = require('../../../actions/OrderUnit');

var actionOwner = 'p1';

var validActionParamsCancelOrder = {
  unitId: 313,
  orders: [{
    type: 'CancelOrder',
    params: {
      orderIndex: 0
    }
  }, {
    type: 'CancelOrder',
    params: {
      orderIndex: 1
    }
  }]
};

var validActionParamsMove = {
  unitId: 313,
  orders: [{
    type: 'Move',
    params: {
      x: 15,
      y: 17
    }
  }]
};

var validActionParamsCancelAndMove = {
  unitId: 313,
  orders: [{
    type: 'Move',
    params: {
      x: 15,
      y: 17
    }
  }, {
    type: 'CancelOrder',
    params: {
      orderIndex: 0
    }
  }]
};

var validUnit = {
  locationId: '3,7',
  class: 'Viking',
  id: 313,
  ownerId: 'p1',
  attributes: {
    speed: 4,
    inititative: 50,
    initBonus: [5, 15],
    orders: [{
      type: 'Move',
      params: {x: 15, y: 12}
    }, {
      type: 'Move',
      params: {x: 17, y: 13}
    }]
  }
};

var createQuickM = function () {
  var unit = _.cloneDeep(validUnit);
  return {
    getPiece: function (pieceId) {
      if (pieceId === unit.id) {
        return unit;
      }
    },
    persistQ: function () {}
  };
};


describe('Actions:OrderUnit', function () {
  describe('doQ', function () {
    it('should append Move orders', function () {
      var M = createQuickM();
      OrderUnit.doQ(M, actionOwner, validActionParamsMove);
      var unit = M.getPiece(validUnit.id);
      // 2 existing orders + 1 additional Move order = 3
      should(unit.attributes.orders.length).eql(3);
      var lastOrder = unit.attributes.orders[2];
      should(lastOrder.type).eql(validActionParamsMove.orders[0].type);
      should(lastOrder.params.x).eql(validActionParamsMove.orders[0].params.x);
      should(lastOrder.params.y).eql(validActionParamsMove.orders[0].params.y);
    });

    it('should remove CancelOrders', function () {
      var M = createQuickM();
      OrderUnit.doQ(M, actionOwner, validActionParamsCancelOrder);
      var unit = M.getPiece(validUnit.id);
      // 2 existing orders - 2 CancelOrder = 0
      should(unit.attributes.orders.length).eql(0);
    });

    it('should remove CancelOrders and append Move orders', function () {
      var M = createQuickM();
      OrderUnit.doQ(M, actionOwner, validActionParamsCancelAndMove);
      var unit = M.getPiece(validUnit.id);
      // 2 existing orders - 1 CancelOrder + 1 Move = 2
      should(unit.attributes.orders.length).eql(2);
      var firstOrder = unit.attributes.orders[0],
          lastOrder = unit.attributes.orders[1];
      should(firstOrder.params.x).eql(validUnit.attributes.orders[1].params.x);
      should(firstOrder.params.y).eql(validUnit.attributes.orders[1].params.y);
      should(lastOrder.params.x).eql(validActionParamsCancelAndMove.orders[0].params.x);
      should(lastOrder.params.y).eql(validActionParamsCancelAndMove.orders[0].params.y);
    });
  });
});
