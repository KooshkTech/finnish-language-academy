export type SupportedUploadKind = "pdf" | "image" | "audio"

export interface UploadedLearningAsset {
  id: string
  name: string
  kind: SupportedUploadKind
  mimeType: string
  size: number
  storagePath?: string
  createdAt: string
  processingStatus: "stored" | "processor-not-configured" | "failed"
  processingMessage?: string
}

