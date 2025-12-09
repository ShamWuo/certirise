import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromImage } from '@/lib/ai/ocr'
import { extractLicenseDataFromText } from '@/lib/ai/date-extraction'
import { fileUploadSchema } from '@/lib/validation/schemas'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const identifier = user?.id || request.ip || 'anonymous'
    
    const limit = await rateLimit(identifier, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute
    })

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': limit.resetTime.toString(),
          }
        }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be an image (JPEG, PNG) or PDF' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text using OCR
    const extractedText = await extractTextFromImage(buffer)

    // Extract structured data using AI
    const extractedData = await extractLicenseDataFromText(extractedText)

    return NextResponse.json({
      success: true,
      extractedText,
      data: extractedData,
    })
  } catch (error: any) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract data from image' },
      { status: 500 }
    )
  }
}


