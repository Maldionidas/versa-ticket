const API_URL = "http://localhost:3000/api";

export const getAreas = async () => {
    const res = await fetch(`${API_URL}/catalogos/areas`);
    return res.json();
};

export const getPrioridades = async () => {
    const res = await fetch(`${API_URL}/catalogos/prioridades`);
    return res.json();
};

export const getCategoriasByArea = async (areaId) => {
    const res = await fetch(`${API_URL}/catalogos/categorias/${areaId}`);
    return res.json();
};