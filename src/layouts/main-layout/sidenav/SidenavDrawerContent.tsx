import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, IconButton, ListSubheader } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import { useSettingsContext } from 'providers/SettingsProvider';
import { useSupabaseAuth } from 'providers/auth-provider/AuthSupabaseProvider';
import { sitemapForRole } from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import { useNavContext } from '../NavProvider';
import NavItem from './NavItem';
import SidenavSimpleBar from './SidenavSimpleBar';

interface SidenavDrawerContentProps {
  variant?: 'permanent' | 'temporary';
}

const SidenavDrawerContent = ({ variant = 'permanent' }: SidenavDrawerContentProps) => {
  const { t } = useTranslation();
  const {
    config: { sidenavCollapsed, openNavbarDrawer, navigationMenuType },
    setConfig,
  } = useSettingsContext();

  const { sidenavAppbarVariant } = useNavContext();
  const { profile, staff } = useSupabaseAuth();
  const role = staff?.role || profile?.role;
  const menus = sitemapForRole(role || undefined);

  const expanded = useMemo(
    () => variant === 'temporary' || (variant === 'permanent' && !sidenavCollapsed),
    [sidenavCollapsed],
  );

  const toggleNavbarDrawer = () => {
    setConfig({
      openNavbarDrawer: !openNavbarDrawer,
    });
  };

  return (
    <>
      <Toolbar variant={sidenavAppbarVariant} sx={{ display: 'block', px: { xs: 0 } }}>
        <Box
          sx={[
            {
              height: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            !expanded && {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
            expanded && {
              pl: { xs: 4, md: 6 },
              pr: { xs: 2, md: 3 },
            },
          ]}
        >
          {(navigationMenuType === 'sidenav' || variant === 'temporary') && (
            <>
              <Logo showName={expanded} />
              <IconButton sx={{ mt: 1, display: { md: 'none' } }} onClick={toggleNavbarDrawer}>
                <IconifyIcon icon="material-symbols:left-panel-close-outline" fontSize={20} />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <SidenavSimpleBar>
          <Box
            sx={[
              {
                py: 2,
              },
              !expanded && {
                px: 2,
              },
              expanded && {
                px: { xs: 2, md: 4 },
              },
            ]}
          >
            {menus.map((menu, index) => (
              <Box key={menu.id}>
                {menu.subheader === 'Docs' && !sidenavCollapsed && (
                  <>
                    <Divider sx={{ mb: 4 }} />
                  </>
                )}
                <List
                  dense
                  key={menu.id}
                  sx={{
                    mb: index !== menus.length - 1 ? 3 : 0,
                    pb: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                  subheader={
                    menu.subheader && (
                      <ListSubheader
                        component="div"
                        disableGutters
                        sx={{
                          textAlign: expanded ? 'left' : 'center',
                          color: 'text.disabled',
                          typography: 'overline',
                          fontWeight: 700,
                          py: 1,
                          paddingLeft: expanded ? 2 : 0,
                          mb: 0.25,
                          position: 'static',
                          background: 'transparent',
                        }}
                      >
                        {t(menu.key || menu.subheader)}
                      </ListSubheader>
                    )
                  }
                >
                  {menu.items.map((item) => (
                    <NavItem key={item.pathName} item={item} level={0} />
                  ))}
                </List>
              </Box>
            ))}
          </Box>{' '}
        </SidenavSimpleBar>
      </Box>
    </>
  );
};

export default SidenavDrawerContent;
