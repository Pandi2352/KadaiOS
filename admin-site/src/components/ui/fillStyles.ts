/**
 * From the lg breakpoint a list page is exactly as tall as the screen, so its table fills
 * the space and scrolls inside itself, with the pagination always in view. On smaller
 * screens the page just grows and scrolls as a whole.
 */
export const FILL_PAGE = 'lg:flex lg:h-full lg:flex-col';
export const FILL_REMAINING = 'lg:flex lg:min-h-0 lg:flex-1 lg:flex-col';
