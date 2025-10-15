import { getScriptureBySlug, getAllScriptures } from '@/lib/scriptures';
import { ScriptureDetail } from '@/components/scriptures/scripture-detail';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ScripturePageProps {
  params: {
    slug: string;
  };
}

export default async function ScripturePage({ params }: ScripturePageProps) {
  const { slug } = await params;
  const scripture = await getScriptureBySlug(slug);
  
  if (!scripture) {
    notFound();
  }
  
  return <ScriptureDetail scripture={scripture} />;
}

export async function generateMetadata({ params }: ScripturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const scripture = await getScriptureBySlug(slug);

  if (!scripture) {
    notFound();
  }

  return {
    title: scripture.title,
    description: scripture.description,
    alternates: {
      canonical: `/scriptures/${scripture.slug}`,
    },
    openGraph: {
      title: scripture.title,
      description: scripture.description,
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/scriptures/${scripture.slug}`,
      images: scripture.image ? [{
        url: scripture.image.url,
        alt: scripture.image.alt,
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: scripture.title,
      description: scripture.description,
      images: scripture.image ? [scripture.image.url] : undefined,
    }
  }
}

// Static generation - pages are built at build time with fresh data
export async function generateStaticParams() {
  const scriptures = await getAllScriptures();
  return scriptures.map(scripture => ({
    slug: scripture.slug,
  }));
}
