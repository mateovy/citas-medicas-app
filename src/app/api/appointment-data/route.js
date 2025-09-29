import { NextResponse } from 'next/server';


const data = {
    "General": {
        "Medicina General": ["Dr. Pérez", "Dr. Gómez"],
        "Odontología": ["Dra. Ramírez"]
    },
    "Especializada": {
        "Cardiología": ["Dr. Corazón"],
        "Dermatología": ["Dra. Piel"]
    }
};

export async function GET() {

    return NextResponse.json(data);
}