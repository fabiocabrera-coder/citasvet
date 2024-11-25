import path from "path";
import { fileURLToPath } from 'url';
import 'dotenv/config'
import express from 'express';

import movimientosRouter from './BACKEND/routes/movimientos.route.js'
import citasRouter from './BACKEND/routes/citas.route.js'
import tipoCitaRoutes from './BACKEND/routes/tipo_cita.route.js'
import mascotasRouter from './BACKEND/routes/mascotas.route.js'
import horarioRouter from './BACKEND/routes/horarios.route.js'
import userRouter from './BACKEND/routes/usuarios.route.js'
import publicRouter from './BACKEND/routes/public.route.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//app.use(express.static('FRONTEND/public'))
app.use(express.static(path.join(__dirname, 'FRONTEND/public')));

app.use('/', publicRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/horarios', horarioRouter)
app.use('/api/v1/mascotas', mascotasRouter)
app.use('/api/v1/citas', citasRouter)
app.use('/api/v1/tipo-cita', tipoCitaRoutes);
app.use('/api/v1/movimientos', movimientosRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log('Servidor andando en el puerto ' + PORT))