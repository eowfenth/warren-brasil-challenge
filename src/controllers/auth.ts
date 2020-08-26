import { ParameterizedContext, Next } from 'koa';
import User from '../repositories/user';
import Errors from '../utils/errors';

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

const sign_up = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { document_id = null, birthdate = null, email = null, name = null } = ctx.request.body;
    const password_hash: string = ctx.state.password_hash;

    if (!document_id || !birthdate || !email || !name) {
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
        name,
    };

    const user: { email: string; name: string; id: string } | null = await User.sign_up(formatted_data);

    if (!user) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.CANNOT_SIGN_UP_ERROR,
            },
        };
    }

    if (user) {
        ctx.status = 200;
        ctx.body = {
            status: 'success',
            data: {
                user,
            },
        };
    }

    await next();
};

export default { sign_in, sign_up };
