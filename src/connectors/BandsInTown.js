const { get } = require('got');

class BandsInTown {
  async events({ name, limit }) {
    const options = {
      json: true,
    };

    const url = `https://rest.bandsintown.com/artists/${name}/events?app_id=qfasdfasdf`;
    const { body } = await get(url, options);
    return body.slice(0, limit);
  }
}

module.exports = BandsInTown;
