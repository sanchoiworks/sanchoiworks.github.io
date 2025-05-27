const STRAPI_URL = 'https://strapi-fvc4.onrender.com'; // 본인 Strapi 주소로 변경하세요
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg'; // 기본 이미지 경로

// 이미지 URL 처리 헬퍼 함수
const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;

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

// 메인 데이터 로딩 함수
export async function loadMainData() {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/mains?populate[mainImage]=true&populate[section][populate][images]=true`
    );
    if (!response.ok) throw new Error('Failed to fetch main data');
    const result = await response.json();

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Invalid data structure received from API');
    }

    return result.data.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);

      const sections = item.section?.map(section => {
        const sectionImages = section.images?.map(img => processImageUrl(img?.url)) || [mainImageUrl];

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
    return [];
  }
}

// section 개별 로딩 함수
async function loadSectionDetails(sectionId) {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/sections/${sectionId}?populate=images`
    );
    if (!response.ok) throw new Error('Failed to fetch section details');
    const result = await response.json();

    if (!result.data) return { images: [] };

    const images = Array.isArray(result.data.images)
      ? result.data.images.map(img => processImageUrl(img?.url))
      : [];

    return { images };
  } catch (e) {
    console.error('Error loading section details:', e);
    return { images: [] };
  }
}

// 갤러리 데이터 로딩 함수
export async function loadGalleryData() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/alls?populate=mainImage`);
    if (!response.ok) throw new Error(`Failed to load gallery data: ${response.status}`);
    const data = await response.json();

    const filteredData = data.data.filter(item => item);

    return filteredData.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);

      return {
        id: item.id,
        title: item.title || '',
        mainImage: mainImageUrl,
        description: item.popupText || '',
        categoryId: item.categoryId || '',
      };
    });
  } catch (error) {
    console.error('Error loading gallery data:', error);
    throw error;
  }
}

// 카테고리 데이터 로딩 함수
export async function loadCategoriesData() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/alls?populate[mainImage]=true&populate[section][populate][images]=true`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) return [];

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
        sections,
      };
    });
  } catch (error) {
    console.error('Error loading categories data:', error);
    return [];
  }
}

// 프로젝트 데이터 로딩 함수
export async function loadProjectsData() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/alls?populate[mainImage]=true&populate[section][populate][images]=true`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) return [];

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
        sections,
      };
    });
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}
