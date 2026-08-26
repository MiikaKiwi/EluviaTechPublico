import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // Guarda la sesión en localStorage para persistencia
        localStorage.setItem('usuarioTI', JSON.stringify(data));
        onLoginSuccess(data);
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor de Django');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans text-zinc-100">
      <div className="bg-[#18181c] border border-zinc-800 rounded-lg p-8 max-w-md w-full shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-block bg-blue-600 text-white p-2 rounded font-black tracking-tighter text-base uppercase mb-2">
            TI
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">Iniciar Sesión</h1>
          <p className="text-xs text-zinc-400">Ingresa tus credenciales corporativas</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Usuario / Nombre de usuario</label>
            <input 
              type="text" 
              name="username" 
              value={credentials.username} 
              onChange={handleChange} 
              required
              placeholder="Ej. jsoto" 
              className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 uppercase mb-2">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={credentials.password} 
              onChange={handleChange} 
              required
              placeholder="••••••••" 
              className="w-full px-4 py-3 bg-[#121212] border border-zinc-700/80 rounded text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs uppercase tracking-widest rounded transition-all shadow-md mt-2 cursor-pointer"
          >
            {loading ? 'Verificando...' : 'Ingresar al Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;