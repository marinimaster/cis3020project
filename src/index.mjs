import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import pool from './utils/db.mjs';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: "CYpR3Ss%010509",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

function requireRole(role) {
    return (request, response, next) => {
        if (!request.session.user) {
            return response.redirect("/index.html");
        }

        if (request.session.user.role !== role) {
            return response.redirect("/index.html");
        }

        next();
    };
}

async function loginHandler(request, response, expectedRole) {
    const { username, password } = request.body;

    const user = await pool.query(
        'SELECT * FROM users WHERE username = $1', [username]
    );

    if (user.rows.length === 0) {
        return response.sendStatus(404);
    }

    //Password validation
    const hash = user.rows[0].password;
    const isMatch = await bcrypt.compare(password, hash);

    //Role Validation
    const role = user.rows[0].role;
    const roleMatch = role === expectedRole;

    if (!isMatch || !roleMatch) {
        return response.sendStatus(403);
    }

    request.session.user = {
        id: user.rows[0].id,
        username: user.rows[0].username,
        role: user.rows[0].role
    };

    response.status(200).send("Validated");
};

app.get("/dashboard", requireRole("standard"), (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'dashboard.html'));
});

app.get("/billing", requireRole("standard"), (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'billing.html'));
});

app.get("/admin/dashboard", requireRole("admin"), (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'admin-dashboard.html'));
});

app.get("/admin/manage-users", requireRole("admin"), (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'manage-users.html'));
});

app.get("/api/students", requireRole("admin"), async (request, response) => {

    const result = await pool.query(
        'SELECT COUNT (*) FROM users WHERE role = $1', ['standard']
    );

    const studentCount = result.rows[0].count;

    response.send(studentCount);

});

app.get("/api/balance", requireRole("standard"), async (request, response) => {

    const result = await pool.query(
        'SELECT * FROM wallets WHERE user_id = $1', [request.session.user.id]
    );

    response.status(200).json(result.rows[0].balance);
});

app.get("/api/admin/revenue", requireRole("admin"), async (request, response) => {
    const result = await pool.query(
        'SELECT SUM(balance) FROM wallets'
    );

    const revenue = result.rows[0].sum;

    response.status(200).json(revenue);
});

app.get("/logout", (request, response) => {
    request.session.destroy(() => {
        response.redirect("/index.html");
    });
});

// ---------------------POST---------------------------

app.post("/api/login/standard", async (request, response) => {
    loginHandler(request, response, 'standard');
});

app.post("/api/login/admin", async (request, response) => {
    loginHandler(request, response, 'admin');
});

app.post("/admin/create-user", async (request, response) => {
    const { username, password } = request.body;
    const hash = await bcrypt.hash(password, 12)

    try {
        //----------------BEGIN IS NEEDED TO ROLLBACK-------------------------------------
        await pool.query('BEGIN');

        const findUser = await pool.query(
            'SELECT * FROM users WHERE username = $1', [username]
        );

        //----------IMPORTANT TO FIND USER IF USER EXISTS FIRST-------------------------
        if(findUser.rows.length > 0){
            await pool.query('ROLLBACK');
            return response.status(403).json('User already exists');
        }

        //------------------IF IT DOESN'T, WE INSERT----------------------------
        const insertUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, hash]
        );

        //'RETURNING id' makes it so it returns the ID as soon as it's created
        //so it can be used like below
        //                                   here
        const newUserId = insertUser.rows[0].id;

        await pool.query(
            'INSERT INTO wallets (user_id) VALUES ($1)', [newUserId]
        );

        await pool.query('COMMIT');
        
        return response.status(200).json('User Created')
    }
    catch (error) {
        await pool.query('ROLLBACK');
        console.error(error);
        response.status(500).json('Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
