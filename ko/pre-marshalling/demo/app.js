'use strict';
const PROBLEMS = [
  {id:'container', file:'data/261008-v0_demo_paths_bellman.json'},
  {id:'stockyard', file:'data/261008-v0_demo_paths_stockyard.json'}
];
const I18N = {
  ko:{
    title:'사전 재배치 결과 데모', problem:'문제', case_:'사례', method:'탐색 방식', speed:'속도',
    container:'컨테이너 터미널 (8열 x 5단)', stockyard:'철강 적치장',
    astar:'학습된 가치망 A* 탐색', beam:'빔 탐색',
    play:'재생', pause:'정지', ok:'정상 위치', bad:'잘못 쌓임(아래에 더 먼저 나갈 블록이 있음)',
    step:'이동', of:'/', done:'완료: 모든 열이 출고 순서대로 정렬됨', fail:'이 사례는 해결하지 못함',
    stack:'열', noteMissing:'이 문제의 결과 파일이 아직 없습니다. 준비 중입니다.',
    noteLoad:'데이터를 불러오지 못했습니다.',
    fixed:'고정 평가 상태', random:'무작위 초기 상태',
    sumTitle:'요약', sumFixed:'고정 평가 상태', sumRandom:'무작위 초기 상태 해결', sumAvg:'해결 사례 평균 이동 수',
    sumMoves:'이동 수', sumNeeded:'필요한 최소 재배치 수(초기)', sumGen:'생성 시각', sumCkpt:'체크포인트 sha256',
    solved:'해결', unsolved:'미해결',
    aboutTitle:'무엇을 푸는 문제인가',
    p1:'블록을 열 사이로 한 개씩 옮겨, 먼저 나가야 하는 블록이 다른 블록 밑에 깔려 있지 않도록 미리 정리하는 문제입니다. 한 번에 한 열의 맨 위 블록 하나만 다른 열의 맨 위로 옮길 수 있고, 이동 수가 적을수록 좋습니다.',
    p2:'학습된 모델이 상태의 좋고 나쁨을 평가하고, 그 평가를 따라 이동 순서를 탐색합니다. 같은 방식을 컨테이너 터미널과 철강 적치장 두 문제에 적용했습니다.',
    p3:'결과 화면만 공개하며 코드는 공개하지 않습니다. 표시되는 숫자는 모두 결과 파일에서 읽은 값입니다.',
    pat:'관련 특허', pat1:'KR102325608B1 (역방향 학습 데이터 생성)', pat2:'KR102853422B1 (학습된 그래프 경로 탐색)',
    colorNote:'블록 안의 숫자는 출고 순서이며 작을수록 먼저 나갑니다.'
  },
  en:{
    title:'Pre-marshalling Result Demo', problem:'Problem', case_:'Case', method:'Search method', speed:'Speed',
    container:'Container terminal (8 stacks x 5 tiers)', stockyard:'Steel stockyard',
    astar:'A* search with a learned value network', beam:'Beam search',
    play:'Play', pause:'Pause', ok:'Correct position', bad:'Misplaced (a block that leaves earlier is below it)',
    step:'Move', of:'/', done:'Done: every stack is ordered by retrieval order', fail:'This case was not solved',
    stack:'Stack', noteMissing:'The result file for this problem is not available yet. In preparation.',
    noteLoad:'Failed to load data.',
    fixed:'Fixed evaluation state', random:'Random initial state',
    sumTitle:'Summary', sumFixed:'Fixed evaluation state', sumRandom:'Random initial states solved', sumAvg:'Average moves over solved cases',
    sumMoves:'Moves', sumNeeded:'Minimum relocations needed (initial)', sumGen:'Generated at', sumCkpt:'Checkpoint sha256',
    solved:'solved', unsolved:'unsolved',
    aboutTitle:'What problem is solved',
    p1:'Blocks are moved one at a time between stacks so that blocks that must leave first are not buried under others. Only the top block of one stack can be moved onto the top of another stack, and fewer moves is better.',
    p2:'A trained model scores how good a state is, and the move sequence is searched by following that score. The same method is applied to two problems: a container terminal and a steel stockyard.',
    p3:'Only results are shown. The code is not published. Every number on this page is read from the result files.',
    pat:'Related patents', pat1:'KR102325608B1 (reverse training data generation)', pat2:'KR102853422B1 (learned graph path search)',
    colorNote:'The number in a block is its retrieval order; a smaller number leaves earlier.'
  }
};
const $ = id => document.getElementById(id);
let lang = (navigator.language||'ko').startsWith('en') ? 'en' : 'ko';
const T = k => I18N[lang][k];
const data = {};      // problem id -> json or null
let cur = null;       // {bay, stacks:[[{id,v}]], moves, initial}
let step = 0, timer = null;
const CELL = 46, GAP = 8;

