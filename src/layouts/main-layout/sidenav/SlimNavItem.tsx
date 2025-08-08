import { MouseEvent, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  listItemTextClasses,
} from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { cssVarRgba } from 'lib/utils';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SubMenuItem } from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';
import { useNavContext } from '../NavProvider';
import NavItemPopper from './NavItemPopper';

interface SlimNavItemProps {
  item: SubMenuItem;
  level: number;
}

const SlimNavItem = ({ item, level }: SlimNavItemProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openPopperMenu, setOpenPopperMenu] = useState(false);
  const { pathname } = useLocation();
  const { setOpenItems, openItems, isNestedItemOpen } = useNavContext();

  const {
    config: { navColor },
  } = useSettingsContext();

  const hasNestedItems = useMemo(() => Object.prototype.hasOwnProperty.call(item, 'items'), [item]);

  const toggleCollapseItem = (event: MouseEvent<HTMLElement>) => {
    if (level === 0) {
      setAnchorEl(event.currentTarget);
      setOpenPopperMenu(true);
      setOpenItems([item.pathName]);
    } else {
      if (hasNestedItems) {
        if (openItems[level] === item.pathName) {
          setOpenItems(openItems.slice(0, level));
        } else {
          const updatedOpenItems = [...openItems];
          updatedOpenItems[level] = item.pathName;
          setOpenItems(updatedOpenItems);
        }
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenPopperMenu(false);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenPopperMenu(true);
  };

  const listItemIconButton = (
    <ListItemButton
      component={hasNestedItems ? 'button' : NavLink}
      to={item.path}
      onClick={toggleCollapseItem}
      aria-expanded={openPopperMenu}
      selected={
        pathname === item.path ||
        (item.selectionPrefix && pathname!.includes(item.selectionPrefix)) ||
        isNestedItemOpen(item.items)
      }
      sx={[
        {
          color: 'text.secondary',
          p: 1.5,
          justifyContent: 'center',
          height: 48,
          width: 48,
        },
        !item.active && {
          color: ({ vars }) =>
            navColor === 'vibrant'
              ? `${vars.palette.vibrant.text.disabled} !important`
              : 'text.disabled',
        },
        openPopperMenu && {
          backgroundColor: ({ vars }) =>
            navColor === 'vibrant'
              ? cssVarRgba(vars.palette.primary.mainChannel, 0.36)
              : 'action.hover',
        },
      ]}
    >
      {item.icon && <IconifyIcon icon={item.icon} sx={{ fontSize: 22 }} />}
      {item.items && (
        <IconifyIcon
          icon="material-symbols:keyboard-arrow-right"
          sx={{
            fontSize: 12,
            position: 'absolute',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </ListItemButton>
  );

  const listItemButton = (
    <ListItemButton
      component={item.items ? 'button' : NavLink}
      to={item.path}
      onClick={toggleCollapseItem}
      aria-expanded={openPopperMenu}
      sx={[
        {
          color: 'text.secondary',
          minWidth: 180,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          py: 0.75,
          pl: 2,
          pr: 1.25,
        },
        !item.active && {
          color: 'text.disabled',
        },
      ]}
    >
      <Box
        sx={{
          flex: 1,
          width: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <ListItemText
          sx={{
            [`& .${listItemTextClasses.primary}`]: {
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {item.name}
        </ListItemText>

        {hasNestedItems && (
          <IconifyIcon
            icon="material-symbols:keyboard-arrow-right"
            sx={{
              fontSize: 12,
            }}
          />
        )}
      </Box>
    </ListItemButton>
  );

  return (
    <ListItem
      key={item.pathName}
      disablePadding
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleClose}
      sx={[
        {
          flexDirection: 'column',
        },
      ]}
    >
      {level === 0 ? (
        <Tooltip title={item.name} open={item.items ? false : undefined} placement="right" arrow>
          {listItemIconButton}
        </Tooltip>
      ) : (
        listItemButton
      )}

      {hasNestedItems && (
        <NavItemPopper
          handleClose={handleClose}
          anchorEl={anchorEl as HTMLElement}
          open={!!anchorEl && openPopperMenu}
          level={level + 1}
        >
          <List
            dense
            disablePadding
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {item.items!.map((nestedItem) => (
              <SlimNavItem key={nestedItem.pathName} item={nestedItem} level={level + 1} />
            ))}
          </List>
        </NavItemPopper>
      )}
    </ListItem>
  );
};

export default SlimNavItem;
