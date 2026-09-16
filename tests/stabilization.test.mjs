import test from 'node:test'
import assert from 'node:assert/strict'
import { safeInternalPath } from '../lib/security/navigation.mjs'
import { attendanceSummary } from '../lib/attendance/report.mjs'
import { csvCell } from '../lib/reports/csv.mjs'

test('safeInternalPath blocks external and backslash redirects', () => {
  assert.equal(safeInternalPath('//evil.example'), '/')
  assert.equal(safeInternalPath('/\\\\evil.example'), '/')
  assert.equal(safeInternalPath('https://evil.example'), '/')
  assert.equal(safeInternalPath('/student?tab=feed#today'), '/student?tab=feed#today')
})

test('attendance rate includes unmarked completed sessions', () => {
  const summary = attendanceSummary([{ attendance_status: 'present' }], 10)
  assert.equal(summary.rate, 10)
  assert.equal(summary.unmarked, 9)
})

test('excused sessions do not reduce attendance rate', () => {
  const summary = attendanceSummary([{ attendance_status: 'present' }, { attendance_status: 'excused' }], 2)
  assert.equal(summary.rate, 100)
})

test('CSV cells neutralize spreadsheet formulas and escape quotes', () => {
  assert.equal(csvCell('=HYPERLINK("https://evil.example")'), '"\'=HYPERLINK(""https://evil.example"")"')
  assert.equal(csvCell('  +1+1'), '"\'  +1+1"')
  assert.equal(csvCell('Normal name'), '"Normal name"')
})

