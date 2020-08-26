import bcrypt from 'bcryptjs';

/**
 * Compara uma senha dada com um hash dado;
 * @param given_password password dado
 * @param password hash do password;
 */
const compare = async (password: string, given_password: string): Promise<boolean> =>
    bcrypt.compare(given_password, password);

/**
 * Encripta um password utilizando bcrypt;
 * @param password password dado;
 */
const encrypt = async (password: string): Promise<string> => bcrypt.hash(password, 10);

export default { compare, encrypt };
