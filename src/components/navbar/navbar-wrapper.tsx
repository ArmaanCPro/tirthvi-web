'use client'

import NavbarClient from './navbar-client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export default function NavbarWrapper(){

    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isPremium, setIsPremium] = useState<boolean>(false);

    useEffect(() => {
        let active = true;
        fetch('/api/auth/admin')
            .then((res) => res.json())
            .then((data) => {
                if (active) setIsAdmin(!!data?.isAdmin);
            })
            .catch(() => {
                if (active) setIsAdmin(false);
            });
    }, []);

    useEffect(() => {
        let active = true;
        fetch('/api/auth/premium')
            .then((res) => res.json())
            .then((data) => {
                if (active) setIsPremium(!!data?.isPremium);
            })
            .catch(() => {
                if (active) setIsPremium(false);
            });
    }, []);

    return <NavbarClient isAdmin={isAdmin} isPremium={isPremium} />
}
