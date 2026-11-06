export const ELLIPSIS = 'ellipsis';

/** Every page when they fit, otherwise the first, the last and the ones around the current page. */
export function getPageNumbers(page: number, totalPages: number): (number | typeof ELLIPSIS)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, 4, ELLIPSIS, totalPages];
  if (page >= totalPages - 2) return [1, ELLIPSIS, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, ELLIPSIS, page - 1, page, page + 1, ELLIPSIS, totalPages];
}
