import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dictionaryEntries } from "@/data/dictionary"

type Payload={entryId?:string}
export async function GET(){
  const supabase=await createClient(); if(!supabase)return NextResponse.json({configured:false,bookmarks:[]})
  const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({authenticated:false,bookmarks:[]})
  const {data,error}=await supabase.from("dictionary_bookmarks").select("dictionary_entry_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false})
  if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({authenticated:true,bookmarks:data??[]})
}
export async function POST(request:NextRequest){
  const body=await request.json() as Payload; const entryId=body.entryId??""; if(!dictionaryEntries.some(entry=>entry.id===entryId))return NextResponse.json({error:"Unknown dictionary entry"},{status:400})
  const supabase=await createClient(); if(!supabase)return NextResponse.json({error:"Supabase not configured"},{status:503}); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Authentication required"},{status:401})
  const {error}=await supabase.from("dictionary_bookmarks").upsert({user_id:user.id,dictionary_entry_id:entryId},{onConflict:"user_id,dictionary_entry_id",ignoreDuplicates:true}); if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true})
}

