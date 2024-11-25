import { Router } from 'express';
import { MovimientosController } from '../controllers/movimientos.controller.js';
import { verifyToken, verifyAdmin } from '../middlewares/jwt.middlewares.js';

const router = Router();

// Ruta para obtener movimientos (solo para administradores)
router.get('/', verifyToken, verifyAdmin, MovimientosController.getMovimientos);

// Ruta para obtener movimientos por rol (rolId: 2 para veterinario normal, 5 para veterinario de emergencia, etc.)
router.get('/rol/:rolId', verifyToken, verifyAdmin, MovimientosController.getMovimientosByRol);

// Exportar el router configurado para usarlo en la aplicación
export default router;