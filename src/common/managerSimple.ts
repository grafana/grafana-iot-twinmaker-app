import { ReplaySubject } from 'rxjs';
import {
  TwinMakerDashboardManager,
  TwinMakerPanelInstance,
} from './manager';

export class SimpleTwinMakerDashboardManager implements TwinMakerDashboardManager {
  panels = new Map<number, ReplaySubject<TwinMakerPanelInstance>>();

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
