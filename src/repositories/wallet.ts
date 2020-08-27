import knex from '../integration/database';
import { v4 as uuid } from 'uuid';
import { Wallet, Transaction } from '../db';

/**
 * Obtém informações de uma conta a partir de um id;
 * @param wallet_id id da conta corrente
 */
const get_wallet = async (wallet_id: string): Promise<Wallet | null> => {
    console.log(wallet_id);
    const wallet: Wallet = await knex('wallets').select().where({ deleted_at: null, id: wallet_id }).first();
    return wallet;
};

/**
 * Obtém informações de uma conta a partir de um id de usuário;
 * @param user_id id do usuário dono da conta;
 */
const get_wallet_by_user_id = async (user_id: string): Promise<Wallet | null> => {
    const wallet: Wallet = await knex('wallets').select().where({ deleted_at: null, user_id: user_id }).first();
    return wallet;
};

/**
 * Chamada responsável por interagir com o banco de dados e obter extratos ordenados;
 * @param wallet_id id da conta corrente;
 * @param page_number número da página, utilizado para paginação;
 * @param page_size tamanho da página, utilizado para paginação;
 */
const get_statement = async (wallet_id: string, page_number: number, page_size: number): Promise<Transaction[]> => {
    const result: Transaction[] = await knex('transactions')
        .select()
        .where({ deleted_at: null, wallet_id })
        .orderBy('created_at', 'desc')
        .limit(page_size)
        .offset((page_number - 1) * page_size);
    return result;
};

/**
 * Chamada genérica para depositar ou sacar valores de uma conta; Assim como transferir entre contas;
 * @param wallet_id id de uma conta;
 * @param value valor em centavos a ser inserido, resgatado ou transferido;
 * @param type tipo de ação (depósito, resgate ou transferência (pagamento));
 */
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

/**
 * Chamada específica para interagir com o banco de dados e efetuar uma transferência entre contas.
 * @param transaction dados necessários para uma transferência;
 */
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

/**
 * Cria uma nova conta corrente para um usuário; 
 * @param user_id id do usuário
 */
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
