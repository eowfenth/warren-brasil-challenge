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

const sign_in = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const sign_up = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

export default { sign_in, sign_up };