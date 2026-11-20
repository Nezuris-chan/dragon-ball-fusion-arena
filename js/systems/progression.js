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
