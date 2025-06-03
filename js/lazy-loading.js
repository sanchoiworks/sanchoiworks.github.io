// Lazy loading 구현
document.addEventListener('DOMContentLoaded', () => {
  const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  };

  // 초기 로딩
  lazyLoadImages();

  // 동적으로 추가되는 이미지를 위한 MutationObserver
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        lazyLoadImages();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}); 