import { Paper, Stack } from '@mui/material';
import { rootPaths } from 'routes/paths';
import PageHeader from 'components/sections/common/PageHeader';
import ProductsListContainer from 'components/sections/store/products/ProductsListContainer';

export default function Products() {
  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Productos"
        breadcrumb={[
          { label: 'Inicio', url: rootPaths.root },
          { label: 'Productos', active: true },
        ]}
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <ProductsListContainer />
      </Paper>
    </Stack>
  );
}
