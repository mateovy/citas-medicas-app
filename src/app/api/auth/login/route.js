import { NextResponse } from 'next/server';

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
        const { documento, nombre } = await request.json();

        const foundUser = users.find(
            user => user.documento === documento && user.nombre.toLowerCase() === nombre.toLowerCase()
        );

        if (foundUser) {
            return NextResponse.json({ 
                success: true, 
                user: foundUser 
            });
        } else {
            return NextResponse.json(
                { success: false, message: 'Documento o nombre incorrectos' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error en el servidor' },
            { status: 500 }
        );
    }
}