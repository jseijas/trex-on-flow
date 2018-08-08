const BaseApp = require('./base-app');

/**
 * Genetic Algorithm resolver.
 */
class GeneticApp extends BaseApp {
  /**
   * Constructor of the class.
   * @param {Object} settings - Settings for the instance. 
   */
  constructor(settings) {
    super(settings);
    this.trexCount = this.settings.trexCount || 10;
    this.title = 'Genetic';
    this.rankList = [];
  }

  /**
   * Based on the better 2 parents, generate the new chromosomes of the
   * population. Each new chromosome should contain part of the parent 1
   * and part of the parent 2, decided by a random cross point. Also,
   * one of the genes is a mutation, so it's calculated randomly and not
   * from the parents.
   * @param {*} chromosomes 
   */
  static cross(chromosomes) {
    const parent1 = chromosomes[0].slice();
    const parent2 = chromosomes[1].slice();
    const chromosomeLength = parent1.length;
    for (let i = 0; i < chromosomes.length; i += 1) {
      const crossPoint = Math.floor(Math.random() * chromosomeLength);
      const mutationPoint = Math.floor(Math.random() * chromosomeLength);
      for (let j = 0; j < chromosomeLength; j += 1) {
        if (j === mutationPoint) {
          chromosomes[i][j] = BaseApp.random();
        } else {
          chromosomes[i][j] = j >= crossPoint ? parent1[j] : parent2[j];
        }
      }
    }
    return chromosomes;
  }

  /**
   * Method that happen when there is a game reset for the first time,
   * receiving each trex.
   * @param {*} trex - TRex to be initialized.
   */
  initTrex(trex) {
    trex.model = {};
    trex.model.weights = [];
    trex.model.biases = [];
    for (let i = 0; i < this.numVariables; i += 1) {
      trex.model.weights[i] = BaseApp.random();
    }
    trex.model.biases[0] = BaseApp.random();
  }

  /**
   * Get the chromosome of a trex.
   * @param {Object} trex - TRex to get the chromosome.
   * @returns {number[]} A vector representing the chromosome of the trex. 
   */
  getChromosome(trex) {
    return trex.model.weights.concat(trex.model.biases);
  }

  /**
   * Method that happen when there is a reset, except the first time.
   * Cross and mutate the genome to generate the new population. 
   */
  reset() {
    const chromosomes = this.rankList.map((trex) => this.getChromosome(trex));
    this.rankList = [];
    GeneticApp.cross(chromosomes);
    this.chromosomes = chromosomes;
  }

  /**
   * Method that happen when there is a reset, except the first time, and
   * executed for every single trex.
   * Set the genome of the trex based on the precalculated genome.
   * @param {Object} trex - TRex to be reset. 
   * @param {number} i - Index of the trex.
   */
  resetTrex(trex, i) {
    for (let j = 0; j < this.numVariables; j+= 1) {
      trex.model.weights[j] = this.chromosomes[i][j];  
    }
    trex.model.biases[0] = this.chromosomes[i][this.numVariables];
  }

  /**
   * Happens every time a trex crash.
   * Adds the trex to the rank list, and the list will be sorted.
   * @param {Object} trex - TRex to be reset. 
   */
  afterCrash(trex) {
    this.rankList.unshift(trex);
  }
}

module.exports = GeneticApp;
