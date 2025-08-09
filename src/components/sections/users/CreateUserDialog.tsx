import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from '@mui/material';
import { useAuth } from 'providers/AuthProvider';
import { useSWRConfig } from 'swr';
import StyledTextField from 'components/styled/StyledTextField';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onCreatedWithStaff?: (staff: any) => void;
  defaultGymId?: string; // fallback to env in code if not provided
}

const ROLES = ['admin', 'trainer', 'frontdesk'] as const;

const CreateUserDialog = ({
  open,
  onClose,
  onCreated,
  onCreatedWithStaff,
}: CreateUserDialogProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('trainer');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const { mutate } = useSWRConfig();
  const gymId = useMemo(() => profile?.gym_id, [profile]);

  // console.debug('gymId', gymId, 'profile', profile);

  const canSubmit =
    email.trim().length > 3 &&
    name.trim().length > 1 &&
    password.trim().length >= 6 &&
    !!gymId &&
    !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      // Call edge function with service role on server side (CORS enabled)
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user-and-provision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            phone: phone.trim() || null,
            password: password.trim() || null,
            role,
            gym: gymId,
          }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      const payload = (await res.json()) as { staff?: any };
      onCreatedWithStaff?.(payload.staff);
      // Revalidate staff list so UsersTable refreshes without full page reload
      await mutate('staff:list');
      onCreated?.();
      onClose();
      setEmail('');
      setName('');
      setPhone('');
      setRole('trainer');
      setPassword('');
    } catch (err) {
      // TODO: surface error via a toast/snackbar
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, email, gymId, role, name, phone, onClose, onCreated]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo usuario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <StyledTextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            autoFocus
          />
          <StyledTextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <StyledTextField
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
          <StyledTextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <StyledTextField
            select
            label="Rol"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            fullWidth
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </StyledTextField>
          <Box />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="neutral" variant="text" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit}>
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserDialog;
