import Koa from 'koa';
import logger from 'koa-logger';
import json from 'koa-json';
import dotenv from 'dotenv';
import router from './src/routes';

dotenv.config();

const app = new Koa();

app.use(json());
app.use(logger());

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(process.env.PORT || 8081, () => {
    console.log(`Challenge is running at ${process.env.PORT || 8081}`);
});

export default server;