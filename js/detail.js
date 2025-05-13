import { loadGalleryData, loadCategoriesData } from './data.js';

let galleryItems = [];
let categories = [];

async function initializeDetailPage() {
    try {
        // URL 파라미터에서 ID 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const param = urlParams.get('index');
        console.log('URL Parameters:', {
            fullUrl: window.location.href,
            search: window.location.search,
            param: param,
            paramType: typeof param
        });
        
        // 데이터 로드
        galleryItems = await loadGalleryData();
        categories = await loadCategoriesData();
        
        console.log('Loaded data:', {
            galleryItems: galleryItems,
            categories: categories,
            galleryItemsLength: galleryItems?.items?.length,
            categoriesLength: categories?.length
        });
        
        if (!galleryItems || !galleryItems.items || !Array.isArray(galleryItems.items) || galleryItems.items.length === 0) {
            console.error('Invalid gallery data structure or empty items');
            return;
        }
        
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            console.error('Invalid categories data structure or empty categories');
            return;
        }
        
        // 프로젝트 아이템 찾기
        let projectItem = null;
        
        // ID로 검색 (문자열 또는 숫자)
        if (param) {
            console.log('Searching for item with ID:', param);
            
            // gallery.json에서 검색
            projectItem = galleryItems.items.find(item => {
                console.log('Checking item:', item);
                // 숫자 ID인 경우
                if (typeof item.id === 'number') {
                    const match = item.id.toString() === param;
                    console.log('Numeric ID match:', match);
                    return match;
                }
                // 문자열 ID인 경우
                const match = item.id === param;
                console.log('String ID match:', match);
                return match;
            });
            
            console.log('Found in gallery:', projectItem);
            
            // gallery.json에서 찾지 못한 경우 categories.json에서 검색
            if (!projectItem) {
                console.log('Searching in categories...');
                for (const category of categories) {
                    if (category.items && Array.isArray(category.items)) {
                        const foundItem = category.items.find(item => {
                            console.log('Checking category item:', item);
                            // 숫자 ID인 경우
                            if (typeof item.id === 'number') {
                                const match = item.id.toString() === param;
                                console.log('Numeric ID match:', match);
                                return match;
                            }
                            // 문자열 ID인 경우
                            const match = item.id === param;
                            console.log('String ID match:', match);
                            return match;
                        });
                        if (foundItem) {
                            projectItem = foundItem;
                            console.log('Found in categories:', projectItem);
                            break;
                        }
                    }
                }
            }
        }
        
        if (!projectItem) {
            console.error('Project item not found for parameter:', param);
            return;
        }
        
        // 스와이퍼 슬라이드 생성
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (!projectItem.detailImages || !Array.isArray(projectItem.detailImages)) {
            console.error('No detail images found for project:', projectItem.title);
            return;
        }
        
        swiperWrapper.innerHTML = projectItem.detailImages.map(image => {
            if (image.text && !image.imageUrl) {
                return `
                    <div class="swiper-slide text-only">
                        <div class="slide-text-content">${image.text}</div>
                    </div>
                `;
            }
            return `
                <div class="swiper-slide">
                    <img src="${image.imageUrl}" alt="${projectItem.title}">
                    ${image.text ? `<div class="slide-text">${image.text}</div>` : ''}
                </div>
            `;
        }).join('');
        
        // Swiper 초기화
        const swiper = new Swiper('.detail-swiper', {
            direction: 'horizontal',
            mousewheel: {
                sensitivity: 1.5,
                thresholdDelta: 10,
                thresholdTime: 100
            },
            speed: 400,
            effect: 'fade',
            preventClicks: false,
            slideToClickedSlide: false,
            fadeEffect: {
                crossFade: true
            },
            on: {
                slideChange: function () {
                    updateInfo(this.activeIndex, projectItem);
                }
            }
        });
        
        // 초기 정보 업데이트
        updateInfo(0, projectItem);
        
        // 클릭 이벤트
        document.querySelector('.click-prev').addEventListener('click', () => {
            swiper.slidePrev();
        });
        
        document.querySelector('.click-next').addEventListener('click', () => {
            swiper.slideNext();
        });
        
    } catch (error) {
        console.error('Error initializing detail page:', error);
    }
}

function updateInfo(slideIndex, itemData) {
    const current = document.querySelector('.current');
    const total = document.querySelector('.total');
    const imageTitle = document.querySelector('.image-title');
    
    if (current && total && imageTitle) {
        current.textContent = slideIndex + 1;
        total.textContent = itemData.detailImages.length;
        imageTitle.textContent = itemData.title;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeDetailPage);