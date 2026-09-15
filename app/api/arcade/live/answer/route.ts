import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { LiveQuizQuestion } from "@/data/live-quiz"

type Payload={roomId?:string;questionIndex?:number;optionIndex?:number}
function isQuestion(value:unknown):value is LiveQuizQuestion{return Boolean(value&&typeof value==="object"&&typeof (value as Record<string,unknown>).correctOptionIndex==="number")}
export async function POST(request:NextRequest){
  const body=await request.json() as Payload; if(!body.roomId||typeof body.questionIndex!=="number"||typeof body.optionIndex!=="number"||body.optionIndex<0||body.optionIndex>3)return NextResponse.json({error:"Invalid answer payload"},{status:400})
  const userClient=await createClient(); if(!userClient)return NextResponse.json({error:"Supabase not configured"},{status:503}); const {data:{user}}=await userClient.auth.getUser(); if(!user)return NextResponse.json({error:"Authentication required"},{status:401})
  const admin=createAdminClient(); if(!admin)return NextResponse.json({error:"Server scoring is not configured"},{status:503})
  const {data:room}=await admin.from("live_quiz_rooms").select("id,status,current_question_index,questions,question_started_at,time_per_question_seconds").eq("id",body.roomId).maybeSingle(); if(!room||room.status!=="active"||room.current_question_index!==body.questionIndex)return NextResponse.json({error:"Question is no longer active"},{status:409})
  const question=Array.isArray(room.questions)?room.questions[body.questionIndex]:undefined; if(!isQuestion(question))return NextResponse.json({error:"Question data invalid"},{status:500})
  const {data:player}=await admin.from("live_quiz_players").select("id,score,current_streak").eq("room_id",room.id).eq("user_id",user.id).maybeSingle(); if(!player)return NextResponse.json({error:"Join the room first"},{status:403})
  const isCorrect=body.optionIndex===question.correctOptionIndex
  const started=room.question_started_at?new Date(room.question_started_at).getTime():Date.now(); const elapsed=Math.max(0,Date.now()-started); const maxMs=(room.time_per_question_seconds??20)*1000; if(elapsed>maxMs+1500)return NextResponse.json({error:"Answer window closed"},{status:409}); const speedFactor=Math.max(.2,1-elapsed/maxMs); const points=isCorrect?Math.round(500+500*speedFactor):0; const streak=isCorrect?(player.current_streak??0)+1:0
  const {error:answerError}=await admin.from("live_quiz_answers").insert({room_id:room.id,player_id:player.id,question_index:body.questionIndex,option_index:body.optionIndex,is_correct:isCorrect,points_awarded:points}); if(answerError?.code==="23505")return NextResponse.json({error:"Answer already submitted"},{status:409}); if(answerError)return NextResponse.json({error:answerError.message},{status:500})
  await admin.from("live_quiz_players").update({score:(player.score??0)+points,current_streak:streak,last_answer_correct:isCorrect}).eq("id",player.id)
  return NextResponse.json({ok:true,isCorrect,points,explanation:question.explanation})
}

