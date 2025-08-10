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
import type { StaffRow } from 'hooks/useStaffList';
import { useSnackbar } from 'notistack';
import { useAuth } from 'providers/AuthProvider';
import { createStaffViaEdge, updateStaff } from 'services/staff';
import { useSWRConfig } from 'swr';
import { UserRole, UserRoleOptions } from 'types/users';
import StyledTextField from 'components/styled/StyledTextField';

type Mode = 'create' | 'edit';

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  row?: StaffRow | null;
}

const UserDialog = ({ open, onClose, mode, row = null }: UserDialogProps) => {
  const isEdit = mode === 'edit';
  const [email, setEmail] = useState<string>(row?.email ?? '');
  const [name, setName] = useState<string>(row?.name ?? '');
  const [phone, setPhone] = useState<string>(row?.phone ?? '');
  const [role, setRole] = useState<UserRole>((row?.role as UserRole) ?? UserRole.STAFF);
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const { mutate } = useSWRConfig();
  const { enqueueSnackbar } = useSnackbar();
  const gymId = useMemo(() => profile?.gym_id, [profile]);

  const canSubmit = useMemo(() => {
    if (isEdit) return name.trim().length > 1 && !isSubmitting;
    return (
      email.trim().length > 3 &&
      name.trim().length > 1 &&
      password.trim().length >= 6 &&
      !!gymId &&
      !isSubmitting
    );
  }, [isEdit, email, name, password, gymId, isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      if (isEdit && row) {
        await updateStaff(row.id, { name: name.trim(), phone: phone.trim() || null, role });
        enqueueSnackbar('Usuario actualizado', { variant: 'success' });
      } else {
        await createStaffViaEdge({
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim() || null,
          password: password.trim() || null,
          role,
          gymId: gymId!,
        });
        enqueueSnackbar('Usuario creado', { variant: 'success' });
      }
      await mutate('staff:list');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operación fallida';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, isEdit, row, name, phone, role, email, password, gymId, onClose]);

  const handleClose = () => {
    setEmail('');
    setName('');
    setPhone('');
    setRole(UserRole.STAFF);
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }} direction="column">
          <StyledTextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          {!isEdit && (
            <StyledTextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              autoFocus
            />
          )}
          <StyledTextField
            label="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
          />
          {!isEdit && (
            <StyledTextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          )}
          <StyledTextField
            select
            label="Rol"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            fullWidth
          >
            {UserRoleOptions.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
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
          {isEdit ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDialog;
