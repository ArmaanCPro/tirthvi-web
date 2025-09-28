'use client'

import { formatDistanceToNow } from 'date-fns'

interface MessageTimestampProps {
  timestamp: Date
  className?: string
}

export function MessageTimestamp({ timestamp, className = '' }: MessageTimestampProps) {
  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      {formatDistanceToNow(timestamp, { addSuffix: true })}
    </span>
  )
}
