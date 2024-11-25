import { db } from '../database/connection.js';

// Obtener todos los tipos de citas disponibles exluyendo la que tiene el id de 8
const getAllTipoCitas = async () => {
    const query = {
        text: `
            SELECT id, nombre, duracion, precio 
            FROM TIPO_CITA
            WHERE id != $1
        `,
        values: [8]
    };
    const { rows } = await db.query(query);
    return rows;
};

// Busca un tipo de cita segun su id
const findTipoCitaById = async (id) => {
    const query = {
        text: `
        SELECT nombre 
        FROM TIPO_CITA 
        WHERE id = $1
        `,
        values: [id]
    };
    const { rows } = await db.query(query);
    return rows[0]; 
};

// Exportar todas las funciones del modelo de tipos de cita
export const TipoCitaModel = {
    getAllTipoCitas,
    findTipoCitaById
};

