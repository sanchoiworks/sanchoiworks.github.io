// 모바일 브라우저 UI를 고려한 동적 높이 계산
function setMobileHeight() {
  // 실제 뷰포트 높이를 가져옴 (브라우저 UI 제외)
  const vh = window.innerHeight * 0.01;
  
  // CSS 변수 업데이트
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  document.documentElement.style.setProperty('--mobile-height', `${window.innerHeight}px`);
}

// 초기 설정
setMobileHeight();

// 화면 크기 변경 시 업데이트
window.addEventListener('resize', setMobileHeight);

// 화면 방향 변경 시 업데이트 (모바일에서 중요)
window.addEventListener('orientationchange', () => {
  // 방향 변경 후 약간의 지연을 두고 실행
  setTimeout(setMobileHeight, 100);
});

// Safari에서 주소창 숨김/표시 시 업데이트
let lastHeight = window.innerHeight;
window.addEventListener('scroll', () => {
  const currentHeight = window.innerHeight;
  if (currentHeight !== lastHeight) {
    lastHeight = currentHeight;
    setMobileHeight();
  }
});

// 페이지 로드 완료 후 한 번 더 실행
window.addEventListener('load', setMobileHeight); 