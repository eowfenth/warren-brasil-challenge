import dotenv from 'dotenv';
import { Config } from 'knex';

dotenv.config();

const config = {
    database: process.env.DB_NAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    username: process.env.DB_USERNAME ?? 'postgres',
};

const knex_config = (dbName: string | null): { development: Config } => {
    return {
        development: {
            client: 'postgresql',
            connection: {
                database: dbName || config.database,
                password: config.password,
                user: config.username,
            },
            migrations: {
                directory: 'src/migrations',
                extension: 'ts',
            },
        },
    };
};

export default knex_config;
