"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  List,
  UserCheck,
  Clock,
  Plus,
  Trash2,
  MapPin,
  User,
  LogOut,
  SquarePen,
  AlertTriangle,
} from "lucide-react";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-xl text-center w-full max-w-sm">
      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
      <p className="my-4 text-gray-700">{message}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="py-2 px-6 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
        >
          No
        </button>
        <button
          onClick={onConfirm}
          className="py-2 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
        >
          Sí, cancelar
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const colorVariants = {
    blue: "text-blue-500",
    green: "text-green-500",
    gray: "text-gray-400",
  };
  const iconColorClass = colorVariants[color] || "text-gray-500";
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-xl text-gray-506 mb-10">{title}</p>
      <div className="flex items-center justify-start gap-1 mb-3">
        <span className="text-2xl font-medium">{value}</span>
        <Icon className={iconColorClass} size={28} />
      </div>
    </div>
  );
};

const CitaCard = ({ cita, onEdit, onDelete }) => {
  const isEditable = () => {
    const today = new Date();
    const appointmentDate = new Date(cita.fecha);
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  };
  const canEdit = isEditable();

  const handleEditClick = () => {
    if (canEdit) onEdit();
    else alert("Solo puedes editar citas con al menos 7 días de anticipación.");
  };

  const statusColors = {
    Programada: "bg-blue-100 text-blue-800",
    Asistida: "bg-green-100 text-green-800",
    Cancelada: "bg-red-100 text-red-800",
    "No Asistida": "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-semibold text-gray-800">
            {cita.especialidad}
          </h3>
          <span
            className={`${
              statusColors[cita.estado] || "bg-gray-100 text-gray-800"
            } text-xs font-semibold mt-1 px-2.5 py-0.5 rounded-full inline-block`}
          >
            {cita.estado}
          </span>
        </div>
        {cita.estado === "Programada" && (
          <div className="flex gap-6">
            <button
              onClick={handleEditClick}
              className={`border-gray-200 border rounded-md p-1 ${
                canEdit
                  ? "text-black hover:text-gray-500"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title={!canEdit ? "No se puede editar" : "Editar cita"}
            >
              <SquarePen size={18} />
            </button>
            <button
              onClick={onDelete}
              className="text-black hover:text-red-500 border-gray-200 border rounded-md p-1"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 text-gray-600 space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <Calendar size={16} /> {cita.fecha}
        </p>
        <p className="flex items-center gap-2">
          <Clock size={16} /> {cita.hora}
        </p>
        <p className="flex items-center gap-2">
          <User size={16} /> {cita.doctor}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} /> {cita.ubicacion} - Piso 1
        </p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [usuario, setUsuario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [tiempoSesion, setTiempoSesion] = useState("00:00");
  const [citaParaCancelar, setCitaParaCancelar] = useState(null);
  const [activeTab, setActiveTab] = useState("proximas");
  const router = useRouter();

  const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

  const handleCerrarSesion = useCallback(() => {
    localStorage.clear();
    router.push("/");
    alert("Tu sesión ha expirado por inactividad.");
  }, [router]);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (!usuarioGuardado) {
      router.push("/");
      return;
    }
    setUsuario(usuarioGuardado);

    const loadCitas = async () => {
      try {
        const response = await fetch("/api/citas");
        const apiCitas = await response.json();
        const localCitas =
          JSON.parse(localStorage.getItem("citas")) || apiCitas;
        setCitas(localCitas);
      } catch (error) {
        console.error("Error al cargar las citas:", error);
        const localCitas = JSON.parse(localStorage.getItem("citas")) || [];
        setCitas(localCitas);
      }
    };
    loadCitas();

    const inicioSesion = parseInt(localStorage.getItem("inicioSesion"), 10);
    if (!inicioSesion) {
      router.push("/");
      return;
    }
    const intervalId = setInterval(() => {
      const tiempoTranscurrido = Date.now() - inicioSesion;
      if (tiempoTranscurrido > SESSION_TIMEOUT_MS) {
        clearInterval(intervalId);
        handleCerrarSesion();
      } else {
        const diffSeconds = Math.floor(tiempoTranscurrido / 1000);
        const minutos = String(Math.floor(diffSeconds / 60)).padStart(2, "0");
        const segundos = String(diffSeconds % 60).padStart(2, "0");
        setTiempoSesion(`${minutos}:${segundos}`);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [router, handleCerrarSesion]);

  const handleConfirmCancel = () => {
    if (!citaParaCancelar) return;
    const nuevasCitas = citas.map((cita) =>
      cita === citaParaCancelar ? { ...cita, estado: "Cancelada" } : cita
    );
    setCitas(nuevasCitas);
    localStorage.setItem("citas", JSON.stringify(nuevasCitas));
    setCitaParaCancelar(null);
  };

  const handleEditAppointment = (citaAEditar) => {
    const citaIndex = citas.findIndex((cita) => cita.id === citaAEditar.id);
    router.push(`/dashboard/agendar?edit=${citaIndex}`);
  };

  const today = new Date().toISOString().split("T")[0];
  const proximasCitas = citas.filter(
    (c) => c.estado === "Programada" && c.fecha >= today
  );
  const historialCitas = citas.filter(
    (c) => c.estado !== "Programada" || c.fecha < today
  );

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-3 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full">
              <Calendar className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-medium text-gray-800 mb-1">
                Módulo de Exámenes de Diagnóstico
              </h1>
              <p className="text-lg text-gray-500">
                Bienvenido, {usuario.nombre}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Clock size={16} /> Sesión: {tiempoSesion}
            </span>
            <button
              onClick={handleCerrarSesion}
              className="py-2 px-4 border gap-2 flex items-center border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              <LogOut size={18} /> Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Botón Agendar cita */}
        <div className="flex justify-end mb-6">
          <Link
            href="/dashboard/agendar"
            className="flex items-center gap-2 py-1 px-4 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Agendar cita
          </Link>
        </div>

        {/* Tarjetas de estadísticas pequeñas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Citas programadas"
            value={proximasCitas.length}
            icon={Calendar}
          />
          <StatCard
            title="Citas completadas"
            value={citas.filter((c) => c.estado === "Asistida").length}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Total de citas"
            value={citas.length}
            icon={Clock}
            color="gray"
          />
        </div>

        {/* Barra de tabs + botón de estadísticas (misma apariencia, estadísticas a la derecha) */}
        <div className="flex justify-between items-center mb-6">
          {/* Tabs de Próximas e Historial */}
          <div className="flex items-center rounded-md border border-gray-200 bg-[#ECECEE] w-auto md:w-[360px]">
            <button
              onClick={() => setActiveTab("proximas")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl text-center ${
                activeTab === "proximas"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "bg-transparent text-gray-500"
              }`}
            >
              Próximas citas ({proximasCitas.length})
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl text-center ${
                activeTab === "historial"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "bg-transparent text-gray-500"
              }`}
            >
              Historial ({historialCitas.length})
            </button>
          </div>

          {/* Botón Mis Estadísticas (a la derecha, mismo color/estilo visual) */}
          <button
            onClick={() => setActiveTab("estadisticas")}
            className={`py-2 px-4 text-sm font-medium rounded-xl border border-gray-200 transition-colors
        ${
          activeTab === "estadisticas"
            ? "bg-white text-gray-800 shadow-sm"
            : "bg-[#ECECEE] text-gray-500 hover:bg-gray-100"
        }`}
          >
            Mis estadísticas
          </button>
        </div>

        {/* Contenido principal: Próximas / Historial / Estadísticas */}
        <div className="space-y-4">
          {/* Próximas citas */}
          {activeTab === "proximas" &&
            (proximasCitas.length > 0 ? (
              proximasCitas.map((cita) => (
                <CitaCard
                  key={cita.id}
                  cita={cita}
                  onEdit={() => handleEditAppointment(cita)}
                  onDelete={() => setCitaParaCancelar(cita)}
                />
              ))
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No tienes citas programadas.</p>
              </div>
            ))}

          {/* Historial */}
          {activeTab === "historial" &&
            (historialCitas.length > 0 ? (
              historialCitas.map((cita) => (
                <CitaCard key={cita.id} cita={cita} />
              ))
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  Aún no tienes un historial de citas.
                </p>
              </div>
            ))}

          {/* Estadísticas (con gráfico circular y colores) */}
          {activeTab === "estadisticas" && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              {citas.length > 0 ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Tus estadísticas
                  </h2>

                  {(() => {
                    // Excluir las programadas
                    const citasFiltradas = citas.filter(
                      (c) => c.estado !== "Programada"
                    );

                    const totalFiltradas = citasFiltradas.length;

                    const asistidas = citasFiltradas.filter(
                      (c) => c.estado === "Asistida"
                    ).length;
                    const canceladas = citasFiltradas.filter(
                      (c) => c.estado === "Cancelada"
                    ).length;
                    const noAsistidas = citasFiltradas.filter(
                      (c) => c.estado === "No Asistida"
                    ).length;

                    const data = [
                      {
                        name: "Citas Asistidas",
                        value: asistidas,
                        color: "#00FF8C", // verde neón
                        icon: (
                          <CheckCircle
                            className="text-[#00FF8C] inline drop-shadow-sm"
                            size={20}
                          />
                        ),
                      },
                      {
                        name: "Citas Canceladas",
                        value: canceladas,
                        color: "#FFD700", // amarillo neón
                        icon: (
                          <AlertCircle
                            className="text-[#FFD700] inline drop-shadow-sm"
                            size={20}
                          />
                        ),
                      },
                      {
                        name: "Citas No Asistidas",
                        value: noAsistidas,
                        color: "#FF3B3B", // rojo brillante
                        icon: (
                          <XCircle
                            className="text-[#FF3B3B] inline drop-shadow-sm"
                            size={20}
                          />
                        ),
                      },
                    ];

                    const total =
                      asistidas + canceladas + noAsistidas > 0
                        ? asistidas + canceladas + noAsistidas
                        : 1;

                    return (
                      <div className="flex flex-col items-center">
                        <div className="w-full md:w-[400px] h-[250px] mb-6">
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                dataKey="value"
                                isAnimationActive={false} // 👈 se muestra completa
                                startAngle={90}
                                endAngle={-270}
                              >
                                {data.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="#FFFFFF"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <h3 className="text-md font-semibold text-gray-800 mb-4">
                          Total de citas analizadas ({totalFiltradas})
                        </h3>

                        <ul className="text-left space-y-2">
                          {data.map((item, i) => {
                            const porcentaje = Math.round(
                              (item.value / total) * 100
                            );
                            return (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-gray-700 font-medium"
                              >
                                {item.icon}
                                <span>
                                  ({item.value}) {item.name}{" "}
                                  <span className="text-gray-500">
                                    ({porcentaje}%)
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-6">
                    <div className="bg-[#ECECEE] p-6 rounded-full inline-flex">
                      <Calendar size={48} className="text-gray-400" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay estadísticas disponibles
                  </h2>
                  <p className="text-gray-500">
                    Aún no hay datos para mostrar en esta sección.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {citaParaCancelar && (
        <ConfirmationModal
          message="¿Seguro(a) que quiere cancelar su cita?"
          onConfirm={handleConfirmCancel}
          onCancel={() => setCitaParaCancelar(null)}
        />
      )}
    </div>
  );
}
