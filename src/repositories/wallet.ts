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

const get_statement = async (wallet_id: string, page_number: number, page_size: number): Promise<Transaction[]> => {
    const result: Transaction[] = await knex('transactions')
        .select()
        .where({ deleted_at: null, wallet_id })
        .orderBy('created_at', 'desc')
        .limit(page_size)
        .offset((page_number - 1) * page_size);
    return result;
};

const action = async (
    wallet_id: string,
    value: number,
    type: 'deposit' | 'withdraw' | 'transfer_deposit' | 'transfer_withdraw',
): Promise<Transaction | null> => {
    const wallet: Wallet = await knex.transaction(async (trx) => {
        const current = await trx('wallets').select().where({ deleted_at: null, id: wallet_id }).first().forUpdate();

        if (!current) {
            return null;
        }

        if ((type === 'withdraw' || type === 'transfer_withdraw') && current.balance < value) {
            return null;
        }

        const currentValue = type === 'deposit' || type === 'transfer_deposit' ? value : value * -1;

        const updatedWallet = await trx('wallets')
            .where({ deleted_at: null, id: wallet_id })
            .update({
                balance: current.balance + currentValue,
                updated_at: new Date(),
            })
            .returning('*');

        return updatedWallet.shift();
    });

    if (wallet) {
        const transaction = await knex.transaction(async (trx) => {
            const result: Transaction[] = await trx('transactions')
                .insert({
                    id: uuid(),
                    user_id: wallet.user_id,
                    wallet_id: wallet.id,
                    amount: value,
                    type,
                })
                .returning('*');
            return result.shift();
        });

        if (transaction) {
            return transaction;
        }
    }

    return null;
};

const transfer = async (transaction: {
    wallet_id: string;
    receiver_wallet_id: string;
    value: number;
}): Promise<{ withdraw: Transaction; deposit: Transaction } | null> => {
    const { wallet_id, receiver_wallet_id, value } = transaction;
    const withdraw = await action(wallet_id, value, 'transfer_withdraw');

    if (withdraw) {
        const deposit = await action(receiver_wallet_id, value, 'transfer_deposit');

        if (deposit) {
            return {
                withdraw,
                deposit,
            };
        }
    }

    return null;
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


export default { get_wallet, get_wallet_by_user_id, get_statement, transfer, create, action };
