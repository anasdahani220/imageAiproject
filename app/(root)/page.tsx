import { Collection } from '@/components/shared/Collection';
import { navLinks } from '@/constants';
import { getAllImages } from '@/lib/actions/image.actions';
import { SearchParams } from 'next/dist/server/request/search-params';
import Link from 'next/link';
import React from 'react'



async function Home({searchParams}: SearchParamProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const searchQuery = typeof resolvedParams?.query === 'string' ? resolvedParams.query : '';

  const images = await getAllImages({ page, searchQuery });
  return (
    <>
      <section className='home'>
        <h1 className='home-heading'>
          Unleach Your Creative Vision With Imaginify
        </h1>
        <ul className='flex-center w-full gap-20'>
          {navLinks.slice(1, 5).map((link) => (
            <Link key={link.route} href={link.route} className='flex-center flex-col gap-4'>
              <li  className='flex-center w-fit rounded-full bg-white p-4' >
                <img src={link.icon} alt="icon" width={24} height={24}/>
              </li>
              <p className='p-14-medium text-white text-center'>
                {link.label}
              </p>
            </Link>
          ))}
        </ul>
      </section>
      <section className='max-sm:mt-12'>
        <Collection 
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPage}
          page={page}/>
      </section>
    </>
  )
}

export default Home;