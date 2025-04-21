'use client'
import Link from 'next/link'
import { MouseEventHandler, useState } from 'react'
import { cn } from '@/lib/utils'
import Burger from './icons/burger'

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
      <div className="fixed top-0 z-50 grid h-32 w-full grid-cols-4 border-b-8 border-black bg-black text-[#FFDCA8] md:hidden">
        <Link
          href={'/'}
          onClick={handleClickHome}
          className={cn(
            'col-span-3 flex h-full items-center justify-center text-4xl transition-colors hover:bg-black hover:text-[#FFDCA8]',
            {
              'bg-black text-[#FFDCA8]': activePage === '/',
            },
          )}
        >
          <p className="w-10/12 text-center text-6xl font-bold">Goazen!</p>
        </Link>
        <div className="flex w-full items-center justify-center" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <div className="text-4xl">X</div> : <Burger />}
        </div>
      </div>
      <div className="fixed top-0 z-50 hidden h-32 w-full grid-cols-7 items-center  justify-end border-b-8 border-black bg-[#FFDCA8] text-black md:grid">
        <Link
          href={'/'}
          onClick={() => setActivePage('/')}
          className={cn(
            'col-span-1 flex h-full items-center justify-center  text-2xl transition-colors hover:bg-black hover:text-[#FFDCA8]',
            {
              'bg-black text-[#FFDCA8]': activePage === '/',
            },
          )}
        >
          <p className="text-center text-6xl font-bold">Goazen!</p>
        </Link>
        <CityFilter
          href={'/concerts/biarritz'}
          text="Biarritz"
          onClick={() => setActivePage('biarritz')}
          className={activePage === 'biarritz' ? 'bg-black text-[#FFDCA8]' : ''}
        />
        <CityFilter
          href={'/concerts/anglet'}
          onClick={() => setActivePage('anglet')}
          text="Anglet"
          className={activePage === 'anglet' ? 'bg-black text-[#FFDCA8]' : ''}
        />
        <CityFilter
          href={'/concerts/bayonne'}
          onClick={() => setActivePage('bayonne')}
          className={activePage === 'bayonne' ? 'bg-black text-[#FFDCA8]' : ''}
          text="Bayonne"
        />
        <span></span>
        <CityFilter
          href={'/lieux'}
          text="les salles de concert"
          secondaryText="du pays basque et des landes"
          className="bg-[#ee2244bc] text-white"
          onClick={() => setActivePage('/')}
        />
        <CityFilter
          href={'/contact'}
          text="Contact"
          secondaryText="parle-nous de ta soirée"
          onClick={() => setActivePage('contact')}
          className={activePage === 'contact' ? 'bg-black text-[#FFDCA8]' : ''}
        />
      </div>
    </>
  )
}

function CityFilter({
  href,
  onClick,
  text,
  className,
  secondaryText,
}: {
  href: string
  text: string
  className?: string
  secondaryText?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <Link
      onClick={onClick}
      href={href}
      className={cn(
        'flex h-full items-center justify-center rounded-none bg-[#FFDCA8] px-0 text-black transition-colors hover:bg-black hover:text-[#FFDCA8]',
        className,
      )}
    >
      <div className="flex flex-col text-center">
        <p className="text-3xl">{text}</p>
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
        'fixed right-0 z-50 flex min-h-[86vh] w-3/4 flex-col items-center justify-evenly bg-[#FFDCA8] py-2 text-black duration-300 ease-in-out sm:hidden',
        {
          'translate-x-0 ': isOpen,
          'translate-x-full': !isOpen,
        },
      )}
    >
      <CityFilter href={'/concerts/biarritz'} text="Biarritz" onClick={onClick} />
      <CityFilter href={'/concerts/anglet'} text="Anglet" onClick={onClick} />
      <CityFilter href={'/concerts/bayonne'} text="Bayonne" onClick={onClick} />
      <CityFilter href={'/contact'} text="Contact" onClick={onClick} />
    </div>
  )
}

export default Navbar
