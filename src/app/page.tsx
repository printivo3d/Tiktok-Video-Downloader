'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { TikTokVideoDownloader } from '@/components/tiktok-video-downloader'
import { TikTokPhotoDownloader } from '@/components/tiktok-photo-downloader'
import { InstagramDownloader } from '@/components/instagram-downloader'
import { BatchDownloader } from '@/components/batch-downloader'
import { DownloadHistoryItem } from '@/lib/download-history'

export default function Home() {
  const [sharedUrl, setSharedUrl] = useState('')

  const handleHistoryItemClick = (item: DownloadHistoryItem) => {
    setSharedUrl(item.url)
    // Wechsel zum entsprechenden Tab basierend auf dem Typ
    const tabValue = item.type === 'video' ? 'videos' : item.type === 'photo' ? 'photos' : 'instagram'
    const tabElement = document.querySelector(`[value="${tabValue}"]`) as HTMLElement
    if (tabElement) {
      tabElement.click()
    }
  }

  return (
    <Navigation onHistoryItemClick={handleHistoryItemClick}>
      <TikTokVideoDownloader 
        value={sharedUrl}
        onValueChange={setSharedUrl}
      />
      <TikTokPhotoDownloader 
        value={sharedUrl}
        onValueChange={setSharedUrl}
      />
      <InstagramDownloader 
        value={sharedUrl}
        onValueChange={setSharedUrl}
      />
      <BatchDownloader />
    </Navigation>
  )
}