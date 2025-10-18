import React from 'react'
import { Metadata } from 'next'
import { Particles } from '@/components/ui/shadcn-io/particles';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About - Tirthvi',
    description: 'Learn about Tirthvi and our mission.',
    alternates: {
        canonical: '/about-us',
    },
    openGraph: {
        title: 'About Us - Tirthvi',
        description: 'Learn about Tirthvi and our mission.',
        type: 'website',
    },
}

export default function AboutPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <Particles className="absolute inset-0 pointer-events-none" quantity={120} ease={80} refresh color={"#f1c338"}/>

            <div className="relative z-20 p-6 md:p-12">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Text Content - Left Side */}
                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold">About Us</h1>
                        <p className="text-lg leading-relaxed">
                            Tirthvi is a comprehensive platform for learning about Hinduism and Hindu philosophy.
                            In a world where people are losing touch with their roots, and misinformation is widespread, Tirthvi aims to provide an enduring platform with accurate and reliable information.
                        </p>

                        <h2 className="text-2xl font-semibold">Our Mission</h2>
                        <p className="text-lg leading-relaxed">
                            Tirthvi is an open source project. 
                            You can find the source code on Github, <Link href="https://github.com/armaancpro/tirthvi-web" className="text-primary underline">here.</Link> If you&apos;d like to contribute, please do so.
                        </p>
                        
                        <p className="text-lg leading-relaxed">
                            We built Tirthvi knowing that to be successful, we need to combine ancient wisdom with modern technology.
                            Our platform features:
                        </p>
                        <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
                            <li>Hindu calendar with accurate event dates and details</li>
                            <li>AI-powered chatbot for answering questions about Hindu philosophy</li>
                            <li>Digital library of Hindu scriptures and texts</li>
                            <li>Event subscription and saving features</li>
                            <li>Secure user accounts and premium features</li>
                        </ul>
                        
                        <p className="text-lg leading-relaxed">
                            Ultimately, Tirthvi serves as a hub for people to learn about all major aspects of Hinduism, from daily practices to deep philosophical concepts.
                        </p>
                    </div>

                    {/* Icon - Right Side */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-96 h-96 rounded-lg flex items-center justify-center">
                            <Image
                                src="/tirthvi-icon.svg"
                                alt="Tirthvi logo"
                                width={300}
                                height={300}
                                priority
                                className="shadow-orange-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}