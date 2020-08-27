import knex from '../integration/database';
import { v4 as uuid } from 'uuid';
import { Wallet, Transaction } from '../db';
import Errors from '../utils/errors';

const get_wallet = async (wallet_id: string): Promise<Wallet | null> => {
    console.log(wallet_id);
    const wallet: Wallet = await knex('wallets').select().where({ deleted_at: null, id: wallet_id }).first();
    return wallet;
};

const get_wallet_by_user_id = async (user_id: string): Promise<Wallet | null> => {
    const wallet: Wallet = await knex('wallets').select().where({ deleted_at: null, user_id: user_id }).first();
    return wallet;
};

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
