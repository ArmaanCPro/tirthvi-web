import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

export const dynamic = "force-dynamic"; // auth-protected routes need SSR

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider appearance={{ theme: shadcn }}>
            <html lang={"en"}>
            <body>
                {children}
            </body>
            </html>
        </ClerkProvider>
    )
}