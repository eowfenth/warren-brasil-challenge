import knex from 'knex';
import config from '../../knexfile';

/**
 * Instância do Knex para interagir com o banco de dados;
 */
const instance = knex(config['development']);

export default instance;
