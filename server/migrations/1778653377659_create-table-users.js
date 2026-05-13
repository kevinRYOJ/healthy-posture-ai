exports.up = (pgm) => {
    pgm.createExtension('pgcrypto', {
        ifNotExists: true,
    });

    pgm.createTable('users', {
        id: {
            type: 'varchar(50)',
            primaryKey: true,
        },

        name: {
            type: 'varchar(100)',
            notNull: true,
        },

        email: {
            type: 'varchar(150)',
            notNull: true,
            unique: true,
        },

        password: {
            type: 'text',
            notNull: true,
        },

        created_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },

        updated_at: {
            type: 'timestamp',
            default: pgm.func('current_timestamp'),
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};