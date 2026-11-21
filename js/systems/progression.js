function exportPlayerSave(){try{const pack={format:'FusionArenaSave',version:2,fa:sv,fakm:localStorage.getItem('fakm')||null,falow:localStorage.getItem('falow')||'0',famu:localStorage.getItem('famu')||'1'};const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='fusion-arena-sauvegarde.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);alert('Sauvegarde exportée. Garde ce fichier en lieu sûr.')}catch(e){alert('Export impossible sur ce navigateur.')}}
function importPlayerSave(file){const r=new FileReader();r.onload=()=>{try{const pack=JSON.parse(r.result);if(!pack||pack.format!=='FusionArenaSave'||!pack.fa)throw new Error('Fichier invalide');const old=localStorage.getItem('fa');if(old)localStorage.setItem('fa_backup',old);sv=Object.assign({xp:0,w:0,l:0},pack.fa);localStorage.setItem('fa',JSON.stringify(sv));if(pack.fakm)localStorage.setItem('fakm',pack.fakm);if(pack.falow!=null)localStorage.setItem('falow',pack.falow);if(pack.famu!=null)localStorage.setItem('famu',pack.famu);alert('Sauvegarde importée. Recharge le jeu pour appliquer toutes les données.');settingsMenu()}catch(e){alert('Sauvegarde invalide ou illisible. Aucune donnée importée.')}};r.readAsText(file)}
async function setPlayerPseudo(){const value=prompt('Choisis ton pseudo public (2 à 16 caractères) :',sv.pseudo||'Joueur');if(value===null)return;const name=value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,16);if(name.length<2){alert('Le pseudo doit contenir au moins 2 caractères.');return}sv.pseudo=name;save();if(onlineUser&&sbClient){const {error}=await sbClient.from('profiles').update({username:name,xp:Math.max(0,Number(sv.xp)||0),player_level:lvl()}).eq('id',onlineUser.id);if(error){alert('Pseudo enregistré localement, mais mise à jour du classement impossible : '+error.message);settingsMenu();return}}settingsMenu()}
async function redeemProgressCode(){
 const code=(prompt('Entre ton code de progression :')||'').trim().toUpperCase();
 if(!code)return;
 if(!sbClient){alert('La validation sécurisée nécessite une connexion au compte en ligne.');return}
 sv.redeemedCodes=Array.isArray(sv.redeemedCodes)?sv.redeemedCodes:[];
 if(sv.redeemedCodes.includes('FUSION-AVANTSUPER')){alert('Ce code a déjà été utilisé sur cette sauvegarde.');return}
 try{
  const {data:userData,error:userError}=await sbClient.auth.getUser();
  if(userError)throw userError;
  if(!userData?.user){alert('Connecte-toi à ton compte pour utiliser ce code.');accountOnlineMenu();return}
  const {data,error}=await sbClient.rpc('redeem_progress_code',{p_code:code});
  if(error)throw error;
  if(data?.status==='already_redeemed'){alert('Ce code a déjà été utilisé sur ce compte.');return}
  if(data?.status!=='accepted'){alert('Code invalide. Vérifie les caractères et réessaie.');return}
 }catch(error){
  console.error('Validation du code de progression impossible :',error);
  alert('Validation sécurisée indisponible. Vérifie que la migration Supabase du code de progression a été appliquée, puis réessaie. Aucune progression n’a été modifiée.');
  return;
 }
 const validCode='FUSION-AVANTSUPER';
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
 alert('Code accepté ! Progression débloquée jusqu’au chapitre 1 de Dragon Ball Super.\n+'+gainedXP+' XP\n'+formCount+' transformations débloquées pour les personnages des sagas couvertes (jusqu’au début de Super).'+(unlockedItems.length?'\nObjets obtenus : '+unlockedItems.join(', '):''));
 settingsMenu();
}
function settingsMenu(){dlgNext=null;M.style.display='flex';M.style.background='';M.innerHTML='<h1>PARAMÈTRES</h1>';M.appendChild(row([btn('PSEUDO : '+(sv.pseudo||'Joueur'),setPlayerPseudo),btn('Effets réduits : '+(LOW?'OUI':'NON'),()=>{LOW=!LOW;try{localStorage.setItem('falow',LOW?'1':'0')}catch(e){}settingsMenu()}),btn('Musique : '+(MU?'OUI':'NON'),()=>{MU=!MU;try{localStorage.setItem('famu',MU?'1':'0')}catch(e){}music(MU,G?'battle':'menu');settingsMenu()}),btn('Volume : '+Math.round(MUSIC_VOL*100)+'%',()=>{setMusicVolume(MUSIC_VOL>=.7?.22:MUSIC_VOL>=.35?.7:.42);settingsMenu()}),btn('⌨ COMMANDES',()=>ctlMenu())]));M.appendChild(row([btn('CODE DE PROGRESSION',redeemProgressCode),btn('EXPORTER MA SAUVEGARDE',exportPlayerSave),btn('IMPORTER UNE SAUVEGARDE',()=>{const f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.onchange=()=>{if(f.files&&f.files[0])importPlayerSave(f.files[0])};f.click()})]));M.appendChild(mk('small','Progression conservée automatiquement sur ce navigateur. Exporte régulièrement une copie de sécurité.'));M.appendChild(btn('← Retour',menu))}


function skillPointTotal(){return Math.max(0,(lvl()-1)*5)}
function skillStats(){const keys=['fo','vi','in','du','en','ed','ki','te'],raw=sv.skillStats&&typeof sv.skillStats==='object'?sv.skillStats:{};const out={};let left=skillPointTotal();for(const k of keys){out[k]=Math.max(0,Math.floor(Number(raw[k])||0));left-=out[k]}if(left<0){for(const k of keys){const cut=Math.min(out[k],-left);out[k]-=cut;left+=cut;if(left===0)break}}return out}
function skillStatBonus(k){return skillStats()[k]||0}
const ADVENTURE_QUESTS=[
 {id:'first_win',name:'Premier pas',desc:'Remporte 1 combat (hors entraînement).',key:'wins',goal:1,xp:120,rp:15},
 {id:'fighter_3',name:'Combattant confirmé',desc:'Remporte 3 combats.',key:'wins',goal:3,xp:260,rp:30},
 {id:'story_2',name:'Protecteur des sagas',desc:'Remporte 2 combats en mode Histoire.',key:'storyWins',goal:2,xp:300,rp:35},
 {id:'hard_win',name:'Défi de guerrier',desc:'Remporte 1 combat en difficulté difficile.',key:'hardWins',goal:1,xp:220,rp:25}
];
function adventureState(){
 if(!sv.adventureQuests||typeof sv.adventureQuests!=='object')sv.adventureQuests={wins:0,storyWins:0,hardWins:0,claimed:[]};
 const q=sv.adventureQuests;
 for(const k of ['wins','storyWins','hardWins'])q[k]=Math.max(0,Number(q[k])||0);
 for(const k of ['claimed','npcClaims','completedMissions','discoveredSpots','acceptedRegionQuests','claimedRegionQuests','dailyEventClaims'])if(!Array.isArray(q[k]))q[k]=[];
 if(typeof q.activeMission!=='string')q.activeMission='';
 return q;
}
const ADVENTURE_ZONES=[
 {id:'paozu',name:'Mont Paozu',place:'Terre · Est',npc:'Goku',role:'Maître du combat',desc:'Ton aventure commence ici. Protège la Terre contre la première grande menace.',mission:{id:'ad_paozu',title:'La menace des Saiyans',enemy:'Raditz',hero:'Goku',diff:0,arena:0,xp:180,rp:15,brief:'Raditz est arrivé sur Terre. Prouve que tu peux défendre ta planète.'}},
 
 {id:'namek',name:'Planète Namek',place:'Secteur lointain',npc:'Piccolo',role:'Protecteur de Namek',desc:'Le tyran Freezer cherche les Dragon Balls. Arrête-le avant qu’il ne soit trop tard.',mission:{id:'ad_namek',title:'Le tyran de l’espace',enemy:'Freezer',hero:'Piccolo',diff:1,arena:0,xp:300,rp:25,brief:'Freezer libère toute sa puissance. Prépare-toi à un duel difficile.'}},
 {id:'islands',name:'Îles du Sud',place:'Terre',npc:'C-17',role:'Combattant artificiel',desc:'Les cyborgs sèment le chaos. Affronte un adversaire conçu pour la guerre.',mission:{id:'ad_islands',title:'Danger mécanique',enemy:'Android 16',hero:'Android 17',diff:1,arena:2,xp:320,rp:25,brief:'C-16 est un adversaire massif. Sa résistance sera son principal avantage.'}},
 {id:'capsule',name:'Capsule Corporation',place:'Ville de l’Ouest',npc:'Bulma',role:'Inventrice',desc:'Une menace artificielle approche. Aide Bulma à tester ses données de combat.',mission:{id:'ad_capsule',title:'Alerte androïde',enemy:'Android 13',hero:'Trunks',diff:0,arena:5,xp:220,rp:20,brief:'Un androïde dangereux a été repéré près de la ville. Neutralise-le.'}},
 {id:'cellgames',name:'Cell Games',place:'Terre · Arène',npc:'Gohan',role:'Guerrier protecteur',desc:'Cell organise son tournoi. Mets fin à ses ambitions.',mission:{id:'ad_cellgames',title:'Le dernier Cell Game',enemy:'Cell',hero:'Gohan',diff:2,arena:2,xp:420,rp:35,brief:'Cell ne retiendra plus ses coups. Donne tout pour protéger la Terre.'}},
 {id:'buu',name:'Monde des Kaioshins',place:'Monde sacré',npc:'Vegeta',role:'Prince des Saiyans',desc:'Une ancienne créature menace l’univers. Affronte Majin Buu.',mission:{id:'ad_buu',title:'Le réveil de Majin Buu',enemy:'Majin Buu',hero:'Vegeta',diff:2,arena:4,xp:460,rp:40,brief:'Majin Buu est imprévisible et résistant. Garde ton sang-froid.'}},
 {id:'otherworld',name:'Autre Monde',place:'Royaume des morts',npc:'Pikkon',role:'Champion de l’au-delà',desc:'Une anomalie dimensionnelle a libéré Janemba. Rétablis l’équilibre.',mission:{id:'ad_otherworld',title:'Le démon dimensionnel',enemy:'Janemba',hero:'Gogeta',diff:2,arena:7,xp:480,rp:40,brief:'Janemba déforme l’espace et attaque sans prévenir.'}},
 {id:'beerus',name:'Planète de Beerus',place:'Monde des dieux',npc:'Whis',role:'Guide divin',desc:'Une épreuve divine t’attend. Montre que tu maîtrises les bases du combat.',mission:{id:'ad_beerus',title:'Épreuve de destruction',enemy:'Beerus',hero:'Goku',diff:2,arena:4,xp:520,rp:45,brief:'Beerus ne plaisante pas. Un seul faux pas peut coûter le combat.'}},
 {id:'future',name:'Futur dévasté',place:'Ligne temporelle alternative',npc:'Trunks',role:'Dernier défenseur',desc:'Le futur est sous la menace de Goku Black. Change son destin.',mission:{id:'ad_future',title:'Le cauchemar du futur',enemy:'Goku Black',hero:'Trunks',diff:2,arena:3,xp:560,rp:45,brief:'Goku Black maîtrise une puissance divine. Protège cette ligne temporelle.'}},
 {id:'universe6',name:'Tournoi des Univers',place:'Univers 6',npc:'Cabba',role:'Combattant de Sadala',desc:'Un duel décisif t’attend face à l’assassin légendaire Hit.',mission:{id:'ad_universe6',title:'Le saut temporel',enemy:'Hit',hero:'Goku',diff:2,arena:1,xp:580,rp:50,brief:'Hit manipule le temps. Observe ses ouvertures avant d’attaquer.'}},
 {id:'tournament',name:'Tournoi du Pouvoir',place:'Arène du Néant',npc:'Goku',role:'Représentant de l’Univers 7',desc:'La survie de ton univers est en jeu. Affronte le guerrier le plus redoutable.',mission:{id:'ad_tournament',title:'Le mur de puissance',enemy:'Jiren',hero:'Goku',diff:2,arena:1,xp:700,rp:60,brief:'Jiren est extrêmement puissant. Utilise chaque mécanique à ta disposition.'}},
 {id:'demon',name:'Royaume des Démons',place:'Troisième Royaume',npc:'Glorio',role:'Guide du royaume',desc:'Une dernière menace s’élève dans le royaume démoniaque. Affronte Gomah.',mission:{id:'ad_demon',title:'Le roi démoniaque',enemy:'Gomah',hero:'Glorio',diff:2,arena:7,xp:800,rp:70,brief:'Le dernier défi de cette aventure t’attend. Mets fin au règne de Gomah.'}}

];

const ADVENTURE_TIMELINES={
 ad_paozu:{arc:'Arrivée de Raditz — avant l’arrivée des Saiyans',fighters:['Goku','Piccolo','Raditz'],forms:{Goku:0,Piccolo:0,Raditz:0}},
 ad_capsule:{arc:'Film — Super Android 13',fighters:['Goku','Vegeta','Trunks','Piccolo','Gohan','Krillin','Android 13'],forms:{Goku:1,Vegeta:1,Trunks:1,Piccolo:0,Gohan:1,Krillin:0,'Android 13':1}},
 ad_namek:{arc:'Namek — affrontement de Piccolo contre Freezer',fighters:['Piccolo','Gohan','Krillin','Freezer'],forms:{Piccolo:0,Gohan:0,Krillin:0,Freezer:1}},
 ad_islands:{arc:'Saga des cyborgs — arrivée des Androïdes',fighters:['Goku','Vegeta','Trunks','Piccolo','Gohan','Krillin','Yamcha','Tenshinhan','Android 16','Android 17','Android 18'],forms:{Goku:1,Vegeta:1,Trunks:1,Piccolo:0,Gohan:1,Krillin:0,Yamcha:0,Tenshinhan:0,'Android 16':0,'Android 17':0,'Android 18':0}},
 ad_cellgames:{arc:'Saga Cell — Cell Games',fighters:['Goku','Vegeta','Gohan','Trunks','Piccolo','Cell','Android 18','Krillin','Yamcha','Tenshinhan'],forms:{Goku:1,Vegeta:1,Gohan:2,Trunks:1,Piccolo:0,Cell:0,'Android 18':0,Krillin:0,Yamcha:0,Tenshinhan:0}},
 ad_buu:{arc:'Saga Boo — réveil de Majin Boo',fighters:['Goku','Vegeta','Gohan','Piccolo','Majin Buu','Dabura','Android 18','Krillin','Videl'],forms:{Goku:2,Vegeta:2,Gohan:2,Piccolo:0,'Majin Buu':0,Dabura:0,'Android 18':0,Krillin:0,Videl:0}},
 ad_otherworld:{arc:'Film — Fusion / Janemba',fighters:['Goku','Vegeta','Janemba','Gogeta','Pikkon'],forms:{Goku:3,Vegeta:2,Janemba:1,Gogeta:1,Pikkon:0}},
 ad_beerus:{arc:'Battle of Gods — arrivée de Beerus',fighters:['Goku','Vegeta','Beerus','Gohan','Piccolo','Trunks','Videl','Krillin','Android 18','Yamcha','Tenshinhan','Muten Roshi'],forms:{Goku:4,Vegeta:2,Beerus:0,Gohan:3,Piccolo:0,Trunks:1,Videl:0,Krillin:0,'Android 18':0,Yamcha:0,Tenshinhan:0,'Muten Roshi':0}},
 ad_future:{arc:'Saga du futur — Goku Black',fighters:['Goku','Vegeta','Trunks','Goku Black'],forms:{Goku:5,Vegeta:4,Trunks:2,'Goku Black':1}},
 ad_universe6:{arc:'Tournoi de l’Univers 6',fighters:['Goku','Vegeta','Piccolo','Hit','Cabba'],forms:{Goku:5,Vegeta:4,Piccolo:0,Hit:0,Cabba:1}},
 ad_tournament:{arc:'Tournoi du Pouvoir',fighters:['Goku','Vegeta','Gohan','Piccolo','Android 17','Android 18','Krillin','Tenshinhan','Muten Roshi','Freezer','Jiren','Hit','Kefla','Caulifla','Kale','Cabba','Toppo','Dyspo'],forms:{Goku:7,Vegeta:5,Gohan:3,Piccolo:0,'Android 17':0,'Android 18':0,Krillin:0,Tenshinhan:0,'Muten Roshi':0,Freezer:4,Jiren:1,Hit:1,Kefla:1,Caulifla:1,Kale:1,Cabba:1,Toppo:1,Dyspo:0}},
 ad_demon:{arc:'Dragon Ball Daima — bataille finale contre Gomah',fighters:['Goku','Vegeta','Glorio','Gomah'],forms:{Goku:3,Vegeta:2,Glorio:0,Gomah:1}}
};
function adventureTimelineForMission(id){return ADVENTURE_TIMELINES[id]||null}
function adventureMaxFormIndex(characterName,missionId){
 const id=missionId||adventureState().activeMission,rule=adventureTimelineForMission(id);
 if(!rule||!rule.fighters.includes(characterName))return 0;
 const index=Number(rule.forms[characterName]);
 return Number.isFinite(index)?Math.max(0,index):0;
}
function adventureFighterAllowed(characterName,missionId){
 const rule=adventureTimelineForMission(missionId||adventureState().activeMission);
 return !!rule&&rule.fighters.includes(characterName);
}
const ADVENTURE_REGION_DATA={
 paozu:{spots:[{id:'sentier',name:'Sentier du Mont Paozu',desc:'Des traces de pas gigantesques marquent le chemin.'},{id:'cascade',name:'Cascade de la montagne',desc:'Un courant d’énergie inhabituel se cache derrière l’eau.'},{id:'maison',name:'Maison de Goku',desc:'Un endroit paisible où un vieux souvenir attend.'}],quests:[{id:'paozu_patrol',npc:'Krillin',title:'Patrouille autour du mont',desc:'Inspecte le sentier et vérifie si d’autres guerriers sont arrivés.',needs:['sentier'],xp:70,rp:8},{id:'paozu_energy',npc:'Yamcha',title:'Énergie près de la cascade',desc:'Retrouve la source d’énergie puis rapporte ton observation à Yamcha.',needs:['cascade','maison'],xp:105,rp:12}]},
 capsule:{spots:[{id:'hangar',name:'Hangar des capsules',desc:'Des capsules ouvertes révèlent des pièces déplacées.'},{id:'lab',name:'Laboratoire secondaire',desc:'Un ordinateur contient des données sur les signatures artificielles.'},{id:'rooftop',name:'Toit de Capsule Corp',desc:'La ville entière est visible depuis cette plateforme.'}],quests:[{id:'capsule_parts',npc:'Trunks',title:'Pièces manquantes',desc:'Fouille le hangar pour retrouver les pièces du prototype.',needs:['hangar'],xp:75,rp:9},{id:'capsule_scan',npc:'Android 17',title:'Une signature inconnue',desc:'Analyse les données du laboratoire et surveille la ville depuis le toit.',needs:['lab','rooftop'],xp:110,rp:13}]},
 namek:{spots:[{id:'village',name:'Village namekien',desc:'Les habitants ont laissé des traces d’une évacuation précipitée.'},{id:'grottes',name:'Grottes cristallines',desc:'Un cristal pulse au rythme d’une énergie ancienne.'},{id:'lac',name:'Grand lac',desc:'Une capsule échouée flotte près de la rive.'}],quests:[{id:'namek_help',npc:'Piccolo',title:'Aider les habitants',desc:'Vérifie le village et retrouve les réserves cachées dans les grottes.',needs:['village','grottes'],xp:95,rp:11},{id:'namek_capsule',npc:'Freezer',title:'Objet tombé du ciel',desc:'Inspecte le lac pour identifier la capsule échouée.',needs:['lac'],xp:65,rp:8}]},
 islands:{spots:[{id:'plage',name:'Plage du sud',desc:'Des marques profondes traversent le sable.'},{id:'foret',name:'Forêt côtière',desc:'La faune s’est réfugiée loin du rivage.'},{id:'reacteur',name:'Ancien réacteur',desc:'Une machine arrêtée émet encore une faible lueur.'}],quests:[{id:'islands_nature',npc:'Android 16',title:'Protéger la faune',desc:'Traverse la forêt et vérifie la plage pour retrouver les animaux déplacés.',needs:['foret','plage'],xp:100,rp:12},{id:'islands_machine',npc:'Android 17',title:'Machine hors service',desc:'Examine le vieux réacteur et identifie son origine.',needs:['reacteur'],xp:70,rp:8}]},
 cellgames:{spots:[{id:'arene',name:'Arène principale',desc:'Le sol porte encore les marques d’un ancien duel.'},{id:'gradins',name:'Gradins abandonnés',desc:'Un spectateur a laissé un message mystérieux.'},{id:'falaise',name:'Falaise d’entraînement',desc:'Un courant d’air puissant accompagne chaque mouvement.'}],quests:[{id:'cell_arena',npc:'Gohan',title:'Traces du tournoi',desc:'Inspecte l’arène et retrouve le message laissé dans les gradins.',needs:['arene','gradins'],xp:115,rp:14},{id:'cell_training',npc:'Piccolo',title:'Entraînement au calme',desc:'Rejoins la falaise et étudie les traces d’entraînement.',needs:['falaise'],xp:75,rp:9}]},
 buu:{spots:[{id:'temple',name:'Temple des Kaioshins',desc:'Une tablette ancienne décrit une menace magique.'},{id:'jardin',name:'Jardin sacré',desc:'Une énergie paisible protège les lieux.'},{id:'portail',name:'Portail dimensionnel',desc:'Le passage grésille comme s’il allait se rouvrir.'}],quests:[{id:'buu_tablet',npc:'Vegeta',title:'La tablette oubliée',desc:'Étudie le temple et le jardin pour comprendre le sceau ancien.',needs:['temple','jardin'],xp:120,rp:14},{id:'buu_gate',npc:'Gohan',title:'Surveiller le portail',desc:'Vérifie le portail dimensionnel avant qu’il ne s’active.',needs:['portail'],xp:80,rp:9}]},
 otherworld:{spots:[{id:'pont',name:'Pont des âmes',desc:'Des silhouettes lumineuses traversent lentement le pont.'},{id:'ruines',name:'Ruines flottantes',desc:'Une inscription parle d’une faille dans l’espace.'},{id:'dojo',name:'Dojo de l’au-delà',desc:'Des traces d’entraînement mènent à une salle isolée.'}],quests:[{id:'other_souls',npc:'Pikkon',title:'Guider les âmes',desc:'Traverse le pont et vérifie les anciennes ruines.',needs:['pont','ruines'],xp:125,rp:15},{id:'other_dojo',npc:'Tapion',title:'Technique oubliée',desc:'Explore le dojo et retrouve la technique inscrite sur le mur.',needs:['dojo'],xp:80,rp:10}]},
 beerus:{spots:[{id:'jardin',name:'Jardin de Beerus',desc:'Des traces de pas traversent les fleurs sans les abîmer.'},{id:'pyramide',name:'Plateforme d’entraînement',desc:'Des marques indiquent un exercice de maîtrise du ki.'},{id:'lac',name:'Lac tranquille',desc:'La surface de l’eau reflète une étrange lueur.'}],quests:[{id:'beerus_training',npc:'Whis',title:'Leçon de maîtrise',desc:'Observe le jardin puis étudie les marques de la plateforme.',needs:['jardin','pyramide'],xp:135,rp:16},{id:'beerus_lake',npc:'Goku',title:'Une lueur dans le lac',desc:'Découvre ce qui brille sous la surface du lac.',needs:['lac'],xp:85,rp:10}]},
 future:{spots:[{id:'ville',name:'Ruines de la ville',desc:'Un message de survivant est gravé sur un mur.'},{id:'refuge',name:'Refuge souterrain',desc:'Quelques provisions et un ancien communicateur sont cachés ici.'},{id:'tour',name:'Tour de surveillance',desc:'La vue permet de repérer les mouvements au loin.'}],quests:[{id:'future_survivors',npc:'Trunks',title:'Retrouver les survivants',desc:'Explore les ruines et sécurise le refuge.',needs:['ville','refuge'],xp:140,rp:17},{id:'future_signal',npc:'Gohan',title:'Signal dans le futur',desc:'Réactive le communicateur depuis la tour.',needs:['tour'],xp:90,rp:11}]},
 universe6:{spots:[{id:'arene',name:'Arène du tournoi',desc:'Les marques au sol révèlent les derniers affrontements.'},{id:'stands',name:'Zone des spectateurs',desc:'Un groupe de combattants échange des conseils.'},{id:'portail',name:'Portail de l’Univers 6',desc:'Une porte énergétique relie les deux univers.'}],quests:[{id:'u6_tactics',npc:'Cabba',title:'Étudier les combattants',desc:'Observe l’arène et échange avec les combattants dans les gradins.',needs:['arene','stands'],xp:145,rp:17},{id:'u6_portal',npc:'Hit',title:'Passage instable',desc:'Inspecte le portail avant sa prochaine activation.',needs:['portail'],xp:95,rp:11}]},
 tournament:{spots:[{id:'centre',name:'Centre de l’Arène du Néant',desc:'Une onde d’énergie parcourt encore le terrain.'},{id:'bord',name:'Bord de l’arène',desc:'Des fragments lumineux sont restés après le tournoi.'},{id:'plateforme',name:'Plateforme des observateurs',desc:'Les observateurs ont laissé des notes sur les combattants.'}],quests:[{id:'tournament_energy',npc:'Goku',title:'Fragments d’énergie',desc:'Récupère les traces au centre et au bord de l’arène.',needs:['centre','bord'],xp:160,rp:19},{id:'tournament_notes',npc:'Dyspo',title:'Rapport de tournoi',desc:'Consulte les notes de la plateforme des observateurs.',needs:['plateforme'],xp:100,rp:12}]},
 demon:{spots:[{id:'place',name:'Place du royaume démoniaque',desc:'Des affiches annoncent les ordres du roi.'},{id:'forteresse',name:'Forteresse de Gomah',desc:'Une porte scellée protège les archives du royaume.'},{id:'sanctuaire',name:'Sanctuaire ancien',desc:'Une relique pulse sous les pierres.'}],quests:[{id:'demon_orders',npc:'Glorio',title:'Déjouer les ordres',desc:'Explore la place et infiltre les archives de la forteresse.',needs:['place','forteresse'],xp:180,rp:22},{id:'demon_relic',npc:'Dabura',title:'Relique du sanctuaire',desc:'Retrouve la relique enfouie dans le sanctuaire ancien.',needs:['sanctuaire'],xp:115,rp:14}]}
};
function adventureMissionById(id){for(const z of ADVENTURE_ZONES)if(z.mission.id===id)return z.mission;return null}
function adventureZoneOpen(index){if(index<=0)return true;const q=adventureState();return q.completedMissions.includes(ADVENTURE_ZONES[index-1].mission.id)}
function recordAdventureBattle(won,mode,difficulty){
 const q=adventureState();
 if(won){q.wins++;if(mode==='story')q.storyWins++;if(Number(difficulty)>=2)q.hardWins++}
 if(mode==='adventure'&&q.activeMission){
  const mission=adventureMissionById(q.activeMission),already=mission&&q.completedMissions.includes(mission.id);
  q.lastMissionResult={id:q.activeMission,won:!!won,completed:false,xp:0,rp:0};
  if(won&&mission&&!already){
   q.completedMissions.push(mission.id);sv.xp=(Number(sv.xp)||0)+mission.xp;sv.rp=(Number(sv.rp)||0)+mission.rp;
   q.lastMissionResult.completed=true;q.lastMissionResult.xp=mission.xp;q.lastMissionResult.rp=mission.rp;
  }
  if(won)q.activeMission='';
 }
 save();
}
function adventureNpcMenu(zoneId){
 const index=ADVENTURE_ZONES.findIndex(z=>z.id===zoneId);if(index<0)return adventureMapMenu();
 const zone=ADVENTURE_ZONES[index],mission=zone.mission,q=adventureState(),open=adventureZoneOpen(index),done=q.completedMissions.includes(mission.id),data=ADVENTURE_REGION_DATA[zoneId],found=data.spots.filter(p=>q.discoveredSpots.includes(zoneId+':'+p.id)).length,claimed=data.quests.filter(x=>q.claimedRegionQuests.includes(x.id)).length;
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>'+zone.npc.toUpperCase()+'</h1><small>'+zone.role+' · '+zone.name+'</small>';
 const card=mk('section');card.className='adventure-mission-card';
 card.innerHTML='<div class="adventure-kicker">'+(done?'MISSION VALIDÉE':'MISSION PRINCIPALE')+'</div><h2>'+mission.title+'</h2><p>'+mission.brief+'</p><div class="adventure-mission-meta"><span>ADVERSAIRE : '+mission.enemy+'</span><span>DIFFICULTÉ : '+['FACILE','NORMALE','DIFFICILE'][mission.diff]+'</span></div><div class="adventure-reward">Récompense : <b>+'+mission.xp+' XP</b> · <b>+'+mission.rp+' RP</b></div><p class="adventure-npc-quote">« '+zone.npc+' : chaque combat te rapproche de ton objectif. »</p>';
 if(!open){card.appendChild(mk('small','Cette zone est verrouillée. Termine la mission précédente pour y accéder.'))}
 else card.appendChild(btn(done?'REJOUER LA MISSION':'COMMENCER LA MISSION',()=>startAdventureMission(mission.id)));
 M.appendChild(card);
 const activity=mk('section');activity.className='adventure-activity-summary';activity.innerHTML='<b>VIE DE LA RÉGION</b><span>'+found+' / '+data.spots.length+' lieux découverts</span><span>'+claimed+' / '+data.quests.length+' quêtes locales terminées</span>';
 M.appendChild(activity);
 M.appendChild(row([btn('LIEUX À EXPLORER',()=>adventureSpotsMenu(zoneId)),btn('QUÊTES LOCALES',()=>adventureRegionQuestMenu(zoneId))]));
 M.appendChild(row([btn('PARLER À '+zone.npc.toUpperCase(),()=>adventureDialogue(zoneId,'intro')),btn((q.exploredZones||[]).includes(zoneId)?'REVOIR LE SOUVENIR':'SOUVENIR DE LA RÉGION',()=>adventureExplore(zoneId))]));
 M.appendChild(btn('← Retour à la carte',adventureMapMenu));
}
function startAdventureMission(id){
 const mission=adventureMissionById(id);if(!mission)return adventureMapMenu();
 const index=ADVENTURE_ZONES.findIndex(z=>z.mission.id===id);if(!adventureZoneOpen(index))return adventureNpcMenu(ADVENTURE_ZONES[index].id);
 const q=adventureState();q.activeMission=id;q.lastMissionResult=null;save();
 const enemy=CH.findIndex(c=>c.n===mission.enemy),hero=CH.findIndex(c=>c.n===mission.hero);
 if(enemy<0){q.activeMission='';save();return adventureNpcMenu(ADVENTURE_ZONES[index].id)}
 cfg.mode='adventure';cfg.p2=enemy;cfg.p1=hero>=0?hero:0;cfg.diff=mission.diff;cfg.ar=mission.arena;cfg.sf=0;cfg.sel2=false;
 selectScreen('adventure');
}

const ADVENTURE_SCENES={
 paozu:{intro:[['Goku','Je sens une énergie étrange… Elle vient de l’espace !'],['Narration','Un vaisseau vient de traverser l’atmosphère. Un guerrier inconnu approche du Mont Paozu.'],['Raditz','Kakarot ! Tu vas enfin découvrir la véritable puissance des Saiyans !']],victory:[['Goku','La Terre est en sécurité pour le moment. Mais cette arrivée n’était que le début…'],['Narration','Au loin, un signal mécanique s’active près de la Ville de l’Ouest.']],explore:'Tu retrouves les traces du premier entraînement de Goku. Une vieille note évoque une force venue des étoiles.'},
 capsule:{intro:[['Bulma','Mes détecteurs ont repéré une signature artificielle. Elle se rapproche de la ville !'],['Trunks','Je connais ce genre de menace. Ne la laisse pas atteindre les habitants.'],['Android 13','Analyse terminée. Cible identifiée. Élimination en cours.']],victory:[['Bulma','Excellent ! J’ai récupéré des données très utiles sur cet androïde.'],['Trunks','Ce n’est pas fini. Une menace bien plus puissante nous attend sur Namek.']],explore:'Dans un laboratoire secondaire, tu découvres un prototype de radar capable de repérer les énergies lointaines.'},
 namek:{intro:[['Piccolo','L’énergie de Freezer écrase cette planète. Reste concentré et protège les Nameks.'],['Freezer','Quelle insolence ! Vous allez tous regretter de vous opposer à moi.']],victory:[['Piccolo','Tu as tenu bon. Mais les combats à venir seront encore plus dangereux.'],['Narration','Une capsule de communication indique que des cyborgs sèment le chaos sur Terre.']],explore:'Tu découvres une source d’énergie cachée dans une grotte namekienne.'},
 islands:{intro:[['Android 17','On dirait que les ennuis nous ont retrouvés.'],['Android 16','Ma mission est de protéger la nature. Je ne reculerai pas.']],victory:[['Android 17','Pas mal. Les machines ne sont pas invincibles, finalement.'],['Narration','Les données de combat révèlent une anomalie : Cell prépare un tournoi.']],explore:'Au bord de l’océan, tu trouves une capsule d’énergie oubliée.'},
 cellgames:{intro:[['Gohan','Je ne veux plus voir personne souffrir à cause de Cell.'],['Cell','Prouve-moi donc que tu mérites de participer à mon tournoi !']],victory:[['Gohan','C’est terminé… La Terre peut enfin respirer.'],['Narration','Une énergie magique s’éveille dans le monde des Kaioshins.']],explore:'Tu retrouves une marque laissée dans l’arène par le combat.'},
 buu:{intro:[['Vegeta','Je ne laisserai pas cette créature détruire encore une fois notre monde.'],['Majin Buu','Buu veut jouer ! Buu va gagner !']],victory:[['Vegeta','Hmph. Ce n’était qu’une étape.'],['Narration','Un portail dimensionnel s’ouvre vers le royaume des morts.']],explore:'Un ancien symbole des Kaioshins raconte comment une menace magique fut scellée.'},
 otherworld:{intro:[['Pikkon','Cette dimension est instable. Le démon qui s’y cache doit être arrêté.'],['Janemba','Janemba !']],victory:[['Pikkon','Le passage se referme. L’équilibre est rétabli.'],['Narration','Une présence divine t’invite à rejoindre une planète lointaine.']],explore:'Dans les ruines de l’au-delà, tu trouves une inscription sur les guerriers aux pouvoirs extraordinaires.'},
 beerus:{intro:[['Whis','Un petit test de rien du tout. Enfin… tout dépend de la personne qui vous attend.'],['Goku','Je suis prêt ! Je veux voir jusqu’où je peux progresser.'],['Beerus','Voyons si tu as enfin appris à te battre correctement.']],victory:[['Whis','Très intéressant. Votre potentiel continue de grandir.'],['Narration','Une faille temporelle vient de s’ouvrir. Une silhouette familière en sort.']],explore:'Tu découvres un jardin paisible où Whis conserve les traces d’anciens entraînements divins.'},
 future:{intro:[['Trunks','Ce futur est le mien. Je ne laisserai pas Goku Black le détruire.'],['Goku Black','Votre résistance ne fait que retarder l’inévitable.']],victory:[['Trunks','Cette fois, j’ai réussi à protéger mon époque.'],['Narration','Un signal annonce le prochain tournoi entre les univers.']],explore:'Dans les ruines, tu retrouves le journal d’un survivant qui a continué à protéger les autres.'},
 universe6:{intro:[['Vegeta','Ne crois pas que ton saut temporel suffira à me surprendre.'],['Hit','Le combat sera terminé avant que tu comprennes mon pouvoir.']],victory:[['Vegeta','Tu es rapide. Mais il faut plus que ça pour me battre.'],['Narration','Le Tournoi du Pouvoir approche. Tous les univers sont convoqués.']],explore:'Un ancien tableau du tournoi détaille les techniques de combat des guerriers de l’Univers 6.'},
 tournament:{intro:[['Goku','Jiren ! Je vais dépasser mes limites et donner tout ce que j’ai !'],['Jiren','La volonté ne suffit pas. Montre-moi ta véritable force.']],victory:[['Goku','C’était incroyable ! Je sens que je peux encore progresser.'],['Narration','Une dernière perturbation magique secoue le Royaume des Démons.']],explore:'Au bord de l’arène, tu trouves un fragment d’énergie laissé par les combattants du tournoi.'},
 demon:{intro:[['Glorio','Le royaume est en danger. Gomah doit être arrêté avant qu’il ne soit trop tard.'],['Gomah','Vous osez défier le roi du royaume des démons ?!'],['Narration','Le dernier combat de cette aventure commence.']],victory:[['Glorio','Le royaume est enfin libre. Tu as changé son destin.'],['Narration','Ton aventure restera gravée dans l’histoire des univers.']],explore:'Tu découvres une ancienne salle du trône. Une fresque raconte les origines du royaume.'}
};

function adventureZoneData(zoneId){return ADVENTURE_REGION_DATA[zoneId]||{spots:[],quests:[]}}
function adventureSpotsMenu(zoneId){
 const index=ADVENTURE_ZONES.findIndex(z=>z.id===zoneId);if(index<0||!adventureZoneOpen(index))return adventureMapMenu();
 const zone=ADVENTURE_ZONES[index],data=adventureZoneData(zoneId),q=adventureState(),found=data.spots.filter(p=>q.discoveredSpots.includes(zoneId+':'+p.id)).length;
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>EXPLORATION — '+zone.name.toUpperCase()+'</h1><small>Visite les lieux de la région. Chaque découverte est conservée dans ta sauvegarde.</small>';
 const progress=mk('section');progress.className='adventure-progress-card';progress.innerHTML='<div><b>CARTE DES LIEUX</b><strong>'+found+' / '+data.spots.length+'</strong></div><div class="adventure-progress-track"><span style="width:'+(found/data.spots.length*100)+'%"></span></div>';M.appendChild(progress);
 const grid=mk('div');grid.className='adventure-map-grid';
 for(const spot of data.spots){
  const key=zoneId+':'+spot.id,done=q.discoveredSpots.includes(key),card=mk('section');card.className='adventure-spot-card'+(done?' is-found':'');
  card.innerHTML='<div class="adventure-kicker">'+(done?'LIEU EXPLORÉ':'POINT D’INTÉRÊT')+'</div><h3>'+spot.name+'</h3><p>'+spot.desc+'</p>';
  card.appendChild(btn(done?'DÉJÀ DÉCOUVERT':'VISITER LE LIEU',()=>visitAdventureSpot(zoneId,spot.id)));
  grid.appendChild(card);
 }
 M.appendChild(grid);M.appendChild(row([btn('QUÊTES LOCALES',()=>adventureRegionQuestMenu(zoneId)),btn('← PERSONNAGES',()=>adventureNpcMenu(zoneId))]));
}
function visitAdventureSpot(zoneId,spotId){
 const index=ADVENTURE_ZONES.findIndex(z=>z.id===zoneId),data=adventureZoneData(zoneId),spot=data.spots.find(p=>p.id===spotId);if(index<0||!adventureZoneOpen(index)||!spot)return adventureMapMenu();
 const q=adventureState(),key=zoneId+':'+spotId;
 if(q.discoveredSpots.includes(key))return adventureSpotsMenu(zoneId);
 q.discoveredSpots.push(key);sv.xp=(Number(sv.xp)||0)+20;sv.rp=(Number(sv.rp)||0)+2;save();
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>NOUVELLE DÉCOUVERTE</h1>';
 const card=mk('section');card.className='adventure-event-card';card.innerHTML='<div class="adventure-result-mark">LIEU DÉCOUVERT</div><h2>'+spot.name+'</h2><p>'+spot.desc+'</p><p>Tu gagnes <b>20 XP</b> et <b>2 RP</b>. Cette découverte peut aussi faire avancer une quête locale.</p>';
 M.appendChild(card);M.appendChild(row([btn('VOIR LES QUÊTES',()=>adventureRegionQuestMenu(zoneId)),btn('CONTINUER L’EXPLORATION',()=>adventureSpotsMenu(zoneId))]));
}
function adventureRegionQuestMenu(zoneId){
 const index=ADVENTURE_ZONES.findIndex(z=>z.id===zoneId);if(index<0||!adventureZoneOpen(index))return adventureMapMenu();
 const zone=ADVENTURE_ZONES[index],data=adventureZoneData(zoneId),q=adventureState();
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>QUÊTES LOCALES — '+zone.name.toUpperCase()+'</h1><small>Parle aux personnages, accepte leurs demandes et explore les lieux pour les accomplir.</small>';
 for(const quest of data.quests){
  const accepted=q.acceptedRegionQuests.includes(quest.id),claimed=q.claimedRegionQuests.includes(quest.id),done=accepted&&quest.needs.every(id=>q.discoveredSpots.includes(zoneId+':'+id)),progress=quest.needs.filter(id=>q.discoveredSpots.includes(zoneId+':'+id)).length,el=mk('section');el.className='adventure-local-quest-card'+(claimed?' is-claimed':done?' is-ready':'');
  el.innerHTML='<div class="adventure-kicker">'+(claimed?'QUÊTE TERMINÉE':done?'OBJECTIF ACCOMPLI':accepted?'EN COURS':'NOUVELLE QUÊTE')+'</div><h3>'+quest.title+'</h3><p class="adventure-quest-giver">Donneur de quête : <b>'+quest.npc+'</b></p><p>'+quest.desc+'</p><div class="adventure-progress-track"><span style="width:'+(progress/quest.needs.length*100)+'%"></span></div><small>'+progress+' / '+quest.needs.length+' lieux visités · Récompense : '+quest.xp+' XP + '+quest.rp+' RP</small>';
  if(claimed)el.appendChild(mk('small','Récompense déjà récupérée.'));
  else if(done)el.appendChild(btn('RÉCUPÉRER LA RÉCOMPENSE',()=>claimAdventureRegionQuest(zoneId,quest.id)));
  else el.appendChild(row([btn(accepted?'PARLER À '+quest.npc.toUpperCase():'RENCONTRER '+quest.npc.toUpperCase(),()=>adventureRegionQuestTalk(zoneId,quest.id)),btn('VOIR LES LIEUX',()=>adventureSpotsMenu(zoneId))]));
  if(done&&!claimed)el.appendChild(btn('REVOIR '+quest.npc.toUpperCase(),()=>adventureRegionQuestTalk(zoneId,quest.id)));
  M.appendChild(el);
 }
 M.appendChild(row([btn('LIEUX À EXPLORER',()=>adventureSpotsMenu(zoneId)),btn('← PERSONNAGES',()=>adventureNpcMenu(zoneId))]));
}
function adventureRegionQuestTalk(zoneId,questId){
 const data=adventureZoneData(zoneId),quest=data.quests.find(x=>x.id===questId),zone=ADVENTURE_ZONES.find(z=>z.id===zoneId);if(!quest||!zone)return adventureMapMenu();
 const q=adventureState(),accepted=q.acceptedRegionQuests.includes(quest.id),idx=CH.findIndex(c=>c.n===quest.npc);
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>'+quest.npc.toUpperCase()+'</h1>';
 const box=mk('section');box.className='adventure-dialogue-card';const portraitBox=mk('div');portraitBox.className='adventure-dialogue-portrait';
 if(idx>=0&&typeof portrait==='function')portraitBox.appendChild(portrait(idx));else portraitBox.textContent=quest.npc.charAt(0);
 const textBox=mk('div');textBox.className='adventure-dialogue-text';textBox.innerHTML='<small>'+zone.name.toUpperCase()+' · DEMANDE LOCALE</small><h3>'+quest.title+'</h3><p>« '+quest.desc+' »</p><small>'+(accepted?'Merci de t’en occuper. Les lieux que tu as déjà découverts comptent dans ta progression.':'J’ai besoin de ton aide. Accepte cette mission et explore les lieux indiqués pour me donner un coup de main.')+'</small>';
 box.append(portraitBox,textBox);M.appendChild(box);
 if(!accepted)M.appendChild(btn('ACCEPTER LA QUÊTE',()=>{const state=adventureState();if(!state.acceptedRegionQuests.includes(quest.id))state.acceptedRegionQuests.push(quest.id);save();adventureRegionQuestMenu(zoneId)}));
 else M.appendChild(btn('SUIVRE LA QUÊTE',()=>adventureRegionQuestMenu(zoneId)));
 M.appendChild(btn('← Retour aux quêtes',()=>adventureRegionQuestMenu(zoneId)));
}
function claimAdventureRegionQuest(zoneId,questId){
 const data=adventureZoneData(zoneId),quest=data.quests.find(x=>x.id===questId),q=adventureState();if(!quest||!q.acceptedRegionQuests.includes(questId)||q.claimedRegionQuests.includes(questId)||!quest.needs.every(id=>q.discoveredSpots.includes(zoneId+':'+id)))return adventureRegionQuestMenu(zoneId);
 q.claimedRegionQuests.push(questId);sv.xp=(Number(sv.xp)||0)+quest.xp;sv.rp=(Number(sv.rp)||0)+quest.rp;save();adventureRegionQuestMenu(zoneId);
}
const ADVENTURE_DAILY_EVENTS=[
 {title:'Capsule de ravitaillement',desc:'Une capsule de la Capsule Corporation vient de s’écraser dans la région. Récupère son contenu avant qu’il ne soit perdu.',result:'Tu récupères des capsules de soin et des données utiles pour la suite du voyage.',xp:45,rp:8},
 {title:'Perturbation de ki',desc:'Une onde d’énergie traverse la région. Analyse son origine et stabilise le flux.',result:'Le flux retrouve son équilibre. Tu repars avec une meilleure compréhension du ki.',xp:55,rp:9},
 {title:'Défi d’entraînement',desc:'Un combattant de passage propose un exercice spécial pour tester tes réflexes.',result:'L’exercice est réussi ! Ton entraînement porte ses fruits.',xp:60,rp:10},
 {title:'Faille dimensionnelle',desc:'Une petite faille s’est ouverte près d’un ancien lieu. Referme-la avant qu’elle ne s’étende.',result:'La faille se referme et l’énergie résiduelle se transforme en récompense.',xp:65,rp:11},
 {title:'Signal du radar',desc:'Un signal inhabituel apparaît sur un radar. Vérifie le point indiqué et récupère la donnée.',result:'Le signal est identifié. Cette information pourrait servir lors d’un prochain voyage.',xp:50,rp:9}
];
function adventureCurrentDailyEvent(){
 const q=adventureState(),date=(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})(),code=Number(date.replace(/-/g,'')),zoneCount=Math.min(ADVENTURE_ZONES.length,Math.max(1,q.completedMissions.length+1)),zoneIndex=code%zoneCount,zone=ADVENTURE_ZONES[zoneIndex],data=adventureZoneData(zone.id),eventIndex=code%ADVENTURE_DAILY_EVENTS.length,event=ADVENTURE_DAILY_EVENTS[eventIndex],spot=data.spots[Math.floor(code/ADVENTURE_DAILY_EVENTS.length)%data.spots.length];
 return {date,zone,event,spot,claimed:q.dailyEventClaims.includes(date)};
}
function adventureDailyEventMenu(){
 const daily=adventureCurrentDailyEvent();M.style.display='flex';M.style.background='';M.innerHTML='<h1>ÉVÉNEMENT DU JOUR</h1><small>'+daily.zone.name+' · '+daily.spot.name+'</small>';
 const card=mk('section');card.className='adventure-event-card';card.innerHTML='<div class="adventure-kicker">'+(daily.claimed?'ÉVÉNEMENT TERMINÉ':'ÉVÉNEMENT DISPONIBLE')+'</div><h2>'+daily.event.title+'</h2><p>'+daily.event.desc+'</p><p class="adventure-quest-giver">Lieu : <b>'+daily.spot.name+'</b></p><div class="adventure-reward">Récompense : <b>+'+daily.event.xp+' XP</b> · <b>+'+daily.event.rp+' RP</b></div>';
 if(daily.claimed)card.appendChild(mk('small','Tu as déjà participé à l’événement du jour. Un nouvel événement apparaîtra demain.'));
 else card.appendChild(btn('RÉSOUDRE L’ÉVÉNEMENT',resolveAdventureDailyEvent));
 M.appendChild(card);M.appendChild(btn('← Retour à la carte',adventureMapMenu));
}
function resolveAdventureDailyEvent(){
 const daily=adventureCurrentDailyEvent(),q=adventureState();if(q.dailyEventClaims.includes(daily.date))return adventureMapMenu();
 q.dailyEventClaims.push(daily.date);if(q.dailyEventClaims.length>20)q.dailyEventClaims=q.dailyEventClaims.slice(-20);
 sv.xp=(Number(sv.xp)||0)+daily.event.xp;sv.rp=(Number(sv.rp)||0)+daily.event.rp;save();
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>ÉVÉNEMENT RÉSOLU</h1>';
 const card=mk('section');card.className='adventure-event-card';card.innerHTML='<div class="adventure-result-mark">RÉUSSI</div><h2>'+daily.event.title+'</h2><p>'+daily.event.result+'</p><div class="adventure-reward">Récompenses gagnées : <b>+'+daily.event.xp+' XP</b> · <b>+'+daily.event.rp+' RP</b></div>';M.appendChild(card);M.appendChild(btn('RETOUR À L’AVENTURE',adventureMapMenu));
}

