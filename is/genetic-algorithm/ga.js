/* global _ */

function Creature(params) {
  var steps = null;

  if (params.steps !== undefined) {
    steps = _.map(params.steps, function (step) {
      return step.copy();
    });
  }
  else {
    steps = [];
    for (var i = 0; i < params.numSteps; i++) {
      steps.push(params.createStep());
    }
  }

  this.getSteps = function () {
    return steps;
  };

  this.applyTo = function (obj) {
    var result = obj.copy();
    for (var i = 0; i < steps.length; i++) {
      steps[i].applyTo(result);
    }
    return result;
  };

  this.mutate = function () {
    for (var i = 0; i < steps.length; i++)
      if (Math.random() > 0.8) steps[i].randomize();
  };
}

function GA(params) {

  function createRandomGeneration() {
    var result = [];
    for (var i = 0; i < params.populationSize; i++) {
      result.push(params.randomCreature());
    }
    return result;
  }

  function createNextGeneration(generation) {
    var sorted = _.sortBy(generation, params.evaluateCreature).reverse();
    var elite = _.last(sorted, params.numElite);
    var rest = produceRest(sorted);
    return elite.concat(rest);
  }

  function produceRest(sorted) {
    var result = [];
    for (var i = 0; i < params.populationSize - params.numElite; i++) {
      result.push(produceCreature(sorted));
    }
    return result;
  }

  function produceCreature(sorted) {
    var parents = chooseParents(sorted);
    return params.breed(parents);
  }

  function chooseParents(sorted) {
    function chooseOne() {
      var x = Math.random();
      var index = Math.ceil((1 - Math.pow(x, 4)) * (sorted.length - 1));
      return sorted[index];
    }
    return [chooseOne(), chooseOne()];
  }

  this.run = function (callback) {
    var currentGeneration = createRandomGeneration();
    var batchSize = 10;
    var numBatches = params.numGenerations / batchSize;
    var iteration = 0;

    callback(currentGeneration, iteration);

    _.times(numBatches, function () {
      _.defer(function () {
        _.times(batchSize, function () {
          iteration += 1;
          currentGeneration = createNextGeneration(currentGeneration);
          callback(currentGeneration, iteration);
        });
      });
    });
  };
}
