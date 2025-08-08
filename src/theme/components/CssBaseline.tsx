import { Theme } from '@mui/material';
import { Components } from '@mui/material/styles';
import keyFrames from 'theme/styles/keyFrames';
import popper from 'theme/styles/popper';
import scrollbar from 'theme/styles/scrollbar';
import simplebar from 'theme/styles/simplebar';
import vibrantNav from 'theme/styles/vibrantNav';

const CssBaseline: Components<Omit<Theme, 'components'>>['MuiCssBaseline'] = {
  defaultProps: {},
  styleOverrides: (theme) => ({
    body: {
      [`h1, h2, h3, h4, h5, h6, p`]: {
        margin: 0,
      },
      fontVariantLigatures: 'none',
      ...scrollbar(theme),
      [`[id]`]: {
        scrollMarginTop: 82,
      },
    },
    ...simplebar(theme),
    ...keyFrames(),
    ...popper(theme),
    ...vibrantNav(theme),
  }),
};

export default CssBaseline;
