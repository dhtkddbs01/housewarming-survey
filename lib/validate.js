import { GRILL, MAIN, NAME_MAX, PASTA, RICE, values } from './options';

// 화면에서 막아도 요청은 직접 보낼 수 있으니 서버에서 다시 검증한다.
// 성공: { ok: true, data }  실패: { ok: false, error: '한국어 메시지' }
export function validateResponse(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('요청 형식이 잘못됐어요.');

  const name = typeof body.name === 'string' ? body.name.normalize('NFC').trim() : '';
  const nameLength = [...name].length;
  if (nameLength < 1) return fail('이름을 입력해 주세요.');
  if (nameLength > NAME_MAX) return fail(`이름은 ${NAME_MAX}자까지 쓸 수 있어요.`);

  const { main, grill } = body;
  if (!values(MAIN).includes(main)) return fail('면 / 밥 중 하나를 골라 주세요.');

  let pasta = null;
  let rice = null;
  if (main === 'pasta') {
    if (!Array.isArray(body.pasta) || body.pasta.length === 0) {
      return fail('파스타 재료를 하나 이상 골라 주세요.');
    }
    if (!body.pasta.every((v) => values(PASTA).includes(v))) {
      return fail('없는 파스타 재료가 들어 있어요.');
    }
    // 정해진 순서로 중복 제거
    pasta = values(PASTA).filter((v) => body.pasta.includes(v));
  } else {
    if (!values(RICE).includes(body.rice)) return fail('전복밥 / 알밥 중 하나를 골라 주세요.');
    rice = body.rice;
  }

  if (!values(GRILL).includes(grill)) return fail('생선구이 / 고기구이 중 하나를 골라 주세요.');

  return { ok: true, data: { name, main, pasta, rice, grill } };
}

function fail(error) {
  return { ok: false, error };
}
