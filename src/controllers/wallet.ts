import { ParameterizedContext, Next } from 'koa';

const statement = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const deposit = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const withdraw = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

const payment = async (ctx: ParameterizedContext, next: Next): Promise<void> => {};

export default { statement, deposit, withdraw, payment };
