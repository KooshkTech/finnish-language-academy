import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request:NextRequest){
  const roomId=request.nextUrl.searchParams.get("roomId"); if(!roomId)return NextResponse.json({error:"roomId required"},{status:400})
  const supabase=await createClient(); if(!supabase)return NextResponse.json({error:"Supabase not configured"},{status:503})
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Authentication required"},{status:401})
  const {data:room,error}=await supabase.from("live_quiz_rooms").select("id,game_pin,host_user_id,status,current_question_index,time_per_question_seconds,questions,question_started_at").eq("id",roomId).maybeSingle()
  if(error||!room)return NextResponse.json({error:"Room unavailable"},{status:404})
  const {data:players}=await supabase.from("live_quiz_players").select("id,user_id,nickname,score,current_streak,last_answer_correct").eq("room_id",roomId).order("score",{ascending:false})
  const me=players?.find(p=>p.user_id===user.id)
  const isHost=room.host_user_id===user.id
  return NextResponse.json({room,players:players??[],me,isHost})
}

