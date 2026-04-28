import { supabase } from '@/lib/supabase'

const BUCKET = 'property-images'
const PUBLIC_BASE = 'https://qbawpfnrajdbntmpcksy.supabase.co/storage/v1/object/public/' + BUCKET

export async function uploadPropertyImage(file: File, agentId: string, propertySlug: string): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${agentId}/${propertySlug}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  return `${PUBLIC_BASE}/${path}`
}

export async function deletePropertyImage(publicUrl: string): Promise<void> {
  const path = publicUrl.replace(`${PUBLIC_BASE}/`, '')
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export function propertyImageUrl(path: string): string {
  return `${PUBLIC_BASE}/${path}`
}
