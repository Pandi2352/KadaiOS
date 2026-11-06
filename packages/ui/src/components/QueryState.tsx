import type { ReactNode } from 'react';
import { getErrorMessage } from '../api/ApiError';
import type { ApiQuery } from '../hooks/useApiQuery';
import { Button } from './Button';
import { Loader } from './Loader';
import { Notice } from './Notice';

interface QueryStateProps<T> {
  query: ApiQuery<T>;
  loadingLabel: string;
  errorTitle: string;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/** The loading, error and empty states every screen that loads data needs. */
export function QueryState<T>({ query, loadingLabel, errorTitle, isEmpty, empty, children }: QueryStateProps<T>) {
  if (query.error) {
    return (
      <Notice
        title={errorTitle}
        action={
          <Button variant="outline" onClick={query.refetch}>
            Try again
          </Button>
        }
      >
        {getErrorMessage(query.error)}
      </Notice>
    );
  }

  if (query.data === undefined) {
    return <Loader label={loadingLabel} />;
  }

  return isEmpty?.(query.data) ? empty : children(query.data);
}
