'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CalendarIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

export default function LoginPage() {
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!documento || !nombre) {
      alert('⚠️ Por favor complete todos los campos');
      return;
    }

    localStorage.setItem('usuario', JSON.stringify({ nombre, documento }));
    localStorage.setItem('inicioSesion', Date.now());
    localStorage.setItem('citas', JSON.stringify([])); 

    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fdeeee]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
        {/* Icono */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full">
          <CalendarIcon />
        </div>

        {/* Títulos */}
        <h2 className="text-2xl font-bold text-gray-800">Módulo de Citas Médicas</h2>
        <p className="text-sm text-gray-600">
          Ingrese sus datos para acceder al sistema de citas de diagnóstico
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="documento" className="text-sm font-bold text-gray-700">
              Documento de Identidad
            </label>
            <div className="relative">
              <input
                id="documento"
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ingrese su documento de identidad"
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="nombre" className="text-sm font-bold text-gray-700">
              Nombre Completo
            </label>
            <div className="relative">
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese su nombre completo"
                className="w-full px-4 py-2 mt-1 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}