import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JWTValidated {
    email?: string;
    id?: string;
    iat: number;
    exp: number;
}

/**
 * Gera um novo token JWT;
 * @param data payload contendo email ou id do usuário para inserir no token;
 */
const sign = (data: { email?: string; id?: string }): string => {
    const token = jwt.sign(data, process.env.JWT_SECRET ?? '', { expiresIn: process.env.JWT_EXPIRING_TIME ?? '3d' });
    return token;
};

/**
 *
 * @param token
 */
const check = async (token: string): Promise<JWTValidated | null> => {
    try {
        const verification = (await jwt.verify(token, process.env.JWT_SECRET ?? '')) as JWTValidated;
        return verification;
    } catch (err) {
        console.error(err);
        return null;
    }
};

export default { check, sign };
