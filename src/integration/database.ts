import knex from 'knex';
import config from '../../knexfile';

const instance = knex(config['development']);

export default instance;
