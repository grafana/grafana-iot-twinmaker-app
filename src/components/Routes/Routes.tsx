import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { redirect } from '../../pages/redirectPage';

export const Routes = () => {
  return (
    <Switch>
      <Route exact path="/a/grafana-iot-twinmaker-app/redirect" component={redirect} />
    </Switch>
  );
};
