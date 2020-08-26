import { ParameterizedContext, Next } from 'koa';
import Errors from '../utils/errors';
/**
 * Controller responsável pela lógica relativa a obtenção de Extratos da Conta Corrente;
 * @param ctx
 * @param next
 */
const statement = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { page_size = 15, page_number = 1 } = ctx.request.query;
    const wallet_id = ctx.state.wallet_id;

    const wallet = await Wallet.get_wallet(wallet_id);

    if (!wallet) {
        ctx.status = 401;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.UNAUTHORIZED_ERROR,
            },
        };
    }

    const statement = await Wallet.get_statement(wallet.id, page_number, page_size);

    ctx.status = 200;
    ctx.body = {
        status: 'success',
        data: {
            statement,
        },
    };

    await next();
};

/**
 * Controller responsável pela funcionalidade de 'Deposito' em uma Wallet utilizando método de pagamento 'Dinheiro';
 * Caso você queira fazer um deposito por 'boleto', utilize a função 'deposit_by_bankslip';
 * @param ctx
 * @param next
 */
const deposit = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const wallet_id = ctx.state.wallet_id;

    const { value } = ctx.requery.body;

    if (value <= 0) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };
    }

    const wallet = await Wallet.get_wallet(wallet_id);

    const deposit_statement = await Wallet.deposit({ wallet_id: wallet.id, payment_type: 'money', value });

    if (!deposit_statement) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };
    }

    ctx.status = 201;
    ctx.body = {
        status: 'success',
        data: {
            statement: deposit_statement,
        },
    };

    await next();
};


/**
 * Controller responsável por lidar com 'Resgates ou Saques';
 * @param ctx
 * @param next
 */
const withdraw = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const wallet_id = ctx.state.wallet_id;

    const { value } = ctx.requery.body;

    if (value <= 0) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };
    }

    const withdraw_statement = await Wallet.withdraw(wallet_id, value);

    if (!withdraw_statement) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };
    }

    ctx.status = 201;
    ctx.body = {
        status: 'success',
        data: {
            statement: withdraw_statement,
        },
    };
};

const withdraw = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const payment = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

export default { statement, deposit, withdraw, payment };
