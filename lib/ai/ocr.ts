import { ImageAnnotatorClient } from '@google-cloud/vision'

// Initialize Google Cloud Vision client
let visionClient: ImageAnnotatorClient | null = null
let cachedServiceAccount: Record<string, string> | null = null
let hasLoadedServiceAccount = false

function getServiceAccountCredentials(): Record<string, string> | null {
  if (hasLoadedServiceAccount) {
    return cachedServiceAccount
  }
  hasLoadedServiceAccount = true

  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!raw) {
    return cachedServiceAccount
  }

  const decoded =
    raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')

  try {
    cachedServiceAccount = JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON', error)
    throw new Error(
      'Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON. Provide valid JSON or base64-encoded JSON.'
    )
  }

  return cachedServiceAccount
}

function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('Google Cloud Vision not configured')
    }

    const serviceAccount = getServiceAccountCredentials()
    if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error(
        'Google Cloud Vision credentials not configured. Provide either GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS.'
      )
    }

    const clientOptions: ConstructorParameters<typeof ImageAnnotatorClient>[0] = {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    }

    if (serviceAccount) {
      clientOptions.credentials = serviceAccount
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      clientOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS
    }

    visionClient = new ImageAnnotatorClient(clientOptions)
  }
  return visionClient
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    // Check if Google Cloud Vision is configured
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('Google Cloud Vision not configured. Please set GOOGLE_CLOUD_PROJECT_ID')
    }

    const client = getVisionClient()
    const [result] = await client.textDetection({
      image: { content: imageBuffer },
    })
    
    const detections = result.textAnnotations
    if (!detections || detections.length === 0) {
      throw new Error('No text detected in image')
    }
    
    // First annotation contains all text
    return detections[0].description || ''
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error('Failed to extract text from image')
  }
}

// Fallback OCR using Tesseract (for development/testing)
export async function extractTextFallback(imageBuffer: Buffer): Promise<string> {
  // This would use Tesseract.js if Google Cloud Vision is not available
  // For now, return empty string - implement Tesseract if needed
  throw new Error('Fallback OCR not implemented. Please use Google Cloud Vision.')
}
