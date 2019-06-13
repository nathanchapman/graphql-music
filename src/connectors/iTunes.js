const { get } = require('got');

class iTunes {
  async artists({ name }) {
    const options = {
      query: {
        term: name,
        country: 'us',
        entity: 'allArtist',
      },
      json: true,
    };

    const { body } = await get('https://itunes.apple.com/search', options);
    const { results } = body;
    return results.map(artist => ({
      name: artist.artistName,
      url: artist.artistLinkUrl,
      id: artist.artistId,
      genre: artist.primaryGenreName,
    }));
  }
}

module.exports = iTunes;
