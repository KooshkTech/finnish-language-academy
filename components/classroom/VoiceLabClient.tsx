"use client"
import { useRef, useState } from "react"
import { Blackboard } from "./Blackboard"

export function VoiceLabClient() {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>()
  const [transcript, setTranscript] = useState("")
  const [message, setMessage] = useState("Valitse mikrofoni ja vastaa: Mitä sinä söit aamupalaksi?")
  const [speed, setSpeed] = useState<0.5|0.75|1>(1)

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      const recorder = new MediaRecorder(stream)
      chunks.current=[]; recorder.ondataavailable=e=>chunks.current.push(e.data)
      recorder.onstop=()=>{ const blob=new Blob(chunks.current,{type:recorder.mimeType||"audio/webm"}); if(audioUrl)URL.revokeObjectURL(audioUrl); setAudioUrl(URL.createObjectURL(blob)); stream.getTracks().forEach(track=>track.stop()); void transcribe(blob) }
      mediaRecorder.current=recorder; recorder.start(); setRecording(true); setMessage("Nauhoitetaan…")
    } catch { setMessage("Mikrofonin käyttö estettiin tai laitetta ei löytynyt.") }
  }
  function stop(){ mediaRecorder.current?.stop(); setRecording(false); setMessage("Käsitellään puhetta…") }
  async function transcribe(blob:Blob){
    const form=new FormData(); form.append("audio",blob,"answer.webm"); form.append("language","fi")
    try{ const response=await fetch("/api/voice/transcribe",{method:"POST",body:form}); const data=await response.json() as {text?:string;error?:string;pronunciationStatus?:string}; if(!response.ok){setMessage(data.error??"Transkriptio ei ole käytettävissä.");return} setTranscript(data.text??""); setMessage(data.pronunciationStatus??"Transkriptio valmis. Ääntämispisteitä ei keksitä ilman fonetiikkaprovideria.") }catch{setMessage("Puhepalveluun ei saatu yhteyttä.")}
  }

  function downloadTranscript(){
    if(!transcript)return
    const blob=new Blob([`OpiOpe Äänilaboratorio\n\n${transcript}`],{type:"text/plain;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="opiope-puhe-transkriptio.txt"; a.click(); URL.revokeObjectURL(url)
  }
  function speak(){ if(!("speechSynthesis" in window)){setMessage("Selaimen puhesynteesi ei ole käytettävissä.");return} const utterance=new SpeechSynthesisUtterance("Mitä sinä söit aamupalaksi?"); utterance.lang="fi-FI"; utterance.rate=speed; speechSynthesis.speak(utterance) }

  return <div className="voice-lab-grid"><section className="voice-control-panel"><p className="eyebrow">ÄÄNILABORATORIO · SUOMI</p><h1>Puhu. Kuuntele. Korjaa.</h1><p>{message}</p><div className="voice-prompt"><strong>Mitä sinä söit aamupalaksi?</strong><button type="button" onClick={speak}>▶ Kuuntele</button></div><div className="speed-control"><span>Nopeus</span>{([0.5,0.75,1] as const).map(value=><button key={value} type="button" aria-pressed={speed===value} onClick={()=>setSpeed(value)}>{value}×</button>)}</div><div className="voice-record-actions">{!recording?<button type="button" onClick={start}>● Aloita nauhoitus</button>:<button type="button" onClick={stop}>■ Lopeta</button>}{audioUrl&&<audio controls src={audioUrl}/>}</div>{transcript&&<div className="transcript-result"><small>TRANSKRIPTIO</small><p>{transcript}</p><button type="button" onClick={downloadTranscript}>Lataa transkriptio</button></div>}<p className="module-notice">Ääntämisen/pitchin numeerista arvosanaa ei näytetä, ellei palvelin saa oikeaa fonetiikka-analyysiä. Tämä estää keinotekoisen pisteytyksen.</p></section><Blackboard blocks={[{type:"note",title:"Kysymys",body:"Mitä sinä söit aamupalaksi?"},{type:"compare",title:"Rekisteri",leftLabel:"Kirjakieli",left:"Minä söin puuroa.",rightLabel:"Puhekieli",right:"Mä söin puuroo."}]}/></div>
}

