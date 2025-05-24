import { loadCategoriesData } from './data.js';

let categories = [];
let currentCategoryIndex = 0;
let isScrolling = false;
let scrollTimeout;

async function loadCategories() {
  try {
    console.log('Loading categories...');
    categories = await loadCategoriesData();
    console.log('Loaded categories:', categories);

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      console.error('Invalid categories data structure or empty categories');
      showAllCategory();
      return;
    }

    // 각 카테고리의 데이터 구조 확인 및 정리
    categories = categories.map(category => {
      if (!category.data) {
        // data 속성이 없는 경우 현재 카테고리를 data로 설정
        return {
          ...category,
          data: [category]
        };
      }
      return category;
    });

    setupCategoryMenu();
    setupWheelEvent();

    // URL 파라미터에서 카테고리 ID 확인
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category');

    if (categoryId) {
      // space 카테고리인 경우 특별 처리
      if (categoryId.toLowerCase() === 'space') {
        const spaceCategory = categories.find(cat => cat.categoryId.toLowerCase() === 'space');
        if (spaceCategory) {
          // Works 하위 카테고리 열기
          const subcategoriesList = document.querySelector('.category-menu ul');
          if (subcategoriesList) {
            subcategoriesList.classList.remove('collapsed');
          }

          // 메뉴 상태 업데이트
          document.querySelectorAll('.category h2').forEach(h => {
            h.classList.remove('active');
            h.style.color = '#999';
          });
          document.querySelectorAll('.category-menu li').forEach(li => {
            li.style.color = '#999';
          });

          const worksHeading = document.querySelector('.category:nth-child(2) h2');
          if (worksHeading) {
            worksHeading.classList.add('active');
            worksHeading.style.color = '#000';
          }

          const spaceItem = document.querySelector('.category-menu li:first-child');
          if (spaceItem) {
            spaceItem.style.color = '#000';
          }

          // 컨텐츠 업데이트
          updateItemsList(spaceCategory);
          updateGrid(spaceCategory);
          currentCategoryIndex = 0;

          // 전환 효과 적용
          const gridContainer = document.querySelector('.grid-container');
          if (gridContainer) {
            setTimeout(() => {
              gridContainer.classList.add('active');
            }, 100);
          }
          return;
        }
      }

      // 다른 카테고리 처리
      const categoryIndex = categories.findIndex(cat => cat.categoryId.toLowerCase() === categoryId.toLowerCase());
      if (categoryIndex !== -1) {
        await changeCategory(categoryIndex);
      } else {
        showAllCategory();
      }
    } else {
      showAllCategory();
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    showAllCategory();
  }
  // 반드시 마지막에 한 번만!
  wrapListForMobile();
}

