'use client'

import { Navbar02, Navbar02NavItem } from '@/components/ui/shadcn-io/navbar-02'
import Image from 'next/image'

export type NavbarClientProps = {
    isAdmin?: boolean,
    isPremium?: boolean,
}

const Logo: React.ReactNode = <Image src="/tirthvi-icon.svg" alt="logo" width={28} height={28} priority />

export default function NavbarClient({
    isAdmin = false,
    isPremium = false }: NavbarClientProps) {

    // Create the base navigation links
    const navigationLinks: Navbar02NavItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Chat', href: '/chat' },
        { label: 'Events Calendar', href: '/calendar' },
        { label: 'Scriptures', href: '/scriptures' },
    ];

    // Conditionally add Upload link if user is admin
    if (isAdmin) {
        navigationLinks.push({ label: 'Upload', href: '/upload' });
    }

    // Add the About submenu
    navigationLinks.push({
        label: 'About',
        submenu: true,
        type: 'icon',
        items: [
            { href: '/privacy-policy', label: 'Privacy Policy', icon: 'ShieldIcon' },
            { href: '/about', label: 'About Us', icon: 'InfoIcon' },
        ]
    });

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <nav className="flex items-center justify-between ">

                <Navbar02
                    logo={Logo}
                    logoHref="/"
                    navigationLinks={navigationLinks}
                />
            </nav>
        </header>
    )
}
