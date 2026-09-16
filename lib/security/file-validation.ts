import { randomUUID } from 'node:crypto'

export const teacherAllowedMimeTypes = new Set([
  'text/plain', 'text/markdown', 'application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/x-wav'
])
export const teacherUploadMaxBytes = 15 * 1024 * 1024

export function extensionFor(type: string) {
  return ({
    'text/plain':'txt','text/markdown':'md','application/pdf':'pdf','image/png':'png','image/jpeg':'jpg','image/webp':'webp','audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav'
  } as Record<string,string>)[type] ?? 'bin'
}

function bytesStart(bytes:Uint8Array, values:number[]){return values.every((v,i)=>bytes[i]===v)}
function ascii(bytes:Uint8Array,start:number,length:number){return String.fromCharCode(...bytes.slice(start,start+length))}
export function signatureMatches(type:string,bytes:Uint8Array){
  if(type==='text/plain'||type==='text/markdown') return !bytesStart(bytes,[0x4d,0x5a])
  if(type==='application/pdf') return ascii(bytes,0,5)==='%PDF-'
  if(type==='image/png') return bytesStart(bytes,[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])
  if(type==='image/jpeg') return bytesStart(bytes,[0xff,0xd8,0xff])
  if(type==='image/webp') return ascii(bytes,0,4)==='RIFF' && ascii(bytes,8,4)==='WEBP'
  if(type==='audio/wav'||type==='audio/x-wav') return ascii(bytes,0,4)==='RIFF' && ascii(bytes,8,4)==='WAVE'
  if(type==='audio/mpeg') return ascii(bytes,0,3)==='ID3' || (bytes[0]===0xff && (bytes[1]&0xe0)===0xe0)
  return false
}

export function safeObjectName(userId:string,type:string){ return `${userId}/${randomUUID()}.${extensionFor(type)}` }

