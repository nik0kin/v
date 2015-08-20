import _ from 'lib/lodash';

class UIView {
  constructor(params) {
    this.userPlayerRel = params.userPlayerRel;
    this.$playerLabel = $('#playerName');
    this.$modeLabel = $('#moreinfo');
    this.submitButtonClickedCallback = params.submitButtonClickedCallback;
    this.moveUnitClickedCallback = params.moveUnitClickedCallback;
    this.produceUnitClickedCallback = params.produceUnitClickedCallback;
    this.unitListClickedCallback = params.unitListClickedCallback;
    this.selectUnitClickedCallback = params.selectUnitClickedCallback;
    this.cancelUnitOrderClickedCallback = params.cancelUnitOrderClickedCallback;
    this.$selectedSpaceInfo = $('#selectedSpaceInfo > p');
    this.$selectedSpaceIcon = $('#selectedSpaceTile');
    this.$selectedSpaceTerrainLabel = $('#selectedSpaceTerrainLabel');
    this.$selectedSpaceResourceLabel = $('#selectedSpaceResourceLabel');
    this.$selectedSpacePositionLabel = $('#selectedSpacePositionLabel');
    this.$selectedUnitInfo = $('#selectedUnitInfo > p');
    this.$selectedUnitIcon = $('#selectedUnitInfo > img');
    this.$unitList = $('#unitlist > p');
    this.$turnList = $('#turnlist > p');
    this.$turnListButton = $('#turnlist > button');
    this.$block2UnitList = $('#unitlist');
    this.$block2TurnList = $('#turnlist');
    this.$submitButton = $('#submitButton');

    this.$submitButton.click(this.submitButtonClickedCallback);
  }

  setSubmitToInProgress() {
    this.$submitButton.html('...');
    this.$submitButton.prop("disabled", true);
  }

  setSubmitToResubmit() {
    this.$submitButton.html('Re-Submit');
    this.$submitButton.prop("disabled", false);
  }

  setSubmitToNormal() {
    this.$submitButton.html('Submit');
    this.$submitButton.prop("disabled", false);
  }

  initPlayerLabels(players) {
    var htmlStr = '';
    var that = this;
    that.players = players;
    _.each(players, function (playerInfo, playerRel) {
      var played = !playerInfo.played ? '*' : '';
      if (playerRel !== that.userPlayerRel) {
        htmlStr += `- <span id="${playerRel}playerLabel">${playerInfo.name}${played}</span>`;
      } else {
        that.getPlayerLabel(that.userPlayerRel).html(`${playerInfo.name}${played}`);
      }
    });
    $('#otherPlayers').html(htmlStr);
  }

  getPlayerLabel(playerRel) {
    if (playerRel === this.userPlayerRel) {
      return this.$playerLabel;
    } else {
      return $('#' + playerRel + 'playerLabel');
    }
  }

  resetPlayerLabels() {
    var that = this;
    _.each(this.players, (p, playerRel) => {
      that.setPlayerLabelNotSubmitted(playerRel);
    });
  }

  setPlayerLabelSubmitted(playerRel) {
    var playerName = this.players[playerRel].name;
    this.getPlayerLabel(playerRel).html(playerName);
  }

  setPlayerLabelNotSubmitted(playerRel) {
    var playerName = this.players[playerRel].name;
    this.getPlayerLabel(playerRel).html(playerName + '*');
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
      htmlStr += `<img src="img/icons/${unit.classType}.png" class="smallIcon"> `;
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
      this.$selectedUnitIcon.hide();
      return;
    }

    var htmlStr = '',
        moveButtonId = `moveunit${unit.id}`,
        produceUnitButtonId = `produceunit${unit.id}`

    htmlStr += `${unit.classType} id=${unit.id}<br>`;
    if (unit.speed) {
      htmlStr += `speed=${unit.speed}, `;
    } else if (unit.currentProduction) {
      htmlStr += `next Unit produced=${unit.currentProduction.finishTurn}, `;
    }
    htmlStr += `initiative=${unit.initiative}<br>`;

    _.each(orders, (order, key) => {
      htmlStr += `- ${order.type} `;
      switch (order.type.toLowerCase()) {
        case 'move':
          htmlStr += `${order.params.x},${order.params.y} `;
          break;
        case 'produceunit':
          htmlStr += `${order.params.classType} `;
          break;
      }
      htmlStr += `<button id="cancelorder${key}">X</button><br>`;
    });

    if (unit.speed) {
      htmlStr += `<button id="${moveButtonId}">Move</button>`;
    } else if (unit.classType === 'meadhall') {
      htmlStr += `<button id="${produceUnitButtonId}">Produce Worker</button>`;
    }
    htmlStr += '<br>';

    this.$selectedUnitInfo.html(htmlStr);

    // set icon
    this.$selectedUnitIcon.show();
    this.$selectedUnitIcon.prop('src', 'img/icons/' + unit.classType + '.png');

