import {
  Backdrop,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  listItemTextClasses,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { sidenavVibrantStyle } from 'theme/styles/vibrantNav';
import IconifyIcon from 'components/base/IconifyIcon';
import VibrantBackground from 'components/common/VibrantBackground';
import SidenavDrawerContent from './SidenavDrawerContent';

const Sidenav = () => {
  const {
    config: { sidenavCollapsed, drawerWidth, navColor },
    toggleNavbarCollapse,
  } = useSettingsContext();
  const { currentBreakpoint } = useBreakpoints();

  const theme = useTheme();

  return (
    <Box
      component="nav"
      className="default-sidenav"
      sx={[
        {
          width: { md: drawerWidth },
          flexShrink: { sm: 0 },
          transition: {
            xs: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.standard,
            }),
            lg: 'none',
          },
          position: { md: 'absolute', lg: 'static' },
        },
        navColor === 'vibrant' && sidenavVibrantStyle,
      ]}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          [`& .${drawerClasses.paper}`]: {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 0,
            borderRight: navColor === 'vibrant' ? 0 : 1,
            borderColor: 'divider',
            transition: {
              xs: theme.transitions.create(['width'], {
                duration: theme.transitions.duration.standard,
              }),
              lg: 'none',
            },
          },
        }}
        open
      >
        {navColor === 'vibrant' && <VibrantBackground position="side" />}
        <SidenavDrawerContent />
        <Divider />
        <Toolbar variant="dense" sx={{ padding: '0 !important', height: 56 }}>
          <ListItem disablePadding sx={{ height: 1, width: 1 }}>
            <ListItemButton
              sx={[
                { height: 1, width: 1, borderRadius: 0, color: 'text.primary' },
                sidenavCollapsed && {
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 1,
                },
                !sidenavCollapsed &&
                  ((theme) => ({
                    minWidth: 180,
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'left',
                    p: theme.spacing(0.75, 5.75),
                  })),
              ]}
              onClick={toggleNavbarCollapse}
            >
              <ListItemIcon
                sx={{
                  minWidth: 18,
                  '& .iconify': {
                    fontSize: sidenavCollapsed ? 24 : 12,
                  },
                }}
              >
                {sidenavCollapsed ? (
                  <IconifyIcon icon="material-symbols:left-panel-open-outline" />
                ) : (
                  <IconifyIcon icon="material-symbols:left-panel-close-outline" />
                )}
              </ListItemIcon>

              {!sidenavCollapsed && (
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <ListItemText
                    sx={{
                      [`& .${listItemTextClasses.primary}`]: {
                        typography: 'caption',
                        fontWeight: 'medium',
                      },
                    }}
                  >
                    {sidenavCollapsed ? 'Expand' : 'Collapse'}
                  </ListItemText>
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        </Toolbar>
      </Drawer>
      {currentBreakpoint === 'md' && (
        <Backdrop open={!sidenavCollapsed} sx={{ zIndex: 1199 }} onClick={toggleNavbarCollapse} />
      )}
    </Box>
  );
};

export default Sidenav;
