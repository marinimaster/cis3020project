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

function requireAuth(request, response, next) {
    if (!request.session.user) {
        return response.redirect("/index.html");
    };

    next();
};

app.get("/dashboard", requireAuth, (request, response) => {
    response.sendFile(path.join(__dirname, '..', 'private', 'dashboard.html'));
});

app.get("/api/students", async (request, response) => {
    
    const result = await pool.query(
        'SELECT COUNT (*) FROM app.users WHERE role = $1', ['standard']
    );

    const studentCount = result.rows[0].count;

    response.send(studentCount);

});
app.get("/logout", (request, response) => {
    request.session.destroy(() => {
        response.redirect("/index.html");
    });
});

// ---------------------POST---------------------------

app.post("/api/login", async (request, response) => {
    const { username, password } = request.body;

    const result = await pool.query(
        'SELECT * FROM app.users WHERE username = $1', [username]
    );

    const userAmount = result.rows.length;

    if(result.rows.length === 0){
        return response.status(404).send('User not found.')
    }

    //Password validation
    const hash = result.rows[0].password;
    const isMatch = await bcrypt.compare(password, hash);

    if(!isMatch){
        return response.status(403).send('Invalid credentials');
    }

    request.session.user = { username: result.rows[0].username };
    response.status(200).send(userAmount);
});

/*app.post("/api/login", async (request, response) => {
    const { username, password } = request.body;

    const userVerified = users.find(
        (u) => u.username === username
    );

    if (!userVerified) {
        return response.status(401).redirect("/index.html?error=invalid-credentials");
    }

    const isMatch = await verifyPassword(password, userVerified.password);

    if(!isMatch){
        return response.status(401).redirect("/index.html?error=invalid-credentials");
    }

    request.session.user = { username: userVerified.username };
    return response.redirect("/dashboard")
});*/


app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});