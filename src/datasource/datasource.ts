import { Observable } from 'rxjs';
import { DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend, getTemplateSrv } from '@grafana/runtime';

import { TwinMakerDataSourceOptions, AWSTokenInfo, mpJsonData } from './types';
import { Credentials } from 'aws-sdk/global';
import { TwinMakerWorkspaceInfoSupplier } from 'common/info/types';
import { getCachingWorkspaceInfoSupplier, getTwinMakerWorkspaceInfoSupplier } from 'common/info/info';
import { TwinMakerQueryType, TwinMakerQuery } from 'common/manager';
import { Credentials as CredentialsV3, CredentialProvider } from '@aws-sdk/types';

export class TwinMakerDataSource extends DataSourceWithBackend<TwinMakerQuery, TwinMakerDataSourceOptions> {
  private workspaceId: string;
  private mpJsonData: mpJsonData;
  readonly info: TwinMakerWorkspaceInfoSupplier;

  constructor(public instanceSettings: DataSourceInstanceSettings<TwinMakerDataSourceOptions>) {
    super(instanceSettings);

    this.workspaceId = instanceSettings.jsonData.workspaceId!;
    this.mpJsonData = instanceSettings.jsonData.mpJsonData!;

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

  getMpJsonData() {
    return this.mpJsonData;
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

  query(request: DataQueryRequest<TwinMakerQuery>): Observable<DataQueryResponse> {
    return super.query(request);
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

  // Support AWS SDK V3 Credentials
  getTokensV3: CredentialProvider = async () => {
    const tokenInfo = (await super.getResource('token')) as AWSTokenInfo;
    const credentials: CredentialsV3 = {
      accessKeyId: tokenInfo.accessKeyId,
      secretAccessKey: tokenInfo.secretAccessKey,
      sessionToken: tokenInfo.sessionToken,
      expiration: new Date(tokenInfo.expiration),
    };
    return credentials;
  };
}
