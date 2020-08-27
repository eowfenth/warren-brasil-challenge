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

const format_sign_up = (user: User): SignUpResult => {
    const { first_name, last_name, id: user_id, email } = user;
    return {
        first_name,
        last_name,
        user_id,
        email,
    };
};

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

export default { sign_up };
