import { RefObject, useMemo, useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { esES } from '@mui/x-data-grid/locales';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ProductRow, useProducts } from 'hooks/useProducts';
import { useSnackbar } from 'notistack';
import { softDeleteProduct } from 'services/products';
import { useSWRConfig } from 'swr';
import ConfirmDialog from 'components/base/ConfirmDialog';
import TableRowMenuOptions from 'components/base/TableRowMenuOptions';
import DataGridPagination from 'components/pagination/DataGridPagination';
import ProductDialog from './ProductDialog';

const defaultPageSize = 8;

interface ProductsTableProps {
  apiRef: RefObject<GridApiCommunity | null>;
  filterButtonEl: HTMLButtonElement | null;
}

const ProductsTable = ({ apiRef, filterButtonEl }: ProductsTableProps) => {
  const [editingRow, setEditingRow] = useState<ProductRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<ProductRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: rows = [] } = useProducts(200);
  const { enqueueSnackbar } = useSnackbar();
  dayjs.locale('es');
  dayjs.extend(relativeTime);
  const columns: GridColDef<ProductRow>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Producto',
        minWidth: 260,
        flex: 1,
        renderCell: (params) => <Typography variant="subtitle2">{params.row.name}</Typography>,
      },
      {
        field: 'sku',
        headerName: 'SKU',
        minWidth: 120,
        renderCell: (params) => (
          <Typography variant="caption" color="text.secondary">
            {params.row.sku || '—'}
          </Typography>
        ),
      },
      {
        field: 'price_cents',
        headerName: 'Precio',
        minWidth: 120,
        valueGetter: (p: { row: ProductRow }) => (p?.row?.price_cents ?? 0) / 100,
        renderCell: (params) => (
          <Typography variant="subtitle2">${params.value?.toFixed(2)}</Typography>
        ),
      },
      {
        field: 'on_hand',
        headerName: 'Stock',
        minWidth: 100,
        renderCell: (params) => (
          <Typography variant="subtitle2">{params.row.on_hand ?? 0}</Typography>
        ),
      },
      {
        field: 'active',
        headerName: 'Estado',
        minWidth: 140,
        renderCell: (params) => (
          <Chip
            label={params.row.active ? 'Activo' : 'Inactivo'}
            variant="soft"
            color={(params.row.active ? 'success' : 'default') as ChipProps['color']}
          />
        ),
      },
      {
        field: 'created_at',
        headerName: 'Creado',
        minWidth: 220,
        renderCell: (params) => {
          const iso = params.row.created_at;
          if (!iso) return <Typography variant="body2">—</Typography>;
          const d = dayjs(iso);
          return <Typography variant="body2">{d.format('DD/MM/YYYY HH:mm')}</Typography>;
        },
        sortComparator: (v1, v2) => dayjs(v1 ?? 0).valueOf() - dayjs(v2 ?? 0).valueOf(),
      },
      {
        field: 'action',
        headerName: '',
        filterable: false,
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <TableRowMenuOptions
            menuItems={[
              { label: 'Editar', onClick: () => setEditingRow(params.row) },
              {
                label: 'Eliminar',
                sx: { color: 'error.main' },
                onClick: () => setDeletingRow(params.row),
              },
            ]}
          />
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={{ width: 1 }}>
      <DataGrid
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        rowHeight={64}
        rows={rows}
        getRowId={(r) => r.id}
        apiRef={apiRef}
        columns={columns}
        pageSizeOptions={[defaultPageSize, 15]}
        initialState={{ pagination: { paginationModel: { pageSize: defaultPageSize } } }}
        slots={{ basePagination: (props) => <DataGridPagination showFullPagination {...props} /> }}
        slotProps={{ panel: { target: filterButtonEl } }}
      />
      <ConfirmDialog
        open={!!deletingRow}
        onClose={() => setDeletingRow(null)}
        onConfirm={async () => {
          if (!deletingRow) return;
          setIsDeleting(true);
          try {
            await softDeleteProduct(deletingRow.id);
            await mutate('store:products:list');
            enqueueSnackbar('Producto eliminado', { variant: 'success' });
            setDeletingRow(null);
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Operación fallida';
            enqueueSnackbar(message, { variant: 'error' });
          } finally {
            setIsDeleting(false);
          }
        }}
        title="Eliminar producto"
        description={
          <>
            ¿Seguro que quieres eliminar
            <Typography component="span" sx={{ fontWeight: 600, mx: 0.5 }}>
              {deletingRow?.name}
            </Typography>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        confirmColor="error"
        loading={isDeleting}
      />
      {editingRow && (
        <ProductDialog
          open={!!editingRow}
          onClose={() => setEditingRow(null)}
          mode="edit"
          row={editingRow}
        />
      )}
    </Box>
  );
};

export default ProductsTable;
