import { Router } from 'express';
import { MascotasController } from '../controllers/mascotas.controller.js'; 
import { verifyToken, verifyClient } from '../middlewares/jwt.middlewares.js';

const router = Router(); // Crear instancia del router de Express

// Ruta para crear una nueva mascota, accesible solo para clientes autenticados
router.post('/create', verifyToken, verifyClient, MascotasController.createMascota);

// Ruta para obtener todas las mascotas asociadas al cliente autenticado
router.get('/', verifyToken, verifyClient, MascotasController.getMascotas);

// Ruta para actualizar el estado de una mascota específica, accesible solo para clientes autenticados
router.put('/update-estado/:id', verifyToken, verifyClient, MascotasController.updateMascotaEstado);

// Exportar el router configurado para usarlo en la aplicación
export default router; 