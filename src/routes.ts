import Router from 'koa-router';
import AuthController from './controllers/auth';
import AuthMiddleware from './middlewares/auth';
import Wallet from './controllers/wallet';

const router = new Router();

router.get('/', async (ctx, next) => {
    ctx.body = {
        status: 200,
        message: 'Hello, World!',
    };
    await next();
});

router.get('/wallet/statement', AuthMiddleware.check_authorization, Wallet.statement);
router.post('/wallet/:id/payment', AuthMiddleware.check_authorization, Wallet.payment);
router.post('/wallet/:id/withdraw', AuthMiddleware.check_authorization, Wallet.withdraw);
router.post('/wallet/:id/deposit', AuthMiddleware.check_authorization, Wallet.deposit);
router.post('/auth/sign_in', AuthMiddleware.compare_password, AuthController.sign_in);
router.post('/auth/sign_up', AuthMiddleware.encrypt_password, AuthController.sign_up);

export default router;
