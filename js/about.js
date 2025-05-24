document.querySelector('.close-btn').addEventListener('click', () => {
  const aboutPage = document.querySelector('.about-page');
  aboutPage.classList.add('fade-out');
  
  setTimeout(() => {
    window.history.back();
  }, 300); // transition duration과 동일하게 설정
});
