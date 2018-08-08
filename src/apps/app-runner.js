import 'babel-polyfill';

const NeuralNetworkApp = require('./neural-network-app');
const RandomApp = require('./random-app');
const GeneticApp = require('./genetic-app');

function getApp() {
  const options = { containerId: 'div[id="game"]', level: global.level };
  switch (global.appType) {
    case 'Random': return new RandomApp(options);
    case 'Genetic': return new GeneticApp(options);
    case 'NeuralNetwork': return new NeuralNetworkApp(options);
    case 'Neural': return new NeuralNetworkApp(options);
    default: return new RandomApp(options);
  }
}

function setup() {
  const app = getApp();
  app.init();
}

document.addEventListener('DOMContentLoaded', setup);
