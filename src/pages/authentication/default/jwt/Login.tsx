import { useNavigate } from 'react-router';
import { defaultJwtAuthCredentials } from 'config';
import { useAuth } from 'providers/AuthProvider';
import paths, { rootPaths } from 'routes/paths';
import { useLoginUser } from 'services/swr/api-hooks/useAuthApi';
import LoginForm, { LoginFormValues } from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const { trigger: login } = useLoginUser();
  const handleLogin = async (data: LoginFormValues) => {
    const res = await login(data).catch((error) => {
      throw new Error(error.data.message);
    });
    if (res) {
      setSession(res.user, res.authToken);
      navigate(rootPaths.root);
    }
  };
  return (
    <LoginForm
      handleLogin={handleLogin}
      signUpLink={paths.defaultJwtSignup}
      forgotPasswordLink={paths.defaultJwtForgotPassword}
      defaultCredential={defaultJwtAuthCredentials}
    />
  );
};

export default Login;
