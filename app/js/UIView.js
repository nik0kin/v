import _ from 'lib/lodash';

class UIView {
  constructor(moveUnitClickedCallback, unitListClickedCallback){
    this.moveUnitClickedCallback = moveUnitClickedCallback;
    this.unitListClickedCallback = unitListClickedCallback;
    this.$selectedSpaceInfo = $('#selectedSpaceInfo');
    this.$unitList = $('#unitlist');
  }

  setUnitListInfo(units) {
    var htmlStr = '';

    var getOrderButtonLabel = function (unit) {
      if (unit.orders.length === 0) {
        return 'NO ORDERS';
      } else {
        var order = unit.orders[0];
        return order.type + ' ' + JSON.stringify(order.params);
      }
    };

    _.each(units, function (unit) {
      console.log(unit)
      htmlStr += `${unit.classType} ${unit.x},${unit.y} `;
      htmlStr += `<button id="unitlist${unit.id}">${getOrderButtonLabel(unit)}</button>`;
      htmlStr += '<br>';
    });

    this.$unitList.html(htmlStr);

    // initilize move click callbacks
    var that = this;
    _.each(units, function (unit) {
      var unitListButton = $(`#unitlist${unit.id}`);
      unitListButton.click(function () {
        that.unitListClickedCallback(unit);
      });
    })
  }

  setSelectedSpaceInfo(space, units) {
    if (_.isUndefined(space)) {
      this.$selectedSpaceInfo.html('');
      return;
    }

    var getMoveButtonLabel = function (unit) {
      return `Move ${unit.speed} or fewer`;
    };

    var selectedSpaceHtml = `Selected Space: ${space.x}, ${space.y} ${space.terrainType}<br><br>`;

    _.each(units, function (unit) {
      selectedSpaceHtml += `${unit.classType} id=${unit.id} `;
      selectedSpaceHtml += `<button id="moveunit${unit.id}">${getMoveButtonLabel(unit)}</button>`;
      selectedSpaceHtml += '<br>';
    });

    this.$selectedSpaceInfo.html(selectedSpaceHtml);

    // initilize move click callbacks
    var that = this;
    _.each(units, function (unit) {
      var moveUnitButton = $(`#moveunit${unit.id}`);
      var moving = false;
      moveUnitButton.click(function () {
        if (moving) {
          that.moveUnitClickedCallback();
          moveUnitButton.html(getMoveButtonLabel(unit));
          moving = false;
          return;
        }
        that.moveUnitClickedCallback(unit.id);
        moveUnitButton.html('MOVING');
        moving = true;
      });
    })
  }

}


export default UIView;
