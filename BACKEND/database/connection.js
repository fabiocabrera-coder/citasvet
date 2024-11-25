// Importa configuraciones de entorno y la librería `pg` para conexiones a PostgreSQL
import 'dotenv/config';
import pg from 'pg';

// Configura la conexión usando la URL en `DATABASE_URL`
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

export const db = new Pool({
    allowExitOnIdle: true, // Permite salir si no hay consultas activas
    connectionString
});

// Verifica la conexión y muestra un mensaje en la consola
try {
    await db.query('SELECT NOW()');
    console.log('BASE DE DATOS CONECTADA!!');
} catch (error) {
    console.log(error);
}