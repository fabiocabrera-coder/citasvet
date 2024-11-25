import { Router } from "express";
import path from "path";
import { fileURLToPath } from 'url';

const router = Router(); // Crear instancia del router de Express

// Configuración para manejar rutas y la carpeta `public`
const __filename = fileURLToPath(import.meta.url); // Nombre del archivo actual
const __dirname = path.dirname(__filename); // Directorio actual
const publicPath = path.join(__dirname, '../../FRONTEND/public'); // Ruta a la carpeta `public`

// Rutas para servir archivos HTML desde la carpeta `public`

router.get('/pagina-principal', (req, res) => {
    res.sendFile(path.join(publicPath, "paginaPrincipal.html")); // Página principal
});

router.get('/registrar-cliente', (req, res) => {
    res.sendFile(path.join(publicPath, "registroCliente.html")); // Registro de clientes
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(publicPath, "login.html")); // Página de inicio de sesión
});

router.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath, "admin.html")); // Panel de administrador
});

router.get('/vet', (req, res) => {
    res.sendFile(path.join(publicPath, "vet.html")); // Panel de veterinarios
});

router.get('/client', (req, res) => {
    res.sendFile(path.join(publicPath, "client.html")); // Panel de clientes
});

router.get('/horarios', (req, res) => {
    res.sendFile(path.join(publicPath, "horarios.html")); // Gestión de horarios de veterinarios
});

router.get('/mascotas', (req, res) => {
    res.sendFile(path.join(publicPath, "mascotas.html")); // Gestión de mascotas
});

router.get('/registrar-veterinario', (req, res) => {
    res.sendFile(path.join(publicPath, "registrarVet.html")); // Registro de veterinarios
});

router.get('/ver-usuarios', (req, res) => {
    res.sendFile(path.join(publicPath, "verUsuarios.html")); // Ver usuarios registrados
});

router.get('/ver-horarios', (req, res) => {
    res.sendFile(path.join(publicPath, "verHorarios.html")); // Ver horarios de veterinarios
});

router.get('/ver-mascotas', (req, res) => {
    res.sendFile(path.join(publicPath, "verMascotas.html")); // Ver mascotas registradas
});

router.get('/ver-mascotas-cita', (req, res) => {
    res.sendFile(path.join(publicPath, "verMascotasCita.html")); // Seleccionar mascotas para citas
});

router.get('/citas', (req, res) => {
    res.sendFile(path.join(publicPath, "citas.html")); // Gestión de citas
});

router.get('/ver-citas-client', (req, res) => {
    res.sendFile(path.join(publicPath, "verCitasClient.html")); // Ver citas del cliente
});

router.get('/ver-citas-vet', (req, res) => {
    res.sendFile(path.join(publicPath, "verCitasVet.html")); // Ver citas asignadas a un veterinario
});

router.get('/actualizar-perfil-client', (req, res) => {
    res.sendFile(path.join(publicPath, "actualizarPerfilClient.html")); // Actualizar perfil del cliente
});

router.get('/actualizar-perfil-vet', (req, res) => {
    res.sendFile(path.join(publicPath, "actualizarPerfilVet.html")); // Actualizar perfil del veterinario
});

router.get('/actualizar-perfil-vet-em', (req, res) => {
    res.sendFile(path.join(publicPath, "actualizarPerfilVetEm.html")); // Actualizar perfil de veterinario de emergencia
});

router.get('/ver-cita-emergencia', (req, res) => {
    res.sendFile(path.join(publicPath, "verCitaEmergencia.html")); // Ver detalles de cita de emergencia
});

router.get('/asignar-rol-emergencia', (req, res) => {
    res.sendFile(path.join(publicPath, "asignarVetEmergencia.html")); // Asignar rol de emergencia a veterinarios
});

router.get('/vet_em', (req, res) => {
    res.sendFile(path.join(publicPath, "vet_em.html")); // Panel de veterinarios de emergencia
});

router.get('/horarios-emergencia', (req, res) => {
    res.sendFile(path.join(publicPath, "horariosEmergencia.html")); // Gestión de horarios de emergencia
});

router.get('/ver-horarios-emergencia', (req, res) => {
    res.sendFile(path.join(publicPath, "verHorariosVetEm.html")); // Ver horarios de veterinarios de emergencia
});

router.get('/ver-citas-vet-emergencia', (req, res) => {
    res.sendFile(path.join(publicPath, "verCitasVetEm.html")); // Ver citas de emergencia asignadas a veterinarios
});

router.get('/ver-movimientos-usuarios', (req, res) => {
    res.sendFile(path.join(publicPath, "verMovimientosUsuarios.html")); // Ver movimientos de usuarios registrados
});

// Exportar las rutas configuradas para usarlas en la aplicación
export default router;