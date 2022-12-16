import { useEffect } from 'react';
import { throwError } from 'rxjs';
import { getTwinMakerDashboardManager } from 'common/manager';

export const usePanelRegistration = (id: number) => {
  useEffect(() => {
    getTwinMakerDashboardManager().registerTwinMakerPanel(id, {
      twinMakerPanelQueryRunner: () => throwError(() => `not implemented yet (see twinmaker debug panel)`),
      onDashboardAction: (cmd) => {},
    });
    //unmount effect
    return () => {
      getTwinMakerDashboardManager().destroyTwinMakerPanel(id);
    };
  }, [id]);
};
