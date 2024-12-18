import { test, expect } from '@grafana/plugin-e2e';

test('should render query editor', async ({ panelEditPage, selectors }) => {
  await panelEditPage.datasource.set('AWS IoT TwinMaker');
  await expect(panelEditPage.getQueryEditorRow('A').getByLabel('Query Type')).toBeVisible();
});
