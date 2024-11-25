import { Router } from 'express'; // Para definir rutas en Express
import { CitasController } from '../controllers/citas.controller.js'; // Controlador de citas
import { verifyToken, verifyClient, verifyVet } from '../middlewares/jwt.middlewares.js'; // Middlewares para verificar roles y autenticación

const router = Router();

// Crear una nueva cita, accesible solo para clientes autenticados
router.post('/create', verifyToken, verifyClient, CitasController.createCita); 

// Obtener las citas asignadas a un veterinario, accesible solo para veterinarios autenticados
router.get('/vet', verifyToken, verifyVet, CitasController.getCitasByVeterinario);

// Obtener citas de emergencia para veterinarios, accesible solo para veterinarios autenticados
router.get('/vet_em', verifyToken, verifyVet, CitasController.getCitasEmergenciaByVeterinario);

// Obtener las citas asociadas a un cliente, accesible solo para clientes autenticados
router.get('/client', verifyToken, verifyClient, CitasController.getCitasByCliente);

// Actualizar el estado de una cita (Confirmada, Completada), accesible solo para veterinarios
router.put('/update/:id', verifyToken, verifyVet, CitasController.updateCitaEstado);

// Cancelar una cita por parte de un veterinario, accesible solo para veterinarios autenticados
router.put('/cancelar/:id', verifyToken, verifyVet, CitasController.cancelarCita);

// Cancelar una cita por parte de un cliente, accesible solo para clientes autenticados
router.put('/cliente/cancelar/:id', verifyToken, verifyClient, CitasController.cancelarCita);

// Crear una cita de emergencia, accesible solo para clientes autenticados
router.post('/create-emergencia', verifyToken, verifyClient, CitasController.createCitaEmergencia);

// Obtener la cita de emergencia asociada a un cliente, accesible solo para clientes autenticados
router.get('/emergencia', verifyToken, verifyClient, CitasController.getCitaEmergencia);

// Obtener todas las citas asociadas a un cliente, accesible solo para clientes autenticados
router.get('/client/citas-cliente', verifyToken, verifyClient, CitasController.obtenerTodasCitasPorCliente);

// Obtener citas de emergencia asignadas a veterinarios con rol de emergencia, accesible solo para veterinarios
router.get('/vet_em/emergencia', verifyToken, verifyVet, CitasController.getCitasEmergenciaByVeterinario);

// Obtener citas normales asignadas a un veterinario, accesible solo para veterinarios autenticados
router.get('/vet/citas-veterinario', verifyToken, verifyVet, CitasController.getCitasNormalesByVeterinario);

// Obtener disponibilidad semanal de un veterinario, accesible solo para clientes autenticados
router.get('/disponibilidad-semanal', verifyToken, verifyClient, CitasController.getDisponibilidadSemanalVeterinario);

// Obtener lista de veterinarios disponibles, accesible solo para clientes autenticados
router.get('/veterinarios-disponibles', verifyToken, verifyClient, CitasController.getVeterinariosDisponibles);

// Obtener citas ocupadas, accesible solo para clientes autenticados
router.get('/ocupadas', verifyToken, verifyClient, CitasController.getCitasOcupadas);

// Exportar el router configurado para su uso en la aplicación
export default router;