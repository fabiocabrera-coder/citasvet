import { Router } from 'express'; 
import { HorariosController } from '../controllers/horarios.controller.js'; 
import { verifyToken, verifyVet } from '../middlewares/jwt.middlewares.js'; 

const router = Router(); // Crea una instancia del Router de Express

// Crear un nuevo horario (autenticado y rol veterinario requerido)
router.post('/create', verifyToken, verifyVet, HorariosController.createHorario);

// Obtener los horarios de un veterinario (autenticado y rol veterinario requerido)
router.get('/', verifyToken, verifyVet, HorariosController.getHorarios);

// Eliminar un horario específico (autenticado y rol veterinario requerido)
router.delete('/delete/:id', verifyToken, verifyVet, HorariosController.deleteHorario);

// Exporta el router para usarlo en la aplicación
export default router; 