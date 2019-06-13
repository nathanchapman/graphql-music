const iTunes = require('./iTunes');
const Lyrics = require('./Lyrics');
const BandsInTown = require('./BandsInTown');
const Weather = require('./Weather');

const createConnectors = () => ({
  iTunes: new iTunes(),
  Lyrics: new Lyrics(),
  BandsInTown: new BandsInTown(),
  Weather: new Weather(),
});

module.exports = createConnectors;
