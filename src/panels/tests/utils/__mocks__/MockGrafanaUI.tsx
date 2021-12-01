import React from 'react';

const createMockComponent = (testId: string, props: any[]) => {
  return <div data-testid={testId}>{JSON.stringify(props)}</div>;
};

export const mockGrafanaUI = () => {
  jest.doMock('@grafana/ui', () => ({
    ...(jest.requireActual('@grafana/ui') as any),
    LoadingPlaceholder: (...props: any[]) => createMockComponent('LoadingPlaceholder', props),
    Button: 'button',
  }));
};
