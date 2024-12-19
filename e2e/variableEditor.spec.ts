import { expect, test } from '@grafana/plugin-e2e';

test('should render variable editor', async ({ variableEditPage, page }) => {
  await variableEditPage.datasource.set('AWS IoT TwinMaker');
  await expect(page.getByLabel('Query Type')).toBeVisible();
});
