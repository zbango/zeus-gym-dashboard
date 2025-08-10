import { RefObject, useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import { esES } from '@mui/x-data-grid/locales';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CustomerRow, useCustomers } from 'hooks/useCustomers';
import TableRowMenuOptions from 'components/base/TableRowMenuOptions';
import DataGridPagination from 'components/pagination/DataGridPagination';

const defaultPageSize = 8;

interface CustomersTableProps {
  apiRef: RefObject<GridApiCommunity | null>;
  filterButtonEl: HTMLButtonElement | null;
}

const CustomersTable = ({ apiRef, filterButtonEl }: CustomersTableProps) => {
  const { data: rows = [] } = useCustomers(100);
  dayjs.locale('es');
  dayjs.extend(relativeTime);

  const columns: GridColDef<CustomerRow>[] = useMemo(
    () => [
      {
        field: 'first_name',
        headerName: 'Cliente',
        minWidth: 320,
        flex: 1,
        renderCell: (params) => (
          <Stack>
            <Typography variant="subtitle2">
              {params.row.first_name} {params.row.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Stack>
        ),
      },
      { field: 'phone', headerName: 'Teléfono', minWidth: 180 },
      {
        field: 'created_at',
        headerName: 'Fecha de registro',
        minWidth: 220,
        renderCell: (params) => {
          const d = dayjs(params.row.created_at);
          return (
            <Stack>
              <Typography variant="body2">{d.format('DD/MM/YYYY HH:mm')}</Typography>
              <Typography variant="caption" color="text.secondary">
                {d.fromNow()}
              </Typography>
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
        renderCell: () => (
          <TableRowMenuOptions
            menuItems={[
              { label: 'Ver', onClick: () => {} },
              { label: 'Editar', onClick: () => {} },
              { label: 'Eliminar', sx: { color: 'error.main' }, onClick: () => {} },
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
    </Box>
  );
};

export default CustomersTable;
