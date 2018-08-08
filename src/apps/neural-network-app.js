const tf = require('@tensorflow/tfjs');
const BaseApp = require('./base-app');

/**
 * Neural Network Resolver.
 */
class NeuralNetworkApp extends BaseApp {
  /**
   * Constructor of the class.
   * @param {Object} settings - Settings of the instance.
   */
  constructor(settings) {
    super(settings);
    this.title = 'Neural Network';
    this.learningRate = this.settings.learningRate || 5e-3;
    this.hiddenLayerSize = this.settings.hiddenLayerSize || this.numVariables * 2;
    this.outputSize = 2;
    this.optimizer = tf.train.adam(this.learningRate);
    this.numIterations = this.settings.numIterations || 75;

  }

  /**
   * Method that happen when there is a game reset for the first time,
   * receiving each trex.
   * Initializes the model of the TRex, including the weights, the biases
   * and the training.
   * @param {Object} trex - TRex to be initialized.
   */
  initTrex(trex) {
    trex.model = {};
    trex.model.training = { inputs:[], labels: [] };
    trex.model.weights = [];
    trex.model.biases = [];
    trex.model.weights[0] = tf.variable(tf.randomNormal([this.numVariables, this.hiddenLayerSize]));
    trex.model.weights[1] = tf.variable(tf.randomNormal([this.hiddenLayerSize, this.outputSize]));
    trex.model.biases[0] = tf.variable(tf.zeros([1]));
    trex.model.biases[1] = tf.variable(tf.zeros([1]));
  }

  resetTrex(trex) {
    for (let i = 0; i < this.numIterations; i += 1) {
      this.train(trex, trex.model.training.inputs, trex.model.training.labels);
    }
  }

  train(trex, inputX, inputY) {
    let lossStr;
    this.optimizer.minimize(() =>  {
      const loss = this.loss(this.predict(trex, inputX), inputY);
      lossStr = loss.toString();
      return loss;
    });
    return Number.parseFloat(lossStr.split(' ')[4]);
  }

  loss(predicted, labels) {
    const result = predicted.sub(tf.tensor(labels)).square().mean();
    return result;
  }

  predict(trex, inputs) {
    const x = tf.tensor(inputs);
    return tf.tidy(() => {
      const layer = tf.tanh(tf.add(tf.matMul(x, trex.model.weights[0]), trex.model.biases[0]));
      const result = tf.tanh(tf.add(tf.matMul(layer, trex.model.weights[1]), trex.model.biases[1]));
      return result;
    });
  }

  resolvePrediction(trex, state, prediction, resolve) {
    let action = 0;
    return prediction.data().then((data) => {
      const index = data.indexOf(Math.max(...data));
      if (index === 0) {
        action = 1;
        trex.lastJumpingState = state;
      } else if (index === 1) {
        action = 0;
        trex.lastRunningState = state;
      }
      trex.lastAction = {
        label: action === 0 ? [0, 1] : [1, 0],
        state
      }
      return resolve(action);
    });
  }

  afterCrash(trex) {
    const input = this.stateToVector(trex.jumping ? trex.lastJumpingState : trex.lastRunningState);
    const label = trex.jumping ? [0, 1] : [1, 0];
    trex.model.training.inputs.push(input);
    trex.model.training.labels.push(label);
  }
}

module.exports = NeuralNetworkApp;
