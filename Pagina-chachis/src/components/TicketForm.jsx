import React, {
  useState
} from 'react';

export default function TicketForm({
  usuario,
  onCrearTicket,
  onVolver
}) {
  const [
    cargando,
    setCargando
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  // =====================================================
  // DATOS DEL FORMULARIO
  // =====================================================

  const [
    formData,
    setFormData
  ] = useState({
    categoria:
      'Equipos y Periféricos',

    titulo: '',

    descripcion: '',

    ubicacion:
      'Sector A',

    impacto:
      'BAJO',

    urgencia:
      'BAJA'
  });

  // =====================================================
  // CATEGORÍAS
  // =====================================================

  const categorias = [
    {
      id:
        'Equipos y Periféricos',

      nombre:
        'Equipos y Periféricos',

      icono:
        '🖥️',

      descripcion:
        'Computadores, monitores, impresoras, teclados, mouse y otros dispositivos.'
    },

    {
      id:
        'Sistemas y Licencias',

      nombre:
        'Sistemas y Licencias',

      icono:
        '💿',

      descripcion:
        'Programas, aplicaciones, sistemas internos, instalación y licenciamiento.'
    },

    {
      id:
        'Conexiones y Red',

      nombre:
        'Conexiones y Red',

      icono:
        '🌐',

      descripcion:
        'Internet, Wi-Fi, red interna y problemas de conexión.'
    },

    {
      id:
        'Cuentas y Seguridad',

      nombre:
        'Cuentas y Seguridad',

      icono:
        '🔐',

      descripcion:
        'Contraseñas, permisos, accesos, cuentas bloqueadas y seguridad.'
    }
  ];

  const sectores = [
    'Sector A',
    'Sector B',
    'Sector C',
    'Sector D',
    'Sector E'
  ];

  // =====================================================
  // CAMBIOS
  // =====================================================

  const handleChange = (
    e
  ) => {
    const {
      name,
      value
    } = e.target;

    setFormData(
      (actual) => ({
        ...actual,
        [name]:
          value
      })
    );
  };

  // =====================================================
  // PREVISUALIZACIÓN DE SEVERIDAD
  // =====================================================

  const calcularSeveridadVisual =
    () => {
      if (
        formData.urgencia ===
          'ALTA' ||
        formData.impacto ===
          'ALTO'
      ) {
        return 'ALTA';
      }

      if (
        formData.impacto ===
        'MEDIO'
      ) {
        return 'MEDIA';
      }

      return 'BAJA';
    };

  // =====================================================
  // LIMPIAR
  // =====================================================

  const limpiarFormulario =
    () => {
      setFormData({
        categoria:
          'Equipos y Periféricos',

        titulo: '',

        descripcion: '',

        ubicacion:
          'Sector A',

        impacto:
          'BAJO',

        urgencia:
          'BAJA'
      });
    };

  // =====================================================
  // ENVIAR A APP -> DJANGO
  // =====================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError('');

      if (
        !formData.titulo.trim()
      ) {
        setError(
          'Debes ingresar un asunto.'
        );

        return;
      }

      if (
        !formData.descripcion.trim()
      ) {
        setError(
          'Debes describir el problema.'
        );

        return;
      }

      const confirmar =
        window.confirm(
          `¿Enviar esta solicitud?\n\n` +
          `Categoría: ${formData.categoria}\n` +
          `Sector: ${formData.ubicacion}`
        );

      if (!confirmar) {
        return;
      }

      setCargando(true);

      try {
        // ===============================================
        // 🔧 BACKEND:
        //
        // Estos son LOS ÚNICOS datos que React manda
        // al crear el ticket.
        //
        // Django debe crear automáticamente:
        //
        // id
        // solicitante = request.user
        // estado = Pendiente
        // fecha = now
        // fecha_cierre = null
        // tecnico = null
        // severidad = calculada
        // ===============================================

        const datosParaBackend = {
          categoria:
            formData.categoria,

          asunto:
            formData.titulo.trim(),

          descripcion:
            formData.descripcion.trim(),

          ubicacion:
            formData.ubicacion,

          impacto:
            formData.impacto,

          urgencia:
            formData.urgencia
        };

        await onCrearTicket(
          datosParaBackend
        );

        limpiarFormulario();

        alert(
          'Solicitud registrada correctamente.'
        );

      } catch (
        errorPeticion
      ) {
        console.error(
          errorPeticion
        );

        setError(
          errorPeticion.message ||
          'No se pudo registrar la solicitud.'
        );

      } finally {
        setCargando(false);
      }
    };

  const severidadVisual =
    calcularSeveridadVisual();

  return (
    <div className="space-y-8">

      {/* ENCABEZADO */}

      <div className="flex items-start justify-between">

        <div>

          <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">
            Nueva solicitud
          </span>

          <h1 className="text-3xl font-extrabold text-white mt-1">
            Reportar problema TI
          </h1>

          <p className="text-sm text-zinc-500 mt-2">
            Ingresa toda la información necesaria para que soporte pueda atender el problema.
          </p>

          <p className="text-xs text-zinc-600 mt-1">
            Solicitante: {usuario?.username}
          </p>

        </div>

        <button
          type="button"
          onClick={
            onVolver
          }
          className="px-3 py-2 border border-zinc-700 rounded text-xs text-zinc-400 hover:text-white"
        >
          ← Volver
        </button>

      </div>

      {error && (

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>

      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-8"
      >

        {/* CATEGORÍAS */}

        <section>

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-4">
            1. Tipo de problema
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {categorias.map(
              (categoria) => {
                const seleccionado =
                  formData.categoria ===
                  categoria.id;

                return (
                  <button
                    key={
                      categoria.id
                    }
                    type="button"
                    onClick={() =>
                      setFormData(
                        (actual) => ({
                          ...actual,

                          categoria:
                            categoria.id
                        })
                      )
                    }
                    className={`p-5 rounded-lg border text-left transition-all ${
                      seleccionado
                        ? 'bg-zinc-800 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-[#18181c] border-zinc-800 hover:border-zinc-600'
                    }`}
                  >

                    <div className="text-3xl mb-4">
                      {categoria.icono}
                    </div>

                    <h3 className="text-sm font-bold text-white">
                      {categoria.nombre}
                    </h3>

                    <p className="text-xs text-zinc-500 mt-2">
                      {categoria.descripcion}
                    </p>

                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* INFORMACIÓN */}

        <section className="bg-[#18181c] border border-zinc-800 rounded-lg p-6 space-y-5">

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            2. Información del problema
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="md:col-span-2">

              <label className="block text-xs text-zinc-400 uppercase mb-2">
                Asunto
              </label>

              <input
                type="text"
                name="titulo"
                value={
                  formData.titulo
                }
                onChange={
                  handleChange
                }
                required
                maxLength={150}
                placeholder="Ej. Computador no enciende"
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="block text-xs text-zinc-400 uppercase mb-2">
                Sector
              </label>

              <select
                name="ubicacion"
                value={
                  formData.ubicacion
                }
                onChange={
                  handleChange
                }
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-700 rounded text-white text-sm"
              >

                {sectores.map(
                  (sector) => (
                    <option
                      key={
                        sector
                      }
                      value={
                        sector
                      }
                    >
                      {sector}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          <div>

            <label className="block text-xs text-zinc-400 uppercase mb-2">
              Descripción
            </label>

            <textarea
              name="descripcion"
              rows="5"
              value={
                formData.descripcion
              }
              onChange={
                handleChange
              }
              required
              placeholder="Describe el problema con el mayor detalle posible..."
              className="w-full px-4 py-3 bg-[#121212] border border-zinc-700 rounded text-white text-sm resize-none focus:outline-none focus:border-blue-500"
            />

          </div>

        </section>

        {/* IMPACTO */}

        <section className="bg-[#18181c] border border-zinc-800 rounded-lg p-6">

          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-5">
            3. Nivel de afectación
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>

              <label className="block text-xs text-zinc-400 uppercase mb-2">
                Impacto
              </label>

              <select
                name="impacto"
                value={
                  formData.impacto
                }
                onChange={
                  handleChange
                }
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-700 rounded text-white text-sm"
              >

                <option value="BAJO">
                  Bajo — Afecta a un usuario
                </option>

                <option value="MEDIO">
                  Medio — Afecta a varios usuarios
                </option>

                <option value="ALTO">
                  Alto — Afecta a un sector o servicio
                </option>

              </select>

            </div>

            <div>

              <label className="block text-xs text-zinc-400 uppercase mb-2">
                Urgencia
              </label>

              <select
                name="urgencia"
                value={
                  formData.urgencia
                }
                onChange={
                  handleChange
                }
                className="w-full px-4 py-3 bg-[#121212] border border-zinc-700 rounded text-white text-sm"
              >

                <option value="BAJA">
                  Baja — Se puede continuar trabajando
                </option>

                <option value="ALTA">
                  Alta — Impide continuar trabajando
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* RESUMEN */}

        <section className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6">

          <div className="flex justify-between items-center mb-5">

            <div>

              <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">
                Resumen
              </span>

              <p className="text-xs text-zinc-500 mt-1">
                La severidad definitiva será validada por el servidor.
              </p>

            </div>

            <SeveridadPreview
              severidad={
                severidadVisual
              }
            />

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <Resumen
              titulo="Categoría"
              valor={
                formData.categoria
              }
            />

            <Resumen
              titulo="Sector"
              valor={
                formData.ubicacion
              }
            />

            <Resumen
              titulo="Impacto"
              valor={
                formData.impacto
              }
            />

            <Resumen
              titulo="Urgencia"
              valor={
                formData.urgencia
              }
            />

          </div>

        </section>

        <button
          type="submit"
          disabled={
            cargando
          }
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white rounded font-bold text-xs uppercase tracking-widest"
        >

          {cargando
            ? 'Registrando...'
            : 'Enviar Solicitud'}

        </button>

      </form>

    </div>
  );
}

function Resumen({
  titulo,
  valor
}) {
  return (
    <div className="bg-[#121212] border border-zinc-800 rounded p-3">

      <span className="block text-[9px] uppercase text-zinc-500 mb-1">
        {titulo}
      </span>

      <span className="text-xs font-bold text-zinc-200">
        {valor}
      </span>

    </div>
  );
}

function SeveridadPreview({
  severidad
}) {
  const estilos =
    severidad === 'ALTA'
      ? 'text-red-400 bg-red-500/10 border-red-500/20'
      : severidad === 'MEDIA'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  return (
    <span
      className={`px-3 py-1.5 rounded border text-[10px] font-bold ${estilos}`}
    >
      SEVERIDAD {severidad}
    </span>
  );
}