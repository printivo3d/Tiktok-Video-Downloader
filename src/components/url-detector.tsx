'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clipboard, 
  Check, 
  X, 
  AlertCircle, 
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { ErrorHandler } from '@/lib/error-handler'

interface UrlDetectorProps {
  onUrlDetected: (url: string) => void
  onUrlChange: (url: string) => void
  currentUrl: string
  placeholder?: string
}

export function UrlDetector({ onUrlDetected, onUrlChange, currentUrl, placeholder }: UrlDetectorProps) {
  const [clipboardUrl, setClipboardUrl] = useState<string>('')
  const [showClipboardSuggestion, setShowClipboardSuggestion] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Instagram URL patterns
  const instagramPatterns = [
    /https?:\/\/www\.instagram\.com\/reel\/[^\s]+/,
    /https?:\/\/www\.instagram\.com\/p\/[^\s]+/,
    /https?:\/\/www\.instagram\.com\/stories\/[^\s]+/,
    /https?:\/\/instagram\.com\/reel\/[^\s]+/,
    /https?:\/\/instagram\.com\/p\/[^\s]+/,
    /https?:\/\/instagram\.com\/stories\/[^\s]+/
  ]

  // TikTok URL patterns
  const tiktokPatterns = [
    /https?:\/\/vm\.tiktok\.com\/[^\s]+/,
    /https?:\/\/www\.tiktok\.com\/@[^\s]+\/video\/[^\s]+/,
    /https?:\/\/tiktok\.com\/@[^\s]+\/video\/[^\s]+/,
    /https?:\/\/m\.tiktok\.com\/v\/[^\s]+/,
    /https?:\/\/www\.tiktok\.com\/v\/[^\s]+/
  ]

  // Check if URL is a social media URL
  const isSocialMediaUrl = (url: string): boolean => {
    return isTikTokUrl(url) || isInstagramUrl(url)
  }

  // Check if URL is a TikTok URL
  const isTikTokUrl = (url: string): boolean => {
    return tiktokPatterns.some(pattern => pattern.test(url))
  }

  // Check if URL is an Instagram URL
  const isInstagramUrl = (url: string): boolean => {
    return instagramPatterns.some(pattern => pattern.test(url))
  }

  // Extract social media URL from text
  const extractSocialMediaUrl = (text: string): string | null => {
    // Try TikTok first
    for (const pattern of tiktokPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }
    
    // Try Instagram
    for (const pattern of instagramPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }
    
    return null
  }

  // Validate URL
  const validateUrl = async (url: string): Promise<boolean> => {
    if (!isSocialMediaUrl(url)) {
      return false
    }

    try {
      setIsValidating(true)
      const apiEndpoint = isTikTokUrl(url) ? '/api/tiktok-download' : '/api/instagram-download'
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      
      const result = await response.json()
      setIsValidating(false)
      return !result.error
    } catch (error) {
      setIsValidating(false)
      return false
    }
  }

  // Check clipboard for social media URLs
  const checkClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const socialMediaUrl = extractSocialMediaUrl(text)
      
      if (socialMediaUrl && socialMediaUrl !== currentUrl) {
        setClipboardUrl(socialMediaUrl)
        setShowClipboardSuggestion(true)
      }
    } catch (error) {
      // Clipboard access denied or not available
      console.log('Clipboard access not available')
    }
  }

  // Auto-check clipboard on component mount
  useEffect(() => {
    checkClipboard()
    
    // Check clipboard every 5 seconds when input is focused
    const interval = setInterval(() => {
      if (document.activeElement === inputRef.current) {
        checkClipboard()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [currentUrl])

  // Handle paste event
  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const socialMediaUrl = extractSocialMediaUrl(pastedText)
    
    if (socialMediaUrl) {
      onUrlChange(socialMediaUrl)
      // Auto-validate and trigger download
      const isValid = await validateUrl(socialMediaUrl)
      if (isValid) {
        onUrlDetected(socialMediaUrl)
      }
    } else {
      onUrlChange(pastedText)
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onUrlChange(value)
    
    // Auto-detect social media URL when typing
    if (isSocialMediaUrl(value)) {
      const timer = setTimeout(async () => {
        const isValid = await validateUrl(value)
        if (isValid) {
          onUrlDetected(value)
        }
      }, 1000) // Debounce
      
      return () => clearTimeout(timer)
    }
  }

  // Accept clipboard suggestion
  const acceptClipboardSuggestion = () => {
    onUrlChange(clipboardUrl)
    setShowClipboardSuggestion(false)
    onUrlDetected(clipboardUrl)
  }

  // Reject clipboard suggestion
  const rejectClipboardSuggestion = () => {
    setShowClipboardSuggestion(false)
    setClipboardUrl('')
  }

  // Get URL validation status
  const getUrlStatus = () => {
    if (!currentUrl) return 'empty'
    if (isValidating) return 'validating'
    if (isSocialMediaUrl(currentUrl)) return 'valid'
    return 'invalid'
  }

  // Get platform type
  const getPlatformType = () => {
    if (isTikTokUrl(currentUrl)) return 'tiktok'
    if (isInstagramUrl(currentUrl)) return 'instagram'
    return 'unknown'
  }

  const urlStatus = getUrlStatus()
  const platformType = getPlatformType()

  return (
    <div className="space-y-3">
      {/* Clipboard Suggestion */}
      {showClipboardSuggestion && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <Clipboard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {isTikTokUrl(clipboardUrl) ? 'TikTok' : 'Instagram'}-URL in Zwischenablage gefunden
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 truncate">
                  {clipboardUrl}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    onClick={acceptClipboardSuggestion}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Übernehmen
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={rejectClipboardSuggestion}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Ignorieren
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* URL Input with Status */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={inputRef}
            placeholder={placeholder || "https://vm.tiktok.com/..."}
            value={currentUrl}
            onChange={handleInputChange}
            onPaste={handlePaste}
            className={`pr-10 ${
              urlStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
              urlStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
              urlStatus === 'validating' ? 'border-blue-500 focus:border-blue-500' :
              ''
            }`}
          />
          
          {/* Status Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {urlStatus === 'valid' && (
              <div className="flex items-center gap-1">
                {platformType === 'tiktok' && (
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                )}
                {platformType === 'instagram' && (
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                )}
                <Check className="w-4 h-4 text-green-500" />
              </div>
            )}
            {urlStatus === 'invalid' && currentUrl && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            {urlStatus === 'validating' && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
        </div>

        {/* URL Status Badge */}
        {currentUrl && (
          <div className="flex items-center gap-2">
            <Badge variant={
              urlStatus === 'valid' ? 'default' :
              urlStatus === 'invalid' ? 'destructive' :
              urlStatus === 'validating' ? 'secondary' :
              'outline'
            }>
              {urlStatus === 'valid' && (
                <div className="flex items-center gap-1">
                  {platformType === 'tiktok' && '🎵'}
                  {platformType === 'instagram' && '📷'}
                  ✓ Gültige {platformType === 'tiktok' ? 'TikTok' : 'Instagram'}-URL
                </div>
              )}
              {urlStatus === 'invalid' && '✗ Ungültige URL'}
              {urlStatus === 'validating' && '⏳ Überprüfe...'}
              {urlStatus === 'empty' && 'URL eingeben'}
            </Badge>
            
            {urlStatus === 'valid' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(currentUrl, '_blank')}
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Öffnen
              </Button>
            )}
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {urlStatus === 'valid' ? (
            `✓ ${platformType === 'tiktok' ? 'TikTok' : 'Instagram'}-URL erkannt. Klicken Sie auf Herunterladen oder drücken Sie Enter.`
          ) : urlStatus === 'invalid' ? (
            '❌ Bitte geben Sie eine gültige TikTok- oder Instagram-URL ein.'
          ) : (
            '💡 Tipp: Fügen Sie eine TikTok- oder Instagram-URL ein oder kopieren Sie sie aus der Zwischenablage.'
          )}
        </p>
      </div>
    </div>
  )
}