import knex from '../integration/database';
import { v4 as uuid } from 'uuid';
import { User } from '../db';

export interface SignUpRequest {
    document_id: string;
    birthdate: Date;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
}

export interface SignUpResult {
    first_name: string;
    last_name: string;
    user_id: string;
    email: string;
}

/**
 * Obtém uma entidade usuário a partir de um email;
 * @param email email de usuário
 */
const get_one_by_email = async (email: string): Promise<User | null> => {
    const user: User = await knex('users').select().where({ deleted_at: null, email }).first();
    return user;
};

/**
 * Formatador da Entidade Usuário em um formato mais limpo
 * @param user entidade usuário;
 */
const format_sign_up = (user: User): SignUpResult => {
    const { first_name, last_name, id: user_id, email } = user;
    return {
        first_name,
        last_name,
        user_id,
        email,
    };
};

/**
 * Chamada responsável por interagir com o banco de dados e inserir um novo usuário;
 * @param data dados do usuário para ser inseridos;
 */
const sign_up = async (data: SignUpRequest): Promise<SignUpResult | null> => {
    const user_exists = await knex('users').where({ deleted_at: null, document_id: data.document_id }).first();

    if (user_exists) {
        return null;
    }

    const user = await knex.transaction(async (trx) => {
        const result: User[] = await trx('users')
            .insert({
                ...data,
                id: uuid(),
            })
            .returning('*');
        return result.shift();
    });

    if (user) {
        return format_sign_up(user);
    }

    return null;
};

export default { get_one_by_email, sign_up };
