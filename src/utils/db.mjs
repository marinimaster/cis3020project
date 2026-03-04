import { Pool } from "pg";

const pool = new Pool({
    user: 'admin',
    host: 'dpg-d6jgjpvtskes738n0m90-a.oregon-postgres.render.com',
    database: 'lang_dashboard_db',
    password: 'p1GglHuJcopkpIak80xoAIIfoTutYTpb',
    port: 5432,
    ssl: true
});

export default pool;