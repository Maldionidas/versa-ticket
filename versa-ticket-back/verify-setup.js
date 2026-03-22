require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function verifySetup() {
    try {
        console.log("🔍 Verificando configuración de la base de datos...\n");
        
        // 1. Verificar roles
        const roles = await sql`SELECT * FROM roles`;
        console.log("📋 Roles encontrados:", roles.length);
        if (roles.length === 0) {
            console.log("⚠️  No hay roles. Insertando rol básico...");
            await sql`INSERT INTO roles (nombre, descripcion) VALUES ('Usuario', 'Rol básico')`;
        } else {
            console.log("✅ Roles:", roles);
        }
        
        // 2. Verificar áreas
        const areas = await sql`SELECT * FROM areas`;
        console.log("\n📋 Áreas encontradas:", areas.length);
        if (areas.length === 0) {
            console.log("⚠️  No hay áreas. Insertando área básica...");
            await sql`INSERT INTO areas (nombre, descripcion) VALUES ('Soporte TI', 'Área de soporte')`;
        } else {
            console.log("✅ Áreas:", areas);
        }
        
        // 3. Probar inserción
        console.log("\n🧪 Probando inserción de usuario...");
        const testEmail = `test_${Date.now()}@test.com`;
        const testResult = await sql`
            INSERT INTO users (email, password_hash, nombre, apellido, rol_id, area_id)
            VALUES (${testEmail}, 'test_hash', 'Test', 'User', 1, 1)
            RETURNING id, email
        `;
        console.log("✅ Inserción de prueba exitosa:", testResult[0]);
        
        // Limpiar el usuario de prueba
        await sql`DELETE FROM users WHERE email = ${testEmail}`;
        console.log("✅ Usuario de prueba eliminado");
        
        console.log("\n🎉 Todo configurado correctamente!");
        
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        process.exit();
    }
}

verifySetup();