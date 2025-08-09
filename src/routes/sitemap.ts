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
    subheader: 'Pages',
    key: 'pages',
    icon: 'material-symbols:view-quilt-outline',
    items: [
      {
        name: 'Starter',
        key: 'starter',
        path: rootPaths.root,
        pathName: 'starter',
        icon: 'material-symbols:play-circle-outline-rounded',
        active: true,
      },
      {
        name: 'Clientes',
        key: 'customers',
        path: rootPaths.customersRoot,
        pathName: 'customers',
        icon: 'material-symbols:group-outline-rounded',
        active: true,
      },
      {
        name: 'Usuarios',
        key: 'users',
        path: rootPaths.staffRoot,
        pathName: 'users',
        icon: 'material-symbols:badge-outline',
        active: true,
      },
    ],
  },
];

export default sitemap;
