const { sql }  = require("../config/db");
const getAreas = async (req, res) => {
  try {
    const result = await sql`SELECT * FROM areas ORDER BY id`;
    res.json(result);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error obteniendo áreas" })
  }
}

const createArea = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body

    const result = await sql`
      INSERT INTO areas (nombre, descripcion) VALUES (${nombre}, ${descripcion}) RETURNING *
    `

    res.json(result[0]) // 🔥 FIX

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error creando área" })
  }
}

const updateArea = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, activo } = req.body

    const result = await sql.query(
      "UPDATE areas SET nombre=$1, descripcion=$2, activo=$3 WHERE id=$4 RETURNING *",
      [nombre, descripcion, activo, id]
    )

    res.json(result[0]) // 🔥 FIX

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error actualizando área" })
  }
}

const deleteArea = async (req, res) => {
  try {
    const { id } = req.params

    await sql.query("DELETE FROM areas WHERE id=$1", [id])

    res.json({ message: "Área eliminada" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error eliminando área" })
  }
}

const getAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql.query("SELECT * FROM areas WHERE id = $1", [id]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "Área no encontrada" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo área" });
  }
};

module.exports = {
  getAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea
};