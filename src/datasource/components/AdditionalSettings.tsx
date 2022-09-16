import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Button, Input, useStyles2, FieldSet, ButtonGroup, InlineField, ToolbarButton } from '@grafana/ui';
import { PluginConfigPageProps, AppPluginMeta, GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { css } from '@emotion/css';
import MatterportLoginButton from './MatterportLoginButton';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { TwinMakerDataSource } from 'datasource/datasource';
import { getMPRefreshToken } from '../utils/tokenGeneratorUtils';
import { mpJsonData } from 'datasource/types';

type State = {
  mpClientId?: string;
  mpClientSecret?: string;
  mpRefreshToken?: string;
  isMpClientIdSet: boolean;
  isMpClientSecretSet: boolean;
  isMpRefreshTokenSet: boolean;
};

interface Props extends PluginConfigPageProps<AppPluginMeta<mpJsonData>> {}

export const AdditionalSettings = ({ plugin }: Props) => {
  const s = useStyles2(getStyles);
  const twinmakerDatasource = useRef<TwinMakerDataSource | undefined>();
  const jsonData = useRef<mpJsonData | undefined>();
  const datasourceId = window.location.pathname.split('/')[3];

  const [state, setState] = useState<State>({
    mpClientId: jsonData.current?.mpClientId || undefined,
    mpClientSecret: jsonData.current?.mpClientSecret || undefined,
    isMpClientIdSet: jsonData.current?.mpClientId !== undefined,
    isMpClientSecretSet: jsonData.current?.mpClientSecret !== undefined,
    isMpRefreshTokenSet: Boolean(jsonData.current?.isMpRefreshTokenSet),
  });

  useEffect(() => {
    const getDatasource = async () => {
      twinmakerDatasource.current = await getTwinMakerDatasource(datasourceId);
      const temp = await twinmakerDatasource.current?.getTokensV3();
      console.log(temp);
      jsonData.current = twinmakerDatasource.current?.getMpJsonData();
      setState({
        mpClientId: jsonData.current?.mpClientId || undefined,
        mpClientSecret: jsonData.current?.mpClientSecret || undefined,
        isMpClientIdSet: jsonData.current?.mpClientId !== undefined,
        isMpClientSecretSet: jsonData.current?.mpClientSecret !== undefined,
        isMpRefreshTokenSet: Boolean(jsonData.current?.isMpRefreshTokenSet),
      });
    };
    getDatasource();
  }, [datasourceId]);

  const onResetClientID = () =>
    setState({
      ...state,
      mpClientId: '',
      isMpClientIdSet: false,
    });

  const onChangeClientID = (event: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      mpClientId: event.target.value.trim(),
    });
  };

  const onResetClientSecret = () =>
    setState({
      ...state,
      mpClientSecret: '',
      isMpClientSecretSet: false,
    });

  const onChangeClientSecret = (event: ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      mpClientSecret: event.target.value.trim(),
    });
  };

  const setAuthCodeCallback = async (authCode: string) => {
    if (state.mpClientId && state.mpClientSecret && authCode) {
      const refresh_token = await getMPRefreshToken(state.mpClientId, state.mpClientSecret, authCode.trim());
      if (refresh_token && refresh_token !== '') {
        setState({
          ...state,
          isMpRefreshTokenSet: false,
          mpRefreshToken: refresh_token.trim(),
        });
      }
    }
  };

  const onSaveClick = async () => {
    setState({
      ...state,
      isMpClientIdSet: true,
      isMpClientSecretSet: true,
      isMpRefreshTokenSet: true,
    });
    updateDatasourceAndReload(datasourceId, {
      ...twinmakerDatasource.current?.instanceSettings,
      url: '',
      jsonData: {
        ...twinmakerDatasource.current?.instanceSettings.jsonData,
        mpJsonData: {
          mpClientId: state.mpClientId,
          mpClientSecret: state.mpClientSecret,
          isMpRefreshTokenSet: true,
        },
      },
      secureJsonData:
        state.isMpClientIdSet && state.isMpClientSecretSet && state.isMpRefreshTokenSet
          ? undefined
          : {
              mpRefreshToken: state.mpRefreshToken,
            },
    });
    twinmakerDatasource.current = await getTwinMakerDatasource(datasourceId);
  };

  return (
    <div>
      <FieldSet label="Matterport settings">
        <InlineField label="Client ID" labelWidth={20}>
          {state.isMpClientIdSet ? (
            <ButtonGroup className="width-30">
              <Input disabled placeholder="Configured" />
              <ToolbarButton icon="edit" tooltip="Edit Client ID" type="button" onClick={onResetClientID} />
            </ButtonGroup>
          ) : (
            <Input
              aria-label="Client ID"
              className="width-30"
              value={state.mpClientId ?? ''}
              onChange={onChangeClientID}
            />
          )}
        </InlineField>

        <InlineField label="Client Secret" labelWidth={20}>
          {state.isMpClientSecretSet ? (
            <ButtonGroup className="width-30">
              <Input disabled placeholder="Configured" />
              <ToolbarButton icon="edit" tooltip="Edit Client Secret" type="button" onClick={onResetClientSecret} />
            </ButtonGroup>
          ) : (
            <Input
              aria-label="Client Secret"
              className="width-30"
              value={state.mpClientSecret ?? ''}
              onChange={onChangeClientSecret}
            />
          )}
        </InlineField>

        <div className={s.marginTop}>
          <MatterportLoginButton
            disabled={Boolean(
              (!state.isMpClientIdSet && !state.mpClientId) || (!state.isMpClientSecretSet && !state.mpClientSecret)
            )}
            mpClientId={state.mpClientId}
            setAuthCodeCallback={setAuthCodeCallback}
          />
          <Button
            style={{ marginLeft: 10 }}
            type="submit"
            onClick={onSaveClick}
            disabled={Boolean(
              (!state.isMpClientIdSet && !state.mpClientId) ||
                (!state.isMpClientSecretSet && !state.mpClientSecret) ||
                state.isMpRefreshTokenSet ||
                !state.mpRefreshToken
            )}
          >
            Save
          </Button>
        </div>
      </FieldSet>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  colorWeak: css`
    color: ${theme.colors.text.secondary};
  `,
  marginTop: css`
    margin-top: ${theme.spacing(3)};
  `,
  marginTopXl: css`
    margin-top: ${theme.spacing(6)};
  `,
});

const updateDatasourceAndReload = async (datasourceId: string, data: any) => {
  try {
    await updateDatasource(datasourceId, data);
    locationService.reload();
  } catch (e) {
    console.error('Error while updating the datasource', e);
  }
};

export const updateDatasource = async (datasourceId: string, data: any) => {
  const response = await getBackendSrv().put(`/api/datasources/uid/${datasourceId}`, data);
  return response?.data;
};
