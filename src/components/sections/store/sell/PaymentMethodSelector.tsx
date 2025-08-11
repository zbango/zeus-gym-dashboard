import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export default function PaymentMethodSelector(props: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}) {
  const { value, onChange } = props;
  return (
    <ToggleButtonGroup
      color="primary"
      value={value}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      fullWidth
      size="small"
    >
      <ToggleButton value="cash">
        <IconifyIcon icon="material-symbols:payments-rounded" sx={{ mr: 1 }} /> Efectivo
      </ToggleButton>
      <ToggleButton value="card">
        <IconifyIcon icon="material-symbols:credit-card-rounded" sx={{ mr: 1 }} /> Tarjeta
      </ToggleButton>
      <ToggleButton value="transfer">
        <IconifyIcon icon="material-symbols:account-balance-rounded" sx={{ mr: 1 }} /> Transferencia
      </ToggleButton>
      <ToggleButton value="other">
        <IconifyIcon icon="material-symbols:more-horiz-rounded" sx={{ mr: 1 }} /> Otro
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
