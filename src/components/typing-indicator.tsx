'use client'

import { Loader } from '@/components/ui/shadcn-io/ai/loader'
import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message'

interface TypingIndicatorProps {
  isTyping: boolean
}

export function TypingIndicator({ isTyping }: TypingIndicatorProps) {
  if (!isTyping) return null

  return (
    <Message from="assistant">
      <MessageContent>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader />
          <span className="text-base">AI is thinking...</span>
        </div>
      </MessageContent>
    </Message>
  )
}
