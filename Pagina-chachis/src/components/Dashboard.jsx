import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

export default function Dashboard({
  tickets = [],
  usuario,
  cargando = false,
  apiUrl,
  onRecargar,
  onCambiarEstado,
  onAsignarTecnico,
  onEditarTicket
}) {
  // =====================================================
  // FILTROS
  // =====================================================

  const [
    filtroEstado,
    setFiltroEstado
  ] = useState('TODOS');

  const [
    filtroSeveridad,
    setFiltroSeveridad
  ] = useState('TODAS');

  const [
    filtroCategoria,
    setFiltroCategoria
  ] = useState('TODAS');

  const [
    filtroUbicacion,
    setFiltroUbicacion
  ] = useState('TODAS');

  const [
    busqueda,
    setBusqueda
  ] = useState('');

  // =====================================================
  // MODALES
  // =====================================================

  const [
    ticketSeleccionado,
    setTicketSeleccionado
  ] = useState(null);

  const [
    ticketEditando,
    setTicketEditando
  ] = useState(null);

  // =====================================================
  // TÉCNICOS DEL BACKEND
  // =====================================================

  const [
    tecnicosDisponibles,
    setTecnicosDisponibles
  ] = useState([]);

  const [
    cargandoTecnicos,
    setCargandoTecnicos
  ] = useState(false);

  // =====================================================
  // ROLES
  // =====================================================

  const rolNormalizado =
    usuario?.rol
      ?.toUpperCase()
      ?.normalize('NFD')
      ?.replace(
        /[\u0300-\u036f]/g,
        ''
      );

  const esAdmin =
    rolNormalizado === 'ADMIN';

  const esTecnico =
    rolNormalizado === 'TECNICO';

  const esSolicitante =
    rolNormalizado ===
    'SOLICITANTE';

  // =====================================================
  // CATEGORÍAS DEL SISTEMA
  // =====================================================

  const categoriasSistema = [
    'Equipos y Periféricos',
    'Sistemas y Licencias',
    'Conexiones y Red',
    'Cuentas y Seguridad'
  ];

  const sectoresSistema = [
    'Sector A',
    'Sector B',
    'Sector C',
    'Sector D',
    'Sector E'
  ];

  // =====================================================
  // CARGAR TÉCNICOS
  // =====================================================

  useEffect(() => {
    if (!esAdmin) {
      return;
    }

    const cargarTecnicos =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          );

        setCargandoTecnicos(
          true
        );

        try {
          // =============================================
          // 🔧 BACKEND:
          //
          // Esperamos:
          //
          // GET /api/tecnicos/
          //
          // [
          //   {
          //     "id": 2,
          //     "username": "Carlos Ruiz"
          //   }
          // ]
          //
          // También acepta DRF paginado:
          //
          // { "results": [...] }
          // =============================================

          const response =
            await fetch(
              `${apiUrl}/tecnicos/`,
              {
                headers: {
                  Authorization:
                    `Token ${token}`
                }
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.detail ||
              'No se pudieron cargar los técnicos.'
            );
          }

          setTecnicosDisponibles(
            Array.isArray(data)
              ? data
              : data?.results ||
                  []
          );

        } catch (error) {
          console.error(
            'Error cargando técnicos:',
            error
          );

        } finally {
          setCargandoTecnicos(
            false
          );
        }
      };

    cargarTecnicos();

  }, [
    esAdmin,
    apiUrl
  ]);

  // =====================================================
  // NORMALIZAR SOLICITANTE
  // =====================================================

  const obtenerNombreSolicitante =
    (ticket) => {
      if (
        typeof ticket.solicitante ===
        'string'
      ) {
        return ticket.solicitante;
      }

      return (
        ticket.solicitante
          ?.username ||
        ticket.solicitante_nombre ||
        'Sin registro'
      );
    };

  // =====================================================
  // NORMALIZAR TÉCNICO
  // =====================================================

  const obtenerNombreTecnico =
    (ticket) => {
      if (!ticket.tecnico) {
        return 'Sin Asignar';
      }

      if (
        typeof ticket.tecnico ===
        'string'
      ) {
        return ticket.tecnico;
      }

      return (
        ticket.tecnico
          ?.username ||
        ticket.tecnico_nombre ||
        'Sin Asignar'
      );
    };

  const obtenerTecnicoId =
    (ticket) => {
      if (
        ticket.tecnico_id !==
        undefined
      ) {
        return (
          ticket.tecnico_id || ''
        );
      }

      if (
        typeof ticket.tecnico ===
        'object'
      ) {
        return (
          ticket.tecnico?.id ||
          ''
        );
      }

      return '';
    };

  // =====================================================
  // FECHA
  // =====================================================

  const formatearFecha =
    (fecha) => {
      if (!fecha) {
        return 'Sin registro';
      }

      const date =
        new Date(fecha);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return fecha;
      }

      return date.toLocaleString(
        'es-CL',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );
    };

  // =====================================================
  // FILTRAR
  // =====================================================

  const ticketsVisibles =
    useMemo(() => {
      return tickets.filter(
        (ticket) => {
          // =============================================
          // IMPORTANTE:
          //
          // Django YA debería haber filtrado los tickets
          // según el rol.
          //
          // Este filtrado es solamente visual.
          // No se usa como seguridad.
          // =============================================

          const coincideEstado =
            filtroEstado ===
              'TODOS' ||
            ticket.estado ===
              filtroEstado;

          const coincideSeveridad =
            filtroSeveridad ===
              'TODAS' ||
            ticket.severidad ===
              filtroSeveridad;

          const coincideCategoria =
            filtroCategoria ===
              'TODAS' ||
            ticket.categoria ===
              filtroCategoria;

          const coincideUbicacion =
            filtroUbicacion ===
              'TODAS' ||
            ticket.ubicacion ===
              filtroUbicacion;

          const texto =
            busqueda
              .trim()
              .toLowerCase();

          const solicitante =
            obtenerNombreSolicitante(
              ticket
            )
              .toLowerCase();

          const tecnico =
            obtenerNombreTecnico(
              ticket
            )
              .toLowerCase();

          const coincideBusqueda =
            !texto ||
            ticket.asunto
              ?.toLowerCase()
              .includes(texto) ||
            ticket.descripcion
              ?.toLowerCase()
              .includes(texto) ||
            ticket.categoria
              ?.toLowerCase()
              .includes(texto) ||
            ticket.ubicacion
              ?.toLowerCase()
              .includes(texto) ||
            solicitante.includes(
              texto
            ) ||
            tecnico.includes(
              texto
            );

          return (
            coincideEstado &&
            coincideSeveridad &&
            coincideCategoria &&
            coincideUbicacion &&
            coincideBusqueda
          );
        }
      );
    }, [
      tickets,
      filtroEstado,
      filtroSeveridad,
      filtroCategoria,
      filtroUbicacion,
      busqueda
    ]);

  // =====================================================
  // KPI
  // =====================================================

  const total =
    ticketsVisibles.length;

  const pendientes =
    ticketsVisibles.filter(
      (ticket) =>
        ticket.estado ===
        'Pendiente'
    ).length;

  const enProgreso =
    ticketsVisibles.filter(
      (ticket) =>
        ticket.estado ===
        'En Progreso'
    ).length;

  const cerrados =
    ticketsVisibles.filter(
      (ticket) =>
        ticket.estado ===
        'Cerrado'
    ).length;

  const maxCantidad =
    Math.max(
      pendientes,
      enProgreso,
      cerrados,
      1
    );

  const porcentajeBarra =
    (cantidad) =>
      `${
        (cantidad /
          maxCantidad) *
        100
      }%`;

  // =====================================================
  // ACCIONES TÉCNICO
  // =====================================================

  const iniciarTrabajo =
    async (ticket) => {
      const confirmar =
        window.confirm(
          `¿Iniciar trabajo del ticket #${ticket.id}?\n\n${ticket.asunto}`
        );

      if (!confirmar) {
        return;
      }

      try {
        await onCambiarEstado(
          ticket.id,
          'En Progreso'
        );

      } catch (error) {
        alert(
          error.message
        );
      }
    };

  const cerrarTicket =
    async (ticket) => {
      const confirmar =
        window.confirm(
          `¿Cerrar el ticket #${ticket.id}?\n\n${ticket.asunto}`
        );

      if (!confirmar) {
        return;
      }

      try {
        await onCambiarEstado(
          ticket.id,
          'Cerrado'
        );

      } catch (error) {
        alert(
          error.message
        );
      }
    };

  // =====================================================
  // ADMIN CAMBIO ESTADO
  // =====================================================

  const cambiarEstadoAdmin =
    async (
      ticket,
      nuevoEstado
    ) => {
      if (
        ticket.estado ===
        nuevoEstado
      ) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Cambiar el estado del ticket #${ticket.id}?\n\n${ticket.estado} → ${nuevoEstado}`
        );

      if (!confirmar) {
        return;
      }

      try {
        await onCambiarEstado(
          ticket.id,
          nuevoEstado
        );

      } catch (error) {
        alert(
          error.message
        );
      }
    };

  // =====================================================
  // ADMIN SEVERIDAD
  // =====================================================

  const cambiarSeveridadAdmin =
    async (
      ticket,
      severidad
    ) => {
      if (
        ticket.severidad ===
        severidad
      ) {
        return;
      }

      try {
        await onEditarTicket(
          ticket.id,
          {
            severidad
          }
        );

      } catch (error) {
        alert(
          error.message
        );
      }
    };

  // =====================================================
  // ADMIN ASIGNAR
  // =====================================================

  const cambiarTecnicoAdmin =
    async (
      ticket,
      tecnicoId
    ) => {
      try {
        await onAsignarTecnico(
          ticket.id,
          tecnicoId
        );

      } catch (error) {
        alert(
          error.message
        );
      }
    };

  // =====================================================
  // GUARDAR MODAL ADMIN
  // =====================================================

  const guardarEdicion =
    async () => {
      if (!ticketEditando) {
        return;
      }

      try {
        // Solo enviamos campos
        // editables generales.

        await onEditarTicket(
          ticketEditando.id,
          {
            asunto:
              ticketEditando.asunto,

            categoria:
              ticketEditando.categoria,

            ubicacion:
              ticketEditando.ubicacion,

            descripcion:
              ticketEditando.descripcion,

            severidad:
              ticketEditando.severidad,

            estado:
              ticketEditando.estado
          }
        );

        setTicketEditando(
          null
        );

      } catch (error) {
        alert(
          error.message
        );
      }
    };

  // =====================================================
  // TEXTOS
  // =====================================================

  const tituloPanel =
    esAdmin
      ? 'Panel Supervisor'
      : esTecnico
      ? 'Panel Técnico'
      : 'Mis Solicitudes';

  // =====================================================
  // CARGANDO
  // =====================================================

  if (
    cargando &&
    tickets.length === 0
  ) {
    return (
      <div className="bg-[#18181c] border border-zinc-800 rounded-xl p-12 text-center">

        <div className="text-white font-bold">
          Cargando solicitudes...
        </div>

        <p className="text-xs text-zinc-500 mt-2">
          Consultando información del servidor.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ENCABEZADO */}

      <div className="flex justify-between items-start">

        <div>

          <div className="flex items-center gap-3">

            <h1 className="text-2xl font-extrabold text-white">
              {tituloPanel}
            </h1>

            <span className="text-[10px] uppercase px-2 py-1 border border-zinc-700 rounded text-zinc-400">
              {usuario.rol}
            </span>

          </div>

          <p className="text-sm text-zinc-500 mt-1">
            Información obtenida directamente desde el servidor.
          </p>

        </div>

        <button
          onClick={
            onRecargar
          }
          disabled={
            cargando
          }
          className="px-3 py-2 border border-zinc-700 rounded text-xs text-zinc-300 hover:text-white"
        >
          {cargando
            ? 'Actualizando...'
            : '↻ Actualizar'}
        </button>

      </div>

      {/* KPIs */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Kpi
          titulo={
            esSolicitante
              ? 'Mis Solicitudes'
              : 'Total Solicitudes'
          }
          valor={total}
          color="text-white"
        />

        <Kpi
          titulo="Pendientes"
          valor={
            pendientes
          }
          color="text-amber-400"
        />

        <Kpi
          titulo="En Progreso"
          valor={
            enProgreso
          }
          color="text-blue-400"
        />

        <Kpi
          titulo="Cerrados"
          valor={
            cerrados
          }
          color="text-emerald-400"
        />

      </div>

      {/* GRÁFICO */}

      <div className="bg-[#18181c] border border-zinc-800 rounded-lg p-6">

        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
          Estado de las solicitudes
        </span>

        <div className="space-y-5 mt-6">

          <BarraEstado
            titulo="Pendientes"
            cantidad={
              pendientes
            }
            ancho={
              porcentajeBarra(
                pendientes
              )
            }
            barraColor="bg-amber-500"
            textoColor="text-amber-400"
          />

          <BarraEstado
            titulo="En Progreso"
            cantidad={
              enProgreso
            }
            ancho={
              porcentajeBarra(
                enProgreso
              )
            }
            barraColor="bg-blue-500"
            textoColor="text-blue-400"
          />

          <BarraEstado
            titulo="Cerrados"
            cantidad={
              cerrados
            }
            ancho={
              porcentajeBarra(
                cerrados
              )
            }
            barraColor="bg-emerald-500"
            textoColor="text-emerald-400"
          />

        </div>

      </div>

      {/* TABLA */}

      <div className="bg-[#18181c] border border-zinc-800 rounded-lg p-6 space-y-5">

        {/* FILTROS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <input
            value={
              busqueda
            }
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
            placeholder="Buscar..."
            className="px-3 py-2 bg-[#121212] border border-zinc-700 rounded text-xs text-white"
          />

          <select
            value={
              filtroEstado
            }
            onChange={(e) =>
              setFiltroEstado(
                e.target.value
              )
            }
            className="px-3 py-2 bg-[#121212] border border-zinc-700 rounded text-xs text-white"
          >

            <option value="TODOS">
              Todos los estados
            </option>

            <option value="Pendiente">
              Pendiente
            </option>

            <option value="En Progreso">
              En Progreso
            </option>

            <option value="Cerrado">
              Cerrado
            </option>

          </select>

          <select
            value={
              filtroSeveridad
            }
            onChange={(e) =>
              setFiltroSeveridad(
                e.target.value
              )
            }
            className="px-3 py-2 bg-[#121212] border border-zinc-700 rounded text-xs text-white"
          >

            <option value="TODAS">
              Todas las severidades
            </option>

            <option value="BAJA">
              Baja
            </option>

            <option value="MEDIA">
              Media
            </option>

            <option value="ALTA">
              Alta
            </option>

          </select>

          <select
            value={
              filtroCategoria
            }
            onChange={(e) =>
              setFiltroCategoria(
                e.target.value
              )
            }
            className="px-3 py-2 bg-[#121212] border border-zinc-700 rounded text-xs text-white"
          >

            <option value="TODAS">
              Todas las categorías
            </option>

            {categoriasSistema.map(
              (categoria) => (
                <option
                  key={
                    categoria
                  }
                  value={
                    categoria
                  }
                >
                  {categoria}
                </option>
              )
            )}

          </select>

          <select
            value={
              filtroUbicacion
            }
            onChange={(e) =>
              setFiltroUbicacion(
                e.target.value
              )
            }
            className="px-3 py-2 bg-[#121212] border border-zinc-700 rounded text-xs text-white"
          >

            <option value="TODAS">
              Todos los sectores
            </option>

            {sectoresSistema.map(
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

        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead className="bg-[#121212] text-zinc-400 uppercase border-b border-zinc-800">

              <tr>

                <th className="p-3">
                  ID
                </th>

                <th className="p-3">
                  Asunto
                </th>

                <th className="p-3">
                  Fecha
                </th>

                <th className="p-3">
                  Categoría
                </th>

                <th className="p-3">
                  Sector
                </th>

                {esAdmin && (
                  <th className="p-3">
                    Técnico
                  </th>
                )}

                <th className="p-3">
                  Severidad
                </th>

                <th className="p-3">
                  Estado
                </th>

                <th className="p-3 text-right">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-zinc-800">

              {ticketsVisibles.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={
                      esAdmin
                        ? 9
                        : 8
                    }
                    className="p-10 text-center text-zinc-500"
                  >
                    No hay solicitudes para mostrar.
                  </td>

                </tr>

              ) : (

                ticketsVisibles.map(
                  (ticket) => (

                    <tr
                      key={
                        ticket.id
                      }
                      className="hover:bg-zinc-800/30"
                    >

                      <td className="p-3 text-zinc-500">
                        #{ticket.id}
                      </td>

                      <td className="p-3 text-white font-medium">
                        {ticket.asunto}
                      </td>

                      <td className="p-3 text-zinc-400 whitespace-nowrap">
                        {formatearFecha(
                          ticket.fecha
                        )}
                      </td>

                      <td className="p-3 text-zinc-400">
                        {ticket.categoria}
                      </td>

                      <td className="p-3 text-zinc-300">
                        {ticket.ubicacion}
                      </td>

                      {/* ADMIN: TÉCNICO */}

                      {esAdmin && (

                        <td className="p-3">

                          <select
                            value={
                              obtenerTecnicoId(
                                ticket
                              )
                            }
                            disabled={
                              cargandoTecnicos
                            }
                            onChange={(e) =>
                              cambiarTecnicoAdmin(
                                ticket,
                                e.target.value
                                  ? Number(
                                      e.target.value
                                    )
                                  : null
                              )
                            }
                            className="bg-[#121212] border border-zinc-700 rounded px-2 py-2 text-zinc-300"
                          >

                            <option value="">
                              Sin Asignar
                            </option>

                            {tecnicosDisponibles.map(
                              (tecnico) => (

                                <option
                                  key={
                                    tecnico.id
                                  }
                                  value={
                                    tecnico.id
                                  }
                                >
                                  {tecnico.username}
                                </option>

                              )
                            )}

                          </select>

                        </td>

                      )}

                      {/* SEVERIDAD */}

                      <td className="p-3">

                        {esAdmin ? (

                          <select
                            value={
                              ticket.severidad
                            }
                            onChange={(e) =>
                              cambiarSeveridadAdmin(
                                ticket,
                                e.target.value
                              )
                            }
                            className="bg-[#121212] border border-zinc-700 rounded px-2 py-2 text-zinc-300"
                          >

                            <option value="BAJA">
                              BAJA
                            </option>

                            <option value="MEDIA">
                              MEDIA
                            </option>

                            <option value="ALTA">
                              ALTA
                            </option>

                          </select>

                        ) : (

                          <Severidad
                            severidad={
                              ticket.severidad
                            }
                          />

                        )}

                      </td>

                      {/* ESTADO */}

                      <td className="p-3">

                        {esAdmin ? (

                          <select
                            value={
                              ticket.estado
                            }
                            onChange={(e) =>
                              cambiarEstadoAdmin(
                                ticket,
                                e.target.value
                              )
                            }
                            className="bg-[#121212] border border-zinc-700 rounded px-2 py-2 text-zinc-300"
                          >

                            <option value="Pendiente">
                              Pendiente
                            </option>

                            <option value="En Progreso">
                              En Progreso
                            </option>

                            <option value="Cerrado">
                              Cerrado
                            </option>

                          </select>

                        ) : (

                          <Estado
                            estado={
                              ticket.estado
                            }
                          />

                        )}

                      </td>

                      {/* ACCIONES */}

                      <td className="p-3">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              setTicketSeleccionado(
                                ticket
                              )
                            }
                            className="px-2 py-1.5 border border-zinc-700 rounded text-zinc-300"
                          >
                            Ver detalle
                          </button>

                          {esAdmin && (

                            <button
                              onClick={() =>
                                setTicketEditando({
                                  ...ticket
                                })
                              }
                              className="px-2 py-1.5 border border-blue-500/30 text-blue-400 rounded"
                            >
                              Editar
                            </button>

                          )}

                          {esTecnico &&
                          ticket.estado ===
                            'Pendiente' && (

                            <button
                              onClick={() =>
                                iniciarTrabajo(
                                  ticket
                                )
                              }
                              className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded"
                            >
                              ▶ Iniciar
                            </button>

                          )}

                          {esTecnico &&
                          ticket.estado ===
                            'En Progreso' && (

                            <button
                              onClick={() =>
                                cerrarTicket(
                                  ticket
                                )
                              }
                              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded"
                            >
                              ✓ Cerrar
                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* DETALLE */}

      {ticketSeleccionado && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">

          <div className="bg-[#18181c] border border-zinc-700 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between">

              <div>

                <span className="text-[10px] text-zinc-500 uppercase">
                  Ticket #{ticketSeleccionado.id}
                </span>

                <h2 className="text-xl font-bold text-white">
                  {ticketSeleccionado.asunto}
                </h2>

              </div>

              <button
                onClick={() =>
                  setTicketSeleccionado(
                    null
                  )
                }
                className="text-zinc-400"
              >
                ✕
              </button>

            </div>

            <p className="bg-[#121212] border border-zinc-800 rounded p-4 text-sm text-zinc-300 mt-6">
              {ticketSeleccionado.descripcion}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

              <Detalle
                titulo="Categoría"
                valor={
                  ticketSeleccionado.categoria
                }
              />

              <Detalle
                titulo="Sector"
                valor={
                  ticketSeleccionado.ubicacion
                }
              />

              <Detalle
                titulo="Impacto"
                valor={
                  ticketSeleccionado.impacto
                }
              />

              <Detalle
                titulo="Urgencia"
                valor={
                  ticketSeleccionado.urgencia
                }
              />

              <Detalle
                titulo="Severidad"
                valor={
                  ticketSeleccionado.severidad
                }
              />

              <Detalle
                titulo="Estado"
                valor={
                  ticketSeleccionado.estado
                }
              />

              <Detalle
                titulo="Solicitante"
                valor={
                  obtenerNombreSolicitante(
                    ticketSeleccionado
                  )
                }
              />

              <Detalle
                titulo="Técnico asignado"
                valor={
                  obtenerNombreTecnico(
                    ticketSeleccionado
                  )
                }
              />

              <Detalle
                titulo="Fecha creación"
                valor={
                  formatearFecha(
                    ticketSeleccionado.fecha
                  )
                }
              />

              {ticketSeleccionado.fecha_cierre && (

                <Detalle
                  titulo="Fecha cierre"
                  valor={
                    formatearFecha(
                      ticketSeleccionado.fecha_cierre
                    )
                  }
                />

              )}

            </div>

          </div>

        </div>

      )}

      {/* EDITAR ADMIN */}

      {ticketEditando &&
      esAdmin && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[110]">

          <div className="bg-[#18181c] border border-zinc-700 rounded-xl w-full max-w-xl p-6 space-y-4">

            <h2 className="text-xl font-bold text-white">
              Editar Ticket #{ticketEditando.id}
            </h2>

            <Campo titulo="Asunto">

              <input
                value={
                  ticketEditando.asunto
                }
                onChange={(e) =>
                  setTicketEditando({
                    ...ticketEditando,

                    asunto:
                      e.target.value
                  })
                }
                className="w-full bg-[#121212] border border-zinc-700 p-2 rounded text-white"
              />

            </Campo>

            <Campo titulo="Categoría">

              <select
                value={
                  ticketEditando.categoria
                }
                onChange={(e) =>
                  setTicketEditando({
                    ...ticketEditando,

                    categoria:
                      e.target.value
                  })
                }
                className="w-full bg-[#121212] border border-zinc-700 p-2 rounded text-white"
              >

                {categoriasSistema.map(
                  (categoria) => (

                    <option
                      key={
                        categoria
                      }
                      value={
                        categoria
                      }
                    >
                      {categoria}
                    </option>

                  )
                )}

              </select>

            </Campo>

            <Campo titulo="Sector">

              <select
                value={
                  ticketEditando.ubicacion
                }
                onChange={(e) =>
                  setTicketEditando({
                    ...ticketEditando,

                    ubicacion:
                      e.target.value
                  })
                }
                className="w-full bg-[#121212] border border-zinc-700 p-2 rounded text-white"
              >

                {sectoresSistema.map(
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

            </Campo>

            <Campo titulo="Severidad">

              <select
                value={
                  ticketEditando.severidad
                }
                onChange={(e) =>
                  setTicketEditando({
                    ...ticketEditando,

                    severidad:
                      e.target.value
                  })
                }
                className="w-full bg-[#121212] border border-zinc-700 p-2 rounded text-white"
              >

                <option value="BAJA">
                  BAJA
                </option>

                <option value="MEDIA">
                  MEDIA
                </option>

                <option value="ALTA">
                  ALTA
                </option>

              </select>

            </Campo>

            <Campo titulo="Estado">

              <select
                value={
                  ticketEditando.estado
                }
                onChange={(e) =>
                  setTicketEditando({
                    ...ticketEditando,

                    estado:
                      e.target.value
                  })
                }
                className="w-full bg-[#121212] border border-zinc-700 p-2 rounded text-white"
              >

                <option value="Pendiente">
                  Pendiente
                </option>

                <option value="En Progreso">
                  En Progreso
                </option>

                <option value="Cerrado">
                  Cerrado
                </option>

              </select>

            </Campo>

            <Campo titulo="Descripción">

              <textarea
                rows="4"
                value={
                  ticketEditando.descripcion
                }
                onChange={(e) =>
                  setTicketEditando({
                    ...ticketEditando,

                    descripcion:
                      e.target.value
                  })
                }
                className="w-full bg-[#121212] border border-zinc-700 p-2 rounded text-white resize-none"
              />

            </Campo>

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setTicketEditando(
                    null
                  )
                }
                className="px-4 py-2 text-zinc-400"
              >
                Cancelar
              </button>

              <button
                onClick={
                  guardarEdicion
                }
                className="px-4 py-2 bg-blue-600 rounded text-white"
              >
                Guardar cambios
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

// =====================================================
// COMPONENTES
// =====================================================

function Kpi({
  titulo,
  valor,
  color
}) {
  return (
    <div className="bg-[#18181c] border border-zinc-800 p-5 rounded-lg">

      <span
        className={`text-[10px] uppercase font-bold tracking-widest ${color}`}
      >
        {titulo}
      </span>

      <div
        className={`text-3xl font-bold mt-2 ${color}`}
      >
        {valor}
      </div>

    </div>
  );
}

function BarraEstado({
  titulo,
  cantidad,
  ancho,
  textoColor,
  barraColor
}) {
  return (
    <div>

      <div className="flex justify-between text-xs mb-2">

        <span className="text-zinc-400">
          {titulo}
        </span>

        <span className={textoColor}>
          {cantidad}
        </span>

      </div>

      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">

        <div
          className={`h-full ${barraColor}`}
          style={{
            width: ancho
          }}
        />

      </div>

    </div>
  );
}

function Severidad({
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
      className={`px-2 py-1 rounded border text-[10px] font-bold ${estilos}`}
    >
      {severidad}
    </span>
  );
}

function Estado({
  estado
}) {
  const estilo =
    estado === 'Cerrado'
      ? 'text-emerald-400'
      : estado === 'En Progreso'
      ? 'text-blue-400'
      : 'text-amber-400';

  return (
    <span
      className={`${estilo} font-bold whitespace-nowrap`}
    >
      ● {estado}
    </span>
  );
}

function Detalle({
  titulo,
  valor
}) {
  return (
    <div className="bg-[#121212] border border-zinc-800 rounded p-3">

      <span className="block text-[9px] uppercase text-zinc-500 mb-1">
        {titulo}
      </span>

      <span className="text-xs text-zinc-200">
        {valor || 'Sin registro'}
      </span>

    </div>
  );
}

function Campo({
  titulo,
  children
}) {
  return (
    <div>

      <label className="block text-xs text-zinc-400 mb-2">
        {titulo}
      </label>

      {children}

    </div>
  );
}