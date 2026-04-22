const BASE_URL = 'https://lectorquite-o.vercel.app/api/v1';
const isClient = typeof window !== 'undefined';

function getUrl(path: string): string {
  if (isClient) {
    // En el cliente usamos el proxy local para evitar errores de CORS
    return `/api/proxy?endpoint=${encodeURIComponent(path)}`;
  }
  return `${BASE_URL}${path}`;
}

// === SCHEMAS from OpenAPI ===
export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
}

export interface ExampleResponse {
  id: number;
  sentence: string;
  translation: string | null;
}

export interface WordResponse {
  id: number;
  term: string;
  slug: string;
  meaning: string;
  origin: string | null;
  audio_url: string | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  categories: CategoryResponse[];
  examples: ExampleResponse[];
  vote_count: number;
  comment_count: number;
}

export interface WordPaged {
  total: number;
  page: number;
  size: number;
  items: WordResponse[];
}

export interface QuizAnswerResponse {
  id: number;
  answer_text: string;
  is_correct: boolean | null;
}

export interface QuizQuestionResponse {
  id: number;
  question: string;
  answers: QuizAnswerResponse[];
}

export interface CommentResponse {
  id: number;
  content: string;
  created_at: string;
  author_id: string;
  word_id: number;
  parent_id: number | null;
  replies: CommentResponse[];
}

export interface VoteResponse {
  id: number;
  value: number;
  user_id: string;
  word_id: number;
}

// === API CALLS ===

export async function fetchWords(skip = 0, limit = 20, search?: string): Promise<WordPaged> {
  try {
    let url = getUrl('/lexicon/words');
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return { total: 0, page: 0, size: 0, items: [] };
  }
}

export async function fetchWordBySlug(slug: string): Promise<WordResponse | null> {
  try {
    const res = await fetch(getUrl(`/lexicon/words/${slug}`));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchFeaturedWord(): Promise<WordResponse | null> {
  try {
    const res = await fetch(getUrl(`/lexicon/words/featured`));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<CategoryResponse[]> {
  try {
    const res = await fetch(getUrl('/lexicon/categories'));
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchQuizQuestions(): Promise<QuizQuestionResponse[]> {
  try {
    const res = await fetch(getUrl('/lexicon/quiz/questions'));
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function checkQuizAnswer(questionId: number, answerId: number): Promise<any> {
  try {
    const res = await fetch(getUrl(`/lexicon/quiz/questions/${questionId}/check?answer_id=${answerId}`), { method: 'POST' });
    return await res.json();
  } catch {
    return null;
  }
}

export async function voteWord(slug: string, value: number, token: string): Promise<VoteResponse | null> {
  try {
    const res = await fetch(getUrl(`/lexicon/words/${slug}/vote?value=${value}`), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchComments(slug: string): Promise<CommentResponse[]> {
  try {
    const res = await fetch(getUrl(`/lexicon/words/${slug}/comments`));
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function postComment(slug: string, content: string, token: string, parentId?: number): Promise<CommentResponse | null> {
  try {
    const body: any = { content };
    if (parentId) body.parent_id = parentId;
    const res = await fetch(getUrl(`/lexicon/words/${slug}/comments`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function proposeWord(term: string, meaning: string, categoryId: number, token: string): Promise<WordResponse | null> {
  try {
    const body = { term, meaning, category_ids: [categoryId] };
    const res = await fetch(getUrl(`/lexicon/words`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Funciones administrativas
export async function approveWord(slug: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(getUrl(`/lexicon/words/${slug}/approve`), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.ok;
  } catch { return false; }
}

export async function deleteWord(slug: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(getUrl(`/lexicon/words/${slug}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.ok;
  } catch { return false; }
}

export async function saveQuizQuestion(question: Partial<QuizQuestionResponse>, token: string): Promise<boolean> {
  try {
    const method = question.id ? 'PUT' : 'POST';
    const path = question.id ? `/lexicon/quiz/questions/${question.id}` : `/lexicon/quiz/questions`;
    const res = await fetch(getUrl(path), {
      method,
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(question)
    });
    return res.ok;
  } catch { return false; }
}

export async function deleteQuizQuestion(id: number, token: string): Promise<boolean> {
  try {
    const res = await fetch(getUrl(`/lexicon/quiz/questions/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.ok;
  } catch { return false; }
}
