const iTunes = require('./iTunes');

const createConnectors = () => ({
  iTunes: new iTunes(),
});

module.exports = createConnectors;
