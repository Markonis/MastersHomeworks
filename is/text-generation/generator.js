/* global _ */

var Generator = function (params) {
  var self = this;
  var size = params.size;
  var text = params.text;

  function separateWords(text) {
    return _.reject(text.split(/(\W)/), _.isEmpty);
  }

  function generateNgrams(words, size) {
    var result = _.chain(size + 1).range()
      .map(function (offset) {
        var offsetWords = _.rest(words, offset);
        return _.chunk(offsetWords, size + 1);
      })
      .flatten(true)
      .value();
    return result;
  }

  this.generateSplitNgrams = function (ngrams) {
    return _.map(ngrams, function (ngram) {
      return [
        _.initial(ngram).join(''),
        _.last(ngram)
      ];
    });
  };

  function findEnds(start, splitNgrams) {
    return _.chain(splitNgrams)
      .filter(function (splitNgram) {
        return splitNgram[0] === start;
      })
      .map(_.last)
      .reject(_.isEmpty)
      .value();
  }

  this.findMostFrequent = function (words) {
    return _.chain(words)
      .countBy(_.identity)
      .pairs()
      .sortBy(_.last)
      .map(_.first)
      .last()
      .value();
  };

  function generateStatistical(ngrams) {
    var splitNgrams = self.generateSplitNgrams(ngrams);
    var starts = _.chain(splitNgrams).map(_.first).uniq().value();

    return _.chain(starts)
      .map(function (start) {
        var ends = findEnds(start, splitNgrams);
        if (ends.length > 0) {
          return [start, self.findMostFrequent(ends)];
        }
        else {
          return null;
        }
      })
      .reject(_.isNull)
      .value();
  }

  this.generateAllStatistical = function () {
    return _.chain(size).range()
      .map(function (tierSize) {
        var ngrams = generateNgrams(words, tierSize + 1);
        return generateStatistical(ngrams, tierSize + 1);
      }).value();
  };

  this.getWords = function () {
    return words;
  };

  this.getStatistical = function () {
    return statistical;
  };

  function getNextWordInTier(tier, startKey) {
    return _.chain(tier)
      .filter(function (pair) {
        return pair[0] === startKey
      })
      .map(_.last)
      .value();
  }

  this.getNextWord = function (start) {
    var startWords = separateWords(start);
    var startKeys = _.chain(size).range().map(function (tierSize) {
      return _.last(startWords, tierSize + 1).join('');
    }).value();

    var zipped = _.zip(statistical, startKeys);
    var result = _.chain(zipped)
      .map(function (pair) {
        return getNextWordInTier(pair[0], pair[1]);
      })
      .map(_.first)
      .compact()
      .last()
      .value();

    if (_.isString(result)) {
      return result;
    }
    else {
      return _.sample(words);
    }
  };

  this.generateNextWords = function (inputText, numWords) {
    var text = _.clone(inputText);
    for (var i = 0; i < numWords; i++) {
      text += this.getNextWord(text);
    }
    return text;
  };

  var words = separateWords(text);

  var statistical = self.generateAllStatistical();
};
