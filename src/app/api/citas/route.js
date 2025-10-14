import { NextResponse } from 'next/server';

const data = [
    {
        id: 1,
        especialidad: "Resonancia Magnética (IRM)",
        doctor: "Especialista en Imágenes Diagnósticas",
        fecha: "2025-11-15",
        hora: "10:00",
        ubicacion: "Consultorio 201",
        estado: "Programada"
    },
    {
        id: 2,
        especialidad: "Ecocardiograma",
        doctor: "Cardiólogo Dr. Soto",
        fecha: "2025-09-20",
        hora: "08:00",
        ubicacion: "Consultorio 101",
        estado: "Asistida"
    },
    {
        id: 3,
        especialidad: "Examen de Sangre (Hemograma)",
        doctor: "Laboratorio Clínico",
        fecha: "2025-10-01",
        hora: "06:00",
        ubicacion: "Consultorio 102",
        estado: "Cancelada"
    },
    {
        id: 4,
        especialidad: "Radiografía de Tórax",
        doctor: "Dpto. de Radiología",
        fecha: "2025-08-30",
        hora: "14:00",
        ubicacion: "Consultorio 202",
        estado: "No Asistida"
    }
];

export async function GET() {
    return NextResponse.json(data);
}