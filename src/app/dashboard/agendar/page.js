'use client';
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AgendarCitaPage() {
  const router = useRouter();
  
  // 1. Eliminamos 'tipoCita' del estado del formulario
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '',
    especialidad: '',
    doctor: '',
    ubicacion: ''
  });

  const [appointmentData, setAppointmentData] = useState(null);
  const [availableFields, setAvailableFields] = useState({
    doctores: [],
    ubicaciones: ["Consultorio 101", "Consultorio 202"],
    horas: ["08:00", "09:00", "10:00", "14:00"]
  });

  // Carga los datos de la API al iniciar
  useEffect(() => {
    fetch('/api/appointment-data')
      .then(res => res.json())
      .then(data => setAppointmentData(data))
      .catch(error => console.error("Error fetching appointment data:", error));
  }, []);

  // 2. Simplificamos la lógica de 'handleChange'
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Ahora la lógica depende directamente de 'especialidad'
    if (name === 'especialidad' && value) {
      setFormData(prev => ({ ...prev, doctor: '' }));
      // Buscamos los doctores en la nueva estructura de datos
      setAvailableFields(prev => ({ ...prev, doctores: appointmentData[value] || [] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevaCita = {
      ...formData,
      estado: 'Programada'
    };

    let citas = JSON.parse(localStorage.getItem('citas')) || [];
    citas.push(nuevaCita);
    localStorage.setItem('citas', JSON.stringify(citas));

    alert('✅ Cita agendada con éxito.');
    router.push('/dashboard');
  };

  // 3. La validación se ajusta automáticamente al no tener 'tipoCita'
  const isFormValid = formData.fecha && formData.hora && formData.especialidad && formData.doctor && formData.ubicacion;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 bg-opacity-75">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-base font-semibold">Agendar Nueva Cita</h2>
        <p className="text-sm text-gray-500 mb-6">Complete los datos para agendar su exámen</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Fecha</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full mt-1 p-[7px] bg-gray-100 rounded-xl border-none" required />
            </div>
            <div>
              <label className="text-sm font-semibold">Hora</label>
              <div className="relative w-full mt-1">
                <select name="hora" value={formData.hora} onChange={handleChange} className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none" required >
                  <option value="">--:-- --</option>
                  {availableFields.horas.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-black" />
                </div>
              </div>
            </div>
          </div>
          
          {/* 4. Hemos eliminado completamente el campo 'Tipo de Cita' de aquí */}

          {/* Campo Especialidad (ahora es el primer selector) */}
          <div>
            <label className="text-sm font-semibold">Especialidad</label>
            <div className="relative w-full mt-1">
              <select
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                // Ya no necesita estar deshabilitado al inicio
                className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none"
                required
              >
                <option value="">Seleccione la especialidad</option>
                {/* Cargamos las especialidades directamente */}
                {appointmentData && Object.keys(appointmentData).map(esp => <option key={esp} value={esp}>{esp}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Campo Doctor */}
          <div>
            <label className="text-sm font-semibold">Doctor</label>
            <div className="relative w-full mt-1">
              <select name="doctor" value={formData.doctor} onChange={handleChange} disabled={!formData.especialidad} className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none disabled:bg-gray-200" required>
                <option value="">Seleccione el doctor</option>
                {availableFields.doctores.map(doc => <option key={doc} value={doc}>{doc}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          {/* Campo Ubicación */}
          <div>
            <label className="text-sm font-semibold">Ubicación</label>
            <div className="relative w-full mt-1">
              <select name="ubicacion" value={formData.ubicacion} onChange={handleChange} disabled={!formData.doctor} className="w-full p-2 pr-10 bg-gray-100 rounded-xl border-none appearance-none disabled:bg-gray-200" required>
                <option value="">Seleccione la ubicación</option>
                {availableFields.ubicaciones.map(ubi => <option key={ubi} value={ubi}>{ubi}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => router.back()} className="flex-1 py-2 px-4 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100">
              Cancelar
            </button>
            <button type="submit" disabled={!isFormValid} className="flex-1 py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#808080] hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed">
              Agendar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}