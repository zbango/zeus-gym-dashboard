import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import * as yup from 'yup';
import PasswordTextField from 'components/common/PasswordTextField';

interface LoginFormProps {
  handleLogin: (data: LoginFormValues) => any;
  forgotPasswordLink?: string;
  defaultCredential?: { email: string; password: string };
}
export interface LoginFormValues {
  email: string;
  password: string;
}

const schema = yup
  .object({
    email: yup
      .string()
      .email('Por favor, ingresa un correo electrónico válido.')
      .required('Este campo es obligatorio.'),
    password: yup.string().required('La contraseña es obligatoria.'),
  })
  .required();

const LoginForm = ({ handleLogin, forgotPasswordLink, defaultCredential }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    await handleLogin(data).catch((error: any) => {
      if (error) {
        setError('root.credential', { type: 'manual', message: error.message });
      }
    });
  };

  return (
    <Stack
      direction="column"
      sx={{
        height: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Grid
        container
        sx={{
          maxWidth: '40rem',
          rowGap: 4,
          p: { xs: 3, sm: 5 },
          mb: 5,
        }}
      >
        <Grid size={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Typography variant="h4">Inicia sesión para continuar</Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.credential?.message && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.root?.credential?.message}
              </Alert>
            )}
            <Grid container>
              <Grid
                sx={{
                  mb: 3,
                }}
                size={12}
              >
                <TextField
                  fullWidth
                  size="large"
                  id="email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  defaultValue={defaultCredential?.email}
                  error={!!errors.email}
                  helperText={<>{errors.email?.message}</>}
                  {...register('email')}
                />
              </Grid>
              <Grid
                sx={{
                  mb: 2.5,
                }}
                size={12}
              >
                <PasswordTextField
                  fullWidth
                  size="large"
                  id="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  defaultValue={defaultCredential?.password}
                  error={!!errors.password}
                  helperText={<>{errors.password?.message}</>}
                  {...register('password')}
                />
              </Grid>
              <Grid
                sx={{
                  mb: 6,
                }}
                size={12}
              >
                <Stack
                  spacing={1}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {forgotPasswordLink && (
                    <Link href={forgotPasswordLink} variant="subtitle2">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  )}
                </Stack>
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Iniciar sesión
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default LoginForm;
