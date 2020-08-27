import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import knex from 'knex';
import pg from 'pg';
import { getInstance } from '../src/integration/database';

jest.setTimeout(20000);
dotenv.config();

process.env.TZ = 'UTC';

export let conn: pg.Pool;
const databaseName = `test_${randomBytes(4).toString('hex')}`;
const instance = getInstance(databaseName);

const create = async (): Promise<void> => {
    try {
        conn = new pg.Pool({
            database: 'postgres',
            host: process.env.DB_HOST,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: process.env.DB_USERNAME,
        });

        await conn.query(`CREATE DATABASE ${databaseName};`);
        await instance.migrate.latest();
    } catch (err) {
        process.stderr.write(`${err}\n${err.stack || ''}\n`);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }
};

const destroy = async (instance: knex): Promise<void> => {
    await conn.end();
    await instance.migrate.rollback();
    await instance.destroy();
};

export default { instance, create, destroy };
