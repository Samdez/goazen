import { RichText } from '@payloadcms/richtext-lexical/react'
import { darkerGrotesque } from '../fonts'
import styles from '../styles.module.css'

export function RichTextWrapper({ data }: { data: any }) {
  return (
    <div className={`${darkerGrotesque.className} ${styles.richText}`}>
      <RichText data={data} />
    </div>
  )
}
