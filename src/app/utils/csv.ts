export function parseCsv(text: string): string[][] {
  const lines = text.replace(/\r/g, '').split('\n').filter(Boolean);
  return lines.map(l => l.split(',').map((v) => v.trim()));
}

