import { DataFrame, DataTransformerInfo, Field, FieldType, UrlQueryMap } from '@grafana/data';
import { getLocationSrv, getTemplateSrv, TemplateSrv } from '@grafana/runtime';
import { TableCellDisplayMode } from '@grafana/schema';
import { getTwinMakerDatasource } from 'common/datasourceSrv';
import { TwinMakerWorkspaceInfoSupplier } from 'common/info/types';
import { mergeMap, from } from 'rxjs';

export interface TwinMakerVarInfo {
  name: string;
  fieldName: string;
}

export interface RegisterTwinMakerLinksOptions {
  ds?: string;
  title?: string;
  vars: TwinMakerVarInfo[];
  addSelectionField?: boolean;
}

export const registerTwinMakerLinksTransformer: DataTransformerInfo<RegisterTwinMakerLinksOptions> = {
  id: 'twinmaker-register-links',
  name: 'Register links with AWS IoT TwinMaker',
  description: `Define selection behavior on the dashboard from the results of an IoT TwinMaker query.`,
  defaultOptions: {},

  operator: (options) => (source) => source.pipe(mergeMap((data) => from(doTwinMakerLinks(options, data)))),
};

async function doTwinMakerLinks(options: RegisterTwinMakerLinksOptions, data: DataFrame[]): Promise<DataFrame[]> {
  const ds = await getTwinMakerDatasource(options.ds);
  if (!ds) {
    return data;
  }
  return data.map((f) => applyTwinMakerLinks(ds.info, options, f));
}

// testable function!
// can have delayed lookup
export function applyTwinMakerLinks(
  ds: TwinMakerWorkspaceInfoSupplier,
  options: RegisterTwinMakerLinksOptions,
  data: DataFrame
): DataFrame {
  const fields: Field[] = data.fields.map((f) => ({
    ...f,
    config: {
      ...f.config,
      links: [
        {
          title: options.title ?? 'TwinMaker link',
          onClick: (evt: any) => {
            const rowIndex = evt?.origin?.rowIndex as number;
            const query: UrlQueryMap = {};
            if (rowIndex != null) {
              for (const v of options.vars) {
                if (v.fieldName && v.name) {
                  const vName = 'var-' + v.name.replace('${', '').replace('}', '');
                  const f = data.fields.find((f) => f.name === v.fieldName);
                  query[vName] = f?.values.get(rowIndex);
                }
              }
            }
            // Update the URL
            getLocationSrv().update({
              partial: true,
              query,
            });
          },
          url: '',
        },
      ],
    },
  }));
  if (options.addSelectionField) {
    const srv = getTemplateSrv();
    const check = options.vars.map((v) => findFieldValue(srv, v, data));

    const selection = new Array<string>(data.length);
    if (check.length) {
      for (let i = 0; i < data.length; i++) {
        let all = true;
        for (const c of check) {
          if (!c(i)) {
            all = false;
            break;
          }
        }
        if (all) {
          selection[i] = eyeIcon;
        }
      }
    }
    fields.unshift({
      name: ' ',
      values: selection,
      type: FieldType.string,
      config: {
        custom: { cellOptions: { type: TableCellDisplayMode.Image}, width: 1, align: 'center' } ,
      },
    });
  }
  return {
    ...data,
    fields,
  };
}

function findFieldValue(srv: TemplateSrv, info: TwinMakerVarInfo, frame: DataFrame): (i: number) => boolean {
  if (!(info.fieldName && info.name && frame?.fields?.length)) {
    return () => false;
  }
  const match = srv.replace(info.name);
  if (match && match.startsWith('${')) {
    return () => false;
  }

  const field = frame.fields.find((f) => f.name === info.fieldName);
  if (!field) {
    return () => false;
  }
  return (i: number) => {
    return match === field.values.get(i);
  };
}

export const eyeIcon =
  'data:image/png;base64,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';
