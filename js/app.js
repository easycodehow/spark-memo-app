/* ===================================
   SPARK 메모앱 - 메인 JavaScript
   =================================== */

// ===================================
// 전역 변수
// ===================================
let memos = []; // 메모 데이터 배열
let currentMemoId = null; // 현재 선택/수정 중인 메모 ID
let isImportant = false; // 중요 메모 여부
let selectedImage = null; // 선택된 이미지 (Base64)
let filterImportant = false; // 중요 메모 필터 상태
let searchQuery = ''; // 검색어

// ===================================
// DOM 요소
// ===================================
const memoInput = document.getElementById('memoInput');
const saveBtn = document.getElementById('saveBtn');
const importantBtn = document.getElementById('importantBtn');
const imageBtn = document.getElementById('imageBtn');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const memoList = document.getElementById('memoList');
const searchInput = document.getElementById('searchInput');
const filterImportantBtn = document.getElementById('filterImportantBtn');
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

// 상세보기 화면
const mainView = document.getElementById('mainView');
const detailView = document.getElementById('detailView');
const backBtn = document.getElementById('backBtn');
const detailContent = document.getElementById('detailContent');
const detailDate = document.getElementById('detailDate');
const detailImage = document.getElementById('detailImage');
const editBtn = document.getElementById('editBtn');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const deleteBtn = document.getElementById('deleteBtn');

// 더보기 메뉴
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const fontSizeBtn = document.getElementById('fontSizeBtn');
const darkModeBtn = document.getElementById('darkModeBtn');

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
  // 메모 작성 관련
  saveBtn.addEventListener('click', handleSaveMemo);
  importantBtn.addEventListener('click', toggleImportant);
  imageBtn.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', handleImageSelect);

  // 검색 및 필터
  searchInput.addEventListener('input', handleSearch);
  filterImportantBtn.addEventListener('click', toggleFilter);

  // 더보기 메뉴
  menuBtn.addEventListener('click', toggleMenu);
  exportBtn.addEventListener('click', exportMemos);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', importMemos);
  fontSizeBtn.addEventListener('click', toggleFontSize);
  darkModeBtn.addEventListener('click', toggleDarkMode);

  // 상세보기 화면
  backBtn.addEventListener('click', () => showView('main'));
  editBtn.addEventListener('click', handleEdit);
  shareBtn.addEventListener('click', handleShare);
  copyBtn.addEventListener('click', handleCopy);
  deleteBtn.addEventListener('click', handleDeleteFromDetail);

  // 메뉴 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add('hidden');
    }
  });
}

// ===================================
// LocalStorage 관련 함수
// ===================================
function loadMemos() {
  const saved = localStorage.getItem('memos');
  memos = saved ? JSON.parse(saved) : [];

  // 마이그레이션: 기존 메모에 날짜 정보가 없는 경우 추가
  let needsSave = false;
  memos = memos.map(memo => {
    // createdAt이 없는 경우
    if (!memo.createdAt) {
      memo.createdAt = memo.id ? new Date(memo.id).toISOString() : new Date().toISOString();
      needsSave = true;
    }
    // updatedAt이 없는 경우
    if (!memo.updatedAt) {
      memo.updatedAt = memo.createdAt;
      needsSave = true;
    }
    return memo;
  });

  // 마이그레이션 후 저장
  if (needsSave) {
    saveMemos();
  }
}

