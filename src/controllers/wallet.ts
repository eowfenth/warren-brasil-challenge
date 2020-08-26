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

const statement = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const deposit = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const withdraw = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const payment = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

export default { statement, deposit, withdraw, payment };
