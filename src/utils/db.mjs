import { Pool } from "pg";

const pool = new Pool({
    user: 'marini',
    host: 'dpg-d7cgb0hj2pic73bsgm10-a.oregon-postgres.render.com',
    database: 'poly_database_p21f',
    password: 'K8T2DkKWMF6ZS6tpcB6aGxdU12ZF81Iv',
    port: 5432,
    ssl: true
});

export default pool;