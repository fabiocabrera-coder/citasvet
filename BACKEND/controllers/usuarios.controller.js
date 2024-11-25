import bcryptjs from 'bcryptjs';
import jwt from "jsonwebtoken";
import { UserModel } from "../models/usuarios.model.js";
import { MovimientosModel } from "../models/movimientos.model.js";

// Controlador para el registro de usuarios
const register = async (req, res) => {
    try {
        const { nombre, correo, contrasena, id_rol } = req.body;

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(contrasena, salt);

        const newUser = await UserModel.create({
            nombre,
            correo,
            contrasena: hashedPassword,
            id_rol
        });

        const token = jwt.sign(
            {
                correo: newUser.correo,
                id_rol: newUser.id_rol,
                userId: newUser.id,
                nombre: newUser.nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        return res.status(201).json({
            ok: true,
            msg: {
                token,
                id_rol: newUser.id_rol
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Controlador para el inicio de sesión
const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({
                ok: false,
                msg: 'Por favor ingrese correo y contraseña'
            });
        }

        const user = await UserModel.findOneByEmail(correo);
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Correo incorrecto'
            });
        }

        if (user.estado === 'INACTIVO') {
            return res.status(403).json({
                ok: false,
                msg: 'Cuenta inactiva. Contacte al administrador.'
            });
        }

        const isMatch = await bcryptjs.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });
        }

        const token = jwt.sign({
            correo: user.correo,
            id_rol: user.id_rol,
            userId: user.id,
            nombre: user.nombre
        }, process.env.JWT_SECRET, { expiresIn: '4h' });

        const tipo_accion = "Inicio de sesión";
        const fecha = new Date();
        await MovimientosModel.createMovimiento(user.id, tipo_accion, fecha);

        return res.status(200).json({
            ok: true,
            token,
            id_rol: user.id_rol,
            nombre: user.nombre
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Controlador para crear un veterinario (usado por el administrador)
const createVet = async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({
                ok: false,
                msg: 'Por favor complete todos los campos requeridos: nombre, correo y contraseña'
            });
        }

        const existingUser = await UserModel.findOneByEmail(correo);
        if (existingUser) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(contrasena, salt);
        const newVet = await UserModel.create({
            nombre,
            correo,
            contrasena: hashedPassword,
            id_rol: 2 
        });

        return res.status(201).json({
            ok: true,
            msg: 'Veterinario creado exitosamente',
            vet: { id: newVet.id, nombre: newVet.nombre, correo: newVet.correo }
        });

    } catch (error) {
        console.log('Error al crear veterinario:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor al crear veterinario'
        });
    }
};

// Controlador para el auto-registro de clientes
const registerClient = async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({
                ok: false,
                msg: 'Por favor complete todos los campos requeridos: nombre, correo y contraseña'
            });
        }

        const existingUser = await UserModel.findOneByEmail(correo);
        if (existingUser) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(contrasena, salt);
        const newClient = await UserModel.create({
            nombre,
            correo,
            contrasena: hashedPassword,
            id_rol: 3
        });

        const tipo_accion = "Registro de cliente";
        const fecha = new Date();
        await MovimientosModel.createMovimiento(newClient.id, tipo_accion, fecha);

        return res.status(201).json({
            ok: true,
            msg: 'Cliente registrado exitosamente',
            client: { id: newClient.id, nombre: newClient.nombre, correo: newClient.correo }
        });

    } catch (error) {
        console.log('Error al registrar cliente:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor al registrar cliente'
        });
    }
};

// Controlador para obtener todos los veterinarios
const getAllVets = async (req, res) => {
    try {
        const veterinarios = await UserModel.findAllVets();
        return res.status(200).json({
            ok: true,
            veterinarios
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener la lista de veterinarios'
        });
    }
};

// Controlador para obtener todos los veterinarios
const getAllClients = async (req, res) => {
    try {
        const clientes = await UserModel.findAllClients();
        return res.status(200).json({
            ok: true,
            clientes
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener la lista de clientes'
        });
    }
};

// Controlador para actualizar solo el nombre del perfil de usuario
const updateProfile = async (req, res) => {
    try {
        const { nombre, contrasena } = req.body;
        const userId = req.user.userId;

        let hashedPassword;
        if (contrasena) {
            const salt = await bcryptjs.genSalt(10);
            hashedPassword = await bcryptjs.hash(contrasena, salt);
        }

        const updatedRows = await UserModel.updateUser(userId, {
            nombre,
            contrasena: hashedPassword
        });

        if (updatedRows > 0) {
            return res.status(200).json({ ok: true, msg: 'Perfil actualizado exitosamente' });
        } else {
            return res.status(400).json({ ok: false, msg: 'No se pudo actualizar el perfil' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Error al actualizar perfil' });
    }
};

// Controlador para actualizar el estado de un veterinario
const updateUsuarioVetEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['ACTIVO', 'INACTIVO'].includes(estado)) {
            return res.status(400).json({
                ok: false,
                msg: 'Estado no válido'
            });
        }

        const updatedUser = await UserModel.updateUsuarioVetEstado(id, estado);

        if (!updatedUser) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            ok: true,
            msg: 'Estado de usuario actualizado',
            usuario: updatedUser
        });
    } catch (error) {
        console.error('Error al actualizar estado del usuario:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Controlador para asignar el rol de emergencia a un veterinario
const assignEmergencyRole = async (req, res) => {
    try {
        const { id } = req.params;
        
        const updatedUser = await UserModel.updateUserRole(id, 5);

        if (!updatedUser) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            ok: true,
            msg: 'Rol de emergencia asignado correctamente',
            usuario: updatedUser
        });
    } catch (error) {
        console.error('Error al asignar rol de emergencia:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Controlador para remover el rol de emergencia y devolver el rol a VET
const removeEmergencyRole = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedUser = await UserModel.updateUserRole(id, 2);

        if (!updatedUser) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            ok: true,
            msg: 'Rol de emergencia removido correctamente',
            usuario: updatedUser
        });
    } catch (error) {
        console.error('Error al remover rol de emergencia:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Controlador para obtener la información del usuario actual
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Extraer el ID del usuario desde el token

        const user = await UserModel.findOneById(userId);
        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            ok: true,
            user
        });
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Exporta los controladores
export const UserController = {
    register,
    login,
    createVet,
    registerClient,
    getAllVets,
    getAllClients,
    updateProfile,
    updateUsuarioVetEstado,
    assignEmergencyRole,
    removeEmergencyRole,
    getCurrentUser
};