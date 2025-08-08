import { useAuth } from 'providers/AuthProvider';
import paths from 'routes/paths';
import SignupForm, {
  SignupFormValues,
} from 'components/sections/authentications/default/SignupForm';

const Signup = () => {
  const { setSession } = useAuth();

  const handleSignup = async (data: SignupFormValues) => {
    console.log({ data });
    setSession({
      id: '1',
      name: data.name,
      email: data.email,
      avatar: '',
    });
  };

  return (
    <SignupForm
      provider="firebase"
      handleSignup={handleSignup}
      loginLink={paths.defaultFirebaseLogin}
    />
  );
};

export default Signup;
