import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExtractedLicenseData {
  licenseType: string | null
  licenseNumber: string | null
  expirationDate: string | null
  issuingAuthority: string | null
  confidence: number
}

export async function extractLicenseDataFromText(text: string): Promise<ExtractedLicenseData> {
  try {
    const prompt = `Extract license information from the following text. Return ONLY a JSON object with these exact fields:
{
  "licenseType": "type of license (e.g., 'Cosmetology License', 'Business Insurance') or null if not found",
  "licenseNumber": "license number or null if not found",
  "expirationDate": "expiration date in YYYY-MM-DD format or null if not found. Be very careful with date formats - look for words like 'expires', 'expiration', 'valid until', 'renew by'",
  "issuingAuthority": "issuing authority (e.g., 'California Board of Barbering and Cosmetology') or null if not found",
  "confidence": "number between 0 and 1 indicating confidence in the extraction"
}

Text to analyze:
${text}

Important: 
- Dates can be in various formats (MM/DD/YYYY, DD/MM/YYYY, Month DD, YYYY, etc.)
- Extract expiration dates, not issue dates
- If multiple dates exist, prefer the expiration date
- Return null for any field that cannot be determined with reasonable certainty`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise data extraction assistant. Extract only the requested information and return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const extracted = JSON.parse(content) as ExtractedLicenseData

    // Validate date format
    if (extracted.expirationDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(extracted.expirationDate)) {
        // Try to parse and reformat the date
        const parsed = new Date(extracted.expirationDate)
        if (!isNaN(parsed.getTime())) {
          extracted.expirationDate = parsed.toISOString().split('T')[0]
        } else {
          extracted.expirationDate = null
          extracted.confidence = Math.max(0, extracted.confidence - 0.3)
        }
      }
    }

    return extracted
  } catch (error) {
    console.error('Date extraction error:', error)
    throw new Error('Failed to extract license data from text')
  }
}

export async function extractComplianceDataFromText(text: string): Promise<ExtractedLicenseData> {
  // This is a more general version that can handle various compliance documents
  return extractLicenseDataFromText(text)
}


