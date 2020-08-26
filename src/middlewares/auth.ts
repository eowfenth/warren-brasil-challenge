import { ParameterizedContext, Next } from 'koa';
import password_handler from '../utils/password';
import authorization_handler from '../utils/authorization';
import User from '../repositories/user';
import Errors from '../utils/errors';

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


export default { compare_password };
