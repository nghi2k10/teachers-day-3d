(() => {
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state='closed', statusTimer, wantsMusic=false;
  function notify(message){clearTimeout(statusTimer);$('#status').textContent=message;statusTimer=setTimeout(()=>$('#status').textContent='',6000);}
  $('#envelope').addEventListener('click', async () => {
    if(state!=='closed') return; state='opening'; $('#envelope').disabled=true; $('#envelope').setAttribute('aria-expanded','true'); $('#open-hint').textContent='Một chút yêu thương đang được mở ra…';
    try { await Envelope.open(reduced.matches); }
    catch(error){ console.warn('Chuyển sang hiển thị thiệp tĩnh.',error); }
    $('#intro').hidden=true; window.scrollTo({top:0,behavior:'instant'});
    Greeting.reveal(reduced.matches,()=>{state='open';$('.actions').hidden=false;});
  });
  $('#replay').addEventListener('click',()=>{
    Greeting.reset(); Envelope.reset(); Petals.reset(); $('.actions').hidden=true; $('#letter-view').hidden=true; $('#intro').hidden=false;
    $('#envelope').disabled=false; $('#envelope').setAttribute('aria-expanded','false'); $('#open-hint').textContent='✧ Nhấn vào phong thư để khám phá điều bất ngờ 💌';state='closed';window.scrollTo({top:0,behavior:'instant'});$('#envelope').focus({preventScroll:true});
  });
  $('#save').addEventListener('click',async()=>{
    $('#save').disabled=true; $('#save').textContent='Đang tạo ảnh…';
    try{await Greeting.save();notify('Đã tạo ảnh PNG. Hãy kiểm tra mục tải xuống của trình duyệt.');}
    catch(error){notify('Chưa thể lưu ảnh. Bạn có thể thử lại hoặc chụp màn hình thiệp.');console.warn(error);}
    finally{$('#save').disabled=false;$('#save').textContent='📸 Lưu thiệp';}
  });
  const audio=$('#audio'); audio.volume=.35;
  let audioFallback=false;
  audio.addEventListener('error',()=>{
    if(!audioFallback){audioFallback=true;audio.src='assets/audio/background.wav';}
  });
  function musicUI(on){$('#music').setAttribute('aria-pressed',String(on));$('#music').setAttribute('aria-label',on?'Tắt nhạc nền':'Bật nhạc nền');$('#music-label').textContent=on?'Tắt nhạc':'Bật nhạc';}
  $('#music').addEventListener('click',async()=>{
    if(wantsMusic){wantsMusic=false;audio.pause();musicUI(false);return;}
    try{
      try{await audio.play();}catch(error){
        if(!audioFallback){audioFallback=true;audio.src='assets/audio/background.wav';}
        await audio.play();
      }
      wantsMusic=true;musicUI(true);
    }catch{notify('Chưa có nhạc nền hoặc trình duyệt chưa cho phép phát. Thiệp vẫn hoạt động bình thường.');musicUI(false);}
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)audio.pause();else if(wantsMusic)audio.play().catch(()=>{wantsMusic=false;musicUI(false);});
    if(window.gsap)gsap.globalTimeline.paused(document.hidden);
    document.getAnimations().forEach(a=>{if(document.hidden&&a.playState==='running'){a.pause();a._hiddenPause=true;}else if(!document.hidden&&a._hiddenPause){a.play();a._hiddenPause=false;}});
  });
})();
