import { createSecureImageUpload } from './secureImageUpload.js';

const {
    upload: uploadKtm,
    validateUploadedImage: validateKtmUpload
} = createSecureImageUpload('ktm');

export default uploadKtm;
export { validateKtmUpload };
