import { Paper, Stack } from '@mui/material';
import { rootPaths } from 'routes/paths';
import PageHeader from 'components/sections/common/PageHeader';
import SellContainer from 'components/sections/store/sell/SellContainer';

export default function Sell() {
  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Vender productos"
        breadcrumb={[
          { label: 'Inicio', url: rootPaths.root },
          { label: 'Vender', active: true },
        ]}
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <SellContainer />
      </Paper>
    </Stack>
  );
}