function setupCategoryMenu() {
  const categoryMenu = document.querySelector('.category-menu');
  categoryMenu.innerHTML = '';

  // All 카테고리 생성
  const allCategory = document.createElement('div');
  allCategory.className = 'category';

  const allHeading = document.createElement('h2');
  allHeading.textContent = 'All';
  allHeading.style.color = '#000';
  allHeading.classList.add('active');
  allHeading.style.cursor = 'pointer';
  allCategory.appendChild(allHeading);

  // All 클릭 이벤트 추가
  allHeading.addEventListener('click', () => {
    showAllCategory();
  });

  categoryMenu.appendChild(allCategory);

  // Works 카테고리 생성
  const worksCategory = document.createElement('div');
  worksCategory.className = 'category';

  const worksHeading = document.createElement('h2');
  worksHeading.textContent = 'Works';
  worksHeading.style.color = '#999';
  worksCategory.appendChild(worksHeading);

  // Works 클릭 이벤트 추가
  worksHeading.addEventListener('click', () => {
    const spaceCategory = categories.find(cat => cat.categoryId.toLowerCase() === 'space');
    if (spaceCategory) {
      // Works 하위 카테고리 열기
      const subcategoriesList = document.querySelector('.category-menu ul');
      subcategoriesList.classList.remove('collapsed');

      document.querySelectorAll('.category h2').forEach(h => {
        h.classList.remove('active');
        h.style.color = '#999';
      });
      document.querySelectorAll('.category-menu li').forEach(li => {
        li.style.color = '#999';
      });
      subcategoriesList.firstChild.style.color = '#000';
      worksHeading.classList.add('active');
      worksHeading.style.color = '#000';
      updateItemsList(spaceCategory);
      updateGrid(spaceCategory);
      changeCategory(0);
    }
  });

  // Works 하위 카테고리 생성
  const subcategories = [
    { categoryId: 'space' },
    { categoryId: 'brand' },
    { categoryId: 'object' },
    { categoryId: 'figure' }
  ];
  const subcategoriesList = document.createElement('ul');
  subcategoriesList.style.paddingLeft = '20px';
  subcategoriesList.classList.add('active');

  subcategories.forEach((sub, index) => {
    const subcategory = document.createElement('li');
    // ID를 대소문자로 변환하여 표시 이름으로 사용
    subcategory.textContent = sub.categoryId.charAt(0).toUpperCase() + sub.categoryId.slice(1);
    subcategory.style.color = '#999';
    subcategory.style.marginBottom = '4px';
    subcategory.style.cursor = 'pointer';

    subcategory.addEventListener('click', () => {
      document.querySelectorAll('.category-menu li').forEach(li => {
        li.style.transition = 'none';
        li.style.color = '#999';
        li.style.transition = '';
      });
      document.querySelectorAll('.category h2').forEach(h => {
        h.classList.remove('active');
        h.style.transition = 'none';
        h.style.color = '#999';
        h.style.transition = '';
      });
      subcategory.style.transition = 'none';
      subcategory.style.color = '#000';
      subcategory.style.transition = '';
      worksHeading.classList.add('active');
      worksHeading.style.transition = 'none';
      worksHeading.style.color = '#000';
      worksHeading.style.transition = '';

      const category = categories.find(cat => cat.categoryId.toLowerCase() === sub.categoryId.toLowerCase());
      if (category) {
        updateItemsList(category);
        updateGrid(category);
        changeCategory(index);
      }
    });

    subcategoriesList.appendChild(subcategory);
  });

  worksCategory.appendChild(subcategoriesList);
  categoryMenu.appendChild(worksCategory);

  // 나머지 카테고리 추가
  const otherCategories = [
    { categoryId: 'personal' },
    { categoryId: 'exhibitions' },
    { categoryId: 'a letter from' },
    { categoryId: 'frames' }
  ];

  otherCategories.forEach((cat, index) => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category';

    const heading = document.createElement('h2');
    // ID를 대소문자로 변환하여 표시 이름으로 사용
    heading.textContent =
      cat.categoryId === 'a letter from' ? 'A letter from' : cat.categoryId.charAt(0).toUpperCase() + cat.categoryId.slice(1);
    heading.style.color = '#999';
    heading.style.cursor = 'pointer';

    heading.addEventListener('click', () => {
      // Works 하위 카테고리 닫기
      const subcategoriesList = document.querySelector('.category-menu ul');
      subcategoriesList.classList.add('collapsed');

      document.querySelectorAll('.category h2').forEach(h => {
        h.classList.remove('active');
        h.style.transition = 'none';
        h.style.color = '#999';
        h.style.transition = '';
      });
      document.querySelectorAll('.category-menu li').forEach(li => {
        li.style.transition = 'none';
        li.style.color = '#999';
        li.style.transition = '';
      });
      heading.classList.add('active');
      heading.style.transition = 'none';
      heading.style.color = '#000';
      heading.style.transition = '';

      const category = categories.find(c => c.categoryId.toLowerCase() === cat.categoryId.toLowerCase());
      if (category) {
        updateItemsList(category);
        updateGrid(category);
        changeCategory(index + subcategories.length);
      }
    });

    categoryElement.appendChild(heading);
    categoryMenu.appendChild(categoryElement);
  });
}

