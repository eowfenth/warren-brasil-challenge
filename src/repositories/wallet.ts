import knex from '../integration/database';
import { v4 as uuid } from 'uuid';
import { Wallet } from '../db';

const create = async (user_id: string): Promise<string | null> => {
    const wallet = await knex.transaction(async (trx) => {
        const result: Wallet[] = await trx('wallets')
            .insert({
                id: uuid(),
                user_id,
            })
            .returning('*');
        return result.shift();
    });

    if (wallet) {
        return wallet.id;
    }

    return null;
};
