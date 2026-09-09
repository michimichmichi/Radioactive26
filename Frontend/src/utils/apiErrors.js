export const getApiErrorMessage = (error) => {
  if (!error.response) {
    return ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code)
      ? 'The server took too long to respond. Check your connection and try again. If you submitted a form, check whether it was saved before resubmitting.'
      : 'We could not reach the server. Check your internet connection and try again. If your connection works, the server may be temporarily unavailable.';
  }

  const { status, data } = error.response;
  const fallbacks = {
    400: 'Some submitted information is invalid. Check the form and try again.',
    401: 'Your session has ended. Please log in again.',
    403: 'Your account does not have permission to do this.',
    404: 'The requested item is no longer available. Refresh the page and try again.',
    409: 'This information is already in use. Check your existing registration or choose a different value.',
    413: 'The upload or form is too large. Use one JPG or PNG image up to 5 MB and shorten long text fields.',
    429: 'Too many requests. Please wait a few minutes before trying again.',
  };
  const message = typeof data?.message === 'string' && data.message.trim()
    ? data.message
    : fallbacks[status] || (status >= 500
      ? 'The server is temporarily unavailable. Please try again in a few minutes.'
      : 'The request could not be completed. Refresh the page and try again.');
  const requestId = data?.requestId || error.response.headers?.['x-request-id'];
  return requestId ? `${message} (Reference: ${requestId})` : message;
};
