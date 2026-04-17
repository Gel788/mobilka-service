export function formatPriceRub(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
