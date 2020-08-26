import dotenv from 'dotenv';

dotenv.config();

const config = {
    database: process.env.DB_NAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    username: process.env.DB_USERNAME ?? 'postgres',
};

const knex_config = {
    development: {
        client: 'postgresql',
        connection: {
            database: config.database,
            password: config.password,
            user: config.username,
        },
        migrations: {
            directory: 'src/migrations',
            extensions: 'ts',
        },
    },
};

export default knex_config;
