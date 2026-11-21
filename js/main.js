// ---- Menus ----
const STORY_CLEAR_TARGET=Math.max(1,SAGAS.reduce((n,sg)=>n+sg.ch.filter(c=>!c.scene).length,0)*3);const lvl=()=>Math.min(100,1+Math.floor((Math.sqrt(1+8*Math.max(0,Number(sv.xp)||0)/250)-1)/2));if((Number(sv._xpCurveVersion)||0)<2){sv.xp=Math.max(0,Math.round((Number(sv.xp)||0)*2.5));sv._xpCurveVersion=2;save()}const RANKS=[['Bronze',0],['Argent',100],['Or',250],['Platine',450],['Diamant',700],['Rang Zeno',1000]];const rankInfo=()=>{let i=0;for(let n=0;n<RANKS.length;n++)if(sv.rp>=RANKS[n][1])i=n;const cur=RANKS[i],next=RANKS[i+1];return{name:cur[0],points:sv.rp,next:next?next[1]:null,progress:next?Math.min(100,(sv.rp-cur[1])/(next[1]-cur[1])*100):100}};
function btn(t,fn,on,st){const b=document.createElement('button');b.textContent=t;if(on)b.className='on';b.onmouseenter=()=>snd(900,.03,'sine',.015);b.onclick=()=>{snd(600,.06,'square',.03);if(MU&&!mus)music(1);fn()};if(st)b.style.cssText=st;return b}
function row(arr){const d=document.createElement('div');d.className='row';arr.forEach(b=>d.appendChild(b));return d}
function mk(tag,html){const e=document.createElement(tag);if(html!=null)e.innerHTML=html;return e}
const PF={};
function fighterKind(name){
 const n=String(name||'');
 if(['Android 13','Android 16','Android 17','Android 18','Android 21','Cell','Tamagami'].includes(n))return {id:'android',label:['Android 18','Android 21'].includes(n)?'Androïde · Combattante':'Androïde',feminine:['Android 18','Android 21'].includes(n)};
 if(['Videl','Pan','Kefla','Caulifla','Kale'].includes(n))return {id:'female',label:'Combattante',feminine:true};
 if(['Freezer','Cooler','King Cold','Zarbon','Dodoria','Ginyu','Piccolo','Slug','Moro','Granolah','Hit','Pikkon','Glorio'].includes(n))return {id:'alien',label:'Extraterrestre'};
 if(['Beerus','Whis','Champa','Vados','Gowasu','Zamasu fusionné'].includes(n))return {id:'divine',label:'Divinité'};
 if(['Majin Buu','Dabura','Janemba','Gomah','Hearts'].includes(n))return {id:'demon',label:'Démon / Majin'};
 if(['Goku','Vegeta','Gogeta','Vegetto','Broly','Gohan','Trunks','Gotenks','Bardock','Raditz','Nappa','Cabba','Caulifla','Kale','Shallot','Cumber','Xeno Goku','Baby Vegeta','Uub','Pan','Kefla'].includes(n))return {id:'saiyan',label:'Saiyan'};
 return {id:'human',label:'Terrien'};
}
const PORTRAIT_STYLE={
 Beerus:{skin:'#b77bd5',hair:'#382344',out:'#17142b',kind:'cat',ears:1,eyes:'#f4d35e'},
 Piccolo:{skin:'#79b94d',hair:'#315c3b',out:'#6b9b37',kind:'namek',antenna:1,eyes:'#d8f0a0'},
 'Majin Buu':{skin:'#e89ab5',hair:'#e89ab5',out:'#e8c7cf',kind:'majin',antenna:1,eyes:'#21172a'},
 Dabura:{skin:'#bd6d76',hair:'#25202b',out:'#7c283e',kind:'horn',horn:1,eyes:'#ffdc72'},
 Janemba:{skin:'#b75c72',hair:'#6f3157',out:'#8b3856',kind:'demon',horn:1,eyes:'#ffdf8a'},
 Freezer:{skin:'#e7d8e9',hair:'#f5f0fa',out:'#8e54ad',kind:'frieza',eyes:'#9c4bc8'},
 Cooler:{skin:'#8b9ebd',hair:'#24354c',out:'#293c5b',kind:'frieza',eyes:'#e4efff'},
 'King Cold':{skin:'#c7a6dc',hair:'#eee4f4',out:'#5d4c78',kind:'frieza',horn:1,eyes:'#a85bce'},
 'Android 16':{skin:'#e0bd9e',hair:'#e7a33b',out:'#4b8b61',kind:'robot',eyes:'#8ff'},
 'Android 17':{skin:'#e5c6aa',hair:'#1d2432',out:'#283e58',kind:'human',eyes:'#7deaff'},
 'Android 18':{skin:'#f0d1b1',hair:'#e5c86c',out:'#526b91',kind:'female',eyes:'#75dfff'},
 'Android 21':{skin:'#edc7ad',hair:'#e9b9d2',out:'#d8b7cf',kind:'female',eyes:'#e7a1dc'},
 'Android 13':{skin:'#d7aa88',hair:'#e6d9b8',out:'#4b7c9c',kind:'robot',eyes:'#8ff'},
 Cell:{skin:'#7ebd7a',hair:'#315e4a',out:'#315e4a',kind:'cell',eyes:'#ffdf67'},
 Videl:{skin:'#efc7a8',hair:'#24232d',out:'#263b66',kind:'female',eyes:'#5ad'},
 Pan:{skin:'#efc7a8',hair:'#33252a',out:'#bd3038',kind:'female',eyes:'#5ad'},
 Kefla:{skin:'#eac0a1',hair:'#2a252b',out:'#31734c',kind:'female',eyes:'#7df'},
 Caulifla:{skin:'#eac0a1',hair:'#25232b',out:'#4b7144',kind:'female',eyes:'#7df'},
 Kale:{skin:'#eac0a1',hair:'#25232b',out:'#315d43',kind:'female',eyes:'#7df'},
 'Muten Roshi':{skin:'#e4bd9c',hair:'#eee8df',out:'#e9a34a',kind:'bald',beard:1,eyes:'#222'},
 Krillin:{skin:'#efc5a0',hair:'#efc5a0',out:'#e58b28',kind:'bald',dots:1,eyes:'#222'},
 Tenshinhan:{skin:'#e7c09e',hair:'#222',out:'#314c8d',kind:'third',eyes:'#222'},
 Zarbon:{skin:'#a7c8b5',hair:'#2f7892',out:'#477a9a',kind:'alien',eyes:'#9df'},
 Dodoria:{skin:'#d98b9d',hair:'#d98b9d',out:'#8e4c70',kind:'alien',spikes:1,eyes:'#ff8'},
 Ginyu:{skin:'#7656a6',hair:'#7656a6',out:'#5b4d9b',kind:'alien',horn:1,eyes:'#fff'},
 Moro:{skin:'#779e8b',hair:'#c5cbd0',out:'#3c5368',kind:'goat',horn:1,eyes:'#f5d36a'},
 Hit:{skin:'#6c82a0',hair:'#6c82a0',out:'#53677f',kind:'alien',eyes:'#e8f6ff'},
 Pikkon:{skin:'#79b98d',hair:'#b9d7a4',out:'#d9e1cf',kind:'alien',antenna:1,eyes:'#dff'},
 'Omega Shenron':{skin:'#bd6b78',hair:'#f0e4d5',out:'#8d283d',kind:'dragon',horn:1,eyes:'#ffd66e'},
 Glorio:{skin:'#b3a0bd',hair:'#34303e',out:'#68435f',kind:'demon',horn:1,eyes:'#fca'},
 Gomah:{skin:'#c27b9b',hair:'#51243f',out:'#7c3457',kind:'demon',horn:1,eyes:'#ffb'},
 Tamagami:{skin:'#d1b38a',hair:'#d8c9a7',out:'#94764b',kind:'armor',horn:1,eyes:'#fff'}
};
function portrait(i){
 if(PF[i])return PF[i];
 const cv=document.createElement('canvas');cv.width=cv.height=112;const g=cv.getContext('2d');if(!g)return cv;
 const c=CH[i]||CH[0],n=c.n,st=PORTRAIT_STYLE[n]||{},kind=st.kind||fighterKind(n).id;
 const skin=st.skin||c.fm?.[0]?.sk||'#efc5a0',hair=st.hair||c.fm?.[0]?.hair||c.hair||'#25232c',out=st.out||c.lk?.top||c.gi||'#345',eyes=st.eyes||'#171a27',aura=c.aura||'#4cf';
 g.save();g.shadowColor=aura;g.shadowBlur=12;g.fillStyle=out;g.beginPath();g.moveTo(18,108);g.lineTo(24,82);g.quadraticCurveTo(56,66,88,82);g.lineTo(96,108);g.closePath();g.fill();g.shadowBlur=0;
 if(kind==='robot'||kind==='armor'){g.fillStyle='#aebdca';g.fillRect(27,75,58,22);g.fillStyle='#536b80';g.fillRect(34,80,44,6);g.fillStyle='#e9c85b';g.fillRect(39,81,8,3);g.fillRect(65,81,8,3)}
 if(kind==='frieza'){g.fillStyle=skin;g.beginPath();g.ellipse(56,49,29,36,0,0,6.283);g.fill();g.fillStyle=st.out;g.beginPath();g.ellipse(56,25,21,10,0,Math.PI,6.283);g.fill();g.fillStyle='#f3f5fa';g.beginPath();g.ellipse(56,49,18,24,0,0,6.283);g.fill()}
 else{g.fillStyle=skin;g.beginPath();g.ellipse(56,49,kind==='alien'?26:24,30,0,0,6.283);g.fill()}
 if(st.ears||kind==='cat'){g.fillStyle=skin;g.beginPath();g.moveTo(35,29);g.lineTo(25,3);g.lineTo(48,21);g.fill();g.beginPath();g.moveTo(75,29);g.lineTo(87,3);g.lineTo(65,21);g.fill()}
 if(st.horn||kind==='demon'||kind==='dragon'){g.fillStyle=hair;g.beginPath();g.moveTo(38,27);g.lineTo(27,2);g.lineTo(49,22);g.fill();g.beginPath();g.moveTo(72,27);g.lineTo(84,2);g.lineTo(63,22);g.fill()}
 if(st.antenna||kind==='namek'){g.strokeStyle=skin;g.lineWidth=5;g.beginPath();g.moveTo(48,24);g.quadraticCurveTo(40,5,34,9);g.moveTo(64,24);g.quadraticCurveTo(72,5,78,9);g.stroke()}
 if(kind==='third'){g.fillStyle=skin;g.beginPath();g.arc(56,20,8,0,6.283);g.fill()}
 if(st.beard){g.fillStyle='#eee8df';g.beginPath();g.moveTo(35,60);g.lineTo(77,60);g.lineTo(56,92);g.closePath();g.fill()}
 if(st.spikes){g.fillStyle=skin;for(let x=28;x<88;x+=12){g.beginPath();g.moveTo(x,25);g.lineTo(x-4,12);g.lineTo(x+6,23);g.fill()}}
 g.fillStyle=hair;
 if(kind==='bald'||kind==='frieza'){}else if(['Broly','Goku','Gogeta','Vegetto','Gohan','Gotenks','Bardock','Raditz','Nappa','Shallot','Cumber','Xeno Goku'].includes(n)){g.beginPath();g.moveTo(31,40);g.lineTo(27,15);g.lineTo(42,26);g.lineTo(48,4);g.lineTo(58,24);g.lineTo(72,5);g.lineTo(73,27);g.lineTo(88,16);g.lineTo(79,43);g.closePath();g.fill()}
 else if(kind==='female'){g.beginPath();g.moveTo(32,43);g.lineTo(28,12);g.lineTo(49,24);g.lineTo(65,9);g.lineTo(84,17);g.lineTo(79,70);g.lineTo(70,61);g.lineTo(69,38);g.closePath();g.fill();g.fillRect(29,38,8,37)}
 else if(kind!=='frieza'){g.beginPath();g.ellipse(56,27,25,14,0,Math.PI,6.283);g.fill()}
 g.fillStyle=eyes;g.fillRect(39,47,11,4);g.fillRect(63,47,11,4);
 if(st.dots){g.fillStyle='#8b5b3c';for(let x=42;x<=70;x+=9)g.beginPath(),g.arc(x,36,2,0,6.283),g.fill()}
 g.strokeStyle='#7b4141';g.lineWidth=2;g.beginPath();g.moveTo(48,66);g.quadraticCurveTo(56,70,64,66);g.stroke();
 if(kind==='cell'){g.fillStyle='#263c32';g.beginPath();g.moveTo(31,32);g.lineTo(39,13);g.lineTo(48,25);g.lineTo(56,5);g.lineTo(67,24);g.lineTo(78,13);g.lineTo(81,34);g.closePath();g.fill()}
 if(kind==='majin'){g.fillStyle=skin;g.beginPath();g.moveTo(56,19);g.quadraticCurveTo(68,-1,74,12);g.lineTo(68,34);g.fill()}
 if(kind==='goat'){g.strokeStyle='#d8d5c5';g.lineWidth=6;g.beginPath();g.moveTo(39,25);g.lineTo(30,5);g.moveTo(73,25);g.lineTo(82,5);g.stroke()}
 if(kind==='armor'){g.strokeStyle='#e8cf85';g.lineWidth=4;g.strokeRect(25,74,62,25)}
 g.strokeStyle=aura;g.lineWidth=2;g.beginPath();g.ellipse(56,49,29,35,0,0,6.283);g.stroke();g.restore();PF[i]=cv;return cv
}
let MG=null;
function menuBg(){const key=cfg.p1+'|'+cfg.p2+'|'+cfg.mode+'|'+cfg.cmp;if(!MG||MG.key!==key){const pb=(cfg.mode==='versus'||cfg.cmp)?cfg.p2:(cfg.p1+3)%CH.length;MG={tick:MG?MG.tick:0,pr:[],time:99,over:0,key};G=MG;try{MG.a=new F(cfg.p1,560,1,0);MG.b=new F(pb,800,-1,0)}finally{G=null}}
G=MG;try{MG.tick++;const a=MG.a,b=MG.b;a.fm=Math.min(cfg.sf|0,a.c.fm.length-1);a.face=1;b.face=-1;bg();body(a);body(b);const g=X.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(0,0,10,.75)');g.addColorStop(.6,'rgba(0,0,10,.15)');g.addColorStop(1,'rgba(0,0,10,.4)');X.fillStyle=g;X.fillRect(0,0,W,540)}finally{G=null}}
function rankingMenu(){const r=rankInfo();M.style.display='flex';M.style.background='';M.innerHTML='<h1>CLASSEMENT</h1><div style="width:min(92%,520px);text-align:left;line-height:1.9"><b>Rang local : '+r.name+'</b><br>Niveau : '+lvl()+' · XP : '+sv.xp+'<br>Points de classement : '+r.points+'<br>Victoires : '+sv.w+' · Défaites : '+sv.l+'<br><div style="height:12px;background:#18243d;border:1px solid #00c8ff;margin:8px 0"><div style="height:100%;width:'+r.progress+'%;background:linear-gradient(90deg,#00c8ff,#b6f)"></div></div>'+(r.next?'Prochain rang dans '+(r.next-r.points)+' points':'Rang maximal atteint')+'<p style="color:#9eabc8">Ce classement est enregistré dans ce navigateur. Il ne s’agit pas encore d’un classement mondial en ligne.</p></div>';M.appendChild(btn('← Retour',menu))}
function openGuide(){window.open('guide.html','_blank','noopener')}
function menu(){dlgNext=null;music(MU,'menu');M.style.display='flex';M.style.background='';const r=rankInfo();M.innerHTML='<h1 style="align-self:flex-start;margin-left:6%">FUSION ARENA</h1><small style="align-self:flex-start;margin-left:6%">Joueur : '+(sv.pseudo||'Joueur')+' · Niveau '+lvl()+'</small>';const col=mk('div');col.className='main-menu-actions';col.style.cssText='display:flex;flex-direction:column;align-self:flex-start;margin-left:6%;gap:3px;min-width:270px';
[['★ MODE HISTOIRE',()=>storyMenu()],['AVENTURE — MISSIONS',adventureMapMenu],['VERSUS LOCAL',()=>selectScreen('versus')],['ENTRAÎNEMENT',()=>selectScreen('train')],['PROFIL RPG',profileMenu],['COMPTE EN LIGNE',accountOnlineMenu],['GUIDE DE COMBAT',openGuide],['PARAMÈTRES',()=>settingsMenu()]].forEach((x,i)=>col.appendChild(btn(x[0],x[1],0,'text-align:left;font-size:17px;padding:9px 18px;animation-delay:'+i*.04+'s')));M.appendChild(col)}

function buildSelectionStats(index){
 const root=document.createElement('section');root.className='selection-section fighter-stats-card';root.style.cssText='display:block!important;visibility:visible!important;opacity:1!important;min-height:240px;width:100%;box-sizing:border-box;padding:14px;background:linear-gradient(145deg,#101e38,#21183c);border:1px solid #58cfff;border-radius:12px;color:#f4f8ff';
 const keys=[['fo','Force'],['vi','Vitesse'],['in','Intelligence'],['du','Durabilité'],['en','Énergie'],['ed','Endurance'],['ki','Ki'],['te','Technique']];
 const draw=()=>{
  root.replaceChildren();const fighter=CH[index]||CH[0],forms=fighter.fm?.length?fighter.fm:[{n:'Base'}],fi=Math.max(0,Math.min(Number(cfg.sf)||0,forms.length-1));
  let stats={...(fighter.st||{})};try{if(typeof stOf==='function')stats=stOf(fighter,fi,true)||stats}catch(e){console.warn('Stats:',e)}
  const title=document.createElement('h3');title.textContent='STATISTIQUES — '+fighter.n+' · '+(forms[fi].n||'Base');title.style.cssText='margin:0 0 10px;text-align:center;color:#8fe8ff;font-size:16px';root.appendChild(title);
  const formRow=document.createElement('div');formRow.style.cssText='display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-bottom:12px';
  forms.forEach((f,i)=>{const b=document.createElement('button');b.type='button';b.textContent=f.n||('Forme '+(i+1));b.className=i===fi?'on':'';b.style.cssText='font-size:11px;padding:5px 8px;min-height:30px';b.onclick=()=>{cfg.sf=i;draw()};formRow.appendChild(b)});root.appendChild(formRow);
  keys.forEach(([key,label])=>{const val=Math.round(Number(stats[key]??fighter.st?.[key])||0),line=document.createElement('div');line.style.cssText='display:grid;grid-template-columns:94px minmax(30px,1fr) 34px;gap:7px;align-items:center;margin:7px 0;font-size:12px';const name=document.createElement('span');name.textContent=label;const track=document.createElement('div');track.style.cssText='height:10px;background:#27344d;border-radius:8px;overflow:hidden';const fill=document.createElement('div');fill.style.cssText='height:100%;width:'+Math.max(0,Math.min(100,val/1.5))+'%;background:linear-gradient(90deg,#12c9e8,#a58bff);border-radius:8px';track.appendChild(fill);const number=document.createElement('b');number.textContent=String(val);number.style.textAlign='right';line.append(name,track,number);root.appendChild(line)});
 };
 draw();return root
}
function selectScreen(mode){
 if(mode&&mode!==cfg.mode){cfg.mode=mode;cfg.sel2=false}
 dlgNext=null;M.style.display='flex';M.style.background='';
 const m=cfg.mode,T={versus:'VERSUS LOCAL',train:'ENTRAÎNEMENT',adventure:'AVENTURE'};
 M.innerHTML='<h1>'+(T[m]||'PERSONNAGES')+'</h1><small class="select-subtitle">Choisis ton combattant · '+new Set(CH.map(c=>c.n)).size+' guerriers disponibles</small>';
 const wrap=mk('div');wrap.className='select-layout';const left=mk('div');left.className='select-roster';const right=mk('div');right.className='select-details';
 const chosen=(m==='versus'||cfg.cmp)&&cfg.sel2?cfg.p2:cfg.p1;
 CH.forEach((c,i)=>{const b=document.createElement('button');b.className='fighter-tile'+(chosen===i?' selected':'');b.appendChild(portrait(i));b.appendChild(mk('span',c.n));const kindTag=mk('small',fighterKind(c.n).label);kindTag.className='fighter-kind';b.appendChild(kindTag);if(chosen===i)b.appendChild(mk('small','SÉLECTIONNÉ'));b.onclick=()=>{snd(600,.06,'square',.03);if((m==='versus'||m==='online-ai'||cfg.cmp)&&cfg.sel2)cfg.p2=i;else cfg.p1=i;cfg.sf=0;selectScreen()};left.appendChild(b)});
 if(m==='versus'||cfg.cmp)right.appendChild(row([btn('Joueur 1',()=>{cfg.sel2=false;selectScreen()},!cfg.sel2),btn('Joueur 2',()=>{cfg.sel2=true;selectScreen()},!!cfg.sel2)]));
 if(m==='online-ai')right.appendChild(mk('small','Ton adversaire IA choisira automatiquement un combattant.'));if(m==='adventure'){const mission=adventureMissionById(adventureState().activeMission);if(mission)right.appendChild(mk('small','MISSION : '+mission.title+' · ADVERSAIRE : '+mission.enemy));}
 const preview=mk('div');preview.className='fighter-preview';const large=portrait(chosen);large.className='fighter-portrait-large';preview.appendChild(large);const identity=mk('div');identity.innerHTML='<h2>'+CH[chosen].n+'</h2><p>'+fighterKind(CH[chosen].n).label+' · '+((CH[chosen].tf)||'Combattant')+'</p>';preview.appendChild(identity);
 right.appendChild(buildSelectionStats(chosen));right.appendChild(preview);
 const arena=mk('div');arena.className='selection-section';arena.appendChild(mk('b','ARÈNE'));arena.appendChild(row(AR.map((a,i)=>btn(a[0],()=>{cfg.ar=i;selectScreen()},cfg.ar===i,'background:linear-gradient(135deg,'+a[1][0]+','+a[1][1]+');color:#fff;text-shadow:0 0 4px #000;min-width:92px;font-size:12px'))));right.appendChild(arena);
 if(m!=='versus'&&m!=='train'){const diff=mk('div');diff.className='selection-section';diff.appendChild(mk('b','DIFFICULTÉ'));diff.appendChild(row(['Facile','Normal','Difficile'].map((n,i)=>btn(n,()=>{cfg.diff=i;selectScreen()},cfg.diff===i))));right.appendChild(diff)}
 if(m==='online')right.appendChild(btn('TROUVER UN ADVERSAIRE',findOnlineOpponent));else right.appendChild(btn(m==='online-ai'?'LANCER LE COMBAT CLASSÉ':m==='adventure'?'LANCER LA MISSION':'⚡ COMBATTRE',()=>{stage=0;if(m==='online-ai'){const pool=CH.map((_,i)=>i).filter(i=>i!==cfg.p1);cfg.p2=pool[Math.floor(Math.random()*pool.length)]}start()},0,'font-size:19px;padding:13px 28px'));
 wrap.append(left,right);M.appendChild(wrap);M.appendChild(btn('← Retour',m==='online'?onlinePlayMenu:m==='adventure'?()=>{const mission=adventureMissionById(adventureState().activeMission),zone=ADVENTURE_ZONES.find(z=>z.mission.id===mission?.id);zone?adventureNpcMenu(zone.id):adventureMapMenu()}:menu))
}

async function syncRestoredOnlineProfile(user){if(!user||!sbClient)return;try{const {data:profile,error}=await sbClient.from('profiles').select('username').eq('id',user.id).maybeSingle();if(error)throw error;const metadataName=user.user_metadata?.username||user.user_metadata?.pseudo;const localName=sv.pseudo&&sv.pseudo!=='Joueur'&&!String(sv.pseudo).startsWith('Joueur-')?String(sv.pseudo).trim().slice(0,16):null;const current=profile?.username||'';const username=(!current||current.startsWith('Joueur-'))?(metadataName||localName||current||('Joueur-'+user.id.slice(0,8))):current;const patch={xp:Math.max(0,Number(sv.xp)||0),player_level:Math.min(100,1+Math.floor((Math.sqrt(1+8*Math.max(0,Number(sv.xp)||0)/250)-1)/2))};if(username&&username.length>=2)patch.username=username;const {error:updateError}=await sbClient.from('profiles').update(patch).eq('id',user.id);if(updateError)throw updateError;if(localName)sv.pseudo=localName}catch(e){console.warn('Synchronisation du profil à la reconnexion impossible',e.message)}}
if(sbClient){sbClient.auth.getSession().then(async({data})=>{onlineUser=data?.session?.user||null;if(onlineUser)await syncRestoredOnlineProfile(onlineUser)}).catch(()=>{});sbClient.auth.onAuthStateChange((event,session)=>{onlineUser=session?.session?.user||session?.user||null;if(event==='PASSWORD_RECOVERY')passwordRecoveryMenu();else if(onlineUser&&event==='SIGNED_IN')setTimeout(()=>syncRestoredOnlineProfile(onlineUser),0)})}
menu();requestAnimationFrame(loop);
