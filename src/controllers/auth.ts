import { ParameterizedContext, Next } from 'koa';

const sign_in = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const sign_up = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

export default { sign_in, sign_up };