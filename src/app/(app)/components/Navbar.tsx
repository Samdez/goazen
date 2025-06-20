'use client'
import Link from 'next/link'
import { MouseEventHandler, useState } from 'react'
import { cn } from '@/lib/utils'
import Burger from './icons/burger'
import Image from 'next/image'
import { CalendarDays } from 'lucide-react'

function Navbar() {
  const [activePage, setActivePage] = useState('/')
  const [isOpen, setIsOpen] = useState(false)

  function handleClickHome() {
    setActivePage('/')
    setIsOpen(false)
  }

  return (
    <>
      {<SideBar onClick={() => setIsOpen(false)} isOpen={isOpen} />}
      <div className="fixed top-0 z-50 grid h-32 w-full grid-cols-4 text-[#E45110] md:hidden">
        <Link
          href={'/'}
          onClick={handleClickHome}
          className={cn(
            'col-span-1 flex h-32 items-center justify-center text-4xl bg-[#FFF2DD] border-b-2 border-black',
          )}
        >
          <Image
            src="/GOAZEN_MASCOTTES.png"
            alt="Goazen!"
            width={100}
            height={100}
            // className="group-hover:opacity-0 transition-all duration-300 ease-in-outleft-4"
          />
          {/* <p className="text-3xl font-bold">Goazen!</p> */}
        </Link>
        <Link
          href={'/'}
          className="col-span-2 bg-[#FFF2DD] border-b-2 border-black flex flex-col justify-center items-center text-2xl pl-4"
        >
          <CalendarDays className="w-10 h-10" />
          <p className="text-xl text-center">Partage ton event</p>
        </Link>
        <div
          className="flex w-full items-center justify-center bg-[#FFF2DD] border-b-2 border-black text-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <div className="text-4xl">X</div> : <Burger />}
        </div>
      </div>
      <div className="fixed top-0 z-50 hidden h-32 w-full grid-cols-5 items-center justify-end bg-[#FFF2DD] text-black md:grid border-b-2 border-black">
        <Link
          href={'/'}
          onClick={() => setActivePage('/')}
          className={cn(
            'group col-span-1 flex items-center text-2xl transition-all duration-300 ease-in-out hover:bg-[#E45110] hover:text-[#FFF2DD] text-[#E45110] h-32 relative overflow-hidden',
          )}
        >
          <Image
            src="/GOAZEN_MASCOTTES.png"
            alt="Goazen!"
            width={100}
            height={100}
            className="group-hover:opacity-0 transition-all duration-300 ease-in-out absolute left-4"
          />
          <p className="text-6xl font-bold transition-all duration-300 ease-in-out absolute w-full text-center translate-x-16 group-hover:translate-x-0">
            Goazen!
          </p>
        </Link>
        {/* <Link
          href={'/concerts/pays-basque'}
          onClick={() => setActivePage('pays-basque')}
          className={cn(
            'col-span-1 flex items-center justify-center  text-2xl transition-colors hover:bg-black hover:text-[#FFF2DD] max-h-full min-h-full',
          )}
        >
          <p className="text-center text-6xl font-bold">Pays Basque</p>
        </Link> */}
        <NavBlock
          href={'/concerts/pays-basque'}
          text="Pays Basque"
          onClick={() => setActivePage('pays-basque')}
          className={activePage === 'pays-basque' ? 'bg-black text-[#FFF2DD]' : ''}
        />
        <NavBlock
          href={'/concerts/landes'}
          onClick={() => setActivePage('landes')}
          text="Landes"
          className={activePage === 'landes' ? 'bg-black text-[#FFF2DD]' : ''}
        />
        {/* <CityFilter
          href={'/concerts/bayonne'}
          onClick={() => setActivePage('bayonne')}
          className={activePage === 'bayonne' ? 'bg-black text-[#FFF2DD]' : ''}
          text="Bayonne"
        /> */}
        {/* <span></span> */}
        <NavBlock
          href={'/salles-de-concert?city=biarritz'}
          text="Les salles de concert"
          // secondaryText="du Pays Basque et des Landes"
          className={
            activePage === 'salles-de-concert' ? 'bg-black text-[#FFF2DD] font-text' : 'font-text'
          }
          onClick={() => setActivePage('/')}
        />
        <NavBlock
          href={'/salles-de-concert?city=biarritz'}
          text="Partage nous ton event!"
          className="bg-[#E45110] text-white h-16 w-36 rounded-lg justify-self-center px-2 gap-2 font-text border-none"
          onClick={() => setActivePage('/')}
          icon={<CalendarDays className="w-10 h-10" />}
          textSize="text-lg text-left leading-none"
        />
        {/* <CityFilter
          href={'/contact'}
          text="Contact"
          secondaryText="parle-nous de ta soirée"
          onClick={() => setActivePage('contact')}
          className={activePage === 'contact' ? 'bg-black text-[#FFF2DD]' : ''}
        /> */}
      </div>
    </>
  )
}

function NavBlock({
  href,
  onClick,
  text,
  className,
  secondaryText,
  icon,
  textSize,
}: {
  href: string
  text: string
  className?: string
  secondaryText?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  icon?: any
  textSize?: string
}) {
  return (
    <Link
      onClick={onClick}
      href={href}
      className={cn(
        'flex h-32 items-center justify-center rounded-none bg-[#FFF2DD] px-0 text-black transition-colors hover:bg-black hover:text-[#FFF2DD] border-b-2 border-black',
        className,
      )}
    >
      {icon}
      <div className="flex flex-col text-center">
        <p className={cn('text-3xl', textSize)}>{text}</p>
        <p className="text-md">{secondaryText}</p>
      </div>
    </Link>
  )
}

function SideBar({
  onClick,
  isOpen,
}: {
  onClick: MouseEventHandler<HTMLAnchorElement>
  isOpen: boolean
}) {
  return (
    <div
      className={cn(
        'fixed right-0 z-50 flex min-h-[86vh] w-full flex-col items-center justify-evenly bg-[#FFF2DD] py-2 text-black duration-300 ease-in-out sm:hidden',
        {
          'translate-x-0 ': isOpen,
          'translate-x-full': !isOpen,
        },
      )}
    >
      <NavBlock
        href={'/concerts/pays-basque'}
        text="Pays Basque"
        onClick={onClick}
        className="border-none"
      />
      <NavBlock href={'/concerts/landes'} text="Landes" onClick={onClick} className="border-none" />
      <NavBlock
        href={'/salles-de-concert?city=biarritz'}
        text="Les salles de concert"
        onClick={onClick}
        className="border-none"
      />
      {/* <NavBlock href={'/contact'} text="Contact" onClick={onClick} /> */}
    </div>
  )
}

export default Navbar
