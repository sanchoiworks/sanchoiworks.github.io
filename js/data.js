const STRAPI_URL = 'https://strapi-fvc4.onrender.com';
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg';

const processImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMAGE;
  if (url.includes('cloudinary.com')) return url;
  return `${STRAPI_URL}${url}`;
};

let cache = {
  mainData: null,
  galleryData: null,
  categoriesData: null,
  projectsData: null,
  timestamp: 0,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchDataWithCache(key, fetchFunc) {
  const now = Date.now();
  if (cache[key] && now - cache.timestamp < CACHE_DURATION) {
    return cache[key];
  }
  const data = await fetchFunc();
  cache[key] = data;
  cache.timestamp = now;
  return data;
}

export async function loadMainData() {
  return fetchDataWithCache('mainData', async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/mains?populate=deep,2`);
      if (!response.ok) throw new Error('Failed to fetch main data');
      const result = await response.json();

      if (!Array.isArray(result.data)) throw new Error('Invalid data');

      return result.data.map(item => {
        const mainImageUrl = processImageUrl(item.attributes.mainImage?.data?.attributes?.url);
        const sections = item.attributes.section?.map(section => {
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
            sectionTitle: item.attributes.title || 'Main',
            images: [mainImageUrl],
          });
        }

        return {
          id: item.id,
          projectID: item.attributes.projectID ?? item.id,
          title: item.attributes.title ?? '',
          mainImage: mainImageUrl,
          sections,
          popupText: item.attributes.popupText ?? '',
        };
      });
    } catch (e) {
      console.error('Error in loadMainData:', e);
      return [];
    }
  });
}

export async function loadGalleryData() {
  return fetchDataWithCache('galleryData', async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/alls?populate=mainImage`);
      if (!response.ok) throw new Error(`Failed to load gallery data: ${response.status}`);
      const data = await response.json();

      return data.data.map(item => {
        const imgUrl = processImageUrl(item.attributes.mainImage?.data?.attributes?.url);
        return {
          id: item.id,
          title: item.attributes.title || '',
          mainImage: imgUrl,
          description: item.attributes.popupText || '',
          categoryId: item.attributes.categoryId || '',
        };
      });
    } catch (error) {
      console.error('Error loading gallery data:', error);
      return [];
    }
  });
}

export async function loadCategoriesData() {
  return fetchDataWithCache('categoriesData', async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/alls?populate=deep,2`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return data.data.map(item => {
        const mainImageUrl = processImageUrl(item.attributes.mainImage?.data?.attributes?.url);
        const sections = item.attributes.section?.map(section => {
          const sectionImages = section.images?.map(img => processImageUrl(img?.url)) || [mainImageUrl];
          return {
            id: section.id,
            sectionTitle: section.sectionTitle || '',
            images: sectionImages,
          };
        }) || [];

        if (sections.length === 0 && mainImageUrl) {
          sections.push({
            id: item.id,
            sectionTitle: item.attributes.title || 'Main',
            images: [mainImageUrl],
          });
        }

        return {
          id: item.id,
          name: item.attributes.title || '',
          title: item.attributes.title || '',
          mainImage: mainImageUrl,
          popupText: item.attributes.popupText || '',
          categoryId: item.attributes.categoryId || '',
          sections,
        };
      });
    } catch (error) {
      console.error('Error loading categories data:', error);
      return [];
    }
  });
}

export async function loadProjectsData() {
  return fetchDataWithCache('projectsData', async () => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/alls?populate=deep,2`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return data.data.map(item => {
        const mainImageUrl = processImageUrl(item.attributes.mainImage?.data?.attributes?.url);
        const sections = item.attributes.section?.map(section => {
          const sectionImages = section.images?.map(img => processImageUrl(img?.url)) || [mainImageUrl];
          return {
            id: section.id,
            sectionTitle: section.sectionTitle || '',
            images: sectionImages,
          };
        }) || [];

        if (sections.length === 0 && mainImageUrl) {
          sections.push({
            id: item.id,
            sectionTitle: item.attributes.title || 'Main',
            images: [mainImageUrl],
          });
        }

        return {
          id: item.id,
          name: item.attributes.title || '',
          title: item.attributes.title || '',
          mainImage: mainImageUrl,
          popupText: item.attributes.popupText || '',
          categoryId: item.attributes.categoryId || '',
          sections,
        };
      });
    } catch (error) {
      console.error('Error loading projects data:', error);
      return [];
    }
  });
}
