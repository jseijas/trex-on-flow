const BaseApp = require('./base-app');

/**
 * Random resolver
 */
class RandomApp extends BaseApp {
  /**
   * Constructor of the class.
   * @param {Object} settings - Settings for the instance.
   */
  constructor(settings) {
    super(settings);
    this.title = 'Random';
  }

  /**
   * Method that happen when there is a game reset for the first time,
   * receiving each trex.
   * @param {Object} trex - TRex instance.
   */
  initTrex(trex) {
  }

  /**
   * Trex crashed, so the model must be recalculated.
   * @param {Object} trex - TRex instance. 
   */
  afterCrash(trex) {
  }
}

module.exports = RandomApp;