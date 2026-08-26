import React, { useState, useEffect } from 'react';

import Sesion from './components/Sesion';
import TicketForm from './components/TicketForm';

export default function App() {
  // 🔴 CAMBIO AQUÍ: En lugar de null, pones un usuario de prueba temporal
  const [usuario, setUsuario] = useState({ username: 'Analista_Prueba', rol: 'Admin' });
  const [cargando, setCargando] = useState(true);

  // Verificación de sesión
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioTI');
    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (error) {
        localStorage.removeItem('usuarioTI');
      }
    }
    setCargando(false);
  }, []);

  const handleLoginSuccess = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioTI');
    setUsuario(null);
  };

  if (cargando) {
    return <div className="min-h-screen bg-[#121212]" />;
  }

  return (
    <>
      {!usuario ? (
        <Sesion onLoginSuccess={handleLoginSuccess} />
      ) : (
        <TicketForm usuario={usuario} onLogout={handleLogout} />
      )}
    </>
  );
}