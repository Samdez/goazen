function EmptyEventsSection({ activeTime, category }: { activeTime?: string; category?: string }) {
  return (
    <div className="flex h-96 flex-col items-center justify-center">
      <p className="p-8 text-4xl text-black">
        Rien de prévu {activeTime === 'day' ? 'ce soir' : 'cette semaine'}{' '}
        {category ? `en ${category.replace('_', '/')}` : ''}, une tisane et au lit! <br />
      </p>
      <p className="text-4xl">😴</p>
    </div>
  )
}

export default EmptyEventsSection
