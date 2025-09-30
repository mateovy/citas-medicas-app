'use client';
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function AgendarCitaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    tipoCita: '',
    especialidad: '',
    doctor: '',
    ubicacion: ''
  });

  const [appointmentData, setAppointmentData] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const [availableFields, setAvailableFields] = useState({
    especialidades: [],
    doctores: [],
    ubicaciones: ["Consultorio 101", "Consultorio 202"],
    horas: ["08:00", "09:00", "10:00", "14:00"]
  });

  useEffect(() => {
    fetch('/api/appointment-data')
      .then(res => res.json())
      .then(data => setAppointmentData(data))
      .catch(error => console.error("Error fetching appointment data:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'tipoCita' && value) {
      setFormData(prev => ({ ...prev, especialidad: '', doctor: '' }));
      setAvailableFields(prev => ({ ...prev, especialidades: Object.keys(appointmentData[value]) }));
    }
    if (name === 'especialidad' && value) {
      setFormData(prev => ({ ...prev, doctor: '' }));
      setAvailableFields(prev => ({ ...prev, doctores: appointmentData[formData.tipoCita][value] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevaCita = {
      ...formData,
      estado: 'Programada'
    };

    let citas = JSON.parse(localStorage.getItem('citas')) || [];

    const existe = citas.some(
      (cita) =>
        cita.doctor === nuevaCita.doctor &&
        cita.fecha === nuevaCita.fecha &&
        cita.hora === nuevaCita.hora
    );

    if (existe) {
      alert('⚠️ Ese doctor ya tiene una cita en ese horario.');
      return;
    }

    citas.push(nuevaCita);
    localStorage.setItem('citas', JSON.stringify(citas));

    alert('✅ Cita agendada con éxito.');
    router.push('/dashboard');
  };

  const isFormValid = Object.values(formData).every(field => field !== '');

  // 📅 Fechas disponibles (ejemplo: lunes a viernes, 2 meses desde hoy)
  const getDoctorDisponibilidad = (date) => {
    if (!formData.doctor) return false;
    const day = date.getDay();
    return day !== 0 && day !== 6; // lunes-viernes
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 2);

  const handleDateChange = (date) => {
    const fechaStr = date.toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, fecha: fechaStr, hora: '' }));
    setShowCalendar(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-base font-semibold">Agendar Nueva Cita</h2>
        <p className="text-sm text-gray-500 mb-6">
          Complete los datos para agendar su cita médica
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 📅 Campo Fecha con calendario plegable */}
          <div>
            <label className="text-sm font-semibold">Fecha</label>
            <div className="relative w-full mt-1">
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                disabled={!formData.doctor}
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none text-left disabled:bg-gray-200"
              >
                {formData.fecha || "Seleccione una fecha"}
              </button>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>

            {showCalendar && (
              <div className="mt-2">
                <Calendar
                  onChange={handleDateChange}
                  value={formData.fecha ? new Date(formData.fecha) : null}
                  minDate={today}
                  maxDate={maxDate}
                  tileDisabled={({ date }) => !getDoctorDisponibilidad(date)}
                />
              </div>
            )}
          </div>

          {/* ⏰ Campo Hora */}
          <div>
            <label className="text-sm font-semibold">Hora</label>
            <div className="relative w-full mt-1">
              <select
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none"
                required
              >
                <option value="">--:-- --</option>
                {availableFields.horas.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Tipo de Cita */}
          <div>
            <label className="text-sm font-semibold">Tipo de Cita</label>
            <div className="relative w-full mt-1">
              <select
                name="tipoCita"
                value={formData.tipoCita}
                onChange={handleChange}
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none"
                required
              >
                <option value="">Seleccione el tipo de cita</option>
                {appointmentData && Object.keys(appointmentData).map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Especialidad */}
          <div>
            <label className="text-sm font-semibold">Especialidad</label>
            <div className="relative w-full mt-1">
              <select
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                disabled={!formData.tipoCita}
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none disabled:bg-gray-200"
                required
              >
                <option value="">Seleccione la especialidad</option>
                {availableFields.especialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Doctor */}
          <div>
            <label className="text-sm font-semibold">Doctor</label>
            <div className="relative w-full mt-1">
              <select
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
                disabled={!formData.especialidad}
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none disabled:bg-gray-200"
                required
              >
                <option value="">Seleccione el doctor</option>
                {availableFields.doctores.map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="text-sm font-semibold">Ubicación</label>
            <div className="relative w-full mt-1">
              <select
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                disabled={!formData.doctor}
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none disabled:bg-gray-200"
                required
              >
                <option value="">Seleccione la ubicación</option>
                {availableFields.ubicaciones.map(ubi => (
                  <option key={ubi} value={ubi}>{ubi}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2 px-4 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#808080] hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Agendar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

