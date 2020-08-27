import Router from 'koa-router';
import AuthController from './controllers/auth';
import AuthMiddleware from './middlewares/auth';
import Wallet from './controllers/wallet';

const router = new Router();

router.get('/wallet/statement', AuthMiddleware.check_authorization, Wallet.statement);
router.post('/wallet/payment', AuthMiddleware.check_authorization, Wallet.payment);
router.post('/wallet/transfer', AuthMiddleware.check_authorization, Wallet.transfer);
router.post('/wallet/withdraw', AuthMiddleware.check_authorization, Wallet.withdraw);
router.post('/wallet/deposit', AuthMiddleware.check_authorization, Wallet.deposit);
router.post('/auth/sign_in', AuthMiddleware.compare_password, AuthController.sign_in);
router.post('/auth/sign_up', AuthMiddleware.encrypt_password, AuthController.sign_up);

export default router;
