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
      <ToggleButton value="transfer">
        <IconifyIcon icon="material-symbols:account-balance-rounded" sx={{ mr: 1 }} /> Transferencia
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
