import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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