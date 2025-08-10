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
import type { PlanListRow } from 'hooks/usePlans';
import { useSnackbar } from 'notistack';
import { useAuth } from 'providers/AuthProvider';
import { createPlan, updatePlan } from 'services/plans';
import { useSWRConfig } from 'swr';
import StyledTextField from 'components/styled/StyledTextField';

type Mode = 'create' | 'edit';

interface PlansDialogProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  row?: PlanListRow | null;
}

const PlansDialog = ({ open, onClose, mode, row = null }: PlansDialogProps) => {
  const isEdit = mode === 'edit';
  const { profile } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { mutate } = useSWRConfig();
  const [name, setName] = useState(row?.name ?? '');
  const [description, setDescription] = useState(row?.description ?? '');
  const [interval, setInterval] = useState<PlanListRow['interval']>(row?.interval ?? 'month');
  const [durationDays, setDurationDays] = useState<number | ''>(row?.duration_days ?? '');
  const [maxClasses, setMaxClasses] = useState<number | ''>(row?.max_classes_per_period ?? '');
  const [priceDollars, setPriceDollars] = useState<number | ''>(
    row ? Math.round(row.price_cents) / 100 : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length > 1 && priceDollars !== '' && !isSubmitting,
    [name, priceDollars, isSubmitting],
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !profile?.gym_id) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price_cents: Math.round(Number(priceDollars) * 100),
        interval,
        duration_days: interval === 'pack' ? Number(durationDays) || null : null,
        max_classes_per_period: interval === 'pack' ? Number(maxClasses) || null : null,
        active: true,
      } as const;

      if (isEdit && row) {
        await updatePlan(row.id, payload);
        enqueueSnackbar('Plan actualizado', { variant: 'success' });
      } else {
        await createPlan(profile.gym_id, payload as any);
        enqueueSnackbar('Plan creado', { variant: 'success' });
      }
      await mutate('plans:list');
      onClose();
    } catch (e) {
      enqueueSnackbar(e instanceof Error ? e.message : 'Operación fallida', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canSubmit,
    name,
    description,
    priceDollars,
    interval,
    durationDays,
    maxClasses,
    profile?.gym_id,
    isEdit,
    row,
  ]);

  const handleClose = () => {
    setName('');
    setDescription('');
    setInterval('month');
    setDurationDays('');
    setMaxClasses('');
    setPriceDollars('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar plan' : 'Nuevo plan'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }} direction="column">
          <StyledTextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <StyledTextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <StyledTextField
              select
              label="Tipo"
              value={interval}
              onChange={(e) => setInterval(e.target.value as any)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="month">Mensual</MenuItem>
              <MenuItem value="week">Semanal</MenuItem>
              <MenuItem value="year">Anual</MenuItem>
              <MenuItem value="pack">Por usos (pack de días)</MenuItem>
            </StyledTextField>
            <StyledTextField
              label={interval === 'pack' ? 'Días del paquete' : 'Duración (días)'}
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={interval !== 'pack'}
              sx={{ minWidth: 200 }}
            />
            <StyledTextField
              label="Límite de clases"
              type="number"
              value={maxClasses}
              onChange={(e) => setMaxClasses(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={interval !== 'pack'}
              sx={{ minWidth: 200 }}
            />
          </Stack>
          <StyledTextField
            label="Precio (USD)"
            type="number"
            inputProps={{ step: 0.01, min: 0 }}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value === '' ? '' : Number(e.target.value))}
            fullWidth
          />
          <Box />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="neutral" variant="text" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!canSubmit}>
          {isEdit ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlansDialog;
