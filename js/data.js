const STRAPI_URL = 'https://strapi-fvc4.onrender.com'; // 본인 Strapi 주소로 변경하세요
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg'; // 기본 이미지 경로

// 캐시 객체 추가
const cache = {
  categories: null,
  projects: null,
  main: null,
  lastFetch: null,
  CACHE_DURATION: 30 * 60 * 1000, // 30분
};

// 이미지 URL 처리 헬퍼 함수
const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  
  // Cloudinary URL인 경우 이미지 최적화
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', '/upload/w_600,c_scale,q_80,f_auto,dpr_auto,fl_progressive,fl_force_strip/');
  }
  
  // Strapi URL인 경우
  if (url.startsWith('/')) {
    return `${STRAPI_URL}${url}`;
  }
  
  return url;
};

// 이미지 지연 로딩을 위한 함수
const lazyLoadImage = (imgElement, url) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 이미지 로딩 전에 작은 크기의 플레이스홀더 표시
        imgElement.src = url.replace('/upload/', '/upload/w_100,c_scale,q_auto,f_auto,fl_progressive/');
        
        // 실제 이미지 로딩
        const fullImage = new Image();
        fullImage.onload = () => {
          imgElement.src = url;
        };
        fullImage.src = url;
        
        observer.unobserve(imgElement);
      }
    });
  }, {
    rootMargin: '100px 0px',
    threshold: 0.1
  });
  
  observer.observe(imgElement);
};

// 이미지 요소 생성 함수
const createImageElement = (url) => {
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.fetchPriority = 'low';
  lazyLoadImage(img, url);
  return img;
};

// 공통 API 요청 설정
const fetchWithCache = async (url, cacheKey) => {
  // 캐시된 데이터가 있고 유효한 경우 사용
  if (cache[cacheKey] && cache.lastFetch && 
      Date.now() - cache.lastFetch < cache.CACHE_DURATION) {
    return cache[cacheKey];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초로 타임아웃 감소

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
      cache: 'force-cache' // 브라우저 캐시 강제 사용
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 데이터 구조 단순화
    const simplifiedData = {
      data: data.data.map(item => ({
        id: item.id,
        title: item.title || '',
        mainImage: item.mainImage?.url || '',
        popupText: item.popupText || '',
        categoryId: item.categoryId || '',
        section: item.section?.map(section => ({
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: section.images?.map(img => img?.url) || []
        })) || []
      }))
    };

    cache[cacheKey] = simplifiedData;
    cache.lastFetch = Date.now();
    return simplifiedData;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Request timeout');
      return cache[cacheKey] || null;
    }
    throw error;
  }
};