function saveMemos() {
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ===================================
// 메모 CRUD 기능
// ===================================

// Create & Update: 메모 저장
function handleSaveMemo() {
  const content = memoInput.value.trim();

  if (!content && !selectedImage) {
    alert('메모 내용을 입력하거나 이미지를 추가해주세요.');
    return;
  }

  const memo = {
    id: currentMemoId || Date.now(),
    content: content,
    important: isImportant,
    image: selectedImage,
    createdAt: currentMemoId ? memos.find(m => m.id === currentMemoId).createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (currentMemoId) {
    // Update: 기존 메모 수정
    const index = memos.findIndex(m => m.id === currentMemoId);
    memos[index] = memo;
  } else {
    // Create: 새 메모 추가
    memos.unshift(memo);
  }

  saveMemos();
  resetForm();
  renderMemos();
}

// Delete: 메모 삭제
function handleDelete(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    memos = memos.filter(m => m.id !== id);
    saveMemos();
    renderMemos();
  }
}

// 상세보기에서 삭제
function handleDeleteFromDetail() {
  if (confirm('정말 삭제하시겠습니까?')) {
    memos = memos.filter(m => m.id !== currentMemoId);
    saveMemos();
    currentMemoId = null;
    showView('main');
    renderMemos();
  }
}

// ===================================
// 메모 렌더링
// ===================================
function renderMemos() {
  // 필터링 및 검색 적용
  let filteredMemos = memos;

  if (filterImportant) {
    filteredMemos = filteredMemos.filter(m => m.important);
  }

  if (searchQuery) {
    filteredMemos = filteredMemos.filter(m =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 메모 목록이 비어있을 때
  if (filteredMemos.length === 0) {
    memoList.innerHTML = '<p style="text-align: center; color: var(--placeholder-color); padding: 20px;">저장된 메모가 없습니다.</p>';
    return;
  }

  // 메모 목록 렌더링
  memoList.innerHTML = filteredMemos.map(memo => `
    <div class="memo-item ${memo.important ? 'important' : ''}" onclick="showMemoDetail(${memo.id})">
      <div class="memo-title">
        ${memo.important ? '⭐ ' : ''}${memo.content || '(이미지 메모)'}
      </div>
      <div class="memo-date">${formatDate(memo.updatedAt || memo.createdAt)}</div>
      ${memo.image ? '<div class="memo-image-indicator">📷 이미지 포함</div>' : ''}
    </div>
  `).join('');
}

// ===================================
// 중요 메모 기능
// ===================================
function toggleImportant() {
  isImportant = !isImportant;
  importantBtn.style.backgroundColor = isImportant ? 'var(--main-color)' : 'var(--bg-color)';
}

function toggleFilter() {
  filterImportant = !filterImportant;
  filterImportantBtn.classList.toggle('active');
  renderMemos();
}

// ===================================
// 검색 기능
// ===================================
function handleSearch(e) {
  searchQuery = e.target.value.trim();
  renderMemos();
}

// ===================================
// 이미지 첨부 기능
// ===================================
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 이미지 파일 검증
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 선택할 수 있습니다.');
    return;
  }

  // 파일 크기 제한 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('이미지 크기는 5MB 이하만 가능합니다.');
    return;
  }

  // 이미지를 Base64로 변환
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImage = e.target.result;
    showImagePreview(selectedImage);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(imageSrc) {
  imagePreview.innerHTML = `
    <img src="${imageSrc}" alt="미리보기">
    <button onclick="removeImage()" aria-label="이미지 삭제">×</button>
  `;
  imagePreview.classList.remove('hidden');
}

function removeImage() {
  selectedImage = null;
  imagePreview.innerHTML = '';
  imagePreview.classList.add('hidden');
  imageInput.value = '';
}

// ===================================
// 상세보기 화면
// ===================================
function showMemoDetail(id) {
  const memo = memos.find(m => m.id === id);
  if (!memo) return;

  currentMemoId = id;

  // 상세 내용 표시
  detailContent.textContent = memo.content || '(내용 없음)';
  detailDate.textContent = `작성: ${formatDate(memo.createdAt)} / 수정: ${formatDate(memo.updatedAt)}`;

  // 이미지 표시
  if (memo.image) {
    detailImage.innerHTML = `<img src="${memo.image}" alt="메모 이미지">`;
  } else {
    detailImage.innerHTML = '';
  }

  showView('detail');
}

function showView(view) {
  if (view === 'main') {
    mainView.classList.remove('hidden');
    detailView.classList.add('hidden');
    currentMemoId = null;
    resetForm();
  } else {
    mainView.classList.add('hidden');
    detailView.classList.remove('hidden');
  }
}

// ===================================
// 메모 수정
// ===================================
function handleEdit() {
  const memo = memos.find(m => m.id === currentMemoId);
  if (!memo) return;

  // 메인 화면으로 돌아가서 수정 모드
  showView('main');
  memoInput.value = memo.content;
  isImportant = memo.important;
  importantBtn.style.backgroundColor = isImportant ? 'var(--main-color)' : 'var(--bg-color)';

  if (memo.image) {
    selectedImage = memo.image;
    showImagePreview(selectedImage);
  }

  // 저장 버튼 텍스트 변경
  saveBtn.textContent = '수정하기';
  memoInput.focus();
}

// ===================================
// 공유 및 복사 기능
// ===================================
function handleShare() {
  const memo = memos.find(m => m.id === currentMemoId);
  if (!memo) return;

  if (navigator.share) {
    navigator.share({
      title: 'SPARK 메모',
      text: memo.content
    }).catch(err => console.log('공유 취소:', err));
  } else {
    alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
  }
}

function handleCopy() {
  const memo = memos.find(m => m.id === currentMemoId);
  if (!memo) return;

  navigator.clipboard.writeText(memo.content)
    .then(() => alert('메모가 클립보드에 복사되었습니다.'))
    .catch(err => alert('복사 실패: ' + err));
}

// ===================================
// 백업/복원 기능 (4단계)
// ===================================
function exportMemos() {
  const dataStr = JSON.stringify(memos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spark-memos-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  alert('메모를 내보냈습니다!');
  dropdownMenu.classList.add('hidden');
}

function importMemos(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedMemos = JSON.parse(e.target.result);
      if (!Array.isArray(importedMemos)) {
        throw new Error('잘못된 파일 형식입니다.');
      }

      if (confirm('기존 메모에 추가하시겠습니까?\n(취소하면 기존 메모가 모두 삭제됩니다)')) {
        memos = [...memos, ...importedMemos];
      } else {
        memos = importedMemos;
      }

      saveMemos();
      renderMemos();
      alert('메모를 가져왔습니다!');
    } catch (err) {
      alert('파일을 읽을 수 없습니다: ' + err.message);
    }
  };
  reader.readAsText(file);
  importFile.value = '';
  dropdownMenu.classList.add('hidden');
}

