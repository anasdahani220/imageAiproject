"use client" ;
import React, { Dispatch } from 'react'
import {CldImage, CldUploadWidget} from 'next-cloudinary'
import {toast} from 'sonner' ;
import Image from 'next/image';
import { dataUrl, getImageSize } from '@/lib/utils';
import {PlaceholderValue } from 'next/dist/shared/lib/get-img-props';

interface MediaUploaderProps {
    onValueChange: (value: string) => void ;
    type: string ,
    publicId: string ,
    setImage : React.Dispatch<any> ,
    image: any ,
}

function MediaUploader({onValueChange , type , publicId , setImage , image}: MediaUploaderProps) {
  
  const onUploadSuccesHandler = (result: any) => {
     setImage((prevState: any) =>  ({
        ...prevState,
        publicId: result?.info?.public_id ,
        width: result?.info?.width ,
        height: result?.info?.height ,
        secureURL: result?.info?.secure_URL ,
     }))

     onValueChange(result?.info?.public_id)

     toast('Image Uploaded Succesfly', {
        description: '1 credit was detected from your account' ,
        duration: 5000 ,
        className: 'success-toast',
      })
  }
  const onUploadDErrorHandler = () => {
      toast('something went wrong while uploading', {
        description: 'please try again' ,
        duration: 5000 ,
        className: 'error-toast',
      })
  }
  return (
    <CldUploadWidget  
     uploadPreset='ai_image'
     options={{
        multiple: false ,
        resourceType: 'image' ,
     }}
     onSuccess={onUploadSuccesHandler}
     onError={onUploadDErrorHandler}>
        {({open}) => (
            <div className='flex flex-col gap-4'>
                <h3 className='font-bold text-dark-600'>
                    Original
                </h3>
                {publicId ? (
                    <>
                      <div className='cursor-pointer overflow-hidden rounded-[10px]'>
                        <CldImage width={getImageSize(type , image , 'width')} 
                                  height={getImageSize(type , image , 'height')}
                                  src={publicId} 
                                  alt='image'
                                  sizes='(amx-width 767px) 100vw , 50vw'
                                  placeholder={dataUrl as PlaceholderValue}
                                  className='media-uploader_cldImage'/>
                      </div>
                    </>
                ) : (
                    <div className='media-uploader_cta' onClick={() => open()}>
                        <div className='media-uploader_cta-image'>
                            <Image src="/assets/icons/add.svg" alt='add image' width={24} height={24} />
                        </div>
                        <p className='p-14-medium'>Clek Here To Upload Image</p>
                    </div>
                )}
            </div>
        )}
    </CldUploadWidget>
  )
}

export default MediaUploader ;