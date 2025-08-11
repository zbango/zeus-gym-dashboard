import { ChangeEvent, MouseEvent, useCallback, useState } from 'react';
import { Button, InputAdornment, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useGridApiRef } from '@mui/x-data-grid';
import IconifyIcon from 'components/base/IconifyIcon';
import StyledTextField from 'components/styled/StyledTextField';
import ProductDialog from './ProductDialog';
import ProductsTable from './ProductsTable';

const ProductsListContainer = () => {
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  const apiRef = useGridApiRef();
  const [openCreate, setOpenCreate] = useState(false);

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      apiRef.current?.setQuickFilterValues([e.target.value]);
    },
    [apiRef],
  );

  const handleToggleFilterPanel = (e: MouseEvent<HTMLButtonElement>) => {
    const isPanelOpen = apiRef.current?.state.preferencePanel.open;
    if (isPanelOpen) {
      setFilterButtonEl(null);
      apiRef.current?.hideFilterPanel();
    } else {
      setFilterButtonEl(e.currentTarget);
      apiRef.current?.showFilterPanel();
    }
  };

  return (
    <Grid container spacing={{ xs: 2, md: 4 }}>
      <Grid size={12}>
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          sx={{ columnGap: 1, rowGap: 2, justifyContent: 'space-between' }}
        >
          <Stack
            spacing={1}
            sx={{ flexGrow: 1, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ flexShrink: 0 }}
                onClick={() => setOpenCreate(true)}
              >
                Nuevo producto
              </Button>
              <StyledTextField
                id="search-box"
                type="search"
                fullWidth
                placeholder="Buscar producto"
                onChange={handleSearch}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconifyIcon
                          icon="material-symbols:search-rounded"
                          sx={{ fontSize: 20, color: 'text.secondary' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  maxWidth: { sm: 360, xl: 360 },
                  mr: { sm: 4, md: 11, lg: 0 },
                  order: { xs: 1, sm: 0 },
                }}
              />
            </Stack>
            <Button
              variant="soft"
              color="neutral"
              sx={{ flexShrink: 0 }}
              onClick={handleToggleFilterPanel}
            >
              Filtros
            </Button>
          </Stack>
        </Stack>
      </Grid>
      <Grid size={12}>
        <ProductsTable apiRef={apiRef} filterButtonEl={filterButtonEl} />
      </Grid>
      <ProductDialog open={openCreate} onClose={() => setOpenCreate(false)} mode="create" />
    </Grid>
  );
};

export default ProductsListContainer;
