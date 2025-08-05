'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Video, Image, Link, History, Moon, Sun, User } from 'lucide-react'
import { DownloadHistoryComponent } from '@/components/download-history'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth'
import { AuthModal } from '@/components/auth-modal'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavigationProps {
  children: React.ReactNode
  onHistoryItemClick?: (item: any) => void
}

export function Navigation({ children, onHistoryItemClick }: NavigationProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleAuthClick = () => {
    if (user) {
      // User is logged in, show user menu
      return
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src="/logo.svg"
              alt="Z.ai Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                TikTok Downloader
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Laden Sie TikTok Videos und Photo Slideshows herunter
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar || ''} />
                        <AvatarFallback>
                          {user.name?.[0] || user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">
                        {user.name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Meine Downloads
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Playlists
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthClick}
                  disabled={loading}
                >
                  <User className="w-4 h-4 mr-2" />
                  Anmelden
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Instagram
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Batch
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Verlauf
            </TabsTrigger>
          </TabsList>
          
          {children}
          
          {/* Batch Tab */}
          <TabsContent value="batch">
            {/* This will be rendered by the BatchDownloader component */}
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            <DownloadHistoryComponent onHistoryItemClick={onHistoryItemClick} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}