const STRAPI_URL = 'https://strapi-fvc4.onrender.com';
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg';

const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.includes('cloudinary.com')) return url;
  return `${STRAPI_URL}${url}`;
};

// section.images를 별도 fetch (병렬 처리용)
async function fetchSectionImages(sectionId) {
  try {
    const res = await fetch(`${STRAPI_URL}/api/sections/${sectionId}?populate=images`);
    if (!res.ok) throw new Error(`Section ${sectionId} fetch failed`);
    const json = await res.json();
    return (json.data?.images || []).map(img => processImageUrl(img?.url));
  } catch (err) {
    console.error('Section fetch error:', err);
    return [];
  }
}

// main + section fetch + 병렬 이미지 fetch
export async function loadMainData() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/mains?populate[mainImage]=true&populate[section]=true`);
    if (!res.ok) throw new Error('Failed to fetch main data');
    const result = await res.json();
    if (!Array.isArray(result.data)) throw new Error('Invalid main data format');

    // 병렬 section image fetch
    const allSections = result.data.flatMap(item => item.section || []);
    const sectionImageMap = {};
    await Promise.all(allSections.map(async section => {
      sectionImageMap[section.id] = await fetchSectionImages(section.id);
    }));

    return result.data.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);
      const sections = (item.section || []).map(section => {
        const images = sectionImageMap[section.id] || [mainImageUrl];
        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images,
        };
      });

      // 섹션이 없으면 메인 이미지로 구성
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

export async function loadGalleryData() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/alls?populate[mainImage]=true`);
    if (!res.ok) throw new Error(`Failed to load gallery data`);
    const json = await res.json();

    return (json.data || []).map(item => ({
      id: item.id,
      title: item.title || '',
      mainImage: processImageUrl(item.mainImage?.url),
      description: item.popupText || '',
      categoryId: item.categoryId || '',
    }));
  } catch (err) {
    console.error('Error loading gallery data:', err);
    return [];
  }
}

export async function loadCategoriesData() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/alls?populate[mainImage]=true&populate[section]=true`);
    if (!res.ok) throw new Error(`Failed to load categories`);
    const json = await res.json();
    const items = json.data || [];

    // 병렬 section image fetch
    const allSections = items.flatMap(item => item.section || []);
    const sectionImageMap = {};
    await Promise.all(allSections.map(async section => {
      sectionImageMap[section.id] = await fetchSectionImages(section.id);
    }));

    return items.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);
      const sections = (item.section || []).map(section => {
        const images = sectionImageMap[section.id] || [mainImageUrl];
        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images,
        };
      });

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
  } catch (err) {
    console.error('Error loading categories data:', err);
    return [];
  }
}

export async function loadProjectsData() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/alls?populate[mainImage]=true&populate[section]=true`);
    if (!res.ok) throw new Error(`Failed to load projects`);
    const json = await res.json();
    const items = json.data || [];

    // 병렬 section image fetch
    const allSections = items.flatMap(item => item.section || []);
    const sectionImageMap = {};
    await Promise.all(allSections.map(async section => {
      sectionImageMap[section.id] = await fetchSectionImages(section.id);
    }));

    return items.map(item => {
      const mainImageUrl = processImageUrl(item.mainImage?.url);
      const sections = (item.section || []).map(section => {
        const images = sectionImageMap[section.id] || [mainImageUrl];
        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images,
        };
      });

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
  } catch (err) {
    console.error('Error loading projects data:', err);
    return [];
  }
}
