'use client'

import dynamic from 'next/dynamic'

const ClerkClientProvider = dynamic(() => import("./ClerkClientProvider"), {
    // had to remove ssr: false as it was causing issues if users navigated straight to a protected route
})

export default ClerkClientProvider