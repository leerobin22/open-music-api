const InvariantError = require('../../exceptions/InvariantError');
const {PostPlaylistPayload, PostPlaylistSongPayload, DeletePlaylistSongPayload} = require('./schema');

const UsersValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayload.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostPlaylistSongPayload: (payload) => {
    const validationResult = PostPlaylistSongPayload.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeletePlaylistSongPayload: (payload) => {
    const validationResult = DeletePlaylistSongPayload.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
