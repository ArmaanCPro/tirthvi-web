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
                            Tirthvi is a platform for learning about Hinduism and hindu philosophy.
                            In a world where people are losing touch with their roots, and misinformation (or rather, disinformation) is widespread, Tirthvi aims to provide an enduring platform with accurate and reliable information.
                        </p>

                        <h2 className="text-2xl font-semibold">Our Mission</h2>
                        <p className="text-lg leading-relaxed">
                            I&apos;d first like to mention that Tirthvi is an open source project. 
                            You can find the source code on Github, <Link href="https://github.com/armaancpro/tirthvi-web" className="text-primary underline">here.</Link> If you&apos;d like to contribute, please do so.
                            Tirthvi is built using modern tools and technologies.
                            We built it knowing that in order to be successful, we need to combine old wisdom with new technology.
                            Thus we&apos;ve integrated modern AI tools along with traditional calendar knowledge and scriptures.
                            Ultimately, Tirthvi is a hub, for people to learn about all major aspects of Hinduism.
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