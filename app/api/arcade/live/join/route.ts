import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Payload={pin?:string;nickname?:string}
function cleanNickname(value:string){return value.replace(/[^\p{L}\p{N} _.-]/gu,"").trim().slice(0,24)}
export async function POST(request:NextRequest){
  const body=await request.json() as Payload; const gamePin=(body.pin??"").replace(/\D/g,"").slice(0,6); const nickname=cleanNickname(body.nickname??"")
  if(gamePin.length!==6||!nickname)return NextResponse.json({error:"Valid 6-digit PIN and nickname required."},{status:400})
  const userClient=await createClient(); if(!userClient)return NextResponse.json({error:"Supabase not configured"},{status:503})
  const {data:{user}}=await userClient.auth.getUser(); if(!user)return NextResponse.json({error:"Authentication required"},{status:401})
  const admin=createAdminClient(); if(!admin)return NextResponse.json({error:"Server room service is not configured."},{status:503})
  const {data:room,error:roomError}=await admin.from("live_quiz_rooms").select("id,game_pin,status,current_question_index,time_per_question_seconds").eq("game_pin",gamePin).in("status",["waiting","active"]).maybeSingle()
  if(roomError||!room)return NextResponse.json({error:"Room not found or already ended."},{status:404})
  const {data:existing}=await admin.from("live_quiz_players").select("id,nickname,score,current_streak").eq("room_id",room.id).eq("user_id",user.id).maybeSingle()
  if(existing)return NextResponse.json({room,player:existing})
  const {data:player,error}=await admin.from("live_quiz_players").insert({room_id:room.id,user_id:user.id,nickname}).select("id,nickname,score,current_streak").single()
  if(error)return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({room,player})
}

