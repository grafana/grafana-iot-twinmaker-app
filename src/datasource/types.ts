import { AwsAuthDataSourceJsonData, AwsAuthDataSourceSecureJsonData } from '@grafana/aws-sdk';
import { TwinMakerQueryType, TwinMakerQuery } from 'common/manager';

export const defaultQuery: Partial<TwinMakerQuery> = {
  queryType: TwinMakerQueryType.GetAlarms,
};
export interface AWSTokenInfo {
  expiration: number;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

/**
 * Metadata attached to DataFrame results
 */
export interface TwinMakerCustomMeta {
  nextToken?: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface TwinMakerDataSourceOptions extends AwsAuthDataSourceJsonData {
  workspaceId?: string;
  assumeRoleArnWriter?: string;
}
export interface TwinMakerSecureJsonData extends AwsAuthDataSourceSecureJsonData {
  // nothing for now
  anythingSecure?: string;
}
