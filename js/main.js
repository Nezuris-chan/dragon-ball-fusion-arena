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
function portrait(i){
 if(PF[i])return PF[i];
 const cv=document.createElement('canvas');cv.width=cv.height=96;const g=cv.getContext('2d');if(!g)return cv;
 const c=CH[i]||CH[0],lk=c.lk||{},kindInfo=fighterKind(c.n),kind=kindInfo.id,hair=c.fm?.[0]?.hair||c.hair||'#333',skin=c.fm?.[0]?.sk||(kind==='alien'?'#79b99a':kind==='android'?'#d8c5ad':kind==='divine'?'#b89bdb':kind==='demon'?'#b978a0':'#efc5a0'),aura=c.aura||'#4cf';
 g.save();g.shadowColor=aura;g.shadowBlur=13;g.fillStyle=lk.top||c.gi||'#345';g.beginPath();g.ellipse(48,91,31,22,0,0,Math.PI*2);g.fill();g.shadowBlur=0;
 if(kind==='android'){g.fillStyle='#9aa9b8';g.fillRect(30,70,36,12);g.fillStyle='#e0e8ed';g.fillRect(35,73,26,5);g.strokeStyle='#60768b';g.lineWidth=2;g.strokeRect(30,70,36,12)}
 g.fillStyle=skin;g.beginPath();g.ellipse(48,47,kind==='alien'?25:24,29,0,0,Math.PI*2);g.fill();
 if(kind==='alien'){g.fillStyle=skin;g.beginPath();g.moveTo(25,43);g.lineTo(12,32);g.lineTo(27,35);g.fill();g.beginPath();g.moveTo(71,43);g.lineTo(84,32);g.lineTo(69,35);g.fill()}
 if(kind==='demon'){g.fillStyle='#d8b7cc';g.beginPath();g.moveTo(29,30);g.lineTo(15,13);g.lineTo(35,23);g.fill();g.beginPath();g.moveTo(67,30);g.lineTo(81,13);g.lineTo(61,23);g.fill()}
 if(kind==='divine'){g.fillStyle='#e8c66b';g.beginPath();g.arc(48,15,5,0,6.28);g.fill()}
 if(kind==='android'){g.fillStyle='#27394b';g.fillRect(25,43,46,7);g.fillStyle='#ffdc78';g.fillRect(31,44,10,3);g.fillRect(55,44,10,3)}
 else{g.fillStyle='#171a27';g.fillRect(34,45,8,3);g.fillRect(54,45,8,3);if(kindInfo.feminine){g.strokeStyle='#211728';g.lineWidth=1.5;g.beginPath();g.moveTo(32,43);g.lineTo(42,41);g.moveTo(54,41);g.lineTo(64,43);g.stroke()}}
 g.fillStyle=hair;
 if(['Freezer','Cooler','King Cold'].includes(c.n)){g.beginPath();g.ellipse(48,29,25,14,0,Math.PI,Math.PI*2);g.fill();g.fillStyle='#d9f5ff';g.fillRect(40,8,16,7)}
 else if(kind==='android'&&['Cell','Android 13','Android 16','Android 17','Android 18','Android 21'].includes(c.n)){g.beginPath();g.ellipse(48,26,25,18,Math.PI,Math.PI,Math.PI*2);g.fill()}
 else if(kindInfo.feminine){g.beginPath();g.moveTo(24,42);g.lineTo(18,12);g.lineTo(34,25);g.lineTo(48,8);g.lineTo(63,24);g.lineTo(78,12);g.lineTo(72,58);g.lineTo(65,42);g.closePath();g.fill()}
 else{g.beginPath();g.moveTo(24,39);g.lineTo(18,19);g.lineTo(32,25);g.lineTo(38,7);g.lineTo(48,23);g.lineTo(60,5);g.lineTo(63,25);g.lineTo(79,17);g.lineTo(72,42);g.closePath();g.fill()}
 if(c.n==='Piccolo'){g.strokeStyle='#d9ef9a';g.lineWidth=3;g.beginPath();g.moveTo(39,18);g.lineTo(34,5);g.moveTo(57,18);g.lineTo(62,5);g.stroke()}
 if(kindInfo.feminine){g.fillStyle=hair;g.beginPath();g.moveTo(24,32);g.quadraticCurveTo(10,55,23,78);g.lineTo(31,65);g.fill();g.beginPath();g.moveTo(72,32);g.quadraticCurveTo(86,55,73,78);g.lineTo(65,65);g.fill()}
 g.strokeStyle='#8d4c45';g.lineWidth=2;g.beginPath();g.moveTo(42,63);g.quadraticCurveTo(48,67,54,63);g.stroke();g.strokeStyle=aura;g.lineWidth=2;g.beginPath();g.ellipse(48,47,24,29,0,0,Math.PI*2);g.stroke();g.restore();PF[i]=cv;return cv
}
let MG=null;
function menuBg(){const key=cfg.p1+'|'+cfg.p2+'|'+cfg.mode+'|'+cfg.cmp;if(!MG||MG.key!==key){const pb=(cfg.mode==='versus'||cfg.cmp)?cfg.p2:(cfg.p1+3)%CH.length;MG={tick:MG?MG.tick:0,pr:[],time:99,over:0,key};G=MG;try{MG.a=new F(cfg.p1,560,1,0);MG.b=new F(pb,800,-1,0)}finally{G=null}}
G=MG;try{MG.tick++;const a=MG.a,b=MG.b;a.fm=Math.min(cfg.sf|0,a.c.fm.length-1);a.face=1;b.face=-1;bg();body(a);body(b);const g=X.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(0,0,10,.75)');g.addColorStop(.6,'rgba(0,0,10,.15)');g.addColorStop(1,'rgba(0,0,10,.4)');X.fillStyle=g;X.fillRect(0,0,W,540)}finally{G=null}}
function rankingMenu(){const r=rankInfo();M.style.display='flex';M.style.background='';M.innerHTML='<h1>CLASSEMENT</h1><div style="width:min(92%,520px);text-align:left;line-height:1.9"><b>Rang local : '+r.name+'</b><br>Niveau : '+lvl()+' · XP : '+sv.xp+'<br>Points de classement : '+r.points+'<br>Victoires : '+sv.w+' · Défaites : '+sv.l+'<br><div style="height:12px;background:#18243d;border:1px solid #00c8ff;margin:8px 0"><div style="height:100%;width:'+r.progress+'%;background:linear-gradient(90deg,#00c8ff,#b6f)"></div></div>'+(r.next?'Prochain rang dans '+(r.next-r.points)+' points':'Rang maximal atteint')+'<p style="color:#9eabc8">Ce classement est enregistré dans ce navigateur. Il ne s’agit pas encore d’un classement mondial en ligne.</p></div>';M.appendChild(btn('← Retour',menu))}
function openGuide(){window.open('guide.html','_blank','noopener')}
function menu(){dlgNext=null;M.style.display='flex';M.style.background='';const r=rankInfo();M.innerHTML='<h1 style="align-self:flex-start;margin-left:6%">FUSION ARENA</h1><small style="align-self:flex-start;margin-left:6%">Joueur : '+(sv.pseudo||'Joueur')+' · Niveau '+lvl()+'</small>';const col=mk('div');col.style.cssText='display:flex;flex-direction:column;align-self:flex-start;margin-left:6%;gap:3px;min-width:270px';
[['★ MODE HISTOIRE',()=>storyMenu()],['AVENTURE — MISSIONS',adventureMenu],['VERSUS LOCAL',()=>selectScreen('versus')],['ENTRAÎNEMENT',()=>selectScreen('train')],['PROFIL RPG',profileMenu],['COMPTE EN LIGNE',accountOnlineMenu],['GUIDE DE COMBAT',openGuide],['PARAMÈTRES',()=>settingsMenu()]].forEach((x,i)=>col.appendChild(btn(x[0],x[1],0,'text-align:left;font-size:17px;padding:9px 18px;animation-delay:'+i*.04+'s')));M.appendChild(col)}

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
 const m=cfg.mode,T={versus:'VERSUS LOCAL',train:'ENTRAÎNEMENT'};
 M.innerHTML='<h1>'+(T[m]||'PERSONNAGES')+'</h1><small class="select-subtitle">Choisis ton combattant · '+new Set(CH.map(c=>c.n)).size+' guerriers disponibles</small>';
 const wrap=mk('div');wrap.className='select-layout';const left=mk('div');left.className='select-roster';const right=mk('div');right.className='select-details';
 const chosen=(m==='versus'||cfg.cmp)&&cfg.sel2?cfg.p2:cfg.p1;
 CH.forEach((c,i)=>{const b=document.createElement('button');b.className='fighter-tile'+(chosen===i?' selected':'');b.appendChild(portrait(i));b.appendChild(mk('span',c.n));const kindTag=mk('small',fighterKind(c.n).label);kindTag.className='fighter-kind';b.appendChild(kindTag);if(chosen===i)b.appendChild(mk('small','SÉLECTIONNÉ'));b.onclick=()=>{snd(600,.06,'square',.03);if((m==='versus'||m==='online-ai'||cfg.cmp)&&cfg.sel2)cfg.p2=i;else cfg.p1=i;cfg.sf=0;selectScreen()};left.appendChild(b)});
 if(m==='versus'||cfg.cmp)right.appendChild(row([btn('Joueur 1',()=>{cfg.sel2=false;selectScreen()},!cfg.sel2),btn('Joueur 2',()=>{cfg.sel2=true;selectScreen()},!!cfg.sel2)]));
 if(m==='online-ai')right.appendChild(mk('small','Ton adversaire IA choisira automatiquement un combattant.'));
 const preview=mk('div');preview.className='fighter-preview';const large=portrait(chosen);large.className='fighter-portrait-large';preview.appendChild(large);const identity=mk('div');identity.innerHTML='<h2>'+CH[chosen].n+'</h2><p>'+fighterKind(CH[chosen].n).label+' · '+((CH[chosen].tf)||'Combattant')+'</p>';preview.appendChild(identity);right.appendChild(preview);
 right.appendChild(buildSelectionStats(chosen));
 const arena=mk('div');arena.className='selection-section';arena.appendChild(mk('b','ARÈNE'));arena.appendChild(row(AR.map((a,i)=>btn(a[0],()=>{cfg.ar=i;selectScreen()},cfg.ar===i,'background:linear-gradient(135deg,'+a[1][0]+','+a[1][1]+');color:#fff;text-shadow:0 0 4px #000;min-width:92px;font-size:12px'))));right.appendChild(arena);
 if(m!=='versus'&&m!=='train'){const diff=mk('div');diff.className='selection-section';diff.appendChild(mk('b','DIFFICULTÉ'));diff.appendChild(row(['Facile','Normal','Difficile'].map((n,i)=>btn(n,()=>{cfg.diff=i;selectScreen()},cfg.diff===i))));right.appendChild(diff)}
 if(m==='online')right.appendChild(btn('TROUVER UN ADVERSAIRE',findOnlineOpponent));else right.appendChild(btn(m==='online-ai'?'LANCER LE COMBAT CLASSÉ':'⚡ COMBATTRE',()=>{stage=0;if(m==='online-ai'){const pool=CH.map((_,i)=>i).filter(i=>i!==cfg.p1);cfg.p2=pool[Math.floor(Math.random()*pool.length)]}start()},0,'font-size:19px;padding:13px 28px'));
 wrap.append(left,right);M.appendChild(wrap);M.appendChild(btn('← Retour',m==='online'?onlinePlayMenu:menu))
}

async function syncRestoredOnlineProfile(user){if(!user||!sbClient)return;try{const {data:profile,error}=await sbClient.from('profiles').select('username').eq('id',user.id).maybeSingle();if(error)throw error;const metadataName=user.user_metadata?.username||user.user_metadata?.pseudo;const localName=sv.pseudo&&sv.pseudo!=='Joueur'&&!String(sv.pseudo).startsWith('Joueur-')?String(sv.pseudo).trim().slice(0,16):null;const current=profile?.username||'';const username=(!current||current.startsWith('Joueur-'))?(metadataName||localName||current||('Joueur-'+user.id.slice(0,8))):current;const patch={xp:Math.max(0,Number(sv.xp)||0),player_level:Math.min(100,1+Math.floor((Math.sqrt(1+8*Math.max(0,Number(sv.xp)||0)/250)-1)/2))};if(username&&username.length>=2)patch.username=username;const {error:updateError}=await sbClient.from('profiles').update(patch).eq('id',user.id);if(updateError)throw updateError;if(localName)sv.pseudo=localName}catch(e){console.warn('Synchronisation du profil à la reconnexion impossible',e.message)}}
if(sbClient){sbClient.auth.getSession().then(async({data})=>{onlineUser=data?.session?.user||null;if(onlineUser)await syncRestoredOnlineProfile(onlineUser)}).catch(()=>{});sbClient.auth.onAuthStateChange((event,session)=>{onlineUser=session?.session?.user||session?.user||null;if(event==='PASSWORD_RECOVERY')passwordRecoveryMenu();else if(onlineUser&&event==='SIGNED_IN')setTimeout(()=>syncRestoredOnlineProfile(onlineUser),0)})}
menu();requestAnimationFrame(loop);
