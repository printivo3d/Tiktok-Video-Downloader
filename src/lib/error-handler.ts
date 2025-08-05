export interface ErrorMessage {
  code: string
  title: string
  description: string
  suggestion?: string
  type: 'error' | 'warning' | 'info'
}

export class ErrorHandler {
  private static readonly ERROR_MESSAGES: Record<string, ErrorMessage> = {
    // Network Errors
    'NETWORK_ERROR': {
      code: 'NETWORK_ERROR',
      title: 'Netzwerkfehler',
      description: 'Keine Verbindung zum Internet. Bitte überprüfen Sie Ihre Internetverbindung.',
      suggestion: 'Versuchen Sie, Ihre Internetverbindung zu überprüfen oder die Seite neu zu laden.',
      type: 'error'
    },
    
    // TikTok API Errors
    'TIKTOK_API_ERROR': {
      code: 'TIKTOK_API_ERROR',
      title: 'TikTok API Fehler',
      description: 'Die TikTok-API ist derzeit nicht erreichbar oder hat geändert.',
      suggestion: 'Bitte versuchen Sie es später erneut oder überprüfen Sie, ob die URL korrekt ist.',
      type: 'error'
    },
    
    'TIKTOK_RATE_LIMIT': {
      code: 'TIKTOK_RATE_LIMIT',
      title: 'Zu viele Anfragen',
      description: 'Sie haben zu viele Anfragen in kurzer Zeit gesendet.',
      suggestion: 'Bitte warten Sie einige Minuten und versuchen Sie es dann erneut.',
      type: 'warning'
    },
    
    'TIKTOK_CONTENT_UNAVAILABLE': {
      code: 'TIKTOK_CONTENT_UNAVAILABLE',
      title: 'Inhalt nicht verfügbar',
      description: 'Dieser TikTok-Inhalt ist nicht mehr verfügbar oder wurde gelöscht.',
      suggestion: 'Überprüfen Sie, ob die URL korrekt ist oder ob der Inhalt noch existiert.',
      type: 'error'
    },
    
    'TIKTOK_PRIVATE_CONTENT': {
      code: 'TIKTOK_PRIVATE_CONTENT',
      title: 'Privater Inhalt',
      description: 'Dieser TikTok ist privat und kann nicht heruntergeladen werden.',
      suggestion: 'Private TikToks können nur von autorisierten Nutzern eingesehen werden.',
      type: 'error'
    },
    
    // URL Errors
    'INVALID_URL': {
      code: 'INVALID_URL',
      title: 'Ungültige URL',
      description: 'Die eingegebene URL ist keine gültige TikTok-URL.',
      suggestion: 'Bitte geben Sie eine gültige TikTok-URL ein (z.B. https://vm.tiktok.com/... oder https://www.tiktok.com/...)',
      type: 'error'
    },
    
    'URL_NOT_FOUND': {
      code: 'URL_NOT_FOUND',
      title: 'URL nicht gefunden',
      description: 'Die angegebene TikTok-URL konnte nicht gefunden werden.',
      suggestion: 'Überprüfen Sie, ob die URL korrekt ist und ob der TikTok noch existiert.',
      type: 'error'
    },
    
    // Download Errors
    'DOWNLOAD_FAILED': {
      code: 'DOWNLOAD_FAILED',
      title: 'Download fehlgeschlagen',
      description: 'Der Download konnte nicht abgeschlossen werden.',
      suggestion: 'Bitte versuchen Sie es erneut oder überprüfen Sie Ihre Internetverbindung.',
      type: 'error'
    },
    
    'FILE_TOO_LARGE': {
      code: 'FILE_TOO_LARGE',
      title: 'Datei zu groß',
      description: 'Die Datei ist zu groß für den Download.',
      suggestion: 'Versuchen Sie, eine niedrigere Qualität auszuwählen oder kontaktieren Sie den Support.',
      type: 'warning'
    },
    
    // Browser Errors
    'BROWSER_NOT_SUPPORTED': {
      code: 'BROWSER_NOT_SUPPORTED',
      title: 'Browser nicht unterstützt',
      description: 'Ihr Browser unterstützt diese Funktion nicht.',
      suggestion: 'Bitte verwenden Sie eine aktuelle Version von Chrome, Firefox, Safari oder Edge.',
      type: 'error'
    },
    
    'COOKIES_DISABLED': {
      code: 'COOKIES_DISABLED',
      title: 'Cookies deaktiviert',
      description: 'Cookies sind in Ihrem Browser deaktiviert.',
      suggestion: 'Bitte aktivieren Sie Cookies in Ihrem Browser-Einstellungen.',
      type: 'warning'
    },
    
    // Generic Errors
    'UNKNOWN_ERROR': {
      code: 'UNKNOWN_ERROR',
      title: 'Unbekannter Fehler',
      description: 'Ein unerwarteter Fehler ist aufgetreten.',
      suggestion: 'Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.',
      type: 'error'
    }
  }

