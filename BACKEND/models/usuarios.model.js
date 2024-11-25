import { db } from '../database/connection.js';

// Inserta un nuevo usuario en la base de datos y devuelve su información básica.
const create = async ({ nombre, correo, contrasena, id_rol }) => {
    const query = {
        text: `
        INSERT INTO usuarios (nombre, correo, contrasena, id_rol)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nombre, correo, id_rol
        `,
        values: [nombre, correo, contrasena, id_rol]
    }
    const { rows } = await db.query(query);
    return rows[0];
}

// Busca un usuario por su correo y devuelve el primer resultado.
const findOneByEmail = async (correo) => {
    const query = {
        text: `
        SELECT * FROM usuarios
        WHERE correo = $1
        `,
        values: [correo]
    }
    const { rows } = await db.query(query);
    return rows[0];
}

// Obtiene todos los usuarios con rol de veterinario o veterinario de emergencia.
const findAllVets = async () => {
    const query = {
        text: `
        SELECT usuarios.id, usuarios.nombre, usuarios.correo, usuarios.estado, roles.nombre AS rol
        FROM usuarios
        JOIN roles ON usuarios.id_rol = roles.id
        WHERE usuarios.id_rol = 2 OR usuarios.id_rol = 5
        `
    };
    const { rows } = await db.query(query);
    return rows;
}

// Obtiene todos los usuarios con rol de cliente.
const findAllClients = async () => {
    const query = {
        text: `
        SELECT usuarios.id, usuarios.nombre, usuarios.correo, usuarios.estado, roles.nombre AS rol
        FROM usuarios
        JOIN roles ON usuarios.id_rol = roles.id
        WHERE usuarios.id_rol = 3
        `
    };
    const { rows } = await db.query(query);
    return rows;
}

// Actualiza los campos `nombre` y/o `contrasena` de un usuario.
const updateUser = async (id, { nombre, contrasena }) => {
    const fields = [];
    const values = [];
    let query = 'UPDATE usuarios SET ';

    if (nombre) {
        fields.push('nombre = $' + (fields.length + 1));
        values.push(nombre);
    }
    if (contrasena) {
        fields.push('contrasena = $' + (fields.length + 1));
        values.push(contrasena);
    }

    if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
    }

    query += fields.join(', ') + ' WHERE id = $' + (fields.length + 1);
    values.push(id);

    const result = await db.query({ text: query, values });
    return result.rowCount;
};

// Actualiza el estado de un veterinario o cliente y devuelve los datos actualizados.
const updateUsuarioVetEstado = async (id, estado) => {
    const query = {
        text: `
            UPDATE usuarios
            SET estado = $1
            WHERE id = $2 AND id_rol = 2 OR id_rol = 5 OR id_rol = 3
            RETURNING id, nombre, estado
        `,
        values: [estado, id]
    };

    const { rows } = await db.query(query);
    return rows[0];
};

// Cambia el rol de un veterinario a veterinario de emergencia.
const updateVetRoleToEmergency = async (id) => {
    const query = {
        text: `
        UPDATE usuarios
        SET id_rol = 5
        WHERE id = $1 AND id_rol = 2
        RETURNING id, nombre, correo, id_rol
        `,
        values: [id]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Cambia el rol de un usuario y devuelve la información actualizada.
const updateUserRole = async (id, id_rol) => {
    const query = {
        text: `
            UPDATE usuarios
            SET id_rol = $1
            WHERE id = $2
            RETURNING id, nombre, correo, id_rol
        `,
        values: [id_rol, id]
    };

    const { rows } = await db.query(query);
    return rows[0];
};

// Busca un usuario por su ID y devuelve información básica.
const findOneById = async (id) => {
    const query = {
        text: `
        SELECT id, nombre, correo, id_rol, estado
        FROM usuarios
        WHERE id = $1
        `,
        values: [id]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Recupera el nombre de un usuario a partir de su ID.
const findUsuarioById = async (id) => {
    const query = {
        text: `
        SELECT nombre 
        FROM USUARIOS 
        WHERE id = $1
        `,
        values: [id]
    };
    const { rows } = await db.query(query);
    return rows[0];
};

// Exporta todas las funciones del modelo de usuario
export const UserModel = {
    create,
    findOneByEmail,
    findAllVets,
    findAllClients,
    updateUser,
    updateUsuarioVetEstado,
    updateVetRoleToEmergency,
    findOneById,
    updateUserRole,
    findUsuarioById
};