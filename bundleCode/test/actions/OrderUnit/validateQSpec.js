var should = require('should');

var OrderUnit = require('../../../actions/OrderUnit');

var actionOwner = 'p1';

var validActionParamsCancelOrder = {
  unitId: 313,
  orders: [{
    type: 'CancelOrder',
    params: {
      orderIndex: 1
    }
  }]
};

var invalidActionParamsCancelOrder = {
  unitId: 313,
  orders: [{
    type: 'CancelOrder',
    params: {
      orderIndex: 1
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

var validUnitWithNoOrders = {
  locationId: '3,7',
  class: 'Viking',
  unitId: 313,
  ownerId: 'p1',
  attributes: {
    speed: 4,
    inititative: 50,
    initBonus: [5, 15],
    orders: []
  }
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

var validSpace = {
  id: '15,17'
};

describe('Actions:OrderUnit', function () {
  describe('validateQ', function () {
    it('should accept valid CancelOrder orders', function (done) {
      var M = {
        getPiece: function () {
          return validUnit;
        }
      };

      try {
        OrderUnit.validateQ(M, actionOwner, validActionParamsCancelOrder);
        done();
      } catch (e) {
        done(e);
      }
    });

    it('should accept valid Move orders', function (done) {
      var M = {
        getPiece: function () {
          return validUnit;
        },
        getSpace: function () {
          return validSpace;
        }
      };

      try {
        OrderUnit.validateQ(M, actionOwner, validActionParamsMove);
        done();
      } catch (e) {
        done(e);
      }
    });

    it('should reject orders that dont have a valid unitId', function (done) {
      // in this case, no units exist in M
      var M = {
        getPiece: function () {
          return undefined;
        }
      };

      try {
        OrderUnit.validateQ(M, actionOwner, validActionParamsCancelOrder);
        done('OrderUnit did not fail')
      } catch (e) {
        var index = e.toString().indexOf('unitId not found:');
        should(index).eql(0);
        done();
      }
    });

    it('should reject orders that are not owned by the player', function (done) {
      var M = {
        getPiece: function (id) {
          if (id === 313) {
            return {
              ownerId: 'p2'
            };
          }
          return undefined;
        }
      };

      try {
        OrderUnit.validateQ(M, actionOwner, validActionParamsCancelOrder);
        done('OrderUnit did not fail')
      } catch (e) {
        var index = e.toString().indexOf('unit not owned by player:');
        should(index).eql(0);
        done();
      }
    });

    it('should reject CancelOrder orders that do not have a valid orderIndex', function (done) {
      var M = {
        getPiece: function (id) {
          if (id === 313) {
            return validUnitWithNoOrders;
          }
          return undefined;
        }
      };

      try {
        OrderUnit.validateQ(M, actionOwner, validActionParamsCancelOrder);
        done('OrderUnit did not fail')
      } catch (e) {
        var index = e.toString().indexOf('invalid CancelOrder orderIndex:');
        should(index).eql(0);
        done();
      }
    });

    it('should reject CancelOrder orders that have multiple orderIndex occurances', function (done) {
      var M = {
        getPiece: function (id) {
          if (id === 313) {
            return validUnit;
          }
          return undefined;
        }
      };

      try {
        OrderUnit.validateQ(M, actionOwner, invalidActionParamsCancelOrder);
        done('OrderUnit did not fail')
      } catch (e) {
        var index = e.toString().indexOf('multiple CancelOrder orderIndex detected:');
        should(index).eql(0);
        done();
      }
    });

    it('should reject Move orders that dont reference a valid space', function (done) {
      // in this case, no valid spaces exist in M
      var M = {
        getPiece: function (id) {
          if (id === 313) {
            return validUnit;
          }
          return undefined;
        },
        getSpace: function () {
          return undefined;
        }
      };

      try {
        OrderUnit.validateQ(M, actionOwner, validActionParamsMove);
        done('OrderUnit did not fail')
      } catch (e) {
        var index = e.toString().indexOf('invalid Move space x,y does not exist:');
        should(index).eql(0);
        done();
      }
    });
  });
});
