class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this.albumsService = albumsService,
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const {cover} = request.payload;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const id = request.params.id;
    const filename = await this._service.writeFile(cover, cover.hapi);

    this.albumsService.addAlbumCover(id, filename);
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
