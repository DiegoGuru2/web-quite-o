import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const skip = url.searchParams.get('skip') || '0';
  const limit = url.searchParams.get('limit') || '20';

  const target = new URL('https://lectorquite-o.vercel.app/api/v1/lexicon/words');
  target.searchParams.set('skip', skip);
  target.searchParams.set('limit', limit);
  if (search) target.searchParams.set('search', search);

  try {
    const res = await fetch(target.toString());
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), { status: 500 });
  }
};
