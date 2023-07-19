const pool = require('./DBPool');
const HttpError = require('../HttpError');

const getLoginByUserAccountId = async (userId, client) => {
    const result = await (client || pool).query(
        `SELECT user_id, password_hash, password_salt, user_full_name, is_active, is_admin
         FROM user_account
         WHERE user_id = $1`,
        [userId]
    );

    const row = result.rows[0];
    if (row) {
        return {
            userId: row.user_id,
            passwordHash: row.password_hash,
            passwordSalt: row.password_salt,
            userFullName: row.user_full_name,
            isActive: row.is_active,
            isAdmin: row.is_admin
        };
    }
    return undefined;
};
exports.getLoginByUserAccountId = getLoginByUserAccountId;


const getUserAccount = async (userId, client) => {
    const result = await (client || pool).query(
        `SELECT user_account_id, user_full_name, is_active, is_admin 
        FROM user_account
        WHERE
            user_account_id = $1`,
        [userId]
    );

    const row = result.rows[0];

    if (row) {
        return {
            userId: row.user_account_id,
            name: row.user_full_name,
            isActive: row.is_active,
            isAdmin: row.is_admin
        };
    }

    return undefined;
};
exports.getUserAccount = getUserAccount;

const createUserAccount = async (userId, passwordHash, passwordSalt, name) => {

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingUserAccount = await getLoginByUserAccountId(userId, client);
        if (existingUserAccount) {
            throw new HttpError(409, `Un compte avec l'identifiant ${userId} existe déjà`);
        }

        `INSERT INTO user_account (user_account_id, user_full_name) 
        VALUES ($1, $2)`
        const result = await (client || pool).query(
            `INSERT INTO user_account (user_id, password_hash, password_salt, user_full_name) 
             VALUES ($1, $2, $3, $4)`,
            [userId, passwordHash, passwordSalt, name]
        );

        const userAccount = getLoginByUserAccountId(userId, client);

        client.query('COMMIT');

        return userAccount;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};
exports.createUserAccount = createUserAccount;