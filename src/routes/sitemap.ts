import { SxProps } from '@mui/material';
import { rootPaths } from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
  roles?: string[]; // allowed roles; if omitted, visible to all
}

export interface MenuItem {
  id: string;
  key?: string; // used for the locale
  subheader: string;
  icon: string;
  iconSx?: SxProps;
  items: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 'pages',
    subheader: 'Administración',
    key: 'pages',
    icon: 'material-symbols:view-quilt-outline',
    items: [
      // {
      //   name: 'Starter',
      //   key: 'starter',
      //   path: rootPaths.root,
      //   pathName: 'starter',
      //   icon: 'material-symbols:play-circle-outline-rounded',
      //   active: true,
      // },
      // {
      //   name: 'Clientes',
      //   key: 'customers',
      //   path: rootPaths.customersRoot,
      //   pathName: 'customers',
      //   icon: 'material-symbols:group-outline-rounded',
      //   active: true,
      // },
      {
        name: 'Usuarios del sistema',
        key: 'users',
        path: rootPaths.staffRoot,
        pathName: 'users',
        icon: 'material-symbols:badge-outline',
        active: true,
        roles: ['admin'],
      },
      {
        name: 'Configuraciones',
        key: 'settings',
        path: 'settings/plans',
        pathName: 'settings',
        icon: 'material-symbols:badge-outline',
        active: true,
        roles: ['admin'],
      },
      {
        name: 'Tienda',
        key: 'store',
        path: rootPaths.storeRoot,
        pathName: 'store',
        icon: 'material-symbols:badge-outline',
        active: true,
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'customers',
    subheader: 'Clientes',
    key: 'customers',
    icon: 'material-symbols:view-quilt-outline',
    items: [
      {
        name: 'Administrar clientes',
        key: 'customers',
        path: rootPaths.customersRoot,
        pathName: 'customers',
        icon: 'material-symbols:group-outline-rounded',
        active: true,
      },
      {
        name: 'Vender productos',
        key: 'sell',
        path: rootPaths.sellRoot,
        pathName: 'sell',
        icon: 'material-symbols:group-outline-rounded',
        active: true,
      },
    ],
  },
];

export default sitemap;

export const sitemapForRole = (role?: string): MenuItem[] => {
  const isAllowed = (item: SubMenuItem) =>
    !item.roles || (role ? item.roles.includes(role) : false);

  const filterItems = (items: SubMenuItem[] = []): SubMenuItem[] =>
    items.filter(isAllowed).map((item) => ({
      ...item,
      items: item.items ? filterItems(item.items) : undefined,
    }));

  return sitemap.map((menu) => ({
    ...menu,
    items: filterItems(menu.items),
  }));
};
