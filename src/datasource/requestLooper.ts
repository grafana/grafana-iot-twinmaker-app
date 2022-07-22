import { DataQuery, DataQueryRequest, DataQueryResponse, LoadingState, DataFrame, dateTime } from '@grafana/data';
import { TwinMakerQueryType } from 'common/manager';
import { Observable, Subscription } from 'rxjs';

export interface MultiRequestTracker {
  fetchStartTime?: number; // The frontend clock
  fetchEndTime?: number; // The frontend clock
  data?: DataFrame[];
}

export interface RequestLoopOptions<TQuery extends DataQuery = DataQuery> {
  /**
   * If the response needs an additional request to execute, return it here
   */
  getNextQueries: (rsp: DataQueryResponse) => TQuery[] | undefined;

  /**
   * The datasource execute method
   */
  query: (req: DataQueryRequest<TQuery>) => Observable<DataQueryResponse>;

  /**
   * Process the results
   */
  process: (tracker: MultiRequestTracker, data: DataFrame[], isLast: boolean) => DataFrame[];

  /**
   * Callback that gets executed when unsubscribed
   */
  onCancel: (tracker: MultiRequestTracker) => void;
}

/**
 * Continue executing requests as long as `getNextQuery` returns a query
 */
interface TwinmakerQuery extends DataQuery {
  isStreaming?: boolean;
  intervalStreaming?: string;
}
export function getRequestLooper<T extends TwinmakerQuery>(
  req: DataQueryRequest<T>,
  options: RequestLoopOptions<T>
): Observable<DataQueryResponse> {
  let intervalTime = 0;
  // check for queries that are opted for streaming
  if (req.range.raw.to === 'now') {
    req.targets.forEach((t) => {
      if (t.queryType === TwinMakerQueryType.EntityHistory && t.isStreaming) {
        intervalTime = t.intervalStreaming === undefined ? 30 : Number(t.intervalStreaming);
      }
    });
  }

  return new Observable<DataQueryResponse>((subscriber) => {
    let nextQueries: T[] | undefined = undefined;
    let subscription: Subscription | undefined = undefined;
    const tracker: MultiRequestTracker = {
      fetchStartTime: Date.now(),
      fetchEndTime: undefined,
      data: [],
    };
    let loadingState: LoadingState | undefined = LoadingState.Loading;
    let count = 1;
    let cancel = false;

    // Single observer gets reused for each request
    const observer = {
      next: (rsp: DataQueryResponse) => {
        tracker.fetchEndTime = Date.now();
        loadingState = rsp.state;
        if (loadingState !== LoadingState.Error) {
          nextQueries = options.getNextQueries(rsp);
        }
        const data = options.process(tracker, rsp.data, !!!nextQueries);
        tracker.data = data;
        subscriber.next({
          ...rsp,
          data,
          state: intervalTime > 0 ? LoadingState.Streaming : loadingState,
          key: req.requestId,
        });
      },
      error: (err: any) => {
        subscriber.error(err);
      },
      complete: () => {
        if (subscription) {
          subscription.unsubscribe();
          subscription = undefined;
        }

        // Let the previous request finish first
        if (nextQueries) {
          tracker.fetchEndTime = undefined;
          tracker.fetchStartTime = Date.now();
          subscription = options
            .query({
              ...req,
              requestId: `${req.requestId}.${++count}`,
              startTime: tracker.fetchStartTime,
              targets: nextQueries,
            })
            .subscribe(observer);
          nextQueries = undefined;
        } else {
          if (intervalTime <= 0 || cancel) {
            subscriber.complete();
          } else {
            console.log('interval', intervalTime);
            tracker.fetchEndTime = undefined;
            tracker.fetchStartTime = Date.now();
            const lastBuffer = tracker.data?.[0]?.fields[1].values;
            const length = tracker.data ? tracker.data[0]?.length - 1 : 0;
            const lastTimeReceived = length > 0 ? lastBuffer?.get(length) : dateTime(tracker.fetchEndTime);
            setTimeout(() => {
              subscription = options
                .query({
                  ...req,
                  targets: req.targets,
                  requestId: `${req.requestId}.${++count}`,
                  startTime: tracker.fetchStartTime ?? 0,
                  range: {
                    from: lastTimeReceived,
                    to: dateTime(Date.now()),
                    raw: {
                      from: req.range.to,
                      to: 'now',
                    },
                  },
                })
                .subscribe(observer);
            }, intervalTime * 1000);
          }
        }
      },
    };

    // First request
    subscription = options.query(req).subscribe(observer);

    return () => {
      nextQueries = undefined;
      cancel = true;
      observer.complete();
      if (!tracker.fetchEndTime) {
        options.onCancel(tracker);
      }
    };
  });
}
