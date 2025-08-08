import { Box, Stack, StackOwnProps } from '@mui/material';
import preloader from 'assets/json/pre-loader-2.json';
import Lottie from 'lottie-react';

const PageLoader = (props: StackOwnProps) => {
  return (
    <Stack
      {...props}
      sx={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          height: 1,
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      <Box
        sx={{
          height: 130,
          width: 130,
          opacity: 0.7,
        }}
      >
        <Lottie animationData={preloader} />
      </Box>
    </Stack>
  );
};

export default PageLoader;
