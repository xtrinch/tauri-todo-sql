export const normalizeForSearch = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export const slovenianInsensitiveSql = (column: string) =>
  `lower(
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(${column}, 'č', 'c'),
            'Č', 'c'),
          'š', 's'),
        'Š', 's'),
      'ž', 'z'),
    'Ž', 'z')
  )`;
