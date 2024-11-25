import { Router } from 'express';
import { TipoCitaController } from '../controllers/tipo_cita.controller.js';

const router = Router(); 

// Definir ruta para obtener todos los tipos de citas
router.get('/', TipoCitaController.getAllTipoCitas);

// Exportar el router para usarlo en la aplicación
export default router;