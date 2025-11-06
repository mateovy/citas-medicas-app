'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Calendar, UserCheck, Clock, Plus, Trash2, MapPin, User, LogOut, SquarePen, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center w-full max-w-sm">
      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
      <p className="my-4 text-gray-700">{message}</p>
      <div className="flex justify-center gap-4">
        <button onClick={onCancel} className="py-2 px-6 border rounded-lg hover:bg-gray-100">No</button>
        <button onClick={onConfirm} className="py-2 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700">Sí, cancelar</button>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colors = { blue: 'text-blue-500', green: 'text-green-500', gray: 'text-gray-400' };
  return (
    <div className="bg-white p-4 rounded-lg border">
      <p className="text-xl text-gray-600 mb-10">{title}</p>
      <div className="flex items-center gap-1">
        <span className="text-2xl font-medium">{value}</span>
        <Icon className={colors[color] || 'text-gray-500'} size={28} />
      </div>
    </div>
  );
};

const CitaCard = ({ cita, onEdit, onDelete }) => {
  const today = new Date();
  const f = new Date(cita.fecha);
  const diffDays = Math.ceil((f.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const canEdit = cita.estado === 'Programada' && diffDays > 7;

  const statusColors = {
    Programada: 'bg-blue-100 text-blue-800',
    Asistida: 'bg-green-100 text-green-800',
    Cancelada: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white p-5 rounded-lg border">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-semibold text-gray-800">{cita.especialidad}</h3>
          <span className={`${statusColors[cita.estado] || 'bg-gray-100 text-gray-800'} text-xs font-semibold mt-1 px-2.5 py-0.5 rounded-full inline-block`}>
            {cita.estado}
          </span>
        </div>
        {cita.estado === 'Programada' && (
          <div className="flex gap-6">
            <button
              onClick={() => canEdit ? onEdit(cita) : alert('Solo se puede editar con más de 7 días de anticipación.')}
              className={`border rounded-md p-1 ${canEdit ? 'text-black hover:text-gray-500' : 'text-gray-300 cursor-not-allowed'}`}
              title={canEdit ? 'Editar cita' : 'Solo se puede editar con >7 días de anticipación'}
            >
              <SquarePen size={18} />
            </button>
            <button onClick={onDelete} className="text-black hover:text-red-500 border rounded-md p-1">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-gray-600 space-y-2 text-sm">
        <p className="flex items-center gap-2"><Calendar size={16} /> {cita.fecha}</p>
        <p className="flex items-center gap-2"><Clock size={16} /> {cita.hora}</p>
        <p className="flex items-center gap-2"><User size={16} /> {cita.doctor}</p>
        <p className="flex items-center gap-2"><MapPin size={16} /> {cita.ubicacion}</p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [usuario, setUsuario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tiempoSesion, setTiempoSesion] = useState('00:00');
  const [citaParaCancelar, setCitaParaCancelar] = useState(null);
  const [activeTab, setActiveTab] = useState('proximas');
  const router = useRouter();
  const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

  const handleCerrarSesion = useCallback(() => {
    localStorage.clear();
    router.push('/');
    alert('Tu sesión ha expirado por inactividad.');
  }, [router]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('usuario'));
    if (!u?.id) {
      router.push('/');
      return;
    }
    setUsuario(u);

    const loadCitas = async () => {
      try {
        const res = await fetch(`/api/citas?usuario_id=${u.id}`, { cache: 'no-store' });
        const rows = await res.json();
        setCitas(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error('Error al cargar citas:', e);
        setCitas([]);
      } finally {
        setLoading(false);
      }
    };

    loadCitas();

    const inicioSesion = parseInt(localStorage.getItem('inicioSesion'), 10);
    if (!inicioSesion) {
      router.push('/');
      return;
    }

    const intervalId = setInterval(() => {
      const t = Date.now() - inicioSesion;
      if (t > SESSION_TIMEOUT_MS) {
        clearInterval(intervalId);
        handleCerrarSesion();
      } else {
        const s = Math.floor(t / 1000);
        const m = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        setTiempoSesion(`${m}:${ss}`);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [router, handleCerrarSesion, SESSION_TIMEOUT_MS]);

  const handleConfirmCancel = async () => {
    if (!citaParaCancelar) return;
    try {
      const res = await fetch(`/api/citas?id=${citaParaCancelar.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al cancelar');
      setCitas(prev => prev.map(c => (c.id === citaParaCancelar.id ? { ...c, estado: 'Cancelada' } : c)));
      alert('✅ Cita cancelada correctamente.');
    } catch (e) {
      console.error(e);
      alert('❌ No se pudo cancelar la cita.');
    } finally {
      setCitaParaCancelar(null);
    }
  };

  const handleEditAppointment = (cita) => {
    router.push(`/dashboard/agendar?edit=${cita.id}`);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Cargando citas...</p></div>;

  const todayISO = new Date().toISOString().slice(0, 10);
  const proximas = citas.filter(c => c.estado === 'Programada' && c.fecha >= todayISO);
  const historial = citas.filter(c => c.estado === 'Cancelada' || (c.fecha < todayISO && c.estado !== 'Cancelada'));
  const asistidas = historial.filter(c => c.estado !== 'Cancelada').length;
  const canceladas = historial.filter(c => c.estado === 'Cancelada').length;

  const dataPie = [
    { name: 'Asistidas', value: asistidas, color: '#00FF8C' },
    { name: 'Canceladas', value: canceladas, color: '#FF3B3B' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-3 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full"><Calendar className="text-white" size={32} /></div>
            <div>
              <h1 className="text-3xl font-medium text-gray-800 mb-1">Módulo de Exámenes de Diagnóstico</h1>
              <p className="text-lg text-gray-500">Bienvenido, {usuario?.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 flex items-center gap-2"><Clock size={16} /> Sesión: {tiempoSesion}</span>
            <button onClick={handleCerrarSesion} className="py-2 px-4 border gap-2 flex items-center rounded-lg text-sm hover:bg-gray-100">
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex justify-end mb-6">
          <Link href="/dashboard/agendar" className="flex items-center gap-2 py-1 px-4 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800">
            <Plus size={20} /> Agendar cita
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Citas programadas" value={proximas.length} icon={Calendar} />
          <StatCard title="Citas completadas" value={asistidas} icon={UserCheck} color="green" />
          <StatCard title="Total de citas" value={citas.length} icon={Clock} color="gray" />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center rounded-md border bg-[#ECECEE] w-auto md:w-[360px]">
            <button onClick={() => setActiveTab('proximas')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl ${activeTab === 'proximas' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}>
              Próximas citas ({proximas.length})
            </button>
            <button onClick={() => setActiveTab('historial')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl ${activeTab === 'historial' ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500'}`}>
              Historial ({historial.length})
            </button>
          </div>

          <button onClick={() => setActiveTab('estadisticas')}
            className={`py-2 px-4 text-sm font-medium rounded-xl border ${activeTab === 'estadisticas' ? 'bg-white text-gray-800 shadow-sm' : 'bg-[#ECECEE] text-gray-500 hover:bg-gray-100'}`}>
            Mis estadísticas
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'proximas' && (
            proximas.length ? proximas.map(cita => (
              <CitaCard key={cita.id} cita={cita} onEdit={handleEditAppointment} onDelete={() => setCitaParaCancelar(cita)} />
            )) : <div className="text-center py-16 bg-white rounded-lg border"><p className="text-gray-500">No tienes citas programadas.</p></div>
          )}

          {activeTab === 'historial' && (
            historial.length ? historial.map(cita => (
              <CitaCard key={cita.id} cita={cita} onEdit={() => {}} onDelete={() => {}} />
            )) : <div className="text-center py-16 bg-white rounded-lg border"><p className="text-gray-500">Aún no tienes historial.</p></div>
          )}

          {activeTab === 'estadisticas' && (
            <div className="bg-white p-6 rounded-lg border text-center">
              <div className="w-full md:w-[400px] h-[250px] mx-auto mb-6">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={dataPie} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" startAngle={90} endAngle={-270} isAnimationActive={false}>
                      {dataPie.map((e, i) => <Cell key={i} fill={e.color} stroke="#fff" strokeWidth={2} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <h3 className="text-md font-semibold text-gray-800 mb-4">Total de citas analizadas ({historial.length})</h3>
              <ul className="text-left space-y-2 max-w-xs mx-auto">
                {dataPie.map((d, i) => {
                  const pct = historial.length ? Math.round((d.value / historial.length) * 100) : 0;
                  return (
                    <li key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span>({d.value}) {d.name} <span className="text-gray-500">({pct}%)</span></span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>

      {citaParaCancelar && (
        <ConfirmationModal message="¿Seguro(a) que quiere cancelar su cita?" onConfirm={handleConfirmCancel} onCancel={() => setCitaParaCancelar(null)} />
      )}
    </div>
  );
}
