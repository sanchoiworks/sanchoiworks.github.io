import { loadCategoriesData, loadMainData, loadProjectsData } from './data.js';
import { createSwiper } from './swiper-loader.js';

let swiper = null;
let projectItem = null;

async function initializeDetailPage() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');
        const id = urlParams.get('id');
        const source = urlParams.get('source');

        console.log('Detail page params:', { title, id, source });

        let project = null;

        // source에 따라 다른 API를 사용하여 데이터 로드
        if (source === 'main') {
            const mainData = await loadMainData();
            project = mainData.find(item => item.id === parseInt(id) || item.projectID === parseInt(id));
        } else {
            // list 페이지에서 온 경우
            const projects = await loadProjectsData();
            console.log('Loaded projects:', projects);
            project = projects.find(p => p.id === parseInt(id) || p.projectID === parseInt(id));
        }

        if (!project) {
            console.error('Project item not found');
            return;
        }

        projectItem = project; // 전역 변수에 저장
        console.log('Found project item:', project);

        // 섹션 데이터
        const sections = project.sections || [];
        if (sections.length === 0) {
            console.error('No sections found in project item');
            return;
        }

        // swiper 초기화 (이미지 프리로드 및 슬라이드 생성 포함)
        await initializeSwiper(sections);

        // 섹션 탭 생성
        createSectionTabs(sections);

        // 팝업 텍스트 설정
        if (project.popupText) {
            setupPopupText(project.popupText);
        }

        // 프로젝트 제목 설정
        const imageTitle = document.querySelector('.image-title');
        if (imageTitle) {
            imageTitle.textContent = project.title || project.name || '';
        }

    } catch (error) {
        console.error('Error initializing detail page:', error);
    }
}

async function initializeSwiper(sections) {
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    swiperWrapper.innerHTML = '';

    // 모든 이미지 주소를 배열로 수집
    const allImages = sections.flatMap(section => section.images || []);
    console.log('All images to be loaded:', allImages);

    // 현재 섹션의 이미지만 먼저 프리로드
    const currentSectionImages = sections[0]?.images || [];
    await Promise.all(currentSectionImages.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
                console.error('Failed to load image:', src);
                resolve();
            };
            img.src = src;
        });
    }));

    // 슬라이드 DOM 생성
    allImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        const img = document.createElement('img');
        img.src = image;
        img.alt = `Slide ${index + 1}`;
        img.loading = 'lazy';
        img.decoding = 'async';

        slide.appendChild(img);
        swiperWrapper.appendChild(slide);
    });

    // 나머지 이미지들은 백그라운드에서 점진적으로 로드
    const remainingImages = allImages.slice(currentSectionImages.length);
    remainingImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // 총 슬라이드 수 (원본 개수)
    const totalSlides = allImages.length;

    // Swiper 초기화
    swiper = await createSwiper('.detail-swiper', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        speed: 400,
        preloadImages: false,
        lazy: {
            loadPrevNext: true,
            loadPrevNextAmount: 2
        },
        watchSlidesProgress: true,
        on: {
            init: function() {
                requestAnimationFrame(() => {
                    updateSlideCounter(totalSlides);
                    updateActiveTab(getCurrentSectionIndex());
                });
            },
            slideChange: function() {
                updateSlideCounter(totalSlides);
                updateActiveTab(getCurrentSectionIndex());
            }
        }
    });

    // 좌우 클릭 영역 이벤트 바인딩
    const clickPrev = document.querySelector('.click-prev');
    const clickNext = document.querySelector('.click-next');

    if (clickPrev) clickPrev.addEventListener('click', () => swiper.slidePrev());
    if (clickNext) clickNext.addEventListener('click', () => swiper.slideNext());
}

// 현재 슬라이드가 속한 섹션 인덱스 계산 (realIndex 기준)
function getCurrentSectionIndex() {
    if (!swiper || !projectItem || !projectItem.sections) return 0;

    const currentIndex = swiper.realIndex;
    let totalImages = 0;

    for (let i = 0; i < projectItem.sections.length; i++) {
        const section = projectItem.sections[i];
        if (!section.images) continue;

        const sectionImageCount = section.images.length;

        if (currentIndex < totalImages + sectionImageCount) {
            return i;
        }
        totalImages += sectionImageCount;
    }

    return 0;
}

// 특정 섹션 시작 슬라이드 index 계산 (전체 슬라이드 중에서)
function getStartIndexForSection(sections, sectionIndex) {
    let index = 0;
    for (let i = 0; i < sectionIndex; i++) {
        if (!sections[i].images) continue;
        index += sections[i].images.length;
    }
    return index;
}

function createSectionTabs(sections) {
    const tabsContainer = document.querySelector('.date-tabs');
    tabsContainer.innerHTML = '';
    if (sections.length < 2) {
        tabsContainer.style.display = 'none';
        return;
    } else {
        tabsContainer.style.display = 'flex';
    }
    sections.forEach((section, index) => {
        const tab = document.createElement('button');
        tab.className = 'date-tab';
        tab.textContent = section.sectionTitle;
        tab.addEventListener('click', () => {
            const startIndex = getStartIndexForSection(sections, index);
            swiper.slideToLoop(startIndex); // loop 모드에 맞는 슬라이드 이동 함수 사용
        });
        tabsContainer.appendChild(tab);
    });
    updateActiveTab(0);
}

function updateActiveTab(sectionIndex) {
    document.querySelectorAll('.date-tab').forEach((tab, index) => {
        tab.classList.toggle('active', index === sectionIndex);
    });
}

// 슬라이드 카운터 업데이트
function updateSlideCounter(totalSlides) {
    const current = document.querySelector('.slide-counter .current');
    const total = document.querySelector('.slide-counter .total');
    const imageTitle = document.querySelector('.image-title');

    // 요소가 없으면 100ms 뒤 재시도
    if (!current || !total || !imageTitle) {
        setTimeout(() => updateSlideCounter(totalSlides), 100);
        return;
    }

    if (!swiper || !swiper.initialized) return;

    let realIndex = swiper.realIndex;
    if (realIndex < 0) realIndex = 0;

    current.textContent = realIndex + 1;
    total.textContent = totalSlides;

    imageTitle.textContent = projectItem ? projectItem.title : '';

    // 디버깅 로그
    console.log(`Slide counter updated: current = ${realIndex + 1}, total = ${totalSlides}`);
}

function setupPopupText(text) {
    if (!text) return;

    const modal = document.createElement('div');
    modal.id = 'detail-text-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">Close</span>
            <div class="modal-text"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalText = modal.querySelector('.modal-text');
    const closeBtn = modal.querySelector('.close-modal');
    const imageTitle = document.querySelector('.image-title');

    modalText.innerHTML = text;

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    if (imageTitle) {
        imageTitle.style.cursor = 'pointer';
        imageTitle.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeDetailPage();
});
