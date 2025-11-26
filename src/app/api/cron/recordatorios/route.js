import { NextResponse } from "next/server";
import { Resend } from "resend";
import twilio from "twilio";
import { supabase } from "@/src/supabaseClient.mjs";

const resend = new Resend(process.env.RESEND_API_KEY);
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// FORMATO de hora para comparar
function fechaHoraToTimestamp(fecha, hora) {
  return new Date(`${fecha}T${hora}`).getTime();
}

export async function GET() {
  try {
    // Hora actual
    const ahora = Date.now();
    const en24h = ahora + 24 * 60 * 60 * 1000;

    // Obtener citas
    const { data: citas, error } = await supabase
      .from("citas")
      .select("*, usuarios(*)");

    if (error) throw error;

    // Filtrar citas que ocurren EXACTAMENTE en 24 horas
    const proximas = citas.filter((cita) => {
      const timestamp = fechaHoraToTimestamp(cita.fecha, cita.hora);
      const diff = Math.abs(timestamp - en24h);
      return diff <= 1000 * 60 * 60; // margen 1 hora
    });

    for (let cita of proximas) {
      const user = cita.usuarios;

      if (!user?.correo && !user?.telefono) continue;

      const fechaHoraStr = `${cita.fecha} ${cita.hora.slice(0, 5)}`;

      // --- Enviar CORREO ---
      if (user.correo) {
        await resend.emails.send({
          from: "Centro Médico <notificaciones@tuservidor.com>",
          to: user.correo,
          subject: "Recordatorio de Cita Médica",
          html: `
            <h2>Recordatorio de Cita</h2>
            <p>Hola ${user.nombre},</p>
            <p>Este es un recordatorio de tu cita:</p>
            <ul>
              <li><strong>Doctor:</strong> ${cita.doctor}</li>
              <li><strong>Especialidad:</strong> ${cita.especialidad}</li>
              <li><strong>Fecha y hora:</strong> ${fechaHoraStr}</li>
              <li><strong>Ubicacion:</strong> ${cita.ubicacion}</li>
            </ul>
            <p>Si no puedes asistir, por favor comunícate con el centro médico.</p>
          `,
        });
      }

      // --- Enviar SMS ---
      if (user.telefono) {
        await client.messages.create({
          body: `Recordatorio: Tienes una cita con ${cita.doctor} (${cita.especialidad}) el ${fechaHoraStr}.`,
          from: process.env.TWILIO_PHONE,
          to: user.telefono,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      enviados: proximas.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
