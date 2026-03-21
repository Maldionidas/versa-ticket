const sql = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ 
            message: "Email y contraseña son requeridos" 
        });
    }

    try {
        // Buscar usuario en la tabla "users"
        const users = await sql`
            SELECT id, nombre, email, password_hash, rol_id, activo 
            FROM users 
            WHERE email = ${email}
        `;

        if (users.length === 0) {
            return res.status(401).json({ 
                message: "Credenciales inválidas" 
            });
        }

        const user = users[0];

        // Verificar si usuario está activo
        if (!user.activo) {
            return res.status(401).json({ 
                message: "Usuario desactivado" 
            });
        }

        // Verificar contraseña (bcrypt)
        const passwordValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordValid) {
            return res.status(401).json({ 
                message: "Credenciales inválidas" 
            });
        }

        // Generar token JWT
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

        // Respuesta exitosa
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
        res.status(500).json({ 
            message: "Error en el servidor" 
        });
    }
};