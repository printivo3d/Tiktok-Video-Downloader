'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  CheckCircle, 
  RefreshCw,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { ErrorMessage, ErrorHandler } from '@/lib/error-handler'

interface ErrorDisplayProps {
  error: any
  onRetry?: () => void
  customMessage?: string
  showHelp?: boolean
}

export function ErrorDisplay({ error, onRetry, customMessage, showHelp = true }: ErrorDisplayProps) {
  const errorMessage = ErrorHandler.getErrorMessage(error)

  const getIcon = () => {
    switch (errorMessage.type) {
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const getVariant = () => {
    switch (errorMessage.type) {
      case 'error':
        return 'destructive' as const
      case 'warning':
        return 'default' as const
      case 'info':
        return 'default' as const
      default:
        return 'destructive' as const
    }
  }

  const getHelpfulTips = () => {
    switch (errorMessage.code) {
      case 'NETWORK_ERROR':
        return [
          'Überprüfen Sie Ihre Internetverbindung',
          'Versuchen Sie, die Seite neu zu laden',
          'Deaktivieren Sie VPN oder Proxy'
        ]
      case 'INVALID_URL':
        return [
          'Stellen Sie sicher, dass es sich um eine TikTok-URL handelt',
          'Die URL sollte mit "https://vm.tiktok.com/" oder "https://www.tiktok.com/" beginnen',
          'Kopieren Sie die URL direkt aus der TikTok-App'
        ]
      case 'TIKTOK_RATE_LIMIT':
        return [
          'Warten Sie 1-2 Minuten vor dem nächsten Versuch',
          'Vermeiden Sie zu viele Downloads in kurzer Zeit',
          'Versuchen Sie es später erneut'
        ]
      case 'TIKTOK_PRIVATE_CONTENT':
        return [
          'Private TikToks können nicht heruntergeladen werden',
          'Nur öffentliche TikToks sind verfügbar',
          'Fragen Sie den Ersteller um Zugriff'
        ]
      case 'DOWNLOAD_FAILED':
        return [
          'Überprüfen Sie Ihre Internetverbindung',
          'Versuchen Sie eine niedrigere Video-Qualität',
          'Leeren Sie Ihren Browser-Cache'
        ]
      default:
        return [
          'Versuchen Sie es später erneut',
          'Überprüfen Sie die URL auf Korrektheit',
          'Kontaktieren Sie den Support, wenn das Problem weiterhin besteht'
        ]
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Error Alert */}
      <Alert variant={getVariant()}>
        {getIcon()}
        <AlertTitle>{errorMessage.title}</AlertTitle>
        <AlertDescription>
          {customMessage || errorMessage.description}
          {errorMessage.suggestion && (
            <div className="mt-2 text-sm opacity-90">
              💡 {errorMessage.suggestion}
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Error Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5" />
            Fehlerdetails
          </CardTitle>
          <CardDescription>
            Technische Informationen zu diesem Fehler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Fehlercode:</span>
            <Badge variant="outline">{errorMessage.code}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Typ:</span>
            <Badge variant={errorMessage.type === 'error' ? 'destructive' : 'secondary'}>
              {errorMessage.type.toUpperCase()}
            </Badge>
          </div>
          {error?.message && (
            <div>
              <span className="text-sm font-medium">Technische Details:</span>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono break-all">
                {error.message}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Helpful Tips */}
      {showHelp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Hilfreiche Tipps
            </CardTitle>
            <CardDescription>
              Versuchen Sie diese Lösungen, um das Problem zu beheben
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getHelpfulTips().map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button onClick={onRetry} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="flex-1"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Seite neu laden
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => window.open('https://support.tiktok.com', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          TikTok Support
        </Button>
      </div>
    </div>
  )
}