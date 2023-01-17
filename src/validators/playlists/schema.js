const Joi = require('joi');

const PostPlaylistPayload = Joi.object({
  name: Joi.string().required(),
});

const PostPlaylistSongPayload = Joi.object({
  songId: Joi.string().required(),
});

const DeletePlaylistSongPayload = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {PostPlaylistPayload, PostPlaylistSongPayload, DeletePlaylistSongPayload};
