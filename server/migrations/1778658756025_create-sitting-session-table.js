exports.up = (pgm) => {
    pgm.createTable('sitting_sessions', {
        id: {
            type: 'varchar(50)',
            primaryKey: true,
        },

        user_id: {
            type: 'varchar(50)',
            notNull: true,
            references: 'users',
            onDelete: 'cascade',
        },

        startTime: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },

        endTime: {
            type: 'timestamp',
        },

        duration: {
            type: 'integer',
            default: 0,
        },

        totalBreakTime: {
            type: 'integer',
            default: 0,
        },

        breakTaken: {
            type: 'integer',
            default: 0,
        },

    });
};

exports.down = (pgm) => {
    pgm.dropTable('sitting_sessions');
};