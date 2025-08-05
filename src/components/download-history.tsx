'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  History, 
  Trash2, 
  Video, 
  Image as ImageIcon, 
  Clock, 
  User,
  ExternalLink,
  Download
} from 'lucide-react'
import { DownloadHistoryItem, downloadHistory } from '@/lib/download-history'
import { toast } from 'sonner'

interface DownloadHistoryProps {
  onHistoryItemClick?: (item: DownloadHistoryItem) => void
}

export function DownloadHistoryComponent({ onHistoryItemClick }: DownloadHistoryProps) {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([])
  const [stats, setStats] = useState({
    totalDownloads: 0,
    videoDownloads: 0,
    photoDownloads: 0,
    recentDownloads: [] as DownloadHistoryItem[]
  })

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const historyData = downloadHistory.getHistory()
    const statsData = downloadHistory.getStats()
    setHistory(historyData)
    setStats(statsData)
  }

  const removeFromHistory = (id: string) => {
    downloadHistory.removeFromHistory(id)
    loadHistory()
    toast.success('Aus Verlauf entfernt')
  }

  const clearAllHistory = () => {
    if (confirm('Möchten Sie wirklich den gesamten Verlauf löschen?')) {
      downloadHistory.clearHistory()
      loadHistory()
      toast.success('Verlauf gelöscht')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Vor weniger als einer Stunde'
    if (diffInHours < 24) return `Vor ${diffInHours} Stunde${diffInHours > 1 ? 'n' : ''}`
    if (diffInHours < 48) return 'Gestern'
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleItemClick = (item: DownloadHistoryItem) => {
    onHistoryItemClick?.(item)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <CardTitle>Download-Verlauf</CardTitle>
          </div>
          {history.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllHistory}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Alle löschen
            </Button>
          )}
        </div>
        <CardDescription>
          Ihre zuletzt heruntergeladenen TikTok-Inhalte
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalDownloads}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gesamt</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.videoDownloads}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.photoDownloads}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Photos</div>
          </div>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Downloads im Verlauf</p>
            <p className="text-sm">Heruntergeladene Inhalte werden hier angezeigt</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => handleItemClick(item)}
                >
                  {/* Thumbnail */}
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      {item.type === 'video' ? (
                        <Video className="w-6 h-6 text-gray-400" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {item.title || 'Kein Titel'}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.downloadedAt)}</span>
                          {item.author && (
                            <>
                              <User className="w-3 h-3 ml-2" />
                              <span>@{item.author}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant={item.type === 'video' ? 'default' : 'secondary'} className="text-xs">
                          {item.type === 'video' ? (
                            <Video className="w-3 h-3 mr-1" />
                          ) : (
                            <ImageIcon className="w-3 h-3 mr-1" />
                          )}
                          {item.type === 'video' ? 'Video' : 'Photos'}
                        </Badge>
                        {item.quality && (
                          <Badge variant="outline" className="text-xs">
                            {item.quality}
                          </Badge>
                        )}
                        {item.imageCount && (
                          <Badge variant="outline" className="text-xs">
                            {item.imageCount} Bilder
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.url, '_blank')
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromHistory(item.id)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}