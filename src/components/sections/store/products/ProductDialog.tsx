import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import type { ProductRow } from 'hooks/useProducts';
import { useSnackbar } from 'notistack';
import { useAuth } from 'providers/AuthProvider';
import { createProduct, updateProduct } from 'services/products';
import { useSWRConfig } from 'swr';
import StyledTextField from 'components/styled/StyledTextField';

type Mode = 'create' | 'edit';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  row?: ProductRow | null;
}

const ProductDialog = ({ open, onClose, mode, row = null }: ProductDialogProps) => {
  const isEdit = mode === 'edit';
  const [sku, setSku] = useState<string>(row?.sku ?? '');
  const [name, setName] = useState<string>(row?.name ?? '');
  const [description, setDescription] = useState<string>(row?.description ?? '');
  const [priceCents, setPriceCents] = useState<number>(row?.price_cents ?? 0);
  const [costCents, setCostCents] = useState<number>(row?.cost_cents ?? 0);
  const [initialStock, setInitialStock] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const { mutate } = useSWRConfig();
  const { enqueueSnackbar } = useSnackbar();
  const gymId = useMemo(() => profile?.gym_id, [profile]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 1 && priceCents >= 0 && !isSubmitting && (isEdit || !!gymId);
  }, [isEdit, name, priceCents, gymId, isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      if (isEdit && row) {
        await updateProduct(row.id, {
          name: name.trim(),
          sku: sku.trim() || null,
          description: description.trim() || null,
          price_cents: priceCents,
          cost_cents: costCents || null,
        });
        enqueueSnackbar('Producto actualizado', { variant: 'success' });
      } else {
        await createProduct({
          gymId: gymId!,
          name: name.trim(),
          sku: sku.trim() || null,
          description: description.trim() || null,
          price_cents: priceCents,
          cost_cents: costCents || null,
          initial_stock: initialStock > 0 ? initialStock : undefined,
        });
        enqueueSnackbar('Producto creado', { variant: 'success' });
      }
      await mutate('store:products:list');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operación fallida';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canSubmit,
    isEdit,
    row,
    name,
    sku,
    description,
    priceCents,
    costCents,
    initialStock,
    gymId,
    onClose,
  ]);

  const handleClose = () => {
    setSku('');
    setName('');
    setDescription('');
    setPriceCents(0);
    setCostCents(0);
    setInitialStock(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }} direction="column">
          <StyledTextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <StyledTextField
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
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
              label="Precio (USD)"
              type="number"
              value={(priceCents ?? 0) / 100}
              onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || '0') * 100))}
              fullWidth
            />
            <StyledTextField
              label="Costo (USD)"
              type="number"
              value={(costCents ?? 0) / 100}
              onChange={(e) => setCostCents(Math.round(parseFloat(e.target.value || '0') * 100))}
              fullWidth
            />
          </Stack>
          {!isEdit && (
            <StyledTextField
              label="Stock inicial"
              type="number"
              value={initialStock}
              onChange={(e) => setInitialStock(parseInt(e.target.value || '0', 10))}
              fullWidth
            />
          )}
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

export default ProductDialog;
