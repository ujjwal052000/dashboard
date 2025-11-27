export function DashboardHeader() {
  return (
    <header className="border-b border-border/30 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 shadow-lg shadow-primary/5">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white font-bold text-lg">
                📊
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analytics
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Real-time insights from your Google Sheets</p>
          </div>
        </div>
      </div>
    </header>
  )
}
