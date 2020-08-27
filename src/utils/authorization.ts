import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * iat refere-se a issued_at
 *
 * exp refere-se a expired_at
 */
interface JWTValidated {
    email?: string;
    wallet_id?: string;
    user_id?: string;
    id?: string;
    iat: number;
    exp: number;
}

/**
 * Gera um novo token JWT;
 * @param data payload contendo email ou id do usuário para inserir no token;
 */
const sign = (data: { email?: string; user_id?: string; wallet_id?: string }): string => {
    const token = jwt.sign(data, process.env.JWT_SECRET ?? '', { expiresIn: process.env.JWT_EXPIRING_TIME ?? '3d' });
    return token;
};

/**
 * Verifica validade de um token JWT;
 * @param token
 */
const check = async (token: string): Promise<JWTValidated | null> => {
    try {
        const verification = (await jwt.verify(token, process.env.JWT_SECRET ?? '')) as JWTValidated;
        return verification;
    } catch (err) {
        return null;
    }
};

export default { check, sign };