function setupWheelEvent() {
  // Disable vertical swiper functionality on list page
  document.addEventListener(
    'wheel',
    e => {
      // 이미지 그리드 내부에서 스크롤 중인지 확인
      const gridContainer = document.querySelector('.grid-container');
      const isScrollingGrid = e.target.closest('.grid-container');

      // 이미지 그리드 내부 스크롤이면 여기서 종료
      if (isScrollingGrid) return;

      // Space 카테고리에서 위로 스크롤할 때 All로 전환
      if (currentCategoryIndex === 0 && e.deltaY < 0) {
        const st = isScrollingGrid ? gridContainer.scrollTop : 0;
        if (st === 0) {
          e.preventDefault();
          showAllCategory();
          // URL 파라미터 업데이트
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.set('category', 'all');
          const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
          window.history.pushState({}, '', newUrl);
          return;
        }
      }
    },
    { passive: false }
  );
}

async function changeCategory(index) {
  if (index === currentCategoryIndex) return;

  // 현재 그리드 컨테이너에 전환 효과 적용
  const gridContainer = document.querySelector('.grid-container');
  if (!gridContainer) return;
  
  gridContainer.classList.remove('active');

  // 전환 효과가 끝난 후 카테고리 변경
  return new Promise(resolve => {
    setTimeout(() => {
      currentCategoryIndex = index;

      const subcategories = ['space', 'brand', 'object', 'figure'];
      const otherCategories = ['personal', 'exhibitions', 'a letter from', 'frames'];

      // Works 하위 카테고리 요소 가져오기
      const subcategoriesList = document.querySelector('.category-menu ul');
      const worksHeading = document.querySelector('.category:nth-child(2) h2');
      const allHeading = document.querySelector('.category:nth-child(1) h2');

      if (!subcategoriesList || !worksHeading || !allHeading) {
        console.error('Required DOM elements not found');
        resolve();
        return;
      }

      // Personal 이후 카테고리로 넘어갈 때
      if (index >= subcategories.length) {
        // Works 하위 카테고리 닫기
        subcategoriesList.classList.add('collapsed');

        document.querySelectorAll('.category-menu li').forEach(li => {
          li.style.color = '#999';
        });
        document.querySelectorAll('.category h2').forEach(h => {
          h.classList.remove('active');
          h.style.color = '#999';
        });

        // 현재 카테고리의 헤딩 찾아서 활성화
        const currentOtherCategory = otherCategories[index - subcategories.length];
        const currentHeading = Array.from(document.querySelectorAll('.category h2')).find(
          h =>
            h.textContent ===
            (currentOtherCategory === 'a letter from'
              ? 'A letter from'
              : currentOtherCategory.charAt(0).toUpperCase() + currentOtherCategory.slice(1))
        );

        if (currentHeading) {
          currentHeading.classList.add('active');
          currentHeading.style.color = '#000';
        }

        // 현재 카테고리 데이터 업데이트
        const currentCategory = categories.find(cat => cat.categoryId.toLowerCase() === currentOtherCategory.toLowerCase());
        if (currentCategory) {
          updateItemsList(currentCategory);
          updateGrid(currentCategory);
        }
      } else {
        // Works 하위 카테고리 열기
        subcategoriesList.classList.remove('collapsed');

        // Works 하위 카테고리 활성화
        document.querySelectorAll('.category-menu li').forEach((li, i) => {
          li.style.color = i === index ? '#000' : '#999';
        });
        document.querySelectorAll('.category h2').forEach(h => {
          h.classList.remove('active');
          h.style.color = '#999';
        });
        worksHeading.classList.add('active');
        worksHeading.style.color = '#000';

        // 현재 카테고리 데이터 업데이트
        const currentCategoryId = subcategories[index];
        const category = categories.find(cat => cat.categoryId.toLowerCase() === currentCategoryId.toLowerCase());
        if (category) {
          updateItemsList(category);
          updateGrid(category);
        }
      }

      // URL 파라미터 업데이트
      const urlParams = new URLSearchParams(window.location.search);
      const categoryId =
        index >= subcategories.length
          ? otherCategories[index - subcategories.length]
          : subcategories[index];
      urlParams.set('category', categoryId);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.pushState({}, '', newUrl);

      // 전환 효과 다시 적용
      setTimeout(() => {
        gridContainer.classList.add('active');
        resolve();
      }, 40);
    }, 300);
  });
}

