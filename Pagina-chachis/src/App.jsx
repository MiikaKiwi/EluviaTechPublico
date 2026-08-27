import React, {
  useCallback,
  useEffect,
  useState
} from 'react';

import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import Sesion from './components/Sesion';

// =====================================================
// 🔧 BACKEND:
// Cambiar aquí si Django usa otra dirección o puerto.
// =====================================================

const API_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  // =====================================================
  // USUARIO AUTENTICADO
  // =====================================================

  const [usuario, setUsuario] = useState(() => {
    try {
      const usuarioGuardado =
        localStorage.getItem('usuarioTI');

      return usuarioGuardado
        ? JSON.parse(usuarioGuardado)
        : null;

    } catch (error) {
      console.error(
        'Error leyendo usuario guardado:',
        error
      );

      return null;
    }
  });

  // =====================================================
  // TICKETS DEL BACKEND
  // =====================================================

  const [tickets, setTickets] = useState([]);

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState('');

  // =====================================================
  // VISTA
  // =====================================================

  const [vista, setVista] =
    useState('DASHBOARD');

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
    rolNormalizado === 'SOLICITANTE';

  // =====================================================
  // TOKEN
  // =====================================================

  const obtenerToken = () => {
    return localStorage.getItem('token');
  };

  // =====================================================
  // LOGIN EXITOSO
  // =====================================================

  const handleLoginSuccess = (
    usuarioLogueado
  ) => {
    setUsuario(usuarioLogueado);

    setVista('DASHBOARD');

    setError('');
  };

  // =====================================================
  // SESIÓN EXPIRADA / NO AUTORIZADO
  // =====================================================

  const manejarNoAutorizado = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioTI');

    setUsuario(null);
    setTickets([]);
    setVista('DASHBOARD');

    setError('');
  };

  // =====================================================
  // CARGAR TICKETS
  // =====================================================

  const cargarTickets =
    useCallback(async () => {
      if (!usuario) {
        return;
      }

      const token = obtenerToken();

      if (!token) {
        manejarNoAutorizado();
        return;
      }

      setCargando(true);
      setError('');

      try {
        const response =
          await fetch(
            `${API_URL}/tickets/`,
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Token ${token}`
              }
            }
          );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          manejarNoAutorizado();
          return;
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
            data?.mensaje ||
            data?.error ||
            'No se pudieron cargar los tickets.'
          );
        }

        // =================================================
        // 🔧 BACKEND:
        //
        // Compatible con:
        //
        // [
        //   {...},
        //   {...}
        // ]
        //
        // o DRF paginado:
        //
        // {
        //   "results": [...]
        // }
        // =================================================

        const lista =
          Array.isArray(data)
            ? data
            : data?.results || [];

        setTickets(lista);

      } catch (errorPeticion) {
        console.error(
          'Error cargando tickets:',
          errorPeticion
        );

        setError(
          errorPeticion.message ||
          'No se pudo conectar con el servidor.'
        );

      } finally {
        setCargando(false);
      }
    }, [usuario]);

  // =====================================================
  // CARGAR TICKETS CUANDO HAY LOGIN
  // =====================================================

  useEffect(() => {
    if (usuario) {
      cargarTickets();
    }
  }, [
    usuario,
    cargarTickets
  ]);

  // =====================================================
  // CREAR TICKET
  // =====================================================

  const crearTicket =
    async (datosTicket) => {
      if (!esSolicitante) {
        throw new Error(
          'Solo los solicitantes pueden crear tickets.'
        );
      }

      const token = obtenerToken();

      const response =
        await fetch(
          `${API_URL}/tickets/`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Token ${token}`
            },

            body: JSON.stringify(
              datosTicket
            )
          }
        );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        manejarNoAutorizado();

        throw new Error(
          'Tu sesión no está autorizada.'
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'Error creando ticket:',
          data
        );

        throw new Error(
          data?.detail ||
          data?.mensaje ||
          data?.error ||
          'No se pudo crear la solicitud.'
        );
      }

      // Django guarda el ticket.
      // Luego volvemos a pedir la información real.

      await cargarTickets();

      setVista('DASHBOARD');

      return data;
    };

  // =====================================================
  // EDITAR TICKET - ADMIN
  // =====================================================

  const editarTicket =
    async (
      id,
      datosActualizados
    ) => {
      if (!esAdmin) {
        throw new Error(
          'Solo el administrador puede editar tickets.'
        );
      }

      const token = obtenerToken();

      const response =
        await fetch(
          `${API_URL}/tickets/${id}/`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Token ${token}`
            },

            body: JSON.stringify(
              datosActualizados
            )
          }
        );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        manejarNoAutorizado();

        throw new Error(
          'No tienes autorización.'
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'Error editando ticket:',
          data
        );

        throw new Error(
          data?.detail ||
          data?.mensaje ||
          data?.error ||
          'No se pudo editar el ticket.'
        );
      }

      await cargarTickets();

      return data;
    };

  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  const cambiarEstado =
    async (
      id,
      nuevoEstado
    ) => {
      const token = obtenerToken();

      const response =
        await fetch(
          `${API_URL}/tickets/${id}/`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Token ${token}`
            },

            body: JSON.stringify({
              estado: nuevoEstado
            })
          }
        );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        manejarNoAutorizado();

        throw new Error(
          'No tienes autorización para realizar esta acción.'
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'Error cambiando estado:',
          data
        );

        throw new Error(
          data?.detail ||
          data?.mensaje ||
          data?.error ||
          'No se pudo cambiar el estado.'
        );
      }

      await cargarTickets();

      return data;
    };

  // =====================================================
  // ASIGNAR TÉCNICO
  // =====================================================

  const asignarTecnico =
    async (
      ticketId,
      tecnicoId
    ) => {
      if (!esAdmin) {
        throw new Error(
          'Solo el administrador puede asignar técnicos.'
        );
      }

      const token = obtenerToken();

      const response =
        await fetch(
          `${API_URL}/tickets/${ticketId}/`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Token ${token}`
            },

            // =============================================
            // 🔧 BACKEND:
            //
            // Se espera que Django acepte:
            //
            // {
            //   "tecnico_id": 2
            // }
            //
            // Para quitar técnico:
            //
            // {
            //   "tecnico_id": null
            // }
            // =============================================

            body: JSON.stringify({
              tecnico_id:
                tecnicoId || null
            })
          }
        );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        manejarNoAutorizado();

        throw new Error(
          'No tienes autorización.'
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'Error asignando técnico:',
          data
        );

        throw new Error(
          data?.detail ||
          data?.mensaje ||
          data?.error ||
          'No se pudo asignar el técnico.'
        );
      }

      await cargarTickets();

      return data;
    };

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleLogout =
    async () => {
      const token = obtenerToken();

      try {
        // ===============================================
        // 🔧 BACKEND:
        //
        // Si tu colega implementa:
        //
        // POST /api/logout/
        //
        // este código cerrará también el token
        // en Django.
        //
        // Si NO existe ese endpoint, el frontend
        // igualmente cerrará la sesión local.
        // ===============================================

        if (token) {
          await fetch(
            `${API_URL}/logout/`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Token ${token}`
              }
            }
          );
        }

      } catch (errorLogout) {
        console.warn(
          'No se pudo cerrar la sesión en Django:',
          errorLogout
        );
      }

      localStorage.removeItem('token');
      localStorage.removeItem('usuarioTI');

      setUsuario(null);
      setTickets([]);
      setVista('DASHBOARD');
      setError('');
    };

  // =====================================================
  // MUY IMPORTANTE:
  // SIN USUARIO = MOSTRAR TU PANTALLA SESION.JSX
  // =====================================================

  if (!usuario) {
    return (
      <Sesion
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    );
  }

  // =====================================================
  // CON USUARIO = MOSTRAR EL SISTEMA
  // =====================================================

  return (
    <div className="min-h-screen bg-[#121212] font-sans text-zinc-100">

      {/* NAVBAR */}

      <nav className="border-b border-zinc-800 bg-[#18181c] sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">

          {/* IZQUIERDA */}

          <div className="flex items-center gap-3">

            <div className="bg-white text-black px-2 py-1 rounded font-black tracking-tighter text-sm uppercase">
              ELUVIA TECH
            </div>

            {/* DASHBOARD */}

            <button
              onClick={() =>
                setVista('DASHBOARD')
              }
              className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                vista === 'DASHBOARD'
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-transparent text-zinc-400 border-transparent hover:text-white'
              }`}
            >
              {esAdmin
                ? 'Panel Supervisor'
                : esTecnico
                ? 'Panel Técnico'
                : 'Mis Solicitudes'}
            </button>

            {/* SOLO SOLICITANTE */}

            {esSolicitante && (
              <button
                onClick={() =>
                  setVista('FORM')
                }
                className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                  vista === 'FORM'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                }`}
              >
                + Nueva Solicitud
              </button>
            )}

          </div>

          {/* DERECHA */}

          <div className="flex items-center gap-4 text-xs">

            <span className="text-zinc-400">

              👤{' '}

              <strong className="text-white">
                {usuario.username}
              </strong>

              {' '}

              <span className="text-zinc-500">
                ({usuario.rol})
              </span>

            </span>

            <button
              onClick={
                handleLogout
              }
              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded"
            >
              Cerrar Sesión
            </button>

          </div>

        </div>

      </nav>

      {/* CONTENIDO */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ERROR GENERAL */}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 text-sm">

            <div className="flex justify-between items-center">

              <span>
                {error}
              </span>

              <button
                onClick={() =>
                  cargarTickets()
                }
                className="text-xs border border-red-500/30 rounded px-3 py-1"
              >
                Reintentar
              </button>

            </div>

          </div>
        )}

        {/* FORMULARIO SOLO SOLICITANTE */}

        {vista === 'FORM' &&
        esSolicitante ? (

          <TicketForm
            usuario={
              usuario
            }

            onCrearTicket={
              crearTicket
            }

            onVolver={() =>
              setVista(
                'DASHBOARD'
              )
            }
          />

        ) : (

          <Dashboard
            tickets={
              tickets
            }

            usuario={
              usuario
            }

            cargando={
              cargando
            }

            apiUrl={
              API_URL
            }

            onRecargar={
              cargarTickets
            }

            onCambiarEstado={
              cambiarEstado
            }

            onAsignarTecnico={
              asignarTecnico
            }

            onEditarTicket={
              editarTicket
            }
          />

        )}

      </main>

    </div>
  );
}