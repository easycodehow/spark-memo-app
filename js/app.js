/* ===================================
   SPARK 메모앱 - 메인 JavaScript
   =================================== */

// ===================================
// 전역 변수
// ===================================
let memos = []; // 메모 데이터 배열
let currentMemoId = null; // 현재 선택된 메모 ID
let isImportant = false; // 중요 메모 여부
let selectedImage = null; // 선택된 이미지
let filterImportant = false; // 중요 메모 필터 상태

// ===================================
// 초기화
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  // LocalStorage에서 메모 불러오기
  loadMemos();

  // 이벤트 리스너 등록
  registerEventListeners();

  // 설정 불러오기 (다크모드, 글자크기)
  loadSettings();

  // 메모 목록 렌더링
  renderMemos();
}

// ===================================
// 이벤트 리스너 등록
// ===================================
function registerEventListeners() {
  // TODO: 2단계에서 구현 예정
  console.log('이벤트 리스너 등록 준비 완료');
}

// ===================================
// LocalStorage 관련 함수
// ===================================
function loadMemos() {
  // TODO: 2단계에서 구현 예정
  const saved = localStorage.getItem('memos');
  memos = saved ? JSON.parse(saved) : [];
}

function saveMemos() {
  // TODO: 2단계에서 구현 예정
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ===================================
// 메모 렌더링
// ===================================
function renderMemos() {
  // TODO: 2단계에서 구현 예정
  console.log('메모 렌더링 준비 완료');
}

// ===================================
// 설정 관련 함수
// ===================================
function loadSettings() {
  // TODO: 5단계에서 구현 예정
  console.log('설정 불러오기 준비 완료');
}
