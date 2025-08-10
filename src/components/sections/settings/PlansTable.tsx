import { RefObject, useMemo, useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { esES } from '@mui/x-data-grid/locales';
import { PlanListRow, usePlans } from 'hooks/usePlans';
import { useSnackbar } from 'notistack';
import { softDeletePlan } from 'services/plans';
import { useSWRConfig } from 'swr';
import ConfirmDialog from 'components/base/ConfirmDialog';
import TableRowMenuOptions from 'components/base/TableRowMenuOptions';
import DataGridPagination from 'components/pagination/DataGridPagination';
import PlansDialog from './PlansDialog';

const defaultPageSize = 8;

interface PlansTableProps {
  apiRef?: RefObject<GridApiCommunity | null>;
  filterButtonEl?: HTMLButtonElement | null;
}

const PlansTable = ({ apiRef, filterButtonEl }: PlansTableProps) => {
  const { data: rows = [] } = usePlans(100);
  const { mutate } = useSWRConfig();
  const { enqueueSnackbar } = useSnackbar();
  const [editingRow, setEditingRow] = useState<PlanListRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<PlanListRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: GridColDef<PlanListRow>[] = useMemo(
    () => [
      { field: 'name', headerName: 'Nombre', minWidth: 260, flex: 1 },
      { field: 'description', headerName: 'Descripción', minWidth: 300, flex: 1 },
      {
        field: 'price_cents',
        headerName: 'Precio (USD)',
        minWidth: 180,
        renderCell: (params) => (
          <Typography variant="subtitle2">${(params.row.price_cents / 100).toFixed(2)}</Typography>
        ),
      },
      {
        field: 'interval',
        headerName: 'Tipo',
        minWidth: 160,
        renderCell: (params) => (
          <Chip
            label={params.row.interval === 'pack' ? 'Pack' : params.row.interval}
            variant="soft"
          />
        ),
      },
      {
        field: 'duration_days',
        headerName: 'Duración (días)',
        minWidth: 160,
        renderCell: (params) => (
          <Typography variant="subtitle2">{params.row.duration_days ?? '—'}</Typography>
        ),
      },
      {
        field: 'max_classes_per_period',
        headerName: 'Límite de clases',
        minWidth: 160,
        renderCell: (params) => (
          <Typography variant="subtitle2">{params.row.max_classes_per_period ?? '—'}</Typography>
        ),
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
        columns={columns}
        pageSizeOptions={[defaultPageSize, 15]}
        initialState={{ pagination: { paginationModel: { pageSize: defaultPageSize } } }}
        apiRef={apiRef}
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
            await softDeletePlan(deletingRow.id);
            await mutate('plans:list');
            enqueueSnackbar('Plan eliminado', { variant: 'success' });
            setDeletingRow(null);
          } catch (e) {
            enqueueSnackbar(e instanceof Error ? e.message : 'Operación fallida', {
              variant: 'error',
            });
          } finally {
            setIsDeleting(false);
          }
        }}
        title="Eliminar plan"
        description={
          <>
            ¿Seguro que quieres eliminar el plan <strong>{deletingRow?.name}</strong>?
          </>
        }
        confirmText="Eliminar"
        confirmColor="error"
        loading={isDeleting}
      />
      {editingRow && (
        <PlansDialog
          open={!!editingRow}
          onClose={() => setEditingRow(null)}
          mode="edit"
          row={editingRow}
        />
      )}
    </Box>
  );
};

export default PlansTable;
