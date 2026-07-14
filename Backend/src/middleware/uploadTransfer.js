import { createSecureImageUpload } from './secureImageUpload.js';

const {
    upload: uploadTransfer,
    validateUploadedImage: validateTransferUpload
} = createSecureImageUpload('transfer');

export default uploadTransfer;
export { validateTransferUpload };
