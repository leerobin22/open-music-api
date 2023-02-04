/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumns('albums', {coverUrl: 'VARCHAR(500)'});
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', {coverUrl: 'VARCHAR(500)'});
};
