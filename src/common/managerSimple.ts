import { TWINMAKER_PANEL_TYPE_ID } from './constants';
import { getCurrentDashboard } from './dashboard';
import { ReplaySubject, of, mergeMap } from 'rxjs';
import {
  BaseDataQueryOptions,
  TwinMakerDashboardManager,
  TwinMakerPanelInstance,
  TwinMakerPanelQuery,
  panelTopicInfo,
  isTwinMakerPanelQuery,
} from './manager';

export class SimpleTwinMakerDashboardManager implements TwinMakerDashboardManager {
  panels = new Map<number, ReplaySubject<TwinMakerPanelInstance>>();

  /** A list of the scene viewer panels on the dashboard */
  listTwinMakerPanels() {
    const keep: Set<string> = new Set(Object.values(TWINMAKER_PANEL_TYPE_ID));
    const dash = getCurrentDashboard();
    // dashboard is not available in explore view
    if (!dash) {
      return [];
    }
    return dash.panels
      .filter((p) => keep.has(p.type))
      .map((p) => {
        let label = p.title ?? `Panel: ${p.id}`;
        if (p.options.sceneId) {
          label += ` (${p.options.sceneId})`;
        }
        return {
          value: p.id,
          label,
          imgUrl: `public/plugins/${p.type}/img/icon.svg`,
        };
      });
  }

  /** Get access to scene info */
  private getTwinMakerPanelInstance(panelId: number) {
    let p = this.panels.get(panelId);
    if (!p) {
      p = new ReplaySubject<TwinMakerPanelInstance>(1);
      this.panels.set(panelId, p);
    }
    return p;
  }

  /** Called when a scene panel initializes */
  registerTwinMakerPanel(panelId: number, panel: TwinMakerPanelInstance) {
    const subj = this.getTwinMakerPanelInstance(panelId);
    subj.next(panel);
  }

  /** Called when a scene panel is unmounted */
  destroyTwinMakerPanel(panelId: number) {
    const p = this.panels.get(panelId);
    if (p) {
      this.panels.delete(panelId);
      p.complete();
    }
  }
}

export function getSimpleTwinMakerDashboardManager(): TwinMakerDashboardManager {
  let v = (window as any).__TwinMakerPanelCache as TwinMakerDashboardManager; // may be initalized in a different module
  if (!v) {
    v = new SimpleTwinMakerDashboardManager();
    (window as any).__TwinMakerPanelCache = v;
  }
  return v;
}
