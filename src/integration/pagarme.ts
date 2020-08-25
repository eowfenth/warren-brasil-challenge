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
    API_KEY: process.env.API_KEY ?? '',
};

const client = axios.create({
    baseURL: config.PAGARME_BASE_URL,
    auth: {
        username: config.API_KEY,
        password: 'x'
    }
});

const create_bankslip = () => {};
const get_bankslip = () => {};

export default { create_bankslip, get_bankslip }