import { useNavigate } from 'react-router';
import { defaultJwtAuthCredentials } from 'config';
import { useSupabaseAuth } from 'providers/auth-provider/AuthSupabaseProvider';
import paths, { rootPaths } from 'routes/paths';
import LoginForm, { LoginFormValues } from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const { signInWithPassword } = useSupabaseAuth();
  const navigate = useNavigate();
  const handleLogin = async (data: LoginFormValues) => {
    await signInWithPassword({ email: data.email, password: data.password }).catch((error) => {
      throw new Error(error?.message ?? 'No se pudo iniciar sesión');
    });
    navigate(rootPaths.root);
  };
  return (
    <LoginForm
      handleLogin={handleLogin}
      forgotPasswordLink={paths.defaultJwtForgotPassword}
      defaultCredential={defaultJwtAuthCredentials}
    />
  );
};

export default Login;
