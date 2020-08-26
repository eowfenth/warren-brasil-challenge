import Knex from 'knex';
import { createTable, dropTable } from '../utils/migrations';

export async function up(knex: Knex): Promise<void> {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await createTable(knex, 'users', (table) => {
        table.text('first_name').notNullable();
        table.text('last_name').notNullable();
        table.text('document_id').notNullable();
        table.text('email').notNullable();
        table.timestamp('birthdate').notNullable();
        table.integer('age').notNullable();
    });

    await createTable(knex, 'wallets', (table) => {
        table.text('user_id').notNullable();
        table.integer('balance').notNullable().defaultTo(0);
    });

    await createTable(knex, 'transactions', (table) => {
        table.text('type').notNullable();
        table.integer('amount').notNullable();
        table.uuid('user_id').notNullable();
    });

    await createTable(knex, 'bankslips', (table) => {
        table.integer('amount').notNullable();
        table.uuid('user_id').notNullable();
        table.timestamp('valid_until').notNullable();
        table.timestamp('paid_at');
    });
}

export async function down(knex: Knex): Promise<void> {
    await dropTable(knex, 'users');
    await dropTable(knex, 'wallets');
    await dropTable(knex, 'transactions');
    await dropTable(knex, 'bankslips');
}
