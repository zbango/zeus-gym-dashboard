import { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { ButtonOwnProps } from '@mui/material';
import type { DialogProps } from '@mui/material/Dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode; // custom content overrides description
  confirmText?: string;
  cancelText?: string;
  confirmColor?: ButtonOwnProps['color'];
  loading?: boolean;
  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'error',
  loading = false,
  maxWidth = 'xs',
  fullWidth = true,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {children ? (
          children
        ) : description ? (
          <Typography variant="body2">{description}</Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="neutral" disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
