import { ParameterizedContext, Next } from 'koa';
import password_handler from '../utils/password';
import authorization_handler from '../utils/authorization';
import User from '../repositories/user';
import Errors from '../utils/errors';

/**
 * Middleware responsável por verificar um password;
 * @param ctx
 * @param next
 */
const compare_password = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { email = null, password = null } = ctx.request.body;

    if (!password) {
        ctx.throw(400, Errors.NO_PASSWORD_LOGIN_ERROR);
    }

    if (!email) {
        ctx.throw(400, Errors.NO_EMAIL_LOGIN_ERROR);
    }

    const user = await User.get_one_by_email(email);

    const is_valid = await password_handler.compare(user.password, password);

    if (is_valid) {
        const token = authorization_handler.sign({ email: user.email });

        ctx.state.token = token;
    } else {
        ctx.status = 401;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.WRONG_CREDENTIALS,
            },
        };
    }

    await next();
};

/**
 * Middleware responsável por encriptar um password;
 * @param ctx
 * @param next
 */
const encrypt_password = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const { password = null } = ctx.request.body;

    if (!password) {
        ctx.status = 400;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.NO_PASSWORD_SIGN_UP_ERROR,
            },
        };
    }

    const password_hash = await password_handler.encrypt(password);
    ctx.state.password_hash = password_hash;

    await next();
};

const check_authorization = async (ctx: ParameterizedContext, next: Next): Promise<void> => {
    const authorization_header = ctx.get('Authorization');

    const [, token] = authorization_header.split(' ');
    if (!authorization_header) {
        ctx.status = 401;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.UNAUTHORIZED_ERROR,
            },
        };
        return;
    }

    const verification = await authorization_handler.check(token);

    if (!verification) {
        ctx.status = 401;
        ctx.body = {
            status: 'error',
            data: {
                message: Errors.UNAUTHORIZED_ERROR,
            },
        };
        return;
    }

    await next();
};

export default { compare_password, encrypt_password, check_authorization };