// All 카테고리 표시 함수
function showAllCategory() {
  // Works 하위 카테고리 닫기
  const subcategoriesList = document.querySelector('.category-menu ul');
  if (subcategoriesList) {
    subcategoriesList.classList.add('collapsed');
  }

  document.querySelectorAll('.category h2').forEach(h => {
    h.classList.remove('active');
    h.style.color = '#999';
  });
  document.querySelectorAll('.category-menu li').forEach(li => {
    li.style.color = '#999';
  });

  const allHeading = document.querySelector('.category:first-child h2');
  if (allHeading) {
    allHeading.classList.add('active');
    allHeading.style.color = '#000';
  }

  // 모든 프로젝트 아이템 수집
  const allItems = [];
  categories.forEach(category => {
    if (category.data && Array.isArray(category.data)) {
      allItems.push(...category.data);
    }
  });

  // 모든 프로젝트 표시
  updateItemsList(allItems);
  updateGrid(allItems);

  // currentCategoryIndex 업데이트
  currentCategoryIndex = -1;

  // URL 파라미터 업데이트
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('category', 'all');
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.pushState({}, '', newUrl);

  // 그리드 컨테이너 전환 효과
  const gridContainer = document.querySelector('.grid-container');
  if (gridContainer) {
    gridContainer.classList.remove('active');
    setTimeout(() => {
      gridContainer.classList.add('active');
    }, 50);
  }
}

async function updateItemsList(category) {
  const itemsList = document.querySelector('.items-list');
  itemsList.innerHTML = '';

  if (!category) return;

  const ul = document.createElement('ul');
  // category가 배열인 경우 (All 카테고리)
  const items = Array.isArray(category) ? category : (category.data || [category]);
  
  items.forEach(item => {
    console.log('Creating list item:', item);
    console.log('Item sections:', item.sections);
    console.log('Item images:', item.images);
    
    const li = document.createElement('li');
    // name 속성을 사용하도록 수정
    li.textContent = item.name || item.title || 'Untitled';
    li.addEventListener('click', () => {
      document.querySelectorAll('.items-list li').forEach(l => l.classList.remove('active'));
      li.classList.add('active');

      // 그리드에 상세 이미지들 표시
      const gridContainer = document.querySelector('.grid-container');
      gridContainer.innerHTML = '';

      // 프로젝트의 모든 이미지를 표시
      if (item.sections && Array.isArray(item.sections)) {
        console.log('Processing sections:', item.sections);
        // sections 배열인 경우
        item.sections.forEach((section, sectionIndex) => {
          console.log(`Processing section ${sectionIndex}:`, section);
          if (section.images && Array.isArray(section.images)) {
            console.log(`Section ${sectionIndex} images:`, section.images);
            section.images.forEach(imageUrl => {
              const gridItem = document.createElement('div');
              gridItem.className = 'grid-item';
              gridItem.innerHTML = `
                <img src="${imageUrl}" alt="${item.name || item.title || 'Untitled'}">
                <div class="title">${item.name || item.title || 'Untitled'}</div>
              `;
              
              // 이미지 클릭 시 상세 페이지로 이동
              gridItem.addEventListener('click', () => {
                console.log('Grid item clicked:', item);
                const itemName = item.name || item.title;
                if (!itemName) {
                  console.error('Item has no name or title:', item);
                  return;
                }
                window.location.href = `detail.html?title=${encodeURIComponent(itemName)}&source=list`;
              });
              
              gridContainer.appendChild(gridItem);
            });
          }
        });
      } else if (item.images && Array.isArray(item.images)) {
        // 단일 이미지 배열인 경우
        item.images.forEach(imageUrl => {
          const gridItem = document.createElement('div');
          gridItem.className = 'grid-item';
          gridItem.innerHTML = `
            <img src="${imageUrl}" alt="${item.name || item.title || 'Untitled'}">
            <div class="title">${item.name || item.title || 'Untitled'}</div>
          `;
          
          // 이미지 클릭 시 상세 페이지로 이동
          gridItem.addEventListener('click', () => {
            console.log('Grid item clicked:', item);
            const itemName = item.name || item.title;
            if (!itemName) {
              console.error('Item has no name or title:', item);
              return;
            }
            window.location.href = `detail.html?title=${encodeURIComponent(itemName)}&source=list`;
          });
          
          gridContainer.appendChild(gridItem);
        });
      } else {
        // 이미지가 없는 경우 메인 이미지 표시
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        const imagePath = item.mainImage || 'images/1.jpg';
        gridItem.innerHTML = `
          <img src="${imagePath}" alt="${item.name || item.title || 'Untitled'}">
          <div class="title">${item.name || item.title || 'Untitled'}</div>
        `;
        
        // 이미지 클릭 시 상세 페이지로 이동
        gridItem.addEventListener('click', () => {
          console.log('Grid item clicked:', item);
          const itemName = item.name || item.title;
          if (!itemName) {
            console.error('Item has no name or title:', item);
            return;
          }
          window.location.href = `detail.html?title=${encodeURIComponent(itemName)}&source=list`;
        });
        
        gridContainer.appendChild(gridItem);
      }
    });
    ul.appendChild(li);
  });
  itemsList.appendChild(ul);
}

