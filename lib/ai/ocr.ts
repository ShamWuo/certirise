import { ImageAnnotatorClient } from '@google-cloud/vision'

// Initialize Google Cloud Vision client
let visionClient: ImageAnnotatorClient | null = null

function getVisionClient(): ImageAnnotatorClient {
  if (!visionClient) {
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('Google Cloud Vision not configured')
    }
    visionClient = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    })
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

