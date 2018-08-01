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
    this.learningRate = this.settings.learningRate || 0.1;
    this.hiddenLayerSize = this.settings.hiddenLayerSize || this.numVariables * 2;
    this.outputSize = 2;
    this.optimizer = tf.train.adadelta(this.learningRate);
    this.numIterations = this.settings.numIterations || 200;
  }

  resolvePrediction(trex, state, prediction, resolve) {
    let action = 0;
    return prediction.data().then((data) => {
      const index = data.indexOf(Math.max(...data));
      if (index === 0) {
        action = 1;
        trex.lastJumpingState = state;
      } else {
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

  loss(predicted, labels) {
  }

  predict(trex, inputs) {
  }


  /**
   * Train one time the model, based on the X and Y vectors.
   * @param {Object} trex
   * @param {Number[]} inputX - X Vector
   * @param {Number[]} inputY - Y Vector
   * @returns {number} Loss value.
   */
  train(trex, inputX, inputY) {
  }

  /**
   * Method that happen when there is a game reset for the first time,
   * receiving each trex.
   * Initializes the model of the TRex, including the weights, the biases
   * and the training.
   * @param {Object} trex - TRex to be initialized.
   */
  initTrex(trex) {
  }

  /**
   * Method that happen when there is a reset, except the first time, and
   * executed for every single trex.
   * So, at this point the trex must be trained. What we do is to train
   * the neural network based on the training data of the trex.
   * @param {Object} trex - TRex to be reset.
   */
  resetTrex(trex) {
  }

  afterCrash(trex) {
  }
}

module.exports = NeuralNetworkApp;
