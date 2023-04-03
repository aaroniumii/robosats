import React, { useContext } from 'react';
import { Grid, Paper } from '@mui/material';
import SettingsForm from '../../components/SettingsForm';
import { AppContext, UseAppStoreType } from '../../contexts/AppContext';
import FederationTable from '../../components/FederationTable';

const SettingsPage = (): JSX.Element => {
  const {
    windowSize,
    navbarHeight,
    federation,
    setFederation,
    setFocusedCoordinator,
    baseUrl,
    settings,
    setOpen,
    open,
  } = useContext<UseAppStoreType>(AppContext);
  const maxHeight = (windowSize.height - navbarHeight) * 0.85 - 3;

  return (
    <Paper
      elevation={12}
      sx={{
        padding: '0.6em',
        width: '20em',
        maxHeight: `${maxHeight}em`,
        overflow: 'auto',
        overflowX: 'clip',
      }}
    >
      <Grid container>
        <Grid item>
          <SettingsForm showNetwork={!(window.NativeRobosats === undefined)} />
        </Grid>
        <Grid item>
          <FederationTable
            federation={federation}
            setFederation={setFederation}
            setFocusedCoordinator={setFocusedCoordinator}
            openCoordinator={() => setOpen({ ...open, coordinator: true })}
            baseUrl={baseUrl}
            maxHeight={14}
            network={settings.network}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SettingsPage;
