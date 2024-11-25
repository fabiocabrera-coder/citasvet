import jwt from 'jsonwebtoken';

// Middleware para verificar el token JWT
export const verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    // Verificar si el token está presente
    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }

    // Extraer el token eliminando el prefijo "Bearer"
    token = token.split(" ")[1];
    console.log('Token recibido:', token); // Log para depuración

    try {
        // Decodificar y verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { 
            correo: decoded.correo, 
            id_rol: decoded.id_rol, 
            userId: decoded.userId,
            nombre: decoded.nombre, 
        };
        console.log('Usuario autenticado:', req.user);
        next(); // Continuar si es válido
    } catch (error) {
        // Verificar si el error es por token expirado o inválido
        const message = error.name === 'TokenExpiredError' ? "Token expirado" : "Token inválido o malformado";
        return res.status(401).json({ error: message });
    }
};

// Middleware para verificar si el usuario es administrador
export const verifyAdmin = (req, res, next) => {
    // Permitir solo a usuarios con rol de administrador
    if (req.user.id_rol === 1) {
        return next();
    }
    return res.status(403).json({ error: "Acceso autorizado solo para administradores" });
};

// Middleware para verificar si el usuario es veterinario o administrador
export const verifyVet = (req, res, next) => {
    console.log('Verificando rol del usuario:', req.user.id_rol);
    // Permitir a veterinarios (rol 2) o administradores (rol 1)
    if (req.user.id_rol === 2 || req.user.id_rol === 1 || req.user.id_rol === 5) {
        return next();
    }
    return res.status(403).json({ error: "Acceso autorizado solo para veterinarios o administradores" });
};

// Middleware para verificar si el usuario es cliente
export const verifyClient = (req, res, next) => {
    // Permitir solo a usuarios con rol de cliente
    if (req.user.id_rol === 3) {
        return next();
    }
    return res.status(403).json({ error: "Acceso autorizado solo para clientes" });
};