function updateGrid(items) {
  const gridContainer = document.querySelector('.grid-container');
  if (!gridContainer) {
    console.error('Grid container not found');
    return;
  }

  gridContainer.innerHTML = '';

  if (!items) {
    console.error('No items provided to updateGrid');
    return;
  }

  // items가 배열이 아닌 경우 배열로 변환
  const itemsArray = Array.isArray(items) ? items : [items];

  itemsArray.forEach(item => {
    console.log('Creating grid item:', item);
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';

    const img = document.createElement('img');
    // 이미지 경로 수정
    const imagePath = item.mainImage ? item.mainImage : 'images/1.jpg';
    img.src = imagePath;
    img.alt = item.name || '';
    
    // 이미지 로드 에러 처리
    img.onerror = () => {
      console.error('Failed to load image:', imagePath);
      img.src = 'images/1.jpg'; // 기본 이미지로 대체
    };

    gridItem.appendChild(img);
    gridItem.addEventListener('click', () => {
      console.log('Grid item clicked:', item);
      if (!item.name) {
        console.error('Item has no name:', item);
        return;
      }
      window.location.href = `detail.html?title=${encodeURIComponent(item.name)}&source=list`;
    });

    gridContainer.appendChild(gridItem);
  });
}

function navigateToDetail(item) {
  console.log('Navigating to detail with item:', item);
  if (!item.name) {
    console.error('Item has no name:', item);
    return;
  }
  window.location.href = `detail.html?title=${encodeURIComponent(item.name)}&source=list`;
}

// 스크롤 이벤트 핸들러 추가
document.addEventListener('DOMContentLoaded', () => {
  let lastScrollTop = 0;
  const container = document.querySelector('.grid-container');

  if (container) {
    container.addEventListener('scroll', e => {
      const st = e.target.scrollTop;

      // Space 카테고리에서 위로 스크롤할 때 All로 전환
      if (st < lastScrollTop && st === 0 && currentCategoryIndex === 0) {
        showAllCategory();
      }

      lastScrollTop = st;
    });
  }
});

function wrapListForMobile() {
  const container = document.querySelector('.list-page .container');
  const categoryMenu = document.querySelector('.category-menu');
  const itemsList = document.querySelector('.items-list');
  const listDiv = document.querySelector('.list');

  if (window.innerWidth <= 768) {
    // 모바일: .list로 감싸기
    if (container && categoryMenu && itemsList && !listDiv) {
      const newListDiv = document.createElement('div');
      newListDiv.className = 'list';
      container.insertBefore(newListDiv, container.firstChild);
      newListDiv.appendChild(categoryMenu);
      newListDiv.appendChild(itemsList);
    }
  } else {
    // 데스크탑: .list 해제하고 원래대로 복구
    if (container && listDiv && categoryMenu && itemsList) {
      container.insertBefore(categoryMenu, listDiv);
      container.insertBefore(itemsList, listDiv);
      listDiv.remove();
    }
  }
}

window.addEventListener('resize', wrapListForMobile);

// DOMContentLoaded에서 loadCategories 후 wrapListForMobile 호출
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
});
