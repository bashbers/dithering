document.addEventListener('DOMContentLoaded', () => {
    console.log('loaded')
    document.querySelectorAll<HTMLElement>('.dithered-image-container').forEach((fig) => {
      const img = fig.querySelector<HTMLImageElement>('img');
      const btn = fig.querySelector<HTMLButtonElement>('button');
      const srcA = fig.dataset.srcA;
      const srcB = fig.dataset.srcB;
  
      if (!img || !btn || !srcA || !srcB) return; //ensure btn, img and srcs are available

      btn.addEventListener('click', () => {
        img.src = img.src.includes(srcA) ? srcB : srcA;
        img.classList.toggle('dithered');
      });
      console.log('click listener added')
    });
  });
  