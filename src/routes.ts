import Router from 'koa-router';

const router = new Router();

router.get('/', async (ctx, next) => {
    ctx.body = {
        status: 200,
        message: 'Hello, World!',
    };
    await next();
});

export default router;
