// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';

// 1. Lista de usuarios permitidos (nuestra "base de datos" simulada)
const users = [
    { documento: '12345', nombre: 'Juan Perez' },
    { documento: '12345', nombre: 'Mateo Valencia' },
    { documento: '54321', nombre: 'Ana Garcia' },
    { documento: '98765', nombre: 'Carlos Lopez' },
    { documento: '56789', nombre: 'Maria Rodriguez' },
    { documento: '11223', nombre: 'Sofia Martinez' },
];

export async function POST(request) {
    try {
        // 2. Obtenemos los datos que envía el formulario
        const { documento, nombre } = await request.json();

        // 3. Buscamos si el usuario existe en nuestra lista
        const foundUser = users.find(
            user => user.documento === documento && user.nombre.toLowerCase() === nombre.toLowerCase()
        );

        // 4. Si el usuario existe, respondemos con éxito
        if (foundUser) {
            return NextResponse.json({ 
                success: true, 
                user: foundUser 
            });
        } else {
            // 5. Si no existe, respondemos con un error 401
            return NextResponse.json(
                { success: false, message: 'Documento o nombre incorrectos' },
                { status: 401 } // 401 significa "No autorizado"
            );
        }
    } catch (error) {
        // Manejo de errores inesperados
        return NextResponse.json(
            { success: false, message: 'Error en el servidor' },
            { status: 500 }
        );
    }
}