
import _ from 'lib/lodash';

var dep = function () {
  var s = '';
  _.each('silly', function (letter) {
    s += letter
  });
  return s;
};

export default dep;
