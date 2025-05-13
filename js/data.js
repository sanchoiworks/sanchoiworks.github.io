// Sanity 클라이언트 설정
const client = {
  projectId: 'uc9sfpn2',
  dataset: 'production',
  apiVersion: '2024-03-19',
  useCdn: true,
  token: 'sk5VbwXboX5hjBFST2Sa8IWzZRIUnThhiscTdrm2qBvCnYVNHNc3SZeMsNwteIpWQaJVHuik4FkxHZ65Tw0m8jlCCPUynBCgsNSeNAz0gVdHGlvs8q4p73p5RdhwlMh1B707TKmcYgSyiItmfUUKzHctLHrzk26tCDeD7dZUyBjbfWnvA9wn',
  fetch: async (query) => {
    try {
      const response = await fetch(`https://${client.projectId}.api.sanity.io/v${client.apiVersion}/data/query/${client.dataset}?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${client.token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('Error fetching data:', error)
      return []
    }
  }
}

export async function loadGalleryData() {
    try {
        // Sanity에서 main 타입의 모든 문서 가져오기
        const data = await client.fetch(`*[_type == "main"] | order(id asc) {
            id,
            title,
            description,
            "imageUrl": image.asset->url,
            detailImages[] {
                text,
                title,
                "imageUrl": image.asset->url
            }
        }`)
        console.log('Loaded gallery data:', data)
        
        // 이미지 URL이 없는 경우 기본 이미지 사용
        const processedData = data.map(item => ({
            ...item,
            imageUrl: item.imageUrl || 'images/placeholder.jpg',
            detailImages: item.detailImages?.map(img => ({
                ...img,
                imageUrl: img.imageUrl || 'images/placeholder.jpg'
            })) || []
        }))
        
        return { items: processedData }
    } catch (error) {
        console.error('Error loading gallery data:', error)
        return { items: [] }
    }
}

export async function loadCategoriesData() {
    try {
        // Sanity에서 index 타입의 모든 문서 가져오기
        const data = await client.fetch(`*[_type == "index"] | order(categoryId asc, id asc) {
            categoryId,
            id,
            title,
            "imageUrl": image.asset->url,
            detailImages[] {
                "imageUrl": image.asset->url
            }
        }`)
        console.log('Loaded categories data:', data)

        // 이미지 URL이 없는 경우 기본 이미지 사용
        const processedData = data.map(item => ({
            ...item,
            imageUrl: item.imageUrl || 'images/placeholder.jpg',
            detailImages: item.detailImages?.map(img => ({
                ...img,
                imageUrl: img.imageUrl || 'images/placeholder.jpg'
            })) || []
        }))

        // 카테고리별로 데이터 그룹화
        const categories = {}
        processedData.forEach(item => {
            if (!categories[item.categoryId]) {
                categories[item.categoryId] = {
                    id: item.categoryId,
                    items: []
                }
            }
            categories[item.categoryId].items.push(item)
        })

        return Object.values(categories)
    } catch (error) {
        console.error('Error loading categories data:', error)
        return []
    }
}