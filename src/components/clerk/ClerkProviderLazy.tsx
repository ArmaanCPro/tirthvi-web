'use client'

import dynamic from 'next/dynamic'

const ClerkClientProvider = dynamic(() => import("./ClerkClientProvider"), {
    ssr: false,
})

export default ClerkClientProvider