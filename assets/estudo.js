// Monta a página de estudo a partir de window.ESTUDO (definido em estudos/<slug>.html)
(function () {
  const E = window.ESTUDO;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // "1-5" | "1-3,7" -> [1,2,3,...]
  const range = r => String(r).split(',').flatMap(p => {
    const [a, b] = p.split('-').map(Number); const out = [];
    for (let i = a; i <= (b || a); i++) out.push(i); return out;
  });
  const verse = (n, marks = []) => {
    let t = esc(E.versos[n] || '');
    marks.forEach(m => { t = t.replace(new RegExp('(' + m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'), '<mark>$1</mark>'); });
    return `<sup>${n}</sup>${t} `;
  };
  const img = (o, cls = 'figure') => o && o.src ? `<figure class="${cls} rv"><img src="${esc(o.src)}" alt="${esc(o.legenda)}" loading="lazy"><figcaption>${md(o.legenda)}</figcaption></figure>` : '';

  document.title = `${E.livro} ${E.capitulo} · Estudos Bíblicos`;
  const I = E.introducao;
  let h = `
  <div id="progress"></div>
  <div id="crumb"><a href="../">Estudos</a> · ${esc(E.livro)} ${esc(E.capitulo)}</div>
  <header class="hero">
    <div class="bgimg" style="background-image:url('${esc(E.capa?.src)}')"></div>
    <div class="in">
      <div class="ref rv">${esc(E.livro)} · capítulo ${esc(E.capitulo)}</div>
      <h1 class="rv d1">${esc(E.titulo)}</h1>
      <p class="rv d2">${esc(E.subtitulo)}</p>
    </div>
    ${E.capa?.credito ? `<div class="credit">${esc(E.capa.credito)}</div>` : ''}
    <div class="scrollhint">role ↓</div>
  </header>

  <section><div class="wrap">
    <div class="kicker rv">Antes de ler</div>
    <h2 class="rv">Quem, para quem, quando e em que língua</h2>
    <div class="qgrid">
      ${[['✍️', 'Quem escreveu', I.autor], ['👥', 'Para quem', I.destinatarios], ['⏳', 'Quando', I.epoca], ['📜', 'Língua original', I.lingua]]
      .map(([ic, lb, o], i) => `<div class="q rv d${i % 4}"><div class="ic">${ic}</div><div class="lb">${lb}</div><div class="val">${md(o.titulo)}</div><p>${md(o.texto)}</p></div>`).join('')}
    </div>
  </div></section>

  <section class="alt"><div class="wrap">
    <div class="kicker rv">Contexto da época</div>
    <h2 class="rv">${esc(I.contexto.titulo)}</h2>
    ${I.contexto.paragrafos.map(p => `<p class="rv" style="margin-bottom:16px">${md(p)}</p>`).join('')}
    ${img(I.contexto.imagem)}
    ${E.linhaDoTempo ? `<div class="tl">${E.linhaDoTempo.map(t => `<div class="it rv ${t.destaque ? 'hl' : ''}"><div class="yr">${esc(t.ano)}</div>${md(t.evento)}</div>`).join('')}</div>` : ''}
  </div></section>

  <section><div class="wrap">
    <div class="kicker rv">Leitura</div>
    <h2 class="rv">${esc(E.livro)} ${esc(E.capitulo)} — texto puro</h2>
    <div class="scripture">
      ${E.paragrafos.map(p => `<p class="ph rv">${range(p).map(n => `<span class="v"><sup>${n}</sup>${esc(E.versos[n])} </span>`).join('')}</p>`).join('')}
    </div>
    <p class="vernote">${md(E.notaVersao)}</p>
  </div></section>

  <section class="alt"><div class="wide">
    <div class="kicker rv">Estudo</div>
    <h2 class="rv">Texto anotado</h2>
    ${E.blocos.map(b => `
      <div class="blk">
        <div class="txt rv"><span class="rng">versículos ${esc(b.versos)}</span>${range(b.versos).map(n => verse(n, b.destaques)).join('')}</div>
        <div class="notes">
          <h3 class="rv">${esc(b.titulo)}</h3>
          <p class="sum rv">${md(b.resumo)}</p>
          ${(b.notas || []).map(n => `<div class="note rv"><b>v. ${esc(n.v)}</b><br>${md(n.texto)}</div>`).join('')}
          ${b.comparacao ? `<div class="cmp rv"><div class="t">ARA × NAA × original</div><table>${b.comparacao.map(c => `<tr><td>v. ${esc(c.v)}</td><td>${md(c.texto)}</td></tr>`).join('')}</table></div>` : ''}
          ${img(b.imagem)}
        </div>
      </div>`).join('')}
  </div></section>`;

  if (E.palavras?.length) h += `
  <section><div class="wrap">
    <div class="kicker rv">Na língua original</div>
    <h2 class="rv">Palavras-chave</h2>
    <div class="words">${E.palavras.map((w, i) => `<div class="word rv d${i % 4}"><div class="orig">${esc(w.original)}</div><div class="tr">${esc(w.translit)}</div><p>${md(w.sentido)}</p></div>`).join('')}</div>
  </div></section>`;

  if (E.curiosidade) h += `
  <section class="alt"><div class="wrap">
    <div class="curio rv"><div class="bgimg" style="background-image:url('${esc(E.curiosidade.imagem)}')"></div>
      <div class="in"><div class="kicker">Curiosidade</div><h3>${esc(E.curiosidade.titulo)}</h3><p>${md(E.curiosidade.texto)}</p></div>
    </div>
  </div></section>`;

  if (E.paraLevar) h += `
  <section><div class="wrap"><p class="apply rv">${md(E.paraLevar.texto)}<span class="verse">${esc(E.paraLevar.ref || '')}</span></p></div></section>`;

  h += `<footer><div class="wrap">
    <b>Fontes</b><ul>${(E.fontes || []).map(f => `<li>${md(f)}</li>`).join('')}</ul>
    <p>Estudado em ${esc(E.data)} · <a href="../">todos os estudos</a></p>
  </div></footer>`;

  $('#app').innerHTML = h;

  // animações de rolagem
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.rv,.figure,.curio').forEach(el => io.observe(el));
  const bar = $('#progress'), crumb = $('#crumb'), hero = $('.hero .bgimg');
  addEventListener('scroll', () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (y / max * 100) + '%';
    crumb.classList.toggle('on', y > innerHeight * .6);
    if (hero && y < innerHeight) hero.style.transform = `translateY(${y * .35}px) scale(1.05)`;
  }, { passive: true });
})();
