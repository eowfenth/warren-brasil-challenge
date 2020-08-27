import { ParameterizedContext, Next } from 'koa';
import Wallet from '../repositories/wallet';
import Errors from '../utils/errors';
/**
 * Controller responsável pela lógica relativa a obtenção de Extratos da Conta Corrente;
 * @param ctx
 * @param next
 */
const statement = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { page_size = process.env.PAGE_SIZE_DEFAULT || 15, page_number = 1 } = ctx.request.query;
    const wallet_id = ctx.state.wallet_id;
    const wallet = await Wallet.get_wallet(wallet_id);
    if (wallet) {
        const statements = await Wallet.get_statement(wallet.id, page_number, page_size);
        ctx.status = 200;
        ctx.body = {
            status: 'success',
            data: {
                balance: wallet.balance,
                statements,
            },
        };

        return;
    }

    ctx.status = 401;
    ctx.body = {
        status: 'error',
        data: {
            message: Errors.UNAUTHORIZED_ERROR,
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

    const { value } = ctx.request.body;

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

    if (wallet) {
        const deposit_statement = await Wallet.action(wallet.id, value, 'deposit');

        if (!deposit_statement) {
            ctx.status = 400;
            ctx.body = {
                status: 'error',
                data: {
                    message: Errors.CANNOT_DEPOSIT_ERROR,
                },
            };

            return;
        }

        ctx.status = 201;
        ctx.body = {
            status: 'success',
            data: {
                statement: deposit_statement,
            },
        };
    }

    await next();
};


/**
 * Controller responsável por lidar com 'Resgates ou Saques';
 * @param ctx
 * @param next
 */
const withdraw = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const wallet_id = ctx.state.wallet_id;

    const { value } = ctx.request.body;

    if (value <= 0) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };
    }

    const withdraw_statement = await Wallet.action(wallet_id, value, 'withdraw');

    if (!withdraw_statement) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };

        return;
    }

    ctx.status = 201;
    ctx.body = {
        status: 'success',
        data: {
            statement: withdraw_statement,
        },
    };

    await next();
};

/**
 * Controller responsável por realizar 'transferências de valores' entre dois correntistas;
 * @param ctx
 * @param next
 */
const transfer = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { wallet_id, user_id } = ctx.state;

    const { receiver_id, value } = ctx.request.body;

    if (value <= 0 || user_id === receiver_id) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };
    }

    const receiver_wallet = await Wallet.get_wallet_by_user_id(receiver_id);

    if (receiver_wallet) {
        const transfer_statement = await Wallet.transfer({
            wallet_id,
            receiver_wallet_id: receiver_wallet.id,
            value,
        });

        if (!transfer_statement) {
            ctx.status = 400;
            ctx.body = {
                status: 'error',
                data: {
                    message: Errors.CANNOT_TRANSFER_ERROR,
                },
            };

            return;
        }

        ctx.status = 201;
        ctx.body = {
            status: 'success',
            data: {
                transfer_statement: transfer_statement.withdraw,
            },
        };
    }

    await next();
};

/**
 * Controller responsável por realizar 'pagamentos' utilizando 'Dinheiro'
 * @param ctx
 * @param next
 */
const payment = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { wallet_id, user_id } = ctx.state;

    const { receiver_id, value } = ctx.requery.body;

    if (value <= 0 || user_id === receiver_id) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_DEPOSIT_ERROR,
            },
        };
    }

    const [wallet, receiver_wallet] = await Promise.all([
        Wallet.get_wallet(wallet_id),
        Wallet.get_wallet_by_user_id(receiver_id),
    ]);

    const payment_statement = await Wallet.payment({
        wallet_id: wallet.id,
        receiver_wallet_id: receiver_wallet.id,
        payment_type: 'money',
        value,
    });

    if (!payment_statement) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_TRANSFER_ERROR,
            },
        };
    }

    ctx.status = 201;
    ctx.body = {
        status: 'success',
        data: {
            payment_statement,
        },
    };

    await next();
};

export default { statement, deposit, withdraw, payment };
