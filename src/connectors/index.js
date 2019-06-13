const iTunes = require('./iTunes');
const Lyrics = require('./Lyrics');

const createConnectors = () => ({
  iTunes: new iTunes(),
  Lyrics: new Lyrics(),
});

module.exports = createConnectors;
