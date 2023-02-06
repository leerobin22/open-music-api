const {Pool} = require('pg');
const _ = require('lodash');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
require('dotenv').config();

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool({
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT,
    });

    this._cacheService = cacheService;
  }

  async addAlbum({name, year}) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songResults = await this._pool.query(songQuery);

    _.assign(result.rows[0], {
      songs: songResults.rows,
    });

    return result.rows[0];
  }

  async editAlbumById(id, {name, year}) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumCover(id, coverUrl) {
    const query = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();
    const updateQuery = {
      text: 'UPDATE albums SET "coverUrl" = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [coverUrl, updatedAt, id],
    };

    const updateResult = await this._pool.query(updateQuery);
    if (!updateResult.rowCount) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  async postLikeAlbum(userId, id) {
    const getAlbumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const getAlbumResult = await this._pool.query(getAlbumQuery);

    if (!getAlbumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    };

    const getAlbumLikeQuery = {
      text: 'SELECT * FROM album_like_activities WHERE album_id = $1 AND user_id = $2',
      values: [id, userId],
    };
    const getAlbumLikeResult = await this._pool.query(getAlbumLikeQuery);

    if (!getAlbumLikeResult.rowCount) {
      const likeId = nanoid(16);
      const createdAt = new Date().toISOString();
      const createAlbumLikeQuery = {
        text: 'INSERT INTO album_like_activities VALUES($1, $2, $3, $4, $4) RETURNING id',
        values: [likeId, id, userId, createdAt],
      };
      const createAlbumLikeResult = await this._pool.query(createAlbumLikeQuery);
      if (!createAlbumLikeResult.rowCount) {
        throw new NotFoundError('Gagal menyukai album');
      }
    } else {
      const deleteAlbumLikeQuery = {
        text: 'DELETE FROM album_like_activities WHERE id = $1 RETURNING id',
        values: [getAlbumLikeResult.rows[0].id],
      };
      const deleteAlbumLikeResult = await this._pool.query(deleteAlbumLikeQuery);

      if (!deleteAlbumLikeResult.rowCount) {
        throw new NotFoundError('Gagal batal menyukai album');
      }
    };
    await this._cacheService.delete(`album:${id}`);
  }

  async getLikeAlbum(id) {
    try {
      const result = await this._cacheService.get(`album:${id}`);
      return {
        count: JSON.parse(result),
        cached: true,
      };
    } catch (error) {
      const getAlbumQuery = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id],
      };
      const getAlbumResult = await this._pool.query(getAlbumQuery);

      if (!getAlbumResult.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      };

      const getLikeCountQuery = {
        text: 'SELECT Count(id) FROM album_like_activities WHERE album_id = $1',
        values: [id],
      };
      const result = await this._pool.query(getLikeCountQuery);
      await this._cacheService.set(`album:${id}`, JSON.stringify(result.rows[0].count));

      return {
        count: result.rows[0].count,
        cached: false,
      };
    }
  }
}

module.exports = AlbumsService;
