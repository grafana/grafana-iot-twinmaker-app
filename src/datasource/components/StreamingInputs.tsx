import { EditorField } from '@grafana/experimental';
import { FieldValidationMessage, InlineField, InlineSwitch, Switch } from '@grafana/ui';
import { TwinMakerQuery } from 'common/manager';
import React from 'react';
import { BlurTextInput } from './BlurTextInput';

interface Props {
  newFormStylingEnabled: boolean;
  grafanaLiveEnabled: boolean;
  onToggleStream: () => void;
  onIntervalChange: () => void;
  invalidInterval: boolean;
  query: TwinMakerQuery;
}

export function StreamingInputs({
  grafanaLiveEnabled,
  onToggleStream,
  onIntervalChange,
  invalidInterval,
  query,
  newFormStylingEnabled,
}: Props) {
  if (!grafanaLiveEnabled) {
    return null;
  }
  // Fixing weird typing issue
  const FVM = FieldValidationMessage as any;
  return (
    <>
      {newFormStylingEnabled ? (
        <>
          <EditorField
            label="Stream"
            tooltip="Polling data in an interval"
            error={invalidInterval && 'Interval must be at least 5s'}
            width={10}
          >
            <Switch value={Boolean(query.isStreaming)} onChange={onToggleStream} />
          </EditorField>
          <EditorField label="Interval" width={5} htmlFor="interval">
            <BlurTextInput
              id="interval"
              placeholder="30"
              value={query.intervalStreaming ?? ''}
              onChange={onIntervalChange}
              numeric={true}
            />
          </EditorField>
        </>
      ) : (
        <>
          <InlineField label="Stream" tooltip="Polling data in an interval">
            <InlineSwitch value={Boolean(query.isStreaming)} onChange={onToggleStream} />
          </InlineField>
          <InlineField
            label="Interval"
            tooltip="Set an interval in seconds to stream data, min 5s, default 30s"
            disabled={!query.isStreaming}
            invalid={invalidInterval}
          >
            <>
              <BlurTextInput
                width={8}
                placeholder="30"
                value={query.intervalStreaming ?? ''}
                onChange={onIntervalChange}
                numeric={true}
              />
              {invalidInterval && <FVM>Interval must be at least 5s</FVM>}
            </>
          </InlineField>
        </>
      )}
    </>
  );
}
