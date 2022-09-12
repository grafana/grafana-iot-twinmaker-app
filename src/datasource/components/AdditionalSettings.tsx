import React, { useState, ChangeEvent } from 'react';
import { Button, Input, useStyles2, FieldSet, ButtonGroup, InlineField, ToolbarButton } from '@grafana/ui';
import { PluginConfigPageProps, AppPluginMeta, PluginMeta, GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { css } from '@emotion/css';
import MatterportLoginButton from './MatterportLoginButton';

export type JsonData = {
  mpClientId?: string;
  isMpClientIdSet?: boolean;
  isMpClientSecretSet?: boolean;
  isMpAuthCodeSet?: boolean;
};

type State = {
  mpClientId?: string;
  mpClientSecret?: string;
  mpAuthCode?: string;
  isMpClientIdSet: boolean;
  isMpClientSecretSet: boolean;
  isMpAuthCodeSet: boolean;
};

interface Props extends PluginConfigPageProps<AppPluginMeta<JsonData>> {}

export const AdditionalSettings = ({ plugin }: Props) => {
  const s = useStyles2(getStyles);
  const { enabled, pinned, jsonData } = plugin.meta;
  const [state, setState] = useState<State>({
    mpClientId: jsonData?.mpClientId || undefined,
    isMpClientIdSet: Boolean(jsonData?.isMpClientIdSet),
    isMpClientSecretSet: Boolean(jsonData?.isMpClientSecretSet),
    isMpAuthCodeSet: Boolean(jsonData?.isMpAuthCodeSet),
  });

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

  const setAuthCodeCallback = (authCode: string) => {
    setState({
      ...state,
      isMpAuthCodeSet: false,
      mpAuthCode: authCode.trim(),
    });
  };

  const onSaveClick = () => {
    setState({
      ...state,
      isMpClientIdSet: true,
      isMpClientSecretSet: true,
      isMpAuthCodeSet: true,
    });
    updatePluginAndReload(plugin.meta.id, {
      enabled,
      pinned,
      jsonData: {
        mpClientId: state.mpClientId,
        isMpClientIdSet: true,
        isMpClientSecretSet: true,
        isMpAuthCodeSet: true,
      },
      secureJsonData:
        state.isMpClientIdSet && state.isMpClientSecretSet && state.isMpAuthCodeSet
          ? undefined
          : {
              mpClientSecret: state.mpClientSecret,
              mpAuthCode: state.mpAuthCode,
            },
    });
  };

  if (window.opener) {
    // get the authorization code out of the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    if (authCode !== null) {
      // post back to the app that opened this window
      window.opener.postMessage(
        {
          type: 'auth_model',
          authCode: authCode,
        },
        '*'
      );
    }
  }

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
                state.isMpAuthCodeSet ||
                !state.mpAuthCode
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

const updatePluginAndReload = async (pluginId: string, data: Partial<PluginMeta<JsonData>>) => {
  try {
    await updatePlugin(pluginId, data);
    locationService.reload();
  } catch (e) {
    console.error('Error while updating the plugin', e);
  }
};

export const updatePlugin = async (pluginId: string, data: Partial<PluginMeta>) => {
  const response = await getBackendSrv().post(`/api/plugins/${pluginId}/settings`, data);
  return response?.data;
};
