
export const dynamic = "force-dynamic"; // auth-protected routes need SSR

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        {children}
        </>
    )
}
