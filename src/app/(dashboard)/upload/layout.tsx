import { ReactNode } from 'react'

export default function UploadLayout({ children }: { children: ReactNode }) {
  // Auth is handled by middleware, so this component can be static
  return <>{children}</>
}
