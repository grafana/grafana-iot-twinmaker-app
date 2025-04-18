import { PanelModel as IPanelModel } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

// Extend the published types with the internal/experimental features required
export interface PanelModel<TOptions = any> extends IPanelModel<TOptions> {
  type: string;
  gridPos: any; // will be in 8.2 model
  getSaveModel: () => PanelModel;
  refresh: () => void;
}

export interface DashboardJSON {
  uid: string;
  panels: PanelModel[];
}

export interface DashboardMeta {
  dashboard: DashboardJSON;
}

export interface Dashboard extends DashboardJSON {
  updatePanels: (panels: IPanelModel[]) => void;
}

export function getDashboardByUid(uid: string): Promise<DashboardMeta> {
  return getBackendSrv().get(`/api/dashboards/uid/${uid}`);
}
