import { createClient } from './server'

export async function uploadDocument(file: File, businessId: string, itemId: string): Promise<string> {
  const supabase = createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${businessId}/${itemId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('compliance-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload document: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('compliance-documents')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export async function deleteDocument(fileUrl: string) {
  const supabase = createClient()
  
  // Extract file path from URL
  const url = new URL(fileUrl)
  const pathParts = url.pathname.split('/')
  const fileName = pathParts.slice(pathParts.indexOf('compliance-documents') + 1).join('/')
  
  const { error } = await supabase.storage
    .from('compliance-documents')
    .remove([fileName])

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}


