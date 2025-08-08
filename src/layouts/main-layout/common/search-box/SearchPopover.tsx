import { ReactElement } from 'react';
import { Fade, Popover } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import SearchResult from './SearchResult';

interface TransitionComponentProps extends TransitionProps {
  children: ReactElement<any>;
  ref?: React.Ref<unknown>;
}

const Transition = ({ ref, ...props }: TransitionComponentProps) => <Fade ref={ref} {...props} />;

interface SearchPopoverProps {
  anchorEl: HTMLDivElement | HTMLButtonElement | null;
  handleClose: () => void;
}

const SearchPopover = ({ anchorEl, handleClose }: SearchPopoverProps) => {
  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      elevation={3}
      transitionDuration={150}
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          sx: {
            width: 1,
            maxWidth: { sm: 480 },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        },
        root: {
          slotProps: {
            backdrop: {
              invisible: false,
            },
          },
        },
      }}
    >
      <SearchResult handleClose={handleClose} />
    </Popover>
  );
};

export default SearchPopover;
