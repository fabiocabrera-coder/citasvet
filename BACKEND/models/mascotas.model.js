import { db } from '../database/connection.js';

// Inserta una mascota para un cliente
const createMascota = async (nombre, especie, raza, fechaNacimiento, id_Cliente) => {
    const query = {
        text: `
        INSERT INTO MASCOTAS (nombre, especie, raza, fechaNacimiento, id_Cliente)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        values: [nombre, especie, raza, fechaNacimiento, id_Cliente]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Selecciona todas las mascotas asociadas a un cliente
const getMascotasByCliente = async (id_Cliente) => {
    const query = {
        text: `
        SELECT * FROM MASCOTAS
        WHERE id_Cliente = $1
        `,
        values: [id_Cliente]
    };
    const { rows } = await db.query(query);
    return rows;
};

// Actualizar el estado de una mascota
const updateMascotaEstado = async (id, estado) => {
    const query = {
        text: `
        UPDATE MASCOTAS
        SET estado = $1
        WHERE id = $2
        RETURNING *
        `,
        values: [estado, id]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Busca una mascota por su id
const findMascotaById = async (id) => {
    const query = {
        text: `
        SELECT * 
        FROM MASCOTAS 
        WHERE id = $1
        `,
        values: [id]
    };
    const { rows } = await db.query(query);
    return rows[0]; 
};

// Exporta todas las funciones del modelo de mascotas
export const MascotasModel = {
    createMascota,
    getMascotasByCliente,
    updateMascotaEstado,
    findMascotaById
};