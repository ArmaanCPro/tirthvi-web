import { EventListSkeleton } from '@/components/event-card-skeleton';

export default function CalendarLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <label className="text-lg font-medium">Year:</label>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              <EventListSkeleton count={6} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
