// 문항 · 선택지 코드값과 화면 라벨. 클라이언트와 서버가 같이 쓴다 (DB 코드 넣지 말 것)

export const EVENT_LABEL = '11월 7일(토) 오후 1시';

export const NAME_MAX = 20;

export const MAIN = [
  { value: 'pasta', label: '면 (파스타)', menu: '파스타' },
  { value: 'rice', label: '밥', menu: '밥' },
];

// 파스타 재료 — 중복 선택 가능
export const PASTA = [
  { value: 'myeongran', label: '명란', menu: '명란 파스타' },
  { value: 'shrimp', label: '새우', menu: '새우 파스타' },
  { value: 'mushroom', label: '버섯', menu: '버섯 파스타' },
  { value: 'bacon', label: '베이컨', menu: '베이컨 파스타' },
];

export const RICE = [
  { value: 'abalone', label: '전복밥', menu: '전복밥' },
  { value: 'roe', label: '알밥', menu: '알밥' },
];

export const GRILL = [
  { value: 'fish', label: '생선구이', menu: '생선구이' },
  { value: 'meat', label: '고기구이', menu: '고기구이' },
];

export const values = (list) => list.map((o) => o.value);
