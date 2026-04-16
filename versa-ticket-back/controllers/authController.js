const { sql } = require("../config/db");
const bcrypt = require("bcryptjs");  
const jwt = require("jsonwebtoken");

//registro de usuario
exports.registerUser = async (req, res) => {
    try {
        const { email, password, nombre, apellido } = req.body;
        
        console.log("📝 Registrando usuario:", { email, nombre, apellido });

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar usuario
        const result = await sql`
            INSERT INTO users 
            (email, password_hash, nombre, apellido, rol_id, area_id, activo)
            VALUES (${email}, ${hashedPassword}, ${nombre}, ${apellido}, 1, 1, true)
            RETURNING id, email, nombre, apellido
        `;
        
        console.log("✅ Usuario registrado:", result[0]);

        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            user: result[0]
        });

    } catch (error) {
        console.error("❌ Error en registro:", error);
        
        if (error.code === '23505') { 
            return res.status(400).json({ success: false, message: "El email ya está registrado" });
        }
        
        if (error.code === '23503') { 
            return res.status(400).json({ success: false, message: "Error de referencia: verifica que existan roles y áreas" });
        }
        
        res.status(500).json({ success: false, message: "Error al crear usuario: " + error.message });
    }
};

//login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    try {
        // 🚀 MEJORA SENIOR: Se agregó el INNER JOIN para traer los permisos y el nombre del rol.
        // Esto es VITAL para que los hooks de React (usePermissions) oculten o muestren botones.
        const users = await sql`
            SELECT u.id, u.nombre, u.email, u.password_hash, u.rol_id, u.activo, 
                   r.nombre as rol_nombre, r.permisos
            FROM users u 
            INNER JOIN roles r ON u.rol_id = r.id
            WHERE u.email = ${email}
        `;

        if (users.length === 0) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const user = users[0];

        if (!user.activo) {
            return res.status(401).json({ message: "Usuario desactivado" });
        }

        // Validación segura con bcrypt
        const passwordValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordValid) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Generar token JWT inyectando los permisos en el payload
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                nombre: user.nombre,
                rol_id: user.rol_id,
                rol: user.rol_nombre,
                permisos: user.permisos
            },
            process.env.JWT_SECRET || "mi-secreto",
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login exitoso",
            token,
            user: { // Coincide con tu AuthContext de React
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol_id: user.rol_id,
                rol: user.rol_nombre,
                permisos: user.permisos
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};