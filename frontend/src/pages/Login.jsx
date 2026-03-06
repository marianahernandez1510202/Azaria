import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import InstitutionalHeader from '../components/layouts/InstitutionalHeader';
import InstitutionalFooter from '../components/layouts/InstitutionalFooter';
import '../components/layouts/institutional.css';

const Login = () => {
  return (
    <div className="login-page-wrapper">
      <InstitutionalHeader />
      <LoginForm />
      <InstitutionalFooter />
    </div>
  );
};

export default Login;
