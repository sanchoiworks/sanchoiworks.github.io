const STRAPI_URL = 'https://strapi-fvc4.onrender.com'; // 본인 Strapi 주소로 변경하세요
const PLACEHOLDER_IMAGE = '/path/to/placeholder.jpg'; // 기본 이미지 경로

// 메인 데이터 로딩 함수
export async function loadMainData() {
  try {
    const response = await fetch(
      'https://strapi-fvc4.onrender.com/api/mains?populate[mainImage]=true&populate[section][populate][images]=true'
    );
    if (!response.ok) throw new Error('Failed to fetch main data');
    const result = await response.json();

    console.log('Raw API response:', JSON.stringify(result, null, 2));

    if (!result.data || !Array.isArray(result.data)) {
      throw new Error('Invalid data structure received from API');
    }

    return result.data.map(item => {
      // Handle main image
      const mainImage = item.mainImage;
      const mainImageUrl = mainImage?.url
        ? `https://strapi-fvc4.onrender.com${mainImage.url}`
        : '/path/to/placeholder.jpg';

      // Handle sections from the component
      const sections = item.section?.map(section => {
        const sectionImages = section.images?.map(img => 
          img?.url ? `https://strapi-fvc4.onrender.com${img.url}` : mainImageUrl
        ) || [mainImageUrl];

        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: sectionImages,
        };
      }) || [];

      // If there are no sections, create one with the main image
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

// Function to load section details including images
async function loadSectionDetails(sectionId) {
  try {
    const response = await fetch(
      `http://https://strapi-fvc4.onrender.com/api/sections/${sectionId}?populate=images`
    );
    if (!response.ok) throw new Error('Failed to fetch section details');
    const result = await response.json();

    if (!result.data) return { images: [] };

    const images = Array.isArray(result.data.images)
      ? result.data.images.map(img => 
          img?.url ? `https://strapi-fvc4.onrender.com${img.url}` : '/path/to/placeholder.jpg'
        )
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
    if (!response.ok) {
      throw new Error(`Failed to load gallery data: ${response.status}`);
    }
    const data = await response.json();

    const filteredData = data.data.filter(item => item);

    return filteredData.map(item => {
      const mainImageUrl = item.mainImage?.url
        ? `${STRAPI_URL}${item.mainImage.url}`
        : PLACEHOLDER_IMAGE;

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

// 카테고리 데이터 로딩 함수 수정
export async function loadCategoriesData() {
  try {
    const response = await fetch('https://strapi-fvc4.onrender.com/api/alls?populate[mainImage]=true&populate[section][populate][images]=true');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API Response:', data);
    console.log('First item in data:', data.data[0]);

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid data structure:', data);
      return [];
    }

    return data.data.map(item => {
      console.log('Processing item:', item);
      
      const mainImageUrl = item.mainImage?.url
        ? `https://strapi-fvc4.onrender.com${item.mainImage.url}`
        : null;

      // Handle sections
      const sections = item.section?.map(section => {
        console.log('Processing section:', section);
        
        // Get section images
        const sectionImages = section.images?.map(img => {
          console.log('Processing section image:', img);
          return img?.url ? `https://strapi-fvc4.onrender.com${img.url}` : mainImageUrl;
        }) || [];

        // If no images in section, use main image
        if (sectionImages.length === 0 && mainImageUrl) {
          sectionImages.push(mainImageUrl);
        }

        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: sectionImages,
        };
      }) || [];

      // If there are no sections, create one with the main image
      if (sections.length === 0 && mainImageUrl) {
        sections.push({
          id: item.id,
          sectionTitle: item.title || 'Main',
          images: [mainImageUrl],
        });
      }

      const mappedItem = {
        id: item.id,
        name: item.title || '',
        title: item.title || '',
        mainImage: mainImageUrl,
        popupText: item.popupText || '',
        categoryId: item.categoryId || '',
        sections: sections
      };
      
      console.log('Mapped item:', mappedItem);
      return mappedItem;
    });
  } catch (error) {
    console.error('Error loading categories data:', error);
    return [];
  }
}

export async function loadProjectsData() {
  try {
    const response = await fetch('https://strapi-fvc4.onrender.com/api/alls?populate[mainImage]=true&populate[section][populate][images]=true');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API Response:', data);
    console.log('First item in data:', data.data[0]);

    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid data structure:', data);
      return [];
    }

    return data.data.map(item => {
      console.log('Processing item:', item);
      
      const mainImageUrl = item.mainImage?.url
        ? `https://strapi-fvc4.onrender.com${item.mainImage.url}`
        : null;

      // Handle sections
      const sections = item.section?.map(section => {
        console.log('Processing section:', section);
        
        // Get section images
        const sectionImages = section.images?.map(img => {
          console.log('Processing section image:', img);
          return img?.url ? `https://strapi-fvc4.onrender.com${img.url}` : mainImageUrl;
        }) || [];

        // If no images in section, use main image
        if (sectionImages.length === 0 && mainImageUrl) {
          sectionImages.push(mainImageUrl);
        }

        return {
          id: section.id,
          sectionTitle: section.sectionTitle || '',
          images: sectionImages,
        };
      }) || [];

      // If there are no sections, create one with the main image
      if (sections.length === 0 && mainImageUrl) {
        sections.push({
          id: item.id,
          sectionTitle: item.title || 'Main',
          images: [mainImageUrl],
        });
      }

      const mappedItem = {
        id: item.id,
        name: item.title || '',
        title: item.title || '',
        mainImage: mainImageUrl,
        popupText: item.popupText || '',
        sections: sections
      };
      
      console.log('Mapped item:', mappedItem);
      return mappedItem;
    });
  } catch (error) {
    console.error('Error loading projects data:', error);
    return [];
  }
}
