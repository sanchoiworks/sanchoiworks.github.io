import { loadCategoriesData } from './data.js';

let categories = [];
let currentCategoryIndex = 0;
let isScrolling = false;
let scrollTimeout;

async function loadCategories() {
    try {
        categories = await loadCategoriesData();
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
            console.error('Invalid categories data structure or empty categories');
            return;
        }
        
        setupCategoryMenu();
        
        // URL 파라미터에서 카테고리 ID 확인
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        
        if (categoryId) {
            // 카테고리 ID에 해당하는 카테고리 찾기
            const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
            if (categoryIndex !== -1) {
                // 해당 카테고리로 이동
                changeCategory(categoryIndex);
            } else {
                // 초기 All 카테고리 선택
                showAllCategory();
            }
        } else {
            // 초기 All 카테고리 선택
            showAllCategory();
        }
        
        setupWheelEvent();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
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
        const spaceCategory = categories.find(cat => cat.id === 'space');
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
            updateGrid(spaceCategory.items);
            changeCategory(0);
        }
    });
    
    // Works 하위 카테고리 생성
    const subcategories = [
        { id: 'space' },
        { id: 'brand' },
        { id: 'object' },
        { id: 'figure' }
    ];
    const subcategoriesList = document.createElement('ul');
    subcategoriesList.style.paddingLeft = '20px';
    subcategoriesList.classList.add('active');
    
    subcategories.forEach((sub, index) => {
        const subcategory = document.createElement('li');
        // ID를 대소문자로 변환하여 표시 이름으로 사용
        subcategory.textContent = sub.id.charAt(0).toUpperCase() + sub.id.slice(1);
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
            
            const category = categories.find(cat => cat.id === sub.id);
            if (category) {
                updateItemsList(category);
                updateGrid(category.items);
                changeCategory(index);
            }
        });
        
        subcategoriesList.appendChild(subcategory);
    });
    
    worksCategory.appendChild(subcategoriesList);
    categoryMenu.appendChild(worksCategory);
    
    // 나머지 카테고리 추가
    const otherCategories = [
        { id: 'personal' },
        { id: 'exhibition' },
        { id: 'letter' },
        { id: 'frames' }
    ];
    
    otherCategories.forEach((cat, index) => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category';
        
        const heading = document.createElement('h2');
        // ID를 대소문자로 변환하여 표시 이름으로 사용
        heading.textContent = cat.id === 'letter' ? 'A letter from' : cat.id.charAt(0).toUpperCase() + cat.id.slice(1);
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
            
            const category = categories.find(c => c.id === cat.id);
            if (category) {
                updateItemsList(category);
                updateGrid(category.items);
                changeCategory(index + subcategories.length);
            }
        });
        
        categoryElement.appendChild(heading);
        categoryMenu.appendChild(categoryElement);
    });
}

function setupWheelEvent() {
    let scrollAccumulator = 0;
    const SCROLL_THRESHOLD = 5;
    
    document.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        
        // 이미지 그리드 내부에서 스크롤 중인지 확인
        const gridContainer = document.querySelector('.grid-container');
        const isScrollingGrid = e.target.closest('.grid-container');
        
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
        
        // 이미지 그리드 내부 스크롤이면 여기서 종료
        if (isScrollingGrid) return;
        
        // 스크롤 누적값 계산
        scrollAccumulator += e.deltaY;
        
        // 스크롤 누적값이 임계값을 넘었을 때만 카테고리 변경
        if (Math.abs(scrollAccumulator) >= SCROLL_THRESHOLD) {
            isScrolling = true;
            
            if (scrollAccumulator > 0) {
                // 아래로 스크롤
                if (currentCategoryIndex < 7) {
                    changeCategory(currentCategoryIndex + 1);
                }
            } else {
                // 위로 스크롤
                if (currentCategoryIndex > 0) {
                    changeCategory(currentCategoryIndex - 1);
                }
            }
            
            // 스크롤 누적값 초기화
            scrollAccumulator = 0;
            
            // 스크롤 쿨다운
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 300);
        }
    }, { passive: false });
}

