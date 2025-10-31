export const isClient = typeof window !== 'undefined';

const getUserAgent = () => {
  if (!isClient) return '';
  return window.navigator.userAgent;
};

export const isSafari = () => {
  const userAgent = getUserAgent();
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
};

export const isFirefox = () => {
  const userAgent = getUserAgent();
  return /Firefox/.test(userAgent);
};

export const supportsBackdropFilter = () => {
  if (!isClient || typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false;
  }

  try {
    return CSS.supports('backdrop-filter', 'blur(10px)');
  } catch {
    return false;
  }
};

export const supportsBackdropFilterUrl = (filterId: string) => {
  if (!isClient) return false;

  if (isSafari() || isFirefox()) {
    return false;
  }

  const div = window.document.createElement('div');
  div.style.backdropFilter = `url(#${filterId})`;
  return div.style.backdropFilter !== '';
};
