const labels = {
    name: 'Name', email: 'Email address', password: 'Password', university: 'University',
    nim: 'NIM', role: 'Role', teamName: 'Team name', leaderId: 'Team leader',
    members: 'Team members', competitionId: 'Competition', competitionName: 'Competition name',
    time: 'Date and time', place: 'Location', termsAndConditions: 'Terms and conditions',
};

export const sendError = (error, req, res) => {
    // Raw database messages may contain submitted values, credentials, or connection URLs.
    res.locals.errorDetails = {
        name: error.name,
        code: error.code,
        type: error.type,
        fields: error.errors ? Object.keys(error.errors).filter((key) => labels[key]) : undefined,
        configuration: error.message === 'JWT_SECRET is not configured' ? 'JWT_SECRET is missing' : undefined,
        stack: error.stack?.split('\n').slice(1).filter((line) => /^\s+at /.test(line)).join('\n'),
    };
    let status = 500;
    let message = 'The server could not complete your request. Please try again later. If this continues, contact the organizers with the reference below.';
    if (error.code === 11000) {
        status = 409;
        const field = Object.keys(error.keyPattern || error.keyValue || {}).find((key) => labels[key]);
        message = field === 'email' ? 'This email address is already registered. Log in or use a different email address.'
            : field === 'nim' ? 'This NIM is already registered. Check your NIM or log in to your existing account.'
                : `${labels[field] || 'This record'} is already in use. Please choose a different value.`;
    } else if (error.name === 'ValidationError') {
        status = 400;
        const fields = Object.keys(error.errors || {}).map((key) => labels[key]).filter(Boolean);
        message = `Please check ${fields.length ? fields.join(', ') : 'the submitted fields'}. Required values must be filled in and use the allowed format and length.`;
    } else if (error.name === 'CastError') {
        status = 400;
        message = `${labels[error.path] || 'A selected record'} is invalid. Refresh the page and select it again.`;
    } else if (['entity.too.large', 'parameters.too.many'].includes(error.type)) {
        status = 413;
        message = 'This form contains too much data. Shorten the text fields and submit it again.';
    } else if (error.type === 'entity.parse.failed') {
        status = 400;
        message = 'The submitted data could not be read. Refresh the page and submit the form again.';
    } else if (error.message === 'Origin is not allowed') {
        status = 403;
        message = 'This website is not allowed to access the server. Open the official Radioactive website and try again.';
    } else if (error.code === 'LIMIT_FILE_SIZE') {
        status = 400;
        message = 'Your image is too large. Choose a JPG or PNG image that is 5 MB or smaller.';
    } else if (['LIMIT_FILE_COUNT', 'LIMIT_UNEXPECTED_FILE'].includes(error.code)) {
        status = 400;
        message = 'Upload only one image in the KTM or payment proof field for this form.';
    } else if (error.name === 'MulterError') {
        status = 400;
        message = 'The upload contains too many fields or too much text. Reduce the form size and upload one JPG or PNG image up to 5 MB.';
    } else if (error.code === 'INVALID_IMAGE_TYPE') {
        status = 400;
        message = 'This file type is not supported. Choose a JPG, JPEG, or PNG image up to 5 MB.';
    } else if (['MongoNetworkError', 'MongoServerSelectionError', 'MongooseServerSelectionError'].includes(error.name) || /buffering timed out/i.test(error.message || '')) {
        status = 503;
        message = 'The server cannot connect to the database right now. Please try again in a few minutes.';
    }
    return res.status(status).json({ message });
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) return next(error);
    return sendError(error, req, res);
};
