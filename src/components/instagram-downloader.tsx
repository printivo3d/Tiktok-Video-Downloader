'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Download, Link, Loader2, Video, MonitorPlay, FileVideo } from 'lucide-react'
import { ErrorHandler } from '@/lib/error-handler'
import { ErrorDisplay } from '@/components/error-display'
import { UrlDetector } from '@/components/url-detector'
import { downloadHistory } from '@/lib/download-history'

interface InstagramData {
  title?: string
  video?: string
  videoFormats?: {
    quality: string
    url: string
    format: string
    size?: string
  }[]
  author?: string
  thumbnail?: string
  type?: 'reel' | 'post' | 'story'
  error?: string
}

interface InstagramDownloaderProps {
  value?: string
  onValueChange?: (value: string) => void
}

export function InstagramDownloader({ value, onValueChange }: InstagramDownloaderProps) {
  const [url, setUrl] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<InstagramData | null>(null)
  const [selectedQuality, setSelectedQuality] = useState('')
  const [error, setError] = useState<any>(null)

  const handleUrlDetected = (detectedUrl: string) => {
    setUrl(detectedUrl)
    handleDownload()
  }

  const handleDownload = async () => {
    if (!url.trim()) {
      ErrorHandler.showErrorToast('INVALID_URL', 'Bitte geben Sie eine Instagram-URL ein')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)
    
    try {
      const response = await fetch('/api/instagram-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()
      
      if (result.error) {
        setError(result)
        ErrorHandler.showErrorToast(result)
      } else {
        setData({
          title: result.title,
          video: result.video,
          videoFormats: result.videoFormats,
          author: result.author,
          type: result.type,
          error: result.error
        })
        
        // Setze die beste Qualität als Standard
        if (result.videoFormats && result.videoFormats.length > 0) {
          const bestQuality = result.videoFormats.find(f => f.quality.includes('HD')) || result.videoFormats[0]
          setSelectedQuality(bestQuality.quality)
        }
        
        ErrorHandler.showSuccessToast('Instagram-Inhalt erfolgreich geladen!')
      }
    } catch (error) {
      setError(error)
      ErrorHandler.showErrorToast(error)
      console.error('Download error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadVideo = async () => {
    if (!data?.video && !data?.videoFormats) return

    try {
      let videoUrl = data.video
      
      // Verwende die ausgewählte Qualität
      if (data.videoFormats && selectedQuality) {
        const selectedFormat = data.videoFormats.find(f => f.quality === selectedQuality)
        if (selectedFormat) {
          videoUrl = selectedFormat.url
        }
      }

      if (!videoUrl) {
        ErrorHandler.showErrorToast('Keine Video-URL verfügbar')
        return
      }

      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Dateiname basierend auf dem Typ
      const typeSuffix = data.type === 'reel' ? 'reel' : data.type === 'story' ? 'story' : 'video'
      const qualitySuffix = selectedQuality ? `-${selectedQuality}` : ''
      a.download = `instagram-${typeSuffix}${qualitySuffix}-${Date.now()}.mp4`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Zum Verlauf hinzufügen
      downloadHistory.addToHistory({
        url: url,
        title: data.title,
        type: 'video',
        author: data.author,
        quality: selectedQuality
      })
      
      ErrorHandler.showSuccessToast('Video erfolgreich heruntergeladen!', 'Die Datei wurde in Ihren Downloads gespeichert.')
    } catch (error) {
      ErrorHandler.showErrorToast(error, 'Fehler beim Herunterladen des Videos')
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'reel':
        return '🎬'
      case 'story':
        return '📱'
      case 'post':
        return '📷'
      default:
        return '🎥'
    }
  }

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'reel':
        return 'Reel'
      case 'story':
        return 'Story'
      case 'post':
        return 'Post'
      default:
        return 'Video'
    }
  }

  return (
    <TabsContent value="instagram" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            Instagram Downloader
          </CardTitle>
          <CardDescription>
            Laden Sie Instagram Reels, Posts und Stories herunter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UrlDetector
            onUrlDetected={handleUrlDetected}
            onUrlChange={(newUrl) => {
              setUrl(newUrl)
              onValueChange?.(newUrl)
            }}
            currentUrl={url}
            placeholder="https://www.instagram.com/reel/..."
          />
          
          <div className="flex gap-4 mt-4">
            <Button 
              onClick={handleDownload} 
              disabled={loading || !url.trim()}
              className="min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Herunterladen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <ErrorDisplay 
              error={error} 
              onRetry={handleDownload}
              showHelp={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {data && !error && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(data.type)} {getTypeLabel(data.type)}-Details
                </CardTitle>
                {data.title && (
                  <CardDescription className="line-clamp-2">{data.title}</CardDescription>
                )}
              </div>
              {data.type && (
                <div className="text-sm text-gray-500">
                  {getTypeLabel(data.type)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {data.error}
              </div>
            )}
            
            {data.video && (
              <div className="space-y-4">
                {/* Qualitätsauswahl */}
                {data.videoFormats && data.videoFormats.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MonitorPlay className="w-4 h-4" />
                      Video-Qualität auswählen
                    </label>
                    <select 
                      value={selectedQuality} 
                      onChange={(e) => setSelectedQuality(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {data.videoFormats.map((format, index) => (
                        <option key={index} value={format.quality}>
                          {format.quality} {format.format && `(${format.format})`}
                          {format.size && ` • ${format.size}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border bg-black">
                    <video
                      src={data.video}
                      controls
                      className="w-full max-h-96 object-contain"
                      preload="metadata"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Button
                      onClick={downloadVideo}
                      className="flex-1 sm:flex-none"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {getTypeLabel(data.type)} herunterladen
                      {selectedQuality && (
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                          {selectedQuality}
                        </span>
                      )}
                    </Button>
                    
                    {data.author && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Von: @{data.author}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Example */}
      {!data && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Beispiele</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Unterstützte URL-Formate:</p>
              <div className="space-y-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <div>https://www.instagram.com/reel/...</div>
                <div>https://www.instagram.com/p/...</div>
                <div>https://www.instagram.com/stories/...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}