import { saveResponse } from '@/lib/db';
import { validateResponse } from '@/lib/validate';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '요청 형식이 잘못됐어요.' }, { status: 400 });
  }

  const result = validateResponse(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  try {
    const { updated } = saveResponse(result.data);
    return Response.json({ ok: true, updated });
  } catch (err) {
    console.error('save failed', err);
    return Response.json({ error: '저장하지 못했어요. 잠시 뒤 다시 눌러 주세요.' }, { status: 500 });
  }
}
