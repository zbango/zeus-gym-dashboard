import { ChangeEvent } from 'react';
import { FormControlLabel, Radio } from '@mui/material';
import comboDark from 'assets/images/sections/settings-panel/combo-dark.webp';
import combo from 'assets/images/sections/settings-panel/combo.webp';
import sidenav from 'assets/images/sections/settings-panel/sidenav.webp';
import sidenavDark from 'assets/images/sections/settings-panel/sitenav-dark.webp';
import topnavDark from 'assets/images/sections/settings-panel/topnav-dark.webp';
import topnav from 'assets/images/sections/settings-panel/topnav.webp';
import { NavigationMenuType } from 'config';
import { useSettingsPanelContext } from 'providers/SettingsPanelProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_NAVIGATION_MENU_TYPE } from 'reducers/SettingsReducer';
import SettingsItem from './SettingsItem';
import SettingsPanelRadioGroup from './SettingsPanelRadioGroup';

const NavigationMenuPanel = () => {
  const {
    config: { navigationMenuType },
    configDispatch,
  } = useSettingsContext();

  const {
    settingsPanelConfig: { disableNavigationMenuSection },
  } = useSettingsPanelContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value as NavigationMenuType;
    configDispatch({
      type: SET_NAVIGATION_MENU_TYPE,
      payload: value,
    });
  };

  return (
    <SettingsPanelRadioGroup
      name="text-direction"
      value={navigationMenuType}
      onChange={handleChange}
    >
      <FormControlLabel
        value="sidenav"
        control={<Radio />}
        label={
          <SettingsItem
            label="Sidenav"
            image={{ light: sidenav, dark: sidenavDark }}
            active={!disableNavigationMenuSection && navigationMenuType === 'sidenav'}
          />
        }
      />
      <FormControlLabel
        value="topnav"
        control={<Radio />}
        label={
          <SettingsItem
            label="Topnav"
            image={{ light: topnav, dark: topnavDark }}
            active={!disableNavigationMenuSection && navigationMenuType === 'topnav'}
          />
        }
      />
      <FormControlLabel
        value="combo"
        control={<Radio />}
        label={
          <SettingsItem
            label="Combo"
            image={{ light: combo, dark: comboDark }}
            active={!disableNavigationMenuSection && navigationMenuType === 'combo'}
          />
        }
      />
    </SettingsPanelRadioGroup>
  );
};

export default NavigationMenuPanel;
