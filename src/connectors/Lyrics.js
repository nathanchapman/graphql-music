const { get } = require('got');

class Lyrics {
  async bySong({ name, artistName }) {
    const options = {
      json: true,
    };

    const url = `https://api.lyrics.ovh/v1/${artistName}/${name}`;
    try {
      const { body } = await get(url, options);
      return body.lyrics;
    } catch (error) {
      return null;
    }
  }
}

module.exports = Lyrics;
