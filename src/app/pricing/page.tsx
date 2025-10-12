import PricingClient from "./PricingClient";

export const dynamic = "force-static"; // ssg, but optional ssr if signed in

export default function PricingPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <PricingClient />
        </div>
    )
}