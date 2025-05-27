const STRAPI_URL = 'https://strapi-fvc4.onrender.com'; // 본인 Strapi 주소로 변경하세요
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg'; // 기본 이미지 경로

// 이미지 URL 처리 헬퍼 함수
const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  return url.includes('cloudinary.com') ? url : `${STRAPI_URL}${url}`;
};

// 메인 데이터 로딩 함수
export async function loadMainData() {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/mains?populate=mainImage`
    );
    if (!response.ok) return [];
    const result = await response.json();

    return result.data.map(item => ({
      id: item.id,
      projectID: item.projectID ?? item.id,
      title: item.title ?? '',
      mainImage: processImageUrl(item.mainImage?.url),
      popupText: item.popupText ?? '',
    }));
  } catch (e) {
    console.error('Error in loadMainData:', e);
    return [];
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

// 갤러리 데이터 로딩 함수 수정
export async function loadGalleryData() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/alls?populate=mainImage`);
    if (!response.ok) return [];
    const data = await response.json();

    return data.data.map(item => ({
      id: item.id,
      title: item.title || '',
      mainImage: processImageUrl(item.mainImage?.url),
      description: item.popupText || '',
      categoryId: item.categoryId || '',
    }));
  } catch (error) {
    console.error('Error loading gallery data:', error);
    return [];
  }
}

// 카테고리 데이터 로딩 함수 수정
export async function loadCategoriesData() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/alls?populate=mainImage`);
    if (!response.ok) return [];
    const data = await response.json();

    return data.data.map(item => ({
      id: item.id,
      name: item.title || '',
      title: item.title || '',
      mainImage: processImageUrl(item.mainImage?.url),
      popupText: item.popupText || '',
      categoryId: item.categoryId || '',
    }));
  } catch (error) {
    console.error('Error loading categories data:', error);
    return [];
  }
}

export async function loadProjectsData() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/alls?populate=mainImage`);
    if (!response.ok) return [];
    const data = await response.json();

    return data.data.map(item => ({
      id: item.id,
      name: item.title || '',
      title: item.title || '',
      mainImage: processImageUrl(item.mainImage?.url),
      popupText: item.popupText || '',
      categoryId: item.categoryId || '',
    }));
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}