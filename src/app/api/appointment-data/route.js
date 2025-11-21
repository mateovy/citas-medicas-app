import { NextResponse } from 'next/server';

const data = {
    "Tomografía Computarizada (TAC)": ["Técnico Radiólogo a cargo"],
    "Resonancia Magnética (IRM)": ["Especialista en Imágenes Diagnósticas"],
    "Ecocardiograma": ["Cardiólogo Dr. Soto", "Técnico de Cardiología"],
    "Prueba de Esfuerzo": ["Cardiólogo Dr. Soto"],
    "Examen de Sangre (Hemograma)": ["Laboratorio Clínico"],
    "Endoscopia Superior": ["Gastroenterólogo Dr. Velez"],
    "Radiografía de Tórax": ["Dpto. de Radiología"],
    "Densitometría Ósea": ["Técnico en Densitometría"]
};

export async function GET() {
    return NextResponse.json(data);
}