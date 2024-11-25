// Importa el modelo de citas desde el archivo de modelos
import { CitasModel } from '../models/citas.model.js';
import { MovimientosModel } from "../models/movimientos.model.js";
import { TipoCitaModel } from "../models/tipo_cita.model.js";
import { UserModel } from "../models/usuarios.model.js";

// Controlador para crear una cita normal
const createCita = async (req, res) => {
    try {
        const { fecha, descripcion, idMascota, idTipoCita, idVeterinario } = req.body;
        const idCliente = req.user.userId;

        if (!fecha || !descripcion || !idMascota || !idTipoCita || !idVeterinario) {
            return res.status(400).json({
                ok: false,
                msg: 'Todos los campos son obligatorios'
            });
        }

        const tipoCita = await TipoCitaModel.findTipoCitaById(idTipoCita);
        if (!tipoCita) {
            return res.status(404).json({
                ok: false,
                msg: 'Tipo de cita no encontrado'
            });
        }

        const veterinario = await UserModel.findUsuarioById(idVeterinario);
        if (!veterinario) {
            return res.status(404).json({
                ok: false,
                msg: 'Veterinario no encontrado'
            });
        }

        const nuevaCita = await CitasModel.createCita(fecha, descripcion, idCliente, idMascota, idTipoCita, idVeterinario);

        const fechaFormateada = new Date(fecha).toLocaleString('es-PE', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        const tipo_accion = `Reserva de cita de tipo "${tipoCita.nombre}" para la fecha "${fechaFormateada}" con el veterinario "${veterinario.nombre}"`;
        const fechaMovimiento = new Date();
        await MovimientosModel.createMovimiento(idCliente, tipo_accion, fechaMovimiento);

        return res.status(201).json({
            ok: true,
            msg: 'Cita creada exitosamente',
            cita: nuevaCita
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        const errorMessage = error.message.includes('El horario seleccionado') ? error.message : 'Error del servidor';
        return res.status(400).json({
            ok: false,
            msg: errorMessage
        });
    }
};

// Controlador para obtener todas las citas de un cliente específico
const getCitasByCliente = async (req, res) => {
    try {
        const idCliente = req.user.userId;
        const citas = await CitasModel.getCitasByCliente(idCliente);
        return res.status(200).json({ ok: true, citas });
    } catch (error) {
        console.error('Error al obtener citas para el cliente:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para obtener todas las citas de un veterinario específico
const getCitasByVeterinario = async (req, res) => {
    try {
        const idVeterinario = req.user.userId;
        const citas = await CitasModel.getCitasByVeterinario(idVeterinario);
        return res.status(200).json({ ok: true, citas });
    } catch (error) {
        console.error('Error al obtener citas para el veterinario:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para actualizar el estado de una cita específica
const updateCitaEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const actualizadoPor = req.user.nombre;

        if (!['Confirmada', 'Completada'].includes(estado)) {
            return res.status(400).json({ ok: false, msg: 'Estado no válido.' });
        }

        const cita = await CitasModel.findCitaById(id);
        if (!cita) {
            return res.status(404).json({ ok: false, msg: 'Cita no encontrada.' });
        }

        const tipoCita = await TipoCitaModel.findTipoCitaById(cita.id_tipo_cita);
        if (!tipoCita) {
            return res.status(404).json({ ok: false, msg: 'Tipo de cita no encontrado.' });
        }

        const cliente = await UserModel.findUsuarioById(cita.id_cliente);
        if (!cliente) {
            return res.status(404).json({ ok: false, msg: 'Cliente no encontrado.' });
        }

        const updatedCita = await CitasModel.updateCitaEstado(id, estado, actualizadoPor);

        const fechaCitaFormateada = new Date(cita.fecha).toLocaleString('es-PE', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        let tipo_accion = '';
        if (estado === 'Confirmada') {
            tipo_accion = `Confirmó la cita de tipo "${tipoCita.nombre}" programada para la fecha "${fechaCitaFormateada}" con el cliente "${cliente.nombre}".`;
        } else if (estado === 'Completada') {
            tipo_accion = `Marcó como completada la cita de tipo "${tipoCita.nombre}" programada para la fecha "${fechaCitaFormateada}" con el cliente "${cliente.nombre}".`;
        }

        const fechaMovimiento = new Date();
        await MovimientosModel.createMovimiento(req.user.userId, tipo_accion, fechaMovimiento);

        return res.status(200).json({ ok: true, msg: 'Estado de la cita actualizado exitosamente.', cita: updatedCita });
    } catch (error) {
        console.error('Error al actualizar el estado de la cita:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor.' });
    }
};

// Controlador para cancelar una cita
const cancelarCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { razonCancelacion } = req.body;
        const actualizadoPor = req.user.nombre;

        if (!razonCancelacion) {
            return res.status(400).json({ ok: false, msg: 'La razón de cancelación es obligatoria' });
        }

        const cita = await CitasModel.findCitaById(id);
        if (!cita) {
            return res.status(404).json({ ok: false, msg: 'Cita no encontrada o ya fue cancelada' });
        }

        const tipoCita = await TipoCitaModel.findTipoCitaById(cita.id_tipo_cita);
        if (!tipoCita) {
            return res.status(404).json({ ok: false, msg: 'Tipo de cita no encontrado' });
        }

        const veterinario = await UserModel.findUsuarioById(cita.id_veterinario);
        if (!veterinario) {
            return res.status(404).json({ ok: false, msg: 'Veterinario no encontrado' });
        }

        const citaCancelada = await CitasModel.cancelarCita(id, razonCancelacion, actualizadoPor);

        if (!citaCancelada) {
            return res.status(500).json({ ok: false, msg: 'No se pudo cancelar la cita' });
        }

        const fechaCitaFormateada = new Date(cita.fecha).toLocaleString('es-PE', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        const tipo_accion = `Canceló la cita de tipo "${tipoCita.nombre}" programada para la fecha "${fechaCitaFormateada}"`;
        const fechaMovimiento = new Date();
        await MovimientosModel.createMovimiento(req.user.userId, tipo_accion, fechaMovimiento);

        return res.status(200).json({ ok: true, msg: 'Cita cancelada exitosamente', cita: citaCancelada });
    } catch (error) {
        console.error('Error al cancelar la cita:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para crear una cita de emergencia
const createCitaEmergencia = async (req, res) => {
    try {
        const idCliente = req.user.userId;
        const { idMascota } = req.body;

        if (!idMascota) {
            return res.status(400).json({
                ok: false,
                msg: 'Debe proporcionar el ID de la mascota'
            });
        }

        const nuevaCitaEmergencia = await CitasModel.createCitaEmergencia(idCliente, idMascota);

        const citaDetalles = await CitasModel.findCitaById(nuevaCitaEmergencia.id);

        if (!citaDetalles) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron los detalles de la cita creada'
            });
        }

        const veterinario = await UserModel.findUsuarioById(citaDetalles.id_veterinario);
        if (!veterinario) {
            return res.status(404).json({
                ok: false,
                msg: 'Veterinario asignado no encontrado'
            });
        }

        const fechaFormateada = new Date(citaDetalles.fecha).toLocaleString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const tipoCita = "Servicio de emergencia";
        const tipo_accion = `Cita de tipo "${tipoCita}" para la fecha "${fechaFormateada}" con el veterinario "${veterinario.nombre}"`;
        await MovimientosModel.createMovimiento(idCliente, tipo_accion, new Date());

        return res.status(201).json({
            ok: true,
            msg: 'Cita de emergencia creada exitosamente',
            cita: nuevaCitaEmergencia
        });
    } catch (error) {
        console.error('Error al crear cita de emergencia:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Controlador para obtener una cita de emergencia
const getCitaEmergencia = async (req, res) => {
    try {
        const idCliente = req.user.userId;

        const citaEmergencia = await CitasModel.getCitaEmergencia(idCliente);

        if (!citaEmergencia) {
            return res.status(404).json({ ok: false, msg: 'No se encontró ninguna cita de emergencia' });
        }

        return res.status(200).json({ ok: true, cita: citaEmergencia });
    } catch (error) {
        console.error('Error al obtener la cita de emergencia:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para obtener las citas de emeregencia de un veterinario
const getCitasEmergenciaByVeterinario = async (req, res) => {
    try {
        const idVeterinario = req.user.userId;

        const citas = await CitasModel.getCitasEmergenciaByVeterinario(idVeterinario);

        return res.status(200).json({ ok: true, citas });
    } catch (error) {
        console.error('Error al obtener citas de emergencia:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para obtener todas las citas de un veterinario con rol 2
const getCitasNormalesByVeterinario = async (req, res) => {
    try {
        const idVeterinario = req.user.userId;

        const citas = await CitasModel.getCitasNormalesByVeterinario(idVeterinario);

        return res.status(200).json({ ok: true, citas });
    } catch (error) {
        console.error('Error al obtener citas del veterinario:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Controlador para obtener disponibilidad semanal del veterinario
const getDisponibilidadSemanalVeterinario = async (req, res) => {
    try {
        const { idVeterinario } = req.query;

        const disponibilidad = await CitasModel.getDisponibilidadSemanalVeterinario(idVeterinario);

        return res.status(200).json({ ok: true, disponibilidad });
    } catch (error) {
        console.error('Error al obtener disponibilidad del veterinario:', error);
        return res.status(500).json({ ok: false, msg: 'Error al cargar disponibilidad del veterinario' });
    }
};

// Controlador para obtener los veterinarios con el rol 2
const getVeterinariosDisponibles = async (req, res) => {
    try {
        const veterinarios = await CitasModel.getVeterinariosDisponibles();
        return res.status(200).json({ ok: true, veterinarios });
    } catch (error) {
        console.error('Error al obtener veterinarios disponibles:', error);
        return res.status(500).json({ ok: false, msg: 'Error al cargar veterinarios disponibles' });
    }
};

// Controlador para obtener las citas ocupadas
const getCitasOcupadas = async (req, res) => {
    try {
        const { idVeterinario } = req.query;
        const citasOcupadas = await CitasModel.getCitasOcupadas(idVeterinario);
        return res.status(200).json({ citasOcupadas });
    } catch (error) {
        console.error('Error al obtener citas ocupadas:', error);
        return res.status(500).json({ ok: false, msg: 'Error al cargar citas ocupadas' });
    }
};


// Controlador para obtener todas las citas de un cliente específico
const obtenerTodasCitasPorCliente = async (req, res) => {
    try {
        const idCliente = req.user.userId;
        const citas = await CitasModel.getAllCitasByCliente(idCliente);

        return res.status(200).json({ ok: true, citas});
        
    } catch (error) {
        console.error('Error al obtener citas del cliente:', error);
        res.status(500).json({ ok: false, message: 'Error al obtener citas del cliente.' });
    }
};

// Exporta los controladores
export const CitasController = {
    createCita,        
    getCitasByCliente,    
    getCitasByVeterinario, 
    updateCitaEstado,
    cancelarCita,     
    createCitaEmergencia,
    getCitaEmergencia,
    getCitasEmergenciaByVeterinario,
    getDisponibilidadSemanalVeterinario,
    getVeterinariosDisponibles,
    getCitasOcupadas,
    obtenerTodasCitasPorCliente,
    getCitasNormalesByVeterinario
};