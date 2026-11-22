// ---- Audio (Web Audio) ----
let AC;function snd(f,d,t='square',v=.05){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.type=t;o.frequency.setValueAtTime(f,AC.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(30,f/3),AC.currentTime+d);g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
// ---- Entrées ----
const K={},P={};addEventListener('keydown',e=>{if(!K[e.code])P[e.code]=1;K[e.code]=1;if(e.code.startsWith('Arrow')||e.code=='Space')e.preventDefault()});addEventListener('keyup',e=>K[e.code]=0);C.addEventListener('contextmenu',e=>e.preventDefault());C.addEventListener('mousedown',e=>{if(M.style.display!=='none')return;const k=e.button===0?'Mouse0':e.button===2?'Mouse2':null;if(!k)return;e.preventDefault();if(!K[k])P[k]=1;K[k]=1});addEventListener('mouseup',e=>{if(e.button===0)K.Mouse0=0;if(e.button===2)K.Mouse2=0});addEventListener('blur',()=>{K.Mouse0=K.Mouse2=0});
// Note : "KeyA/KeyD" = positions physiques Q/D sur AZERTY ; Z = KeyW

// ---- Commandes personnalisables, options, rendu des cheveux ----
let LOW=false,MU=true;try{LOW=localStorage.getItem('falow')==='1';MU=localStorage.getItem('famu')!=='0'}catch(e){}
const KDEF=[{l:'KeyA',r:'KeyD',d:'KeyS',j:'Space',b:'KeyF',li:'KeyJ',he:'KeyK',sp:'KeyG',ul:'KeyV',tr:'KeyT',ch:'KeyC',tp:'KeyR',dg:'KeyE',ds:'KeyQ',kk:'KeyY'},{l:'ArrowLeft',r:'ArrowRight',d:'ArrowDown',j:'ArrowUp',b:'Numpad0',li:'Digit1',he:'Digit2',sp:'Digit3',ul:'Digit4',tr:'Digit5',ch:'Digit6',tp:'Digit7',dg:'Numpad1',ds:'Numpad5',kk:'Digit8'}];
const ACT=[['l','Gauche (Q)'],['r','Droite (D)'],['j','Saut'],['d','Accroupi'],['b','Garde (F)'],['sp','Attaque spéciale (G)'],['ul','Ultime (V)'],['tr','Transformation (T)'],['ch','Charge de ki (C)'],['tp','Téléportation (R)'],['dg','Esquive (E)'],['ds','Dash (A)'],['kk','Kaioken (Y, Goku)']];
let KM=JSON.parse(JSON.stringify(KDEF)),LB={};try{const s=JSON.parse(localStorage.getItem('fakm')||'null');if(s&&s.km){for(let p=0;p<2;p++)Object.assign(KM[p],s.km[p]||{});LB=s.lb||{};if(KM[0].sp==='KeyL')KM[0].sp='KeyG';if(KM[0].ul==='KeyU')KM[0].ul='KeyV';if(KM[0].kk==='KeyV')KM[0].kk='KeyY'}}catch(e){}
const saveKM=()=>{try{localStorage.setItem('fakm',JSON.stringify({km:KM,lb:LB}))}catch(e){}};
const DL={KeyA:'Q',KeyQ:'A',KeyD:'D',KeyW:'Z',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'ESPACE',Numpad0:'Pavé 0',Numpad1:'Pavé 1',Numpad5:'Pavé 5'},lab=c=>LB[c]||DL[c]||c.replace(/^(Key|Digit)/,'');
function humIn(i){const m=KM[i],o={};for(const k in m){o[k]=K[m[k]];o[k+'P']=P[m[k]]}if(i===0){o.li=!!K.Mouse0;o.liP=!!P.Mouse0;o.he=!!K.Mouse2;o.heP=!!P.Mouse2}return o}
let lis=null;
function ctlMenu(msg){M.style.display='flex';M.innerHTML='<h1>COMMANDES</h1><small>Clique une action puis appuie sur la nouvelle touche (Échap annule). Les attaques du joueur 1 sont fixes : clic gauche (léger), clic droit maintenu (lourd). Gauche/Droite = Q/D.</small>'+(msg?'<small style=color:#fd0>'+msg+'</small>':'');for(let p=0;p<2;p++){M.appendChild(row([btn(p?'— JOUEUR 2 —':'— JOUEUR 1 —',()=>{})]));M.appendChild(row(ACT.map(([k,n])=>{const on=lis&&lis.p===p&&lis.k===k;return btn(n+' : '+(on?'…':lab(KM[p][k])),()=>{lis={p,k};ctlMenu()},on)})))}M.appendChild(row([btn('Restaurer par défaut',()=>{KM=JSON.parse(JSON.stringify(KDEF));LB={};lis=null;saveKM();ctlMenu('Commandes restaurées.')}),btn('← Retour',()=>{lis=null;menu()})]))}
addEventListener('keydown',e=>{if(!lis)return;e.preventDefault();e.stopImmediatePropagation();const c=e.code,p=lis.p,k=lis.k;if(c==='Escape'){lis=null;ctlMenu();return}for(let q=0;q<2;q++)for(const [kk,nn] of ACT)if(KM[q][kk]===c&&!(q===p&&kk===k)){ctlMenu('Conflit : '+lab(c)+' est déjà utilisée par J'+(q+1)+' · '+nn);return}KM[p][k]=c;LB[c]=e.key&&e.key.length===1?e.key.toUpperCase():c;lis=null;saveKM();ctlMenu('Touche enregistrée.')},true);
let mus=null,musMode='menu',musStep=0,musicMaster=null,MUSIC_VOL=.42;
try{const stored=Number(localStorage.getItem('famusicvol'));if(Number.isFinite(stored)&&stored>=.1&&stored<=.8)MUSIC_VOL=stored}catch(e){}
const midiHz=n=>440*Math.pow(2,(n-69)/12);
function musicNote(freq,dur,type='triangle',vol=.05,when,slide){
 if(!AC||!musicMaster)return;const t=when??AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
 o.type=type;o.frequency.setValueAtTime(Math.max(25,freq),t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,slide),t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.025);g.gain.setValueAtTime(vol*.72,t+Math.max(.04,dur*.58));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g).connect(musicMaster);o.start(t);o.stop(t+dur+.03);
}
function setMusicVolume(v){
 MUSIC_VOL=Math.max(.1,Math.min(.8,Number(v)||.42));try{localStorage.setItem('famusicvol',String(MUSIC_VOL))}catch(e){}
 if(musicMaster&&AC)musicMaster.gain.setTargetAtTime(MU?MUSIC_VOL:0,AC.currentTime,.12);
}
function music(on,mode='menu'){
 if(mus){clearInterval(mus);mus=null}musMode=mode||'menu';
 if(!on||!MU){if(musicMaster&&AC)musicMaster.gain.setTargetAtTime(0,AC.currentTime,.12);return}
 try{
  AC=AC||(window.AudioContext?new AudioContext():new (window.webkitAudioContext)());
  if(AC.state==='suspended')AC.resume().catch(()=>{});
  if(!musicMaster){musicMaster=AC.createGain();musicMaster.gain.value=0;musicMaster.connect(AC.destination)}
  musicMaster.gain.setTargetAtTime(MUSIC_VOL,AC.currentTime,.35);musStep=0;
  const progressions={menu:[[53,57,60],[48,52,55],[50,53,57],[45,48,52]],adventure:[[52,55,59],[48,52,55],[43,47,50],[50,54,57]],story:[[57,60,64],[53,57,60],[48,52,55],[50,54,57]],battle:[[52,55,59],[55,59,62],[57,60,64],[50,54,57]],train:[[52,55,59],[48,52,55],[43,47,50],[50,54,57]]};
  const chords=progressions[musMode]||progressions.adventure,melody=[76,79,83,81,79,76,74,76,79,83,86,83,81,79,76,74,76,79,81,86,83,81,79,76,74,76,79,83,81,79,76,72];
  mus=setInterval(()=>{
   if(!AC||AC.state!=='running'||!MU)return;
   const step=musStep++,bar=Math.floor((step%32)/8),beat=step%8,chord=chords[bar],now=AC.currentTime+.015;
   if(beat===0){chord.forEach((n,i)=>{musicNote(midiHz(n),1.72,i===0?'triangle':'sine',i===0?.025:.016,now);if(i===1)musicNote(midiHz(n+12),1.45,'triangle',.009,now+.025)})}
   if(beat===0||beat===4){const root=chord[0]-12;musicNote(midiHz(root),.34,'triangle',.052,now,midiHz(root-5));if(beat===0)musicNote(112,.13,'sine',.045,now,48);else musicNote(190,.08,'triangle',.016,now,90)}
   if(beat===1||beat===3||beat===5||beat===7){const note=melody[(bar*4+Math.floor(beat/2)+(musMode==='battle'?4:0))%melody.length];musicNote(midiHz(note),.22,'triangle',musMode==='menu'?.026:.034,now);if(beat===5)musicNote(midiHz(note-12),.18,'sine',.012,now+.02)}
   if(musMode==='battle'&&(beat===2||beat===6))musicNote(78,.11,'sine',.018,now,42);
  },250);
 }catch(e){console.warn('Musique indisponible',e)}
}
const unlockMusic=()=>{if(AC&&AC.state==='suspended')AC.resume().catch(()=>{});if(MU&&!mus)music(true,musMode)};
window.addEventListener('pointerdown',unlockMusic,{passive:true});
window.addEventListener('keydown',unlockMusic,{passive:true});
let rings=[];function ring(x,y,col,max){if(rings.length<12)rings.push({x,y,col,max,r:5})}
function mix(h,tc,a){const p=x=>{x=x.replace('#','');if(x.length==3)x=x[0]+x[0]+x[1]+x[1]+x[2]+x[2];return[parseInt(x.slice(0,2),16),parseInt(x.slice(2,4),16),parseInt(x.slice(4,6),16)]},A=p(h),B=p(tc);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*a)).join(',')+')'}
function drawHair(f,fo,lk,tfm){const t=G.tick,pts=HS[fo.hs||lk.hs],hc=fo.hair,mv=Math.max(-3,Math.min(3,-f.vx*f.face*.7)),up=f.chg?3:0,hg=1+(f.fm|0)*.035;const Q=pts.map((p,i)=>{const y0=p[1]<-100?-100+(p[1]+100)*hg:p[1],k=Math.min(1,Math.max(0,(-100-y0)/30)),w=tfm?Math.sin(t*.3+i)*2.5:Math.sin(t*.08+i)*.8;return[p[0]+2+(mv+w*.6)*k,y0+w-up*k]});const g=X.createLinearGradient(0,-86,0,-150);g.addColorStop(0,mix(hc,'#000000',.4));g.addColorStop(.55,hc);g.addColorStop(1,mix(hc,'#ffffff',.5));Pg(Q,g,3);X.lineCap='round';for(let i=1;i<Q.length-1;i++)if(Q[i][1]<-108){const q=Q[i],bx=q[0]*.5+1;X.strokeStyle=mix(hc,'#000000',.5);X.lineWidth=1.3;X.beginPath();X.moveTo(bx,-102);X.quadraticCurveTo((bx+q[0])/2-2,(q[1]-102)/2,q[0],q[1]+4);X.stroke();X.strokeStyle=mix(hc,'#ffffff',.75);X.lineWidth=1.6;X.beginPath();X.moveTo(bx+3,-104);X.quadraticCurveTo((bx+q[0])/2+1,(q[1]-104)/2,q[0]+2,q[1]+8);X.stroke()}if(tfm&&!LOW){X.save();X.globalCompositeOperation='lighter';X.strokeStyle=al(fo.au,.5);X.lineWidth=2;X.beginPath();for(let i=1;i<Q.length-1;i+=2){X.moveTo(Q[i][0],Q[i][1]);X.lineTo(Q[i][0]+(Math.random()-.5)*6,Q[i][1]-6-Math.random()*6)}X.stroke();X.restore()}}
