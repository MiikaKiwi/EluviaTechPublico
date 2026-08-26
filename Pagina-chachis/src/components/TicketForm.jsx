import React, { useState } from 'react';

export default function TicketForm({ usuario, onLogout }) {
  const [cargando, setCargando] = useState(false);
  const [formData, setFormData] = useState({
    categoria: 'HARDWARE',
    titulo: '',
    descripcion: '',
    ubicacion: '', // <-- NUEVO: Lugar del suceso
    impacto: 'BAJO',
    urgencia: 'BAJA'
  });

  const categorias = [
    { id: 'HARDWARE', nombre: 'Equipos y Periféricos', img: 'https://img.icons8.com/color/96/imac.png', desc: 'Laptops, monitores, periféricos' },
    { id: 'SOFTWARE', nombre: 'Sistemas y Licencias', img: 'https://img.icons8.com/color/96/code.png', desc: 'Errores de software, permisos' },
    { id: 'REDES', nombre: 'Conexión y Red', img: 'https://img.icons8.com/color/96/wifi--v1.png', desc: 'Wi-Fi, VPN, caídas de red' },
    { id: 'ACCESOS', nombre: 'Cuentas y Seguridad', img: 'https://img.icons8.com/color/96/key.png', desc: 'Restablecer claves y acceso' }
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    // Registro automático de fecha/hora exacta del envío
    const payload = {
      ...formData,
      solicitante: usuario?.username || 'Anónimo',
      fecha_creacion: new Date().toISOString()
    };

    console.log("Enviando paquete a Django:", payload);
    
    // Simulación de envío a Django
    setTimeout(() => {
      setCargando(false);
      alert("Ticket registrado con éxito.");
      setFormData({ categoria: 'HARDWARE', titulo: '', descripcion: '', ubicacion: '', impacto: 'BAJO', urgencia: 'BAJA' });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#121212] font-sans text-zinc-100 antialiased selection:bg-blue-600 selection:text-white">
      
      {/* NAVBAR CON USUARIO Y LOGOUT */}
      <nav className="border-b border-zinc-800 bg-[#18181c]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-black p-1.5 rounded font-black tracking-tighter text-sm uppercase">
              ELUVIA TECH
            </div>
            <span className="text-sm font-bold tracking-wider text-zinc-300 uppercase hidden sm:inline">
              Asistente de Soporte TI
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full border border-zinc-700">
              👤 {usuario?.username || 'Analista'}
            </span>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO HEADER */}
      <header className="py-10 bg-gradient-to-b from-[#18181c] to-[#121212] border-b border-zinc-800/60 text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
          ¿En qué podemos ayudarte?
        </h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
          Selecciona una categoría y describe tu incidente para asignar un técnico.
        </p>
      </header>

      {/* FORMULARIO */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* CATEGORÍAS */}
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-4">
              1. Selecciona la categoría del incidente
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categorias.map((cat) => {
                const isSelected = formData.categoria === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, categoria: cat.id })}
                    className={`relative p-5 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-800/90 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                        : 'bg-[#18181c] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <img src={cat.img} alt={cat.nombre} className="w-10 h-10 object-contain" />
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white tracking-wide">{cat.nombre}</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DETALLES DEL TICKET */}
          <div className="bg-[#18181c] border border-zinc-800 rounded-lg p-6 space-y-5">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">
              2. Proporciona los detalles del evento
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Asunto o título corto</label>
                <input 
                  type="text" 
                  name="titulo" 
                  value={formData.titulo} 
                  onChange={handleChange} 
                  required
                  placeholder="Ej. Fallo de pantalla en PC de recepción" 
                  className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600"
                />
              </div>

              {/* CAMPO: LUGAR DEL SUCESO */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Lugar / Ubicación física</label>
                <input 
                  type="text" 
                  name="ubicacion" 
                  value={formData.ubicacion} 
                  onChange={handleChange} 
                  required
                  placeholder="Ej. Piso 2 - Sala de Reuniones B" 
                  className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Descripción completa del problema</label>
              <textarea 
                name="descripcion" 
                rows="4" 
                value={formData.descripcion} 
                onChange={handleChange} 
                required
                placeholder="Explica qué estabas realizando antes del fallo..." 
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-zinc-600 resize-none"
              ></textarea>
            </div>
          </div>

          {/* EVALUACIÓN DE AFECTACIÓN */}
          <div className="bg-[#18181c] border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                3. Evaluación de Afectación
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">Alcance del impacto</label>
                <select 
                  name="impacto" 
                  value={formData.impacto} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="BAJO">Solo afecta a mi estación</option>
                  <option value="MEDIO">Afecta a todo mi departamento</option>
                  <option value="ALTO">Afecta a toda la compañía</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase mb-2">Estado operativo</label>
                <select 
                  name="urgencia" 
                  value={formData.urgencia} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="BAJA">Puedo realizar otras actividades</option>
                  <option value="ALTA">Bloqueo operativo total</option>
                </select>
              </div>
            </div>
          </div>

          {/* BOTÓN ENVIAR */}
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs uppercase tracking-widest rounded transition-all duration-150 shadow-md hover:shadow-blue-500/20 cursor-pointer"
          >
            {cargando ? 'Registrando en Django...' : 'Enviar Solicitud de Soporte'}
          </button>

        </form>
      </main>
    </div>
  );
}