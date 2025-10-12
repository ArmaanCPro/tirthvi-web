import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy - Tirthvi',
    description: 'Learn about how we collect, use, and protect your personal information on Tirthvi.',
    alternates: {
        canonical: '/privacy-policy',
    },
    openGraph: {
        title: 'Privacy Policy - Tirthvi',
        description: 'Learn about how we collect, use, and protect your personal information on Tirthvi.',
        type: 'website',
    },
    twitter: {
        title: 'Privacy Policy - Tirthvi',
        description: 'Learn about how we collect, use, and protect your personal information on Tirthvi.',
        card: 'summary',
    },
}

const PrivacyPolicyPage: React.FC = () => {
    return (
        <main className="mx-auto max-w-3xl p-6 md:p-12">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy for Tirthvi</h1>

            <p className="mb-4">
                Effective Date: 10/12/2025
            </p>

            <p className="mb-4">
                Tirthvi (“we”, “our”, or “us”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you use our website and services, including when signing in with Google OAuth.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
                When you sign in to Tirthvi using Google OAuth, we collect the following information:
            </p>
            <ul className="list-disc list-inside mb-4">
                <li>Your full name</li>
                <li>Your email address</li>
            </ul>
            <p className="mb-4">
                We also store billing information via Clerk if you subscribe to paid services.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside mb-4">
                <li>Authenticating your account and providing login access</li>
                <li>Personalizing your experience on Tirthvi</li>
                <li>Managing billing and subscription services via Clerk</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6 mb-4">3. Data Sharing</h2>
            <p className="mb-4">
                We do not sell or share your personal information with third parties, except as necessary to provide our services (e.g., Clerk for authentication and billing).
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">4. Your Rights and Choices</h2>
            <p className="mb-4">
                You can contact us at concordiandev@gmail.com to request access to, correction of, or deletion of your personal information.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">5. Security</h2>
            <p className="mb-4">
                We implement reasonable measures to protect your information. However, no method of transmission or storage is completely secure.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">6. Changes to This Policy</h2>
            <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes on this page.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-4">7. Contact Us</h2>
            <p className="mb-4">
                If you have questions about this Privacy Policy, please contact us at: concordiandev@gmail.com
            </p>
        </main>
    );
}

export default PrivacyPolicyPage;
