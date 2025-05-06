document.addEventListener('DOMContentLoaded', () => {
    console.log('loaded')
    document.querySelectorAll('.dithered-image-toggle').forEach((fig) => {
      const img = fig.querySelector('img');
      const btn = fig.querySelector('button');
      const srcA = fig.dataset.srcA;
      const srcB = fig.dataset.srcB;
  
      btn.addEventListener('click', () => {
        img.src = img.src.includes(srcA) ? srcB : srcA;
      });
      console.log('click listener added')
    });
  });
  