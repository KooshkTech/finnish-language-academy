import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { liveQuizQuestions } from "@/data/live-quiz"

function pin(){ return String(Math.floor(100000 + Math.random()*900000)) }
export async function POST(){
  const supabase=await createClient(); if(!supabase)return NextResponse.json({error:"Supabase not configured"},{status:503})
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Authentication required"},{status:401})
  let lastError="Could not create room"
  for(let i=0;i<5;i++){
    const gamePin=pin()
    const {data,error}=await supabase.from("live_quiz_rooms").insert({game_pin:gamePin,host_user_id:user.id,questions:liveQuizQuestions}).select("id,game_pin,status,current_question_index,time_per_question_seconds").single()
    if(!error&&data)return NextResponse.json({room:data})
    lastError=error?.message??lastError
  }
  return NextResponse.json({error:lastError},{status:500})
}

