import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';
import { cssVarRgba } from 'lib/utils';

const Backdrop: Components<Omit<Theme, 'components'>>['MuiBackdrop'] = {
  styleOverrides: {
    invisible: {
      backgroundColor: 'transparent',
      backdropFilter: 'none',
    },
    root: ({ theme }) => ({
      backgroundColor: cssVarRgba(theme.vars.palette.grey['950Channel'], 0.2),
      backdropFilter: 'blur(4px)',
    }),
  },
};

export default Backdrop;
