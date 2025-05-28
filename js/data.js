const STRAPI_URL = 'https://strapi-fvc4.onrender.com'; // 본인 Strapi 주소로 변경하세요
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg'; // 기본 이미지 경로

// 캐시 구현
const cache = {
  data: new Map(),
  timestamp: new Map(),
  maxAge: 5 * 60 * 1000, // 5분 캐시
};

// 캐시된 데이터 가져오기
const getCachedData = (key) => {
  const timestamp = cache.timestamp.get(key);
  if (timestamp && Date.now() - timestamp < cache.maxAge) {
    return cache.data.get(key);
  }
  return null;
};

// 데이터 캐시하기
const setCachedData = (key, data) => {
  cache.data.set(key, data);
  cache.timestamp.set(key, Date.now());
};

// 이미지 URL 처리 헬퍼 함수
const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;

  // If URL already contains http(s), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Cloudinary URL인 경우 최적화 파라미터 추가
  if (url.includes('cloudinary.com')) {
    if (!url.includes('f_auto') && !url.includes('q_auto')) {
      const hasQuery = url.includes('?');
      return `${url}${hasQuery ? '&' : '?'}f_auto&q_auto&w=800`;
    }
    return url;
  }

  // Strapi URL인 경우 STRAPI_URL 추가
  return `${STRAPI_URL}${url}`;
};

// 섹션 데이터 처리 헬퍼 함수
const processSections = (sections, mainImageUrl) => {
  if (!sections || !Array.isArray(sections)) {
    return [{
      id: 'main',
      sectionTitle: 'Main',
      images: [mainImageUrl],
    }];
  }

  return sections.map(section => ({
    id: section.id,
    sectionTitle: section.sectionTitle || '',
    images: section.images?.map(img => processImageUrl(img?.url)) || [mainImageUrl],
  }));
};

// 메인 데이터 로딩 함수 (projectID가 있는 데이터)
export async function loadMainData() {
  const cacheKey = 'mainData';
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(
      `${STRAPI_URL}/api/mains?populate[mainImage]=true&populate[section][populate][images]=true`
    );
    if (!response.ok) throw new Error('Failed to fetch main data');
    const result = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Invalid data structure received from API');
    }

    const processedData = result.data.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);
      const sections = processSections(item.section, mainImageUrl);

      return {
        id: item.id,
        projectID: item.projectID ?? item.id,
        title: item.title ?? '',
        mainImage: mainImageUrl,
        sections,
        popupText: item.popupText ?? '',
      };
    });

    setCachedData(cacheKey, processedData);
    return processedData;
  } catch (e) {
    console.error('Error in loadMainData:', e);
    return [];
  }
}

// All 데이터 로딩 함수 (카테고리가 있는 데이터)
export async function loadAllData() {
  const cacheKey = 'allData';
  const cachedData = getCachedData(cacheKey);
  if (cachedData) return cachedData;

  try {
    const response = await fetch(
      `${STRAPI_URL}/api/alls?populate[mainImage]=true&populate[section][populate][images]=true`
    );
    if (!response.ok) throw new Error('Failed to fetch all data');
    const result = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Invalid data structure received from API');
    }

    const processedData = result.data.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);
      const sections = processSections(item.section, mainImageUrl);

      return {
        id: item.id,
        name: item.title || '',
        title: item.title || '',
        mainImage: mainImageUrl,
        sections,
        popupText: item.popupText || '',
        categoryId: item.categoryId || '',
      };
    });

    setCachedData(cacheKey, processedData);
    return processedData;
  } catch (e) {
    console.error('Error in loadAllData:', e);
    return [];
  }
}

// 카테고리 데이터 로딩 함수
export async function loadCategoriesData() {
  return loadAllData();
}

// 프로젝트 데이터 로딩 함수
export async function loadProjectsData() {
  return loadAllData();
}

// 갤러리 데이터 로딩 함수
export async function loadGalleryData() {
  const allData = await loadAllData();
  return allData.map(item => ({
    id: item.id,
    title: item.title,
    mainImage: item.mainImage,
    description: item.popupText,
    categoryId: item.categoryId,
  }));
}
