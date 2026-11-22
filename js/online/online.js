function passwordRecoveryMenu(){
 dlgNext=null;M.style.display='flex';M.style.background='';M.innerHTML='<h1>NOUVEAU MOT DE PASSE</h1><p>Choisis un nouveau mot de passe pour ton compte.</p>';
 const pw=document.createElement('input');pw.type='password';pw.autocomplete='new-password';pw.placeholder='Nouveau mot de passe (8 caractères minimum)';pw.style.cssText='width:min(86%,340px);padding:10px;margin:5px;background:#101a30;color:#fff;border:1px solid #00c8ff';
 const confirm=document.createElement('input');confirm.type='password';confirm.autocomplete='new-password';confirm.placeholder='Confirmer le mot de passe';confirm.style.cssText=pw.style.cssText;
 const status=mk('small','');M.append(pw,confirm,status);
 M.appendChild(btn('ENREGISTRER LE NOUVEAU MOT DE PASSE',async()=>{
  if(pw.value.length<8){status.textContent='Le mot de passe doit contenir au moins 8 caractères.';return}
  if(pw.value!==confirm.value){status.textContent='Les deux mots de passe ne correspondent pas.';return}
  status.textContent='Mise à jour…';
  const {error}=await sbClient.auth.updateUser({password:pw.value});
  if(error){status.textContent='Erreur : '+error.message;return}
  status.textContent='Mot de passe modifié ! Tu peux maintenant te connecter.';
  await sbClient.auth.signOut();onlineUser=null;
  setTimeout(()=>accountOnlineMenu(),1200);
 }));
}
function accountOnlineMenu(){
 dlgNext=null;M.style.display='flex';M.style.background='';M.innerHTML='<h1>COMPTE EN LIGNE</h1>';
 if(!sbClient){M.appendChild(mk('small','Connexion Supabase indisponible. Vérifie ta connexion Internet puis recharge la page.'));M.appendChild(btn('← Retour',menu));return}
 if(onlineUser){
  const connectedLabel=document.createElement('p');connectedLabel.textContent='Connecté : '+(sv.pseudo||onlineUser.email||'Joueur');M.appendChild(connectedLabel);
  M.appendChild(row([btn('CLASSEMENT MONDIAL',globalRankingMenu),btn('COMBATS EN LIGNE',onlinePlayMenu),btn('SE DÉCONNECTER',async()=>{const {error}=await sbClient.auth.signOut();if(error){alert('Déconnexion impossible : '+error.message);return}onlineUser=null;menu()})]));
  M.appendChild(mk('small','Ton compte est connecté. Tu peux accéder aux combats classés et au classement mondial.'));
  M.appendChild(btn('← Retour',menu));return;
 }
 M.appendChild(mk('small','Crée un compte ou connecte-toi avec ton adresse e-mail.'));
 const email=document.createElement('input');email.type='email';email.autocomplete='email';email.placeholder='Adresse e-mail';email.maxLength=254;email.style.cssText='width:min(86%,340px);padding:10px;margin:5px;background:#101a30;color:#fff;border:1px solid #00c8ff';
 const password=document.createElement('input');password.type='password';password.autocomplete='current-password';password.placeholder='Mot de passe (8 caractères minimum)';password.style.cssText=email.style.cssText;
 const pseudo=document.createElement('input');pseudo.type='text';pseudo.autocomplete='nickname';pseudo.placeholder='Pseudo (2 à 16 caractères)';pseudo.maxLength=16;pseudo.value=sv.pseudo||'';pseudo.style.cssText=email.style.cssText;
 M.appendChild(email);M.appendChild(password);M.appendChild(pseudo);
 const status=mk('small','');M.appendChild(status);
 const valid=()=>{const em=email.value.trim(),pw=password.value,un=pseudo.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){status.textContent='Entre une adresse e-mail valide.';return null}if(pw.length<8){status.textContent='Le mot de passe doit contenir au moins 8 caractères.';return null}const clean=un.replace(/[\u0000-\u001f\u007f]/g,'').slice(0,16);if(clean.length<2){status.textContent='Le pseudo doit contenir 2 à 16 caractères.';return null}return {em,pw,clean}};
 const sync=async(user,username)=>{const {error}=await sbClient.from('profiles').upsert({id:user.id,username},{onConflict:'id'});if(error)throw error;onlineUser=user;sv.pseudo=username;save()};
 M.appendChild(btn('MOT DE PASSE OUBLIÉ ?',async()=>{
  const em=email.value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){status.textContent='Entre ton adresse e-mail pour recevoir le lien de réinitialisation.';return}
  status.textContent='Envoi de l’e-mail…';
  try{const {error}=await sbClient.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});if(error)throw error;status.textContent='E-mail envoyé ! Vérifie ta boîte de réception et tes courriers indésirables.'}
  catch(e){status.textContent='Erreur : '+e.message}
}));
 M.appendChild(row([
  btn('CRÉER UN COMPTE',async()=>{const v=valid();if(!v)return;status.textContent='Création du compte…';try{const {data,error}=await sbClient.auth.signUp({email:v.em,password:v.pw,options:{data:{username:v.clean}}});if(error)throw error;if(data.session&&data.user){await sync(data.user,v.clean);status.textContent='Compte créé et connecté.';accountOnlineMenu()}else{status.textContent='Compte créé. Vérifie ta boîte mail si Supabase demande une confirmation, puis connecte-toi.'}}catch(e){status.textContent='Erreur : '+e.message}}),
  btn('SE CONNECTER',async()=>{const v=valid();if(!v)return;status.textContent='Connexion…';try{const {data,error}=await sbClient.auth.signInWithPassword({email:v.em,password:v.pw});if(error)throw error;const {data:profile,error:readError}=await sbClient.from('profiles').select('username').eq('id',data.user.id).maybeSingle();if(readError)throw readError;const savedName=sv.pseudo&&sv.pseudo!=='Joueur'?sv.pseudo:null;const username=(!profile?.username||profile.username.startsWith('Joueur-'))?(savedName||v.clean):profile.username;await sync(data.user,username);accountOnlineMenu()}catch(e){status.textContent='Erreur : '+e.message}}),
 ]));
 M.appendChild(mk('small','Ne réutilise pas le mot de passe d’un autre compte. Il ne sera pas enregistré dans ta sauvegarde.'));
 M.appendChild(btn('← Retour',menu));
}
const onlineRankInfo=points=>{const r=Math.max(0,Number(points)||0),tiers=[['Bronze',1000],['Argent',1200],['Or',1400],['Platine',1600],['Diamant',1800],['Rang Zeno',2000]];let i=0;for(let n=0;n<tiers.length;n++)if(r>=tiers[n][1])i=n;return {name:tiers[i][0]}};
async function globalRankingMenu(){
 dlgNext=null;M.style.display='flex';M.style.background='';M.innerHTML='<h1>CLASSEMENT MONDIAL</h1><small>Chargement…</small>';
 if(!sbClient){M.appendChild(btn('← Retour',accountOnlineMenu));return}
 try{
  const {data,error}=await sbClient.from('profiles').select('id,username,verified_xp,verified_level,rating,wins,losses').order('rating',{ascending:false}).order('wins',{ascending:false}).limit(50);
  if(error)throw error;
  M.innerHTML='<h1>CLASSEMENT MONDIAL</h1>';
  const list=mk('div');list.style.cssText='width:min(94%,650px);text-align:left;line-height:1.65;max-height:350px;overflow:auto';
  if(!data.length)list.textContent='Aucun joueur classé pour le moment.';
  data.forEach((p,i)=>{const rank=onlineRankInfo(p.rating),playerLevel=Math.max(1,Math.min(100,Number(p.verified_level)||1)),verifiedXP=Math.max(0,Number(p.verified_xp)||0),line=mk('div');line.style.cssText='padding:7px 9px;border-bottom:1px solid #28405d;'+(onlineUser&&p.id===onlineUser.id?'background:rgba(0,200,255,.13);':'');line.textContent='#'+(i+1)+'  '+p.username+' · Niveau en ligne '+playerLevel+' · '+verifiedXP+' XP vérifiés · '+rank.name+' · '+p.rating+' pts · '+p.wins+' V / '+p.losses+' D';list.appendChild(line)});
  M.appendChild(list);M.appendChild(mk('small','L’XP et le niveau en ligne sont calculés par le serveur après un match classé confirmé par les deux joueurs. Ton XP d’histoire et d’aventure reste enregistré localement.'));
 }catch(e){M.appendChild(mk('small','Impossible de charger le classement : '+String(e?.message||'Erreur inconnue.')))}
 M.appendChild(btn('← Retour',accountOnlineMenu));
}
const onlinePulseKeys=['jP','bP','liP','heP','spP','ulP','trP','tpP','dgP','dsP','kkP'];let onlineQueue=null,onlineRoomChannel=null,onlineRemoteInput={},onlinePendingPulses={},onlineInputSeq=0,onlineLastRemoteSeq=0,onlineLocalSide=0,onlineRoomReady=false,onlineOpponentName='Adversaire',onlineOpponentChar=1,onlineMatchId=null,onlineOpponentId=null,onlineMatchRecordId=null,onlineIsHost=false,onlinePicksStarted=false,onlineResultSubmitted=false;
function onlinePlayMenu(){
 if(!onlineUser){accountOnlineMenu();return}
 dlgNext=null;M.style.display='flex';M.style.background='';M.innerHTML='<h1>COMBATS EN LIGNE</h1>';
 M.appendChild(mk('p','Choisis ton mode : duel classé entre joueurs ou entraînement contre IA.'));
 M.appendChild(btn('ENTRAÎNEMENT CONTRE IA',()=>selectScreen('online-ai')));
 M.appendChild(btn('COMBAT CLASSÉ CONTRE JOUEUR',findOnlineOpponent));
 M.appendChild(btn('← Retour',accountOnlineMenu));
}
function onlineQueueMenu(message){
 M.style.display='flex';M.style.background='';M.innerHTML='<h1>RECHERCHE D’ADVERSAIRE</h1>';
 const queueMessage=document.createElement('p');queueMessage.textContent=message||'Recherche d’un joueur connecté…';M.appendChild(queueMessage);
 M.appendChild(mk('small','Garde cette page ouverte pendant la recherche.'));
 M.appendChild(btn('ANNULER',async()=>{if(onlineQueue){try{await onlineQueue.untrack();await sbClient.removeChannel(onlineQueue)}catch(e){}onlineQueue=null}onlineMatchId=null;onlinePlayMenu()}));
}
async function findOnlineOpponent(){
 if(!onlineUser){accountOnlineMenu();return}if(!sbClient){onlinePlayMenu();return}
 onlineMatchId=null;onlineOpponentId=null;onlineMatchRecordId=null;onlinePicksStarted=false;onlineResultSubmitted=false;onlineQueueMenu('Recherche d’un adversaire…');
 const q=sbClient.channel('fusion-arena-matchmaking',{config:{presence:{key:onlineUser.id},broadcast:{self:false}}});onlineQueue=q;
 q.on('presence',{event:'sync'},async()=>{if(onlineQueue!==q||onlineMatchId)return;const players=Object.values(q.presenceState()).flat().filter(p=>p.user_id&&p.user_id!==onlineUser.id);if(!players.length)return;const opponent=players.sort((a,b)=>String(a.user_id).localeCompare(String(b.user_id)))[0];const ids=[onlineUser.id,opponent.user_id].sort(),room='fa-'+ids.join('-');if(onlineUser.id!==ids[0])return;onlineMatchId=room;onlineOpponentId=opponent.user_id;onlineOpponentName=opponent.pseudo||'Adversaire';onlineIsHost=true;await q.send({type:'broadcast',event:'match_found',payload:{to:opponent.user_id,room,host:onlineUser.id,hostName:sv.pseudo||'Joueur'}});await sbClient.removeChannel(q);if(onlineQueue===q)onlineQueue=null;joinOnlineRoom(room,onlineOpponentName,true,opponent.user_id)});
 q.on('broadcast',{event:'match_found'},async({payload})=>{if(onlineQueue!==q||payload?.to!==onlineUser.id)return;onlineMatchId=payload.room;onlineOpponentId=payload.host;onlineOpponentName=payload.hostName||'Adversaire';onlineIsHost=false;await sbClient.removeChannel(q);if(onlineQueue===q)onlineQueue=null;joinOnlineRoom(payload.room,onlineOpponentName,false,payload.host)});
 const {error}=await q.subscribe(async status=>{if(status==='SUBSCRIBED')await q.track({user_id:onlineUser.id,pseudo:sv.pseudo||'Joueur',online_at:new Date().toISOString()});else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){onlineQueue=null;onlineQueueMenu('Connexion au matchmaking impossible. Réessaie.')}});
 if(error){onlineQueue=null;onlineQueueMenu('Erreur de connexion : '+error.message)}
}
async function joinOnlineRoom(room,opponentName,isHost,opponentId){
 onlineMatchId=room;onlineOpponentId=opponentId||onlineOpponentId;onlineOpponentName=opponentName;onlineIsHost=!!isHost;onlineRemoteInput={};onlinePendingPulses={};onlineInputSeq=0;onlineLastRemoteSeq=0;onlineRoomReady=false;onlinePicksStarted=false;
 onlineQueueMenu('Adversaire trouvé : '+opponentName+'. Choisissez chacun votre personnage…');
 const ch=sbClient.channel(room,{config:{presence:{key:onlineUser.id},broadcast:{self:false,ack:true}}});onlineRoomChannel=ch;
 ch.on('presence',{event:'sync'},async()=>{if(!onlineRoomReady||!onlineIsHost||onlinePicksStarted)return;const members=Object.values(ch.presenceState()).flat(),mine=members.find(p=>p.user_id===onlineUser.id),other=members.find(p=>p.user_id===onlineOpponentId);if(members.length<2||mine?.character==null||other?.character==null)return;onlinePicksStarted=true;onlineOpponentChar=Number(other.character);const arena=Math.floor(Math.random()*AR.length),matchId=crypto.randomUUID();const {error}=await sbClient.functions.invoke('online-match',{body:{action:'register',match_id:matchId,player2:onlineOpponentId}});if(error){onlinePicksStarted=false;onlineQueueMenu('Création du match impossible : '+error.message);return}onlineMatchRecordId=matchId;const payload={matchId,hostChar:Number(mine.character),guestChar:Number(other.character),arena};const sent=await ch.send({type:'broadcast',event:'start',payload});if(sent!=='ok'){onlineQueueMenu('Démarrage du match impossible. Réessaie.');return}beginOnlineBattle(payload.hostChar,payload.guestChar,matchId,arena,0)});
 ch.on('broadcast',{event:'input'},({payload})=>{if(payload?.from!==onlineUser.id&&payload?.input&&Number(payload.seq)>onlineLastRemoteSeq){onlineLastRemoteSeq=Number(payload.seq);onlineRemoteInput={...payload.input}}});
 ch.on('broadcast',{event:'leave'},()=>{if(G&&cfg.mode==='online'){G.over=1;G.win=onlineLocalSide===0?G.a:G.b;G.ann={t:120,s:'ADVERSAIRE DÉCONNECTÉ',c:'#fd6'}}});
 ch.on('broadcast',{event:'start'},({payload})=>{if(!onlineIsHost&&payload?.matchId){onlineMatchRecordId=payload.matchId;beginOnlineBattle(Number(payload.hostChar),Number(payload.guestChar),payload.matchId,Number(payload.arena),1)}});
 ch.on('broadcast',{event:'result_validated'},()=>{if(cfg.mode==='online'){G.ann={t:200,s:'RÉSULTAT VALIDÉ · CLASSEMENT MIS À JOUR',c:'#6f9'};globalRankingMenu()}});
 ch.subscribe(async status=>{if(status==='SUBSCRIBED'){await ch.track({user_id:onlineUser.id,pseudo:sv.pseudo||'Joueur',character:null});onlineRoomReady=true;onlineCharacterSelect()}else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){onlineRoomReady=false;onlineQueueMenu('Impossible de rejoindre le salon. Réessaie.')}});
}
function onlineCharacterSelect(){
 if(!onlineRoomReady)return;M.style.display='flex';M.style.background='';M.innerHTML='<h1>CHOISIS TON PERSONNAGE</h1>';const opponentLabel=document.createElement('small');opponentLabel.textContent='Adversaire : '+onlineOpponentName;const selectionHint=document.createElement('small');selectionHint.textContent='Choisis ton combattant. Le terrain sera tiré au sort après les deux choix.';M.append(opponentLabel,selectionHint);
 const grid=document.createElement('div');grid.style.cssText='width:min(96%,820px);max-height:62vh;overflow:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:8px;padding:8px';
 CH.forEach((c,i)=>{const b=document.createElement('button');b.style.cssText='display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px';b.appendChild(portrait(i));const n=document.createElement('b');n.textContent=c.n;b.appendChild(n);b.onclick=async()=>{cfg.p1=i;cfg.sf=0;await onlineRoomChannel.track({user_id:onlineUser.id,pseudo:sv.pseudo||'Joueur',character:i});M.innerHTML='<h1>PERSONNAGE CHOISI</h1>';const waitingLabel=document.createElement('p');waitingLabel.textContent='Tu joues '+c.n+'. En attente du choix de '+onlineOpponentName+'…';M.appendChild(waitingLabel);M.appendChild(btn('Changer de personnage',onlineCharacterSelect));};grid.appendChild(b)});
 M.appendChild(grid);M.appendChild(btn('Annuler',leaveOnlineBattle));
}
function beginOnlineBattle(player1Char,player2Char,matchId,arena,localSide){
 cfg.mode='online';cfg.p1=Number.isInteger(player1Char)?player1Char:0;cfg.p2=Number.isInteger(player2Char)?player2Char:1;cfg.ar=Number.isInteger(arena)?arena:Math.floor(Math.random()*AR.length);onlineLocalSide=localSide===1?1:0;onlineRemoteInput={};onlinePendingPulses={};onlineInputSeq=0;onlineLastRemoteSeq=0;stage=0;onlineResultSubmitted=false;start();G.onlineRoom=onlineMatchId;G.onlineLocalId=onlineUser.id;G.onlineMatchRecordId=matchId||null;G.onlineOpponent=onlineOpponentName;G.ann={t:180,s:'ARÈNE : '+AR[cfg.ar][0],c:'#9df'};
}
async function onlineConfirmResult(winnerId){
 if(onlineResultSubmitted||!G?.onlineMatchRecordId)return;onlineResultSubmitted=true;M.innerHTML='<h1>VALIDATION ENVOYÉE</h1><small>En attente de la confirmation de l’autre joueur…</small>';
 try{const {data,error}=await sbClient.functions.invoke('online-match',{body:{action:'report',match_id:G.onlineMatchRecordId,winner:winnerId}});if(error)throw error;const resultStatus=data?.status;
  if(resultStatus==='validated'){M.innerHTML='<h1>RÉSULTAT VALIDÉ</h1><small>Les deux joueurs sont d’accord. Le classement mondial est mis à jour.</small>';await onlineRoomChannel?.send({type:'broadcast',event:'result_validated',payload:{matchId:G.onlineMatchRecordId}});M.appendChild(btn('VOIR LE CLASSEMENT',globalRankingMenu));M.appendChild(btn('MENU',leaveOnlineBattle))}
  else if(resultStatus==='waiting_for_opponent'){M.innerHTML='<h1>EN ATTENTE</h1><small>Ton résultat est enregistré. Les points seront attribués après la confirmation de l’adversaire.</small>';M.appendChild(btn('Retour au menu',leaveOnlineBattle))}
  else if(resultStatus==='reports_disagree'){M.innerHTML='<h1>RÉSULTATS DIFFÉRENTS</h1><small>Les confirmations ne correspondent pas. Aucun point n’a été attribué.</small>';M.appendChild(btn('Retour au menu',leaveOnlineBattle))}
  else{M.innerHTML='<h1>RÉSULTAT DÉJÀ TRAITÉ</h1><small>Recharge le classement pour voir les points.</small>';M.appendChild(btn('Classement',globalRankingMenu))}
 }catch(e){onlineResultSubmitted=false;M.innerHTML='<h1>ERREUR DE VALIDATION</h1>';const message=document.createElement('small');message.textContent=String(e?.message||'Erreur inconnue.');M.appendChild(message);M.appendChild(btn('Réessayer',onlineResultConfirmMenu))}
}
function onlineResultConfirmMenu(){
 if(!G||!G.win)return;M.style.display='flex';M.style.background='';M.innerHTML='<h1>CONFIRMER LE RÉSULTAT</h1>';const resultHint=document.createElement('small');resultHint.textContent='Le jeu estime que '+(G.win===(onlineLocalSide===0?G.a:G.b)?(sv.pseudo||'Toi'):onlineOpponentName)+' a gagné. Choisis le résultat réel. Les points ne seront ajoutés qu’après l’accord des deux joueurs.';M.appendChild(resultHint);
 M.appendChild(btn('VICTOIRE : '+(sv.pseudo||'MOI'),()=>onlineConfirmResult(onlineUser.id)));M.appendChild(btn('VICTOIRE : '+onlineOpponentName,()=>onlineConfirmResult(onlineOpponentId)));M.appendChild(btn('QUITTER SANS VALIDER',leaveOnlineBattle));
}
async function leaveOnlineBattle(){
 const room=onlineRoomChannel;onlineRoomChannel=null;
 if(room){try{await room.send({type:'broadcast',event:'leave',payload:{from:onlineUser?.id}});await sbClient.removeChannel(room)}catch(e){}}
 G=null;stage=0;slow=0;shake=0;flash=0;fx=[];rings=[];LN=[];onlineMatchId=null;onlineMatchRecordId=null;onlineOpponentId=null;onlineRemoteInput={};onlinePendingPulses={};onlineRoomReady=false;onlinePicksStarted=false;onlineResultSubmitted=false;onlineLocalSide=0;for(const k in K)K[k]=0;for(const k in P)delete P[k];cfg.mode='versus';menu();
}
