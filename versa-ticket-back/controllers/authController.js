const sql = require("../config/db");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            message: "Email y contraseña son requeridos" 
        });
    }

    try {
        const users = await sql`
            SELECT id, nombre, email, password_hash, rol_id, activo 
            FROM users 
            WHERE email = ${email}
        `;

        if (users.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = users[0];

        if (!user.activo) {
            return res.status(401).json({ message: "Usuario desactivado" });
        }

        // Comparación directa SIN bcrypt
        if (password !== user.password_hash) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                nombre: user.nombre,
                rol_id: user.rol_id
            },
            process.env.JWT_SECRET || "mi-secreto",
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login exitoso",
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol_id: user.rol_id
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};