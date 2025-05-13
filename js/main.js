import { loadGalleryData } from './data.js';

async function initializeMainPage() {
    try {
        const galleryItems = await loadGalleryData();
        if (!galleryItems || !galleryItems.items || !Array.isArray(galleryItems.items) || galleryItems.items.length === 0) {
            console.error('Invalid gallery data structure or empty items');
            return;
        }
        
        // 스와이퍼 슬라이드 생성
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        const sideNav = document.querySelector('.side-nav ul');
        
        swiperWrapper.innerHTML = galleryItems.items.map(item => `
            <div class="swiper-slide" data-title="${item.title}" data-id="${item.id}">
                <img src="${item.imageUrl}" alt="${item.title}">
            </div>
        `).join('');
        
        sideNav.innerHTML = galleryItems.items.map((item, index) => `
            <li ${index === 0 ? 'class="active"' : ''} data-id="${item.id}">
                <span class="number">${index + 1}</span>
                <span class="title">${item.title}</span>
            </li>
        `).join('');
        
        // Swiper 초기화
        const swiper = new Swiper('.swiper', {
            direction: 'vertical',
            mousewheel: {
                sensitivity: 1.5,
                thresholdDelta: 10,
                thresholdTime: 100
            },
            speed: 1000,
            effect: 'fade',
            preventClicks: false,
            slideToClickedSlide: false,
            fadeEffect: {
                crossFade: true
            },
            on: {
                slideChange: function () {
                    updateSideNav(this.activeIndex);
                }
            }
        });

        // 이미지 클릭 이벤트
        document.querySelectorAll('.swiper-slide img').forEach((img) => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const slide = img.closest('.swiper-slide');
                const itemId = slide.dataset.id;
                const itemTitle = slide.dataset.title;
                console.log('Clicked item data:', {
                    id: itemId,
                    title: itemTitle,
                    dataset: slide.dataset
                });
                if (itemId) {
                    // 현재 활성화된 슬라이드의 실제 인덱스를 사용
                    const activeIndex = swiper.activeIndex;
                    const activeItem = galleryItems.items[activeIndex];
                    console.log('Active slide data:', {
                        index: activeIndex,
                        item: activeItem
                    });
                    window.location.href = `detail.html?index=${activeItem.id}`;
                } else {
                    console.error('Item ID not found');
                }
            });
        });

        // 사이드 네비게이션 클릭 이벤트
        document.querySelectorAll('.side-nav li').forEach((item, index) => {
            item.addEventListener('click', () => {
                swiper.slideTo(index);
            });
        });
    } catch (error) {
        console.error('Error initializing main page:', error);
    }
}

function updateSideNav(index) {
    const sideNavItems = document.querySelectorAll('.side-nav li');
    sideNavItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 상세 페이지 표시 함수
function showDetailPage(projectData) {
    const detailPage = document.querySelector('.detail-page');
    const detailSwiper = detailPage.querySelector('.swiper-wrapper');
    
    // 상세 페이지 스와이퍼 초기화
    detailSwiper.innerHTML = projectData.images.map(img => `
        <div class="swiper-slide">
            <img src="${img}" alt="${projectData.title}">
        </div>
    `).join('');
    
    // 상세 정보 업데이트
    document.querySelector('.detail-title').textContent = projectData.title;
    document.querySelector('.detail-description').textContent = projectData.description;
    
    // 상세 페이지 표시
    detailPage.style.display = 'flex';
    
    // 상세 페이지 스와이퍼 초기화
    new Swiper('.detail-swiper', {
        slidesPerView: 1,
        spaceBetween: 0,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });
}

// 프로젝트 데이터 가져오기 함수
function getProjectData(index) {
    // 여기에 프로젝트 데이터를 반환하는 로직 추가
    const projects = [
        {
            title: "Project 1",
            description: "Description for Project 1",
            images: ["path/to/image1.jpg", "path/to/image2.jpg"]
        },
        // ... 더 많은 프로젝트 데이터
    ];
    return projects[index];
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeMainPage);