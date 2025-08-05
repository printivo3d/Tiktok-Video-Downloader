export interface DownloadHistoryItem {
  id: string
  url: string
  title?: string
  type: 'video' | 'photo'
  thumbnail?: string
  author?: string
  downloadedAt: string
  quality?: string
  imageCount?: number
}

class DownloadHistory {
  private readonly STORAGE_KEY = 'tiktok-download-history'
  private readonly MAX_ITEMS = 50

  getHistory(): DownloadHistoryItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const history = localStorage.getItem(this.STORAGE_KEY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('Error loading download history:', error)
      return []
    }
  }

  addToHistory(item: Omit<DownloadHistoryItem, 'id' | 'downloadedAt'>): void {
    if (typeof window === 'undefined') return

    try {
      const history = this.getHistory()
      const newItem: DownloadHistoryItem = {
        ...item,
        id: this.generateId(),
        downloadedAt: new Date().toISOString()
      }

      // Remove duplicates
      const filteredHistory = history.filter(h => h.url !== item.url)
      
      // Add new item at the beginning
      const updatedHistory = [newItem, ...filteredHistory].slice(0, this.MAX_ITEMS)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error saving to download history:', error)
    }
  }

  removeFromHistory(id: string): void {
    if (typeof window === 'undefined') return

    try {
      const history = this.getHistory()
      const updatedHistory = history.filter(item => item.id !== id)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error removing from download history:', error)
    }
  }

  clearHistory(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing download history:', error)
    }
  }

  getStats(): {
    totalDownloads: number
    videoDownloads: number
    photoDownloads: number
    recentDownloads: DownloadHistoryItem[]
  } {
    const history = this.getHistory()
    
    return {
      totalDownloads: history.length,
      videoDownloads: history.filter(item => item.type === 'video').length,
      photoDownloads: history.filter(item => item.type === 'photo').length,
      recentDownloads: history.slice(0, 5)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const downloadHistory = new DownloadHistory()