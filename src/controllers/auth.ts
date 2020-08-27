import { ParameterizedContext, Next } from 'koa';
import User, { SignUpResult } from '../repositories/user';
import Errors from '../utils/errors';
import Wallet from '../repositories/wallet';

/**
 * Controller responsável por lidar com autorizações de Log-in;
 * @param ctx
 * @param next
 */
const sign_in = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { email = null, password = null } = ctx.request.body;
    const { token } = ctx.state;

    if (!email || !password) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: { message: !email ? Errors.NO_EMAIL_LOGIN_ERROR : Errors.NO_PASSWORD_LOGIN_ERROR },
        };
    }

    ctx.status = 200;
    ctx.body = {
        status: 'success',
        data: {
            token: token,
        },
    };

    await next();
};

/**
 * Controller responsável por lidar com autorizações de 'Cadastro';
 * @param ctx
 * @param next
 */
const sign_up = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const {
        document_id = null,
        birthdate = null,
        email = null,
        first_name = null,
        last_name = null,
    } = ctx.request.body;
    const password_hash: string = ctx.state.password_hash;

    if (!document_id || !birthdate || !email || !first_name || !last_name) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_SIGN_UP_ERROR,
            },
        };
    }

    const formatted_data = {
        document_id,
        birthdate,
        email,
        password_hash,
        first_name,
        last_name,
    };

    const user: SignUpResult | null = await User.sign_up(formatted_data);

    if (user) {
        const wallet_id = await Wallet.create(user.user_id);
        ctx.status = 200;
        ctx.body = {
            status: 'success',
            data: {
                ...user,
                wallet_id,
            },
        };

        return;
    }

    ctx.status = 400;
    ctx.body = {
        status: 'error',
        data: {
            message: Errors.CANNOT_SIGN_UP_ERROR,
        },
    };

    await next();
};

export default { sign_in, sign_up };
