"use client"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { LiveQuizQuestion } from "@/data/live-quiz"

type Room={id:string;game_pin:string;host_user_id:string;status:"waiting"|"active"|"finished";current_question_index:number;time_per_question_seconds:number;questions:unknown[];question_started_at:string|null}
type Player={id:string;user_id:string|null;nickname:string;score:number;current_streak:number;last_answer_correct:boolean|null}
type StatePayload={room?:Room;players?:Player[];me?:Player;isHost?:boolean;error?:string}

type JoinPayload={room?:{id:string};player?:Player;error?:string}

function getQuestion(room?:Room):LiveQuizQuestion|undefined{
  if(!room||!Array.isArray(room.questions))return undefined
  const value=room.questions[room.current_question_index]
  if(!value||typeof value!=="object")return undefined
  const q=value as Record<string,unknown>
  if(typeof q.questionText!=="string"||!Array.isArray(q.options)||typeof q.correctOptionIndex!=="number")return undefined
  return value as LiveQuizQuestion
}

export function LiveQuizLobby(){
  const [roomId,setRoomId]=useState<string>()
  const [pin,setPin]=useState("")
  const [nickname,setNickname]=useState("")
  const [state,setState]=useState<StatePayload>({})
  const [message,setMessage]=useState("Create a room or join with a 6-digit PIN.")
  const [busy,setBusy]=useState(false)
  const [answerState,setAnswerState]=useState<{index?:number;message?:string}>({})
  const [clock,setClock]=useState(0)

  const refresh=useCallback(async(id=roomId)=>{
    if(!id)return
    try{const response=await fetch(`/api/arcade/live/state?roomId=${encodeURIComponent(id)}`,{cache:"no-store"});const data=await response.json() as StatePayload;if(response.ok)setState(data);else setMessage(data.error??"Room unavailable") }catch{setMessage("Could not refresh live room.")}
  },[roomId])

  useEffect(()=>{if(!roomId||!isSupabaseConfigured())return;const supabase=createClient();const channel=supabase.channel(`opiope-room-${roomId}`).on("postgres_changes",{event:"*",schema:"public",table:"live_quiz_rooms",filter:`id=eq.${roomId}`},()=>void refresh(roomId)).on("postgres_changes",{event:"*",schema:"public",table:"live_quiz_players",filter:`room_id=eq.${roomId}`},()=>void refresh(roomId)).subscribe();return()=>{void supabase.removeChannel(channel)}},[roomId,refresh])
  useEffect(()=>{if(state.room?.status!=="active")return;const id=window.setInterval(()=>setClock(Date.now()),250);return()=>window.clearInterval(id)},[state.room?.status])

  async function createRoom(){setBusy(true);setMessage("Creating room…");try{const response=await fetch("/api/arcade/live/create",{method:"POST"});const data=await response.json() as {room?:Room;error?:string};if(!response.ok||!data.room){setMessage(data.error??"Could not create room");return}setRoomId(data.room.id);setState({room:data.room,players:[],isHost:true});setMessage("Room created. Share the PIN.")}finally{setBusy(false)}}
  async function join(event:FormEvent){event.preventDefault();setBusy(true);try{const response=await fetch("/api/arcade/live/join",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin,nickname})});const data=await response.json() as JoinPayload;if(!response.ok||!data.room){setMessage(data.error??"Could not join");return}setRoomId(data.room.id);await refresh(data.room.id);setMessage("Joined. Waiting for the host.")}finally{setBusy(false)}}
  async function hostAction(action:"start"|"next"|"finish"){if(!roomId)return;setBusy(true);try{const response=await fetch("/api/arcade/live/action",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({roomId,action})});const data=await response.json() as {error?:string};if(!response.ok)setMessage(data.error??"Action failed");else{setAnswerState({});await refresh(roomId)}}finally{setBusy(false)}}
  async function answer(optionIndex:number){if(!roomId||!state.room)return;setAnswerState({index:optionIndex,message:"Submitting…"});const response=await fetch("/api/arcade/live/answer",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({roomId,questionIndex:state.room.current_question_index,optionIndex})});const data=await response.json() as {error?:string;isCorrect?:boolean;points?:number;explanation?:string};setAnswerState({index:optionIndex,message:response.ok?`${data.isCorrect?"Correct":"Not this time"} · +${data.points??0} · ${data.explanation??""}`:data.error??"Answer failed"});await refresh(roomId)}

  const question=getQuestion(state.room)
  const secondsLeft=useMemo(()=>{const room=state.room;if(!room?.question_started_at)return room?.time_per_question_seconds??20;const end=new Date(room.question_started_at).getTime()+room.time_per_question_seconds*1000;return Math.max(0,Math.ceil((end-clock)/1000))},[state.room,clock])

  if(!isSupabaseConfigured())return <section className="module-panel"><h2>Reaaliaikainen tietovisa tarvitsee Supabasen</h2><p>Määritä Supabase, suorita tietokantamigraatiot ja lisää vain palvelimella käytettävä service-role-avain ennen reaaliaikaisten huoneiden luomista. OpiOpe ei simuloi tekaistua moninpeliä.</p></section>
  if(!roomId)return <section className="live-lobby-start"><div className="live-create"><h2>Host</h2><p>Create a server-backed room with a shareable PIN.</p><button className="primary-action" disabled={busy} onClick={()=>void createRoom()}>Create live room</button></div><form onSubmit={join}><h2>Join</h2><label>Game PIN<input inputMode="numeric" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))}/></label><label>Nickname<input maxLength={24} value={nickname} onChange={e=>setNickname(e.target.value)}/></label><button className="primary-action" disabled={busy}>Join room</button></form><p className="module-notice">{message}</p></section>

  const room=state.room
  return <section className="live-room"><header><div><p className="eyebrow">LIVE ROOM</p><h2>PIN {room?.game_pin??"…"}</h2><p>{room?.status??"loading"} · {state.players?.length??0} players</p></div>{room?.status==="active"&&<strong className="quiz-timer">{secondsLeft}s</strong>}</header><div className="live-scoreboard">{(state.players??[]).map((player,index)=><div key={player.id}><span>{index+1}</span><strong>{player.nickname}</strong><b>{player.score}</b></div>)}</div>{room?.status==="waiting"&&<div className="live-waiting"><p>Waiting for players. Share PIN <strong>{room.game_pin}</strong>.</p>{state.isHost&&<button className="primary-action" disabled={busy} onClick={()=>void hostAction("start")}>Start quiz</button>}</div>}{room?.status==="active"&&question&&<div className="live-question"><small>Question {room.current_question_index+1}/{room.questions.length}</small><h3>{question.questionText}</h3>{state.isHost?<div className="host-question-note"><p>Players are answering now.</p><button onClick={()=>void hostAction("next")}>Next question</button><button onClick={()=>void hostAction("finish")}>Finish</button></div>:<div className="live-options">{question.options.map((option,index)=><button key={option} disabled={answerState.index!==undefined||secondsLeft===0} onClick={()=>void answer(index)}>{option}</button>)}</div>}{answerState.message&&<p className="live-answer-feedback">{answerState.message}</p>}</div>}{room?.status==="finished"&&<div className="live-finished"><h3>Game complete</h3><p>The scoreboard above is server-authoritative for this live session.</p></div>}<p className="module-notice">{message}</p></section>
}