    var that = this;
    if (unit.speed) {
      // initalize move click callback
      var $moveUnitButton = $('#' + moveButtonId),
          moving = false;
      $moveUnitButton.click(function () {
        if (moving) {
          that.moveUnitClickedCallback();
          $moveUnitButton.html('Move');
          moving = false;
          return;
        }
        that.moveUnitClickedCallback(unit.id);
        $moveUnitButton.html('MOVING');
        moving = true;
      });
    } else if (unit.classType === 'meadhall') {
      // initalize produce unit click callback
      $('#' + produceUnitButtonId).click(function () {
        that.produceUnitClickedCallback(unit.id, 'worker');
      });
    }

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
      this.$selectedSpaceIcon.hide();
      this.$selectedSpacePositionLabel.hide();
      this.$selectedSpaceTerrainLabel.hide();
      this.$selectedSpaceResourceLabel.hide();
      return;
    }

    var selectedSpaceHtml = '';

    var that = this;
    _.each(units, function (unit) {
      selectedSpaceHtml += unit.ownerId === that.userPlayerRel ? `<button id="selectunit${unit.id}">` : '';
      selectedSpaceHtml += `${unit.classType} id=${unit.id} ${unit.ownerId}`;
      selectedSpaceHtml += unit.ownerId === that.userPlayerRel ? `</button><br>` : `<br>`;
    });

    this.$selectedSpaceInfo.html(selectedSpaceHtml);

    // set icon image
    this.$selectedSpaceIcon.removeClass();
    this.$selectedSpaceIcon.addClass('tile ' + space.terrainType);
    this.$selectedSpaceIcon.show();

    // set terrain and position labels
    this.$selectedSpacePositionLabel.html(`${space.x}, ${space.y}`);
    this.$selectedSpaceTerrainLabel.html(space.terrainType);
    this.$selectedSpacePositionLabel.show();
    this.$selectedSpaceTerrainLabel.show();

    // set resources label if applicable
    if (space.resources) {
      var htmlStr = '';
      _.each(space.resources, function (amount, resource) {
        htmlStr = amount + resource.substring(0,1).toUpperCase() + ' ';
      });
      this.$selectedSpaceResourceLabel
          .html(htmlStr)
          .show();
    } else {
      this.$selectedSpaceResourceLabel.hide();
    }

    // initilize move click callbacks
    _.each(units, function (unit) {
      var selectUnitButton = $(`#selectunit${unit.id}`);
      selectUnitButton.click(() => {
        that.selectUnitClickedCallback(unit.id);
      });
    });
  }

  showReviewButton() {
    this.$turnListButton.show();
  }

  hideReviewButton() {
    this.$turnListButton.hide();
  }

  setReviewModeLabel() {
    this.$modeLabel.html('REVIEW');
    this.$modeLabel.css('background-color', '#386BF5');
    this.$block2UnitList.hide();
    this.$block2TurnList.show();
  }

  setPlayModeLabel() {
    this.$modeLabel.html('PLAY');
    this.$modeLabel.css('background-color', 'green');
    this.$block2TurnList.hide();
    this.$block2UnitList.show();
  }

  setTurnList(turnNumber, turnMetadata, getUnit) {
    this.$turnListButton.html('Show Turn ' + turnNumber);

    var htmlStr = '';
    _.each(turnMetadata.orders, function (order) {
      htmlStr += '<div class="order">';
      switch (order.orderType) {
        case 'Move':
          var lastPos = order.path[order.path.length-1],
              unit = getUnit(order.unitId);

          htmlStr += `<img src="img/icons/${unit.classType}.png" class="smallIcon">`;
          htmlStr += `${unit.initiative}). ${order.unitId}-${unit.classType} moved to ${lastPos.x},${lastPos.y}`;
          break;
        case 'ProduceUnit':
          var unit = getUnit(order.unitId);
          htmlStr += `<img src="img/icons/${unit.classType}.png" class="smallIcon">`;
          htmlStr += `${unit.initiative}). ${order.unitId}-${unit.classType}`;

          if (order.start) {
            htmlStr += ` started producing ${order.classType}`;
          } else if (order.finish) {
            htmlStr += ` finished producing ${order.classType}`;
          } else {
            htmlStr += ` continued producing ${order.classType}`;
          }
          break;
      }
      htmlStr += '</div>';
      htmlStr += '<br>';
    });
    if (turnMetadata.orders.length === 0) {
      htmlStr = 'NO ORDERS PLAYED';
    }
    this.$turnList.html(htmlStr);
  }

  // select the specific order while its 'animating'
  setTurnOrderCurrent(n) {
    $('.review-current-order').removeClass('review-current-order');

    var x = $($('#turnlist > p > div')[n]); // grosssssssss
    x.addClass('review-current-order');
  }

  setClickReviewButtonCallback(clickReviewButtonCallback) {
    this.$turnListButton.click(clickReviewButtonCallback);
  }
}

export default UIView;
