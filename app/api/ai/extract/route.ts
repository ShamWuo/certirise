import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromImage } from '@/lib/ai/ocr'
import { extractLicenseDataFromText } from '@/lib/ai/date-extraction'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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


