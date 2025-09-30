'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileText, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState(''); // Estado para el mensaje de error
  const [isLoading, setIsLoading] = useState(false); // Estado para la carga
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Limpiamos errores previos

    if (!documento || !nombre) {
      alert('⚠️ Por favor complete todos los campos');
      setIsLoading(false);
      return;
    }
    
    // 1. Llamamos a nuestra nueva API de login
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento, nombre }),
        });

        const data = await res.json();

        // 2. Si la respuesta es exitosa (status 200-299)
        if (res.ok) {
            // Guardamos los datos y redirigimos
            localStorage.setItem('usuario', JSON.stringify(data.user));
            localStorage.setItem('inicioSesion', Date.now());
            localStorage.setItem('citas', JSON.stringify([]));
            router.push('/dashboard');
        } else {
            // 3. Si hay un error, mostramos el mensaje de la API
            setError(data.message || 'Ocurrió un error');
        }
    } catch (err) {
        setError('No se pudo conectar al servidor. Intente de nuevo.');
        console.error(err);
    } finally {
        setIsLoading(false); // Detenemos la carga
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFEFEF]">
      <div className="w-full max-w-md p-8 space-y-0 bg-white rounded-xl shadow-lg text-center">
        <div className="mx-auto flex items-center justify-center w-20 h-20 mb-6 bg-[#4848F7] rounded-full">
          <Calendar className='w-[48px] h-[48px] text-white' />
        </div>

        <h2 className="text-base font-semibold text-gray-800 mb-2">Módulo de Exámenes de Diagnóstico</h2>
        <p className="text-base font-medium font-[#Inter] text-[#808080] pb-5">
          Ingrese sus datos para acceder al sistema de citas de diagnóstico
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          {/* Aquí mostramos el mensaje de error si existe */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                <AlertCircle size={20} />
                <span>{error}</span>
            </div>
          )}

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
            disabled={isLoading} // Deshabilitamos el botón mientras carga
            className="w-full py-[6px] font-bold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}