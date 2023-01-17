const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const _ = require('lodash');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
require('dotenv').config();

class PlaylistsServices {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });
  }

  async addPlaylist(userId, {name}) {
    const createdAt = new Date().toISOString();
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, userId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylist(userId) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users on users.id = playlists.owner where owner = $1',
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows;
  }

  async deletePlaylist(userId, id) {
    const deletePlaylistQuery = {
      text: 'DELETE FROM playlists WHERE id = $1 AND owner = $2 RETURNING id',
      values: [id, userId],
    };

    const result = await this._pool.query(deletePlaylistQuery);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }

    const deletePlaylistSongQuery = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 RETURNING id',
      values: [id],
    };
    await this._pool.query(deletePlaylistSongQuery);
  }

  async addPlaylistSong(id, {songId}) {
    const getSongQuery = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const getSongResult = await this._pool.query(getSongQuery);
    if (!getSongResult.rows.length) {
      throw new NotFoundError('Lagu gagal ditambahkan. Lagu tidak ditemukan');
    }

    const createdAt = new Date().toISOString();
    const playlistSongId = nanoid(16);
    const addSongQuery = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [playlistSongId, id, songId, createdAt],
    };

    const result = await this._pool.query(addSongQuery);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylistSong(userId, id) {
    const getPlaylistQuery = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users on users.id = playlists.owner where playlists.id = $1 and playlists.owner = $2',
      values: [id, userId],
    };

    const getPlaylistResult = await this._pool.query(getPlaylistQuery);
    if (!getPlaylistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const getPlaylistSongQuery = {
      text: 'SELECT songs.id, songs.title, songs.performer from playlist_songs JOIN songs on playlist_songs.song_id = songs.id where playlist_id = $1',
      values: [id],
    };

    const getPlaylistSongResult = await this._pool.query(getPlaylistSongQuery);

    _.assign(getPlaylistResult.rows[0], {
      songs: getPlaylistSongResult.rows,
    });

    return getPlaylistResult.rows[0];
  }

  async deletePlaylistSong(id, {songId}) {
    const getSongQuery = {
      text: 'SELECT * FROM songs where id = $1',
      values: [songId],
    };
    const getSongResult = await this._pool.query(getSongQuery);

    if (!getSongResult.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Lagu tidak ditemukan');
    }

    const deleteSongQuery = {
      text: 'DELETE from playlist_songs where playlist_id = $1 and song_id = $2 RETURNING id',
      values: [id, songId],
    };

    const result = await this._pool.query(deleteSongQuery);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus');
    }
  }


  async verifyPlaylistOwner(userId, id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsServices;
