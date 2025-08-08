import person3 from 'assets/images/avatar/avatar_3.webp';
import person4 from 'assets/images/avatar/avatar_4.webp';
import person8 from 'assets/images/avatar/avatar_8.webp';
import person11 from 'assets/images/avatar/avatar_11.webp';
import person14 from 'assets/images/avatar/avatar_14.webp';

export const files = [
  {
    name: 'aurora_test17.zip',
    path: ':: files / New folder / aurora /',
    icon: 'material-symbols:folder-zip-outline-rounded',
  },
  {
    name: 'How_to_not_click_on_perfectly_innocent_looking_links_and_download_malware.pdf',
    path: ':: files / Download /',
    icon: 'material-symbols:picture-as-pdf-outline-rounded',
  },
];

export const contacts = [
  {
    name: 'Gojo Satoru',
    avatar: person11,
  },
  {
    name: 'Nanami Kento',
    avatar: person4,
    disabled: true,
  },
  {
    name: 'Kugisaki Nobara',
    avatar: person3,
  },
  {
    name: 'Zenin Maki',
    avatar: person14,
  },
  {
    name: 'Todo Aoi',
    avatar: person8,
  },
];

export const tags = [
  'Calender',
  'Starter',
  'Back',
  'Procrastination',
  'Support',
  'Ideate',
  'Brainstorm',
  'How Might We',
];

export const breadcrumbs = [
  [
    {
      label: 'App',
      href: '#!',
    },
    {
      label: 'E-commerce',
      href: '#!',
    },
    {
      label: 'Customers',
      href: '#!',
    },
    {
      label: 'Create new',
      href: '#!',
      active: true,
    },
  ],
  [
    {
      label: 'Homepage',
      href: '#!',
    },
    {
      label: 'E-commerce',
      href: '#!',
      active: true,
    },
  ],
  [
    {
      label: 'Pages',
      href: '#!',
    },
    {
      label: 'Starter',
      href: '#!',
      active: true,
    },
  ],
];

export default {
  files,
  contacts,
  tags,
  breadcrumbs,
};
