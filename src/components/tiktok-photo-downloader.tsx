'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Download, Link, Loader2, Image } from 'lucide-react'
import { ErrorHandler } from '@/lib/error-handler'
import { ErrorDisplay } from '@/components/error-display'
import { UrlDetector } from '@/components/url-detector'
import { downloadHistory } from '@/lib/download-history'

interface TikTokPhotoData {
  title?: string
  images?: string[]
  author?: string
  error?: string
}

interface TikTokPhotoDownloaderProps {
  value?: string
  onValueChange?: (value: string) => void
}

export function TikTokPhotoDownloader({ value, onValueChange }: TikTokPhotoDownloaderProps) {
  const [url, setUrl] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TikTokPhotoData | null>(null)
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
          images: result.images,
          author: result.author,
          error: result.error
        })
        ErrorHandler.showSuccessToast('TikTok Photo Slideshow erfolgreich geladen!')
      }
    } catch (error) {
      setError(error)
      ErrorHandler.showErrorToast(error)
      console.error('Download error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tiktok-photo-${index + 1}-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Nur beim ersten Bild zum Verlauf hinzufügen
      if (index === 0) {
        downloadHistory.addToHistory({
          url: url,
          title: data.title,
          type: 'photo',
          author: data.author,
          imageCount: data.images?.length
        })
      }
      
      ErrorHandler.showSuccessToast(`Bild ${index + 1} erfolgreich heruntergeladen!`, 'Die Datei wurde in Ihren Downloads gespeichert.')
    } catch (error) {
      ErrorHandler.showErrorToast(error, `Fehler beim Herunterladen von Bild ${index + 1}`)
    }
  }

  const downloadAllImages = async () => {
    if (!data?.images || data.images.length === 0) return

    try {
      for (let i = 0; i < data.images.length; i++) {
        await downloadImage(data.images[i], i)
        // Kleine Verzögerung zwischen den Downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      ErrorHandler.showSuccessToast(`Alle ${data.images.length} Bilder heruntergeladen!`, 'Alle Dateien wurden in Ihren Downloads gespeichert.')
    } catch (error) {
      ErrorHandler.showErrorToast(error, 'Fehler beim Herunterladen aller Bilder')
    }
  }

  return (
    <TabsContent value="photos" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            TikTok Photo Slideshow herunterladen
          </CardTitle>
          <CardDescription>
            Fügen Sie die URL der TikTok Photo Slideshow ein, die Sie herunterladen möchten
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

      {/* Photo Results */}
      {data && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Photo Slideshow</CardTitle>
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
            
            {data.images && data.images.length > 0 && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {data.images.length} Bild{data.images.length !== 1 ? 'er' : ''}
                  </h3>
                  <Button
                    onClick={downloadAllImages}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Alle herunterladen
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.images.map((imageUrl, index) => (
                    <div key={index} className="space-y-3">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800">
                        <img
                          src={imageUrl}
                          alt={`TikTok Bild ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      <Button
                        onClick={() => downloadImage(imageUrl, index)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Bild {index + 1}
                      </Button>
                    </div>
                  ))}
                </div>

                {data.author && (
                  <div className="pt-4 border-t text-sm text-gray-600 dark:text-gray-400 text-center">
                    Von: @{data.author}
                  </div>
                )}
              </div>
            )}
            
            {data.images && data.images.length === 0 && !data.error && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                Diese TikTok enthält keine Photo Slideshow. Versuchen Sie es im Video-Tab.
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