// 병렬 데이터 로딩 함수
const loadDataInParallel = async (endpoints) => {
  try {
    const results = await Promise.allSettled(
      endpoints.map(({ url, key }) => fetchWithCache(url, key))
    );

    return results.reduce((acc, result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        acc[endpoints[index].key] = result.value;
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Error in parallel data loading:', error);
    return {};
  }
};

// 메인 데이터 로딩 함수
export async function loadMainData() {
  try {
    const result = await fetchWithCache(
      'https://strapi-fvc4.onrender.com/api/mains?populate[mainImage][fields][0]=url&populate[section][populate][images][fields][0]=url&fields[0]=title&fields[1]=popupText',
      'main'
    );

    if (!result?.data || !Array.isArray(result.data)) {
      throw new Error('Invalid data structure received from API');
    }

    return result.data.map(item => {
      // mainImage URL 처리 수정
      const mainImageUrl = processImageUrl(item.mainImage?.data?.attributes?.url || item.mainImage?.url);

      const sections = item.section?.map(section => {
        const sectionImages = section.images?.map(img => 
          processImageUrl(img?.data?.attributes?.url || img?.url)
        ) || [mainImageUrl];

        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: sectionImages,
        };
      }) || [];

      if (sections.length === 0) {
        sections.push({
          id: item.id,
          sectionTitle: item.title || 'Main',
          images: [mainImageUrl],
        });
      }

      return {
        id: item.id,
        projectID: item.projectID ?? item.id,
        title: item.title ?? '',
        mainImage: mainImageUrl,
        sections,
        popupText: item.popupText ?? '',
      };
    });
  } catch (e) {
    console.error('Error in loadMainData:', e);
    return cache.main || [];
  }
}

// Function to load section details including images
async function loadSectionDetails(sectionId) {
  try {
    const response = await fetch(
      `https://strapi-fvc4.onrender.com/api/sections/${sectionId}?populate=images`
    );
    if (!response.ok) throw new Error('Failed to fetch section details');
    const result = await response.json();

    if (!result.data) return { images: [] };

    const images = Array.isArray(result.data.images)
      ? result.data.images.map(img => processImageUrl(img?.url))
      : [];

    return {
      images,
    };
  } catch (e) {
    console.error('Error loading section details:', e);
    return { images: [] };
  }
}

// 갤러리 데이터 로딩 함수
export async function loadGalleryData() {
  try {
    const endpoints = [
      {
        url: `${STRAPI_URL}/api/alls?populate[mainImage][fields][0]=url&fields[0]=title&fields[1]=categoryId&fields[2]=popupText`,
        key: 'categories'
      }
    ];

    const data = await loadDataInParallel(endpoints);
    const result = data.categories;

    if (!result?.data) return [];

    return result.data
      .filter(item => item)
      .map(item => ({
        id: item.id,
        title: item.title || '',
        mainImage: processImageUrl(item.mainImage?.url),
        description: item.popupText || '',
        categoryId: item.categoryId || '',
      }));
  } catch (error) {
    console.error('Error loading gallery data:', error);
    return cache.categories || [];
  }
}

// 카테고리 데이터 로딩 함수
export async function loadCategoriesData() {
  try {
    const data = await fetchWithCache(
      'https://strapi-fvc4.onrender.com/api/alls?populate[mainImage][fields][0]=url&populate[section][populate][images][fields][0]=url&fields[0]=title&fields[1]=categoryId&fields[2]=popupText',
      'categories'
    );

    if (!data?.data) return [];

    return data.data.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage);

      const sections = item.section?.map(section => {
        const sectionImages = section.images?.map(img => processImageUrl(img)) || [];

        if (sectionImages.length === 0 && mainImageUrl) {
          sectionImages.push(mainImageUrl);
        }

        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: sectionImages,
        };
      }) || [];

      if (sections.length === 0 && mainImageUrl) {
        sections.push({
          id: item.id,
          sectionTitle: item.title || 'Main',
          images: [mainImageUrl],
        });
      }

      return {
        id: item.id,
        name: item.title || '',
        title: item.title || '',
        mainImage: mainImageUrl,
        popupText: item.popupText || '',
        categoryId: item.categoryId || '',
        sections: sections
      };
    });
  } catch (error) {
    console.error('Error loading categories data:', error);
    return cache.categories || [];
  }
}

// 프로젝트 데이터 로딩 함수
export async function loadProjectsData() {
  try {
    const data = await fetchWithCache(
      'https://strapi-fvc4.onrender.com/api/alls?populate[mainImage][fields][0]=url&populate[section][populate][images][fields][0]=url&fields[0]=title&fields[1]=categoryId&fields[2]=popupText',
      'projects'
    );

    return data.data.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);

      const sections = item.section?.map(section => {
        const sectionImages = section.images?.map(img => processImageUrl(img?.url)) || [];

        if (sectionImages.length === 0 && mainImageUrl) {
          sectionImages.push(mainImageUrl);
        }

        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: sectionImages,
        };
      }) || [];

      if (sections.length === 0 && mainImageUrl) {
        sections.push({
          id: item.id,
          sectionTitle: item.title || 'Main',
          images: [mainImageUrl],
        });
      }

      return {
        id: item.id,
        name: item.title || '',
        title: item.title || '',
        mainImage: mainImageUrl,
        popupText: item.popupText || '',
        categoryId: item.categoryId || '',
        sections: sections
      };
    });
  } catch (error) {
    console.error('Error loading projects data:', error);
    return cache.projects || [];
  }
}
