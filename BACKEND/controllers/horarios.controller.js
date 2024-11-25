import { HorariosModel } from '../models/horarios.model.js';
import { MovimientosModel } from "../models/movimientos.model.js";

// Controlador para crear un nuevo horario
const createHorario = async (req, res) => {
    try {
        // Extrae los datos necesarios de la solicitud: hora de inicio y hora de fin
        const { hora_inicio, hora_fin } = req.body;
        // Obtiene el ID del veterinario autenticado desde el token de usuario
        const id_Veterinario = req.user.userId;

        // Verifica que el usuario tenga el rol de veterinario (id_rol 2 o id_rol 5)
        if (!id_Veterinario || (req.user.id_rol !== 2 && req.user.id_rol !== 5)) {
            return res.status(403).json({ ok: false, msg: 'Usuario no autorizado para esta operación' });
        }

        // Valida que ambos campos (hora_inicio y hora_fin) estén presentes
        if (!hora_inicio || !hora_fin) {
            return res.status(400).json({ ok: false, msg: 'Por favor complete todos los campos' });
        }

        // Llama a la función del modelo para crear el horario en la base de datos
        const newHorario = await HorariosModel.createHorario(hora_inicio, hora_fin, id_Veterinario);

        // Formatear las horas de inicio y fin al formato legible
        const horaInicioFormateada = new Date(hora_inicio).toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        const horaFinFormateada = new Date(hora_fin).toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        // Registrar el movimiento
        const tipo_accion = `Agregó su horario de disponibilidad: ${horaInicioFormateada} - ${horaFinFormateada}`;
        const fechaMovimiento = new Date();
        await MovimientosModel.createMovimiento(id_Veterinario, tipo_accion, fechaMovimiento);

        // Devuelve el nuevo horario creado en formato JSON
        return res.status(201).json({ ok: true, horario: newHorario });
    } catch (error) {
        // Muestra un error en consola y envía una respuesta de error del servidor
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para obtener los horarios de un veterinario específico
const getHorarios = async (req, res) => {
    try {

        const id_Veterinario = req.user.userId;
    
        if (!id_Veterinario || (req.user.id_rol !== 2  && req.user.id_rol !== 5)) {
            return res.status(403).json({ ok: false, msg: 'Usuario no autorizado para esta operación' });
        }

        const horarios = await HorariosModel.getHorariosByVeterinario(id_Veterinario);

        return res.status(200).json({ ok: true, horarios });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para eliminar un horario específico
const deleteHorario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const id_Veterinario = req.user.userId;

        if (!id_Veterinario || (req.user.id_rol !== 2 && req.user.id_rol !== 5)) {
            return res.status(403).json({ ok: false, msg: 'Usuario no autorizado para esta operación' });
        }

        const horarioDetalles = await HorariosModel.findHorarioById(id);
        if (!horarioDetalles) {
            return res.status(404).json({ ok: false, msg: 'Horario no encontrado' });
        }

        const deletedHorario = await HorariosModel.deleteHorario(id);

        const fechaInicio = new Date(horarioDetalles.hora_inicio).toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const fechaFin = new Date(horarioDetalles.hora_fin).toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const tipo_accion = `Eliminó su horario de disponibilidad: ${fechaInicio} - ${fechaFin}`;
        const fechaMovimiento = new Date();
        await MovimientosModel.createMovimiento(id_Veterinario, tipo_accion, fechaMovimiento);

        return res.status(200).json({ ok: true, msg: 'Horario eliminado exitosamente', horario: deletedHorario });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Exporta los controladores
export const HorariosController = {
    createHorario,
    getHorarios,
    deleteHorario
};