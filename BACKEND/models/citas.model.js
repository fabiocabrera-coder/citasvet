import { db } from '../database/connection.js';

// Inserta una cita
const createCita = async (fecha, descripcion, idCliente, idMascota, idTipoCita, idVeterinario) => {
    await verificarSolapamiento(fecha, idVeterinario, idTipoCita);

    const query = {
        text: `
            INSERT INTO CITAS (fecha, descripcion, id_Cliente, id_Mascota, id_Tipo_Cita, id_Veterinario)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `,
        values: [fecha, descripcion, idCliente, idMascota, idTipoCita, idVeterinario]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Obtener todas las citas de un cliente específico
const getCitasByCliente = async (idCliente) => {
    const query = {
        text: `
            SELECT 
                c.id AS cita_id,
                c.fecha,
                c.estado,
                c.descripcion,
                c.razon_cancelacion,
                c.actualizado_por,
                u.nombre AS veterinario_nombre,
                m.nombre AS mascota_nombre,
                t.nombre AS tipo_cita_nombre
            FROM CITAS c
            JOIN MASCOTAS m ON c.id_Mascota = m.id
            JOIN USUARIOS u ON c.id_Veterinario = u.id
            JOIN TIPO_CITA t ON c.id_Tipo_Cita = t.id
            WHERE c.id_Cliente = $1
              AND (
                  c.estado = 'Confirmada' 
                  OR c.estado = 'Completada' 
                  OR (
                      c.estado = 'Cancelada' 
                      AND EXISTS (
                          SELECT 1 FROM USUARIOS usr 
                          WHERE usr.nombre = c.actualizado_por 
                            AND usr.id_rol IN (2, 5)
                      )
                  )
              )
            ORDER BY c.fecha DESC
        `,
        values: [idCliente],
    };
    const { rows } = await db.query(query);
    return rows;
};

// Obtener todas las citas de un cliente
const getAllCitasByCliente = async (idCliente) => {
    const query = {
        text: `
            SELECT 
                c.id AS cita_id, -- ID de la cita
                c.fecha,
                c.estado,
                c.descripcion,
                u.nombre AS veterinario_nombre, -- Nombre del veterinario
                m.nombre AS mascota_nombre, -- Nombre de la mascota
                t.nombre AS tipo_cita_nombre, -- Tipo de cita
                t.precio AS tipo_cita_precio, -- Precio de la cita
                c.razon_cancelacion, -- Razón de la cancelación (si existe)
                c.actualizado_por -- Nombre de quien actualizó/canceló
            FROM CITAS c
            JOIN USUARIOS u ON c.id_Veterinario = u.id
            JOIN MASCOTAS m ON c.id_Mascota = m.id
            JOIN TIPO_CITA t ON c.id_Tipo_Cita = t.id
            WHERE c.id_Cliente = $1
            ORDER BY c.fecha DESC
             `
            ,
        values: [idCliente]
    };
    const { rows } = await db.query(query);
    return rows;
};

// Obtener citas de un veterinario específico (solo citas normales, excluyendo las de emergencia) con rol VET (id = 2)
const getCitasByVeterinario = async (idVeterinario) => {
    const query = {
        text: `
            SELECT 
                c.id AS cita_id,
                c.fecha,
                c.estado,
                c.descripcion,
                c.razon_cancelacion,
                c.actualizado_por,
                m.nombre AS mascota_nombre,
                u.nombre AS cliente_nombre,
                t.nombre AS tipo_cita_nombre
            FROM CITAS c
            JOIN MASCOTAS m ON c.id_Mascota = m.id
            JOIN USUARIOS u ON c.id_Cliente = u.id
            JOIN TIPO_CITA t ON c.id_Tipo_Cita = t.id
            JOIN USUARIOS v ON c.id_Veterinario = v.id
            WHERE c.id_Veterinario = $1
              AND t.id != 8  -- Excluir citas de emergencia (id_Tipo_Cita = 8)
              AND v.id_rol = 2  -- Solo veterinarios con rol VET (id_rol = 2)
              AND (
                  c.estado = 'Pendiente'
                  OR (
                      c.estado = 'Cancelada' 
                      AND EXISTS (
                          SELECT 1 FROM USUARIOS usr 
                          WHERE usr.nombre = c.actualizado_por 
                            AND usr.id_rol = 3
                      )
                  )
              )
            ORDER BY c.fecha DESC
        `,
        values: [idVeterinario],
    };
    const { rows } = await db.query(query);
    return rows;
};

// Actualizar el estado de una cita específica
const updateCitaEstado = async (id, nuevoEstado, actualizadoPor) => {
    const query = {
        text: `
            UPDATE CITAS
            SET estado = $1,
                actualizado_por = $2
            WHERE id = $3
            RETURNING *
        `,
        values: [nuevoEstado, actualizadoPor, id]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Cancelar una cita específica
const cancelarCita = async (id, razonCancelacion, actualizadoPor) => {
    const query = {
        text: `
            UPDATE CITAS
            SET estado = 'Cancelada',
                razon_cancelacion = $2,
                actualizado_por = $3
            WHERE id = $1
            RETURNING *
        `,
        values: [id, razonCancelacion, actualizadoPor]
    };
    const { rows } = await db.query(query);
    return rows[0];
};


// Crear una cita de emergencia con asignación automática de veterinario de emergencia
const createCitaEmergencia = async (idCliente, idMascota) => {
    const fecha = new Date();
    const idVeterinario = await asignarVetEmCitaEmergencia(fecha);
    await verificarSolapamientoEmergencia(idVeterinario);
    
    const query = {
        text: `
            INSERT INTO CITAS (fecha, descripcion, estado, id_Cliente, id_Mascota, id_Tipo_Cita, id_Veterinario)
            VALUES ($1, 'Cita de emergencia', 'Emergencia', $2, $3, 8, $4)
            RETURNING *
        `,
        values: [fecha, idCliente, idMascota, idVeterinario]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

const getCitaEmergencia = async (idCliente) => {
    const query = {
        text: `
            SELECT 
                c.id,
                c.fecha, 
                c.estado, 
                v.nombre AS veterinario_nombre,
                cl.nombre AS cliente_nombre,
                m.nombre AS mascota_nombre,
                t.nombre AS tipo_cita_nombre
            FROM CITAS c
            JOIN USUARIOS v ON c.id_Veterinario = v.id
            JOIN USUARIOS cl ON c.id_Cliente = cl.id
            JOIN MASCOTAS m ON c.id_Mascota = m.id
            JOIN TIPO_CITA t ON c.id_Tipo_Cita = t.id
            WHERE c.id_Cliente = $1 AND c.estado = 'Emergencia'
            ORDER BY c.fecha DESC
            LIMIT 1
        `,
        values: [idCliente]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Obtener citas de emergencia para veterinarios con rol de emergencia
const getCitasEmergenciaByVeterinario = async (idVeterinario) => {
    const query = {
        text: `
            SELECT 
                c.id,
                c.fecha, 
                c.descripcion,
                c.estado, 
                u.nombre AS cliente_nombre, 
                m.nombre AS mascota_nombre, 
                t.nombre AS tipo_cita_nombre
            FROM CITAS c
            JOIN MASCOTAS m ON c.id_Mascota = m.id
            JOIN USUARIOS u ON c.id_Cliente = u.id
            JOIN TIPO_CITA t ON c.id_Tipo_Cita = t.id
            JOIN USUARIOS v ON c.id_Veterinario = v.id
            WHERE c.id_Veterinario = $1 
              AND v.id_rol = 5 
              AND c.id_Tipo_Cita = 8
            ORDER BY c.fecha
        `,
        values: [idVeterinario]
    };
    const { rows } = await db.query(query);
    return rows;
};

// Obtener todas las citas para veterinarios con rol 2
const getCitasNormalesByVeterinario = async (idVeterinario) => {
    const query = {
        text: `
            SELECT 
                c.id AS cita_id,
                c.fecha, 
                c.descripcion,
                c.estado, 
                u.nombre AS cliente_nombre, 
                m.nombre AS mascota_nombre, 
                t.nombre AS tipo_cita_nombre,
                c.razon_cancelacion,
                c.actualizado_por
            FROM CITAS c
            JOIN MASCOTAS m ON c.id_Mascota = m.id
            JOIN USUARIOS u ON c.id_Cliente = u.id
            JOIN TIPO_CITA t ON c.id_Tipo_Cita = t.id
            JOIN USUARIOS v ON c.id_Veterinario = v.id
            WHERE c.id_Veterinario = $1 
              AND v.id_rol = 2
            ORDER BY c.fecha
        `,
        values: [idVeterinario]
    };
    const { rows } = await db.query(query);
    return rows;
};

// Asignar veterinario de emergencia (id_rol = 5) a una cita de emergencia
const asignarVetEmCitaEmergencia = async (fecha) => {
    const query = {
        text: `
            SELECT h.id_Veterinario
            FROM HORARIO h
            JOIN USUARIOS u ON u.id = h.id_Veterinario
            WHERE u.id_rol = 5
              AND $1::timestamp BETWEEN h.hora_inicio AND h.hora_fin -- Validar que el veterinario esté en su horario
              AND NOT EXISTS (
                  SELECT 1
                  FROM CITAS c
                  WHERE c.id_Veterinario = h.id_Veterinario
                    AND c.estado IN ('Emergencia', 'Confirmada', 'Pendiente') -- Evitar conflictos con citas activas
              )
            ORDER BY (
                SELECT COUNT(*)
                FROM CITAS c
                WHERE c.id_Veterinario = h.id_Veterinario
                  AND c.estado IN ('Emergencia', 'Confirmada', 'Pendiente')
            ) ASC
            LIMIT 1
        `,
        values: [fecha]
    };
    const { rows } = await db.query(query);
    if (rows.length === 0) {
        throw new Error('No se encontró un veterinario de emergencia disponible para la fecha y hora seleccionadas.');
    }
    return rows[0].id_veterinario;
};

const verificarSolapamientoEmergencia = async (idVeterinario) => {
    const query = {
        text: `
            SELECT 1
            FROM CITAS c
            WHERE c.id_Veterinario = $1
              AND c.estado IN ('Emergencia')
            LIMIT 1
        `,
        values: [idVeterinario]
    };
    const { rows } = await db.query(query);

    if (rows.length > 0) {
        throw new Error('El veterinario ya tiene una cita de emergencia activa.');
    }
};

// Método para verificar solapamiento de citas
const verificarSolapamiento = async (fecha, idVeterinario, idTipoCita) => {
    const queryHorarios = {
        text: `
            SELECT hora_inicio, hora_fin
            FROM HORARIO
            WHERE id_Veterinario = $1
            AND $2::timestamp BETWEEN hora_inicio AND hora_fin
        `,
        values: [idVeterinario, fecha]
    };

    const resultHorarios = await db.query(queryHorarios);
    if (resultHorarios.rows.length === 0) {
        throw new Error('El horario seleccionado no está dentro de la disponibilidad del veterinario.');
    }

    const querySolapamiento = {
        text: `
            WITH cita_duracion AS (
                SELECT duracion
                FROM TIPO_CITA
                WHERE id = $3
            ),
            nueva_cita AS (
                SELECT $1::timestamp AS inicio,
                       ($1::timestamp + COALESCE(duracion, INTERVAL '0') + INTERVAL '10 minutes') AS fin
                FROM cita_duracion
            )
            SELECT 1
            FROM CITAS c
            JOIN nueva_cita nc ON TRUE
            WHERE c.id_Veterinario = $2
              AND c.estado IN ('Pendiente', 'Confirmada', 'Completada', 'Emergencia')
              AND (
                  nc.inicio BETWEEN c.fecha AND (c.fecha + COALESCE((SELECT duracion FROM TIPO_CITA WHERE id = c.id_Tipo_Cita), INTERVAL '0') + INTERVAL '10 minutes')
                  OR c.fecha BETWEEN nc.inicio AND nc.fin
              )
            LIMIT 1
        `,
        values: [fecha, idVeterinario, idTipoCita]
    };

    const resultSolapamiento = await db.query(querySolapamiento);
    if (resultSolapamiento.rows.length > 0) {
        throw new Error('El horario seleccionado se solapa con otra cita existente.');
    }
};

// Obtener disponibilidad semanal del veterinario
const getDisponibilidadSemanalVeterinario = async (idVeterinario) => {
    const query = {
        text: `
            SELECT h.hora_inicio, h.hora_fin
            FROM HORARIO h
            WHERE h.id_Veterinario = $1
            ORDER BY h.hora_inicio ASC
        `,
        values: [idVeterinario]
    };
    const { rows } = await db.query(query);

    if (rows.length === 0) {
        throw new Error('No se encontró horario registrado para este veterinario.');
    }

    // Mapeamos el resultado a un formato de intervalo
    return rows.map(row => ({
        inicio: row.hora_inicio,
        fin: row.hora_fin
    }));
};

// Obtener lista de veterinarios con rol normal (rol = 2)
const getVeterinariosDisponibles = async () => {
    const query = {
        text: `
            SELECT id, nombre
            FROM USUARIOS
            WHERE id_rol = 2
        `
    };
    const { rows } = await db.query(query);
    return rows;
};

// Obtener citas ocupadas con duración variable
const getCitasOcupadas = async (idVeterinario) => {
    const query = {
        text: `
            SELECT c.fecha, t.duracion
            FROM CITAS c
            JOIN TIPO_CITA t ON c.id_Tipo_Cita = t.id
            WHERE c.id_Veterinario = $1
              AND c.estado IN ('Pendiente', 'Confirmada', 'Completada')
        `,
        values: [idVeterinario]
    };
    
    try {
        const { rows } = await db.query(query);
        
        return rows.map(row => {
            const inicio = new Date(row.fecha);
            const duracionMs = row.duracion
                ? (row.duracion.hours * 60 * 60 * 1000 || 0) + (row.duracion.minutes * 60 * 1000 || 0)
                : 0; // Manejo de duracion nula
            const fin = new Date(inicio.getTime() + duracionMs + 10 * 60000); // Añadir duración y 10 minutos
            
            return {
                inicio,
                fin
            };
        });
    } catch (error) {
        console.error("Error en getCitasOcupadas:", error);
        throw new Error("Error al obtener citas ocupadas del veterinario");
    }
};

// Obtener una cita por ID
const findCitaById = async (idCita) => {
    const query = {
        text: `
            SELECT fecha, id_veterinario, id_tipo_cita, id_cliente
            FROM CITAS 
            WHERE id = $1
        `,
        values: [idCita]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Exportar el modelo de citas, que incluye las funciones para crear, obtener, actualizar y eliminar citas.
export const CitasModel = {
    createCita,
    getCitasByCliente,
    updateCitaEstado,
    cancelarCita,
    getCitasByVeterinario,
    createCitaEmergencia,
    getCitaEmergencia,
    getCitasEmergenciaByVeterinario,
    getDisponibilidadSemanalVeterinario,
    getVeterinariosDisponibles,
    getCitasOcupadas,
    getAllCitasByCliente,
    findCitaById,
    getCitasNormalesByVeterinario
};