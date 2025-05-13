export default {
  name: 'index',
  title: 'Index',
  type: 'document',
  fields: [
    {
      name: 'categoryId',
      title: 'Category ID',
      type: 'string',
      description: '카테고리 ID (space, brand, object, figure 등)'
    },
    {
      name: 'id',
      title: 'ID',
      type: 'string',
      description: '프로젝트 고유 ID'
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: '프로젝트 제목'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      description: '프로젝트 대표 이미지'
    },
    {
      name: 'detailImages',
      title: 'Detail Images',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              description: '상세 이미지'
            }
          ]
        }
      ],
      description: '프로젝트 상세 이미지들'
    }
  ]
} 