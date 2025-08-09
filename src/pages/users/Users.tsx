import { Paper, Stack } from '@mui/material';
import { rootPaths } from 'routes/paths';
import PageHeader from 'components/sections/common/PageHeader';
import UsersListContainer from 'components/sections/users/UsersListContainer';

export default function Users() {
  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Usuarios"
        breadcrumb={[
          { label: 'Inicio', url: rootPaths.root },
          { label: 'Usuarios', active: true },
        ]}
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <UsersListContainer />
      </Paper>
    </Stack>
  );
}
