async function UnifiedFilterSections({
  buttons,
  title,
  subTitle,
}: {
  activeTime?: 'week' | 'day' | undefined
  title?: string
  subTitle?: string | React.ReactNode
  buttons?: React.ReactNode[]
  categoryParam?: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 px-12 md:px-32 gap-4 md:gap-24 pb-12">
      <div className="md:col-span-2 flex flex-col gap-4 justify-center">
        <h1 className="text-balance text-3xl text-left font-text font-bold">{title}</h1>
        <p className="font-text text-xl leading-none text-left">{subTitle}</p>
      </div>
      <div className="flex justify-center w-full">
        <div className="w-full flex justify-between ">{buttons}</div>
      </div>
    </div>
  )
}

export default UnifiedFilterSections
