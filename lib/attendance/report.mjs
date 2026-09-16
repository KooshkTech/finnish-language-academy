export function attendanceSummary(marks, completedSessionCount) {
  const count = status => marks.filter(mark => mark.attendance_status === status).length
  const present = count('present')
  const late = count('late')
  const absent = count('absent')
  const excused = count('excused')
  const required = Math.max(0, completedSessionCount - excused)
  return {
    present,
    late,
    absent,
    excused,
    marked: marks.length,
    completed: completedSessionCount,
    unmarked: Math.max(0, completedSessionCount - marks.length),
    rate: required ? Math.round(((present + late) / required) * 100) : null,
  }
}

