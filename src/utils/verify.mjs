import bcrypt from 'bcrypt';

export async function verifyPassword(entered_password, stored_hash){
    return await bcrypt.compare(entered_password, stored_hash);
}