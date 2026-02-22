import express from 'express';
import session from 'express-session';
import path from 'path';
import {fileURLToPath} from 'url';
import { users } from './utils/users.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("docs"));
app.use(express.urlencoded( {extended: true}) );
app.use(
    session({
        secret: "CYpR3Ss%010509",
        resave: false,
        saveUninitialized: true,
        cookie: {secure: false}
    })
);

function requireAuth(request, response, next){
    if(!request.session.user){
        return response.redirect("/login.html");
    };

    next();
};

app.get("/dashboard", requireAuth, (request, response) => {
    response.sendFile(path.join(__dirname, '..','private', 'dashboard.html'));
});
app.get("/api/users", (request, response) => {
    response.send(users);
});
app.get("/api/login/", (request, response) => {
    const {username, password} = request.query;

    const userVerified = users.find(
        (u) => u.username === username && u.password === password 
    );

    if(userVerified) {
        request.session.user = userVerified;
        console.log(request.query)
        return response.send("Fake dashboard");
    }
    return response.status(401).send("Invalid credentials. (GET)");
});
app.get("/logout", (request, response) => {
    request.session.destroy(() => {
        response.redirect("/login.html");
    });
});

//POST
app.post("/api/login", (request, response) => {
    const {username, password} = request.body;

    const userVerified = users.find(
        (u) => u.username === username && u.password === password
    );

    if(userVerified){
        request.session.user = { username: userVerified.username };
        return response.redirect("/dashboard")
    }

    return response.status(401).redirect("/login.html?error=invalid-credentials");
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});