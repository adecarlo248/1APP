/* Mind At Bat — demo storefront behaviour (no backend; cart is local-only) */
(function(){
  const C = window.MAB_CATALOG || [];
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const money = n => 'C$' + Number(n).toFixed(2);
  const bySlug = s => C.find(p=>p.slug===s);
  let io;
  const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const ICON = {
    cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>'
  };

  /* ---------- header / footer (shared on every page) ---------- */
  const NAV = [['index.html','Home','home'],['shop.html','Shop','shop'],['about.html','Heritage','about'],['contact.html','Contact','contact']];
  const navLinks = NAV.map(([h,l,k])=>`<a href="${h}" class="${page===k||(page==='product'&&k==='shop')?'active':''}">${l}</a>`).join('');
  const header = `
  <div class="announce">10% of every purchase supports <b>men's mental health</b> initiatives</div>
  <header class="site-header">
    <div class="wrap nav">
      <a class="brand" href="index.html" aria-label="Mind At Bat home"><img src="assets/logo.png" alt="Mind At Bat"></a>
      <nav class="nav-links" aria-label="Primary">${navLinks}</nav>
      <div class="nav-actions">
        <button class="icon-btn" id="cartBtn" aria-label="Open cart">${ICON.cart}<span class="cart-count" id="cartCount" hidden>0</span></button>
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">${ICON.menu}</button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobileNav">${navLinks}</nav>
  </header>`;
  const footer = `
  <footer class="site-footer">
    <div class="wrap footer-top">
      <div>
        <img src="assets/logo.png" alt="Mind At Bat">
        <p>Same Game. Different Battles. Mental Health Matters.</p>
        <p class="mono" style="font-size:12px;letter-spacing:.14em;margin-top:12px;color:#c4ccc4">MIND AT BAT · EST. ONTARIO, CANADA</p>
      </div>
      <div>
        <h4>EXPLORE</h4>
        <ul><li><a href="index.html">Home</a></li><li><a href="shop.html">Shop All</a></li><li><a href="shop.html?f=tee">Rally Tees</a></li><li><a href="shop.html?f=cap">Underdog Caps</a></li><li><a href="about.html">Our Heritage</a></li><li><a href="contact.html">Contact</a></li></ul>
      </div>
      <div>
        <h4>GET IN TOUCH</h4>
        <p>Have a question? Email us at <a class="green" href="mailto:support@mindatbat.com">support@mindatbat.com</a> — we'd love to hear from you.</p>
        <p style="margin-top:10px">Peterborough, Ontario — proudly serving all of Canada online, 24/7.</p>
      </div>
    </div>
    <div class="wrap footer-bottom">
      <span class="footer-meta">www.mindatbat.ca<br>support@mindatbat.com</span>
      <span class="footer-copy">© 2026 Mind At Bat · Serving Canada</span>
    </div>
  </footer>
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="drawer" aria-label="Cart">
    <div class="drawer-head"><h3>Your Cart</h3><button class="icon-btn" id="closeCart" aria-label="Close cart">${ICON.close}</button></div>
    <div class="drawer-items" id="drawerItems"></div>
    <div class="drawer-foot">
      <div class="drawer-total"><span>Subtotal</span><span id="cartTotal">C$0.00</span></div>
      <p class="muted" style="font-size:13px">10% of this order supports men's mental health initiatives. Made to order — ships in 2–7 business days.</p>
      <div class="demo-note">Demo — checkout not live. Real checkout will connect to the live payment processor at launch.</div>
      <button class="btn btn-white btn-block" id="checkoutBtn">Checkout</button>
    </div>
  </aside>
  <div class="toast" id="toast" role="status"><i>✓</i><span id="toastMsg"></span></div>
  <div class="demo-badge">DEMO for Belinda — not the live store</div>`;
  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);

  $('#menuBtn').onclick = ()=> $('#mobileNav').classList.toggle('open');

  /* hero background video: respect reduced motion + hide poster once playing */
  const hv = $('.hero-video');
  if(hv){
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){ try{ hv.pause(); }catch(e){} hv.removeAttribute('autoplay'); hv.style.display='none'; }
    else {
      const play = ()=> hv.play && hv.play().catch(()=>{});
      hv.addEventListener('playing', ()=>{ const fb=$('.hero-fallback'); if(fb) fb.style.opacity='0'; }, {once:true});
      document.addEventListener('visibilitychange', ()=>{ if(document.hidden) hv.pause(); else play(); });
      play();
    }
  }

  /* ---------- cart (localStorage, demo only) ---------- */
  const KEY='mab-demo-cart';
  const getCart=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}};
  const setCart=c=>{try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){} renderCart();};
  function renderCart(){
    const c=getCart(); const n=c.reduce((a,i)=>a+i.qty,0);
    const cc=$('#cartCount'); cc.textContent=n; cc.hidden=!n;
    $('#cartTotal').textContent=money(c.reduce((a,i)=>a+i.qty*i.price,0));
    $('#drawerItems').innerHTML = c.length ? c.map((i,ix)=>`
      <div class="ci"><img src="${i.img}" alt=""><div><b>${esc(i.name)}</b><small>${esc(i.variant||'One size')} · Qty ${i.qty}</small><button class="rm" data-rm="${ix}">Remove</button></div><span class="price">${money(i.price*i.qty)}</span></div>`).join('')
      : '<p class="empty">Your cart is empty.<br><a class="green" href="shop.html">Grab your gear →</a></p>';
    $$('[data-rm]').forEach(b=>b.onclick=()=>{const c=getCart();c.splice(+b.dataset.rm,1);setCart(c);});
  }
  const openCart=()=>{$('#drawer').classList.add('open');$('#overlay').classList.add('open');};
  const closeCart=()=>{$('#drawer').classList.remove('open');$('#overlay').classList.remove('open');};
  $('#cartBtn').onclick=openCart; $('#closeCart').onclick=closeCart; $('#overlay').onclick=closeCart;
  $('#checkoutBtn').onclick=()=>toast('Demo only — checkout is not live on this preview.');
  let tt; function toast(m){$('#toastMsg').textContent=m;$('#toast').classList.add('show');clearTimeout(tt);tt=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
  window.MAB = {toast, addToCart(item){const c=getCart();const ex=c.find(i=>i.slug===item.slug&&i.variant===item.variant);ex?ex.qty+=item.qty:c.push(item);setCart(c);}, openCart};
  renderCart();

  /* ---------- product card ---------- */
  function swatch(c){ return c.split ? `background:linear-gradient(135deg,${c.split[0]} 50%,${c.split[1]} 50%)` : `background:${c.hex}`; }
  function card(p){
    const alt = p.images[1] ? `<img class="alt" src="${p.images[1]}" alt="" loading="lazy">` : '';
    const sw = p.colors.length ? `<div class="swatches">${p.colors.map(c=>`<span class="sw" title="${esc(c.name)}" style="${swatch(c)}"></span>`).join('')}</div>` : '';
    const label = p.type==='tee' ? 'Rally · Tee' : 'Underdog · Snapback';
    return `<a class="card reveal" href="product.html?slug=${p.slug}">
      <div class="card-media"><img src="${p.images[0]}" alt="${esc(p.name)}" loading="lazy">${alt}<span class="tag ${p.edition==='OG'?'green':''}">${esc(p.edition)}</span></div>
      <div class="card-body"><span class="card-line">${label}</span><span class="card-name">${esc(p.name)}</span>
      <div class="card-foot"><span class="price">${p.type==='tee'?'<small>From</small>':''}${money(p.priceFrom)}</span>${sw}</div></div></a>`;
  }
  window.MAB.card = card;

  /* ---------- page inits ---------- */
  if(page==='home'){
    const feat=['unisex-t-shirt','flat-bill-cap','unisex-t-shirt-1','underdog-classic','rally-heritage-t-shirt','underdog-heritage'];
    $('#featured').innerHTML = feat.map(s=>card(bySlug(s))).join('');
  }

  if(page==='shop'){
    const grid=$('#shopGrid'); const params=new URLSearchParams(location.search);
    let f=params.get('f')||'all', sort='featured';
    const counts={all:C.length,tee:C.filter(p=>p.type==='tee').length,cap:C.filter(p=>p.type==='cap').length};
    $$('.filter').forEach(b=>{ b.querySelector('.n').textContent=counts[b.dataset.f]; });
    function draw(){
      let list=C.filter(p=>f==='all'||p.type===f);
      if(sort==='low') list=[...list].sort((a,b)=>a.priceFrom-b.priceFrom);
      if(sort==='high') list=[...list].sort((a,b)=>b.priceFrom-a.priceFrom);
      if(sort==='az') list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
      grid.innerHTML=list.map(card).join('');
      $$('.filter').forEach(b=>b.classList.toggle('active',b.dataset.f===f));
      $('#resultCount').textContent=`${list.length} product${list.length>1?'s':''}`;
      observe();
    }
    $$('.filter').forEach(b=>b.onclick=()=>{f=b.dataset.f;history.replaceState(null,'',f==='all'?'shop.html':`shop.html?f=${f}`);draw();});
    $('#sort').onchange=e=>{sort=e.target.value;draw();};
    draw();
  }

  if(page==='product'){
    const slug=new URLSearchParams(location.search).get('slug')||C[0].slug;
    const p=bySlug(slug)||C[0];
    document.title=`${p.name} | Mind At Bat — Demo`;
    $('#crumbName').textContent=p.name;
    let color=p.colors[0]||null, size=p.sizes.length?(p.sizes.includes('M')?'M':p.sizes[0]):null, qty=1, cur=0;
    const main=$('#galleryMain');
    function show(i){cur=i;main.style.opacity=.2;setTimeout(()=>{main.src=p.images[i];main.style.opacity=1;},120);$$('.thumb').forEach((t,ix)=>t.classList.toggle('active',ix===i));}
    main.alt=p.name; const start=color&&color.image?Math.max(0,p.images.indexOf(color.image)):0; main.src=p.images[start];
    $('#thumbs').innerHTML=p.images.map((src,i)=>`<button class="thumb ${i===start?'active':''}" data-i="${i}" aria-label="Image ${i+1}"><img src="${src}" alt="" loading="lazy"></button>`).join('');
    $$('.thumb').forEach(t=>t.onclick=()=>show(+t.dataset.i));
    $('#pLine').textContent = p.type==='tee' ? 'Rally Collection · Unisex Tee' : 'Underdog Collection · Snapback';
    $('#pName').textContent=p.name;
    $('#pHook').textContent=p.hook;
    $('#pBody').innerHTML=p.body.map(t=>`<p>${esc(t)}</p>`).join('');
    $('#pFeatures').innerHTML=p.features.map(t=>`<li>${esc(t)}</li>`).join('');
    const unavailable=new Set(p.unavailable||[]);
    function price(){ return size && p.sizePrices[size] ? p.sizePrices[size] : p.priceFrom; }
    function drawPrice(){ $('#pPrice').innerHTML = money(price()) + (p.type==='tee' && !size ? '<small>from</small>' : '') + '<small>CAD</small>'; }
    // colours
    if(p.colors.length){
      $('#colorWrap').hidden=false;
      $('#colorOpts').innerHTML=p.colors.map((c,i)=>`<button class="color-opt ${i?'':'active'}" data-c="${i}" title="${esc(c.name)}" aria-label="${esc(c.name)}"><span style="${swatch(c)}"></span></button>`).join('');
      $('#colorName').textContent=color.name;
      $$('.color-opt').forEach(b=>b.onclick=()=>{color=p.colors[+b.dataset.c];$$('.color-opt').forEach(x=>x.classList.toggle('active',x===b));$('#colorName').textContent=color.name;const ix=p.images.indexOf(color.image);if(ix>-1)show(ix);drawSizes();});
    }
    // sizes
    function drawSizes(){
      if(!p.sizes.length) return;
      $('#sizeWrap').hidden=false;
      $('#sizeOpts').innerHTML=p.sizes.map(s=>{
        const off=color&&unavailable.has(`${color.name}|${s}`); const up=p.sizePrices[s]>p.priceFrom?`<span class="up">+${(p.sizePrices[s]-p.priceFrom).toFixed(0)}</span>`:'';
        return `<button class="size-opt ${s===size?'active':''}" data-s="${s}" ${off?'disabled title="Not offered in this colour"':''}>${s}${up}</button>`;}).join('');
      if(color&&unavailable.has(`${color.name}|${size}`)){size=null;}
      $('#sizeName').textContent=size||'Select';
      $$('.size-opt').forEach(b=>b.onclick=()=>{size=b.dataset.s;drawSizes();drawPrice();});
      drawPrice();
    }
    drawSizes(); drawPrice();
    if(p.type==='tee'){
      $('#sizeGuide').hidden=false;
      $('#sizeTable').innerHTML='<tr><th>Size</th><th>Price (CAD)</th></tr>'+p.sizes.map(s=>`<tr><td>${s}</td><td>${money(p.sizePrices[s])}</td></tr>`).join('');
    } else { $('#fitNote').hidden=false; }
    $('#qMinus').onclick=()=>{qty=Math.max(1,qty-1);$('#qVal').textContent=qty;};
    $('#qPlus').onclick=()=>{qty=Math.min(10,qty+1);$('#qVal').textContent=qty;};
    $('#addBtn').onclick=()=>{
      if(p.sizes.length&&!size){toast('Pick a size first.');return;}
      const variant=[color&&color.name,size].filter(Boolean).join(' / ')||'One size';
      MAB.addToCart({slug:p.slug,name:p.name,variant,qty,price:price(),img:(color&&color.image)||p.images[0]});
      toast(`Added ${p.name} (${variant}) — demo cart`); 
    };
    $('#liveLink').href=p.liveUrl;
    $('#related').innerHTML=C.filter(x=>x.slug!==p.slug&&x.type===p.type).concat(C.filter(x=>x.type!==p.type).slice(0,1)).slice(0,3).map(card).join('');
  }

  // newsletter + contact demo forms
  $$('form[data-demo]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();toast(f.dataset.demo);f.reset();}));
  // founder letter expand
  const lt=$('#letterToggle'); if(lt){const t0=lt.textContent; lt.onclick=()=>{const L=$('#letter');L.classList.toggle('expanded');lt.textContent=L.classList.contains('expanded')?'Show less':t0;};}

  /* ---------- reveal on scroll ---------- */
  function observe(){
    if(!('IntersectionObserver' in window)){$$('.reveal').forEach(e=>e.classList.add('in'));return;}
    io = io || new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
    $$('.reveal:not(.in)').forEach((e,i)=>{e.style.transitionDelay=(i%3)*80+'ms';const r=e.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0){requestAnimationFrame(()=>e.classList.add('in'));}else io.observe(e);});
  }
  observe();
  setTimeout(()=>$$('.reveal:not(.in)').forEach(e=>{const r=e.getBoundingClientRect();if(r.top<innerHeight)e.classList.add('in');}),1200);
})();
