import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Payload={roomId?:string;action?:"start"|"next"|"finish"}
export async function POST(request:NextRequest){
  const body=await request.json() as Payload; if(!body.roomId||!body.action)return NextResponse.json({error:"roomId and action required"},{status:400})
  const supabase=await createClient(); if(!supabase)return NextResponse.json({error:"Supabase not configured"},{status:503})
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Authentication required"},{status:401})
  const {data:room}=await supabase.from("live_quiz_rooms").select("id,host_user_id,status,current_question_index,questions").eq("id",body.roomId).maybeSingle(); if(!room||room.host_user_id!==user.id)return NextResponse.json({error:"Host access required"},{status:403})
  const questions=Array.isArray(room.questions)?room.questions:[]
  if(body.action==="finish"){await supabase.from("live_quiz_rooms").update({status:"finished",ended_at:new Date().toISOString()}).eq("id",room.id);return NextResponse.json({ok:true})}
  const nextIndex=body.action==="start"?0:room.current_question_index+1
  if(nextIndex>=questions.length){await supabase.from("live_quiz_rooms").update({status:"finished",ended_at:new Date().toISOString()}).eq("id",room.id);return NextResponse.json({ok:true,finished:true})}
  const {error}=await supabase.from("live_quiz_rooms").update({status:"active",current_question_index:nextIndex,question_started_at:new Date().toISOString()}).eq("id",room.id)
  if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true,currentQuestionIndex:nextIndex})
}