async function loadAll(){
  for(const p of PROBLEMS){
    try{
      const r = await fetch(p.file, {cache:'no-store'});
      data[p.id] = r.ok ? await r.json() : null;
    }catch(e){ data[p.id] = null; }
  }
}
function method(){ return $('method').value; }
function caseObj(){ const d=data[$('problem').value]; return d ? d.cases[+$('case').value] : null; }

function buildStacks(init, nStacks){
  // init rows: row 0 = bottom, 0 = empty
  const stacks = Array.from({length:nStacks}, ()=>[]);
  let id = 0;
  for(let r=0;r<init.length;r++) for(let c=0;c<nStacks;c++){
    // row-by-row from bottom so ids follow stacking order
    if(init[r][c]>0) stacks[c].push({id:id++, v:init[r][c]});
  }
  return stacks;
}
function clone(s){ return s.map(a=>a.map(b=>b)); }
function stateAt(n){
  const s = clone(cur.initial);
  for(let i=0;i<n;i++){ const [a,b]=cur.moves[i]; s[b].push(s[a].pop()); }
  return s;
}
function isBad(stack, k){ for(let j=0;j<k;j++) if(stack[j].v < stack[k].v) return true; return false; }
function color(v, maxv){ const t=(v-1)/Math.max(1,maxv-1); return `hsl(${Math.round(210-t*190)},75%,${72}%)`; }

