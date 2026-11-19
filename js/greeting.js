(() => {
  const lines = [...document.querySelectorAll('.greeting-line')];
  const finale = document.querySelector('.finale');
  const bouquet = document.querySelector('.bouquet');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let sparkleTimer;
  bouquet.setAttribute('role', 'button');
  bouquet.setAttribute('tabindex', '0');
  bouquet.setAttribute('aria-label', 'Chạm để bó hoa tỏa sáng');
  // Wrap each bloom so its original SVG translate remains intact.
  [...bouquet.querySelector('.flowers').children].forEach((flower, i) => {
    const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrapper.classList.add('bloom'); wrapper.style.setProperty('--bloom-delay', `${i * .18}s`);
    flower.before(wrapper); wrapper.append(flower);
  });
  for (let i = 0; i < 10; i++) {
    const spark = document.createElement('span'); spark.className = 'bouquet-spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.style.setProperty('--spark-x', `${18 + (i * 29) % 70}%`);
    spark.style.setProperty('--spark-drift', `${(i % 2 ? 1 : -1) * (12 + i * 3)}px`);
    spark.style.setProperty('--spark-delay', `${i * .07}s`); bouquet.append(spark);
  }
  function sparkle() {
    if (!finale.classList.contains('revealed') || bouquet.classList.contains('sparkling')) return;
    bouquet.classList.add('sparkling');
    clearTimeout(sparkleTimer);
    sparkleTimer = setTimeout(() => bouquet.classList.remove('sparkling'), motion.matches ? 500 : 2200);
  }
  bouquet.addEventListener('pointerenter', sparkle);
  bouquet.addEventListener('click', sparkle);
  bouquet.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); sparkle(); }
  });
  let timers = [];
  const later = (fn, delay) => timers.push(setTimeout(fn, delay));
  window.Greeting = {
    reveal(reduced, complete) {
      document.querySelector('#letter-view').hidden = false;
      document.querySelector('#letter').focus({preventScroll:true});
      lines.forEach((p, i) => later(() => p.classList.add('revealed'), reduced ? 0 : 500 + i * 1100));
      later(() => { finale.classList.add('revealed'); document.querySelector('#letter').classList.add('done'); Petals.burst(); }, reduced ? 0 : 7300);
      later(complete, reduced ? 0 : 10000);
    },
    reset() {
      timers.forEach(clearTimeout); timers = [];
      clearTimeout(sparkleTimer); bouquet.classList.remove('sparkling');
      lines.forEach(p => p.classList.remove('revealed')); finale.classList.remove('revealed'); document.querySelector('#letter').classList.remove('done');
    },
    async save() {
      // Draw a self-contained high-resolution PNG: no CDN, remote fonts, or SVG foreignObject needed.
      await document.fonts.ready;
      await document.fonts.load('600 43px "Dancing Script"').catch(() => []);
      const canvas = document.createElement('canvas'); canvas.width = 1500; canvas.height = 2000;
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#fff8f0'; ctx.fillRect(0,0,1500,2000);
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2; ctx.strokeRect(45,45,1410,1910); ctx.strokeStyle='#e5d4b0'; ctx.strokeRect(60,60,1380,1880);
      ctx.textAlign='center'; ctx.fillStyle='#916b55'; ctx.font='24px Times New Roman'; ctx.fillText('CHÚC MỪNG NGÀY NHÀ GIÁO VIỆT NAM',750,160);
      ctx.fillStyle='#b76e79'; ctx.font='150px Times New Roman'; ctx.fillText('20 / 11',750,345);
      ctx.fillStyle='#997a50'; ctx.font='27px Times New Roman'; ctx.fillText('2 0 2 6',750,410); ctx.fillText('―  ✧  ―',750,475);
      let y=580; ctx.textAlign='left';
      lines.forEach((p,i) => {
        ctx.fillStyle=i===0||i===5?'#995661':'#654321'; ctx.font=i===0||i===5?'600 46px "Dancing Script", "Times New Roman"':'35px "Times New Roman"';
        const words=p.textContent.trim().split(/\s+/); let line='';
        words.forEach(word => { const next=line?line+' '+word:word; if(ctx.measureText(next).width>1160 && line){ctx.fillText(line,170,y);y+=58;line=word;}else line=next; });
        ctx.fillText(line,170,y); y+=95;
      });
      const svg = document.querySelector('.bouquet svg').cloneNode(true); svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
      const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
      try { const img=new Image(); await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;}); ctx.drawImage(img,550,Math.max(y-25,1450),400,246); } finally {URL.revokeObjectURL(url);}
      ctx.textAlign='center'; ctx.font='600 45px "Dancing Script", "Times New Roman"'; ctx.fillStyle='#b76e79'; ctx.fillText("Happy Vietnamese Teachers' Day",750,1810);
      ctx.font='400 35px "Dancing Script", "Times New Roman"'; ctx.fillStyle='#997a6a'; ctx.fillText('Với tất cả yêu thương & lòng biết ơn',750,1870);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png')); if(!blob) throw new Error('Export failed');
      const download=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=download; a.download='Thiep-tri-an-Thay-Co-20-11-2026.png'; document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(download),60000);
    }
  };
})();
