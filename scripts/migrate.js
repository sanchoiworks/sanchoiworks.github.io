const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

// Sanity 클라이언트 설정
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-05-09',
})

// JSON 파일 읽기
const mainData = JSON.parse(fs.readFileSync(path.join(__dirname, '../content/main/main.json'), 'utf8'))

async function migrateData() {
  try {
    // 각 아이템을 Sanity에 추가
    for (const item of mainData.items) {
      // 이미지 파일 경로를 Sanity 이미지 참조로 변환
      const imageAsset = await client.assets.upload('image', fs.createReadStream(path.join(__dirname, '..', item.image)))
      
      // detailImages의 이미지들도 변환
      const detailImages = await Promise.all(
        item.detailImages.map(async (detail) => {
          if (detail.image) {
            const imageAsset = await client.assets.upload('image', fs.createReadStream(path.join(__dirname, '..', detail.image)))
            return {
              _type: 'object',
              text: detail.text || '',
              image: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: imageAsset._id
                }
              },
              title: detail.title || ''
            }
          }
          return {
            _type: 'object',
            text: detail.text || '',
            title: detail.title || ''
          }
        })
      )

      // Sanity 문서 생성
      await client.create({
        _type: 'main',
        id: item.id,
        title: item.title,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        },
        description: item.description,
        detailImages: detailImages
      })
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateData() 