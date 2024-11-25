import { Router } from "express";
import { UserController } from "../controllers/usuarios.controller.js";
import { verifyToken, verifyAdmin, verifyClient, verifyVet } from "../middlewares/jwt.middlewares.js";

const router = Router(); // Crear instancia del Router de Express

// Rutas de autenticación y gestión de usuarios

// Registro de usuarios (público, sin autenticación)
router.post('/register', UserController.register);

// Inicio de sesión de usuarios (público, sin autenticación)
router.post('/login', UserController.login);

// Registro de veterinarios, permitido solo para administradores
router.post('/registrar-veterinario', verifyToken, verifyAdmin, UserController.createVet);

// Obtener todos los veterinarios, accesible solo para administradores
router.get('/vets', verifyToken, verifyAdmin, UserController.getAllVets);

// Obtener todos los clientes, accesible solo para administradores
router.get('/clients', verifyToken, verifyAdmin, UserController.getAllClients);

// Ruta para que los clientes se auto-registren (público, sin autenticación)
router.post('/registrar-client', UserController.registerClient);

// Actualizar el perfil de un cliente autenticado
router.put('/actualizar-perfil-client', verifyToken, verifyClient, UserController.updateProfile);

// Actualizar el perfil de un veterinario autenticado
router.put('/actualizar-perfil-vet', verifyToken, verifyVet, UserController.updateProfile);

// Actualizar el perfil de un veterinario con rol de emergencia (VET_EM)
router.put('/actualizar-perfil-vet-em', verifyToken, verifyVet, UserController.updateProfile);

// Actualizar el estado de un veterinario, permitido solo para administradores
router.put('/update-estado/:id', verifyToken, verifyAdmin, UserController.updateUsuarioVetEstado);

// Asignar el rol de emergencia a un veterinario, permitido solo para administradores
router.put('/vets/emergency-role/:id', verifyToken, verifyAdmin, UserController.assignEmergencyRole);

// Remover el rol de emergencia de un veterinario, permitido solo para administradores
router.put('/vets/remove-emergency-role/:id', verifyToken, verifyAdmin, UserController.removeEmergencyRole);

// Obtener la información del usuario autenticado
router.get('/me', verifyToken, UserController.getCurrentUser);

// Exportar el router para usarlo en la aplicación
export default router;