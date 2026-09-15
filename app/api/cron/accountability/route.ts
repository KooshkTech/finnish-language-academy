import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) return NextResponse.json({error:"Unauthorized"},{status:401})
  const supabase=createAdminClient(); if(!supabase)return NextResponse.json({error:"Admin Supabase is not configured"},{status:503})
  const {data:missed,error}=await supabase.from("weekly_assignments").select("id,user_id").eq("is_completed",false).eq("penalty_applied",false).eq("is_mandatory",true).lt("due_at",new Date().toISOString()).limit(500)
  if(error)return NextResponse.json({error:error.message},{status:500})
  const byUser=new Map<string,string[]>()
  for(const row of missed??[]){const list=byUser.get(row.user_id)??[];list.push(row.id);byUser.set(row.user_id,list)}
  let processed=0
  for(const [userId,ids] of byUser){
    const {data:profile}=await supabase.from("learning_profiles").select("age_tier").eq("user_id",userId).maybeSingle()
    const kids=profile?.age_tier==="kids"
    const {data:state}=await supabase.from("user_accountability").select("hearts_remaining,missed_count_this_week").eq("user_id",userId).maybeSingle()
    const missedCount=(state?.missed_count_this_week??0)+ids.length
    const hearts=kids?(state?.hearts_remaining??5):Math.max(0,(state?.hearts_remaining??5)-ids.length)
    await supabase.from("user_accountability").upsert({user_id:userId,hearts_remaining:hearts,missed_count_this_week:missedCount,is_detention_active:kids?false:true,updated_at:new Date().toISOString()},{onConflict:"user_id"})
    await supabase.from("weekly_assignments").update({penalty_applied:true}).in("id",ids)
    processed+=ids.length
  }
  return NextResponse.json({ok:true,processed})
}

