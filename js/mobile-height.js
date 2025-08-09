// 모바일 브라우저 UI를 고려한 동적 높이 계산
function setMobileHeight() {
  // 실제 뷰포트 높이를 가져옴 (브라우저 UI 제외)
  const vh = window.innerHeight * 0.01;
  const actualHeight = window.innerHeight;
  
  // CSS 변수 업데이트
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  document.documentElement.style.setProperty('--mobile-height', `${actualHeight}px`);
  
  // 디버깅을 위한 콘솔 로그 (개발 중에만 사용)
  // console.log('Mobile height updated:', {
  //   innerHeight: window.innerHeight,
  //   vh: vh,
  //   mobileHeight: actualHeight
  // });
}

// 초기 설정
setMobileHeight();

// 화면 크기 변경 시 업데이트
window.addEventListener('resize', setMobileHeight);

// 화면 방향 변경 시 업데이트 (모바일에서 중요)
window.addEventListener('orientationchange', () => {
  // 방향 변경 후 약간의 지연을 두고 실행
  setTimeout(setMobileHeight, 100);
  // 추가로 더 긴 지연 후 한 번 더 실행 (일부 브라우저에서 필요)
  setTimeout(setMobileHeight, 500);
});

// Safari에서 주소창 숨김/표시 시 업데이트
let lastHeight = window.innerHeight;
let resizeTimeout;

window.addEventListener('scroll', () => {
  const currentHeight = window.innerHeight;
  if (currentHeight !== lastHeight) {
    lastHeight = currentHeight;
    
    // 디바운싱을 위한 타이머 클리어
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(setMobileHeight, 50);
  }
});

// 페이지 로드 완료 후 한 번 더 실행
window.addEventListener('load', setMobileHeight);

// DOMContentLoaded 후에도 실행
document.addEventListener('DOMContentLoaded', setMobileHeight);

// 추가: Safari에서 주소창 변경 감지를 위한 이벤트
if ('visualViewport' in window) {
  window.visualViewport.addEventListener('resize', setMobileHeight);
}

// 추가: 페이지가 포커스를 받을 때도 업데이트
window.addEventListener('focus', setMobileHeight);

// 추가: 페이지가 보이게 될 때 업데이트 (페이지 전환 시)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(setMobileHeight, 100);
  }
}); 