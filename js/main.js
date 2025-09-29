
// Particles
(() => {
  const c = document.getElementById('fx'); if(!c || !c.getContext) return;
  const ctx = c.getContext('2d'); let w,h,dpr; const P=[]; const N=130;
  const R=(a,b)=>a+Math.random()*(b-a);
  const size=()=>{ dpr=Math.min(devicePixelRatio||1,2); w=c.width=innerWidth*dpr; h=c.height=innerHeight*dpr; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; };
  const init=()=>{ P.length=0; for(let i=0;i<N;i++) P.push({x:R(0,w),y:R(0,h),vx:R(-.12,.12),vy:R(-.12,.12),r:R(.5,1.6)*dpr,a:R(.15,.55)}); };
  const step=()=>{ ctx.clearRect(0,0,w,h); for(const p of P){ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1; ctx.globalAlpha=p.a; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); }
    ctx.strokeStyle='rgba(255,255,255,.08)';
    for(let i=0;i<P.length;i++){ for(let j=i+1;j<P.length;j++){ const p=P[i],q=P[j]; const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
      if(d<110*dpr){ ctx.globalAlpha=(1-d/(110*dpr))*.6; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke(); } } }
    requestAnimationFrame(step);
  };
  addEventListener('resize', size, {passive:true}); size(); init(); requestAnimationFrame(step);
})();

// Loader typing + audio start + safe hide
(() => {
  const el=document.getElementById('loader');
  const out=document.getElementById('loaderText');
  const audio=document.getElementById('bgm');
  if(!el || !out || !audio) return;

  const lines = ["加载中…", "请稍候", "Welcome"];
  let i=0, j=0;
  function typeNext(){
    if(i>=lines.length){ done(); return; }
    const str = lines[i];
    if(j <= str.length){
      out.textContent = str.slice(0,j);
      j++; setTimeout(typeNext, 70);
    } else {
      i++; j=0; setTimeout(typeNext, 500);
    }
  }
  typeNext();

  // try autoplay (default on, 10%)
  audio.volume = 0.1;
  audio.muted = false;
  audio.play().catch(()=>{
    // fallback: user interaction
    const arm = () => { audio.muted=false; audio.volume=0.1; audio.play().catch(()=>{}); window.removeEventListener('pointerdown', arm); };
    window.addEventListener('pointerdown', arm, {once:true});
  });

  function done(){
    el.classList.add('hide');
    setTimeout(()=>{ try{ el.remove(); }catch(_){} }, 700);
  }
})();

// Nav show/hide
(() => {
  const nav=document.querySelector('.nav'); if(!nav) return; let last=scrollY;
  addEventListener('scroll', ()=>{ const y=scrollY; if(y>last) nav.classList.add('nav-hide'); else nav.classList.remove('nav-hide'); last=y; }, {passive:true});
  addEventListener('hashchange', ()=> nav.classList.remove('nav-hide'));
})();

// Hover light
(() => {
  document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left)/r.width)*100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top)/r.height)*100}%`);
    });
  });
})();

// Fallbacks
(() => {
  const pfp = document.getElementById('pfp');
  if (pfp) pfp.addEventListener('error', () => {
    pfp.style.display='none';
    const fb = pfp.parentElement?.querySelector('.pfp-fallback'); if(fb) fb.style.display='block';
  }, {once:true});
  document.querySelectorAll('.cover').forEach(c => {
    const img = c.querySelector('.cover-img');
    img?.addEventListener('error', () => { c.classList.add('is-fallback'); }, {once:true});
  });
})();

// Smooth scroll for all in-page links + section highlight
(() => {
  const links = document.querySelectorAll('a[href^="#"]');
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  links.forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      const doFlash = () => { target.classList.add('section-flash'); setTimeout(() => target.classList.remove('section-flash'), 1000); };
      setTimeout(doFlash, prefersReduced ? 0 : 450);
    });
  });
})();

// Animated counters (stats + stream badges)
(() => {
  const els = document.querySelectorAll('.count[data-count]');
  const fmt = n => n.toLocaleString();
  const animate = (el, to, dur=1600) => {
    const from = 0;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t-start)/dur);
      const eased = 1 - Math.pow(1-p, 3); // easeOutCubic
      el.textContent = fmt(Math.floor(from + (to-from)*eased));
      if(p<1) requestAnimationFrame(step);
      else el.textContent = fmt(to);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        const to = parseInt(el.getAttribute('data-count'),10) || 0;
        animate(el, to, to > 2000000 ? 2200 : 1600);
        io.unobserve(el);
      }
    });
  }, {threshold: .4});

  els.forEach(el => io.observe(el));
})();

// Audio toggle (still present)
(() => {
  const audio=document.getElementById('bgm');
  const toggle=document.getElementById('audioToggle');
  if(!audio || !toggle) return;
  toggle.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) { audio.muted=false; audio.volume=0.1; audio.play().catch(()=>{}); toggle.textContent='Sound: on'; }
    else { audio.muted=true; toggle.textContent='Sound: off'; }
  });
})();

// Footer year
(() => { const y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear(); })();
