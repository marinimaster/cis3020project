import pool from "./db.mjs";

export const getUsers = async(request, response) => {
    try{
        const result = await pool.query('SELECT * FROM app.users');
        response.status(200).json(result.rows);
    }
    catch(error){
        console.error(error);
        response.status(500).send('Server Error')
    }
};