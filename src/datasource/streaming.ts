import { Observable, defer, mergeMap } from 'rxjs';

import { DataQueryRequest, DataQueryResponse, LiveChannelScope } from '@grafana/data';
import { getGrafanaLiveSrv } from '@grafana/runtime';

import { TwinMakerDataSource } from './datasource';
import { TwinMakerQuery } from 'common/manager';

/**
 * Calculate a unique key for the query.  The key is used to pick a channel and should
 * be unique for each distinct query execution plan.  This key is not secure and is only picked to avoid
 * possible collisions
 */
export async function getLiveStreamKey(query: TwinMakerQuery): Promise<string> {
  const str = JSON.stringify(query);

  const msgUint8 = new TextEncoder().encode(str); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer.slice(0, 8))); // first 8 bytes
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// This will get both v1 and v2 result formats
export function doTwinMakerChannelStream(
  query: TwinMakerQuery,
  ds: TwinMakerDataSource,
  options: DataQueryRequest<TwinMakerQuery>
): Observable<DataQueryResponse> {
  // maximum time to keep values
  const range = options.range;
  // const maxDelta = range.to.valueOf() - range.from.valueOf() + 1000;
  let maxLength = options.maxDataPoints ?? 1000;
  if (maxLength > 100) {
    // for small buffers, keep them small
    maxLength *= 2;
  }

  return defer(() => getLiveStreamKey(query)).pipe(
    mergeMap((key) => {
      return getGrafanaLiveSrv().getDataStream({
        addr: {
          scope: LiveChannelScope.DataSource,
          namespace: ds.uid,
          path: `tail/${key}`,
          data: {
            ...query,
            timeRange: {
              from: range.from.valueOf(),
              to: range.to.valueOf(),
            },
          },
        },
      });
      // .pipe(
      //   map((evt) => {
      //     const frame = updateFrame(evt);
      //     return {
      //       data: frame ? [frame] : [],
      //       state: LoadingState.Streaming,
      //     };
      //   })
      // );
    })
  );
}
