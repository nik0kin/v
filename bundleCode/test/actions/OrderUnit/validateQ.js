var should = require('should');

var OrderUnit = require('../../../actions/OrderUnit');

describe('Actions:OrderUnit', function () {
  describe('validateQ', function () {
    it('should reject orders that dont have a valid unitId', function (done) {
      // in this case, no units exist in M
      var M = {
        getPiece: function () {
          return undefined;
        }
      };

      var validActionParams = {
        unitId: 313,
        orders: [{
          type: 'CancelOrder',
          params: {
            orderIndex: 1
          }
        }]
      };

      try {
        OrderUnit.validateQ(M, 'p1', validActionParams);
        done('OrderUnit did not fail')
      } catch (e) {
        var index = e.toString().indexOf('unitId not found:');
        should(index).eql(0);
        done();
      }
    });

    it('should reject orders that are not owned by the player', function (done) {
      // in this case, no units exist in M
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

      var validActionParams = {
        unitId: 313,
        orders: [{
          type: 'CancelOrder',
          params: {
            orderIndex: 1
          }
        }]
      };

      try {
        OrderUnit.validateQ(M, 'p1', validActionParams);
        done('OrderUnit did not fail')
      } catch (e) {
        var index = e.toString().indexOf('unit not owned by player:');
        should(index).eql(0);
        done();
      }
    });
  });
});
