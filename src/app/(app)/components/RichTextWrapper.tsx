import { RichText } from '@payloadcms/richtext-lexical/react'
import { darkerGrotesque } from '../fonts'
import styles from '../styles.module.css'

export function RichTextWrapper({ data, className }: { data: any; className?: string }) {
  return (
    <div className={`${darkerGrotesque.className} ${styles.richText} ${className}`}>
      <RichText data={data} />
    </div>
  )
}
