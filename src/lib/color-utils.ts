export const COLOR_PALETTE: readonly string[] = [
  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-100',
  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
  'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-100',
  'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
  'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
];

/** Maps an array of string values to palette colours, cycling through the palette. */
export function buildColorMap(values: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  values.forEach((value, index) => {
    map[value] = COLOR_PALETTE[index % COLOR_PALETTE.length];
  });
  return map;
}
