/* global $ _ Rubik GA Creature */

function RubikStep(params) {
  var cubeSize = null;
  var self = this;
  var axis = null;
  var index = null;

  function init() {
    cubeSize = params.cubeSize;
    if (params.axis !== undefined) axis = params.axis;
    if (params.index !== undefined) index = params.index;
    if (axis === null || index === null) self.randomize();
  }

  this.applyTo = function (rubik) {
    rubik.rotate(axis, index);
  };

  this.copy = function () {
    return new RubikStep({
      index: index,
      axis: axis,
      cubeSize: cubeSize
    });
  };

  this.randomize = function () {
    axis = _.sample(['x', 'y', 'z']);
    index = Math.floor(Math.random() * params.cubeSize);
  };

  init();
}

function RubikExperiment(params) {

  function randomCreature() {
    return new Creature({
      numSteps: params.numSteps,
      createStep: function () {
        return new RubikStep({
          cubeSize: params.cubeSize
        });
      }
    });
  }

  function breed(parents) {
    var stepsA = parents[0].getSteps();
    var stepsB = parents[1].getSteps();

    // Crossover
    var crossoverPoint = Math.ceil(Math.random() * (params.numSteps - 1));
    var start = _.first(stepsA, crossoverPoint);
    var end = _.last(stepsB, params.numSteps - crossoverPoint);
    var newCreature = new Creature({
      steps: start.concat(end)
    });
    newCreature.mutate();
    return newCreature;
  }

  function evaluateCreature(cube, creature) {
    var resultCube = creature.applyTo(cube);
    var series = resultCube.toSeries();
    var error = 0;
    for (var i = 0; i < series.length; i++) {
      if (i != series[i]) error += 1;
    }
    return error;
  }

  function randomCube() {
    var cube = new Rubik(params.cubeSize);
    var creature = randomCreature();
    creature.applyTo(cube);
    return cube;
  }

  this.run = function (callback) {
    var cube = randomCube();

    var evaluationFn = _.partial(evaluateCreature, cube);

    var ga = new GA({
      numGenerations: params.numGenerations,
      populationSize: params.populationSize,
      randomCreature: randomCreature,
      evaluateCreature: evaluationFn,
      breed: breed,
      numElite: params.numElite
    });

    ga.run(function (generation, iteration) {
      var best = _.chain(generation)
        .map(function (creature) {
          return {
            error: evaluationFn(creature),
            creature: creature
          };
        })
        .sortBy('error').first().value();

      callback({
        error: best.error,
        result: best.creature.applyTo(cube),
        creature: best.creature
      }, iteration);
    });
  };
}

$(function () {
  function start() {
    $('#results').children().remove();

    var experiment = new RubikExperiment({
      numGenerations: 300,
      populationSize: 10,
      numSteps: 15,
      cubeSize: 3,
      numElite: 3
    });

    function addRow(best, iteration) {
      $('#results').append($('<tr>' +
        '<td>' + iteration + '</td>' +
        '<td>' + best.error + '</td>' +
        '</tr>'));
    }

    function callback(best, iteration) {
      if ((iteration % 10) == 0) addRow(best, iteration);
    }

    experiment.run(callback);
  }
  $('#start').click(start);
});
