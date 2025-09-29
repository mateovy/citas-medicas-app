'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Componente para una tarjeta de estadística
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
    <p className="text-gray-600 font-semibold">{title}</p>
    <div className="flex items-center justify-between mt-2">
      <span className="text-3xl font-bold">{value}</span>
      <div className="text-2xl text-gray-500">{icon}</div>
    </div>
  </div>
);

// Componente para una tarjeta de cita
const CitaCard = ({ cita, onEdit, onDelete }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                    {cita.estado}
                </span>
                <h3 className="text-lg font-bold mt-2">{cita.tipo}</h3>
            </div>
            <div className="flex gap-2">
                <button onClick={onEdit} className="text-gray-500 hover:text-blue-600">✏️</button>
                <button onClick={onDelete} className="text-gray-500 hover:text-red-600">🗑️</button>
            </div>
        </div>
        <div className="mt-4 text-gray-600 space-y-2 text-sm">
            <p>🗓️ Día, (00) (mes) de (año) - {cita.fecha}</p>
            <p>🕔 {cita.hora}</p>
            <p>🧑‍⚕️ {cita.doctor} - ({cita.especialidad})</p>
            <p>📍 {cita.ubicacion}</p>
        </div>
    </div>
);


export default function DashboardPage() {
    const [usuario, setUsuario] = useState(null);
    const [citas, setCitas] = useState([]);
    const [tiempoSesion, setTiempoSesion] = useState('00:00');
    const router = useRouter();

    useEffect(() => {
        const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
        if (!usuarioGuardado) {
            router.push('/');
        } else {
            setUsuario(usuarioGuardado);
            const citasGuardadas = JSON.parse(localStorage.getItem('citas')) || [];
            setCitas(citasGuardadas);
        }

        const inicioSesion = parseInt(localStorage.getItem('inicioSesion'), 10);
        const intervalId = setInterval(() => {
            const ahora = Date.now();
            const diff = Math.floor((ahora - inicioSesion) / 1000);
            const minutos = String(Math.floor(diff / 60)).padStart(2, '0');
            const segundos = String(diff % 60).padStart(2, '0');
            setTiempoSesion(`${minutos}:${segundos}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [router]);

    const handleCerrarSesion = () => {
        localStorage.clear();
        router.push('/');
    };
    
    // Estadísticas
    const citasProgramadas = citas.filter(c => c.estado === 'Programada').length;
    const citasCompletadas = citas.filter(c => c.estado === 'Completada').length;
    const totalCitas = citas.length;

    if (!usuario) {
        return <p>Cargando...</p>; // O un spinner de carga
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">🗓️ Módulo de citas médicas</h1>
                        <p className="text-sm text-gray-500">Bienvenido, {usuario.nombre}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">⏱️ Sesión: {tiempoSesion}</span>
                        <button onClick={handleCerrarSesion} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800">
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Citas programadas" value={citasProgramadas} icon="🗓️" />
                    <StatCard title="Citas completadas" value={citasCompletadas} icon="✅" />
                    <StatCard title="Total de citas" value={totalCitas} icon="📊" />
                </div>
                
                {/* Acciones */}
                 <div className="flex justify-between items-center mb-6">
                    <div>
                        <button className="mr-2 py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg">Próximas citas ({citasProgramadas})</button>
                        <button className="py-2 px-4 text-gray-500 font-semibold rounded-lg">Historial (0)</button>
                    </div>
                    <Link href="/dashboard/agendar" className="py-2 px-5 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors">
                        + Agendar cita
                    </Link>
                </div>

                {/* Lista de Citas */}
                <div className="space-y-4">
                    {citasProgramadas > 0 ? (
                        citas
                            .filter(c => c.estado === 'Programada')
                            .map((cita, index) => (
                                <CitaCard 
                                    key={index}
                                    cita={cita}
                                    onEdit={() => alert('Función de editar no implementada.')}
                                    onDelete={() => alert('Función de eliminar no implementada.')}
                                />
                            ))
                    ) : (
                        <p className="text-center text-gray-500 mt-10">No tienes citas programadas.</p>
                    )}
                </div>
            </main>
        </div>
    );
}