function adventureDialogue(zoneId,scene='intro'){
 const zone=ADVENTURE_ZONES.find(z=>z.id===zoneId);if(!zone)return adventureMapMenu();
 const lines=ADVENTURE_SCENES[zoneId]?.[scene]||[[zone.npc,'Prépare-toi. Une nouvelle aventure nous attend.']];
 let i=0;
 const show=()=>{
  const [speaker,line]=lines[i],idx=CH.findIndex(c=>c.n===speaker),box=mk('section');box.className='adventure-dialogue-card';
  const portraitBox=mk('div');portraitBox.className='adventure-dialogue-portrait';
  if(idx>=0&&typeof portrait==='function')portraitBox.appendChild(portrait(idx));else portraitBox.textContent=speaker[0];
  const textBox=mk('div');textBox.className='adventure-dialogue-text';textBox.innerHTML='<small>'+speaker.toUpperCase()+' · '+zone.name.toUpperCase()+'</small><p>'+line+'</p><div class="adventure-dialogue-progress">'+(i+1)+' / '+lines.length+'</div>';
  box.append(portraitBox,textBox);M.style.display='flex';M.style.background='';M.innerHTML='<h1>'+zone.name.toUpperCase()+'</h1>';M.appendChild(box);
  const next=i===lines.length-1?(scene==='intro'?'COMMENCER LE COMBAT':scene==='explore'?'TERMINER L’EXPLORATION':'CONTINUER'):'SUIVANT ▶';
  M.appendChild(btn(next,()=>{
   if(i<lines.length-1){i++;show();return}
   if(scene==='intro')startAdventureMission(zone.mission.id);
   else if(scene==='explore'){
    const q=adventureState();q.exploredZones=Array.isArray(q.exploredZones)?q.exploredZones:[];
    if(!q.exploredZones.includes(zoneId)){q.exploredZones.push(zoneId);sv.xp=(Number(sv.xp)||0)+65;sv.rp=(Number(sv.rp)||0)+5;save()}
    adventureNpcMenu(zoneId);
   }else adventureMapMenu();
  }));
  M.appendChild(btn('PASSER',()=>scene==='intro'?startAdventureMission(zone.mission.id):scene==='explore'?adventureNpcMenu(zoneId):adventureMapMenu()));
 };
 M.style.display='flex';show();
}
function adventureExplore(zoneId){if(!ADVENTURE_ZONES.some(z=>z.id===zoneId))return adventureMapMenu();adventureDialogue(zoneId,'explore')}

