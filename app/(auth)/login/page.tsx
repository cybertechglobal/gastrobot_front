import AuthForm from '@/components/AuthForm';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'Login | Gastrobot Panel',
  description: 'Login stranica',
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
};

export default LoginPage;
