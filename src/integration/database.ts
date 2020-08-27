import knex from 'knex';
import config from '../../knexfile';

/**
 * Instância do Knex para interagir com o banco de dados;
 */

export const getInstance = (dbName: string | null): knex => {
    return knex(config(dbName).development);
};

const instance = knex(config(null).development);

export default instance;
