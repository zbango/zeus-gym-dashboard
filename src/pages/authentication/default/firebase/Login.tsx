import { useNavigate } from 'react-router';
import { defaultJwtAuthCredentials } from 'config';
import { useAuth } from 'providers/AuthProvider';
import paths, { rootPaths } from 'routes/paths';
import LoginForm, { LoginFormValues } from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const handleLogin = async (data: LoginFormValues) => {
    console.log({ data });
    setSession(
      {
        id: '1',
        name: 'test',
        email: data.email,
        avatar: '',
      },
      //@ts-ignore
      user.accessToken,
    );
    navigate(rootPaths.root);
  };

  return (
    <LoginForm
      provider="firebase"
      handleLogin={handleLogin}
      signUpLink={paths.defaultFirebaseSignup}
      forgotPasswordLink={paths.defaultFirebaseForgotPassword}
      defaultCredential={defaultJwtAuthCredentials}
    />
  );
};

export default Login;
