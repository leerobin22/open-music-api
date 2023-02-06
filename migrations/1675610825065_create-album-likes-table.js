/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('album_like_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  });

  pgm.addConstraint('album_like_activities', 'fk_album_like_activities.album_id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
  pgm.addConstraint('album_like_activities', 'fk_album_like_activities.user_id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('album_like_activities');
};
