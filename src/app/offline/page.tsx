export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-purple-600">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Offline
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Sie sind offline. Einige Funktionen sind möglicherweise nicht verfügbar.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Neu laden
        </button>
      </div>
    </div>
  )
}