import { loadMainData } from './data.js';

async function initializeMainPage() {
  try {
    const items = await loadMainData();
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Invalid main data structure or empty items');
      return;
    }

    console.log('Loaded main items:', items);

    // 스와이퍼 슬라이드 생성
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    const sideNav = document.querySelector('.side-nav ul');

    swiperWrapper.innerHTML = items
      .map(
        item => `
            <div class="swiper-slide" data-title="${item.title}" data-id="${item.projectID}">
                 <img src="${item.mainImage}" alt="${item.title}" onerror="this.src='https://placehold.co/400x300?text=No+Image'" style="cursor: pointer;">
            </div>
        `
      )
      .join('');

    sideNav.innerHTML = items
      .map(
        (item, index) => `
            <li ${index === 0 ? 'class="active"' : ''} data-id="${item.projectID}">
                <span class="number">${index + 1}</span>
                <span class="title">${item.title}</span>
            </li>
        `
      )
      .join('');

    // Swiper 초기화
    const swiper = new Swiper('.swiper', {
      direction: 'vertical',
      mousewheel: {
        sensitivity: 1.5,
        thresholdDelta: 10,
        thresholdTime: 100,
      },
      speed: 1000,
      effect: 'fade',
      preventClicks: false,
      slideToClickedSlide: false,
      loop: true,
      loopAdditionalSlides: 1,
      watchSlidesProgress: true,
      fadeEffect: {
        crossFade: true,
      },
      on: {
        slideChange: function () {
          const realIndex = this.realIndex;
          updateSideNav(realIndex);
        },
        init: function() {
          updateSideNav(0);
        }
      },
    });

    // 이미지 클릭 이벤트
    document.querySelectorAll('.swiper-slide img').forEach(img => {
      img.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const slide = img.closest('.swiper-slide');
        const itemTitle = slide.dataset.title;
        if (itemTitle) {
          const realIndex = swiper.realIndex;
          const activeItem = items[realIndex];
          window.location.href = `detail.html?id=${activeItem.id || activeItem.projectID}&source=main`;
        } else {
          console.error('Item title not found');
        }
      });
    });

    // 사이드 네비게이션 클릭 이벤트
    document.querySelectorAll('.side-nav li').forEach((item, index) => {
      item.addEventListener('click', () => {
        swiper.slideToLoop(index);
      });
    });
  } catch (error) {
    console.error('Error initializing main page:', error);
  }
}

// 사이드 네비게이션 업데이트 함수
function updateSideNav(index) {
  document.querySelectorAll('.side-nav li').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
}

// 상세 페이지 표시 함수
function showDetailPage(projectData) {
  const detailPage = document.querySelector('.detail-page');
  const detailSwiper = detailPage.querySelector('.swiper-wrapper');

  // 상세 페이지 스와이퍼 초기화
  detailSwiper.innerHTML = projectData.sections
    .flatMap(section => section.images)
    .map(
      img => `
        <div class="swiper-slide">
            <img src="${img}" alt="${projectData.title}">
        </div>
    `
    )
    .join('');

  // 상세 정보 업데이트
  document.querySelector('.detail-title').textContent = projectData.title;
  if (projectData.popupText) {
    document.querySelector('.detail-description').innerHTML = projectData.popupText;
  }

  // 상세 페이지 표시
  detailPage.style.display = 'flex';

  // 상세 페이지 스와이퍼 초기화
  new Swiper('.detail-swiper', {
    slidesPerView: 1,
    spaceBetween: 0,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
}

// 프로젝트 데이터 가져오기 함수
function getProjectData(index) {
  // 여기에 프로젝트 데이터를 반환하는 로직 추가
  const projects = [
    {
      title: 'Project 1',
      description: 'Description for Project 1',
      images: ['path/to/image1.jpg', 'path/to/image2.jpg'],
    },
    // ... 더 많은 프로젝트 데이터
  ];
  return projects[index];
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeMainPage);