function adventureBattleAfter(){
 const q=adventureState(),result=q.lastMissionResult,mission=result&&adventureMissionById(result.id);
 if(!mission)return adventureMapMenu();
 const index=ADVENTURE_ZONES.findIndex(z=>z.mission.id===mission.id),zone=ADVENTURE_ZONES[index];
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>'+(result.won?'MISSION ACCOMPLIE':'MISSION ÉCHOUÉE')+'</h1><small>'+mission.title+' · '+mission.enemy+'</small>';
 const card=mk('section');card.className='adventure-result-card';
 card.innerHTML=result.won?'<div class="adventure-result-mark">VICTOIRE</div><h2>'+mission.title+'</h2><p>'+zone.npc+' est fier de ton exploit.</p>'+(result.completed?'<div class="adventure-reward">Récompenses gagnées : <b>+'+result.xp+' XP</b> · <b>+'+result.rp+' RP</b></div>':'<p>Mission déjà terminée : aucun doublon de récompense.</p>'):'<div class="adventure-result-mark">À RÉESSAYER</div><h2>'+mission.title+'</h2><p>Le combat n’est pas terminé. Change de combattant ou de stratégie et retente ta chance.</p>';
 M.appendChild(card);
 if(!result.won)M.appendChild(btn('RÉESSAYER',()=>startAdventureMission(mission.id)));
 const next=ADVENTURE_ZONES[index+1];
 if(result.won)M.appendChild(btn('SCÈNE DE VICTOIRE',()=>adventureDialogue(zone.id,'victory')));
 if(result.won&&next)M.appendChild(btn('MISSION SUIVANTE : '+next.name.toUpperCase(),()=>adventureNpcMenu(next.id)));
 M.appendChild(btn('CARTE DE L’AVENTURE',adventureMapMenu));M.appendChild(btn('MENU PRINCIPAL',menu));
}
function adventureMapMenu(){
 const q=adventureState(),completed=q.completedMissions.length,total=ADVENTURE_ZONES.length,daily=adventureCurrentDailyEvent();
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>AVENTURE — VOYAGE À TRAVERS LES UNIVERS</h1><small>Une campagne de 12 missions, des lieux à explorer, des personnages à aider et un événement qui change chaque jour.</small>';
 const progress=mk('section');progress.className='adventure-progress-card';progress.innerHTML='<div><b>PROGRESSION DE LA CAMPAGNE</b><strong>'+completed+' / '+total+'</strong></div><div class="adventure-progress-track"><span style="width:'+(completed/total*100)+'%"></span></div><small>'+q.wins+' victoires enregistrées · '+q.storyWins+' victoires en mode Histoire · '+q.claimedRegionQuests.length+' quêtes locales terminées</small>';M.appendChild(progress);
 const eventCard=mk('section');eventCard.className='adventure-daily-banner';eventCard.innerHTML='<div class="adventure-kicker">'+(daily.claimed?'ÉVÉNEMENT DU JOUR · TERMINÉ':'ÉVÉNEMENT DU JOUR · NOUVEAU')+'</div><h2>'+daily.event.title+'</h2><p>'+daily.event.desc+'</p><small>'+daily.zone.name+' · '+daily.spot.name+' · '+daily.event.xp+' XP + '+daily.event.rp+' RP</small>';
 eventCard.appendChild(btn(daily.claimed?'ÉVÉNEMENT DÉJÀ RÉSOLU':'PARTICIPER À L’ÉVÉNEMENT',adventureDailyEventMenu));M.appendChild(eventCard);
 const map=mk('div');map.className='adventure-map-grid';
 for(let i=0;i<ADVENTURE_ZONES.length;i++){
  const z=ADVENTURE_ZONES[i],open=adventureZoneOpen(i),done=q.completedMissions.includes(z.mission.id),data=adventureZoneData(z.id),found=data.spots.filter(p=>q.discoveredSpots.includes(z.id+':'+p.id)).length,localDone=data.quests.filter(x=>q.claimedRegionQuests.includes(x.id)).length,card=mk('section');
  card.className='adventure-zone-card'+(done?' is-done':open?' is-open':' is-locked');
  card.innerHTML='<div class="adventure-zone-top"><span>'+(done?'✓':open?'◆':'🔒')+' ÉTAPE '+String(i+1).padStart(2,'0')+'</span><span>'+(done?'TERMINÉE':open?'DISPONIBLE':'VERROUILLÉE')+'</span></div><h3>'+z.name+'</h3><small>'+z.place+'</small><p>'+z.desc+'</p><div class="adventure-zone-activity"><span>📍 '+found+'/'+data.spots.length+' lieux</span><span>✦ '+localDone+'/'+data.quests.length+' quêtes</span></div><div class="adventure-zone-footer"><span>PNJ : '+z.npc+'</span><b>'+(done?'Rejouer':open?'Explorer':'À débloquer')+'</b></div>';
  card.onclick=open?()=>adventureNpcMenu(z.id):null;
  if(!open)card.setAttribute('aria-disabled','true');
  map.appendChild(card);
 }
 M.appendChild(map);M.appendChild(row([btn('MISSIONS SECONDAIRES',adventureMenu),btn('← Retour',menu)]));
}
function adventureMenu(){
 const q=adventureState();M.style.display='flex';M.style.background='';M.innerHTML='<h1>MISSIONS SECONDAIRES</h1><small>Des objectifs permanents qui complètent la campagne principale.</small>';
 for(const mission of ADVENTURE_QUESTS){
  const n=Math.min(mission.goal,q[mission.key]),claimed=q.claimed.includes(mission.id),ready=n>=mission.goal&&!claimed,el=mk('section');el.className='adventure-sidequest-card';
  el.innerHTML='<b>'+mission.name+'</b> '+(claimed?'✓ RÉCOMPENSE RÉCUPÉRÉE':ready?'★ TERMINÉE':'')+'<p>'+mission.desc+'</p><div class="adventure-progress-track"><span style="width:'+(n/mission.goal*100)+'%"></span></div><small>'+n+' / '+mission.goal+' · '+mission.xp+' XP + '+mission.rp+' RP</small>';
  if(ready)el.appendChild(btn('RÉCUPÉRER LA RÉCOMPENSE',()=>{const state=adventureState();if(state.claimed.includes(mission.id))return;state.claimed.push(mission.id);sv.xp=(Number(sv.xp)||0)+mission.xp;sv.rp=(Number(sv.rp)||0)+mission.rp;save();adventureMenu()}));
  M.appendChild(el);
 }
 M.appendChild(btn('CARTE DE L’AVENTURE',adventureMapMenu));M.appendChild(btn('← Retour',menu));
}
function profileMenu(){
 const xp=Math.max(0,Number(sv.xp)||0),level=lvl(),maxLevel=100,currentThreshold=level>=maxLevel?0:250*(level-1)*level/2,nextThreshold=level>=maxLevel?currentThreshold:250*level*(level+1)/2;
 const progress=level>=maxLevel?100:Math.max(0,Math.min(100,(xp-currentThreshold)/(nextThreshold-currentThreshold)*100)),rank=rankInfo(),stats=skillStats();
 const keys=[['fo','Force'],['vi','Vitesse'],['in','Intelligence'],['du','Durabilité'],['en','Énergie'],['ed','Endurance'],['ki','Ki'],['te','Technique']],used=keys.reduce((n,x)=>n+stats[x[0]],0),available=Math.max(0,skillPointTotal()-used);
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>PROFIL RPG</h1><small class="profile-intro">Progression · compétences · équipement · récompenses</small>';
 const panel=mk('section');panel.className='profile-panel';panel.innerHTML='<div class="profile-top"><b>NIVEAU '+level+' / '+maxLevel+'</b><b>'+xp.toLocaleString('fr-FR')+' XP</b></div><div class="xp-track"><div style="width:'+progress+'%"></div></div><small>'+(level>=maxLevel?'Niveau maximal atteint':(Math.max(0,nextThreshold-xp)).toLocaleString('fr-FR')+' XP avant le niveau '+(level+1))+'</small><hr><div class="profile-top"><b>Rang '+rank.name+'</b><b>'+rank.points+' RP</b></div><small>'+(rank.next==null?'Rang maximal atteint':(rank.next-rank.points)+' points avant le rang suivant')+'</small><div class="profile-stats"><span>⚔ '+(Number(sv.w)||0)+' victoires</span><span>✕ '+(Number(sv.l)||0)+' défaites</span><span>📖 '+(Number(sv.storyClears)||0)+' chapitres</span></div>';M.appendChild(panel);
 const skills=mk('section');skills.className='profile-panel';skills.append(mk('h2','POINTS DE COMPÉTENCE'),mk('p','Disponibles : '+available+' / '+skillPointTotal()+' · 5 points par niveau'),mk('small','Répartition modifiable gratuitement. Les bonus s’appliquent au combattant local.'));
 const statGrid=mk('div');statGrid.className='skill-grid';for(const [key,name] of keys){const cell=mk('div');cell.className='skill-cell';cell.append(mk('b',name),mk('span',String(stats[key])),btn('−',()=>{if(stats[key]>0){sv.skillStats=skillStats();sv.skillStats[key]--;save();profileMenu()}},stats[key]<=0),btn('+',()=>{if(available>0){sv.skillStats=skillStats();sv.skillStats[key]++;save();profileMenu()}},available<=0));statGrid.appendChild(cell)}skills.append(statGrid,btn('RÉINITIALISER LES POINTS',()=>{sv.skillStats={};save();profileMenu()}));M.appendChild(skills);
 const shop=mk('section');shop.className='profile-panel';shop.append(mk('h2','OBJETS & BOUTIQUE'),mk('p','Points de classement : <b>'+(Number(sv.rp)||0)+' RP</b>'));const equipped=equippedRelic();shop.appendChild(mk('small',equipped?'Équipée : '+equipped.name+' — '+equipped.desc:'Aucune relique équipée.'));
 const relicGrid=mk('div');relicGrid.className='relic-grid';for(const relic of RELICS){const has=sv.items.includes(relic.id),active=sv.equippedItem===relic.id,card=mk('article');card.className='relic-card'+(active?' relic-active':'');card.append(mk('b',(has?'✦ ':'🔒 ')+relic.name),mk('small',relic.desc),mk('small',has?'Dans ton inventaire':relic.price?'Prix : '+relic.price+' RP':'À obtenir dans : '+(chapterById(relic.chapter)?.t||relic.chapter)));
 if(has)card.appendChild(btn(active?'RETIRER':'ÉQUIPER',()=>{sv.equippedItem=active?'':relic.id;save();profileMenu()},active));else if(relic.price)card.appendChild(btn('ACHETER · '+relic.price+' RP',()=>{if((Number(sv.rp)||0)<relic.price){card.appendChild(mk('small','RP insuffisants pour cet achat.'));return}sv.rp-=relic.price;sv.items.push(relic.id);save();profileMenu()}));relicGrid.appendChild(card)}shop.appendChild(relicGrid);M.appendChild(shop);
 const actions=mk('div');actions.className='profile-actions';actions.append(row([btn('QUÊTES DU JOUR',dailyMenu),btn('MISSIONS',adventureMenu),btn('CLASSEMENT',rankingMenu)]),row([btn('CARTE DE L’AVENTURE',adventureMapMenu)]));M.appendChild(actions);M.appendChild(btn('← Retour',menu));
}