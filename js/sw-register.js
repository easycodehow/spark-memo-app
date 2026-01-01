// Service Worker 등록

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker 등록 성공:', registration.scope);

        // 업데이트 확인
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 새로운 Service Worker 발견');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ 새 버전 사용 가능. 페이지를 새로고침하세요.');
              // 선택사항: 사용자에게 알림 표시
              if (confirm('새 버전이 있습니다. 업데이트하시겠습니까?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker 등록 실패:', error);
      });

    // Service Worker 제어 변경 감지
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker 컨트롤러 변경됨');
    });
  });
} else {
  console.warn('⚠️ 이 브라우저는 Service Worker를 지원하지 않습니다.');
}
