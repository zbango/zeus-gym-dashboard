import ForgotPasswordForm from 'components/sections/authentications/default/ForgotPasswordForm';

const ForgotPassword = () => {
  const handleSendResetLink = async ({ email }: { email: string }) => {
    console.log({ email });
  };

  return <ForgotPasswordForm provider="firebase" handleSendResetLink={handleSendResetLink} />;
};

export default ForgotPassword;
