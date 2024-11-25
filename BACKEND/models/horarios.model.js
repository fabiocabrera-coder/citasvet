import { db } from '../database/connection.js';

// Inserta un nuevo horario para un veterinario
const createHorario = async (hora_inicio, hora_fin, id_Veterinario) => {
    const query = {
        text: `
        INSERT INTO HORARIO (hora_inicio, hora_fin, id_Veterinario)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        values: [hora_inicio, hora_fin, id_Veterinario]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Obtiene todos los horarios de un veterinario específico
const getHorariosByVeterinario = async (id_Veterinario) => {
    const query = {
        text: `
        SELECT * FROM HORARIO WHERE id_Veterinario = $1
        `,
        values: [id_Veterinario]
    };
    const { rows } = await db.query(query);
    return rows;
};

// Elimina un horario específico
const deleteHorario = async (id) => {
    const query = {
        text: `
        DELETE FROM HORARIO WHERE id = $1
        RETURNING *
        `,
        values: [id]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Busca un horario según el id de un veterinario
const findHorarioById = async (id) => {
        const query = {
            text: `
                SELECT id, hora_inicio, hora_fin, id_veterinario 
                FROM horario
                WHERE id = $1
            `,
            values: [id]
        };

        const { rows } = await db.query(query);
        return rows[0];
};

// Exporta todas las funciones del modelo de horarios
export const HorariosModel = {
    createHorario,
    getHorariosByVeterinario,
    deleteHorario,
    findHorarioById
};