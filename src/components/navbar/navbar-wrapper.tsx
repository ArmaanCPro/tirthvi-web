import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth'
import NavbarClient from './navbar-client'

export default async function NavbarWrapper(){
    const { userId, has } = await auth()

    if (!userId) {
        return <NavbarClient />
    }

    const admin = isAdmin(userId!);
    const premium = has({plan: 'premium'});

    return <NavbarClient isAdmin={await admin} isPremium={premium} />
}
