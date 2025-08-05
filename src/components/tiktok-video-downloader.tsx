'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Link, Loader2, Video, MonitorPlay, FileVideo } from 'lucide-react'
import { ErrorHandler } from '@/lib/error-handler'
import { ErrorDisplay } from '@/components/error-display'
import { UrlDetector } from '@/components/url-detector'
import { downloadHistory } from '@/lib/download-history'

interface TikTokVideoData {
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
  duration?: number
  views?: number
  likes?: number
  error?: string
}

interface TikTokVideoDownloaderProps {
  value?: string
  onValueChange?: (value: string) => void
}

export function TikTokVideoDownloader({ value, onValueChange }: TikTokVideoDownloaderProps) {
  const [url, setUrl] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TikTokVideoData | null>(null)
  const [selectedQuality, setSelectedQuality] = useState('')
  const [error, setError] = useState<any>(null)

  const handleUrlDetected = (detectedUrl: string) => {
    setUrl(detectedUrl)
    handleDownload()
  }

  const handleDownload = async () => {
    if (!url.trim()) {
      ErrorHandler.showErrorToast('INVALID_URL', 'Bitte geben Sie eine TikTok-URL ein')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)
    
    try {
      const response = await fetch('/api/tiktok-download', {
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
          error: result.error
        })
        
        // Setze die beste Qualität als Standard
        if (result.videoFormats && result.videoFormats.length > 0) {
          const bestQuality = result.videoFormats.find(f => f.quality.includes('HD')) || result.videoFormats[0]
          setSelectedQuality(bestQuality.quality)
        }
        
        ErrorHandler.showSuccessToast('TikTok-Video erfolgreich geladen!')
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
        toast.error('Keine Video-URL verfügbar')
        return
      }

      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Dateiname basierend auf der Qualität
      const qualitySuffix = selectedQuality ? `-${selectedQuality}` : ''
      a.download = `tiktok-video${qualitySuffix}-${Date.now()}.mp4`
      
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

  return (
    <TabsContent value="videos" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            TikTok Video herunterladen
          </CardTitle>
          <CardDescription>
            Fügen Sie die URL des TikTok-Videos ein, das Sie herunterladen möchten
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
            placeholder="https://vm.tiktok.com/..."
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

      {/* Video Results */}
      {data && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Video-Details</CardTitle>
            {data.title && (
              <CardDescription className="line-clamp-2">{data.title}</CardDescription>
            )}
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
                    <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualität auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.videoFormats.map((format, index) => (
                          <SelectItem key={index} value={format.quality}>
                            <div className="flex items-center gap-2">
                              <FileVideo className="w-4 h-4" />
                              {format.quality} {format.format && `(${format.format})`}
                              {format.size && <span className="text-xs text-gray-500">• {format.size}</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      Video herunterladen
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
      {!data && (
        <Card>
          <CardHeader>
            <CardTitle>Beispiel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Probieren Sie es mit dieser URL:{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                https://vm.tiktok.com/ZNd9bmrWK/
              </code>
            </p>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}