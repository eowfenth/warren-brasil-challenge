import request from 'supertest';
import faker from 'faker';
import context from './setup';
import server from '../app';
import instance from '../src/integration/database';

const db = context.instance;

beforeAll(async () => {
    await context.create();
});

test('select users', async () => {
    const users = await db.from('users').select('first_name');
    expect(users.length).toEqual(0);
});

test('try to use the api without access', async () => {
    await request(server)
        .get('/wallet/statement')
        .set('Authorization', `Bearer ${faker.internet.password(30)}`)
        .expect(401);
});

describe('sign up a new user and then sign in', () => {
    const user = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        birthdate: faker.date.between('1970-01-01', '2000-01-01'),
        document_id: faker.random.alphaNumeric(11),
    };

    test('create a new user successfully', async () => {
        await request(server).post('/auth/sign_up').send(user).expect('Content-Type', /json/).expect(201);
    });

    test('create a new user with missing fields', async () => {
        await request(server)
            .post('/auth/sign_up')
            .send({
                first_name: user.first_name,
            })
            .expect('Content-Type', /json/)
            .expect(400);
    });

    test('sign in a just registered user', async () => {
        await request(server)
            .post('/auth/sign_in')
            .send({ email: user.email, password: user.password })
            .expect('Content-Type', /json/)
            .expect(200);
    });

    test('sign in a mistyped password', async () => {
        await request(server)
            .post('/auth/sign_in')
            .send({ email: user.email, password: faker.internet.password(8) })
            .expect('Content-Type', /json/)
            .expect(401);
    });

    test('sign up with informations of a registered user', async () => {
        await request(server).post('/auth/sign_up').send(user).expect('Content-Type', /json/).expect(400);
    });

    test('sign in with missing password', async () => {
        await request(server)
            .post('/auth/sign_in')
            .send({ email: faker.internet.email() })
            .expect('Content-Type', /json/)
            .expect(400);
    });

    test('sign in with missing email', async () => {
        await request(server)
            .post('/auth/sign_in')
            .send({ password: faker.internet.password(8) })
            .expect('Content-Type', /json/)
            .expect(400);
    });

    test('sign in with a not registered user', async () => {
        await request(server)
            .post('/auth/sign_in')
            .send({ email: faker.internet.email(), password: faker.internet.password(8) })
            .expect('Content-Type', /json/)
            .expect(401);
    });
});

describe('user using statement and deposit operations', () => {
    const user = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        birthdate: faker.date.between('1970-01-01', '2000-01-01'),
        document_id: faker.random.alphaNumeric(11),
    };
    let token: string;

    test('get statement from a newly user', async () => {
        await request(server).post('/auth/sign_up').send(user);
        const session = await request(server)
            .post('/auth/sign_in')
            .send({ email: user.email, password: user.password });
        token = session.body.data.token;
        const response = await request(server).get('/wallet/statement').set('Authorization', `Bearer ${token}`);

        const data = response.body.data;
        expect(data.balance).toBe(0);
        expect(data.statements).toHaveLength(0);
    });

    test('deposit a positive value to a user', async () => {
        const response = await request(server)
            .post('/wallet/deposit')
            .send({
                value: 1000,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(201);

        const statement = await request(server).get('/wallet/statement').set('Authorization', `Bearer ${token}`);

        const data = statement.body.data;
        expect(data.balance).toBe(1000);
        expect(data.statements).toHaveLength(1);
    });

    test('deposit a negative value to a user', async () => {
        await request(server)
            .post('/wallet/deposit')
            .send({
                value: -1000,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });
});

describe('user using transfer operation', () => {
    const user = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        birthdate: faker.date.between('1970-01-01', '2000-01-01'),
        document_id: faker.random.alphaNumeric(11),
    };

    const other_user = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        birthdate: faker.date.between('1970-01-01', '2000-01-01'),
        document_id: faker.random.alphaNumeric(11),
    };
    let token: string;
    let other_user_token: string;

    test('transfer value to itself', async () => {
        const registered_user = await request(server).post('/auth/sign_up').send(user);
        const user_id = registered_user.body.data.user_id;
        const session = await request(server)
            .post('/auth/sign_in')
            .send({ email: user.email, password: user.password });
        token = session.body.data.token;

        await request(server)
            .post('/wallet/transfer')
            .send({
                value: 1000,
                receiver_id: user_id,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    test('transfer to other user', async () => {
        const registered_user = await request(server).post('/auth/sign_up').send(other_user);
        const user_id = registered_user.body.data.user_id;
        const session = await request(server)
            .post('/auth/sign_in')
            .send({ email: other_user.email, password: other_user.password });
        other_user_token = session.body.data.token;
        await request(server)
            .post('/wallet/deposit')
            .send({
                value: 1000,
            })
            .set('Authorization', `Bearer ${token}`);
        await request(server)
            .post('/wallet/transfer')
            .send({
                value: 1000,
                receiver_id: user_id,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(201);

        const statement = await request(server).get('/wallet/statement').set('Authorization', `Bearer ${token}`);

        const data = statement.body.data;
        expect(data.balance).toBe(0);
        expect(data.statements).toHaveLength(2);

        await request(server).get('/wallet/statement').set('Authorization', `Bearer ${other_user_token}`);

        const other_statement = await request(server)
            .get('/wallet/statement')
            .set('Authorization', `Bearer ${other_user_token}`);

        const other_data = other_statement.body.data;
        expect(other_data.balance).toBe(1000);
        expect(other_data.statements).toHaveLength(1);
    });
});

describe('user using withdraw operation', () => {
    const user = {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
        birthdate: faker.date.between('1970-01-01', '2000-01-01'),
        document_id: faker.random.alphaNumeric(11),
    };
    let token: string;

    test('withdraw a positive value from a user without balance', async () => {
        await request(server).post('/auth/sign_up').send(user);
        const session = await request(server)
            .post('/auth/sign_in')
            .send({ email: user.email, password: user.password });
        token = session.body.data.token;
        await request(server)
            .post('/wallet/withdraw')
            .send({
                value: 1000,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    test('withdraw a positive value from a user with balance', async () => {
        await request(server).post('/auth/sign_up').send(user);
        const session = await request(server)
            .post('/auth/sign_in')
            .send({ email: user.email, password: user.password });
        token = session.body.data.token;
        await request(server)
            .post('/wallet/deposit')
            .send({
                value: 1000,
            })
            .set('Authorization', `Bearer ${token}`);
        await request(server)
            .post('/wallet/withdraw')
            .send({
                value: 1000,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(201);

        const statement = await request(server).get('/wallet/statement').set('Authorization', `Bearer ${token}`);

        const data = statement.body.data;
        expect(data.balance).toBe(0);
        expect(data.statements).toHaveLength(2);
    });
});

afterAll(async () => {
    await context.destroy(db);
    await instance.destroy();
    server.close();
});
