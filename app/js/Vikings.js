import BoardView from 'js/BoardView';

// TESTING
var width = 8,
  height = 6;

var that; //lol

class Vikings {
  constructor(params) {
    that = this;
    console.log('Vikings constructor', params);
    params.type = 'horizontal';
    params.size = {width, height};
    params.clickSpaceCallback = this.clickSpaceCallback;
    this.myBoardView = new BoardView(params);
  }

  newTurnHook(result) {

  }

  clickSpaceCallback(x, y) {
    console.log(`Clicked: ${x}, ${y}`);

    if (that.selected === that.myBoardView.getHexKey(x, y)) {
      // current selection
      that.selected = undefined;
      that.myBoardView.setSelectedSpace();
    } else if (!that.selected) {
      // no selections
      that.selected = that.myBoardView.getHexKey(x, y);
      that.myBoardView.setSelectedSpace(x, y);
      return
    }

    // selections
    that.selected = that.myBoardView.getHexKey(x, y);
    that.myBoardView.setSelectedSpace(x, y);
  }
}

export default Vikings;
