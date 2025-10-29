import { NextResponse } from 'next/server';

// Usuarios sincronizados con Supabase (UUID reales)
const users = [
  { id: 'cc5e4e46-6b20-4ae0-ac05-b818200cc789', documento: '12345', nombre: 'Juan Perez', password: 'juan123' },
  { id: '50f2d3e4-f2c9-42f9-8fc5-fafe6bbd36b5', documento: '54321', nombre: 'Ana Garcia', password: 'ana123' },
  { id: 'cb52c5cd-8eca-4e96-b901-c7bee636b508', documento: '98765', nombre: 'Carlos Lopez', password: 'carlos123' },
  { id: '5cfbceec-e281-4608-8fcb-8be21ad1ceb2', documento: '56789', nombre: 'Maria Rodriguez', password: 'maria123' },
  { id: 'b429e3ae-d7ae-4c9e-a7f5-3467f01803b7', documento: '11223', nombre: 'Sofia Martinez', password: 'sofia123' },
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { documento, password } = body;

    if (!documento || !password) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por documento y contraseña
    const usuario = users.find(
      (u) => u.documento === documento && u.password === password
    );

    if (!usuario) {
      return NextResponse.json(
        { message: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    // Retornar datos del usuario con su UUID real
    return NextResponse.json({
      id: usuario.id,
      nombre: usuario.nombre,
      documento: usuario.documento,
      message: 'Login exitoso',
    });
  } catch (error) {
    console.error('Error en el servidor de login:', error);
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
