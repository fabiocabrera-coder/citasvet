import { db } from '../database/connection.js';

// Crear un movimiento
const createMovimiento = async (id_usuario, tipo_accion, fecha) => {
    const query = {
        text: `
        INSERT INTO MOVIMIENTOS (id_usuario, tipo_accion, fecha)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        values: [id_usuario, tipo_accion, fecha]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Obtener movimientos excepto los realizados por usuarios con rol 1 (Administrador)
const getAllMovimientosExceptAdmin = async () => {
    const query = {
        text: `
        SELECT 
            m.tipo_accion,
            m.fecha,
            u.nombre AS usuario_nombre,
            r.nombre AS rol_nombre
        FROM MOVIMIENTOS m
        JOIN USUARIOS u ON m.id_usuario = u.id
        JOIN ROLES r ON u.id_rol = r.id
        WHERE u.id_rol != 1
        ORDER BY m.fecha DESC
        `
    };
    const { rows } = await db.query(query);
    return rows;
};

// Obtener movimientos por rol
const getMovimientosByRol = async (idRol) => {
    const query = {
        text: `
        SELECT 
            m.tipo_accion,
            m.fecha,
            u.nombre AS usuario_nombre,
            r.nombre AS rol_nombre
        FROM MOVIMIENTOS m
        JOIN USUARIOS u ON m.id_usuario = u.id
        JOIN ROLES r ON u.id_rol = r.id
        WHERE u.id_rol = $1
        ORDER BY m.fecha DESC
        `,
        values: [idRol]
    };
    const { rows } = await db.query(query);
    return rows;
};

// Exporta todas las funciones del modelo de movimientos
export const MovimientosModel = {
    createMovimiento,
    getAllMovimientosExceptAdmin,
    getMovimientosByRol
};