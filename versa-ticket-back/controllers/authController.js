const { neon } = require("@neondatabase/serverless");
const bcrypt = require('bcrypt');

// Asumiendo que tienes la conexión configurada
const sql = neon(process.env.DATABASE_URL);

exports.registerUser = async (req, res) => {
    try {
        const { email, password, nombre, apellido } = req.body;
        
        console.log("📝 Registrando usuario:", { email, nombre, apellido });

        // Hashear password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Primero verificar que existe rol_id=1 y area_id=1
        // Insertar usuario
        const result = await sql`
            INSERT INTO users 
            (email, password_hash, nombre, apellido, rol_id, area_id, activo)
            VALUES (${email}, ${hashedPassword}, ${nombre}, ${apellido}, 1, 1, true)
            RETURNING id, email, nombre, apellido
        `;
        
        console.log("✅ Usuario registrado:", result[0]);

        res.json({
            success: true,
            message: "Usuario creado exitosamente",
            user: result[0]
        });

    } catch (error) {
        console.error("❌ Error en registro:", error);
        
        // Mensajes más específicos
        if (error.code === '23505') { // Código de error por unique violation
            return res.status(400).json({
                success: false,
                message: "El email ya está registrado"
            });
        }
        
        if (error.code === '23503') { // Violación de llave foránea
            return res.status(400).json({
                success: false,
                message: "Error de referencia: verifica que existan roles y áreas"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error al crear usuario: " + error.message
        });
    }
};