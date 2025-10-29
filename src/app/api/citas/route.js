import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🔹 GET: obtiene citas por id o usuario_id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const usuario_id = searchParams.get('usuario_id');

    let query = supabase.from('citas').select('*');

    if (id) {
      query = query.eq('id', id).limit(1);
    } else if (usuario_id) {
      query = query.eq('usuario_id', usuario_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (id) return NextResponse.json(data?.[0] || null);
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('❌ GET /api/citas error:', err);
    return NextResponse.json({ message: 'Error al obtener citas' }, { status: 500 });
  }
}

// 🔹 POST: crea o actualiza (si body.id existe)
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      id, usuario_id, especialidad, doctor, fecha, hora, ubicacion, estado = 'Programada',
    } = body || {};

    if (!usuario_id || !especialidad || !doctor || !fecha || !hora || !ubicacion) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    let data, error;

    if (id) {
      // Actualiza solo campos válidos, sin tocar estado salvo que venga explícitamente
      const updateFields = { especialidad, doctor, fecha, hora, ubicacion };
      if (body.estado) updateFields.estado = body.estado;

      ({ data, error } = await supabase
        .from('citas')
        .update(updateFields)
        .eq('id', id)
        .select());
    } else {
      // Crear cita nueva
      ({ data, error } = await supabase
        .from('citas')
        .insert([{ usuario_id, especialidad, doctor, fecha, hora, ubicacion, estado }])
        .select());
    }

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('❌ POST /api/citas error:', err);
    return NextResponse.json({ message: 'Error al guardar la cita' }, { status: 500 });
  }
}

// 🔹 PATCH: actualizar una cita existente sin modificar estado
export async function PATCH(req) {
  try {
    const url = new URL(req.url);
    const citaId = url.searchParams.get('id');
    const body = await req.json();

    if (!citaId) {
      return NextResponse.json({ message: 'Falta el ID de la cita' }, { status: 400 });
    }

    const camposActualizables = {};
    ['especialidad', 'doctor', 'fecha', 'hora', 'ubicacion'].forEach((campo) => {
      if (body[campo] !== undefined && body[campo] !== null) {
        camposActualizables[campo] = body[campo];
      }
    });

    // Si viene estado explícitamente, actualizarlo
    if (body.estado) camposActualizables.estado = body.estado;

    if (Object.keys(camposActualizables).length === 0) {
      return NextResponse.json({ message: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('citas')
      .update(camposActualizables)
      .eq('id', citaId)
      .select();

    if (error) throw error;
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error('❌ PATCH /api/citas error:', error);
    return NextResponse.json({ message: 'Error al actualizar la cita' }, { status: 500 });
  }
}

// 🔹 DELETE: cancelar cita (cambia estado a Cancelada)
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'Falta el ID de la cita' }, { status: 400 });

    const { data, error } = await supabase
      .from('citas')
      .update({ estado: 'Cancelada', motivo_cancelacion: 'Cancelada por el usuario' })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data?.length) return NextResponse.json({ message: 'No se encontró la cita' }, { status: 404 });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('❌ DELETE /api/citas error:', err);
    return NextResponse.json({ message: 'Error al cancelar la cita' }, { status: 500 });
  }
}
