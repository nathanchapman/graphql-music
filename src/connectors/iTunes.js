const { get } = require('got');

class iTunes {
  async artists({ name, limit }) {
    const options = {
      query: {
        term: name,
        country: 'us',
        entity: 'allArtist',
        limit,
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

  async songs({ name, limit }) {
    const options = {
      query: {
        term: name,
        country: 'us',
        entity: 'song',
        limit,
      },
      json: true,
    };

    const { body } = await get('https://itunes.apple.com/search', options);
    const { results } = body;
    return results.map(song => ({
      name: song.trackName,
      artistName: song.artistName,
      album: song.collectionName,
      url: song.trackViewUrl,
      id: song.trackId,
    }));
  }
}

module.exports = iTunes;
