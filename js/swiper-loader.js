// Swiper 라이브러리 로더
// 중복 로딩을 방지하고 일관된 버전을 사용하기 위한 유틸리티

let swiperLoaded = false;
let swiperLoading = false;
let swiperLoadCallbacks = [];

const SWIPER_VERSION = '11';
const SWIPER_CDN_BASE = 'https://cdn.jsdelivr.net/npm/swiper@';

/**
 * Swiper 라이브러리가 이미 로드되었는지 확인
 */
export function isSwiperLoaded() {
    return typeof Swiper !== 'undefined' && swiperLoaded;
}

/**
 * Swiper 라이브러리를 동적으로 로드
 * @returns {Promise} Swiper 로드 완료 시 resolve되는 Promise
 */
export function loadSwiper() {
    return new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (isSwiperLoaded()) {
            resolve(Swiper);
            return;
        }

        // 로딩 중인 경우 콜백에 추가
        if (swiperLoading) {
            swiperLoadCallbacks.push({ resolve, reject });
            return;
        }

        swiperLoading = true;

        // CSS 로드
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = `${SWIPER_CDN_BASE}${SWIPER_VERSION}/swiper-bundle.min.css`;
        
        // JS 로드
        const script = document.createElement('script');
        script.src = `${SWIPER_CDN_BASE}${SWIPER_VERSION}/swiper-bundle.min.js`;
        
        script.onload = () => {
            swiperLoaded = true;
            swiperLoading = false;
            
            // 대기 중인 모든 콜백 실행
            swiperLoadCallbacks.forEach(callback => callback.resolve(Swiper));
            swiperLoadCallbacks = [];
            
            resolve(Swiper);
        };
        
        script.onerror = (error) => {
            swiperLoading = false;
            
            // 대기 중인 모든 콜백에 에러 전달
            swiperLoadCallbacks.forEach(callback => callback.reject(error));
            swiperLoadCallbacks = [];
            
            reject(error);
        };

        // DOM에 추가
        document.head.appendChild(cssLink);
        document.head.appendChild(script);
    });
}

/**
 * Swiper 인스턴스 생성 (로드 후)
 * @param {string} selector - Swiper 컨테이너 선택자
 * @param {Object} options - Swiper 옵션
 * @returns {Promise<Swiper>} Swiper 인스턴스
 */
export async function createSwiper(selector, options = {}) {
    await loadSwiper();
    return new Swiper(selector, options);
} 