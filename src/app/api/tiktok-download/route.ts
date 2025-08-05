import { NextRequest, NextResponse } from 'next/server'

interface TikTokResponse {
  title?: string
  images?: string[]
  video?: string
  videoFormats?: {
    quality: string
    url: string
    format: string
    size?: string
  }[]
  author?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate TikTok URL
    if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
      return NextResponse.json({ error: 'Invalid TikTok URL' }, { status: 400 })
    }

    // For now, return a message that direct downloading is not available
    // This is because TikTok has implemented strict anti-scraping measures
    return NextResponse.json({
      error: 'TikTok direct download is currently unavailable due to API restrictions. Please try using the TikTok app or website directly.',
      title: 'Service Temporarily Unavailable',
      suggestion: 'TikTok has updated their security measures. We are working on a solution.'
    }, { status: 503 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      title: 'Server Error',
      suggestion: 'Please try again later'
    }, { status: 500 })
  }
}

// Note: Previous methods using TikTok's internal APIs no longer work reliably
// due to frequent changes in their anti-scraping measures, CORS policies,
// and authentication requirements. A more robust solution would require:
// 1. Using a headless browser (like Playwright) to render the page
// 2. Implementing proper user-agent rotation
// 3. Using proxy servers to avoid IP blocking
// 4. Or using an official TikTok API with proper authentication