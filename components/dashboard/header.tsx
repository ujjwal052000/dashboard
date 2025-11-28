export function DashboardHeader() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Dashboard Outreach Analytics
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Real-time insights from Google Sheets</p>
          </div>
        </div>
      </div>
    </header>
  )
}
