const { neon, Pool } = require("@neondatabase/serverless");

// Para consultas simples y rápidas (HTTP)
const sql = neon(process.env.DATABASE_URL);

// Para transacciones complejas (WebSockets)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = { sql, pool };