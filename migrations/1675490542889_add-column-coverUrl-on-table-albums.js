/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addColumns('albums', {coverUrl: 'VARCHAR(50)'});
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', {coverUrl: 'VARCHAR(50)'});
};
