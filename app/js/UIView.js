import _ from 'lib/lodash';

class UIView {
  constructor(moveUnitClickedCallback){
    this.moveUnitClickedCallback = moveUnitClickedCallback;
    this.$selectedSpaceInfo = $('#selectedSpaceInfo');
  }

  setSelectedSpaceInfo(space, units) {
    if (_.isUndefined(space)) {
      this.$selectedSpaceInfo.html('');
      return;
    }

    var getMoveButtonLabel = function (unit) {
       return `Move ${unit.speed} or fewer`
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
