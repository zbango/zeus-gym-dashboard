import { ChangeEvent } from 'react';
import { FormControlLabel, Radio } from '@mui/material';
import topnavDefaultDark from 'assets/images/sections/settings-panel/topnav-default-dark.webp';
import topnavDefault from 'assets/images/sections/settings-panel/topnav-default.webp';
import topnavSlimDark from 'assets/images/sections/settings-panel/topnav-slim-dark.webp';
import topnavSlim from 'assets/images/sections/settings-panel/topnav-slim.webp';
import topnavStackedDark from 'assets/images/sections/settings-panel/topnav-stacked-dark.webp';
import topnavStacked from 'assets/images/sections/settings-panel/topnav-stacked.webp';
import { TopnavType } from 'config';
import { useSettingsContext } from 'providers/SettingsProvider';
import SettingsItem from './SettingsItem';
import SettingsPanelRadioGroup from './SettingsPanelRadioGroup';

const TopnavShapePanel = () => {
  const {
    config: { topnavType },
    setConfig,
  } = useSettingsContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value as TopnavType;
    setConfig({
      topnavType: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="sidenav-shape" value={topnavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={{ light: topnavDefault, dark: topnavDefaultDark }}
            active={topnavType === 'default'}
          />
        }
      />
      <FormControlLabel
        value="slim"
        control={<Radio />}
        label={
          <SettingsItem
            label="Slim"
            image={{ light: topnavSlim, dark: topnavSlimDark }}
            active={topnavType === 'slim'}
          />
        }
      />
      <FormControlLabel
        value="stacked"
        control={<Radio />}
        label={
          <SettingsItem
            label="Stacked"
            image={{ light: topnavStacked, dark: topnavStackedDark }}
            active={topnavType === 'stacked'}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default TopnavShapePanel;
