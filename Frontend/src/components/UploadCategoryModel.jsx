

import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError';

const UploadCategoryModel = ({close, fetchData}) => {
    const [data,setData] = useState({
        name : "",
        image : ""
    })
    const [loading,setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)

    const handleOnChange = (e)=>{
        const { name, value} = e.target

        setData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()

        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.addCategory,
                data : data
            })
            const { data : responseData } = response

            if(responseData.success){
                toast.success(responseData.message)
                close()
                fetchData()
            }
        } catch (error) {
            AxiosToastError(error)
        }finally{
            setLoading(false)
        }
    }

    const handleUploadCategoryImage = async(e)=>{
        const file = e.target.files[0]

        if(!file){
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        // Progress callback function
        const progressCallback = (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
        }

        try {
            const response = await uploadImage(file, progressCallback)
            
            // Check if response is successful
            if(response?.data?.data?.url) {
                const { data : ImageResponse } = response

                setData((preve)=>{
                    return{
                        ...preve,
                        image : ImageResponse.data.url
                    }
                })
                
                toast.success('Image uploaded successfully!')
                
                // Keep 100% for a moment before resetting
                setTimeout(() => {
                    setUploadProgress(0)
                }, 500)
            } else {
                toast.error('Failed to upload image')
                setUploadProgress(0)
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
            setUploadProgress(0)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 p-4 bg-neutral-800 bg-opacity-60 flex items-center justify-center z-50'>
            <div className='bg-white max-w-4xl w-full p-4 rounded'>
                <div className='flex items-center justify-between'>
                    <h1 className='font-semibold'>Category</h1>
                    <button onClick={close} className='w-fit block ml-auto'>
                        <IoClose size={25}/>
                    </button>
                </div>
                <form className='my-3 grid gap-2' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor='categoryName'>Name</label>
                        <input
                            type='text'
                            id='categoryName'
                            placeholder='Enter category name'
                            value={data.name}
                            name='name'
                            onChange={handleOnChange}
                            className='bg-blue-50 p-2 border border-blue-100 focus-within:border-primary-200 outline-none rounded'
                            required
                        />
                    </div>
                    <div className='grid gap-1'>
                        <p>Image</p>
                        <div className='flex gap-4 flex-col lg:flex-row items-center'>
                            <div className='border bg-blue-50 h-36 w-full lg:w-36 flex items-center justify-center rounded relative overflow-hidden'>
                                {
                                    data.image ? (
                                        <img
                                            alt='category'
                                            src={data.image}
                                            className='w-full h-full object-scale-down'
                                        />
                                    ) : (
                                        <>
                                            {isUploading ? (
                                                <div className='text-center'>
                                                    <div className='text-3xl font-bold text-primary-200'>
                                                        {uploadProgress}%
                                                    </div>
                                                    <p className='text-xs text-neutral-500 mt-1'>Uploading...</p>
                                                </div>
                                            ) : (
                                                <p className='text-sm text-neutral-500'>No Image</p>
                                            )}
                                        </>
                                    )
                                }
                                
                                {/* Animated progress bar overlay */}
                                {isUploading && (
                                    <div className='absolute bottom-0 left-0 right-0 h-2 bg-gray-200'>
                                        <div 
                                            className='h-full bg-gradient-to-r from-blue-500 to-primary-200 transition-all duration-300 ease-out'
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}

                                {/* Semi-transparent overlay during upload */}
                                {isUploading && (
                                    <div className='absolute inset-0 bg-white bg-opacity-30' />
                                )}
                            </div>

                            <div className='flex flex-col gap-3'>
                                <label htmlFor='uploadCategoryImage'>
                                    <div className={`
                                        ${!data.name || isUploading ? "bg-gray-300 cursor-not-allowed" : "border-primary-200 hover:bg-primary-100 cursor-pointer"} 
                                        px-4 py-2 rounded border font-medium text-center min-w-[150px]
                                    `}>
                                        {isUploading ? (
                                            <span className='flex items-center justify-center gap-2'>
                                                <span className='inline-block animate-spin'>⏳</span>
                                                {uploadProgress}%
                                            </span>
                                        ) : (
                                            'Upload Image'
                                        )}
                                    </div>
                                    <input 
                                        disabled={!data.name || isUploading} 
                                        onChange={handleUploadCategoryImage} 
                                        type='file' 
                                        id='uploadCategoryImage' 
                                        className='hidden'
                                        accept='image/*'
                                    />
                                </label>
                                
                                {/* Detailed progress bar */}
                                {isUploading && (
                                    <div className='w-full min-w-[250px]'>
                                        <div className='flex justify-between text-xs text-gray-600 mb-1'>
                                            <span>Upload Progress</span>
                                            <span className='font-medium'>{uploadProgress}%</span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-2.5 overflow-hidden'>
                                            <div 
                                                className='bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end'
                                                style={{ width: `${uploadProgress}%` }}
                                            >
                                                {uploadProgress > 10 && (
                                                    <span className='text-[8px] text-white mr-1 font-bold'>
                                                        {uploadProgress}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className='text-xs text-gray-500 mt-1'>
                                            {uploadProgress < 30 && 'Starting upload...'}
                                            {uploadProgress >= 30 && uploadProgress < 70 && 'Uploading image...'}
                                            {uploadProgress >= 70 && uploadProgress < 100 && 'Almost done...'}
                                            {uploadProgress === 100 && 'Processing...'}
                                        </p>
                                    </div>
                                )}

                                {/* File size info (optional) */}
                                {isUploading && (
                                    <div className='text-xs text-gray-500'>
                                        Please wait while your image is being uploaded
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type='submit'
                        disabled={loading || isUploading || !data.name || !data.image}
                        className={`
                            ${data.name && data.image && !loading && !isUploading 
                                ? "bg-primary-200 hover:bg-primary-100 cursor-pointer" 
                                : "bg-gray-300 cursor-not-allowed"}
                            py-2 font-semibold transition-all duration-200 rounded
                        `}
                    >
                        {loading ? (
                            <span className='flex items-center justify-center gap-2'>
                                <span className='inline-block animate-spin'>⏳</span>
                                Adding Category...
                            </span>
                        ) : (
                            'Add Category'
                        )}
                    </button>
                </form>
            </div>
        </section>
    )
}

export default UploadCategoryModel
