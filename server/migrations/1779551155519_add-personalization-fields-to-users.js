exports.up = (pgm) => {
    pgm.addColumns('users', {
        has_personalized: {
            type: 'boolean',
            default: false,
        },
        age: {
            type: 'integer',
        },
        bmi: {
            type: 'numeric',
        },
        sleep_hours: {
            type: 'numeric',
        },
        gender: {
            type: 'varchar(20)',
        },
        work_type: {
            type: 'varchar(50)',
        },
        fitness_level: {
            type: 'varchar(20)',
        },
        device_preference: {
            type: 'varchar(50)',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('users', [
        'has_personalized',
        'age',
        'bmi',
        'sleep_hours',
        'gender',
        'work_type',
        'fitness_level',
        'device_preference',
    ]);
};
