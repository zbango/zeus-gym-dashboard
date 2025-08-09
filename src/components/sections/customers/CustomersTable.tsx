import { RefObject, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Box, Chip, ChipOwnProps, Link, Stack } from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, GridColDef } from '@mui/x-data-grid';
import { GridApiCommunity } from '@mui/x-data-grid/internals';
import useNumberFormat from 'hooks/useNumberFormat';
import paths from 'routes/paths';
import Image from 'components/base/Image';
import DataGridPagination from 'components/pagination/DataGridPagination';
import DashboardMenu from 'components/sections/common/DashboardMenu';

interface IImage {
  color?: string;
  src: string;
}

export interface ProductListAdmin {
  id: number;
  name: string;
  image: IImage;
  category: string;
  status: 'active' | 'inactive' | 'draft' | 'archive';
  price: {
    regular: number;
    discounted: number;
  };
  vendor: string;
  stock: number;
  publishedAt: string;
}

const getStatusBadgeColor = (val: string): ChipOwnProps['color'] => {
  switch (val) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'neutral';
    case 'draft':
      return 'warning';
    case 'archive':
      return 'error';
    default:
      return 'primary';
  }
};

const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

const defaultPageSize = 8;

interface ProductsTableProps {
  apiRef: RefObject<GridApiCommunity | null>;
  filterButtonEl: HTMLButtonElement | null;
}

const ProductsTable = ({ apiRef, filterButtonEl }: ProductsTableProps) => {
  const { currencyFormat } = useNumberFormat();
  const navigate = useNavigate();
  const columns: GridColDef<ProductListAdmin>[] = useMemo(
    () => [
      {
        ...GRID_CHECKBOX_SELECTION_COL_DEF,
        width: 64,
      },
      {
        field: 'name',
        headerName: 'Cliente',
        minWidth: 500,
        flex: 1,
        renderCell: (params) => {
          return (
            <Stack
              spacing={1.25}
              sx={{
                alignItems: 'center',
              }}
            >
              <Image
                src={params.row.image.src}
                alt={params.row.name}
                onClick={() => navigate(paths.productDetails(String(params.row.id)))}
                sx={{ cursor: 'pointer' }}
                height={48}
                width={48}
              />
              <Link
                href={paths.productDetails(String(params.row.id))}
                variant="subtitle2"
                sx={{ fontWeight: 400 }}
              >
                {params.row.name}
              </Link>
            </Stack>
          );
        },
      },
      {
        field: 'category',
        headerName: 'Category',
        minWidth: 148,
        renderCell: (params) => {
          return <Chip label={params.row.category} variant="soft" color="neutral" />;
        },
      },
      {
        field: 'price',
        headerName: 'Price',
        minWidth: 80,
        valueGetter: ({ discounted }) => discounted,
        renderCell: ({ row: { price } }) => currencyFormat(price.discounted),
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 148,
        renderCell: (params) => {
          return (
            <Chip
              label={params.row.status}
              variant="soft"
              color={getStatusBadgeColor(params.row.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          );
        },
      },
      {
        field: 'stock',
        headerName: 'Inventory',
        minWidth: 108,
        renderCell: (params) => zeroPad(params.row.stock, 2),
      },
      {
        field: 'vendor',
        headerName: 'Vendor',
        minWidth: 200,
        renderCell: (params) => {
          return (
            <Link variant="subtitle2" href="#!" sx={{ fontWeight: 400 }}>
              {params.row.vendor}
            </Link>
          );
        },
      },
      {
        field: 'publishedAt',
        headerName: 'Fecha de registro',
        minWidth: 130,
        filterable: false,
        renderCell: (params) => params.row.publishedAt,
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
    [currencyFormat],
  );
  return (
    <Box sx={{ width: 1 }}>
      <DataGrid
        rowHeight={64}
        rows={[]}
        apiRef={apiRef}
        columns={columns}
        pageSizeOptions={[defaultPageSize, 15]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: defaultPageSize,
            },
          },
        }}
        checkboxSelection
        slots={{
          basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
        }}
        slotProps={{
          panel: {
            target: filterButtonEl,
          },
        }}
      />
    </Box>
  );
};

export default ProductsTable;
