import { useEffect } from 'react';
import { getTwinMakerDashboardManager } from 'common/manager';

export const usePanelRegistration = (id: number) => {
  useEffect(() => {
    getTwinMakerDashboardManager().registerTwinMakerPanel(id, {
      onDashboardAction: (cmd) => {},
    });
    //unmount effect
    return () => {
      getTwinMakerDashboardManager().destroyTwinMakerPanel(id);
    };
  }, [id]);
};
