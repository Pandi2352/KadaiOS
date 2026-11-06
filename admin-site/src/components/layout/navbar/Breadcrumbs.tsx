import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumbs } from '@/lib/navigation';

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const items = getBreadcrumbs(pathname);

  return (
    <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
      <ol className="flex items-center gap-1.5 text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.label}>
              {index > 0 && <ChevronRight size={14} aria-hidden className="shrink-0" />}
              <li className="truncate">
                {isLast && <span aria-current="page" className="font-medium text-ink">{item.label}</span>}
                {!isLast && item.path && <Link to={item.path} className="hover:text-ink">{item.label}</Link>}
                {!isLast && !item.path && item.label}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
