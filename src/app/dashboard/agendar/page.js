'use client';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AgendarCitaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const citaIndexParam = searchParams.get('edit');
  const isEditMode = citaIndexParam !== null;

  const [formData, setFormData] = useState({
    fecha: null,
    hora: '',
    especialidad: '',
    doctor: '',
    ubicacion: '',
  });

  const [appointmentData, setAppointmentData] = useState(null);
  const [availableFields, setAvailableFields] = useState({
    doctores: [],
    ubicaciones: [
      'Consultorio 101',
      'Consultorio 102',
      'Consultorio 201',
      'Consultorio 202',
    ],
    horas: ['06:00', '08:00', '10:00', '14:00', '16:00'],
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  useEffect(() => {
    fetch('/api/appointment-data')
      .then((res) => res.json())
      .then((data) => {
        setAppointmentData(data);

        if (isEditMode) {
          const stored = localStorage.getItem('cita_edit');
          if (stored) {
            const citaAEditar = JSON.parse(stored);
            setFormData({
              ...citaAEditar,
              fecha: new Date(citaAEditar.fecha),
            });
            setAvailableFields((prev) => ({
              ...prev,
              doctores: data[citaAEditar.especialidad] || [],
            }));
          }
        }
      })
      .catch((error) =>
        console.error('Error fetching appointment data:', error)
      );
  }, [isEditMode, citaIndexParam]);

  const handleDateChange = (date) =>
    setFormData((prev) => ({ ...prev, fecha: date }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'especialidad' && value) {
      setFormData((prev) => ({ ...prev, doctor: '' }));
      setAvailableFields((prev) => ({
        ...prev,
        doctores: appointmentData[value] || [],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fecha ||
      !formData.hora ||
      !formData.especialidad ||
      !formData.doctor ||
      !formData.ubicacion
    ) {
      alert('⚠️ Todos los campos son obligatorios.');
      return;
    }

    // 🔹 Recuperar usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.id) {
      alert('⚠️ No se encontró información del usuario. Inicia sesión nuevamente.');
      router.push('/');
      return;
    }

    const nuevaCita = {
      usuario_id: usuario.id, // 👈 importante para Supabase
      especialidad: formData.especialidad,
      doctor: formData.doctor,
      fecha: formData.fecha.toISOString().split('T')[0],
      hora: formData.hora,
      ubicacion: formData.ubicacion,
      estado: 'Programada',
    };

    try {
      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaCita),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Error Supabase:', data);
        throw new Error('Error al guardar la cita.');
      }

      alert('✅ Cita agendada con éxito en Supabase.');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ No se pudo agendar la cita.');
    }
  };

  const isFormValid =
    formData.fecha &&
    formData.hora &&
    formData.especialidad &&
    formData.doctor &&
    formData.ubicacion;

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-base font-semibold">
          {isEditMode ? 'Editar Cita' : 'Agendar Nueva Cita'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {isEditMode
            ? 'Complete los datos para editar su cita médica'
            : 'Complete los datos para agendar su examen'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Especialidad</label>
            <div className="relative w-full mt-1">
              <select
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none"
                required
              >
                <option value="">Seleccione la especialidad</option>
                {appointmentData &&
                  Object.keys(appointmentData).map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

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
                {availableFields.doctores.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Fecha</label>
              <DatePicker
                selected={formData.fecha}
                onChange={handleDateChange}
                filterDate={isWeekday}
                minDate={tomorrow}
                dateFormat="dd-MM-yyyy"
                placeholderText="dd-mm-yy"
                className="w-full mt-1 p-[7px] bg-gray-100 rounded-xl border-none"
                required
              />
            </div>
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
                  {availableFields.horas.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-black" />
                </div>
              </div>
            </div>
          </div>

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
                {availableFields.ubicaciones.map((ubi) => (
                  <option key={ubi} value={ubi}>
                    {ubi}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

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
              {isEditMode ? 'Guardar Cambios' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
