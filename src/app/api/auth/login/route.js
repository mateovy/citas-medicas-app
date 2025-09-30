import { NextResponse } from 'next/server';

const users = [
  { documento: '12345', nombre: 'Juan Perez', password: 'juan123' },
  { documento: '12345', nombre: 'Mateo Valencia', password: 'mateo123' },
  { documento: '54321', nombre: 'Ana Garcia', password: 'ana123' },
  { documento: '98765', nombre: 'Carlos Lopez', password: 'carlos123' },
  { documento: '56789', nombre: 'Maria Rodriguez', password: 'maria123' },
  { documento: '11223', nombre: 'Sofia Martinez', password: 'sofia123' },
];

export async function POST(request) {
  try {
    const { documento, nombre, password } = await request.json();

    const foundUser = users.find(
      user =>
        user.documento === documento &&
        user.nombre.toLowerCase() === nombre.toLowerCase() &&
        user.password === password
    );

    if (foundUser) {
      return NextResponse.json({
        success: true,
        user: {
          documento: foundUser.documento,
          nombre: foundUser.nombre,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Datos incorrectos (documento, nombre o contraseña)' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
