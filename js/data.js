const STRAPI_URL = 'https://strapi-fvc4.onrender.com'; // 본인 Strapi 주소로 변경하세요
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg'; // 기본 이미지 경로

// 캐시 구현
const cache = {
  data: new Map(),
  timestamp: new Map(),
  maxAge: 5 * 60 * 1000, // 5분 캐시
};

// 데이터 캐시하기
const setCachedData = (key, data) => {
  cache.data.set(key, data);
  cache.timestamp.set(key, Date.now());
  
  // 브라우저의 localStorage에도 캐시 저장
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to cache data in localStorage:', e);
  }
};

// 캐시된 데이터 가져오기
const getCachedData = (key) => {
  const cachedData = cache.data.get(key);
  const timestamp = cache.timestamp.get(key);
  
  // 메모리 캐시 확인
  if (cachedData && timestamp && Date.now() - timestamp < cache.maxAge) {
    return cachedData;
  }
  
  // localStorage 캐시 확인
  try {
    const storedCache = localStorage.getItem(`cache_${key}`);
    if (storedCache) {
      const { data, timestamp } = JSON.parse(storedCache);
      if (Date.now() - timestamp < cache.maxAge) {
        // 메모리 캐시 업데이트
        cache.data.set(key, data);
        cache.timestamp.set(key, timestamp);
        return data;
      }
    }
  } catch (e) {
    console.warn('Failed to read cache from localStorage:', e);
  }
  
  return null;
};

// 이미지 URL 처리 헬퍼 함수
const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // 이미지 최적화 파라미터 추가
    const hasQuery = url.includes('?');
    const optimizationParams = 'width=800&quality=80&format=webp&cache=3600';
    return `${url}${hasQuery ? '&' : '?'}${optimizationParams}`;
  }
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
    // 필요한 필드만 선택적으로 가져오도록 수정
    const query = 'populate[mainImage][fields][0]=url&populate[section][populate][images][fields][0]=url&fields[0]=id&fields[1]=projectID&fields[2]=title&fields[3]=popupText';
    
    console.log('Fetching main data from:', `${STRAPI_URL}/api/mains?${query}`);
    const response = await fetch(`${STRAPI_URL}/api/mains?${query}`);
    console.log('Response status:', response.status);
    if (!response.ok) {
      console.error('Failed to fetch main data. Status:', response.status);
      throw new Error(`Failed to fetch main data: ${response.status}`);
    }
    const result = await response.json();
    console.log('Received data:', result);

    if (!result.data || !Array.isArray(result.data)) {
      console.error('Invalid data structure:', result);
      throw new Error('Invalid data structure received from API');
    }

    const processedData = result.data.map(item => {
      const mainImageUrl = processImageUrl(item.attributes?.mainImage?.data?.attributes?.url);
      const sections = processSections(item.attributes?.section || [], mainImageUrl);

      return {
        id: item.id,
        projectID: item.attributes?.projectID ?? item.id,
        title: item.attributes?.title ?? '',
        mainImage: mainImageUrl,
        sections,
        popupText: item.attributes?.popupText ?? '',
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
    // 필요한 필드만 선택적으로 가져오도록 수정
    const query = 'populate[mainImage][fields][0]=url&populate[section][populate][images][fields][0]=url&fields[0]=id&fields[1]=title&fields[2]=categoryId&fields[3]=popupText';
    
    const response = await fetch(`${STRAPI_URL}/api/alls?${query}`);
    if (!response.ok) throw new Error('Failed to fetch all data');
    const result = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Invalid data structure received from API');
    }

    const processedData = result.data.map(item => {
      const mainImageUrl = processImageUrl(item.attributes?.mainImage?.data?.attributes?.url);
      const sections = processSections(item.attributes?.section || [], mainImageUrl);

      return {
        id: item.id,
        name: item.attributes?.title || '',
        title: item.attributes?.title || '',
        mainImage: mainImageUrl,
        sections,
        popupText: item.attributes?.popupText || '',
        categoryId: item.attributes?.categoryId || '',
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
