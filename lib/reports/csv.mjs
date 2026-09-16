export function safeSpreadsheetCell(value) {
  const raw = String(value ?? '')
  return /^(?:\s*[=+\-@]|[\t\r])/.test(raw) ? `'${raw}` : raw
}

export function csvCell(value) {
  return `"${safeSpreadsheetCell(value).replaceAll('"', '""')}"`
}

