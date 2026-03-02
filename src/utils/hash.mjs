import bcrypt from 'bcrypt';

export async function hashPassword(password){
    const SALT_ROUNDS = 12;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return hashedPassword;
}