'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Download, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileVideo,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react'
import { ErrorHandler } from '@/lib/error-handler'
import { downloadHistory } from '@/lib/download-history'

interface BatchItem {
  id: string
  url: string
  type: 'tiktok' | 'instagram'
  status: 'pending' | 'downloading' | 'completed' | 'error'
  title?: string
  author?: string
  error?: string
  progress?: number
  downloadedAt?: string
}

interface BatchDownloaderProps {
  onDownloadComplete?: (items: BatchItem[]) => void
}

export function BatchDownloader({ onDownloadComplete }: BatchDownloaderProps) {
  const [items, setItems] = useState<BatchItem[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  const addUrl = (url: string) => {
    if (!url.trim()) return

    // Check if URL already exists
    if (items.some(item => item.url === url)) {
      ErrorHandler.showWarningToast('URL bereits hinzugefügt', 'Diese URL befindet sich bereits in der Download-Liste.')
      return
    }

    // Determine type
    const type = url.includes('tiktok.com') ? 'tiktok' : 'instagram'

    const newItem: BatchItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      url: url.trim(),
      type,
      status: 'pending'
    }

    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearAll = () => {
    if (items.length === 0) return
    if (confirm('Möchten Sie wirklich alle URLs aus der Liste entfernen?')) {
      setItems([])
    }
  }

  const downloadSingleItem = async (item: BatchItem): Promise<BatchItem> => {
    try {
      const apiEndpoint = item.type === 'tiktok' ? '/api/tiktok-download' : '/api/instagram-download'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: item.url }),
      })

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Simulate download progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setItems(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, status: 'downloading' as const, progress }
            : i
        ))
      }

      // Add to download history
      downloadHistory.addToHistory({
        url: item.url,
        title: result.title,
        type: 'video',
        author: result.author
      })

      return {
        ...item,
        status: 'completed' as const,
        title: result.title,
        author: result.author,
        downloadedAt: new Date().toISOString()
      }
    } catch (error) {
      return {
        ...item,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const startBatchDownload = async () => {
    if (items.length === 0) {
      ErrorHandler.showWarningToast('Keine URLs hinzugefügt', 'Bitte fügen Sie mindestens eine URL hinzu.')
      return
    }

    const pendingItems = items.filter(item => item.status === 'pending')
    if (pendingItems.length === 0) {
      ErrorHandler.showInfoToast('Alle Downloads abgeschlossen', 'Alle URLs wurden bereits heruntergeladen.')
      return
    }

    setIsDownloading(true)
    setCurrentItemIndex(0)

    try {
      const updatedItems = [...items]
      
      for (let i = 0; i < updatedItems.length; i++) {
        if (updatedItems[i].status === 'pending') {
          setCurrentItemIndex(i)
          
          // Update status to downloading
          updatedItems[i] = { ...updatedItems[i], status: 'downloading' }
          setItems([...updatedItems])
          
          // Download the item
          const downloadedItem = await downloadSingleItem(updatedItems[i])
          updatedItems[i] = downloadedItem
          setItems([...updatedItems])
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      ErrorHandler.showSuccessToast('Batch-Download abgeschlossen!', `${pendingItems.length} Dateien erfolgreich heruntergeladen.`)
      onDownloadComplete?.(updatedItems)
      
    } catch (error) {
      ErrorHandler.showErrorToast(error, 'Fehler beim Batch-Download')
    } finally {
      setIsDownloading(false)
      setCurrentItemIndex(0)
    }
  }

  const getStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />
      case 'downloading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusText = (status: BatchItem['status']) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend'
      case 'downloading':
        return 'Lädt herunter...'
      case 'completed':
        return 'Abgeschlossen'
      case 'error':
        return 'Fehler'
    }
  }

  const getStats = () => {
    const total = items.length
    const completed = items.filter(item => item.status === 'completed').length
    const error = items.filter(item => item.status === 'error').length
    const pending = items.filter(item => item.status === 'pending').length
    const downloading = items.filter(item => item.status === 'downloading').length

    return { total, completed, error, pending, downloading }
  }

  const stats = getStats()

  return (
    <TabsContent value="batch" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Batch-Downloader
          </CardTitle>
          <CardDescription>
            Fügen Sie mehrere TikTok- und Instagram-URLs hinzu und laden Sie sie alle auf einmal herunter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="TikTok oder Instagram URL einfügen..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addUrl((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ''
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={() => {
                const input = document.querySelector('input[placeholder*="URL einfügen"]') as HTMLInputElement
                if (input) {
                  addUrl(input.value)
                  input.value = ''
                }
              }}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <div className="text-lg font-bold">{stats.total}</div>
              <div className="text-xs">Gesamt</div>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.pending}</div>
              <div className="text-xs">Ausstehend</div>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.downloading}</div>
              <div className="text-xs">Lädt</div>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.completed}</div>
              <div className="text-xs">Fertig</div>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.error}</div>
              <div className="text-xs">Fehler</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={startBatchDownload}
              disabled={isDownloading || stats.pending === 0}
              className="flex-1"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Lädt ({currentItemIndex + 1}/{items.length})
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Alle herunterladen ({stats.pending})
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={clearAll}
              disabled={isDownloading || items.length === 0}
            >
              <X className="w-4 h-4 mr-2" />
              Leeren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* URL List */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Download-Liste ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg ${
                      item.status === 'downloading' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' :
                      item.status === 'completed' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
                      item.status === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
                      'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(item.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'tiktok' ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs">🎵</span>
                                TikTok
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-xs">📷</span>
                                Instagram
                              </div>
                            )}
                          </Badge>
                          <Badge variant={
                            item.status === 'completed' ? 'default' :
                            item.status === 'error' ? 'destructive' :
                            item.status === 'downloading' ? 'secondary' :
                            'outline'
                          } className="text-xs">
                            {getStatusText(item.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm font-medium truncate mb-1">
                          {item.title || 'Laden...'}
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                          {item.url}
                        </div>

                        {/* Progress Bar */}
                        {item.status === 'downloading' && item.progress !== undefined && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}

                        {/* Error Message */}
                        {item.status === 'error' && item.error && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {item.error}
                          </div>
                        )}

                        {/* Author and Download Time */}
                        {(item.author || item.downloadedAt) && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.author && <span>@{item.author}</span>}
                            {item.downloadedAt && (
                              <span>• {new Date(item.downloadedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={isDownloading && item.status === 'downloading'}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Download className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Keine URLs hinzugefügt</h3>
            <p className="text-gray-500 mb-4">
              Fügen Sie TikTok- oder Instagram-URLs hinzu, um mit dem Batch-Download zu beginnen.
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Drücken Sie Enter nach dem Einfügen einer URL</p>
              <p>• Oder klicken Sie auf das + Symbol</p>
              <p>• Unterstützt werden TikTok und Instagram URLs</p>
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  )
}