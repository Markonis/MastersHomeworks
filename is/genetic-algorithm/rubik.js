function Rubik(size) {
  var pieces = null;

  function initPieces() {
    pieces = [];
    var slice = null;
    var row = null;

    for (var i = 0; i < size; i++) {
      slice = [];
      for (var j = 0; j < size; j++) {
        row = [];
        for (var k = 0; k < size; k++) {
          row.push(i * size * size + j * size + k);
        }
        slice.push(row);
      }
      pieces.push(slice);
    }
  }

  this.toSeries = function () {
    var result = [];
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        for (var k = 0; k < size; k++) {
          result.push(pieces[i][j][k]);
        }
      }
    }
    return result;
  };

  this.getSlice = function (axis, index) {
    var slice = [];
    var row = null;
    var i = 0;
    var j = 0;

    function readPiece(i, j) {
      try {
        switch (axis) {
        case 'x':
          return pieces[index][i][j];
        case 'y':
          return pieces[i][index][j];
        case 'z':
          return pieces[i][j][index];
        }
      }
      catch (e) {
        console.log(e);
      }
    }

    for (i = 0; i < size; i++) {
      row = [];
      for (j = 0; j < size; j++) {
        row.push(readPiece(i, j));
      }
      slice.push(row);
    }

    return slice;
  };

  this.setSlice = function (axis, index, slice) {
    var i = 0;
    var j = 0;

    function writePiece(i, j) {
      switch (axis) {
      case 'x':
        return pieces[index][i][j] = slice[i][j];
      case 'y':
        return pieces[i][index][j] = slice[i][j];
      case 'z':
        return pieces[i][j][index] = slice[i][j];
      }
    }

    for (i = 0; i < size; i++) {
      for (j = 0; j < size; j++) {
        writePiece(i, j);
      }
    }
  };

  this.rotate = function (axis, index) {
    function rotateSlice(slice) {
      var result = [];
      var row = null;
      var i = 0;
      var j = 0;

      // Init
      for (i = 0; i < size; i++) {
        row = [];
        for (j = 0; j < size; j++) {
          row.push(0);
        }
        result.push(row);
      }

      // Rotate
      for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
          result[i][j] = slice[size - j - 1][i];
        }
      }

      return result;
    }

    var slice = this.getSlice(axis, index);
    this.setSlice(axis, index, rotateSlice(slice));
  };

  this.copy = function () {
    var newRubik = new Rubik(size);
    for (var i = 0; i < size; i++)
      newRubik.setSlice('x', i, this.getSlice('x', i));
    return newRubik;
  };

  initPieces();
}
