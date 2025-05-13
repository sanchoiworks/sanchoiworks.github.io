export default {
  name: 'index',
  title: 'Index',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'ID',
      type: 'string',
      options: {
        list: [
          { title: 'Space', value: 'space' },
          { title: 'Brand', value: 'brand' },
          { title: 'Object', value: 'object' },
          { title: 'Figure', value: 'figure' },
          { title: 'Personal', value: 'personal' },
          { title: 'Exhibition', value: 'exhibition' },
          { title: 'Letter', value: 'letter' },
          { title: 'Frames', value: 'frames' },
        ],
      },
    },
    {
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Title',
              type: 'string',
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'detailImages',
              title: 'Detail Images',
              type: 'array',
              of: [
                {
                  type: 'image',
                  options: {
                    hotspot: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
} 