const API_BASE = 'https://lectorquite-o.vercel.app/api/v1';

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
    let url = `${API_BASE}/lexicon/words?skip=${skip}&limit=${limit}`;
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
    const res = await fetch(`${API_BASE}/lexicon/words/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchFeaturedWord(): Promise<WordResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/lexicon/words/featured`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<CategoryResponse[]> {
  try {
    const res = await fetch(`${API_BASE}/lexicon/categories`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchQuizQuestions(): Promise<QuizQuestionResponse[]> {
  try {
    const res = await fetch(`${API_BASE}/lexicon/quiz/questions`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function checkQuizAnswer(questionId: number, answerId: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/lexicon/quiz/questions/${questionId}/check?answer_id=${answerId}`, { method: 'POST' });
    return await res.json();
  } catch {
    return null;
  }
}

export async function voteWord(slug: string, value: number, token: string): Promise<VoteResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/lexicon/words/${slug}/vote?value=${value}`, {
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
    const res = await fetch(`${API_BASE}/lexicon/words/${slug}/comments`);
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
    const res = await fetch(`${API_BASE}/lexicon/words/${slug}/comments`, {
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
    const res = await fetch(`${API_BASE}/lexicon/words`, {
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

export async function searchWordsProxy(search: string): Promise<WordPaged> {
  try {
    const res = await fetch(`/api/proxy?search=${encodeURIComponent(search)}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { total: 0, page: 0, size: 0, items: [] };
  }
}


