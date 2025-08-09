import { Button, Paper, Stack } from '@mui/material';
import { rootPaths } from 'routes/paths';
import PageHeader from 'components/sections/common/PageHeader';
import CustomerListContainer from 'components/sections/customers/CustomerListContainer';

const Customers = () => {
  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Listado de clientes"
        breadcrumb={[
          { label: 'Inicio', url: rootPaths.root },
          { label: 'Clientes', active: true },
        ]}
        actionComponent={
          <Stack
            sx={{
              gap: 1,
            }}
          >
            <Button variant="soft" color="neutral">
              Exportar
            </Button>
          </Stack>
        }
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <CustomerListContainer />
      </Paper>
    </Stack>
  );
};

export default Customers;
