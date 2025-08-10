// dvh 지원 확인 및 폴백 처리
(function () {
  'use strict';

  // dvh 지원 여부 확인
  function supportsDVH() {
    try {
      // 임시 요소 생성하여 dvh 지원 여부 테스트
      const testEl = document.createElement('div');
      testEl.style.height = '100dvh';
      return testEl.style.height === '100dvh';
    } catch (e) {
      return false;
    }
  }

  // 실제 뷰포트 높이 계산 및 설정
  function setDynamicVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--dynamic-vh', `${vh}px`);

    // 디버깅용 로그 (개발시에만 사용)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Dynamic VH updated:', vh + 'px', 'Total height:', window.innerHeight + 'px');
    }
  }

  // Safe area 값 설정 (iOS 등)
  function setSafeAreaValues() {
    // CSS env() 값이 적용되지 않는 경우를 위한 폴백
    const safeAreaTop =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top')) || 0;
    const safeAreaBottom =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-bottom')) ||
      0;

    // iPhone X 이후 모델들을 위한 간단한 감지
    if (window.navigator.userAgent.includes('iPhone') && window.screen.height >= 812) {
      if (safeAreaTop === 0) {
        document.documentElement.style.setProperty('--safe-area-top', '44px');
      }
      if (safeAreaBottom === 0) {
        document.documentElement.style.setProperty('--safe-area-bottom', '34px');
      }
    }
  }

  // 뷰포트 변화 감지 및 업데이트
  function handleViewportChange() {
    // dvh를 지원하지 않는 경우에만 JavaScript로 업데이트
    if (!supportsDVH()) {
      setDynamicVH();
    }
    setSafeAreaValues();
  }

  // 브라우저 UI 변화 감지를 위한 디바운스된 resize 핸들러
  let resizeTimeout;
  function debouncedResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleViewportChange, 100);
  }

  // 초기화
  function init() {
    // 초기 설정
    handleViewportChange();

    // 이벤트 리스너 등록
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', function () {
      // 기기 회전 시 약간의 지연 후 업데이트
      setTimeout(handleViewportChange, 300);
    });

    // iOS에서 키보드 나타남/사라짐 감지
    if (
      window.navigator.userAgent.includes('iPhone') ||
      window.navigator.userAgent.includes('iPad')
    ) {
      window.addEventListener('focusin', function () {
        setTimeout(handleViewportChange, 300);
      });
      window.addEventListener('focusout', function () {
        setTimeout(handleViewportChange, 300);
      });
    }

    // 페이지 가시성 변화 시 (앱 전환 등)
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        setTimeout(handleViewportChange, 100);
      }
    });
  }

  // DOM 준비되면 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
