import { ReactElement } from 'react';
import { Stack, SxProps } from '@mui/material';
import ProfileMenu from './ProfileMenu';

interface AppbarActionItemsProps {
  type?: 'default' | 'slim';
  sx?: SxProps;
  searchComponent?: ReactElement;
}

const AppbarActionItems = ({ type = 'default', sx }: AppbarActionItemsProps) => {
  return (
    <Stack
      className="action-items"
      spacing={1}
      sx={{
        alignItems: 'center',
        ml: 'auto',
        ...sx,
      }}
    >
      {/* {searchComponent}
      <LanguageMenu type={type} />
      <ThemeToggler type={type} />
      <NotificationMenu type={type} /> */}
      <ProfileMenu type={type} />
    </Stack>
  );
};

export default AppbarActionItems;
