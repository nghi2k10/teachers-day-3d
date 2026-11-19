(() => {
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state='closed', statusTimer, wantsMusic=false;
  function notify(message){clearTimeout(statusTimer);$('#status').textContent=message;statusTimer=setTimeout(()=>$('#status').textContent='',6000);}
  $('#envelope').addEventListener('click', async () => {
    if(state!=='closed') return; state='opening'; $('#envelope').disabled=true; $('#envelope').setAttribute('aria-expanded','true'); $('#open-hint').textContent='Một chút yêu thương đang được mở ra…';
    try { await Envelope.open(reduced.matches); }
    catch { /* Still show the card if browser animation is unavailable. */ }
    $('#intro').hidden=true; window.scrollTo({top:0,behavior:'instant'});
    $('#skip').hidden=false;
    Greeting.reveal(reduced.matches,()=>{state='open';$('.actions').hidden=false;$('#skip').hidden=true;});
  });
  $('#skip').addEventListener('click',()=>{Greeting.skip();$('#save').focus({preventScroll:true});});
  $('#replay').addEventListener('click',()=>{
    Greeting.reset(); Envelope.reset(); Petals.reset(); $('.actions').hidden=true; $('#letter-view').hidden=true; $('#intro').hidden=false;
    $('#skip').hidden=false;
    $('#envelope').disabled=false; $('#envelope').setAttribute('aria-expanded','false'); $('#open-hint').textContent='✧ Nhấn vào phong thư để khám phá điều bất ngờ 💌';state='closed';window.scrollTo({top:0,behavior:'instant'});$('#envelope').focus({preventScroll:true});
  });
  $('#save').addEventListener('click',async()=>{
    $('#save').disabled=true; $('#save').textContent='Đang tạo ảnh…';
    try{const result=await Greeting.save();notify(result.fontFallback?'Đã lưu PNG với font dự phòng vì font viết tay chưa tải được.':'Đã tạo ảnh PNG. Hãy kiểm tra mục tải xuống của trình duyệt.');}
    catch(error){notify(error.message || 'Chưa thể lưu ảnh. Vui lòng thử lại.');}
    finally{$('#save').disabled=false;$('#save').textContent='📸 Lưu thiệp';}
  });
  let shareBusy=false;
  document.querySelectorAll('[data-share]').forEach(button=>button.addEventListener('click',async()=>{
    if(shareBusy)return;shareBusy=true;
    const url=Personalization.shareURL();
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url); notify('Đã sao chép link thiệp kèm tên người nhận và người gửi.');
    }catch{
      $('#share-fallback').hidden=false;$('#share-url').value=url;$('#share-url').focus();$('#share-url').select();
      $('#share-fallback')._trigger=button;
    }finally{shareBusy=false;}
  }));
  function closeShare(){const trigger=$('#share-fallback')._trigger;$('#share-fallback').hidden=true;trigger?.focus();}
  $('#close-share').addEventListener('click',closeShare);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#share-fallback').hidden)closeShare();});
  const audio=$('#audio'); audio.volume=.35;
  let musicRequest=0;
  function musicUI(on){$('#music').setAttribute('aria-pressed',String(on));$('#music').setAttribute('aria-label',on?'Tắt nhạc nền':'Bật nhạc nền');$('#music-label').textContent=on?'Tắt nhạc':'Bật nhạc';}
  $('#music').addEventListener('click',async()=>{
    const request=++musicRequest;
    wantsMusic=!wantsMusic;musicUI(wantsMusic);
    if(!wantsMusic){audio.pause();return;}
    try{
      await audio.play();
      if(!wantsMusic || document.hidden)audio.pause();
    }catch{
      if(request!==musicRequest || document.hidden)return;
      wantsMusic=false;musicUI(false);notify('Chưa tải được nhạc nền hoặc trình duyệt chưa cho phép phát. Bạn vẫn có thể đọc thiệp.');
    }
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)audio.pause();else if(wantsMusic)audio.play().catch(()=>{wantsMusic=false;musicUI(false);});
    if(window.gsap)gsap.globalTimeline.paused(document.hidden);
    document.getAnimations().forEach(a=>{if(document.hidden&&a.playState==='running'){a.pause();a._hiddenPause=true;}else if(!document.hidden&&a._hiddenPause){a.play();a._hiddenPause=false;}});
  });
})();