function renderBase(){
  const bay = $('bay'); bay.innerHTML='';
  const ns = cur.bay.stacks, nt = cur.bay.tiers;
  bay.style.width = (ns*(CELL+GAP)+GAP)+'px';
  bay.style.height = (nt*(CELL+4)+30)+'px';
  for(let c=0;c<ns;c++){
    const s=document.createElement('div'); s.className='slot';
    s.style.left=(GAP+c*(CELL+GAP))+'px'; s.style.width=CELL+'px';
    s.style.top=(nt*(CELL+4)+2)+'px'; s.style.height='1px';
    bay.appendChild(s);
    const l=document.createElement('div'); l.className='sidx';
    l.style.left=(GAP+c*(CELL+GAP))+'px'; l.style.width=CELL+'px'; l.style.top=(nt*(CELL+4)+8)+'px';
    l.textContent=c+1; bay.appendChild(l);
  }
  cur.els = {};
  for(const st of cur.initial) for(const b of st){
    const e=document.createElement('div'); e.className='blk';
    e.style.width=e.style.height=CELL+'px';
    e.style.left='0'; e.style.top='0';
    e.style.background=color(b.v, cur.bay.n_priorities);
    e.textContent=b.v; bay.appendChild(e); cur.els[b.id]=e;
  }
}
function place(n){
  const s = stateAt(n), nt = cur.bay.tiers;
  s.forEach((st,c)=>st.forEach((b,k)=>{
    const e=cur.els[b.id];
    const x=GAP+c*(CELL+GAP), y=(nt-1-k)*(CELL+4);
    e.style.transform=`translate(${x}px,${y}px)`;
    e.classList.toggle('bad', isBad(st,k));
  }));
  const total=cur.moves.length;
  $('step').textContent=`${T('step')} ${n} ${T('of')} ${total}`;
  $('mv').textContent = n>0 ? `(${T('stack')} ${cur.moves[n-1][0]+1} -> ${T('stack')} ${cur.moves[n-1][1]+1})` : '';
  $('done').textContent = (n===total) ? (cur.solved ? T('done') : T('fail')) : '';
  $('done').className = 'done';
}
function setStep(n){ step=Math.max(0,Math.min(cur.moves.length,n)); place(step); if(step>=cur.moves.length) stop(); }
function stop(){ if(timer){clearInterval(timer);timer=null;} $('play').textContent=T('play'); }
function play(){
  if(timer){ stop(); return; }
  if(step>=cur.moves.length) setStep(0);
  $('play').textContent=T('pause');
  const tick=()=>{ setStep(step+1); };
  const sp=+$('speed').value;
  timer=setInterval(()=>{ tick(); if(!timer) return; }, 700/sp);
}
function loadCase(){
  stop();
  const c=caseObj(); const d=data[$('problem').value];
  if(!c){ return; }
  const m=c[method()] || c.astar_nsa;
  cur = {bay:d.bay, initial:buildStacks(c.initial_state,d.bay.stacks), moves:m.moves, solved:m.solved};
  renderBase(); step=0; place(0);
}
function caseLabel(c){
  return c.name==='sn' ? `sn (${T('fixed')})` : `${c.name} (${T('random')})`;
}
function fillCases(){
  const d=data[$('problem').value], sel=$('case'); sel.innerHTML='';
  d.cases.forEach((c,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=caseLabel(c); sel.appendChild(o); });
}
function fillMethods(){
  const sel=$('method'), keep=sel.value||'astar_nsa'; sel.innerHTML='';
  [['astar_nsa','astar'],['beam','beam']].forEach(([v,k])=>{ const o=document.createElement('option'); o.value=v; o.textContent=T(k); sel.appendChild(o); });
  sel.value=keep;
}
function fillProblems(){
  const sel=$('problem'), keep=sel.value||'container'; sel.innerHTML='';
  PROBLEMS.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=T(p.id)+(data[p.id]?'':' ('+(lang==='ko'?'준비 중':'in preparation')+')'); sel.appendChild(o); });
  sel.value=keep;
}
function renderSummary(){
  const d=data[$('problem').value], el=$('summary');
  if(!d){ el.innerHTML=''; return; }
  const m=method();
  const sn=d.cases.find(c=>c.name==='sn');
  const rnd=d.cases.filter(c=>c.name!=='sn');
  const sol=rnd.filter(c=>c[m] && c[m].solved);
  const avg=sol.length ? (sol.reduce((a,c)=>a+c[m].n_moves,0)/sol.length).toFixed(1) : '-';
  const rows=[];
  if(sn) rows.push([T('sumFixed'), sn[m].solved ? `${T('solved')}, ${sn[m].n_moves} ${T('sumMoves')}` : T('unsolved')]);
  if(rnd.length) rows.push([T('sumRandom'), `${sol.length} / ${rnd.length}`]);
  if(rnd.length) rows.push([T('sumAvg'), avg]);
  const c=caseObj();
  if(c){
    if(c.relocations_needed_initial!=null) rows.push([T('sumNeeded'), c.relocations_needed_initial]);
    rows.push([`${caseLabel(c)}: ${T('sumMoves')}`, c[m] && c[m].solved ? c[m].n_moves : T('unsolved')]);
  }
  rows.push([T('sumGen'), d.created_at]);
  if(d.checkpoint_sha256) rows.push([T('sumCkpt'), `<span class="small">${d.checkpoint_sha256}</span>`]);
  el.innerHTML=`<h2>${T('sumTitle')}</h2><table>`+rows.map(r=>`<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')+'</table>';
}
function renderStatic(){
  $('t-title').textContent=T('title'); document.title=T('title');
  $('l-problem').textContent=T('problem'); $('l-case').textContent=T('case_'); $('l-method').textContent=T('method');
  $('l-speed').textContent=T('speed'); $('l-ok').textContent=T('ok'); $('l-bad').textContent=T('bad');
  $('lang').textContent = lang==='ko' ? 'EN' : '한국어';
  $('play').textContent = timer ? T('pause') : T('play');
  $('about').innerHTML=`<h2>${T('aboutTitle')}</h2><p>${T('p1')}</p><p>${T('colorNote')}</p><p>${T('p2')}</p><p>${T('p3')}</p>`+
    `<h2>${T('pat')}</h2><p>${T('pat1')}</p><p>${T('pat2')}</p>`;
}
function onProblem(){
  stop();
  const d=data[$('problem').value], nt=$('notice');
  const stage=document.querySelector('.stage');
  if(!d){
    nt.hidden=false; nt.textContent=T('noteMissing'); stage.hidden=true; $('summary').innerHTML=''; return;
  }
  nt.hidden=true; stage.hidden=false;
  fillCases(); loadCase(); renderSummary();
}
async function init(){
  await loadAll();
  if(!data.container && !data.stockyard){ $('notice').hidden=false; $('notice').textContent=T('noteLoad'); }
  fillProblems(); fillMethods(); renderStatic(); onProblem();
  $('problem').onchange=onProblem;
  $('case').onchange=()=>{ loadCase(); renderSummary(); };
  $('method').onchange=()=>{ loadCase(); renderSummary(); };
  $('first').onclick=()=>{stop();setStep(0);};
  $('last').onclick=()=>{stop();setStep(cur.moves.length);};
  $('prev').onclick=()=>{stop();setStep(step-1);};
  $('next').onclick=()=>{stop();setStep(step+1);};
  $('play').onclick=play;
  $('speed').oninput=()=>{ $('speedv').textContent=$('speed').value+'x'; if(timer){stop();play();} };
  const q=new URLSearchParams(location.search);
  if(q.get('lang')){ lang=q.get('lang')==='en'?'en':'ko'; fillProblems(); fillMethods(); renderStatic(); }
  if(q.get('case')!==null && data[$('problem').value]){ $('case').value=q.get('case'); loadCase(); renderSummary(); }
  if(q.get('step')) setStep(+q.get('step'));
  if(q.get('autoplay')) play();
  $('lang').onclick=()=>{
    lang = lang==='ko'?'en':'ko';
    fillProblems(); fillMethods(); renderStatic();
    const ci=$('case').value; if(data[$('problem').value]){ fillCases(); $('case').value=ci; place(step); renderSummary(); }
    else onProblem();
  };
}
init();
