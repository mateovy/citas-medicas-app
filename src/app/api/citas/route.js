import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Obtener todas las citas o solo las de un usuario específico
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usuario_id = searchParams.get('usuario_id');

    let query = supabase.from('citas').select('*');

    // Si viene el usuario_id, filtramos por ese UUID
    if (usuario_id) {
      query = query.eq('usuario_id', usuario_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error GET /api/citas:', error);
    return NextResponse.json({ message: 'Error al obtener citas' }, { status: 500 });
  }
}

// 🔹 Crear nueva cita
export async function POST(req) {
  try {
    const body = await req.json();
    const { usuario_id, especialidad, doctor, fecha, hora, ubicacion, estado } = body;

    if (!usuario_id || !especialidad || !doctor || !fecha || !hora || !ubicacion) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('citas')
      .insert([
        {
          usuario_id,
          especialidad,
          doctor,
          fecha,
          hora,
          ubicacion,
          estado: estado || 'Programada',
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json({ message: 'Cita agendada correctamente', data });
  } catch (error) {
    console.error('Error al agendar cita:', error);
    return NextResponse.json({ message: 'Error al agendar cita' }, { status: 500 });
  }
}

// 🔹 Cancelar una cita (PATCH o DELETE)
export async function PATCH(req) {
  return handleCancel(req);
}

export async function DELETE(req) {
  return handleCancel(req);
}

async function handleCancel(req) {
  try {
    const url = new URL(req.url);
    const citaIdFromUrl = url.searchParams.get('id');
    const body = citaIdFromUrl ? {} : await req.json();

    const cita_id = citaIdFromUrl || body.cita_id;
    const motivo = body.motivo || 'Cancelada por el usuario';

    if (!cita_id) {
      return NextResponse.json({ message: 'Falta el ID de la cita' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('citas')
      .update({ estado: 'Cancelada', motivo_cancelacion: motivo })
      .eq('id', cita_id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No se encontró la cita con ese ID' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cita cancelada correctamente', data });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    return NextResponse.json({ message: 'Error al cancelar la cita' }, { status: 500 });
  }
}
