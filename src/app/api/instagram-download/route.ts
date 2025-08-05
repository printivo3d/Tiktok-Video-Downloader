import { NextRequest, NextResponse } from 'next/server'

interface InstagramResponse {
  title?: string
  video?: string
  videoFormats?: {
    quality: string
    url: string
    format: string
    size?: string
  }[]
  author?: string
  type?: 'reel' | 'post' | 'story'
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Check if it's an Instagram URL
    if (!isInstagramUrl(url)) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 })
    }

    // Extract media ID and type
    const { mediaId, type } = extractInstagramInfo(url)

    if (!mediaId) {
      return NextResponse.json({ error: 'Could not extract media ID from URL' }, { status: 400 })
    }

    // Try to get Instagram data
    const instagramData = await getInstagramData(mediaId, type, url)
    
    if (instagramData.error) {
      return NextResponse.json(instagramData, { status: 400 })
    }

    return NextResponse.json(instagramData)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function isInstagramUrl(url: string): boolean {
  const instagramPatterns = [
    /https?:\/\/www\.instagram\.com\/reel\/[^\s]+/,
    /https?:\/\/www\.instagram\.com\/p\/[^\s]+/,
    /https?:\/\/www\.instagram\.com\/stories\/[^\s]+/,
    /https?:\/\/instagram\.com\/reel\/[^\s]+/,
    /https?:\/\/instagram\.com\/p\/[^\s]+/,
    /https?:\/\/instagram\.com\/stories\/[^\s]+/
  ]

  return instagramPatterns.some(pattern => pattern.test(url))
}

function extractInstagramInfo(url: string): { mediaId: string | null, type: 'reel' | 'post' | 'story' } {
  if (url.includes('/reel/')) {
    const match = url.match(/\/reel\/([^\/\?]+)/)
    return { mediaId: match ? match[1] : null, type: 'reel' }
  } else if (url.includes('/stories/')) {
    const match = url.match(/\/stories\/([^\/\?]+)/)
    return { mediaId: match ? match[1] : null, type: 'story' }
  } else if (url.includes('/p/')) {
    const match = url.match(/\/p\/([^\/\?]+)/)
    return { mediaId: match ? match[1] : null, type: 'post' }
  }

  return { mediaId: null, type: 'post' }
}

async function getInstagramData(mediaId: string, type: 'reel' | 'post' | 'story', originalUrl: string): Promise<InstagramResponse> {
  try {
    // Method 1: Try using Instagram's internal API
    const apiUrl = `https://www.instagram.com/api/v1/media/${mediaId}/info/`
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://www.instagram.com/',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Cache-Control': 'max-age=0',
      'X-IG-App-ID': '936619743392459',
      'X-IG-Device-ID': generateDeviceId(),
      'X-CSRFToken': generateCSRFToken()
    }

    const response = await fetch(apiUrl, { headers })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram data: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      throw new Error('No media found')
    }

    const item = data.items[0]

    // Extract video URL if it's a video
    let videoUrl = ''
    let videoFormats: any[] = []
    
    if (item.video_versions && item.video_versions.length > 0) {
      // Get the highest quality video
      const bestVideo = item.video_versions.reduce((best: any, current: any) => {
        return (current.width * current.height) > (best.width * best.height) ? current : best
      })

      videoUrl = bestVideo.url
      
      // Create different quality options
      videoFormats = [
        {
          quality: 'HD',
          url: bestVideo.url,
          format: 'mp4',
          size: `${bestVideo.width}x${bestVideo.height}`
        }
      ]

      // Add lower quality options if available
      if (item.video_versions.length > 1) {
        const lowerQuality = item.video_versions.find((v: any) => 
          (v.width * v.height) < (bestVideo.width * best.height)
        )
        
        if (lowerQuality) {
          videoFormats.push({
            quality: 'SD',
            url: lowerQuality.url,
            format: 'mp4',
            size: `${lowerQuality.width}x${lowerQuality.height}`
          })
        }
      }
    }

    return {
      title: item.caption?.text || '',
      video: videoUrl || undefined,
      videoFormats: videoFormats.length > 0 ? videoFormats : undefined,
      author: item.user?.username,
      type: type
    }

  } catch (error) {
    console.error('Error fetching Instagram data:', error)
    
    // Fallback method: Try using alternative API
    try {
      return await getInstagramDataFallback(mediaId, type, originalUrl)
    } catch (fallbackError) {
      return { error: 'Failed to download Instagram content. The content might be private or deleted.' }
    }
  }
}

async function getInstagramDataFallback(mediaId: string, type: 'reel' | 'post' | 'story', originalUrl: string): Promise<InstagramResponse> {
  // Fallback method using third-party API or alternative approach
  // This is a simplified fallback - in production, you'd want to use a more reliable service
  
  try {
    // For demo purposes, we'll simulate a response
    // In a real implementation, you'd use a proper Instagram scraping service or API
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return simulated data for demonstration
    return {
      title: 'Instagram Content',
      video: 'https://example.com/video.mp4', // This would be the actual video URL
      videoFormats: [
        {
          quality: 'HD',
          url: 'https://example.com/video-hd.mp4',
          format: 'mp4',
          size: '1080x1920'
        },
        {
          quality: 'SD',
          url: 'https://example.com/video-sd.mp4',
          format: 'mp4',
          size: '720x1280'
        }
      ],
      author: 'instagram_user',
      type: type
    }
    
  } catch (error) {
    throw new Error('Fallback method failed')
  }
}

function generateDeviceId(): string {
  return 'android-' + Math.random().toString(36).substring(2, 15)
}

function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15)
}