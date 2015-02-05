import _ from 'lib/lodash';

class UIView {
  constructor(params) {
    this.userPlayerRel = params.userPlayerRel;
    $('#playerName').html(this.userPlayerRel);
    this.submitButtonClickedCallback = params.submitButtonClickedCallback;
    this.moveUnitClickedCallback = params.moveUnitClickedCallback;
    this.unitListClickedCallback = params.unitListClickedCallback;
    this.selectUnitClickedCallback = params.selectUnitClickedCallback;
    this.cancelUnitOrderClickedCallback = params.cancelUnitOrderClickedCallback;
    this.$selectedSpaceInfo = $('#selectedSpaceInfo');
    this.$selectedUnitInfo = $('#selectedUnitInfo');
    this.$unitList = $('#unitlist');

    $('#submitButton').click(this.submitButtonClickedCallback);
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

  setSelectedUnitInfo(unit, orders) {
    if (_.isUndefined(unit) || unit.ownerId !== this.userPlayerRel) {
      this.$selectedUnitInfo.html('');
      return;
    }

    var htmlStr = '',
        moveButtonId = `moveunit${unit.id}`;

    htmlStr += `${unit.classType} id=${unit.id}<br>`;
    htmlStr += `speed=${unit.speed}, initiative=${unit.initiative}<br>`;

    _.each(orders, (order, key) => {
      htmlStr += `- ${order.type} ${order.params.x},${order.params.y} `;
      htmlStr += `<button id="cancelorder${key}">X</button><br>`;
    });

    htmlStr += `<button id="${moveButtonId}">Move</button>`;
    htmlStr += '<br>';

    this.$selectedUnitInfo.html(htmlStr);

    // initalize move click callback
    var that = this;
    var moveUnitButton = $('#' + moveButtonId);
    var moving = false;
    moveUnitButton.click(function () {
      if (moving) {
        that.moveUnitClickedCallback();
        moveUnitButton.html('Move');
        moving = false;
        return;
      }
      that.moveUnitClickedCallback(unit.id);
      moveUnitButton.html('MOVING');
      moving = true;
    });

    // initalize cancel order click callbacks
    _.each(orders, (order, key) => {
      var cancelOrderButton = $(`#cancelorder${key}`);
      cancelOrderButton.click(() => {
        that.cancelUnitOrderClickedCallback(unit.id, key);
      });
    });
  }

  setSelectedSpaceInfo(space, units) {
    if (_.isUndefined(space)) {
      this.$selectedSpaceInfo.html('');
      return;
    }

    var selectedSpaceHtml = `Selected Space: ${space.x}, ${space.y} ${space.terrainType}<br><br>`;

    var that = this;
    _.each(units, function (unit) {
      selectedSpaceHtml += unit.ownerId === that.userPlayerRel ? `<button id="selectunit${unit.id}">` : '';
      selectedSpaceHtml += `${unit.classType} id=${unit.id} ${unit.ownerId}`;
      selectedSpaceHtml += unit.ownerId === that.userPlayerRel ? `</button><br>` : `<br>`;
    });

    this.$selectedSpaceInfo.html(selectedSpaceHtml);

    // initilize move click callbacks
    _.each(units, function (unit) {
      var selectUnitButton = $(`#selectunit${unit.id}`);
      selectUnitButton.click(() => {
        that.selectUnitClickedCallback(unit.id);
      });
    });
  }

}

export default UIView;
