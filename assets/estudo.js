// Monta a página de estudo a partir de window.ESTUDO (definido em estudos/<slug>.html)
// Efeitos de rolagem: GSAP ScrollTrigger + Lenis (carregados daqui, sem mexer nos estudos)
(function () {
  const E = window.ESTUDO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // quebra o texto em palavras (para o efeito de "acender" palavra por palavra)
  const words = s => md(s).split(/(<[^>]+>)/).map(p => p.startsWith('<') ? p : p.split(/(\s+)/).map(w => w.trim() ? `<span class="w">${w}</span>` : w).join('')).join('');

  const range = r => String(r).split(',').flatMap(p => {
    const [a, b] = p.split('-').map(Number); const out = [];
    for (let i = a; i <= (b || a); i++) out.push(i); return out;
  });
  const verse = (n, marks = []) => {
    let t = esc(E.versos[n] || '');
    marks.forEach(m => { t = t.replace(new RegExp('(' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'), '<mark>$1</mark>'); });
    return `<sup>${n}</sup>${t} `;
  };
  const img = o => o && o.src ? `<figure class="figure"><div class="clip"><img src="${esc(o.src)}" alt="${esc(o.legenda)}"></div><figcaption>${md(o.legenda)}</figcaption></figure>` : '';
  const marquee = txt => `<div class="marquee" aria-hidden="true"><div class="mq">${Array(8).fill(`<span>${esc(txt)}</span><i>✦</i>`).join('')}</div></div>`;

  document.title = `${E.livro} ${E.capitulo} · Estudos Bíblicos`;
  const I = E.introducao;
  const ref = `${E.livro} ${E.capitulo}`;
  const livroSlug = E.livro.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, '-');
  const plain = t => String(t ?? '').replace(/\*+/g, '');
  const ringTxt = `${ref} ✶ ${E.titulo} ✶ ${plain(I.autor.titulo)} ✶ `;
  // capa no estilo "mergulho": a foto aparece dentro do número do capítulo e a câmera entra nela
  const hero = twin => `
  <header class="hero${twin ? ' loop' : ''}"${twin ? '' : ' data-nav="Início"'}>
    <div class="stage">
      <div class="photo"><img src="${esc(E.capa?.src)}" alt=""></div>
      <div class="ring"><svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="circ${twin ? 2 : 1}" d="M50,50 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
        <text><textPath href="#circ${twin ? 2 : 1}" textLength="274" lengthAdjust="spacing">${esc(ringTxt)}</textPath></text></svg></div>
      <div class="bignum" style="--n:${String(E.capitulo).length};background-image:url('${esc(E.capa?.src)}')">${esc(E.capitulo)}</div>
    </div>
    <div class="corners">
      <div class="corner tl">Livro<br><b>${esc(E.livro)}</b></div>
      <div class="corner tr">Autor<br><b>${esc(plain(I.autor.titulo))}</b></div>
      <div class="corner bl">Época<br><b>${esc(plain(I.epoca.titulo))}</b></div>
      <div class="corner br">Língua<br><b>${esc(plain(I.lingua.titulo))}</b></div>
      <div class="scrollhint">${twin ? 'de novo ↺' : 'role'}</div>
    </div>
    ${twin ? '' : `<div class="htitle">
      <div class="ref">${esc(E.livro)} · capítulo ${esc(E.capitulo)}</div>
      <h1>${E.titulo.split(' ').map(w => `<span><i>${esc(w)}</i></span>`).join(' ')}</h1>
      <p>${esc(E.subtitulo)}</p>
    </div>
    ${E.capa?.credito ? `<div class="credit">${esc(E.capa.credito)}</div>` : ''}`}
  </header>`;
  let h = `
  <div id="progress"></div>
  <div id="crumb"><a href="../#${livroSlug}">${esc(E.livro)}</a> · cap. ${esc(E.capitulo)}</div>
  <nav id="dots"></nav>

  ${hero(false)}

  ${marquee(`${ref} · ${E.titulo}`)}

  <section class="stack" data-nav="Introdução">
    <div class="wrap">
      <div class="kicker rv">Antes de ler</div>
      <h2 class="rv">Quem, para quem, quando e em que língua</h2>
    </div>
    <div class="cardsStack">
      ${[['✍️', 'Quem escreveu', I.autor], ['👥', 'Para quem', I.destinatarios], ['⏳', 'Quando', I.epoca], ['📜', 'Língua original', I.lingua]]
      .map(([ic, lb, o], i) => `<div class="q" style="--i:${i}"><div class="num">0${i + 1}</div><div class="ic">${ic}</div><div class="lb">${lb}</div><div class="val">${md(o.titulo)}</div><p>${md(o.texto)}</p></div>`).join('')}
    </div>
  </section>

`;

  h += `
  <section class="bigword"><div class="bw">Leitura</div></section>

  <section data-nav="Texto"><div class="wrap">
    <div class="kicker rv">${esc(ref)}</div>
    <h2 class="rv">Texto puro</h2>
    <div class="scripture">
      ${E.paragrafos.map(p => `<p class="ph">${range(p).map(n => `<span class="v"><sup>${n}</sup>${esc(E.versos[n])} </span>`).join('')}</p>`).join('')}
    </div>
    <p class="vernote">${md(E.notaVersao)}</p>
  </div></section>

`;

  h += `
  <section class="alt" data-nav="Contexto"><div class="wrap">
    <div class="kicker rv">Contexto da época</div>
    <h2 class="rv">${esc(I.contexto.titulo)}</h2>
    ${I.contexto.paragrafos.map(p => `<p class="reveal">${words(p)}</p>`).join('')}
    ${img(I.contexto.imagem)}
  </div></section>`;

  if (E.linhaDoTempo?.length) h += `
  <section class="hscroll alt" data-nav="Linha do tempo">
    <div class="hpin">
      <div class="hhead"><div class="kicker">Linha do tempo</div><h2>Onde este capítulo cai na história</h2></div>
      <div class="htrack">
        <div class="hline"></div>
        ${E.linhaDoTempo.map(t => `<div class="hit ${t.destaque ? 'hl' : ''}"><div class="yr">${esc(t.ano)}</div><div class="dot"></div><p>${md(t.evento)}</p></div>`).join('')}
      </div>
    </div>
  </section>`;

  h += `
  ${marquee('Estudo · versículo por versículo')}

  <section class="alt" data-nav="Estudo"><div class="wide">
    <div class="kicker rv">Estudo</div>
    <h2 class="rv">Texto anotado</h2>
    ${E.blocos.map((b, bi) => `
      <div class="blk">
        <div class="txt"><span class="rng">versículos ${esc(b.versos)}</span><span class="bnum">${String(bi + 1).padStart(2, '0')}</span>${range(b.versos).map(n => verse(n, b.destaques)).join('')}</div>
        <div class="notes">
          <h3 class="rv">${esc(b.titulo)}</h3>
          <p class="sum rv">${md(b.resumo)}</p>
          ${(b.notas || []).map(n => `<div class="note"><b>v. ${esc(n.v)}</b><br>${md(n.texto)}</div>`).join('')}
          ${b.comparacao ? `<div class="cmp rv"><div class="t">ARA × NAA × original</div><table>${b.comparacao.map(c => `<tr><td>v. ${esc(c.v)}</td><td>${md(c.texto)}</td></tr>`).join('')}</table></div>` : ''}
          ${img(b.imagem)}
        </div>
      </div>`).join('')}
  </div></section>`;

  if (E.palavras?.length) h += `
  <section class="wordsPin" data-nav="Original">
    <div class="wpin">
      <div class="kicker">Na língua original</div>
      <div class="wstage">${E.palavras.map((w, i) => `<div class="word" style="--i:${i}"><div class="orig">${esc(w.original)}</div><div class="tr">${esc(w.translit)}</div><p>${md(w.sentido)}</p></div>`).join('')}</div>
      <div class="wcount">${E.palavras.map((_, i) => `<span></span>`).join('')}</div>
    </div>
  </section>`;

  if (E.curiosidade) h += `
  <section class="curioPin" data-nav="Curiosidade">
    <div class="cpin">
      <div class="bgimg" style="background-image:url('${esc(E.curiosidade.imagem)}')"></div>
      <div class="in"><div class="kicker">Curiosidade</div><h3>${esc(E.curiosidade.titulo)}</h3><p>${md(E.curiosidade.texto)}</p></div>
    </div>
  </section>`;

  if (E.paraLevar) h += `
  <section class="applyS" data-nav="Para levar"><div class="wrap"><p class="apply reveal">${words(E.paraLevar.texto)}</p><span class="verse">${esc(E.paraLevar.ref || '')}</span></div></section>`;

  h += `
  <section class="next" id="next"></section>
  <footer><div class="wrap">
    <b>Fontes</b><ul>${(E.fontes || []).map(f => `<li>${md(f)}</li>`).join('')}</ul>
    <p>Estudado em ${esc(E.data)} · <a href="../">todos os estudos</a></p>
  </div></footer>
  ${hero(true)}`;

  $('#app').innerHTML = h;

  // navegação lateral (pontos)
  const secs = $$('[data-nav]');
  $('#dots').innerHTML = secs.map((s, i) => `<a data-i="${i}" title="${esc(s.dataset.nav)}"><span>${esc(s.dataset.nav)}</span></a>`).join('');
  $$('#dots a').forEach(a => a.onclick = () => secs[a.dataset.i].scrollIntoView({ behavior: 'smooth' }));

  // próximo estudo (a "rolagem infinita": o fim de um estudo leva ao próximo)
  const slug = location.pathname.split('/').pop().replace('.html', '');
  const ls = document.createElement('script'); ls.src = 'lista.js';
  ls.onload = () => {
    const L = window.ESTUDOS || [], i = L.findIndex(e => e.slug === slug);
    const nx = L[i + 1] || L[i - 1];
    $('#next').innerHTML = nx
      ? `<a class="nextCard" href="${esc(nx.slug)}.html"><div class="bgimg" style="background-image:url('../${esc(nx.capa)}')"></div><div class="in"><div class="kicker">${L[i + 1] ? 'Continue lendo' : 'Estudo anterior'}</div><h3>${esc(nx.ref)}</h3><p>${esc(nx.titulo)}</p><span>role ou toque →</span></div></a>`
      : `<a class="nextCard" href="../"><div class="in"><div class="kicker">Fim do estudo</div><h3>Biblioteca</h3><p>Todos os capítulos estudados</p><span>toque →</span></div></a>`;
    window.ScrollTrigger && ScrollTrigger.refresh();
  };
  document.body.appendChild(ls);

  // ---------- anotações (painel lateral, salvo no navegador por estudo) ----------
  const NK = 'estudos-notas:';
  const store = {
    get: k => { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
    set: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); return true; } catch { return false; } },
    all: () => { try { return Object.keys(localStorage).filter(k => k.startsWith(NK)).map(k => [k.slice(NK.length), localStorage.getItem(k)]).filter(([, v]) => v); } catch { return []; } },
  };
  const nomeDe = s => s.replace(/-(\d+)$/, ' $1').replace(/^./, c => c.toUpperCase());
  document.body.insertAdjacentHTML('beforeend', `
  <button id="noteFab" type="button" title="Anotações (tecla N)"><span class="ico">✎</span><span class="lbl">Anotar</span></button>
  <aside id="notePanel" data-lenis-prevent aria-hidden="true" aria-label="Anotações">
    <div class="nh"><div><div class="kicker">Minhas anotações</div><h3>${esc(ref)}</h3></div><button type="button" class="nx" title="Fechar (Esc)">×</button></div>
    <textarea id="noteTxt" placeholder="Escreva aqui suas perguntas e o que chamou atenção…&#10;&#10;Dica: selecione um trecho da página e toque em “Citar trecho”."></textarea>
    <div class="nbar">
      <button type="button" data-a="citar">❝ Citar trecho</button>
      <button type="button" data-a="copiar">Copiar</button>
      <button type="button" data-a="baixar">Baixar todas</button>
      <span class="nst" id="noteSt"></span>
    </div>
    <div class="nother" id="noteOther"></div>
  </aside>`);
  const fab = $('#noteFab'), pan = $('#notePanel'), ta = $('#noteTxt'), st = $('#noteSt');
  ta.value = store.get(NK + slug);
  let lastSel = '', stT;
  const flash = t => { st.textContent = t; clearTimeout(stT); stT = setTimeout(() => st.textContent = '', 1800); };
  const save = () => flash(store.set(NK + slug, ta.value.trim() ? ta.value : '') ? 'salvo ✓' : 'não foi possível salvar');
  let sv; ta.addEventListener('input', () => { clearTimeout(sv); sv = setTimeout(save, 400); });
  const others = () => {
    const o = store.all().filter(([s]) => s !== slug);
    $('#noteOther').innerHTML = o.length ? `<div class="kicker">Anotações de outros capítulos</div>` + o.map(([s, v]) =>
      `<details><summary><a href="${esc(s)}.html">${esc(nomeDe(s))}</a></summary><pre>${esc(v)}</pre></details>`).join('') : '';
  };
  const open = on => {
    pan.classList.toggle('on', on); pan.setAttribute('aria-hidden', !on); fab.classList.toggle('hide', on);
    if (on) { others(); setTimeout(() => ta.focus(), 250); }
  };
  // guarda a seleção feita no texto do estudo (fora do painel), para poder citar
  document.addEventListener('selectionchange', () => {
    const s = getSelection(), t = String(s).trim();
    if (t && !pan.contains(s.anchorNode)) lastSel = t;
    fab.classList.toggle('sel', !!t && !pan.contains(s.anchorNode));
    $('.lbl', fab).textContent = fab.classList.contains('sel') ? 'Anotar trecho' : 'Anotar';
  });
  const citar = () => {
    if (!lastSel) return flash('selecione um trecho da página antes');
    const q = lastSel.replace(/\s+/g, ' ').replace(/(^|\s)(\d{1,3})(?=[A-Za-zÀ-ú])/g, '$1(v. $2) '); // "3Porém" → "(v. 3) Porém"
    ta.value = (ta.value.trim() ? ta.value.replace(/\s*$/, '\n\n') : '') + `❝ ${q} ❞\n→ `;
    lastSel = ''; save(); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); ta.scrollTop = ta.scrollHeight;
  };
  fab.addEventListener('mousedown', e => e.preventDefault()); // não perde a seleção ao clicar
  fab.onclick = () => { const temSel = fab.classList.contains('sel'); open(true); if (temSel) citar(); };
  $('.nx', pan).onclick = () => open(false);
  $('.nbar', pan).onclick = async e => {
    const a = e.target.dataset?.a; if (!a) return;
    if (a === 'citar') citar();
    if (a === 'copiar') {
      const t = `${ref}\n\n${ta.value}`;
      try { await navigator.clipboard.writeText(t); flash('copiado ✓'); } catch { ta.select(); document.execCommand('copy'); flash('copiado ✓'); }
    }
    if (a === 'baixar') {
      const t = store.all().map(([s, v]) => `===== ${nomeDe(s)} =====\n${v.trim()}\n`).join('\n') || `${ref}\n\n${ta.value}`;
      const u = URL.createObjectURL(new Blob([t], { type: 'text/plain;charset=utf-8' }));
      Object.assign(document.createElement('a'), { href: u, download: 'anotacoes-estudos-biblicos.txt' }).click();
      setTimeout(() => URL.revokeObjectURL(u), 1000);
    }
  };
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && pan.classList.contains('on')) open(false);
    else if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) { e.preventDefault(); open(!pan.classList.contains('on')); }
  });
  addEventListener('storage', e => { if (e.key === NK + slug && document.activeElement !== ta) ta.value = e.newValue || ''; });

  // ---------- efeitos ----------
  const load = src => new Promise((ok, err) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = err; document.head.appendChild(s); });
  const basic = () => { // fallback sem GSAP
    document.body.classList.add('nofx');
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .15 });
    $$('.rv,.note,.figure,.txt').forEach(el => io.observe(el));
  };
  // (de propósito não respeita "reduzir movimento" do Windows: os efeitos são o pedido do Gabriel; ?simples desliga)
  if (location.search.includes('simples')) return basic();

  Promise.all([
    load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
    load('https://unpkg.com/lenis@1.1.13/dist/lenis.min.js'),
  ]).then(() => load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js')).then(fx).catch(basic);

  function fx() {
    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('fx');
    const lenis = new Lenis({ lerp: .085 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('#dots a').forEach(a => a.onclick = () => lenis.scrollTo(secs[a.dataset.i], { duration: 1.6 }));

    // progresso + crumb + pontos
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { $('#progress').style.width = s.progress * 100 + '%'; $('#crumb').classList.toggle('on', scrollY > innerHeight * .6); } });

    // HERO: número do capítulo com a foto dentro → mergulho → título sobe
    history.scrollRestoration = 'manual';
    ScrollTrigger.clearScrollMemory('manual');
    lenis.scrollTo(0, { immediate: true, force: true });
    const H = '.hero:not(.loop)';
    gsap.timeline({ delay: .15 })
      .from(H + ' .bignum', { clipPath: 'inset(100% 0% 0% 0%)', y: 60, rotate: -6, duration: 1.4, ease: 'expo.out' })
      .from(H + ' .ring svg', { scale: .6, opacity: 0, duration: 1.6, ease: 'expo.out' }, .2)
      .from(H + ' .corner,' + H + ' .scrollhint', { opacity: 0, y: 12, stagger: .08, duration: .8, ease: 'power3.out' }, .5);
    gsap.timeline({ scrollTrigger: { trigger: H, start: 'top top', end: '+=220%', scrub: 1, pin: true } })
      .to(H + ' .ring', { scale: 2.2, opacity: 0, duration: .35, ease: 'power2.in' }, 0)
      .to(H + ' .corners', { opacity: 0, duration: .15 }, 0)
      .to(H + ' .bignum', { scale: 45, duration: 1, ease: 'expo.in' }, .08)
      .to(H + ' .photo', { opacity: 1, duration: .25, ease: 'none' }, .72)
      .to(H + ' .photo img', { scale: 1, duration: 1.1, ease: 'none' }, .1)
      .to(H + ' .bignum', { opacity: 0, duration: .12 }, .78)
      .to(H + ' h1 i', { yPercent: 0, y: 0, opacity: 1, stagger: .1, ease: 'power3.out', duration: .4 }, 1.05)
      .to(H + ' .htitle .ref,' + H + ' .htitle p,' + H + ' .credit', { opacity: 1, duration: .3 }, 1.25);

    // faixas: andam sempre, aceleram e invertem com a velocidade da rolagem
    const loops = $$('.marquee .mq').map((m, i) => gsap.fromTo(m, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, repeat: -1, duration: 22, ease: 'none' }));
    let dir = 1;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: st => {
      const v = st.getVelocity(); if (v) dir = v > 0 ? 1 : -1;
      loops.forEach(l => gsap.to(l, { timeScale: dir * (1 + Math.min(Math.abs(v) / 250, 6)), duration: .25, overwrite: true }));
      gsap.to('.marquee .mq', { skewX: gsap.utils.clamp(-10, 10, -v / 200), duration: .4, overwrite: 'auto' });
    } });
    setInterval(() => loops.forEach(l => gsap.to(l, { timeScale: dir, duration: 1.2 })), 300);

    // títulos e blocos simples
    $$('.rv').forEach(el => gsap.from(el, { y: 20, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 95%' } }));

    // cartões empilhados: cada um vem por cima do anterior, que encolhe
    const cs = $$('.cardsStack .q');
    cs.forEach((c, i) => { if (i < cs.length - 1) gsap.to($$('p', c), { opacity: 0, ease: 'none', scrollTrigger: { trigger: cs[i + 1], start: 'top 90%', end: 'top 60%', scrub: true } }); });

    // palavras acendendo conforme a leitura
    $$('.reveal').forEach(p => gsap.fromTo($$('.w', p), { opacity: .12 }, { opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', end: 'bottom 55%', scrub: true } }));

    // imagens: janela que abre + zoom
    $$('.figure').forEach(f => {
      gsap.fromTo($('.clip', f), { clipPath: 'inset(18% 22% 18% 22% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 90%', end: 'center 55%', scrub: true } });
      gsap.fromTo($('img', f), { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // linha do tempo horizontal (seção presa, anda de lado)
    const tr = $('.htrack');
    if (tr) {
      const dist = () => tr.scrollWidth - innerWidth + 32;
      const tw = gsap.to(tr, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.hscroll', start: 'top top', end: () => '+=' + dist(), pin: '.hpin', scrub: 1, invalidateOnRefresh: true } });
      gsap.fromTo('.hline', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.hscroll', start: 'top top', end: () => '+=' + dist(), scrub: 1 } });
      $$('.hit').forEach(it => gsap.from(it, { opacity: .15, y: 50, scrollTrigger: { trigger: it, containerAnimation: tw, start: 'left 85%', end: 'left 55%', scrub: true } }));
    }

    // palavra gigante "Leitura"
    gsap.fromTo('.bw', { scale: 3.2, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.bigword', start: 'top bottom', end: 'center center', scrub: true } });
    gsap.to('.bw', { yPercent: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.bigword', start: 'center center', end: 'bottom top', scrub: true } });

    // texto puro: o versículo no centro da tela acende, o resto fica apagado
    $$('.scripture .v').forEach(v => ScrollTrigger.create({ trigger: v, start: 'top 78%', end: 'bottom 22%', toggleClass: 'on' }));

    // texto anotado: o texto fica preso e as notas entram pelo lado
    $$('.blk').forEach(b => {
      gsap.from($('.txt', b), { opacity: 0, x: -60, rotateY: 8, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 80%' } });
      gsap.fromTo($('.bnum', b), { yPercent: 40 }, { yPercent: -40, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
      $$('.note', b).forEach(n => gsap.from(n, { opacity: 0, x: 70, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 88%' } }));
      $$('mark', b).forEach(m => ScrollTrigger.create({ trigger: m, start: 'top 70%', onEnter: () => m.classList.add('lit') }));
    });

    // palavras no original: uma de cada vez, em tela cheia
    const ws = $$('.wstage .word');
    if (ws.length) {
      const wt = gsap.timeline({ scrollTrigger: { trigger: '.wordsPin', start: 'top top', end: '+=' + ws.length * 90 + '%', pin: '.wpin', scrub: 1,
        onUpdate: s => $$('.wcount span').forEach((d, i) => d.classList.toggle('on', i <= Math.min(ws.length - 1, Math.floor(s.progress * ws.length)))) } });
      ws.forEach((w, i) => {
        wt.fromTo(w, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: .5 });
        if (i < ws.length - 1) wt.to(w, { opacity: 0, scale: .85, duration: .4 }, '+=1.6');
      });
    }

    // curiosidade: círculo que abre até a tela cheia
    if ($('.curioPin')) {
      const ct = gsap.timeline({ scrollTrigger: { trigger: '.curioPin', start: 'top top', end: '+=160%', pin: '.cpin', scrub: 1 } });
      ct.fromTo('.cpin .bgimg', { clipPath: 'circle(12% at 50% 50%)', scale: 1.3 }, { clipPath: 'circle(75% at 50% 50%)', scale: 1, duration: .8 })
        .from('.cpin .in > *', { opacity: 0, y: 30, stagger: .1, duration: .4 }, .55)
        .to({}, { duration: .8 });
    }

    // próximo estudo
    gsap.from('#next', { opacity: 0, scale: .92, scrollTrigger: { trigger: '#next', start: 'top bottom', end: 'top 40%', scrub: true } });

    // pontos laterais (criados depois das seções presas, para pegar as posições certas)
    secs.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: 'top center', end: 'bottom center', onToggle: st => st.isActive && $$('#dots a').forEach((a, j) => a.classList.toggle('on', j === i)) }));

    // ROLAGEM INFINITA: a última tela é a capa de novo; quando ela cobre a tela, volta ao topo sem emenda
    let jumping = false;
    const twin = $('.hero.loop');
    lenis.on('scroll', ({ scroll }) => {
      const top = twin.getBoundingClientRect().top + scroll;
      if (!jumping && top > innerHeight * 3 && scroll >= top) {
        jumping = true;
        lenis.scrollTo(Math.max(0, scroll - top), { immediate: true, force: true });
        ScrollTrigger.update();
        ScrollTrigger.getAll().forEach(t => { const tw = t.getTween && t.getTween(); if (tw) tw.progress(1); });
        requestAnimationFrame(() => jumping = false);
      }
    });

    let rf; const refresh = () => { clearTimeout(rf); rf = setTimeout(() => ScrollTrigger.refresh(), 200); };
    $$('img').forEach(im => im.complete || im.addEventListener('load', refresh));
    addEventListener('load', refresh);
  }
})();
