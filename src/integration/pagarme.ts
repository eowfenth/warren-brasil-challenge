import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface Response<T> {
    status: 'success' | 'error';
    data: T;
}

interface Error {
    message: string;
}

interface TransactionUpdateRequest {
    status: 'paid';
}

interface TransactionRequest {
    amount: number;
    payment_method: 'boleto';
    customer: {
        type: 'individual';
        name: string;
        documents: [
            {
                type: 'cpf';
                number: string;
            },
        ];
    };
    postback_url?: string;
    boleto_instructions?: string;
    boleto_expiration_date?: string;
    boleto_rules?: 'strict_expiration_date' | 'no_strict';
}

interface TransactionResponse {
    object: 'transaction';
    status: 'refused' | 'waiting_payment' | 'processing' | 'paid';
    status_reason: 'acquirer';
    acquirer_name: 'pagarme';
    acquirer_id: string;
    tid: number;
    nsu: number;
    date_created: string;
    date_updated: string;
    amount: number;
    authorized_amount: number;
    paid_amount: number;
    id: number;
    payment_method: 'boleto';
    capture_method: 'ecommerce';
    boleto_url: string;
    boleto_barcode: string;
    boleto_expiration_date: string;
    referer: 'api_key';
    ip: string;
    customer: {
        object: 'customer';
        id: number;
        type: 'individual';
        document_type: 'cpf';
        name: string;
        documents: [
            {
                object: 'document';
                id: string;
                type: 'cpf';
                number: string;
            },
        ];
    };
}

const config = {
    PAGARME_BASE_URL: process.env.PAGARME_BASE_URL ?? '',
    API_KEY: process.env.PAGARME_API_KEY ?? '',
};

const client = axios.create({
    baseURL: config.PAGARME_BASE_URL,
    auth: {
        username: config.API_KEY,
        password: 'x',
    },
});

/**
 * Chamada genérica que permite interagir com a pagar.me
 * @param method método http desejado;
 * @param url url da requisição;
 * @param data dados para executar ações;
 */
const call = async (
    method: 'get' | 'post' | 'put',
    url: string,
    data?: TransactionUpdateRequest | TransactionRequest,
): Promise<Response<TransactionResponse | Error>> => {
    try {
        const response = await client.request({
            method,
            url,
            data,
        });

        return {
            status: 'success',
            data: response.data,
        };
    } catch (err) {
        console.error(JSON.stringify(err));
        return {
            status: 'error',
            data: {
                message: 'Erro genérico',
            },
        };
    }
};
/**
 * Gera um novo boleto a partir das informações inseridas;
 * @param transaction objeto descritivo das informações de um novo boleto;
 */
const create_bankslip = async (transaction: TransactionRequest): Promise<Response<TransactionResponse | Error>> => {
    return call('post', '/transactions/', transaction);
};

/**
 * Obtém informações do estado de uma transação;
 * @param transaction_id id da transação para obter informações sobre o estado;
 */
const get_bankslip = async (transaction_id: string): Promise<Response<TransactionResponse | Error>> => {
    return call('get', `/transactions/${transaction_id}`);
};

/**
 * Método disponivel apenas a fim de testes
 * Altera o estado de um Boleto para pago (útil para ambientes de testes);
 */
const pay_bankslip = async (transaction_id: string): Promise<Response<TransactionResponse | Error>> => {
    return call('put', `/transactions/${transaction_id}`, { status: 'paid' });
};

export default { create_bankslip, get_bankslip, pay_bankslip };
