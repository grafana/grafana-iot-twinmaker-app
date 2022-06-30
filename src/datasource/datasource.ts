import { Observable } from 'rxjs';
import { DataFrame, DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';

import { TwinMakerDataSourceOptions, AWSTokenInfo, TwinMakerCustomMeta } from './types';
import { Credentials } from 'aws-sdk/global';
import { TwinMakerWorkspaceInfoSupplier } from 'common/info/types';
import { getCachingWorkspaceInfoSupplier, getTwinMakerWorkspaceInfoSupplier } from 'common/info/info';
import { TwinMakerQueryType, TwinMakerQuery } from 'common/manager';
import { getRequestLooper, MultiRequestTracker } from './requestLooper';
import { appendMatchingFrames } from './appendFrames';

export class TwinMakerDataSource extends DataSourceWithBackend<TwinMakerQuery, TwinMakerDataSourceOptions> {
  private workspaceId: string;
  readonly info: TwinMakerWorkspaceInfoSupplier;

  constructor(public instanceSettings: DataSourceInstanceSettings<TwinMakerDataSourceOptions>) {
    super(instanceSettings);

    this.workspaceId = instanceSettings.jsonData.workspaceId!;

    // Load workspace info from resource calls
    this.info = getCachingWorkspaceInfoSupplier(
      getTwinMakerWorkspaceInfoSupplier((p, params) => {
        return this.getResource(p, params);
      })
    );
  }

  // This will support annotation queries for 7.2+
  annotations = {};

  getWorkspaceId() {
    return this.workspaceId;
  }

  async metricFindQuery(query: TwinMakerQuery) {
    if (query.queryType === TwinMakerQueryType.ListComponentNames) {
      if (!query.entityId) {
        return []; // nothing
      }
      const entityId = getTemplateSrv().replace(query.entityId || '');
      const einf = await this.info.getEntityInfo(entityId);
      return einf.map((t) => ({ text: t.label!, value: t.value! }));
    }

    // put a small cache on this?
    const sys = await this.info.getWorkspaceInfo();
    if (query.queryType === TwinMakerQueryType.ListComponentTypes) {
      return sys.components.map((t) => ({ text: t.label!, value: t.value! }));
    }

    // List all entities
    return sys.entities.map((t) => ({ text: t.label!, value: t.value! }));
  }

  /**
   * Supports template variables for entityId, componentName, selectedProperties, componentTypeId
   */
  applyTemplateVariables(query: TwinMakerQuery, scopedVars: ScopedVars): TwinMakerQuery {
    const templateSrv = getTemplateSrv();
    return {
      ...query,
      entityId: templateSrv.replace(query.entityId || '', scopedVars),
      componentName: templateSrv.replace(query.componentName || '', scopedVars),
      properties: query.properties?.map((p) => templateSrv.replace(p || '', scopedVars)) || [],
      componentTypeId: templateSrv.replace(query.componentTypeId || '', scopedVars),
    };
  }

  query(options: DataQueryRequest<TwinMakerQuery>): Observable<DataQueryResponse> {
    return getRequestLooper(options, {
      // Check for a "nextToken" in the response
      getNextQueries: (rsp: DataQueryResponse) => {
        if (rsp.data?.length) {
          const used = new Set<string>();
          const next: TwinMakerQuery[] = [];
          for (const frame of rsp.data as DataFrame[]) {
            const meta = frame.meta?.custom as TwinMakerCustomMeta;
            if (meta && meta.nextToken && !used.has(meta.nextToken)) {
              const query = options.targets.find((t) => t.refId === frame.refId);
              if (query) {
                used.add(meta.nextToken);
                next.push({
                  ...query,
                  nextToken: meta.nextToken,
                });
              }
            }
          }
          if (next.length) {
            return next;
          }
        }
        return undefined;
      },

      /**
       * The original request
       */
      query: (request: DataQueryRequest<TwinMakerQuery>) => {
        return super.query(request);
      },

      /**
       * Process the results
       */
      process: (t: MultiRequestTracker, data: DataFrame[], isLast: boolean) => {
        if (t.data) {
          // append rows to fields with the same structure
          t.data = appendMatchingFrames(t.data, data);
        } else {
          t.data = data; // hang on to the results from the last query
        }
        return t.data;
      },

      /**
       * Callback that gets executed when unsubscribed
       */
      onCancel: (tracker: MultiRequestTracker) => {},
    });
  }

  // Fetch temporary AWS tokens from the backend plugin and convert them into JS SDK Credentials
  getTokens = async (): Promise<Credentials> => {
    const tokenInfo = (await super.getResource('token')) as AWSTokenInfo;
    const credentials = new Credentials({
      accessKeyId: tokenInfo.accessKeyId,
      secretAccessKey: tokenInfo.secretAccessKey,
      sessionToken: tokenInfo.sessionToken,
    });
    credentials.expireTime = new Date(tokenInfo.expiration);
    return credentials;
  };
}
