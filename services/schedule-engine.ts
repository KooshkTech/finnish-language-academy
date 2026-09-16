import type { AgeTier, LearningProfileState } from "@/types/profile"
import type { WeeklyTask } from "@/types/classroom"

const dayOrder: WeeklyTask["day"][] = ["MON","TUE","WED","THU","FRI","SAT","SUN"]

const base: WeeklyTask[] = [
  { day:"MON", assignedModule:"/reading", title:"Reading + vocabulary SRS", minutes:20, requiredScore:80, isMandatory:true },
  { day:"TUE", assignedModule:"/listening", title:"Listening + speaking", minutes:20, requiredScore:80, isMandatory:true },
  { day:"WED", assignedModule:"/understanding", title:"Grammar + Blackboard deep-dive", minutes:25, requiredScore:80, isMandatory:true },
  { day:"THU", assignedModule:"/writing", title:"Writing composition + teacher review", minutes:25, isMandatory:true },
  { day:"FRI", assignedModule:"/yki-test", title:"YKI / mixed comprehension", minutes:30, requiredScore:80, isMandatory:true },
  { day:"SAT", assignedModule:"/vocabulary", title:"Weekly review + homework gate", minutes:25, requiredScore:80, isMandatory:true },
  { day:"SUN", assignedModule:"/ai-tutor", title:"Rest / optional remediation", minutes:10, isMandatory:false },
]

function intensityMinutes(baseMinutes: number, intensity: LearningProfileState["intensity"]) {
  const factor = intensity === "casual" ? 0.75 : intensity === "intensive" ? 1.5 : 2.25
  return Math.max(10, Math.round(baseMinutes * factor / 5) * 5)
}

function adaptForAge(task: WeeklyTask, ageTier: AgeTier): WeeklyTask {
  if (ageTier === "kids") {
    if (task.day === "FRI") return { ...task, assignedModule:"/arcade", title:"Game-based weekly challenge", requiredScore:undefined, isMandatory:true }
    if (task.day === "SAT") return { ...task, assignedModule:"/arcade", title:"Positive review mini-games", requiredScore:undefined, isMandatory:true }
    return { ...task, requiredScore: task.requiredScore ? 70 : undefined }
  }
  if (ageTier === "youth" && task.day === "FRI") return { ...task, title:"Mixed challenge + YKI-style practice" }
  return task
}

export function buildWeeklyTemplate(profile: Pick<LearningProfileState,"ageTier"|"intensity">): WeeklyTask[] {
  return base.map(task => {
    const adapted = adaptForAge(task, profile.ageTier)
    return { ...adapted, minutes: intensityMinutes(adapted.minutes, profile.intensity) }
  })
}

function localDateString(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year:"numeric", month:"2-digit", day:"2-digit" }).formatToParts(now)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part=>part.type===type)?.value ?? ""
  return `${value("year")}-${value("month")}-${value("day")}`
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate()+days)
  return date.toISOString().slice(0,10)
}

function zonedLocalToUtc(dateString: string, hour: number, minute: number, timeZone: string) {
  const guess = new Date(`${dateString}T${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}:00Z`)
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23" }).formatToParts(guess)
  const num = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part=>part.type===type)?.value ?? "0")
  const representedAsUtc = Date.UTC(num("year"),num("month")-1,num("day"),num("hour"),num("minute"),num("second"))
  const offset = representedAsUtc - guess.getTime()
  return new Date(guess.getTime() - offset)
}

export function currentWeekStart(now: Date, timeZone: string) {
  const local = localDateString(now,timeZone)
  const day = new Date(`${local}T12:00:00Z`).getUTCDay()
  const mondayOffset = day === 0 ? -6 : 1-day
  return addDays(local,mondayOffset)
}

export function materializeWeeklyAssignments(profile: Pick<LearningProfileState,"ageTier"|"intensity">, timeZone: string, now = new Date()) {
  const weekStart = currentWeekStart(now,timeZone)
  return buildWeeklyTemplate(profile).map((task,index)=>({
    ...task,
    weekStart,
    dueAt: zonedLocalToUtc(addDays(weekStart,index),23,59,timeZone).toISOString(),
    homeworkTaskId: `${weekStart}-${task.day}-${task.assignedModule.slice(1)}`,
  }))
}

export { dayOrder }

