import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Gera um novo token JWT;
 * @param data payload contendo email ou id do usuário para inserir no token;
 */
const sign = (data: { email?: string; id?: string }): string => {
    const token = jwt.sign(data, process.env.JWT_SECRET ?? '', { expiresIn: process.env.JWT_EXPIRING_TIME ?? '3d' });
    return token;
};


export default { sign };