// ===================================
// 설정 관련 함수 (5단계)
// ===================================
function loadSettings() {
  // 다크모드
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }

  // 글자 크기
  const fontSize = localStorage.getItem('fontSize');
  if (fontSize) {
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    if (fontSize !== 'normal') {
      document.body.classList.add(`font-${fontSize}`);
    }
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  dropdownMenu.classList.add('hidden');
}

function toggleFontSize() {
  const sizes = ['small', 'normal', 'large'];
  let current = 'normal';

  if (document.body.classList.contains('font-small')) current = 'small';
  if (document.body.classList.contains('font-large')) current = 'large';

  const nextIndex = (sizes.indexOf(current) + 1) % sizes.length;
  const next = sizes[nextIndex];

  document.body.className = document.body.className.replace(/font-\w+/g, '');
  if (next !== 'normal') {
    document.body.classList.add(`font-${next}`);
  }

  localStorage.setItem('fontSize', next);
  dropdownMenu.classList.add('hidden');
}

function toggleMenu() {
  dropdownMenu.classList.toggle('hidden');
}

// ===================================
// 유틸리티 함수
// ===================================
function formatDate(dateString) {
  // 날짜가 없거나 유효하지 않은 경우
  if (!dateString) {
    return '날짜 없음';
  }

  const date = new Date(dateString);

  // 유효하지 않은 날짜인 경우
  if (isNaN(date.getTime())) {
    return '날짜 없음';
  }

  const now = new Date();
  const diff = now - date;

  // 미래 날짜인 경우 (시스템 시간 오류)
  if (diff < 0) {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  // 1분 이내
  if (diff < 60000) {
    return '방금 전';
  }

  // 1시간 이내
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}분 전`;
  }

  // 24시간 이내
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}시간 전`;
  }

  // 7일 이내
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}일 전`;
  }

  // 그 외 (날짜와 시간 표시)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function resetForm() {
  memoInput.value = '';
  currentMemoId = null;
  isImportant = false;
  selectedImage = null;
  importantBtn.style.backgroundColor = 'var(--bg-color)';
  imagePreview.innerHTML = '';
  imagePreview.classList.add('hidden');
  imageInput.value = '';
  saveBtn.textContent = '저장하기';
}
