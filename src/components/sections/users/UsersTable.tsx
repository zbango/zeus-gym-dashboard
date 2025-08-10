import { RefObject, useMemo, useState } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { esES } from '@mui/x-data-grid/locales';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StaffRow, useStaffList } from 'hooks/useStaffList';
import { useSnackbar } from 'notistack';
import { softDeleteStaff } from 'services/staff';
import { useSWRConfig } from 'swr';
import { UserRole, UserRoleColors, UserRoleLabels } from 'types/users';
import ConfirmDialog from 'components/base/ConfirmDialog';
import TableRowMenuOptions from 'components/base/TableRowMenuOptions';
import DataGridPagination from 'components/pagination/DataGridPagination';
import UserDialog from './UserDialog';

const defaultPageSize = 8;

interface UsersTableProps {
  apiRef: RefObject<GridApiCommunity | null>;
  filterButtonEl: HTMLButtonElement | null;
}

const UsersTable = ({ apiRef, filterButtonEl }: UsersTableProps) => {
  const [editingRow, setEditingRow] = useState<StaffRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<StaffRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate } = useSWRConfig();
  const { data: rows = [] } = useStaffList(100);
  const { enqueueSnackbar } = useSnackbar();
  dayjs.locale('es');
  dayjs.extend(relativeTime);
  const columns: GridColDef<StaffRow>[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Nombre',
        minWidth: 260,
        flex: 1,
        renderCell: (params) => <Typography variant="subtitle2">{params.row.name}</Typography>,
      },
      {
        field: 'email',
        headerName: 'Email',
        minWidth: 260,
        renderCell: (params) => (
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        ),
      },
      {
        field: 'role',
        headerName: 'Rol',
        minWidth: 140,
        renderCell: (params) => (
          <Chip
            label={UserRoleLabels[params.row.role as UserRole] ?? '—'}
            variant="soft"
            color={(UserRoleColors[params.row.role as UserRole] ?? 'info') as ChipProps['color']}
          />
        ),
      },
      {
        field: 'phone',
        headerName: 'Teléfono',
        minWidth: 180,
        renderCell: (params) => (
          <Typography variant="subtitle2">{params.row.phone || '—'}</Typography>
        ),
      },
      {
        field: 'created_at',
        headerName: 'Fecha de creación',
        minWidth: 260,
        renderCell: (params) => {
          const iso = params.row.created_at;
          if (!iso) return <Typography variant="body2">—</Typography>;
          const d = dayjs(iso);
          return (
            <Stack>
              <Typography variant="body2">{d.format('DD/MM/YYYY HH:mm')}</Typography>
            </Stack>
          );
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
              {
                label: 'Editar',
                onClick: () => setEditingRow(params.row),
              },
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
        initialState={{
          pagination: { paginationModel: { pageSize: defaultPageSize } },
        }}
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
            await softDeleteStaff(deletingRow.id);
            await mutate('staff:list');
            enqueueSnackbar('Usuario eliminado', { variant: 'success' });
            setDeletingRow(null);
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Operación fallida';
            enqueueSnackbar(message, { variant: 'error' });
          } finally {
            setIsDeleting(false);
          }
        }}
        title="Eliminar usuario"
        description={
          <>
            ¿Seguro que quieres eliminar a
            <Typography component="span" sx={{ fontWeight: 600, mx: 0.5 }}>
              {deletingRow?.name || deletingRow?.email}
            </Typography>
            ? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        confirmColor="error"
        loading={isDeleting}
      />
      {editingRow && (
        <UserDialog
          open={!!editingRow}
          onClose={() => setEditingRow(null)}
          mode="edit"
          row={editingRow}
        />
      )}
    </Box>
  );
};

export default UsersTable;
