import React from 'react'

const Header = ({title , Subtitle}: {title: String , Subtitle: String}) => {
  return (
    <> 
      <h2 className='h2-bold text-dark-600'>{title}</h2>
      {Subtitle && <p className='p-16-regular mt-4'>{Subtitle}</p>}
    </>
  )
}

export default Header ;