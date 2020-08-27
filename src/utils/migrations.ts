import Knex, { CreateTableBuilder } from 'knex';

export async function createTable(
    knex: Knex,
    tableName: string,
    tableBuilder: (table: CreateTableBuilder) => void,
    idColumnType: 'text' | 'uuid' = 'uuid',
): Promise<void> {
    await knex.schema.createTable(tableName, (table) => {
        table[idColumnType]('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('deleted_at').defaultTo(null);
        tableBuilder(table);
    });
}

export async function dropTable(knex: Knex, tableName: string): Promise<void> {
    await knex.schema.dropTable(tableName);
}

export default { createTable, dropTable };
