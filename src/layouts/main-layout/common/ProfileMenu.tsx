import { PropsWithChildren, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  MenuItemProps,
  Stack,
  Switch,
  SxProps,
  Typography,
  listClasses,
  listItemIconClasses,
  paperClasses,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { useThemeMode } from 'hooks/useThemeMode';
import { useAuth } from 'providers/AuthProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';

interface ProfileMenuProps {
  type?: 'default' | 'slim';
}

interface ProfileMenuItemProps extends MenuItemProps {
  icon: string;
  href?: string;
  sx?: SxProps;
}

const ProfileMenu = ({ type = 'default' }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { up } = useBreakpoints();
  const upSm = up('sm');
  const {
    config: { textDirection },
  } = useSettingsContext();

  const { isDark, setThemeMode } = useThemeMode();

  const { user: userData, signOut, staff } = useAuth();

  // Demo user data used for development purposes
  console.log('userData ', userData);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignout = () => {
    signOut();
    navigate(paths.defaultLoggedOut);
    handleClose();
  };

  const menuButton = (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={[
        {
          height: 44,
          width: 44,
        },
        type === 'slim' && {
          height: 30,
          width: 30,
          minWidth: 30,
        },
      ]}
    >
      <StatusAvatar
        alt={'userData.name'}
        status="online"
        src={undefined}
        sx={[
          {
            width: 40,
            height: 40,
            border: 2,
            borderColor: 'background.paper',
          },
          type === 'slim' && { width: 24, height: 24, border: 1, borderColor: 'background.paper' },
        ]}
      />
    </Button>
  );
  return (
    <>
      {type === 'slim' && upSm ? (
        <Button color="neutral" variant="text" size="small" onClick={handleClick}>
          {staff?.name}
        </Button>
      ) : (
        menuButton
      )}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'bottom',
        }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 320 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <StatusAvatar
            status="online"
            alt={'userData.name'}
            src={undefined}
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {staff?.name}
            </Typography>
            {/* {userData.designation && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'warning.main',
                }}
              >
                {userData.designation}
                <IconifyIcon
                  icon="material-symbols:diamond-rounded"
                  color="warning.main"
                  sx={{ verticalAlign: 'text-bottom', ml: 0.5 }}
                />
              </Typography>
            )} */}
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            onClick={() => setThemeMode()}
            icon="material-symbols:dark-mode-outline-rounded"
          >
            Modo oscuro
            <Switch checked={isDark} onChange={() => setThemeMode()} sx={{ ml: 'auto' }} />
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="material-symbols:manage-accounts-outline-rounded"
            onClick={handleClose}
            href="#!"
          >
            Configuración de la cuenta
          </ProfileMenuItem>
          <ProfileMenuItem
            icon="material-symbols:question-mark-rounded"
            onClick={handleClose}
            href="#!"
          >
            Centro de ayuda
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem onClick={handleSignout} icon="material-symbols:logout-rounded">
            Cerrar sesión
          </ProfileMenuItem>
        </Box>
      </Menu>
    </>
  );
};

const ProfileMenuItem = ({
  icon,
  onClick,
  children,
  href,
  sx,
}: PropsWithChildren<ProfileMenuItemProps>) => {
  const linkProps = href ? { component: Link, href, underline: 'none' } : {};
  return (
    <MenuItem onClick={onClick} {...linkProps} sx={{ gap: 1, ...sx }}>
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' },
        }}
      >
        <IconifyIcon icon={icon} sx={{ color: 'text.secondary' }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