  static getErrorMessage(error: any): ErrorMessage {
    // Extrahiere Fehlercode aus verschiedenen Fehlertypen
    let errorCode = 'UNKNOWN_ERROR'
    
    if (typeof error === 'string') {
      errorCode = this.extractErrorCode(error)
    } else if (error?.code) {
      errorCode = this.extractErrorCode(error.code)
    } else if (error?.message) {
      errorCode = this.extractErrorCode(error.message)
    } else if (error?.status) {
      errorCode = this.getErrorCodeFromStatus(error.status)
    }

    return this.ERROR_MESSAGES[errorCode] || this.ERROR_MESSAGES['UNKNOWN_ERROR']
  }

  private static extractErrorCode(message: string): string {
    const messageLower = message.toLowerCase()
    
    if (messageLower.includes('network') || messageLower.includes('connection')) {
      return 'NETWORK_ERROR'
    }
    if (messageLower.includes('rate limit') || messageLower.includes('too many requests')) {
      return 'TIKTOK_RATE_LIMIT'
    }
    if (messageLower.includes('private') || messageLower.includes('unauthorized')) {
      return 'TIKTOK_PRIVATE_CONTENT'
    }
    if (messageLower.includes('not found') || messageLower.includes('404')) {
      return 'URL_NOT_FOUND'
    }
    if (messageLower.includes('invalid url') || messageLower.includes('invalid url')) {
      return 'INVALID_URL'
    }
    if (messageLower.includes('download') || messageLower.includes('failed')) {
      return 'DOWNLOAD_FAILED'
    }
    if (messageLower.includes('tiktok') || messageLower.includes('api')) {
      return 'TIKTOK_API_ERROR'
    }
    
    return 'UNKNOWN_ERROR'
  }

  private static getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case 400:
        return 'INVALID_URL'
      case 401:
        return 'TIKTOK_PRIVATE_CONTENT'
      case 403:
        return 'TIKTOK_PRIVATE_CONTENT'
      case 404:
        return 'URL_NOT_FOUND'
      case 429:
        return 'TIKTOK_RATE_LIMIT'
      case 500:
        return 'TIKTOK_API_ERROR'
      case 502:
      case 503:
      case 504:
        return 'NETWORK_ERROR'
      default:
        return 'UNKNOWN_ERROR'
    }
  }

  static showErrorToast(error: any, customMessage?: string) {
    const errorMessage = this.getErrorMessage(error)
    
    // Import toast hier, um zirkuläre Abhängigkeiten zu vermeiden
    import('sonner').then(({ toast }) => {
      const title = errorMessage.title
      const description = customMessage || errorMessage.description
      const suggestion = errorMessage.suggestion ? `💡 ${errorMessage.suggestion}` : ''
      
      // Use multiline string instead of JSX
      const message = suggestion 
        ? `${title}\n${description}\n${suggestion}`
        : `${title}\n${description}`
      
      toast.error(message, {
        duration: errorMessage.type === 'error' ? 6000 : 4000
      })
    })
  }

  static showSuccessToast(message: string, description?: string) {
    import('sonner').then(({ toast }) => {
      const title = '✅ Erfolg'
      const toastMessage = description 
        ? `${title}\n${message}\n${description}`
        : `${title}\n${message}`
      
      toast.success(toastMessage, {
        duration: 3000
      })
    })
  }

  static showWarningToast(message: string, description?: string) {
    import('sonner').then(({ toast }) => {
      const title = '⚠️ Warnung'
      const toastMessage = description 
        ? `${title}\n${message}\n${description}`
        : `${title}\n${message}`
      
      toast.warning(toastMessage, {
        duration: 5000
      })
    })
  }

  static showInfoToast(message: string, description?: string) {
    import('sonner').then(({ toast }) => {
      const title = 'ℹ️ Info'
      const toastMessage = description 
        ? `${title}\n${message}\n${description}`
        : `${title}\n${message}`
      
      toast.info(toastMessage, {
        duration: 4000
      })
    })
  }
}