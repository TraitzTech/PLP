import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { helpArticles, findArticle } from '@/lib/help/articles';
import { ArrowLeft, BookOpen, CalendarDays } from 'lucide-react';

export async function generateStaticParams() {
  return helpArticles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = true;

export default function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  // params is async in this codebase's layout usage
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return (<AsyncArticle params={params} />);
}

async function AsyncArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return notFound();

  const related = helpArticles.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="../" className="hover:underline">Help Center</Link>
        <span>/</span>
        <span className="text-gray-900">{article.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-plp-pink" /> {article.title}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
          <Badge className="bg-plp-purple/10 text-plp-purple">{article.category}</Badge>
          <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Updated {new Date(article.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Content */}
      <Card className="mb-6">
        <CardContent className="prose prose-gray max-w-none p-6">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">{article.content}</pre>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Link href="../" className="inline-flex items-center gap-2 text-plp-purple hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Help Center
        </Link>
        {related.length > 0 && (
          <div className="text-sm text-gray-700">
            Related: {related.map((r, i) => (
              <>
                <Link key={r.slug} href={`../${r.slug}`} className="text-plp-pink hover:underline">{r.title}</Link>{i < related.length - 1 ? ', ' : ''}
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
