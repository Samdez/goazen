// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import Users from './collections/Users'
import Medias from './collections/Medias'
import { s3Storage } from '@payloadcms/storage-s3'
import { ImagePlaceholder } from './app/globals/ImagePlaceholder'
import Events from './collections/Events'
import Categories from './collections/Categories'
import Locations from './collections/Locations'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { fields } from '@payloadcms/plugin-form-builder'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      // afterDashboard: [ExportComponent],
    },
  },
  collections: [Users, Medias, Events, Categories, Locations],
  editor: lexicalEditor(),
  globals: [ImagePlaceholder],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
    connectOptions: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 15000,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 5000,
      minPoolSize: 1,
      maxPoolSize: 5,
      maxConnecting: 2,
      waitQueueTimeoutMS: 5000,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        medias: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION,
      },
    }),
    seoPlugin({
      collections: ['events', 'locations'],
      // uploadsCollection: 'media',
      generateTitle: ({ doc }) => `goazen.info — ${doc.title}`,
      generateDescription: ({ doc }) => doc.description,
      tabbedUI: true,
    }),
    formBuilderPlugin({
      defaultToEmail: 'contact@goazen.info',
    }),
  ],
})
