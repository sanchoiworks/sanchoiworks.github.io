const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Sanity 클라이언트 설정
const client = createClient({
  projectId: 'uc9sfpn2',
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
  apiVersion: '2024-03-19',
})

// JSON 파일 읽기
const mainData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../content/main/main.json'), 'utf8'))
const indexData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../content/index/index.json'), 'utf8'))

// 기존 이미지 파일들
const existingImages = [
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
  '/images/4.jpg'
]

// 랜덤 이미지 선택 함수
function getRandomImage() {
  return existingImages[Math.floor(Math.random() * existingImages.length)]
}

async function migrateData() {
  try {
    // Index 데이터 마이그레이션
    for (const category of indexData.categories) {
      // 각 카테고리의 items 마이그레이션
      for (const item of category.items) {
        // 기존 이미지가 없으면 랜덤 이미지 사용
        const imagePath = fs.existsSync(path.join(__dirname, '../../', item.image)) 
          ? item.image 
          : getRandomImage()
        
        const imageAsset = await client.assets.upload('image', fs.createReadStream(path.join(__dirname, '../../', imagePath)))
        
        // detailImages 변환
        const detailImages = await Promise.all(
          item.detailImages.map(async (detail) => {
            const detailImagePath = fs.existsSync(path.join(__dirname, '../../', detail.image))
              ? detail.image
              : getRandomImage()
            
            const detailImageAsset = await client.assets.upload('image', fs.createReadStream(path.join(__dirname, '../../', detailImagePath)))
            return {
              _type: 'object',
              image: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: detailImageAsset._id
                }
              }
            }
          })
        )

        // Sanity 문서 생성
        await client.create({
          _type: 'index',
          categoryId: category.id,
          id: item.id,
          title: item.title,
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id
            }
          },
          detailImages: detailImages
        })
        console.log(`Migrated index item: ${item.title} (${category.id})`)
      }
    }

    // Main 데이터 마이그레이션
    for (const item of mainData.items) {
      // 이미지 파일 경로를 Sanity 이미지 참조로 변환
      const imagePath = fs.existsSync(path.join(__dirname, '../../', item.image))
        ? item.image
        : getRandomImage()
      
      const imageAsset = await client.assets.upload('image', fs.createReadStream(path.join(__dirname, '../../', imagePath)))
      
      // detailImages의 이미지들도 변환
      const detailImages = await Promise.all(
        item.detailImages.map(async (detail) => {
          if (detail.image) {
            const detailImagePath = fs.existsSync(path.join(__dirname, '../../', detail.image))
              ? detail.image
              : getRandomImage()
            
            const imageAsset = await client.assets.upload('image', fs.createReadStream(path.join(__dirname, '../../', detailImagePath)))
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

      console.log(`Migrated main item: ${item.title}`)
    }
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateData() 