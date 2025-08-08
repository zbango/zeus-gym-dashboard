import { ChangeEvent } from 'react';
import { FormControlLabel, Radio } from '@mui/material';
import sidenavDefaultDark from 'assets/images/sections/settings-panel/sidenav-default-dark.webp';
import sidenavDefault from 'assets/images/sections/settings-panel/sidenav-default.webp';
import slimDark from 'assets/images/sections/settings-panel/slim-dark.webp';
import slim from 'assets/images/sections/settings-panel/slim.webp';
import stackedDark from 'assets/images/sections/settings-panel/stacked-dark.webp';
import stacked from 'assets/images/sections/settings-panel/stacked.webp';
import { SidenavType } from 'config';
import { useSettingsPanelContext } from 'providers/SettingsPanelProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_SIDENAV_SHAPE } from 'reducers/SettingsReducer';
import SettingsItem from './SettingsItem';
import SettingsPanelRadioGroup from './SettingsPanelRadioGroup';

const SidenavShapePanel = () => {
  const {
    config: { sidenavType },
    configDispatch,
  } = useSettingsContext();

  const {
    settingsPanelConfig: { disableSidenavShapeSection },
  } = useSettingsPanelContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value as SidenavType;

    configDispatch({
      type: SET_SIDENAV_SHAPE,
      payload: value,
    });
  };

  return (
    <SettingsPanelRadioGroup name="sidenav-shape" value={sidenavType} onChange={handleChange}>
      <FormControlLabel
        value="default"
        control={<Radio />}
        label={
          <SettingsItem
            label="Default"
            image={{ light: sidenavDefault, dark: sidenavDefaultDark }}
            active={!disableSidenavShapeSection && sidenavType === 'default'}
          />
        }
      />
      <FormControlLabel
        value="slim"
        control={<Radio />}
        label={
          <SettingsItem
            label="Slim"
            image={{ light: slim, dark: slimDark }}
            active={!disableSidenavShapeSection && sidenavType === 'slim'}
          />
        }
      />
      <FormControlLabel
        value="stacked"
        control={<Radio />}
        label={
          <SettingsItem
            label="Stacked"
            image={{ light: stacked, dark: stackedDark }}
            active={!disableSidenavShapeSection && sidenavType === 'stacked'}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default SidenavShapePanel;
