import { Paper, Stack } from '@mui/material';
import { rootPaths } from 'routes/paths';
import PageHeader from 'components/sections/common/PageHeader';
import PlansListContainer from 'components/sections/settings/PlansListContainer';

export default function Plans() {
  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Planes"
        breadcrumb={[
          { label: 'Inicio', url: rootPaths.root },
          { label: 'Settings', active: true },
          { label: 'Planes', active: true },
        ]}
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <PlansListContainer />
      </Paper>
    </Stack>
  );
}
