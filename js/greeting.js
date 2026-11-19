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
  let run = 0, frame = 0, cancelWriting = () => {}, onComplete = null;
  let textLayers = [];
  function finish() {
    if (!onComplete) return;
    const complete = onComplete; onComplete = null;
    cancelAnimationFrame(frame); cancelWriting();
    lines.forEach((line, i) => {
      line.classList.add('revealed');
      const text = textLayers[i];
      if (text) { text.textContent = Personalization.messages()[i]; text.classList.remove('writing'); }
    });
    // Keep the existing glowing heart without inserting any recipient HTML.
    const last = textLayers[textLayers.length - 1];
    if (last && last.textContent.endsWith('♥')) {
      last.textContent = last.textContent.slice(0, -1);
      const heart = document.createElement('span'); heart.className = 'heart'; heart.textContent = '♥'; last.append(heart);
    }
    finale.classList.add('revealed'); document.querySelector('#letter').classList.add('done');
    Petals.burst(); sparkle(); complete();
  }
  function write(text, layer, id) {
    const characters = typeof Intl.Segmenter === 'function'
      ? [...new Intl.Segmenter('vi', {granularity:'grapheme'}).segment(text)].map(part => part.segment)
      : Array.from(text);
    const duration = Math.max(1000, Math.min(3200, characters.length * 22));
    return new Promise(resolve => {
      cancelWriting = resolve;
      let elapsed = 0, previous = 0, drawn = -1;
      layer.classList.add('writing');
      function tick(now) {
        if (id !== run || !onComplete) { resolve(); return; }
        // RAF pauses in hidden tabs; cap the delta to avoid jumping to the end on return.
        if (previous && !document.hidden) elapsed += Math.min(now - previous, 64);
        previous = now;
        const count = Math.min(characters.length, Math.floor(elapsed / duration * characters.length));
        if (count !== drawn) { layer.textContent = characters.slice(0, count).join(''); drawn = count; }
        if (elapsed >= duration) { layer.textContent = text; layer.classList.remove('writing'); resolve(); }
        else frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    });
  }
  motion.addEventListener('change', () => { if (motion.matches) finish(); });
  window.Greeting = {
    reveal(reduced, complete) {
      const id = ++run;
      onComplete = complete;
      document.querySelector('#letter-view').hidden = false;
      document.querySelector('#letter').focus({preventScroll:true});
      const texts = Personalization.messages();
      textLayers = lines.map((line, i) => {
        line.replaceChildren();
        // Keep a complete accessible copy; only the animated duplicate is aria-hidden.
        const reserve = document.createElement('span'); reserve.className = 'ink-reserve'; reserve.textContent = texts[i];
        const ink = document.createElement('span'); ink.className = 'ink-text'; ink.setAttribute('aria-hidden','true');
        line.append(reserve, ink); return ink;
      });
      if (reduced) { finish(); return; }
      (async () => {
        for (let i = 0; i < lines.length; i++) {
          if (id !== run || !onComplete) return;
          lines[i].classList.add('revealed');
          await write(texts[i], textLayers[i], id);
        }
        if (id === run) finish();
      })();
    },
    skip: finish,
    reset() {
      run++; onComplete = null; cancelAnimationFrame(frame); cancelWriting();
      clearTimeout(sparkleTimer); bouquet.classList.remove('sparkling');
      lines.forEach((p, i) => { p.classList.remove('revealed'); p.removeAttribute('aria-label'); p.textContent = Personalization.messages()[i]; });
      textLayers = [];
      finale.classList.remove('revealed'); document.querySelector('#letter').classList.remove('done');
    },
    async save() {
      // Render full source text, independently of animation, using only local assets.
      function timeout(promise, ms, message) {
        let timer;
        return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); })]).finally(() => clearTimeout(timer));
      }
      let scriptFont = '"Times New Roman"', fontFallback = false;
      try {
        await timeout(document.fonts.ready, 6000, 'Font timeout');
        const loaded = await timeout(document.fonts.load('600 46px "Dancing Script"'), 6000, 'Font timeout');
        if (!loaded.length) throw new Error('Font unavailable');
        scriptFont = '"Dancing Script", "Times New Roman"';
      } catch { fontFallback = true; }
      const canvas = document.createElement('canvas'); canvas.width = 1800;
      let ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Trình duyệt không hỗ trợ tạo ảnh.');
      const scale = 1.2; ctx.scale(scale, scale);
      function wrap(text, font, width = 1160) {
        ctx.font = font;
        const rows = []; let row = '';
        // Handle unbroken long names too, never clipping a URL-supplied word.
        for (const word of text.split(/\s+/)) {
          const candidate = row ? `${row} ${word}` : word;
          if (ctx.measureText(candidate).width <= width) { row = candidate; continue; }
          if (row) { rows.push(row); row = ''; }
          for (const char of Array.from(word)) {
            if (row && ctx.measureText(row + char).width > width) { rows.push(row); row = ''; }
            row += char;
          }
        }
        if (row) rows.push(row); return rows;
      }
      let y = 580;
      const layout = Personalization.messages().map((text, i) => {
        const font = i === 0 || i === 5 ? `600 46px ${scriptFont}` : '35px "Times New Roman"';
        const rows = wrap(text, font); const top = y; y += rows.length * 62 + 37;
        return {rows, font, top, color: i === 0 || i === 5 ? '#995661' : '#654321'};
      });
      const flowerY = Math.max(y, 1400);
      const senderText = Personalization.values.from ? `Người gửi: ${Personalization.values.from}` : '';
      const senderRows = senderText ? wrap(senderText, `600 38px ${scriptFont}`) : [];
      const happyY = flowerY + 330, signatureY = happyY + 65, senderY = signatureY + 75;
      const height = Math.max(2000, senderY + senderRows.length * 56 + 90);
      canvas.height = Math.ceil(height * scale); // Reset context, then reapply scale.
      ctx = canvas.getContext('2d'); ctx.scale(scale, scale);
      ctx.fillStyle = '#fff8f0'; ctx.fillRect(0,0,1500,height);
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2; ctx.strokeRect(45,45,1410,height-90); ctx.strokeStyle='#e5d4b0'; ctx.strokeRect(60,60,1380,height-120);
      ctx.textAlign='center'; ctx.fillStyle='#916b55'; ctx.font='24px Times New Roman'; ctx.fillText('CHÚC MỪNG NGÀY NHÀ GIÁO VIỆT NAM',750,160);
      ctx.fillStyle='#b76e79'; ctx.font='150px Times New Roman'; ctx.fillText('20 / 11',750,345);
      ctx.fillStyle='#997a50'; ctx.font='27px Times New Roman'; ctx.fillText('2 0 2 6',750,410); ctx.fillText('―  ✧  ―',750,475);
      ctx.textAlign='left';
      layout.forEach(block => { ctx.fillStyle = block.color; ctx.font = block.font; block.rows.forEach((row, i) => ctx.fillText(row, 170, block.top + i * 62)); });
      const svg = document.querySelector('.bouquet svg').cloneNode(true); svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
      svg.querySelectorAll('.bloom').forEach(node => node.removeAttribute('style'));
      const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
      try {
        const img = new Image();
        await timeout(new Promise((resolve,reject) => { img.onload=resolve; img.onerror=() => reject(new Error('Chưa tải được hoa. Vui lòng thử lưu lại.')); img.src=url; }), 6000, 'Tải hoa quá lâu. Vui lòng thử lưu lại.');
        ctx.drawImage(img,550,flowerY,400,246);
      } finally {URL.revokeObjectURL(url);}
      ctx.textAlign='center'; ctx.font=`600 45px ${scriptFont}`; ctx.fillStyle='#b76e79'; ctx.fillText("Happy Vietnamese Teachers' Day",750,happyY);
      ctx.font=`400 35px ${scriptFont}`; ctx.fillStyle='#997a6a'; ctx.fillText('Với tất cả yêu thương & lòng biết ơn',750,signatureY);
      ctx.font=`600 38px ${scriptFont}`; ctx.fillStyle='#995661'; senderRows.forEach((row, i) => ctx.fillText(row,750,senderY+i*56));
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png')); if(!blob) throw new Error('Export failed');
      const download=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=download; a.download='Thiep-tri-an-Thay-Co-20-11-2026.png'; document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(download),60000);
      return {fontFallback};
    }
  };
})();
