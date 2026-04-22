import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get('search');
  const skip = url.searchParams.get('skip') || '0';
  const limit = url.searchParams.get('limit') || '100';
  const endpoint = url.searchParams.get('endpoint'); // Optional override

  // Determinar la URL de destino
  let targetUrl = 'https://lectorquite-o.vercel.app/api/v1/lexicon/words';
  
  if (endpoint) {
    targetUrl = `https://lectorquite-o.vercel.app/api/v1${endpoint}`;
  }

  const target = new URL(targetUrl);
  if (search) target.searchParams.set('search', search);
  if (skip) target.searchParams.set('skip', skip);
  if (limit) target.searchParams.set('limit', limit);

  // Copiar headers relevantes (especialmente Authorization)
  const headers = new Headers();
  const auth = request.headers.get('Authorization');
  if (auth) headers.set('Authorization', auth);
  if (request.headers.get('Content-Type')) {
    headers.set('Content-Type', request.headers.get('Content-Type')!);
  }

  try {
    const options: RequestInit = {
      method: request.method,
      headers: headers,
    };

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      options.body = await request.text();
    }

    const res = await fetch(target.toString(), options);
    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request', details: e }), { status: 500 });
  }
};
