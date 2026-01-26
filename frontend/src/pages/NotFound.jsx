import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '72px', marginBottom: '16px' }}>404</h1>
      <p style={{ fontSize: '24px', marginBottom: '32px' }}>Página no encontrada</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
