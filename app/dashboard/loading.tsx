export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/60 h-8 w-32 animate-pulse rounded-md" />
      <div className="border-border/60 bg-muted/20 h-64 animate-pulse rounded-lg border" />
    </div>
  )
}
