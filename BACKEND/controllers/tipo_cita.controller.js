// Importa el modelo de tipos de cita desde el archivo de modelos
import { TipoCitaModel } from '../models/tipo_cita.model.js';

// Controlador para obtener todos los tipos de citas con duraciones formateadas
const getAllTipoCitas = async (req, res) => {
    try {
        const tiposCita = await TipoCitaModel.getAllTipoCitas();

        const tiposCitaFormateados = tiposCita.map(tipo => {
            let duracionFormateada = tipo.duracion
                ? `${Math.floor(tipo.duracion.hours || 0)} horas ${Math.floor(tipo.duracion.minutes || 0)} minutos`
                : 'Variable';

            return {
                ...tipo,
                duracion: duracionFormateada,
                precio: tipo.precio
            };
        });

        return res.status(200).json({ ok: true, tiposCita: tiposCitaFormateados });
    } catch (error) {
        console.error('Error al obtener tipos de cita:', error);
        return res.status(500).json({ ok: false, msg: 'Error del servidor' });
    }
};

// Exportar los controladores
export const TipoCitaController = {
    getAllTipoCitas    
};