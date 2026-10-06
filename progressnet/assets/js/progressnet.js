/* ProgressNet: static, precomputed research demonstrations. No inference backend. */
(() => {
  'use strict';
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const levels = [10, 20, 30, 50, 70, 80, 100];
  const sequences = window.PROGRESSNET_SEQUENCES || [];
  const results = window.PROGRESSNET_RESULTS;
  const sequenceById = Object.fromEntries(sequences.map(item => [item.id, item]));
  const methodNames = {sketch:'Sketch', sdxs:'SDXS', flux:'FLUX + ControlNet', stableflow:'StableFlow', ours:'ProgressNet', reference:'Reference photograph'};
  const imagePath = (scene, method, stage) => `assets/images/sequences/${scene}/${method}-${levels[stage]}.webp`;
  const imageCache = new Map();
  function loadImage(src) {
    if (!imageCache.has(src)) {
      imageCache.set(src, new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => { console.warn('Could not load image:', src); resolve(false); };
        image.src = src;
      }));
    }
    return imageCache.get(src);
  }
  const idle = callback => window.requestIdleCallback ? window.requestIdleCallback(callback, {timeout:1500}) : setTimeout(callback, 100);

  // Navigation, reading progress and an accessible mobile menu.
  const menu = $('#main-nav');
  const menuToggle = $('.menu-toggle');
  const closeMenu = () => { menu.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Open navigation'); };
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    menu.classList.toggle('open', expanded);
  });
  $$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
  // Keep same-page navigation local, including when previewed as a static document.
  $$('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
    const id=anchor.getAttribute('href');
    if (!id || id==='#') return;
    const target=document.getElementById(id.slice(1));
    if (!target) return;
    event.preventDefault(); closeMenu();
    target.scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'});
    try { const url=new URL(window.location.href);url.hash=id;history.replaceState(null,'',url.href); } catch (_) { /* Scrolling still works in restricted previews. */ }
  }));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) closeMenu(); });
  const sections = $$('section[id]').filter(section => $(`#main-nav a[href="#${section.id}"]`));
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('#main-nav a').forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-15% 0px -60% 0px', threshold:0});
    sections.forEach(section => navObserver.observe(section));
  }
  let scrollPending = false;
  function updateReadingProgress() {
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    $('#reading-progress').style.width = `${maximum > 0 ? Math.min(100, window.scrollY / maximum * 100) : 0}%`;
    scrollPending = false;
  }
  window.addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateReadingProgress); } }, {passive:true});
  window.addEventListener('resize', updateReadingProgress, {passive:true});
  updateReadingProgress();

  // The hero is a continuous crop of seconds 59–71.5 of the supplied recording.
  const hero = $('#hero-video');
  const heroButton = $('#hero-play');
  let heroManuallyPaused = false;
  let heroVisible = true;
  function reflectHeroState() {
    heroButton.innerHTML = hero.paused ? '<span aria-hidden="true">▷</span>' : '<span aria-hidden="true">Ⅱ</span>';
    heroButton.setAttribute('aria-label', hero.paused ? 'Play highlight video' : 'Pause highlight video');
  }
  function startHero() {
    if (!hero.getAttribute('src')) { hero.src = hero.dataset.src; hero.load(); }
    hero.play().then(reflectHeroState).catch(reflectHeroState);
  }
  heroButton.addEventListener('click', () => {
    if (hero.paused) { heroManuallyPaused = false; startHero(); }
    else { heroManuallyPaused = true; hero.pause(); }
  });
  hero.addEventListener('play', reflectHeroState);
  hero.addEventListener('pause', reflectHeroState);
  hero.addEventListener('error', () => {
    heroButton.setAttribute('aria-label','Retry highlight video');
    heroButton.innerHTML = '<span aria-hidden="true">↺</span>';
  });
  const autoVideoAllowed = () => !reduceMotion.matches && !(navigator.connection && navigator.connection.saveData);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      if (!heroVisible) hero.pause();
      else if (!heroManuallyPaused && autoVideoAllowed() && !document.hidden) startHero();
    }, {threshold:.15}).observe(hero);
  } else if (autoVideoAllowed()) startHero();
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) hero.pause(); });
  reflectHeroState();

  // Figure 1: operation-annotated, published states, not a live drawing application.
  const stories = {
    cat: [
      {operation:'Start a concept',title:'Begin with a cat.',prompt:'a cat is sitting',note:'A few contours establish the animal and its appearance. This is the visual state that subsequent turns will build on.'},
      {operation:'Erase + revise the prompt',title:'Reconsider the pose.',prompt:'a cat is sitting on a platform',note:'The body is erased and the prompt introduces a platform. The next published output adapts the pose while retaining the cat’s established appearance.'},
      {operation:'Add strokes + revise the prompt',title:'Now, let it stand.',prompt:'a cat stands',note:'New leg strokes supply a different structure. The concept evolves rather than remaining locked to the first sitting pose.'},
      {operation:'Erase the tail',title:'An erased line matters.',prompt:'a cat stands',note:'The tail strokes are removed while the prompt stays the same. The next image reflects that destructive edit instead of reintroducing the old tail.'},
      {operation:'Redraw + revise the prompt',title:'Take the idea somewhere new.',prompt:'a cat walks in a river',note:'The tail is redrawn and the prompt moves the cat into a river. The session combines additions, erasure and semantic revision.'}
    ],
    landscape: [
      {operation:'Start a landscape',title:'A mountain, for now.',prompt:'a mountain landscape',note:'Sparse mountain contours leave appearance and context open. The first result establishes a visual starting point.'},
      {operation:'Add strokes + revise the prompt',title:'Add a little life.',prompt:'a mountain landscape with a boat',note:'The sketch gains trees and a boat. The evolving structure adds detail to the landscape already under way.'},
      {operation:'Revise the prompt',title:'Change the season.',prompt:'a snowy mountain … with a boat',note:'The prompt re-themes the scene as snowy. The ellipsis is present in the published prompt annotation; the wording is not reconstructed here.'},
      {operation:'Revise the prompt',title:'Think green instead.',prompt:'a green mountain landscape …',note:'A new prompt reinterprets the scene. The mountain-and-boat composition remains an anchor as uncommitted appearance adapts.'},
      {operation:'Add details + revise the prompt',title:'Finish the world around it.',prompt:'a green mountain … house, birds',note:'A house and birds complete the scene. This final panel combines the session’s established structure with new drawn details.'}
    ]
  };
  let currentStory = 'cat';
  let storyStep = 0;
  let storyTicket = 0;
  const storyButtons = $('.story-step-buttons');
  for (let i=0; i<5; i++) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = String(i+1);
    button.setAttribute('aria-label',`Show interaction turn ${i+1}`);
    button.setAttribute('aria-pressed', String(i === 0));
    button.classList.toggle('active',i === 0);
    button.addEventListener('click', () => { storyStep=i; renderStory(); });
    storyButtons.append(button);
  }
  async function renderStory() {
    const ticket=++storyTicket;
    const name=currentStory, step=storyStep;
    const image=`assets/images/stories/${name}-${step}.webp`;
    const sketch=`assets/images/stories/${name}-sketch-${step}.webp`;
    await Promise.all([loadImage(image),loadImage(sketch)]);
    if (ticket !== storyTicket) return;
    const info=stories[name][step];
    $('#story-image').src=image; $('#story-image').alt=`Published ProgressNet output, ${name} sequence turn ${step+1}: ${info.title}`;
    $('#story-sketch').src=sketch; $('#story-sketch').alt=`Published sketch and operation annotations, ${name} sequence turn ${step+1}`;
    $('#story-operation').textContent=info.operation;
    $('#story-title').textContent=info.title;
    $('#story-prompt').textContent=`“${info.prompt}”`;
    $('#story-note').textContent=info.note;
    $('#story-count').textContent=String(step+1).padStart(2,'0');
    $('#story-step-label').textContent=`Turn ${step+1}`;
    $$('[data-story]').forEach(button => {
      const active=button.dataset.story === name;
      button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
    });
    $$('button',storyButtons).forEach((button,i) => {button.classList.toggle('active',i===step);button.setAttribute('aria-pressed',String(i===step));});
    idle(() => { if (step<4) { loadImage(`assets/images/stories/${name}-${step+1}.webp`);loadImage(`assets/images/stories/${name}-sketch-${step+1}.webp`); } });
  }
  $$('[data-story]').forEach(button => button.addEventListener('click', () => {currentStory=button.dataset.story;storyStep=0;renderStory();}));

  // All 23 appendix sequences, with a shared discrete stage for every method.
  const gallery = {scene:'cat', stage:0, method:'flux', all:false, timer:null, ticket:0, inspected:null};
  const sceneSelect = $('#scene-select');
  sceneSelect.innerHTML = sequences.map(sequence => `<option value="${escapeHTML(sequence.id)}">${escapeHTML(sequence.title)}</option>`).join('');
  const thumbOrder=['cat','giraffe','sheep','dog','forest-train','bird','clock','kite',...sequences.map(s=>s.id)];
  const uniqueThumbs=[...new Set(thumbOrder)];
  $('#scene-thumbnails').innerHTML = uniqueThumbs.filter(id=>sequenceById[id]).map(id => {
    const item=sequenceById[id];
    return `<button class="scene-thumb${id==='cat'?' active':''}" type="button" data-scene="${id}" aria-label="Show ${escapeHTML(item.title)}" aria-pressed="${id==='cat'}"><img src="assets/images/sequences/${id}/thumb.webp" alt="" width="144" height="144" loading="lazy"><span>${escapeHTML(item.title)}</span></button>`;
  }).join('');
  const stagesRoot=$('#stage-labels');
  levels.forEach((level,index) => {
    const button=document.createElement('button');button.type='button';button.textContent=`${level}%`;
    button.classList.toggle('active',index===0);button.setAttribute('aria-label',`Show ${level} percent sketch completion`);button.setAttribute('aria-pressed',String(index===0));
    button.addEventListener('click',()=>{stopGallery();gallery.stage=index;renderGallery();});stagesRoot.append(button);
  });
  const shownMethods = () => gallery.all ? ['sketch','sdxs','flux','stableflow','ours'] : ['sketch',gallery.method,'ours'];
  function panelHTML(method) {
    const source=imagePath(gallery.scene,method,gallery.stage);
    const label=method==='sketch'?'INPUT':method==='ours'?'OURS':'COMPARISON';
    const classes=`comparison-panel${method==='sketch'?' sketch-panel':''}${method==='ours'?' ours-panel':''}`;
    return `<figure class="${classes}" data-method="${method}"><figcaption><span class="mono tiny">${label}</span><strong>${methodNames[method]}${method==='ours'?'<span aria-hidden="true">↗</span>':''}</strong></figcaption><a class="image-inspect" href="${source}" data-inspect="${method}" aria-label="Inspect ${escapeHTML(methodNames[method])} at ${levels[gallery.stage]} percent"><img src="${source}" alt="${escapeHTML(sequenceById[gallery.scene].title)}: ${escapeHTML(methodNames[method])} at ${levels[gallery.stage]}% completion" width="252" height="252"><span class="inspect-icon" aria-hidden="true">⤢</span></a></figure>`;
  }
  function updateGalleryLabels() {
    const sequence=sequenceById[gallery.scene];
    $('#gallery-prompt').textContent=`“${sequence.prompt}”`;
    $('#gallery-note').textContent=sequence.note;
    $('#gallery-source').href=`assets/paper/progressnet.pdf#page=${sequence.page}`;
    $('#gallery-source').textContent=`Fig. ${sequence.figure}, p. ${sequence.page} ↗`;
    $('#stage-range').value=String(gallery.stage);
    $('#stage-range').setAttribute('aria-valuetext',`${levels[gallery.stage]} percent completion`);
    $('#stage-output').textContent=`${levels[gallery.stage]}%`;
    $$('button',stagesRoot).forEach((button,index)=>{button.classList.toggle('active',index===gallery.stage);button.setAttribute('aria-pressed',String(index===gallery.stage));});
    $$('[data-scene]').forEach(button=>{const active=button.dataset.scene===gallery.scene;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    sceneSelect.value=gallery.scene;
    $('#all-methods').setAttribute('aria-pressed',String(gallery.all));
    $('#all-methods').textContent=gallery.all?'Side-by-side view':'Show all 4 methods';
    $('#method-select').disabled=gallery.all;
  }
  async function renderGallery() {
    const ticket=++gallery.ticket;
    const methods=shownMethods();
    const parent=$('#comparison-panels');parent.setAttribute('aria-busy','true');
    await Promise.all(methods.map(method=>loadImage(imagePath(gallery.scene,method,gallery.stage))));
    if (ticket!==gallery.ticket) return;
    parent.classList.toggle('all-methods',gallery.all);
    parent.innerHTML=methods.map(panelHTML).join('');
    parent.setAttribute('aria-busy','false');
    updateGalleryLabels();
    if (gallery.inspected) updateDialog();
    idle(()=>{
      const stage=(gallery.stage+1)%levels.length;
      shownMethods().forEach(method=>loadImage(imagePath(gallery.scene,method,stage)));
    });
  }
  function stopGallery() {
    if (gallery.timer) clearInterval(gallery.timer);
    gallery.timer=null;
    $('#gallery-play').innerHTML='<span aria-hidden="true">▷</span>';
    $('#gallery-play').setAttribute('aria-label','Play comparison stages');
  }
  function chooseScene(id) {
    if (!sequenceById[id]) return;
    stopGallery();gallery.scene=id;gallery.stage=0;renderGallery();
    const thumbnail=$(`[data-scene="${id}"]`);
    if (thumbnail) {
      const root=$('#scene-thumbnails');
      const target=thumbnail.offsetLeft-root.offsetLeft-root.clientWidth/2+thumbnail.offsetWidth/2;
      root.scrollTo({left:Math.max(0,target),behavior:reduceMotion.matches?'instant':'smooth'});
    }
  }
  sceneSelect.addEventListener('change',()=>chooseScene(sceneSelect.value));
  $('#scene-thumbnails').addEventListener('click',event=>{const button=event.target.closest('[data-scene]');if(button)chooseScene(button.dataset.scene);});
  $('#method-select').addEventListener('change',()=>{gallery.method=$('#method-select').value;renderGallery();});
  $('#all-methods').addEventListener('click',()=>{gallery.all=!gallery.all;renderGallery();});
  $('#stage-range').addEventListener('input',event=>{stopGallery();gallery.stage=Number(event.target.value);renderGallery();});
  $('#gallery-reset').addEventListener('click',()=>{stopGallery();gallery.stage=0;renderGallery();});
  $('#gallery-play').addEventListener('click',()=>{
    if(gallery.timer){stopGallery();return;}
    if(gallery.stage===6){gallery.stage=0;renderGallery();}
    $('#gallery-play').innerHTML='<span aria-hidden="true">Ⅱ</span>';
    $('#gallery-play').setAttribute('aria-label','Pause comparison stages');
    gallery.timer=setInterval(()=>{
      if(gallery.stage>=6){stopGallery();return;}
      gallery.stage++;renderGallery();
    },1300);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stopGallery();},{threshold:0}).observe($('#explore'));
  }

  // Inspect unenhanced source panels, with keyboard-operable stage navigation.
  const imageDialog=$('#image-dialog');
  function updateDialog() {
    if(!gallery.inspected)return;
    const sequence=sequenceById[gallery.scene];
    $('#dialog-image').src=imagePath(gallery.scene,gallery.inspected,gallery.stage);
    $('#dialog-image').alt=`${methodNames[gallery.inspected]}, ${sequence.title}, ${levels[gallery.stage]} percent completion; enlarged published image.`;
    $('#dialog-title').textContent=`${methodNames[gallery.inspected]} · ${sequence.title}`;
    $('#dialog-meta').textContent=`FIG. ${sequence.figure} / PUBLISHED PANEL`;
    $('#dialog-stage').textContent=`${levels[gallery.stage]}%`;
    $('#dialog-prev').disabled=gallery.stage===0;$('#dialog-next').disabled=gallery.stage===6;
  }
  $('#comparison-panels').addEventListener('click',event=>{
    const anchor=event.target.closest('[data-inspect]');
    if(!anchor || typeof imageDialog.showModal!=='function')return;
    event.preventDefault();stopGallery();gallery.inspected=anchor.dataset.inspect;updateDialog();imageDialog.showModal();
  });
  const changeDialogStage=delta=>{gallery.stage=Math.max(0,Math.min(6,gallery.stage+delta));renderGallery();};
  $('#dialog-prev').addEventListener('click',()=>changeDialogStage(-1));
  $('#dialog-next').addEventListener('click',()=>changeDialogStage(1));
  $('.dialog-close').addEventListener('click',()=>imageDialog.close());
  imageDialog.addEventListener('click',event=>{
    if(event.target!==imageDialog)return;
    const rect=imageDialog.getBoundingClientRect();
    if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) imageDialog.close();
  });
  imageDialog.addEventListener('close',()=>{gallery.inspected=null;});
  imageDialog.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();changeDialogStage(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();changeDialogStage(1);}
  });

  // Method tabs: meaningful native diagrams and explicitly illustrative masks.
  const mechanismTabs=$$('[data-mechanism]');
  function selectMechanism(button) {
    mechanismTabs.forEach(tab=>{
      const active=tab===button;
      tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
      $(`#${tab.getAttribute('aria-controls')}`).hidden=!active;
    });
  }
  mechanismTabs.forEach((button,index)=>{
    button.addEventListener('click',()=>selectMechanism(button));
    button.addEventListener('keydown',event=>{
      const offset=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;
      let target=null;
      if(offset)target=mechanismTabs[(index+offset+mechanismTabs.length)%mechanismTabs.length];
      if(event.key==='Home')target=mechanismTabs[0];
      if(event.key==='End')target=mechanismTabs[mechanismTabs.length-1];
      if(target){event.preventDefault();target.focus();selectMechanism(target);}
    });
  });
  $$('[data-memory]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.memory;
    $('#memory-mask').className=`memory-mask${action==='add'?'':` ${action}`}`;
    $('#memory-caption').textContent={add:'Keep the previous image',erase:'White-fill the erased region',prompt:'Gray-fill uncommitted regions'}[action];
    $$('[data-memory]').forEach(item=>{item.classList.toggle('active',item===button);item.setAttribute('aria-pressed',String(item===button));});
  }));

  // Full video and clean presentation share the same original timeline.
  const session=$('#session-video');
  let videoView='clean';
  const originalOffset=()=>videoView==='clean'?4.5:0;
  const originalTime=()=>Math.max(0,session.currentTime+originalOffset());
  function seekVideo(sourceSeconds,play=true) {
    const target=Math.max(0,sourceSeconds-originalOffset());
    const apply=()=>{
      session.currentTime=Math.min(target,Number.isFinite(session.duration)?Math.max(0,session.duration-.05):target);
      if(play)session.play().catch(()=>{});
    };
    if(session.readyState>=1)apply();
    else{session.addEventListener('loadedmetadata',apply,{once:true});session.load();}
  }
  function changeVideoView(view) {
    if(view===videoView)return;
    const sourceTime=originalTime(),wasPlaying=!session.paused;
    videoView=view;
    session.src=`assets/videos/${view==='clean'?'clean-session':'full-session'}.mp4`;
    session.poster=`assets/images/video/demo-${view==='clean'?'pair':'full'}.webp`;
    session.classList.toggle('interface',view==='original');
    $('track',session).src=`assets/videos/chapters-${view==='clean'?'clean':'original'}.vtt`;
    $('#clean-view').classList.toggle('active',view==='clean');$('#clean-view').setAttribute('aria-pressed',String(view==='clean'));
    $('#interface-view').classList.toggle('active',view==='original');$('#interface-view').setAttribute('aria-pressed',String(view==='original'));
    seekVideo(sourceTime,wasPlaying);
  }
  $('#clean-view').addEventListener('click',()=>changeVideoView('clean'));
  $('#interface-view').addEventListener('click',()=>changeVideoView('original'));
  $$('.demo-chapters [data-time]').forEach(button=>button.addEventListener('click',()=>seekVideo(Number(button.dataset.time))));
  session.addEventListener('timeupdate',()=>{
    const time=originalTime();
    const chapters=$$('.demo-chapters [data-time]');
    chapters.forEach((button,index)=>{button.classList.toggle('active',time>=Number(button.dataset.time) && (index===chapters.length-1 || time<Number(chapters[index+1].dataset.time)));});
    const message=time<12?'A raccoon begins with a few lines.':time<20?'Glasses: new strokes and a revised prompt.':time<34?'A prompt revision changes the visual style.':time<54?'Local strokes give the paws their shape.':time<64?'Refine the hand gesture.':'Finish the character with a hat.';
    $('#demo-current').textContent=message;
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){hero.pause();session.pause();stopGallery();}
    else if(heroVisible && !heroManuallyPaused && autoVideoAllowed())startHero();
  });

  // Exact numbers from the supplied paper. No fitted, extrapolated or invented values.
  const palette={sas:'#957457',sdxs:'#637897',cb:'#aa7953',flux:'#27372b',stableflow:'#9aa786',ours:'#376b4b'};
  const metricInfo={fid:{name:'FID-I',direction:'Lower is better',decimals:1},fidc:{name:'FID-C',direction:'Lower is better',decimals:3},dino:{name:'DINOv2',direction:'Higher is better',decimals:3},clip:{name:'CLIPScore',direction:'Higher is better',decimals:3},t5:{name:'T5-Cos',direction:'Higher is better',decimals:3}};
  const format=(number,metric)=>number.toFixed(metricInfo[metric].decimals);
  function niceTop(value){const power=10**Math.floor(Math.log10(value));const normalized=value/power;return ([1,1.2,1.5,2,2.5,3,4,5,6,8,10].find(n=>n>=normalized)||10)*power;}
  function renderResults() {
    if(!results)return;
    const datasetId=$('#dataset-select').value,metric=$('#metric-select').value;
    const dataset=results.datasets[datasetId],info=metricInfo[metric],all=$('#show-six').checked;
    const shown=all?results.methodOrder:['flux','stableflow','ours'];
    const rows=dataset[metric];
    const max=niceTop(Math.max(...rows.flatMap(row=>shown.map(method=>row[results.methodOrder.indexOf(method)])))*1.12);
    const width=760,height=340,left=52,right=27,top=30,bottom=42;
    const x=value=>left+(value-10)/90*(width-left-right);
    const y=value=>height-bottom-value/max*(height-top-bottom);
    const tickFormat=value=>metric==='fid'?String(Math.round(value)):value.toFixed(max<.2?2:1);
    let markup=`<title id="chart-title">${dataset.name}: ${info.name} across sketch completion</title><desc id="chart-description">${info.direction}. Exact measurements from the supplied paper. The complete numeric values are in the expandable table below.</desc>`;
    for(let i=0;i<=4;i++){
      const value=max*i/4,cy=y(value);
      markup+=`<line x1="${left}" y1="${cy}" x2="${width-right}" y2="${cy}" stroke="#e3e8df" stroke-width="1"/><text x="${left-12}" y="${cy+4}" text-anchor="end" fill="#6c7867" font-size="11" font-family="Arial,sans-serif">${tickFormat(value)}</text>`;
    }
    dataset.stages.forEach(stage=>{markup+=`<text x="${x(stage)}" y="${height-17}" text-anchor="middle" fill="#6c7867" font-size="11" font-family="Arial,sans-serif">${stage}</text>`;});
    markup+=`<text x="${left}" y="14" fill="#5c6d55" font-size="10" font-family="Arial,sans-serif">${info.name} ${['fid','fidc'].includes(metric)?'↓':'↑'}</text>`;
    shown.forEach(method=>{
      const mi=results.methodOrder.indexOf(method),values=rows.map(row=>row[mi]);
      const points=values.map((value,index)=>`${x(dataset.stages[index])},${y(value)}`).join(' ');
      const dash=method==='stableflow'?'stroke-dasharray="7 5"':method==='sdxs'?'stroke-dasharray="3 4"':method==='cb'?'stroke-dasharray="9 4 2 4"':'';
      markup+=`<polyline points="${points}" fill="none" stroke="${palette[method]}" stroke-width="${method==='ours'?3.2:2}" stroke-linejoin="round" ${dash}/>`;
      values.forEach((value,index)=>{
        const label=`${results.methodNames[method]}: ${format(value,metric)} ${info.name} at ${dataset.stages[index]}% completion`;
        markup+=`<circle cx="${x(dataset.stages[index])}" cy="${y(value)}" r="${method==='ours'?4.5:3.5}" fill="${method==='ours'?palette[method]:'#fff'}" stroke="${palette[method]}" stroke-width="1.8" tabindex="0" aria-label="${escapeHTML(label)}"><title>${escapeHTML(label)}</title></circle>`;
      });
    });
    $('#results-chart').innerHTML=markup;
    $('#chart-legend').innerHTML=shown.map(method=>`<span class="${method==='ours'?'legend-ours':''}"><i style="--legend-color:${palette[method]};${method==='stableflow'?'border-top-style:dashed;':''}" aria-hidden="true"></i>${results.methodNames[method]}</span>`).join('');
    const oursIndex=results.methodOrder.indexOf('ours'),fluxIndex=results.methodOrder.indexOf('flux');
    const first=rows[0][oursIndex],last=rows[rows.length-1][oursIndex];
    $('#result-dataset-label').textContent=`${dataset.name.toUpperCase()} / ${info.name}`;
    $('#result-endpoint').innerHTML=`${format(first,metric)} <span>→</span> ${format(last,metric)}`;
    const defaultInsight=`ProgressNet’s ${info.name} changes from ${format(first,metric)} at 10% completion to ${format(last,metric)} at 100%.`;
    const insight=metric==='fid' && datasetId==='fscoco'?'ProgressNet’s FID-I changes by less than one point between 10% and 100% completion.':metric==='fid' && datasetId==='photo'?'ProgressNet’s FID-I decreases as the contour sketch fills in. It does not lead FID-I at every completion level.':metric==='fid' && datasetId==='sketchy'?'ProgressNet’s FID-I stays close to 100 while the single-object sketch develops.':defaultInsight;
    $('#result-insight').textContent=insight;
    $('#baseline-endpoint').textContent=`${format(rows[0][fluxIndex],metric)} → ${format(rows[rows.length-1][fluxIndex],metric)}`;
    $('#result-direction').textContent=`${info.direction}. ${dataset.n} evaluation samples.`;
    $('#chart-source').textContent=`Source: ${datasetId==='fscoco'?'Tables 1 and 6':'Table 1'}. Points are reported measurements; connecting lines are visual guides.`;
    $('#result-table').innerHTML=`<table><caption>${dataset.name} · ${info.name} · ${info.direction}</caption><thead><tr><th scope="col">Method</th>${dataset.stages.map(stage=>`<th scope="col">${stage}%</th>`).join('')}</tr></thead><tbody>${results.methodOrder.map((method,index)=>`<tr${method==='ours'?' class="ours-row"':''}><th scope="row">${results.methodNames[method]}</th>${rows.map(row=>`<td>${format(row[index],metric)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    const pfc=results.pfc[datasetId];
    $('#pfc-table').innerHTML=`<table><caption>${dataset.name} · mean PFC scores · Table 2</caption><thead><tr><th scope="col">Method</th><th scope="col">PFC-DINO ↑</th><th scope="col">PFC-LPIPS ↑</th></tr></thead><tbody>${results.methodOrder.map((method,index)=>`<tr${method==='ours'?' class="ours-row"':''}><th scope="row">${results.methodNames[method]}</th><td>${pfc.dino[index].toFixed(3)}</td><td>${pfc.lpips[index].toFixed(3)}</td></tr>`).join('')}</tbody></table>`;
  }
  ['dataset-select','metric-select','show-six'].forEach(id=>$(`#${id}`).addEventListener('change',renderResults));
  function renderStudy(){
    if(!results)return;
    const criterion=Number($('#study-select').value),study=results.study;
    const sorted=[...results.methodOrder].sort((a,b)=>study.values[b][criterion]-study.values[a][criterion]);
    $('#study-chart').innerHTML=sorted.map(method=>{
      const value=study.values[method][criterion];
      return `<div class="study-row${method==='ours'?' ours':''}" aria-label="${escapeHTML(results.methodNames[method])}: ${value.toFixed(1)} normalized ${escapeHTML(study.labels[criterion])} score"><span>${results.methodNames[method]}</span><div class="study-bar-track" aria-hidden="true"><div class="study-bar-fill" style="--bar-width:${value}%"></div></div><b>${value.toFixed(1)}</b></div>`;
    }).join('');
    $('#study-chart').setAttribute('aria-label',`${study.labels[criterion]}: criterion-wise normalized scores, not percentages of participants`);
  }
  $('#study-select').addEventListener('change',renderStudy);
  renderResults();renderStudy();

  // Clipboard support on HTTPS plus a local-file fallback; do not claim success on failure.
  $('#copy-citation').addEventListener('click',async()=>{
    const text=$('#bibtex').textContent;
    let copied=false;
    try{
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(text);copied=true;}
      else{
        const textarea=document.createElement('textarea');textarea.value=text;textarea.style.position='fixed';textarea.style.opacity='0';document.body.append(textarea);textarea.select();copied=document.execCommand('copy');textarea.remove();
      }
    }catch(error){console.info('Clipboard unavailable; selecting citation instead.');}
    if(copied){$('#copy-status').textContent='Citation copied to your clipboard.';}
    else{
      const range=document.createRange();range.selectNodeContents($('#bibtex'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
      $('#copy-status').textContent='Citation selected. Press Ctrl+C (or ⌘C) to copy.';
    }
  });
})();
