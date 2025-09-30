// src/app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Importamos los íconos de Lucide React
import { Calendar, UserCheck, Clock, Plus, Pencil, Trash2, CalendarDays, MapPin, User, LogOut, SquarePen } from 'lucide-react';

// --- COMPONENTES RE-ESTILIZADOS ---

// Componente para las tarjetas de estadísticas (ahora con el ícono a la derecha)
const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
    // 1. Mapeo de colores a clases de Tailwind
    const colorVariants = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        gray: 'text-gray-400'
    };

    // 2. Selecciona la clase de color o usa una por defecto si no se encuentra
    const iconColorClass = colorVariants[color] || 'text-gray-500';

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xl text-gray-506 mb-10">{title}</p>
            <div className="flex items-center justify-start gap-1 mb-3">
                <span className="text-2xl font-medium">{value}</span>
                {/* 3. Aplica la clase de color dinámica al ícono */}
                <Icon className={iconColorClass} size={28} />
            </div>
        </div>
    );
};

// Componente para la tarjeta de cita (diseño exacto al de la imagen)
const CitaCard = ({ cita, onEdit, onDelete }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-md font-semibold text-gray-800">{cita.tipoCita}</h3>
                <span className="bg-[#0080FF80] text-[#0040FF] text-xs font-semibold mt-1 px-2.5 py-0.5 rounded-full inline-block">
                    {cita.estado}
                </span>
            </div>
            <div className="flex gap-6">
                <button onClick={onEdit} className="text-black hover:text-gray-500 border-gray-200 border rounded-md p-1">
                    <SquarePen size={18} />
                </button>
                <button onClick={onDelete} className="text-black hover:text-red-500 border-gray-200 border rounded-md p-1">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
        <div className="mt-4 text-gray-600 space-y-2 text-sm">
            <h2 className='text-2xl'>{cita.tipo}</h2>
            <p className="flex items-center gap-2"><Calendar size={16} /> {cita.fecha}</p>
            <p className="flex items-center gap-2"><Clock size={16} /> {cita.hora}</p>
            <p className="flex items-center gap-2"><User size={16} /> {cita.doctor} - ({cita.especialidad})</p>
            <p className="flex items-center gap-2"><MapPin size={16} /> {cita.ubicacion} - Piso 1</p>
        </div>
    </div>
);

// --- PÁGINA PRINCIPAL DEL DASHBOARD ---

export default function DashboardPage() {
    const [usuario, setUsuario] = useState(null);
    const [citas, setCitas] = useState([]);
    const [tiempoSesion, setTiempoSesion] = useState('00:00');
    const router = useRouter();

    useEffect(() => {
        // Lógica de sesión (sin cambios)
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

    const citasProgramadas = citas.filter(c => c.estado === 'Programada').length;
    const citasCompletadas = citas.filter(c => c.estado === 'Completada').length;
    const totalCitas = citas.length;

    if (!usuario) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Cargando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA]">
            {/* Header: Sencillo y limpio como en la imagen */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto py-3 px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-500 p-2 rounded-full">
                            <Calendar className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-medium text-gray-800 mb-1">Módulo de citas médicas</h1>
                            <p className="text-lg text-gray-500">Bienvenido, {usuario.nombre}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock size={16} /> Sesión: {tiempoSesion}
                        </span>
                        <button onClick={handleCerrarSesion} className="py-2 px-4 border gap-2 flex items-center border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">
                            <LogOut size={18} /> Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Botón Agendar Cita (ahora arriba a la derecha) */}
                <div className="flex justify-end mb-6">
                    <Link href="/dashboard/agendar" className="flex items-center gap-2 py-1 px-4 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors">
                        <Plus size={20} />
                        Agendar cita
                    </Link>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Citas programadas" value={citasProgramadas} icon={Calendar} />
                    <StatCard title="Citas completadas" value={citasCompletadas} icon={User} color="green" />
                    <StatCard title="Total de citas" value={totalCitas} icon={Clock} color="gray" />
                </div>

                {/* Tabs para filtrar citas */}
                <div className="flex items-center mb-6 rounded-md border border-gray-200 bg-[#ECECEE] w-[360px]">
                    {/* Botón 1: Añadido flex-1 y text-center para consistencia */}
                    <button className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white rounded-xl border border-gray-200 border-b-0 text-center">
                        Próximas citas ({citasProgramadas})
                    </button>

                    {/* Botón 2: Se quitó el <p> y se añadió flex-1 y text-center */}
                    <button className="flex-1 py-2 px-4 text-sm rounded-xl font-medium text-gray-500 hover:bg-gray-50 text-center">
                        Historial ({citasCompletadas})
                    </button>
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
                                    onDelete={() => {
                                        if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
                                            alert('Función de eliminar no implementada.');
                                        }
                                    }}
                                />
                            ))
                    ) : (
                        <div className="text-center py-16 px-6 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-500">No tienes citas programadas.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}