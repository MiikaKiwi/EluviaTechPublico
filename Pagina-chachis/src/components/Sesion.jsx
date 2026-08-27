import React, { useState } from 'react';

const API_URL = 'http://127.0.0.1:8000/api';

const Sesion = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // =====================================================
  // CAMBIO DE INPUTS
  // =====================================================

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      // =================================================
      // 🔧 BACKEND:
      // Endpoint esperado:
      //
      // POST /api/login/
      //
      // Body:
      // {
      //   "username": "...",
      //   "password": "..."
      // }
      // =================================================

      const response = await fetch(
        `${API_URL}/login/`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(credentials)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.mensaje ||
          data?.error ||
          data?.detail ||
          'Credenciales inválidas'
        );

        return;
      }

      // =================================================
      // 🔧 BACKEND:
      //
      // Esperamos que Django responda:
      //
      // {
      //   "token": "abc123...",
      //   "usuario": {
      //     "id": 1,
      //     "username": "admin_demo",
      //     "rol": "Admin"
      //   }
      // }
      // =================================================

      if (!data.token) {
        throw new Error(
          'El servidor no devolvió un token de autenticación.'
        );
      }

      if (!data.usuario) {
        throw new Error(
          'El servidor no devolvió los datos del usuario.'
        );
      }

      // =================================================
      // GUARDAR SESIÓN
      // =================================================

      localStorage.setItem(
        'token',
        data.token
      );

      localStorage.setItem(
        'usuarioTI',
        JSON.stringify(data.usuario)
      );

      // =================================================
      // AVISAR A APP.JSX
      // =================================================

      onLoginSuccess(data.usuario);

    } catch (err) {
      console.error(
        'Error de login:',
        err
      );

      setError(
        err.message ||
        'No se pudo conectar con el servidor de Django'
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans text-zinc-100">

      <div className="bg-[#18181c] border border-zinc-800 rounded-lg p-8 max-w-md w-full shadow-2xl space-y-6">

        {/* LOGO Y TÍTULO */}

        <div className="text-center space-y-2">

          <div className="inline-block bg-blue-600 text-white p-2 rounded font-black tracking-tighter text-base uppercase mb-2">
            ELUVIA TECH
          </div>

          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
            Iniciar Sesión
          </h1>

          <p className="text-xs text-zinc-400">
            Ingresa tus credenciales corporativas
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded text-center font-medium">
            {error}
          </div>
        )}

        {/* FORMULARIO */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* USUARIO */}

          <div>

            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Usuario / Nombre de usuario
            </label>

            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="Ej. admin_demo"
              className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />

          </div>

          {/* CONTRASEÑA */}

          <div>

            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">
              Contraseña
            </label>

            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />

          </div>

          {/* BOTÓN */}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-md mt-2 cursor-pointer"
          >
            {loading
              ? 'Verificando...'
              : 'Ingresar al Portal'}
          </button>

        </form>

      </div>

    </div>
  );
};

export default Sesion;