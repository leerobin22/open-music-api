/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('songs', {album_id: 'VARCHAR(50)'});
  pgm.addConstraint('songs', 'fk_songs.album_id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id');
  pgm.dropColumns('songs', {album_id: 'VARCHAR(50)'});
};
