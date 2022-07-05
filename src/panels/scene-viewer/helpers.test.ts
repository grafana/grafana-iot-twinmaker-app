const mockLocationSrv = {
  update: jest.fn(),
};
jest.doMock('@grafana/runtime', () => ({
  getLocationSrv: () => mockLocationSrv,
  getTemplateSrv: () => ({
    replace: (v: string) => v,
  }),
}));

import { DataBindingLabelKeys, IAnchorEvent, INavLink } from 'aws-iot-twinmaker-grafana-utils';
import { TWINMAKER_PANEL_TYPE_ID } from 'common/constants';
import { PanelModel } from 'common/dashboard';
import { getValidHttpUrl, updateSceneViewerPanel, updateUrlParams } from './helpers';

describe('panel helpers', () => {
  describe('updateSceneViewerPanel', () => {
    it('should override scene viewer panel in newPanels with current viewer panel', () => {
      const mockCurrentPanels = [
        {
          id: 2,
          type: TWINMAKER_PANEL_TYPE_ID.SCENE,
          gridPos: { h: 2, w: 2, x: 2, y: 2 },
          options: {
            datasource: 'ds-2',
            sceneId: 'scene-2',
            customSelEntityVarName: 'curr',
          },
          random: 'abc',
        },
      ] as any as PanelModel[];
      const mockNewPanels = [
        {
          id: 4,
          type: TWINMAKER_PANEL_TYPE_ID.SCENE,
          gridPos: { h: 4, w: 4, x: 4, y: 4 },
          options: {
            datasource: 'ds-2',
            sceneId: 'scene-2',
            customSelEntityVarName: 'new',
          },
          random: '123',
        },
        {
          id: 2,
          type: 'random-panel',
          gridPos: { h: 2, w: 2, x: 2, y: 2 },
          options: {},
        },
      ] as any as PanelModel[];

      const options = updateSceneViewerPanel(mockCurrentPanels, mockNewPanels);

      // should use customSelEntityVarName from new panel
      expect(options.customSelEntityVarName).toEqual('new');
      // should have other settings from current panel
      expect((mockNewPanels[0] as any).random).toEqual('abc');
      // should use panel id from new panel
      expect(mockNewPanels[0].id).toEqual(4);
      expect(mockCurrentPanels[0].id).toEqual(4);
      // should use panel gridPos from new panel
      expect(mockNewPanels[0].gridPos).toEqual({ h: 4, w: 4, x: 4, y: 4 });
      expect(mockCurrentPanels[0].gridPos).toEqual({ h: 4, w: 4, x: 4, y: 4 });
      // should keep ther panels
      expect((mockNewPanels[1] as any).type).toEqual('random-panel');
    });

    it('should not override scene viewer panel in newPanels with current viewer panel', () => {
      const mockCurrentPanels = [
        {
          id: 2,
          type: TWINMAKER_PANEL_TYPE_ID.SCENE,
          gridPos: { h: 2, w: 2, x: 2, y: 2 },
          options: {
            datasource: 'ds-2',
            sceneId: 'scene-2',
            customSelEntityVarName: 'curr',
          },
          random: 'abc',
        },
      ] as any as PanelModel[];
      const mockNewPanels = [
        {
          id: 4,
          type: TWINMAKER_PANEL_TYPE_ID.SCENE,
          gridPos: { h: 4, w: 4, x: 4, y: 4 },
          options: {
            datasource: 'ds-4',
            sceneId: '',
            customSelEntityVarName: 'new',
          },
          random: '123',
        },
      ] as any as PanelModel[];

      const options = updateSceneViewerPanel(mockCurrentPanels, mockNewPanels);

      // should use customSelEntityVarName from new panel
      expect(options.customSelEntityVarName).toEqual('new');
      expect((mockNewPanels[0] as any).random).toEqual('123');
    });
  });

  describe('getValidHttpUrl', () => {
    const navLink: INavLink = {
      destination: 'https://www.amazon.com/',
      params: {
        paramA: 'valueA',
      },
    };

    it('should generate url', () => {
      const expected = new URL(navLink.destination!);
      expected.searchParams.append('paramA', 'valueA');

      const result = getValidHttpUrl(navLink);

      expect(result).toEqual(expected);
    });

    it('should not generate url for invalid link', () => {
      const invalidLink = {
        ...navLink,
        destination: 'www.amazon.com',
      };

      const result = getValidHttpUrl(invalidLink);

      expect(result).toBeUndefined();
    });
  });

  describe('updateUrlParams', () => {
    const anchorData: IAnchorEvent = {
      eventType: 'click',
      anchorNodeRef: 'anchor-ref',
      isSelected: true,
      navLink: {
        params: {
          random: '123',
        },
      },
      dataBindingContext: {
        [DataBindingLabelKeys.entityId]: 'entity-1',
        [DataBindingLabelKeys.componentName]: 'comp-1',
        [DataBindingLabelKeys.propertyName]: 'prop-1',
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should not call update url when anchorData is undefined', () => {
      updateUrlParams('sel-entity', 'sel-comp');

      expect(mockLocationSrv.update).not.toBeCalled();
    });

    it('should call update url with data when anchorData is selected', () => {
      const expectedParams = {
        'var-sel-aaa': (anchorData.dataBindingContext as any)[DataBindingLabelKeys.entityId],
        'var-sel-bbb': (anchorData.dataBindingContext as any)[DataBindingLabelKeys.componentName],
        'var-sel-ccc': (anchorData.dataBindingContext as any)[DataBindingLabelKeys.propertyName],
        'var-random': '123',
      };
      updateUrlParams('sel-aaa', 'sel-bbb', 'sel-ccc', anchorData);

      expect(mockLocationSrv.update).toBeCalledTimes(1);
      expect(mockLocationSrv.update).toBeCalledWith({
        query: expectedParams,
        partial: true,
      });
    });

    it('should call update url with undefined when anchorData is selected', () => {
      const expectedParams = {
        'var-sel-aaa': undefined,
        'var-sel-bbb': undefined,
        random: undefined,
      };
      updateUrlParams('sel-aaa', 'sel-bbb', 'sel-ccc', { ...anchorData, isSelected: false });

      expect(mockLocationSrv.update).toBeCalledTimes(1);
      expect(mockLocationSrv.update).toBeCalledWith({
        query: expectedParams,
        partial: true,
      });
    });
  });
});
