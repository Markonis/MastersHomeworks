/* global _ */

function Experiment(params) {
  var gravity = params.gravity;
  var maxIterations = params.maxIterations;
  var targetDistance = params.targetDistance;
  var callback = params.callback;

  function init() {
    var speed = Math.random() * 100;
    var angle = Math.random() * Math.PI / 2;
    var state = {
      angle: angle,
      speed: speed
    };
    state.error = evaluateState(state);
    return state;
  }

  function createStates(state) {
    var states = [];
    var step = 0.05;
    for (var i = -5; i <= 5; i++) {
      for (var j = -5; j <= 5; j++) {
        if (i != 0 || j != 0) {
          states.push({
            angle: state.angle + i * step,
            speed: state.speed + j * step
          });
        }
      }
    }
    return states;
  }

  function evaluateState(state) {
    var distance = Math.pow(state.speed, 2) * Math.sin(2 * state.angle) / gravity;
    return Math.abs(targetDistance - distance);
  }

  function chooseState(states) {
    return _.chain(states)
      .map(function (state) {
        return {
          angle: state.angle,
          speed: state.speed,
          error: evaluateState(state)
        };
      })
      .sortBy('error').first().value();
  }

  function shouldStop(lastState, nextState) {
    return _.isEqual(lastState, nextState);
  }

  this.run = function () {
    var currentState = init();
    var lastState = currentState;
    for (var i = 0; i < maxIterations; i++) {
      var states = createStates(currentState);
      var nextState = chooseState(states);
      if (shouldStop(lastState, nextState)) {
        break;
      }
      else {
        callback(currentState);
        lastState = currentState;
        currentState = nextState;
      }
    }
  };
}