function changeCategory(index) {
    if (index === currentCategoryIndex) return;
    
    // 현재 그리드 컨테이너에 전환 효과 적용
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.remove('active');
    
    // 전환 효과가 끝난 후 카테고리 변경
    setTimeout(() => {
        currentCategoryIndex = index;
        
        const subcategories = ['space', 'brand', 'object', 'figure'];
        const otherCategories = ['personal', 'exhibition', 'letter', 'frames'];
        
        // Works 하위 카테고리 요소 가져오기
        const subcategoriesList = document.querySelector('.category-menu ul');
        const worksHeading = document.querySelector('.category:nth-child(2) h2'); // Works 버튼 정확히 선택
        const allHeading = document.querySelector('.category:nth-child(1) h2'); // All 버튼 정확히 선택
        
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
            const currentHeading = Array.from(document.querySelectorAll('.category h2'))
                .find(h => h.textContent === (
                    currentOtherCategory === 'letter' ? 'A letter from' :
                    currentOtherCategory.charAt(0).toUpperCase() + currentOtherCategory.slice(1)
                ));
            
            if (currentHeading) {
                currentHeading.classList.add('active');
                currentHeading.style.color = '#000';
            }
            
            // 현재 카테고리 데이터 업데이트
            const currentCategory = categories.find(cat => cat.id === currentOtherCategory);
            if (currentCategory) {
                updateItemsList(currentCategory);
                updateGrid(currentCategory.items);
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
            const currentCategory = subcategories[index];
            const category = categories.find(cat => cat.id === currentCategory);
            if (category) {
                updateItemsList(category);
                updateGrid(category.items);
            }
        }
        
        // URL 파라미터 업데이트
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = index >= subcategories.length ? otherCategories[index - subcategories.length] : subcategories[index];
        urlParams.set('category', categoryId);
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.pushState({}, '', newUrl);
        
        // 전환 효과 다시 적용
        setTimeout(() => {
            gridContainer.classList.add('active');
        }, 50);
    }, 400);
}

async function updateItemsList(category) {
    const itemsList = document.querySelector('.items-list');
    itemsList.innerHTML = '';
    
    if (!category.items) return;
    
    const ul = document.createElement('ul');
    category.items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.title;
        li.addEventListener('click', () => {
            document.querySelectorAll('.items-list li').forEach(l => l.classList.remove('active'));
            li.classList.add('active');
            
            // 그리드에 상세 이미지들 표시
            const gridContainer = document.querySelector('.grid-container');
            gridContainer.innerHTML = '';
            
            if (item.detailImages) {
                item.detailImages.forEach(image => {
                    const gridItem = document.createElement('div');
                    gridItem.className = 'grid-item';
                    gridItem.innerHTML = `
                        <img src="${image.image}" alt="${image.title}">
                        <div class="title">${item.title}</div>
                    `;
                    
                    // 이미지 클릭 시 상세 페이지로 이동
                    gridItem.addEventListener('click', () => {
                        window.location.href = `detail.html?index=${item.id}`;
                    });
                    
                    gridContainer.appendChild(gridItem);
                });
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
    
    items.forEach(item => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        const img = document.createElement('img');
        img.src = item.imageUrl || 'images/placeholder.jpg';
        img.alt = item.title || '';
        
        gridItem.appendChild(img);
        gridItem.addEventListener('click', () => navigateToDetail(item));
        
        gridContainer.appendChild(gridItem);
    });
}

function navigateToDetail(item) {
    window.location.href = `detail.html?index=${item.id}`;
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
    allHeading.classList.add('active');
    allHeading.style.color = '#000';
    
    // 모든 프로젝트 아이템 수집
    const allItems = [];
    categories.forEach(category => {
        if (category.items) {
            allItems.push(...category.items);
        }
    });
    
    // 모든 프로젝트 표시
    updateItemsList({ items: allItems });
    updateGrid(allItems);
    
    // currentCategoryIndex 업데이트
    currentCategoryIndex = -1;
    
    // 그리드 컨테이너 전환 효과
    const gridContainer = document.querySelector('.grid-container');
    gridContainer.classList.remove('active');
    setTimeout(() => {
        gridContainer.classList.add('active');
    }, 50);
}

// 스크롤 이벤트 핸들러 추가
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;
    const container = document.querySelector('.grid-container');
    
    if (container) {
        container.addEventListener('scroll', (e) => {
            const st = e.target.scrollTop;
            
            // Space 카테고리에서 위로 스크롤할 때 All로 전환
            if (st < lastScrollTop && st === 0 && currentCategoryIndex === 0) {
                showAllCategory();
            }
            
            lastScrollTop = st;
        });
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    
    // 페이지 로드 시 전환 효과 적용
    setTimeout(() => {
        const gridContainer = document.querySelector('.grid-container');
        gridContainer.classList.add('active');
    }, 100);
});