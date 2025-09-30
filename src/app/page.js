'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileText, User } from 'lucide-react';


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
      <div className="w-full max-w-md p-8 space-y-0 bg-white rounded-xl shadow-lg text-center">
        {/* Icono */}
        <div className="mx-auto flex items-center justify-center w-20 h-20 mb-6 bg-[#4848F7] rounded-full">
          <Calendar className='w-[48px] h-[48px] text-white' />
        </div>

        {/* Títulos */}
        <h2 className="text-base font-semibold text-gray-800 mb-2">Módulo de Citas Médicas</h2>
        <p className="text-base font-medium font-[#Inter] text-[#808080] pb-5">
          Ingrese sus datos para acceder al sistema de citas de diagnóstico
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label htmlFor="documento" className="text-sm font-semibold text-black">
              Documento de Identidad
            </label>
            <div className="relative">
              <FileText
                className="absolute left-2 top-[55%] -translate-y-1/2 h-5 w-5 text-gray-500"
              />
              <input
                id="documento"
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ingrese su documento de identidad"
                className="w-full pl-9 pr-4 py-[6px] mt-1 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#808080] placeholder:font-medium"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="nombre" className="text-sm font-semibold text-black">
              Nombre Completo
            </label>
            <div className="relative mb-1">
              <User
                className="absolute left-2 top-[55%] -translate-y-1/2 h-5 w-5 text-[#808080]"
              />

              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese su nombre completo"
                className="w-full pl-9 pr-4 py-[6px] mt-1 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#808080] placeholder:font-medium"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-[6px] font-bold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}