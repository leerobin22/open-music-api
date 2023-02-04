const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: ['multipart/form-data'],
        multipart: true,
        maxBytes: 512000,
      },
    },
  },
];

module.exports = routes;
