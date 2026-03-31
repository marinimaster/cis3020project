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
            return response.status(403).redirect("/index.html?error");
        }

        next();
    };
}

app.get("/dashboard", requireRole("standard"), (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'dashboard.html'));
});

app.get("/billing", requireRole("standard"), (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'billing.html'));
});

app.get("/admin/dashboard", requireRole("admin"), (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'admin-dashboard.html'));
});

app.get("/api/students", requireRole("admin"), async (request, response) => {

    const result = await pool.query(
        'SELECT COUNT (*) FROM app.users WHERE role = $1', ['standard']
    );

    const studentCount = result.rows[0].count;

    response.send(studentCount);

});

app.get("/api/balance", requireRole("standard"), async (request, response) => {

    const result = await pool.query(
        'SELECT * FROM app.wallets WHERE user_id = $1', [request.session.user.id]
    );

    response.status(200).json(result.rows[0].balance);
});

app.get("/api/admin/revenue", requireRole("admin"), async (request, response) => {
    const result = await pool.query(
        'SELECT SUM(balance) FROM app.wallets'
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
    const { username, password } = request.body;

    const user = await pool.query(
        'SELECT * FROM app.users WHERE username = $1', [username]
    );

    if(user.rows.length === 0){
        return response.sendStatus(404);
    }

    //Password validation
    const hash = user.rows[0].password;
    const isMatch = await bcrypt.compare(password, hash);

    if(!isMatch){
        return response.sendStatus(403);
    }

    request.session.user = {
        id: user.rows[0].id,
        username: user.rows[0].username,
        role: user.rows[0].role
    };

    response.status(200).send("Validated");
});

app.post("/api/login/admin", async (request, response) => {
    const { username , password } = request.body;

    const user = await pool.query(
        'SELECT * FROM app.users WHERE username = $1', [username]
    );

    if(!user){
        return response.sendStatus(404);
    }

    const hash = user.rows[0].password;
    const isMatch = await bcrypt.compare(password, hash);

    if(!isMatch){
        return response.sendStatus(403);
    }

    request.session.user = {
        id: user.rows[0].id,
        username: user.rows[0].username,
        role: user.rows[0].role
    }
    response.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
