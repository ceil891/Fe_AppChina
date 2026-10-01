import type { SVGProps } from 'react'
type IconName = 'search' | 'mail' | 'lock' | 'eye' | 'eye-off' | 'arrow' | 'book' | 'cards' | 'chart' | 'user' | 'menu' | 'close' | 'check' | 'shield' | 'clock' | 'spark' | 'info'
const paths: Record<IconName, string> = {
  search: 'M17 10a7 7 0 11-14 0 7 7 0 0114 0 M15 15l6 6',
  mail: 'M3 5h18v14H3z M3 6l9 7 9-7',
  lock: 'M5 10h14v11H5z M8 10V7a4 4 0 018 0v3 M12 14v3',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M15 12a3 3 0 11-6 0 3 3 0 016 0',
  'eye-off': 'M3 3l18 18 M10 5c6-1 10 5 12 7-1 2-2 3-4 4 M6 6c-2 2-3 4-4 6 2 3 5 7 10 7 2 0 3 0 4-1 M10 10a3 3 0 004 4',
  arrow: 'M4 12h15 M13 6l6 6-6 6',
  book: 'M12 5v16 M12 5C8 2 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-6-2-10 1',
  cards: 'M7 3h13v16H7z M4 6H2v16h13v-1',
  chart: 'M4 3v18h17 M8 16v-4 M13 16V8 M18 16V5',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0 M4 21v-2a8 8 0 0116 0v2',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'M6 6l12 12 M6 18L18 6',
  check: 'M5 12l4 4L19 6',
  shield: 'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6z M8 12l3 3 5-6',
  clock: 'M22 12a10 10 0 11-20 0 10 10 0 0120 0 M12 6v6l4 2',
  spark: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
  info: 'M22 12a10 10 0 11-20 0 10 10 0 0120 0 M12 11v6 M12 7v1',
}
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>
}
