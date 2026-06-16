import { test, expect } from '@grafana/plugin-e2e';

test('should render config editor', async ({ createDataSourceConfigPage, readProvisionedDataSource, page }) => {
  const ds = await readProvisionedDataSource({ fileName: 'aws-iot-twinmaker.yaml', name: 'AWS IoT TwinMaker' });
  await createDataSourceConfigPage({ type: ds.type });
  await expect(page.getByTestId('connection-config')).toBeVisible();
});
