import { MascotasModel } from '../models/mascotas.model.js';
import { MovimientosModel } from "../models/movimientos.model.js";

// Controlador para crear una nueva mascota
export const createMascota = async (req, res) => {
    try {
        const { nombre, especie, raza, fechaNacimiento } = req.body;

        const id_cliente = req.user.userId;

        const newMascota = await MascotasModel.createMascota(nombre, especie, raza, fechaNacimiento, id_cliente);

        const tipo_accion = `Registro de la mascota "${newMascota.nombre}"`;
        const fecha = new Date();

        await MovimientosModel.createMovimiento(id_cliente, tipo_accion, fecha);

        return res.status(201).json({
            ok: true,
            mascota: newMascota
        });
    } catch (error) {
        console.error('Error al crear mascota:', error);
        return res.status(500).json({
            ok: false,
            error: 'Error al crear mascota'
        });
    }
};

// Controlador para obtener las mascotas de un cliente específico
const getMascotas = async (req, res) => {
    try {
        const id_cliente = req.user.userId;

        if (!id_cliente || req.user.id_rol !== 3) {
            return res.status(403).json({ ok: false, msg: 'Usuario no autorizado para esta operación' });
        }

        const mascotas = await MascotasModel.getMascotasByCliente(id_cliente);

        const mascotasFormateadas = mascotas.map(mascota => {
            console.log("Fecha original:", mascota.fechanacimiento);

            let fechaNacimientoFormateada;
            try {
                const fechaNacimiento = new Date(mascota.fechanacimiento);
                if (!isNaN(fechaNacimiento)) {
                    fechaNacimientoFormateada = fechaNacimiento.toISOString().split('T')[0];
                } else {
                    fechaNacimientoFormateada = 'Fecha inválida'; 
                }
            } catch (error) {
                fechaNacimientoFormateada = 'Fecha inválida';
            }

            return {
                ...mascota,
                fechanacimiento: fechaNacimientoFormateada
            };
        });

        return res.status(200).json({ ok: true, mascotas: mascotasFormateadas });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para actualizar el estado de una mascota
const updateMascotaEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!['VIVO', 'MUERTO'].includes(estado)) {
            return res.status(400).json({ ok: false, msg: 'Estado inválido. Solo se permite "VIVO" o "MUERTO".' });
        }

        const mascota = await MascotasModel.findMascotaById(id);

        if (!mascota) {
            return res.status(404).json({ ok: false, msg: 'Mascota no encontrada' });
        }

        const updatedMascota = await MascotasModel.updateMascotaEstado(id, estado);

        const id_usuario = req.user.userId;

        const tipo_accion = `Cambio de estado de la mascota"${mascota.nombre}" a "${estado}"`;
        const fecha = new Date();
        await MovimientosModel.createMovimiento(id_usuario, tipo_accion, fecha);

        return res.status(200).json({ 
            ok: true, 
            msg: `Estado de la mascota "${mascota.nombre}" actualizado a "${estado}"`,
            mascota: updatedMascota 
        });
    } catch (error) {
        console.error('Error al actualizar el estado de la mascota:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Exporta los controladores
export const MascotasController = {
    createMascota,
    getMascotas,
    updateMascotaEstado
};