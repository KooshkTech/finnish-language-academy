import { NextRequest, NextResponse } from "next/server"
import { createTextPdf } from "@/services/pdf-report"

type Payload={title?:string;lines?:string[]}
export async function POST(request:NextRequest){
  const body=await request.json() as Payload
  const title=(body.title??"OpiOpe opiskelulomake").slice(0,120)
  const lines=Array.isArray(body.lines)?body.lines.filter((line):line is string=>typeof line==="string").map(line=>line.slice(0,220)).slice(0,40):[]
  const pdf=createTextPdf(title,lines)
  return new NextResponse(pdf,{headers:{"content-type":"application/pdf","content-disposition":"attachment; filename=opiope-study-sheet.pdf","cache-control":"no-store"}})
}

