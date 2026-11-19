(() => {
  let timeline;
  const animations = [];
  const el = selector => document.querySelector(selector);
  async function animate(selector, frames, options) {
    const animation = el(selector).animate(frames, {...options, fill: 'forwards'}); animations.push(animation); await animation.finished;
  }
  window.Envelope = {
    async open(reduced) {
      document.body.classList.add('opening');
      if (reduced) return;
      Petals.burst();
      if (window.gsap) {
        await new Promise(resolve => {
          timeline = gsap.timeline({onComplete: resolve});
          timeline.to('.envelope', {x: -5, rotation: -2, duration: .08, repeat: 3, yoyo: true})
            .to('.envelope', {x: 0, rotation: 0, duration: .12})
            .to('.seal', {scale: 1.25, opacity: 0, duration: .5})
            .to('.flap', {rotateX: 180, duration: 1, ease: 'power2.inOut'})
            .set('.flap', {zIndex: 0})
            .to('.insert', {y: -155, duration: 1, ease: 'power2.out'})
            .to('.envelope-wrap', {y: 50, opacity: 0, duration: .8}, '-=.3')
            .to('.insert', {scale: 1.08, duration: .5}, '<');
        });
      } else {
        await animate('.envelope', [{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:350});
        await animate('.seal', [{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.25)'}],{duration:500});
        await animate('.flap', [{transform:'rotateX(0)'},{transform:'rotateX(180deg)'}],{duration:1000,easing:'ease-in-out'});
        el('.flap').style.zIndex='0';
        await animate('.insert', [{transform:'translateY(0)'},{transform:'translateY(-155px)'}],{duration:1000,easing:'ease-out'});
        await animate('.envelope-wrap', [{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(50px)'}],{duration:700});
      }
    },
    reset() {
      if (timeline) { timeline.kill(); timeline = null; }
      animations.splice(0).forEach(a => a.cancel());
      ['.envelope','.envelope-wrap','.seal','.flap','.insert'].forEach(s => el(s).removeAttribute('style'));
      document.body.classList.remove('opening');
    }
  };
})();
