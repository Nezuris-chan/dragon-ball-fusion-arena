function exportPlayerSave(){try{const pack={format:'FusionArenaSave',version:2,fa:sv,fakm:localStorage.getItem('fakm')||null,falow:localStorage.getItem('falow')||'0',famu:localStorage.getItem('famu')||'1'};const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='fusion-arena-sauvegarde.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);alert('Sauvegarde exportée. Garde ce fichier en lieu sûr.')}catch(e){alert('Export impossible sur ce navigateur.')}}
function importPlayerSave(file){const r=new FileReader();r.onload=()=>{try{const pack=JSON.parse(r.result);if(!pack||pack.format!=='FusionArenaSave'||!pack.fa)throw new Error('Fichier invalide');const old=localStorage.getItem('fa');if(old)localStorage.setItem('fa_backup',old);sv=Object.assign({xp:0,w:0,l:0},pack.fa);localStorage.setItem('fa',JSON.stringify(sv));if(pack.fakm)localStorage.setItem('fakm',pack.fakm);if(pack.falow!=null)localStorage.setItem('falow',pack.falow);if(pack.famu!=null)localStorage.setItem('famu',pack.famu);alert('Sauvegarde importée. Recharge le jeu pour appliquer toutes les données.');settingsMenu()}catch(e){alert('Sauvegarde invalide ou illisible. Aucune donnée importée.')}};r.readAsText(file)}
async function setPlayerPseudo(){const value=prompt('Choisis ton pseudo public (2 à 16 caractères) :',sv.pseudo||'Joueur');if(value===null)return;const name=value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,16);if(name.length<2){alert('Le pseudo doit contenir au moins 2 caractères.');return}sv.pseudo=name;save();if(onlineUser&&sbClient){const {error}=await sbClient.from('profiles').update({username:name,xp:Math.max(0,Number(sv.xp)||0),player_level:lvl()}).eq('id',onlineUser.id);if(error){alert('Pseudo enregistré localement, mais mise à jour du classement impossible : '+error.message);settingsMenu();return}}settingsMenu()}
function redeemProgressCode(){
 const code=(prompt('Entre ton code de progression :')||'').trim().toUpperCase();
 if(!code)return;
 const validCode='FUSION-AVANTSUPER';
 if(code!==validCode){alert('Code invalide. Vérifie les caractères et réessaie.');return}
 sv.redeemedCodes=Array.isArray(sv.redeemedCodes)?sv.redeemedCodes:[];
 if(sv.redeemedCodes.includes(validCode)){alert('Ce code a déjà été utilisé sur cette sauvegarde.');return}
 const S=SS();
 const sagaIds=['s0','s1','s2','s3','s4','daima'];
 const chapters=[];
 for(const id of sagaIds){const sg=SAGAS.find(x=>x.id===id);if(sg)chapters.push(...sg.ch)}
 const superSaga=SAGAS.find(x=>x.id==='super');
 if(superSaga&&superSaga.ch[0])chapters.push(superSaga.ch[0]);
 let gainedXP=0,unlockedItems=[];
 for(const c of chapters){
  if(!S.done[c.id]){
   const diff=Math.max(0,Math.min(2,Number(c.df)||0));
   const base=Math.max(20,Math.min(500,Number(c.xp)||[80,130,190][diff]));
   gainedXP+=Math.round(base*1.15);
   S.done[c.id]={s:2,clears:1};
   if(!c.scene)sv.storyClears=(Number(sv.storyClears)||0)+1;
  }
  if(c.fl)for(const flag of c.fl)S.fl[flag]=1;
  const relic=RELICS.find(x=>x.chapter===c.id);
  if(relic&&!sv.items.includes(relic.id)){sv.items.push(relic.id);unlockedItems.push(relic.name)}
 }
 sv.xp=Math.max(0,Number(sv.xp)||0)+gainedXP;
 const preSuperSagaIds=['s0','s1','s2','s3','s4','daima'];
 const preSuperNames=new Set(preSuperSagaIds.flatMap(id=>{
  const saga=SAGAS.find(x=>x.id===id);
  return [...(STORY_ROSTERS[id]||[]),...(saga?saga.ch.flatMap(c=>[c.en,...(c.players||[])].filter(Boolean)):[])];
 }));
 let formCount=0;
 for(const name of preSuperNames){
  const forms=FM[name];
  if(!Array.isArray(forms))continue;
  const max=Math.max(0,forms.length-1);
  const old=Number(S.forms[name])||0;
  if(max>old){S.forms[name]=max;formCount+=max-old}
 }
 sv.redeemedCodes.push(validCode);
 save();
 alert('Code accepté ! Progression débloquée jusqu’au chapitre 1 de Dragon Ball Super.\n+'+gainedXP+' XP\nToutes les transformations du catalogue sont débloquées ('+formCount+' nouvelles formes).'+(unlockedItems.length?'\nObjets obtenus : '+unlockedItems.join(', '):''));
 settingsMenu();
}
function settingsMenu(){dlgNext=null;M.style.display='flex';M.style.background='';M.innerHTML='<h1>PARAMÈTRES</h1>';M.appendChild(row([btn('PSEUDO : '+(sv.pseudo||'Joueur'),setPlayerPseudo),btn('Effets réduits : '+(LOW?'OUI':'NON'),()=>{LOW=!LOW;try{localStorage.setItem('falow',LOW?'1':'0')}catch(e){}settingsMenu()}),btn('Musique : '+(MU?'OUI':'NON'),()=>{MU=!MU;try{localStorage.setItem('famu',MU?'1':'0')}catch(e){}music(MU);settingsMenu()}),btn('⌨ COMMANDES',()=>ctlMenu())]));M.appendChild(row([btn('CODE DE PROGRESSION',redeemProgressCode),btn('EXPORTER MA SAUVEGARDE',exportPlayerSave),btn('IMPORTER UNE SAUVEGARDE',()=>{const f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.onchange=()=>{if(f.files&&f.files[0])importPlayerSave(f.files[0])};f.click()})]));M.appendChild(mk('small','Progression conservée automatiquement sur ce navigateur. Exporte régulièrement une copie de sécurité.'));M.appendChild(btn('← Retour',menu))}


function skillPointTotal(){return Math.max(0,(lvl()-1)*5)}
function skillStats(){const keys=['fo','vi','in','du','en','ed','ki','te'],raw=sv.skillStats&&typeof sv.skillStats==='object'?sv.skillStats:{};const out={};let left=skillPointTotal();for(const k of keys){out[k]=Math.max(0,Math.floor(Number(raw[k])||0));left-=out[k]}if(left<0){for(const k of keys){const cut=Math.min(out[k],-left);out[k]-=cut;left+=cut;if(left===0)break}}return out}
function skillStatBonus(k){return skillStats()[k]||0}
const ADVENTURE_QUESTS=[
{id:'first_win',name:'Premier pas',desc:'Remporte 1 combat (hors entraînement).',key:'wins',goal:1,xp:120,rp:15},
{id:'fighter_3',name:'Combattant confirmé',desc:'Remporte 3 combats.',key:'wins',goal:3,xp:260,rp:30},
{id:'story_2',name:'Protecteur des sagas',desc:'Remporte 2 combats en mode Histoire.',key:'storyWins',goal:2,xp:300,rp:35},
{id:'hard_win',name:'Défi de guerrier',desc:'Remporte 1 combat en difficulté difficile.',key:'hardWins',goal:1,xp:220,rp:25}
];
function adventureState(){if(!sv.adventureQuests||typeof sv.adventureQuests!=='object')sv.adventureQuests={wins:0,storyWins:0,hardWins:0,claimed:[]};const q=sv.adventureQuests;for(const k of ['wins','storyWins','hardWins'])q[k]=Math.max(0,Number(q[k])||0);if(!Array.isArray(q.claimed))q.claimed=[];if(!Array.isArray(q.npcClaims))q.npcClaims=[];return q}
function recordAdventureBattle(won,mode,difficulty){const q=adventureState();if(won){q.wins++;if(mode==='story')q.storyWins++;if(Number(difficulty)>=2)q.hardWins++}save()}
const ADVENTURE_ZONES=[
{id:'paozu',name:'Mont Paozu',place:'Terre',unlock:()=>true,desc:'Entraînement et premiers défis',npc:'Goku',role:'Maître du combat',quest:{id:'goku_trial',title:'Épreuve de Goku',desc:'Remporte 2 combats.',key:'wins',goal:2,xp:180,rp:15}},
{id:'capsule',name:'Capsule Corporation',place:'Ville Ouest',unlock:()=>adventureState().wins>=2,desc:'Technologie et missions tactiques',npc:'Bulma',role:'Inventrice',quest:{id:'bulma_trial',title:'Test de Bulma',desc:'Remporte 1 combat en mode Histoire.',key:'storyWins',goal:1,xp:220,rp:20}},
{id:'namek',name:'Planète Namek',place:'Secteur lointain',unlock:()=>adventureState().storyWins>=2,desc:'Défis de résistance et de maîtrise du ki',npc:'Piccolo',role:'Entraîneur',quest:{id:'piccolo_trial',title:'Discipline Namekienne',desc:'Remporte 3 combats.',key:'wins',goal:3,xp:300,rp:25}},
{id:'beerus',name:'Planète de Beerus',place:'Monde des dieux',unlock:()=>lvl()>=10&&adventureState().wins>=5,desc:'Épreuves divines de haut niveau',npc:'Whis',role:'Guide divin',quest:{id:'whis_trial',title:'Leçon divine',desc:'Remporte 1 combat en difficulté difficile.',key:'hardWins',goal:1,xp:450,rp:40}}
];
function adventureNpcMenu(zoneId){
 const zone=ADVENTURE_ZONES.find(z=>z.id===zoneId);if(!zone)return adventureMapMenu();
 const q=adventureState(),m=zone.quest,claims=Array.isArray(q.npcClaims)?q.npcClaims:(q.npcClaims=[]),done=claims.includes(m.id),n=Math.min(m.goal,q[m.key]||0),ready=n>=m.goal&&!done;
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>'+zone.npc.toUpperCase()+'</h1><small>'+zone.role+' · '+zone.name+'</small>';
 const card=mk('div');card.style.cssText='width:min(92%,560px);text-align:left;padding:14px;background:#101a30;border:1px solid #5279a8;border-radius:12px;line-height:1.6';
 card.innerHTML='<b>'+m.title+'</b><p>'+m.desc+'</p><div style="height:10px;background:#26344b;border-radius:8px;overflow:hidden"><div style="height:100%;width:'+(n/m.goal*100)+'%;background:linear-gradient(90deg,#08c,#6ef)"></div></div><small>'+n+' / '+m.goal+' · Récompense : '+m.xp+' XP + '+m.rp+' points de classement</small><p>'+(done?'Mission terminée ✓':ready?'Mission réussie !':'Continue tes combats pour progresser.')+'</p>';
 if(ready)card.appendChild(btn('RÉCUPÉRER LA RÉCOMPENSE',()=>{const state=adventureState();state.npcClaims=Array.isArray(state.npcClaims)?state.npcClaims:[];if(state.npcClaims.includes(m.id))return;state.npcClaims.push(m.id);sv.xp=(Number(sv.xp)||0)+m.xp;sv.rp=(Number(sv.rp)||0)+m.rp;save();adventureNpcMenu(zoneId)}));
 M.appendChild(card);M.appendChild(mk('small',zone.npc+' : « Chaque défi te rapproche de ton prochain objectif. »'));M.appendChild(btn('← Retour à la carte',adventureMapMenu));
}
function adventureMapMenu(){
 const q=adventureState();M.style.display='flex';M.style.background='';M.innerHTML='<h1>CARTE DE L’AVENTURE</h1><small>Explore les lieux, rencontre leurs habitants et relève leurs défis.</small>';
 const map=mk('div');map.style.cssText='width:min(94%,680px);display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:9px;margin:8px 0';
 for(const z of ADVENTURE_ZONES){const open=!!z.unlock(),card=mk('section');card.style.cssText='padding:13px;text-align:left;border:1px solid '+(open?'#4b9b83':'#46516a')+';border-radius:12px;background:'+(open?'linear-gradient(145deg,#132d35,#101a30)':'#111827')+';opacity:'+(open?'1':'.68');
 card.innerHTML='<b>'+(open?'◆ ':'🔒 ')+z.name+'</b><br><small>'+z.place+'</small><p style="margin:7px 0">'+z.desc+'</p><small>'+(open?'PNJ : '+z.npc+' · '+z.role:'Zone verrouillée · '+(z.id==='capsule'?'2 victoires':z.id==='namek'?'2 victoires en histoire':'Niveau 10 et 5 victoires'))+'</small>';
 if(open)card.appendChild(btn('RENCONTRER '+z.npc.toUpperCase(),()=>adventureNpcMenu(z.id)));map.appendChild(card)}
 M.appendChild(map);M.appendChild(mk('small','Progression : '+q.wins+' victoires · '+q.storyWins+' victoires en histoire · '+q.hardWins+' victoires difficiles'));M.appendChild(btn('MISSIONS SECONDAIRES',adventureMenu));M.appendChild(btn('← Retour',menu));
}
function adventureMenu(){const q=adventureState();M.style.display='flex';M.style.background='';M.innerHTML='<h1>MISSIONS SECONDAIRES</h1><small>Des objectifs permanents pour faire progresser ton aventurier.</small>';for(const mission of ADVENTURE_QUESTS){const n=Math.min(mission.goal,q[mission.key]),claimed=q.claimed.includes(mission.id),ready=n>=mission.goal&&!claimed,el=mk('div');el.style.cssText='width:min(92%,560px);text-align:left;padding:12px 15px;margin:5px;background:#101a30;border:1px solid '+(claimed?'#4c8':ready?'#d9b44a':'#357')+';border-radius:10px';el.innerHTML='<b>'+mission.name+'</b> '+(claimed?'✓ RÉCOMPENSE RÉCUPÉRÉE':ready?'★ TERMINÉE':'')+'<br><small>'+mission.desc+'</small><div style="height:9px;background:#26344b;margin:8px 0;border-radius:8px;overflow:hidden"><div style="height:100%;width:'+(n/mission.goal*100)+'%;background:linear-gradient(90deg,#08c,#6ef)"></div></div><small>'+n+' / '+mission.goal+' · Récompense : '+mission.xp+' XP + '+mission.rp+' points de classement</small>';if(ready){el.appendChild(btn('RÉCUPÉRER LA RÉCOMPENSE',()=>{const state=adventureState();if(state.claimed.includes(mission.id))return;state.claimed.push(mission.id);sv.xp=(Number(sv.xp)||0)+mission.xp;sv.rp=(Number(sv.rp)||0)+mission.rp;save();adventureMenu()}))}M.appendChild(el)}M.appendChild(mk('small','Les missions et leurs récompenses sont conservées dans ta sauvegarde.'));M.appendChild(btn('CARTE DE L’AVENTURE',adventureMapMenu));M.appendChild(btn('← Retour',menu))}
function profileMenu(){
 const xp=Math.max(0,Number(sv.xp)||0),level=lvl(),maxLevel=100;
 const currentThreshold=level>=maxLevel?0:250*(level-1)*level/2;
 const nextThreshold=level>=maxLevel?currentThreshold:250*level*(level+1)/2;
 const progress=level>=maxLevel?100:Math.max(0,Math.min(100,(xp-currentThreshold)/(nextThreshold-currentThreshold)*100));
 const rank=rankInfo(),items=RELICS.filter(r=>sv.items.includes(r.id)),equipped=equippedRelic();
 const stats=skillStats(),keys=[['fo','Force'],['vi','Vitesse'],['in','Intelligence'],['du','Durabilité'],['en','Énergie'],['ed','Endurance'],['ki','Ki'],['te','Technique']];
 const used=keys.reduce((n,x)=>n+stats[x[0]],0),available=Math.max(0,skillPointTotal()-used);
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>PROFIL RPG</h1>';
 const panel=mk('div');panel.style.cssText='width:min(92%,560px);text-align:left;line-height:1.7;padding:12px 16px;background:#101a30;border:1px solid #357;border-radius:10px';
 panel.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px"><b>NIVEAU '+level+' / '+maxLevel+'</b><b>'+xp.toLocaleString('fr-FR')+' XP</b></div><div style="height:12px;background:#26344b;margin:8px 0;border-radius:8px;overflow:hidden"><div style="height:100%;width:'+progress+'%;background:linear-gradient(90deg,#08c,#6ef)"></div></div><small>'+(level>=maxLevel?'Niveau maximal atteint':(Math.max(0,nextThreshold-xp)).toLocaleString('fr-FR')+' XP avant le niveau '+(level+1))+'</small><hr style="border-color:#345"><b>Rang : '+rank.name+'</b><br><small>'+rank.points+' points de classement · '+(rank.next==null?'Rang maximal':(rank.next-rank.points)+' points avant le rang suivant')+'</small><hr style="border-color:#345"><b>Statistiques</b><br>Victoires : '+(Number(sv.w)||0)+'<br>Défaites : '+(Number(sv.l)||0)+'<br>Chapitres terminés : '+(Number(sv.storyClears)||0);
 M.appendChild(panel);
 const skills=mk('div');skills.style.cssText='width:min(92%,560px);text-align:left;padding:12px 16px;background:#101a30;border:1px solid #357;border-radius:10px';
 skills.appendChild(mk('b','POINTS DE COMPÉTENCE'));
 skills.appendChild(mk('p','Points disponibles : '+available+' / '+skillPointTotal()+' · 5 points gagnés par niveau'));
 skills.appendChild(mk('small','Les bonus s’appliquent au combattant que tu équipes. Tu peux modifier ta répartition gratuitement à tout moment.'));
 for(const [key,name] of keys){const value=stats[key];skills.appendChild(row([mk('span',name+' : '+value),btn('−',()=>{if(value>0){sv.skillStats=skillStats();sv.skillStats[key]--;save();profileMenu()}},value<=0,'min-width:38px'),btn('+',()=>{if(available>0){sv.skillStats=skillStats();sv.skillStats[key]++;save();profileMenu()}},available<=0,'min-width:38px')]));}
 skills.appendChild(btn('RÉINITIALISER LES POINTS',()=>{sv.skillStats={};save();profileMenu()}));
 M.appendChild(skills);
 const inv=mk('div');inv.style.cssText='width:min(92%,560px);text-align:left;padding:12px 16px;background:#101a30;border:1px solid #357;border-radius:10px';
 inv.appendChild(mk('b','RELIQUES'));
 inv.appendChild(mk('small',items.length?'Équipe une relique pour bénéficier de son effet pendant les combats locaux et le mode histoire.':'Aucune relique obtenue pour le moment. Termine certains chapitres du mode Histoire pour en gagner.'));
 if(equipped)inv.appendChild(mk('p','Équipée : '+equipped.name+' — '+equipped.desc));else inv.appendChild(mk('p','Aucune relique équipée.'));
 for(const relic of items){const active=sv.equippedItem===relic.id;inv.appendChild(row([btn((active?'✓ ':'')+relic.name,()=>{sv.equippedItem=active?'':relic.id;save();profileMenu()},active,'font-size:12px'),mk('small',relic.desc)]))}
 if(items.length&&equipped)inv.appendChild(btn('Retirer la relique',()=>{sv.equippedItem='';save();profileMenu()}));
 M.appendChild(inv);M.appendChild(row([btn('QUÊTES QUOTIDIENNES',dailyMenu),btn('CLASSEMENT',rankingMenu)]));M.appendChild(btn('← Retour',menu));
}