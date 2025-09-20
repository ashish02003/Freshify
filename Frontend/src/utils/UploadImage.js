


import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const uploadImage = async(image, onUploadProgress) => {
    try {
        const formData = new FormData()
        formData.append('image', image)

        const response = await Axios({
            ...SummaryApi.uploadImage,
            data: formData,
            onUploadProgress: onUploadProgress ? (progressEvent) => {
                if (progressEvent.total) {
                    onUploadProgress(progressEvent)
                }
            } : undefined
        })

        return response
    } catch (error) {
        return error
    }
}

export default uploadImage