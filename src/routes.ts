import Router from 'koa-router';
import Auth from './controllers/auth';
import Wallet from './controllers/wallet';

const router = new Router();

router.get('/', async (ctx, next) => {
    ctx.body = {
        status: 200,
        message: 'Hello, World!',
    };
    await next();
});

router.get('/wallet/:id/statement', Wallet.statement);
router.post('/wallet/:id/payment', Wallet.payment);
router.post('/wallet/:id/withdraw', Wallet.withdraw);
router.post('/wallet/:id/deposit', Wallet.deposit);
router.post('/auth/sign_in', Auth.sign_in);
router.post('/auth/sign_up', Auth.sign_up);

export default router;
