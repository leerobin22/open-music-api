const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsServices');
const AlbumsValidator = require('./validators/albums');
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsServices');
const SongsValidator = require('./validators/songs');
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersServices');
const UsersValidator = require('./validators/users');
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsServices');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validators/authentications');
require('dotenv').config();

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([{
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  }, {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  }, {
    plugin: users,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  }, {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  }]);

  server.ext('onPreResponse', (request, h) => {
    const {response} = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
