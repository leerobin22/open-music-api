class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeAlbumByIdHandler = this.postLikeAlbumByIdHandler.bind(this);
    this.getLikeAlbumByIdHandler = this.getLikeAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const {name = 'untitled', year} = request.payload;

    const albumId = await this._service.addAlbum({name, year});

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const album = await this._service.getAlbumById(id);

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const {id} = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request, h) {
    const {id} = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postLikeAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const userId = request.auth.credentials.id;
    await this._service.postLikeAlbum(userId, id);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai atau batal menyukai album',
    });
    response.code(201);
    return response;
  }

  async getLikeAlbumByIdHandler(request, h) {
    const {id} = request.params;
    const likeCount = await this._service.getLikeAlbum(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(likeCount.count),
      },
    });

    if (likeCount.cached) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsHandler;
