class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const userId = request.auth.credentials.id;

    const playlistId = await this._service.addPlaylist(userId, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request, h) {
    const userId = request.auth.credentials.id;

    const playlists = await this._service.getPlaylist(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request, h) {
    const id = request.params.id;
    const userId = request.auth.credentials.id;

    await this._service.verifyPlaylistOwner(userId, id);
    await this._service.deletePlaylist(userId, id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    this._validator.validatePostPlaylistSongPayload(request.payload);
    const id = request.params.id;
    const userId = request.auth.credentials.id;

    await this._service.verifyPlaylistAccess(userId, id);
    const playlistSongId = await this._service.addPlaylistSong(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongHandler(request, h) {
    const id = request.params.id;
    const userId = request.auth.credentials.id;

    await this._service.verifyPlaylistAccess(userId, id);
    const playlist = await this._service.getPlaylistSong(userId, id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongHandler(request, h) {
    await this._validator.validateDeletePlaylistSongPayload(request.payload);
    const id = request.params.id;
    const userId = request.auth.credentials.id;

    await this._service.verifyPlaylistAccess(userId, id);
    await this._service.deletePlaylistSong(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
};

module.exports = PlaylistsHandler;
