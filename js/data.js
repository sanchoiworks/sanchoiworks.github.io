const STRAPI_URL = 'https://strapi-fvc4.onrender.com'; // 본인 Strapi 주소로 변경하세요
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg'; // 기본 이미지 경로

// 이미지 URL 처리 헬퍼 함수
const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  return url.includes('cloudinary.com') ? url : `${STRAPI_URL}${url}`;
};

// 공통 캐시 기반 fetch 함수
const cache = new Map();
async function fetchDataWithCache(url) {
  if (cache.has(url)) return cache.get(url);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
  const data = await response.json();
  cache.set(url, data);
  return data;
}

// 메인 데이터 로딩
export async function loadMainData() {
  try {
    const data = await fetchDataWithCache(
      `${STRAPI_URL}/api/mains?populate[mainImage]=true&populate[section][populate][images]=true`
    );

    if (!data?.data || !Array.isArray(data.data)) {
      throw new Error('Invalid main data structure');
    }

    return data.data.map(item => {
      const mainImageUrl = processImageUrl(item.attributes?.mainImage?.data?.attributes?.url);

      const sections = (item.attributes?.section || []).map(section => {
        const images = (section.images || []).map(img =>
          processImageUrl(img?.url)
        );
        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: images.length ? images : [mainImageUrl],
        };
      });

      if (sections.length === 0) {
        sections.push({
          id: item.id,
          sectionTitle: item.attributes?.title || 'Main',
          images: [mainImageUrl],
        });
      }

      return {
        id: item.id,
        projectID: item.attributes?.projectID ?? item.id,
        title: item.attributes?.title ?? '',
        mainImage: mainImageUrl,
        popupText: item.attributes?.popupText ?? '',
        sections,
      };
    });
  } catch (e) {
    console.error('Error in loadMainData:', e);
    return [];
  }
}

// 섹션 상세 로딩
export async function loadSectionDetails(sectionId) {
  try {
    const data = await fetchDataWithCache(
      `${STRAPI_URL}/api/sections/${sectionId}?populate=images`
    );
    const images = (data?.data?.attributes?.images || []).map(img =>
      processImageUrl(img?.url)
    );
    return { images };
  } catch (e) {
    console.error('Error loading section details:', e);
    return { images: [] };
  }
}

// 갤러리 데이터 로딩
export async function loadGalleryData() {
  try {
    const data = await fetchDataWithCache(
      `${STRAPI_URL}/api/alls?populate[mainImage]=true`
    );
    return (data.data || []).map(item => {
      const attr = item.attributes;
      return {
        id: item.id,
        title: attr?.title || '',
        mainImage: processImageUrl(attr?.mainImage?.data?.attributes?.url),
        description: attr?.popupText || '',
        categoryId: attr?.categoryId || '',
      };
    });
  } catch (e) {
    console.error('Error loading gallery data:', e);
    return [];
  }
}

// 카테고리 데이터 로딩
export async function loadCategoriesData() {
  try {
    const data = await fetchDataWithCache(
      `${STRAPI_URL}/api/alls?populate[mainImage]=true&populate[section][populate][images]=true`
    );

    return (data.data || []).map(item => {
      const attr = item.attributes;
      const mainImageUrl = processImageUrl(attr?.mainImage?.data?.attributes?.url);

      const sections = (attr?.section || []).map(section => {
        const images = (section.images || []).map(img =>
          processImageUrl(img?.url)
        );
        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: images.length ? images : [mainImageUrl],
        };
      });

      if (sections.length === 0) {
        sections.push({
          id: item.id,
          sectionTitle: attr?.title || 'Main',
          images: [mainImageUrl],
        });
      }

      return {
        id: item.id,
        name: attr?.title || '',
        title: attr?.title || '',
        mainImage: mainImageUrl,
        popupText: attr?.popupText || '',
        categoryId: attr?.categoryId || '',
        sections,
      };
    });
  } catch (e) {
    console.error('Error loading categories data:', e);
    return [];
  }
}

// 프로젝트 데이터 로딩
export async function loadProjectsData() {
  try {
    const data = await fetchDataWithCache(
      `${STRAPI_URL}/api/alls?populate[mainImage]=true&populate[section][populate][images]=true`
    );

    return (data.data || []).map(item => {
      const attr = item.attributes;
      const mainImageUrl = processImageUrl(attr?.mainImage?.data?.attributes?.url);

      const sections = (attr?.section || []).map(section => {
        const images = (section.images || []).map(img =>
          processImageUrl(img?.url)
        );
        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: images.length ? images : [mainImageUrl],
        };
      });

      if (sections.length === 0) {
        sections.push({
          id: item.id,
          sectionTitle: attr?.title || 'Main',
          images: [mainImageUrl],
        });
      }

      return {
        id: item.id,
        name: attr?.title || '',
        title: attr?.title || '',
        mainImage: mainImageUrl,
        popupText: attr?.popupText || '',
        categoryId: attr?.categoryId || '',
        sections,
      };
    });
  } catch (e) {
    console.error('Error loading projects data:', e);
    return [];
  }
}
