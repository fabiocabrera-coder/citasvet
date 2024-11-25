import { MovimientosModel } from '../models/movimientos.model.js';

// Controlador para obtener movimientos excepto los realizados por administradores
const getMovimientos = async (req, res) => {
    try {
        const movimientos = await MovimientosModel.getAllMovimientosExceptAdmin();
        return res.status(200).json({
            ok: true,
            movimientos
        });
    } catch (error) {
        console.error('Error al obtener movimientos:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};

// Controlador para obtener movimientos por rol
const getMovimientosByRol = async (req, res) => {
    try {
        const { rolId } = req.params; // Recibir el rol desde los parámetros de la ruta
        const movimientos = await MovimientosModel.getMovimientosByRol(rolId);

        return res.status(200).json({
            ok: true,
            movimientos
        });
    } catch (error) {
        console.error('Error al obtener movimientos por rol:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
};
 // Exporta los controladores
export const MovimientosController = {
    getMovimientos,
    getMovimientosByRol
};