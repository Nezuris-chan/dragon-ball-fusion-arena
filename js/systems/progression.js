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
 for(const k of ['claimed','npcClaims','completedMissions'])if(!Array.isArray(q[k]))q[k]=[];
 if(typeof q.activeMission!=='string')q.activeMission='';
 return q;
}
const ADVENTURE_ZONES=[
 {id:'paozu',name:'Mont Paozu',place:'Terre · Est',npc:'Goku',role:'Maître du combat',desc:'Ton aventure commence ici. Protège la Terre contre la première grande menace.',mission:{id:'ad_paozu',title:'La menace des Saiyans',enemy:'Raditz',hero:'Goku',diff:0,arena:0,xp:180,rp:15,brief:'Raditz est arrivé sur Terre. Prouve que tu peux défendre ta planète.'}},
 {id:'capsule',name:'Capsule Corporation',place:'Ville de l’Ouest',npc:'Bulma',role:'Inventrice',desc:'Une menace artificielle approche. Aide Bulma à tester ses données de combat.',mission:{id:'ad_capsule',title:'Alerte androïde',enemy:'Android 13',hero:'Trunks',diff:0,arena:5,xp:220,rp:20,brief:'Un androïde dangereux a été repéré près de la ville. Neutralise-le.'}},
 {id:'namek',name:'Planète Namek',place:'Secteur lointain',npc:'Piccolo',role:'Protecteur de Namek',desc:'Le tyran Freezer cherche les Dragon Balls. Arrête-le avant qu’il ne soit trop tard.',mission:{id:'ad_namek',title:'Le tyran de l’espace',enemy:'Freezer',hero:'Piccolo',diff:1,arena:0,xp:300,rp:25,brief:'Freezer libère toute sa puissance. Prépare-toi à un duel difficile.'}},
 {id:'islands',name:'Îles du Sud',place:'Terre',npc:'C-17',role:'Combattant artificiel',desc:'Les cyborgs sèment le chaos. Affronte un adversaire conçu pour la guerre.',mission:{id:'ad_islands',title:'Danger mécanique',enemy:'Android 16',hero:'Android 17',diff:1,arena:2,xp:320,rp:25,brief:'C-16 est un adversaire massif. Sa résistance sera son principal avantage.'}},
 {id:'cellgames',name:'Cell Games',place:'Terre · Arène',npc:'Gohan',role:'Guerrier protecteur',desc:'Cell organise son tournoi. Mets fin à ses ambitions.',mission:{id:'ad_cellgames',title:'Le dernier Cell Game',enemy:'Cell',hero:'Gohan',diff:2,arena:2,xp:420,rp:35,brief:'Cell ne retiendra plus ses coups. Donne tout pour protéger la Terre.'}},
 {id:'buu',name:'Monde des Kaioshins',place:'Monde sacré',npc:'Vegeta',role:'Prince des Saiyans',desc:'Une ancienne créature menace l’univers. Affronte Majin Buu.',mission:{id:'ad_buu',title:'Le réveil de Majin Buu',enemy:'Majin Buu',hero:'Vegeta',diff:2,arena:4,xp:460,rp:40,brief:'Majin Buu est imprévisible et résistant. Garde ton sang-froid.'}},
 {id:'otherworld',name:'Autre Monde',place:'Royaume des morts',npc:'Pikkon',role:'Champion de l’au-delà',desc:'Une anomalie dimensionnelle a libéré Janemba. Rétablis l’équilibre.',mission:{id:'ad_otherworld',title:'Le démon dimensionnel',enemy:'Janemba',hero:'Pikkon',diff:2,arena:7,xp:480,rp:40,brief:'Janemba déforme l’espace et attaque sans prévenir.'}},
 {id:'beerus',name:'Planète de Beerus',place:'Monde des dieux',npc:'Whis',role:'Guide divin',desc:'Une épreuve divine t’attend. Montre que tu maîtrises les bases du combat.',mission:{id:'ad_beerus',title:'Épreuve de destruction',enemy:'Beerus',hero:'Goku',diff:2,arena:4,xp:520,rp:45,brief:'Beerus ne plaisante pas. Un seul faux pas peut coûter le combat.'}},
 {id:'future',name:'Futur dévasté',place:'Ligne temporelle alternative',npc:'Trunks',role:'Dernier défenseur',desc:'Le futur est sous la menace de Goku Black. Change son destin.',mission:{id:'ad_future',title:'Le cauchemar du futur',enemy:'Goku Black',hero:'Trunks',diff:2,arena:3,xp:560,rp:45,brief:'Goku Black maîtrise une puissance divine. Protège cette ligne temporelle.'}},
 {id:'universe6',name:'Tournoi des Univers',place:'Univers 6',npc:'Cabba',role:'Combattant de Sadala',desc:'Un duel décisif t’attend face à l’assassin légendaire Hit.',mission:{id:'ad_universe6',title:'Le saut temporel',enemy:'Hit',hero:'Vegeta',diff:2,arena:1,xp:580,rp:50,brief:'Hit manipule le temps. Observe ses ouvertures avant d’attaquer.'}},
 {id:'tournament',name:'Tournoi du Pouvoir',place:'Arène du Néant',npc:'Goku',role:'Représentant de l’Univers 7',desc:'La survie de ton univers est en jeu. Affronte le guerrier le plus redoutable.',mission:{id:'ad_tournament',title:'Le mur de puissance',enemy:'Jiren',hero:'Goku',diff:2,arena:1,xp:700,rp:60,brief:'Jiren est extrêmement puissant. Utilise chaque mécanique à ta disposition.'}},
 {id:'demon',name:'Royaume des Démons',place:'Troisième Royaume',npc:'Glorio',role:'Guide du royaume',desc:'Une dernière menace s’élève dans le royaume démoniaque. Affronte Gomah.',mission:{id:'ad_demon',title:'Le roi démoniaque',enemy:'Gomah',hero:'Glorio',diff:2,arena:7,xp:800,rp:70,brief:'Le dernier défi de cette aventure t’attend. Mets fin au règne de Gomah.'}}
];
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
 const zone=ADVENTURE_ZONES[index],mission=zone.mission,q=adventureState(),open=adventureZoneOpen(index),done=q.completedMissions.includes(mission.id);
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>'+zone.npc.toUpperCase()+'</h1><small>'+zone.role+' · '+zone.name+'</small>';
 const card=mk('section');card.className='adventure-mission-card';
 card.innerHTML='<div class="adventure-kicker">'+(done?'MISSION VALIDÉE':'MISSION PRINCIPALE')+'</div><h2>'+mission.title+'</h2><p>'+mission.brief+'</p><div class="adventure-mission-meta"><span>ADVERSAIRE : '+mission.enemy+'</span><span>DIFFICULTÉ : '+['FACILE','NORMALE','DIFFICILE'][mission.diff]+'</span></div><div class="adventure-reward">Récompense : <b>+'+mission.xp+' XP</b> · <b>+'+mission.rp+' RP</b></div><p class="adventure-npc-quote">« '+zone.npc+' : chaque combat te rapproche de ton objectif. »</p>';
 if(!open){card.appendChild(mk('small','Cette zone est verrouillée. Termine la mission précédente pour y accéder.'))}
 else card.appendChild(btn(done?'REJOUER LA MISSION':'COMMENCER LA MISSION',()=>startAdventureMission(mission.id)));
 M.appendChild(card);M.appendChild(row([btn('PARLER À '+zone.npc.toUpperCase(),()=>adventureDialogue(zoneId,'intro')),btn((adventureState().exploredZones||[]).includes(zoneId)?'RÉEXPLORER':'EXPLORER LA RÉGION',()=>adventureExplore(zoneId))]));M.appendChild(btn('← Retour à la carte',adventureMapMenu));
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
 const q=adventureState(),completed=q.completedMissions.length,total=ADVENTURE_ZONES.length;
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>AVENTURE — VOYAGE À TRAVERS LES UNIVERS</h1><small>Une campagne de 12 missions. Termine chaque affrontement pour ouvrir la prochaine région.</small>';
 const progress=mk('section');progress.className='adventure-progress-card';progress.innerHTML='<div><b>PROGRESSION DE LA CAMPAGNE</b><strong>'+completed+' / '+total+'</strong></div><div class="adventure-progress-track"><span style="width:'+(completed/total*100)+'%"></span></div><small>'+q.wins+' victoires enregistrées · '+q.storyWins+' victoires en mode Histoire</small>';M.appendChild(progress);
 const map=mk('div');map.className='adventure-map-grid';
 for(let i=0;i<ADVENTURE_ZONES.length;i++){
  const z=ADVENTURE_ZONES[i],open=adventureZoneOpen(i),done=q.completedMissions.includes(z.mission.id),card=mk('section');
  card.className='adventure-zone-card'+(done?' is-done':open?' is-open':' is-locked');
  card.innerHTML='<div class="adventure-zone-top"><span>'+(done?'✓':open?'◆':'🔒')+' ÉTAPE '+String(i+1).padStart(2,'0')+'</span><span>'+(done?'TERMINÉE':open?'DISPONIBLE':'VERROUILLÉE')+'</span></div><h3>'+z.name+'</h3><small>'+z.place+'</small><p>'+z.desc+'</p><div class="adventure-zone-footer"><span>PNJ : '+z.npc+'</span><b>'+(done?'Rejouer':open?'Voir la mission':'À débloquer')+'</b></div>';
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