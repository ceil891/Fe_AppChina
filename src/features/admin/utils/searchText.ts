export function searchText(value: string) {
  return value.trim().toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd')
}
