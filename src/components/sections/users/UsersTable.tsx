import { RefObject, useMemo } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, GridColDef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { StaffRow, useStaffList } from 'hooks/useStaffList';
import DataGridPagination from 'components/pagination/DataGridPagination';
import DashboardMenu from 'components/sections/common/DashboardMenu';

const defaultPageSize = 8;

interface UsersTableProps {
  apiRef: RefObject<GridApiCommunity | null>;
  filterButtonEl: HTMLButtonElement | null;
}

const UsersTable = ({ apiRef, filterButtonEl }: UsersTableProps) => {
  const { data: rows = [] } = useStaffList(100);

  const columns: GridColDef<StaffRow>[] = useMemo(
    () => [
      { ...GRID_CHECKBOX_SELECTION_COL_DEF, width: 64 },
      {
        field: 'name',
        headerName: 'Nombre',
        minWidth: 260,
        flex: 1,
        renderCell: (params) => (
          <Stack>
            <Typography variant="subtitle2">
              {params.row.name ?? params.row.email ?? '(sin nombre)'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'role',
        headerName: 'Rol',
        minWidth: 140,
        renderCell: (params) => (
          <Chip
            label={params.row.role ?? '—'}
            variant="soft"
            color="neutral"
            sx={{ textTransform: 'capitalize' }}
          />
        ),
      },
      { field: 'phone', headerName: 'Teléfono', minWidth: 180 },
      {
        field: 'created_at',
        headerName: 'Creado',
        minWidth: 160,
        valueGetter: (v) => v,
      },
      {
        field: 'action',
        headerName: '',
        filterable: false,
        sortable: false,
        width: 60,
        align: 'right',
        headerAlign: 'right',
        renderCell: () => <DashboardMenu />,
      },
    ],
    [],
  );

  return (
    <Box sx={{ width: 1 }}>
      <DataGrid
        rowHeight={64}
        rows={rows}
        getRowId={(r) => r.id}
        apiRef={apiRef}
        columns={columns}
        pageSizeOptions={[defaultPageSize, 15]}
        initialState={{
          pagination: { paginationModel: { pageSize: defaultPageSize } },
        }}
        checkboxSelection
        slots={{ basePagination: (props) => <DataGridPagination showFullPagination {...props} /> }}
        slotProps={{ panel: { target: filterButtonEl } }}
      />
    </Box>
  );
};

export default UsersTable;
