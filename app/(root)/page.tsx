export const dynamic = "force-dynamic";
import { Collection } from '@/components/shared/Collection';
import { navLinks } from '@/constants';
import { getAllImages } from '@/lib/actions/image.actions';
import Link from 'next/link';
import React from 'react'

type SearchOnlyProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};


async function Home({searchParams}: SearchOnlyProps) {
      const params = await searchParams;
      const page = Number(params?.page ?? 1);
      const searchQuery = typeof params?.query === 'string' ? params.query : '';

    const images = await getAllImages({ page, searchQuery})

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
      <section className='sm:mt-12'>
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