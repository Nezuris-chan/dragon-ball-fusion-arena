// ---- État ----
let cfg={mode:'versus',diff:1,ar:0,p1:0,p2:1},G=null,fx=[],shake=0,slow=0,flash=0,stage=0,keyDefault=0;
const ATK={li:{d:6,s:2,a:4,r:5,rg:62,kb:3,ki:4},he:{d:14,s:7,a:5,r:13,rg:78,kb:11,ki:8},hc:{d:30,s:6,a:8,r:20,rg:118,kb:19,ki:14}};
class F{constructor(c,x,side,ai){this.c=CH[c];this.x=x;this.y=GY;this.vx=0;this.vy=0;this.face=side;this.rpgSide=side;this.hp=this.mhp=HPB*(this.c.hb||1)*(1+(this.rpg.du||0)*.004);this.ki=30;this.st='i';this.t=0;this.jc=0;this.tf=0;this.ai=ai;this.combo=0;this.ct=0;this.hit=0;this.inv=0;this.cd=0;this.atk=null;this.rc=0;this.heHold=0;this.heReady=0;this.charged=0;this.dashCd=0;this.chainStep=0;this.chainWindow=0;this.comboStep=0;this.comboMult=1;this.finisher=0;this.guardParry=0;this.guardMeter=100;this.guardBreak=0;this.runTicks=0;this.dashTime=0;this.dashDir=side;this.airDashUsed=0}
get itemStats(){const r=equippedRelic(),local=cfg.mode!=='online'&&this===G?.a;return local&&r?r:{damage:1,resist:1}}get rpg(){if(cfg.mode==='online'||this.rpgSide!==1)return{fo:0,vi:0,in:0,du:0,en:0,ed:0,ki:0,te:0};return{fo:skillStatBonus('fo'),vi:skillStatBonus('vi'),in:skillStatBonus('in'),du:skillStatBonus('du'),en:skillStatBonus('en'),ed:skillStatBonus('ed'),ki:skillStatBonus('ki'),te:skillStatBonus('te')}}get pw(){return this.c.pw*this.f$.pw*(1+(this.rpg.fo||0)*.006)}get sp(){return this.c.sp*this.f$.sp*(1+(this.rpg.vi||0)*.002)*(this.kk?KK[this.kk-1].s:1)}get f$(){return this.c.fm[this.fm|0]||this.c.fm[0]}get bn(){let b=1+(this.cn>0?.3:0)+(this.kk?KK[this.kk-1].d-1:0)+(this.c.n==='Bardock'&&this.hp<(this.mhp||HPB)*.3?.25:0);b+=((this.rpg.te||0)*.002);if(this.f$.ego)b+=egoB((this.eg||0)/(this.mhp||HPB));if(this.c.n==='Broly')b+=(this.rage||0)*.004;return b}
}
function start(){
if(cfg.mode==='adventure'){
 const mission=adventureMissionById(adventureState().activeMission),rule=mission&&adventureTimelineForMission(mission.id);
 if(mission&&rule){
  if(!rule.fighters.includes(CH[cfg.p1]?.n)){const hero=CH.findIndex(c=>c.n===mission.hero);cfg.p1=rule.fighters.includes(CH[hero]?.n)?hero:CH.findIndex(c=>c.n===rule.fighters[0]);}
  const enemy=CH.findIndex(c=>c.n===mission.enemy);if(enemy>=0)cfg.p2=enemy;
  cfg.sf=Math.min(Math.max(0,Number(cfg.sf)||0),adventureMaxFormIndex(CH[cfg.p1]?.n,mission.id));
 }
}
G={a:new F(cfg.p1,260,1,false),b:new F(cfg.p2,700,-1,cfg.mode!=='versus'&&cfg.mode!=='online'),pr:[],time:99,over:0,tick:0,stage:0};G.a.px=G.a.x;G.a.py=G.a.y;G.b.px=G.b.x;G.b.py=G.b.y;
if(cfg.mode==='train'){G.b.dummy=1}if(cfg.mode!=='versus'&&cfg.mode!=='train'&&cfg.mode!=='online'){G.b.c=CH[(cfg.p2+stage)%CH.length];G.b.hp=G.b.mhp=HPB*(G.b.c.hb||1)}
M.style.display='none';fx=[];rings=[];LN=[];music(MU,cfg.mode==='adventure'?'adventure':cfg.mode==='story'?'story':'battle');}
function spark(x,y,col,n,s=6){if(LOW)n=Math.ceil(n/3);n=Math.min(n,LOW?8:14);for(let i=0;i<n&&fx.length<(LOW?70:150);i++){const a=Math.random()*6.28,v=Math.random()*s;fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:20+Math.random()*20,col,r:2+Math.random()*3})}}
function doAtk(f,o,t){if(f.st!=='i'&&f.st!=='r')return;if((t==='li'||t==='he')&&f.ct>0&&f.combo>=10){G.ann={t:28,s:'LIMITE DE 10 COUPS',c:'#fd6'};return}
// Chaîne de coups : les frappes légères ouvrent une fenêtre de combo,
// puis le lourd ou le spécial peuvent servir de finisher/cancel.
const chained=f.chainWindow>0&&f.chainStep>0;
const techBonus=f.c.techComboMult||1;
if(t==='li'){f.comboStep=chained?Math.min(4,f.chainStep+1):1;f.comboMult=[1,1.08,1.16,1.28][f.comboStep-1]*(f.comboStep>1?techBonus:1);f.finisher=0}
else if(t==='he'){f.comboStep=0;f.finisher=chained&&f.chainStep>=2?1:0;f.comboMult=(f.finisher?1.24:1)*(f.finisher?techBonus:1)}
else if(t==='sp'){f.comboStep=0;f.finisher=chained&&f.chainStep>=2?2:0;f.comboMult=(f.finisher?1.28:1)*techBonus;if(f.finisher)G.ann={t:58,s:'COMBO SPÉCIAL !',c:'#7df',big:true}}
else if(t==='ul'){f.comboStep=0;f.finisher=chained&&f.chainStep>=3?3:0;f.comboMult=(f.finisher?1.38:1)*techBonus;if(f.finisher)G.ann={t:72,s:'COMBO ULTIME !',c:'#fd6',big:true}}
else{f.comboStep=0;f.finisher=0;f.comboMult=1}
f.st='a';f.mvFired=0;f.ultBreaks=0;f.charged=t==='he'&&!!f.heCharged;f.atk=ATK[f.charged?'hc':t];f.av=f.ct>0?((f.av|0)+1)%3:0;f.t=0;f.hit=0;f.at=t;if(f.finisher){G.ann={t:55,s:'FINISHER DE COMBO !',c:'#fd6',big:true};spark(f.x,f.y-60,'#fd6',18,8)}if(f.charged){G.ann={t:65,s:'ATTAQUE LOURDE CHARGÉE !',c:'#fd6',big:true};spark(f.x,f.y-60,'#fd6',26,10);ring(f.x,f.y-60,'#fd6',100)}snd(t=='he'?160:300,.1,'sawtooth')}
function dmg(v,a,n,kb,stun){if(v.inv>0||v.hp<=0)return false;
// Une attaque légère ne peut pas interrompre une transformation en cours.
if(v.st==='t'&&a.at!=='he')return false;
// Garde parfaite : une fenêtre courte au début de la garde repousse l'attaquant.
if(v.st==='b'&&v.guardParry>0&&((v.face>0)===(a.x>v.x))){v.guardParry=0;v.counterBoost=1;v.ki=Math.min(100,v.ki+12);a.st='h';a.t=0;a.stun=20+(v.c.parryBonus||0)+Math.floor((v.rpg.in||0)*.05);a.vx=(a.x>v.x?1:-1)*10;a.vy=-2;G.ann={t:65,s:'CONTRE PARFAIT !',c:'#8ff',big:true};spark(v.x+v.face*28,v.y-60,'#8ff',24,10);ring(v.x+v.face*28,v.y-60,'#8ff',95);shake=Math.max(shake,10);snd(820,.12,'triangle');return false}
if(v.st==='a'&&v.at==='ul'&&a!==v){const heavy=a.at==='he',strength=(n/(a.at==='sp'||a.at==='ul'?54:42))*(a.at==='sp'||a.at==='ul'?1.15:1),threshold=(v.mv?.d||55)*.78;if(heavy)v.ultBreaks=(v.ultBreaks||0)+1;const clash=(!heavy&&strength>=threshold)||v.ultBreaks>=2||a.charged;if(clash){v.mv=null;v.at=null;v.atk=null;v.st='i';v.t=0;v.ultBreaks=0;G.pr=G.pr.filter(p=>p.o!==v);if(a.st==='a'){a.mv=null;a.at=null;a.atk=null;a.st='i';a.t=0;G.pr=G.pr.filter(p=>p.o!==a)}G.ann={t:85,s:'CHOC D’ULTIMES — ANNUlation !',c:'#fd6',big:true};spark(v.x,v.y-60,'#fd6',34,12);ring(v.x,v.y-60,'#fd6',130);shake=Math.max(shake,16);return false}}if(v.ui>0&&v.f$.ui){v.ui--;v.inv=24;v.cn=45;ghostAt(v);v.st='d';v.t=0;spark(v.x,v.y-60,'#fff',10);ring(v.x,v.y-60,'#cde',70);snd(1000,.08,'sine');return false}const isSpec=(a.at==='sp'||a.at==='ul');
const statOff=isSpec?(a.c.enMult||1):(a.c.pw||1);
const parryCtr=a.counterBoost?1.25:1;
a.counterBoost=0;
let d=n*0.72*statOff*(1+(a.rpg.en||0)*0.006)*Math.pow(a.f$.pw,.85)*a.bn*parryCtr*(1-v.f$.res)*(1-(v.c.br||0))/Math.pow(v.f$.pw,.55)*(a.comboMult||1)*(a.itemStats?.damage||1)*(v.itemStats?.resist||1)/(1+(v.rpg.du||0)*0.004);
if(v.st==='b'&&v.guardBreak<=0&&((v.face>0)==(a.x>v.x))){d*=.15;v.vx=-v.face*Math.max(2,kb*.7);a.vx=-v.face*Math.max(3,kb*.55);a.st='h';a.t=0;a.stun=7;v.guardMeter=Math.max(0,v.guardMeter-(a.at==='he'?20:(a.at==='sp'||a.at==='ul'?24:11)));if(v.guardMeter<=0){v.guardBreak=72;v.guardMeter=30;v.st='h';v.t=0;v.stun=34;v.vx=-v.face*8;G.ann={t:60,s:'GARDE BRISÉE !',c:'#f66',big:true};spark(v.x,v.y-60,'#f66',24,10);ring(v.x,v.y-60,'#f66',100)}spark(v.x+v.face*30,v.y-60,'#9ff',8);snd(120,.1,'triangle');v.ki=Math.min(100,v.ki+3);}
else{v.st='h';v.t=0;v.stun=stun;v.vx=(v.x>a.x?1:-1)*kb;v.vy=-3;a.combo++;a.ct=82;shake=Math.max(shake,kb);spark(v.x,v.y-60,'#ff8',12);ring(v.x,v.y-60,'#ffe',24+kb*3);G.hst=Math.max(G.hst||0,n>10?5:3);snd(90,.15,'sawtooth',.08);
// Une quatrième frappe légère projette l'adversaire ; lourd/spécial terminent la chaîne.
if(a.at==='li'){a.chainStep=Math.max(1,a.comboStep||1);a.chainWindow=38;if(a.chainStep>=4){v.vy=-8;v.stun+=8;ring(v.x,v.y-60,'#fff',70);spark(v.x,v.y-70,'#fff',18,9);G.ann={t:38,s:'LANCEMENT !',c:'#fff'}}}
else if(a.at==='he'){if(a.finisher){v.vy=-5;v.stun+=5;shake=Math.max(shake,14);ring(v.x,v.y-60,'#fd6',82)}a.chainWindow=0;a.chainStep=0}
else if(a.at==='sp'||a.at==='ul'){a.chainWindow=0;a.chainStep=0}
if(a.cd2==undefined){}}
if(!G.b.dummy||v!==G.b||!cfgNoDmg)v.hp=Math.max(0,v.hp-d);if((cfg.mode==='train'||cfg.mode==='story')&&a===G.a)dmgPop(v,d);if(v.f$.ego)v.eg=(v.eg||0)+d;if(v.c.n==='Broly')v.rage=Math.min(100,(v.rage||0)+d*.008);if(a.c.n==='Broly')a.rage=Math.min(100,(a.rage||0)+d*.005);a.ki=Math.min(100,a.ki+(n>10?6:3));return true}
let cfgNoDmg=false;
function ultFx(f){slow=70;flash=14;G.fz=60;shake=14;G.cin=80;G.cinc=f.mv?f.mv.c:'#ffffff';G.cinx=f.x}
function ctrl(f,o,i){let c;if(cfg.mode==='online'){const local=(onlineLocalSide===0&&f===G.a)||(onlineLocalSide===1&&f===G.b);c=local?humIn(0):{...(onlineRemoteInput||{})}}else if(f.ai){c=aiIn(f,o)}else c=humIn(f===G.a?0:1);return c}
function aiIn(f,o){
 const c={},d=Math.abs(o.x-f.x),df=Math.max(0,Math.min(2,Number(cfg.diff)||0)),iq=Math.max(.1,Math.min(1,(Number(f.c.st?.in)||35)/100));
 if(f.dummy||G.b.dummy&&f===G.b)return c;
 f.ar=f.ar||0;
 if(--f.ar>0){const p=f.last||{};return {l:!!p.l,r:!!p.r,d:!!p.d,b:!!p.b,ch:!!p.ch,he:!!p.he}}
 f.ar=Math.max(4,Math.round([17,10,5][df]*(1.18-iq*.25)));
 const rand=Math.random,ready=f.st==='i'||f.st==='r'||f.st==='b',ground=f.y>=GY-1;
 const canDash=f.dashCd<=0,canDodge=f.cd<=0,canTransform=f.ki>=50&&(f.fm|0)<mfm(f);
 const canSpecial=f.ki>=mc(f,0),canAlt=f.ki>=mc(f,1),canUltimate=f.ki>=mc(f,2);
 const facing=(o.x-f.x)*f.face>0,opponentInRange=d<Math.max(82,(o.atk?.rg||70)*1.22);
 const meleeThreat=o.st==='a'&&facing&&opponentInRange&&(o.at==='li'||o.at==='he')&&o.t<=((o.atk?.s||8)+(o.atk?.a||5)+3);
 const projectileThreat=(G.pr||[]).some(p=>p.o===o&&p.l>0&&Math.abs(p.x-f.x)<Math.max(125,(p.m?.w||30)*1.5)&&Math.abs(p.y-(f.y-60))<105);
 const danger=meleeThreat||projectileThreat||o.st==='a'&&o.at==='ul'&&d<245;
 const opponentBusy=o.st==='a'||o.st==='h'||o.st==='t'||o.chg;
 const opponentRecovering=o.st==='h'||o.st==='t'||o.st==='d';
 f.aiParryCd=Math.max(0,(f.aiParryCd||0)-1);
 f.aiPlanCd=Math.max(0,(f.aiPlanCd||0)-1);
 // Défense réactive : esquive les ultimes et projectiles, pare les coups proches.
 if(danger&&ready){
  if(df===2&&canDodge&&d<88&&f.ki>=10&&rand()<.16){c.tpP=1;f.aiParryCd=3}
  else if(df>=1&&canDodge&&rand()<(.48+iq*.28+df*.06)){c.dgP=1;f.aiParryCd=3}
  else if(df===2&&canDodge&&projectileThreat&&rand()<.72){c.dgP=1}
  else{c.b=1;if(!f.aiParryCd&&meleeThreat){c.bP=1;f.aiParryCd=3}}
  f.last=c;return c;
 }
 if(canTransform&&((df===0&&f.ki>78&&d>145)||(df===1&&f.ki>62)||(df===2&&f.ki>53&&(!opponentBusy||f.hp<f.mhp*.72)))&&rand()<(.45+iq*.4)){c.trP=1;f.last=c;return c}
 if(canUltimate&&d>95&&d<390&&ready&&(opponentRecovering||opponentBusy&&df===2||f.combo>=4)&&rand()<(.12+df*.19+iq*.2)){c.ulP=1;f.last=c;return c}
 if(f.ki<32&&d>205){c.ch=1;if(d>290)c[o.x>f.x?'r':'l']=1;f.last=c;return c}
 if(f.aiHeavyActive){
  if(f.heReady){f.aiHeavyActive=0;c.he=0;f.last=c;return c}
  else{c.he=1;if(d>185)c[o.x>f.x?'r':'l']=1;f.last=c;return c}
 }
 if(!f.aiHeavyActive&&df>=1&&ground&&canDash&&d>125&&d<220&&(opponentRecovering||o.chg||o.ch)&&f.ki>20&&rand()<(.18+df*.18+iq*.16)){f.aiHeavyActive=1;c.he=1;f.last=c;return c}
 if(d>255){
  c[o.x>f.x?'r':'l']=1;
  if(canDash&&rand()<(.28+df*.2+iq*.12))c.dsP=1;
  if(canSpecial&&d<390&&rand()<(.12+df*.12+iq*.1))c.spP=1;
  if(f.ki<45&&rand()<.45)c.ch=1;
 }else if(d>145){
  if(d>205)c[o.x>f.x?'r':'l']=1;
  else if(df===0&&rand()<.35)c[o.x>f.x?'r':'l']=1;
  if(canSpecial&&rand()<(.12+df*.12+iq*.12))c.spP=1;
  if(canDash&&o.st==='r'&&rand()<(.12+df*.18))c.dsP=1;
  if(f.ki<28&&rand()<.2)c.ch=1;
 }else if(d>88){
  if(o.st==='h'||o.st==='t'||o.chg)c[o.x>f.x?'r':'l']=1;
  else if(df===0&&rand()<.22)c[o.x>f.x?'r':'l']=1;
  if(canAlt&&rand()<(.12+df*.16+iq*.12))c.spP=1;
  else if(canSpecial&&rand()<(.08+df*.12+iq*.1))c.spP=1;
  if(canDash&&df===2&&rand()<.12)c.dsP=1;
 }else{
  if(opponentRecovering){c.liP=1;if(f.chainWindow>0&&f.chainStep>=2&&rand()<.55)c.heP=1}
  else if(f.chainWindow>0&&f.chainStep>=2&&rand()<(.38+df*.16+iq*.18))c.heP=1;
  else if(rand()<(.48+df*.1+iq*.12))c.liP=1;
  else c.heP=1;
  if(canSpecial&&f.ki>38&&rand()<(.1+df*.09+iq*.12))c.spP=1;
  if(o.combo>=3&&canDodge&&rand()<(.16+df*.18))c.dgP=1;
  if(!c.dgP&&rand()<(.04+df*.06))c.b=1;
 }
 if(o.chg&&d<225&&canDash)c.dsP=rand()<(.25+df*.2)?1:c.dsP;
 if(df===2&&d<100&&o.st==='i'&&f.guardMeter>65&&rand()<.08)c.b=1;
 f.last=c;return c
}
function blinkAwayX(f,o){const dist=110,back=o.face||1;let x=o.x-back*dist;if(x<45||x>W-45)x=o.x+back*dist;return Math.max(45,Math.min(W-45,x))}
function upd(f,o,c){kaio(f,c);
if(f.st==='a'||f.st==='h'||f.st==='d'){
const pressed=c.ulP?'ul':c.spP?'sp':c.heP?'he':c.liP?'li':null;
if(pressed)f.inputBuffer={k:pressed,down:!!c.d,until:G.tick+10};
}
anim(f);if(f.dashCd>0)f.dashCd--;if(f.chainWindow>0){f.chainWindow--;if(f.chainWindow===0)f.chainStep=0}if(f.guardParry>0)f.guardParry--;if(c.bP&&f.y>=GY-1&&f.st!=='h'&&f.st!=='a')f.guardParry=7+(f.c.parryBonus||0);if(c.he){f.heHold=Math.min(180,f.heHold+1);if(f.heHold>=120)f.heReady=1;c.heP=0}else if(f.heHold>0){c.heP=1;f.heCharged=!!f.heReady;f.heHold=0;f.heReady=0}else f.heCharged=0;f.ct>0&&--f.ct<=0&&(f.combo=0);f.inv>0&&f.inv--;f.cd>0&&f.cd--;f.cn>0&&f.cn--;if(f.tf>0&&--f.tf<=0){const q=(f.stk||(f.stk=[])).pop()||{fm:0,tf:0};applyForm(f,q.fm);f.tf=q.tf;spark(f.x,f.y-60,f.f$.au,12,6);ring(f.x,f.y-60,'#fff',80)}
if(f.tf>0&&G.tick%6==0){const nm=f.f$.n,high=['Super Saiyan God','Super Saiyan Blue','Blue Evolution','Ultra Instinct','Ultra Instinct maîtrisé','Ultra Ego','Super Saiyan Rosé','Godslayer','Destruction','Golden Freezer','Black Freezer','Beast','Piccolo Orange','Cell Max','Full Power'].includes(nm);f.ki=Math.max(0,f.ki-(high?.12:.45));}
const g=f.y>=GY;if(!g){f.vy+=c.d?1.05:(f.vy<0&&c.j?.42:.62);f.vy=Math.min(14,f.vy)}else{f.vy=0;f.y=GY;f.jc=0;f.airDashUsed=0}
if(f.st==='h'){if(++f.t>f.stun)f.st='i'}
else if(f.st==='a'){f.t++;const a=f.atk;if(f.at==='ul'&&!f.mvFired){const dir=(c.r?1:0)-(c.l?1:0);if(dir){f.x+=dir*f.sp*.48;f.x=Math.max(30,Math.min(W-30,f.x))}}if(f.at==='sp'){fireMv(f)}
else if(f.at==='ul'){fireMv(f)}
else{const spdM=f.c.atkSpd||1,sF=Math.max(1,Math.round(a.s/spdM)),aF=Math.max(2,Math.round(a.a/spdM)),rF=Math.max(3,Math.round(a.r/spdM));if(f.t>sF&&f.t<=sF+aF&&!f.hit&&Math.abs(o.x-f.x)<a.rg*(f.c.lk.rg||1)&&Math.abs(o.y-f.y)<70&&(o.x-f.x)*f.face>0){if(dmg(o,f,a.d*42*(f.c.lk.pm||1),a.kb,a.r+10+(f.c.techStunBonus||0)))f.hit=1}if(f.t>sF+aF+rF)f.st='i'}}
else if(f.st==='d'){f.t++;if(f.t>14){f.st='i';f.inv=0}}
else if(f.st==='t'){if(f.t===0){shake=5;flash=3;snd(250,.22,'sawtooth',.045)}if(++f.t>(f.c.n==='Beerus'?55:40)){f.st='i';(f.stk||(f.stk=[])).push({fm:f.fm|0,tf:f.tf});applyForm(f,(f.fm|0)+1);f.tf=Number.isFinite(f.f$.dur)?Math.max(0,f.f$.dur):0;if(f.f$.ui)f.ui=5;spark(f.x,f.y-60,'#fff',22,9);ring(f.x,f.y-60,'#fff',110);flash=10;snd(700,.5,'sine',.08)}spark(f.x,f.y-60,f.c.tA,3,8)}
if(f.st==='i'||f.st==='b'||f.st==='r'){const guarding=!!(c.b&&g&&f.guardBreak<=0);f.st=guarding?'b':'i';f.chg=c.ch&&g?1:0;f.cr=c.d&&g?1:0;if(f.guardBreak>0){f.guardBreak--;f.vx*=.55;f.runTicks=0}else if(guarding){f.vx*=.35;f.runTicks=0;f.guardMeter=Math.max(0,f.guardMeter-.025)}else{f.guardMeter=Math.min(100,(f.guardMeter||0)+.55);if(f.chg){const tier=Math.max(0,f.fm|0),chargeRate=.45*(1+tier*.22);f.ki=Math.min(100,f.ki+chargeRate*(f.c.kiRegenMult||1)*(1+(f.rpg.ki||0)*.006));if(G.tick%3==0)spark(f.x+(Math.random()-.5)*40,f.y-8,f.f$.au,1,2)}if(c.dsP&&f.dashCd<=0&&(g||!f.airDashUsed)){const dir=(c.l||c.r)?((c.r?1:0)-(c.l?1:0)):f.face;f.dashDir=dir||f.face;f.dashTime=g?9:8;f.airDashUsed=!g;f.vx=f.dashDir*Math.max(g?14:12,f.sp*(g?2.7:2.35));f.vy=g?f.vy:Math.min(f.vy,0);f.inv=Math.max(g?4:3,(g?5:3)+(f.c.dodgeBonus||0));f.dashCd=Math.max(g?20:28,Math.round((g?32:42)*((f.c.cdMult||1)/(1+(f.rpg.ed||0)*.004))));f.runTicks=0;f.st='r';ghostAt(f);spark(f.x,f.y-60,f.f$.au,14,8);ring(f.x,f.y-60,f.f$.au,58);snd(720,.09,'sine',.06)}if(f.dashTime>0){f.dashTime--;f.vx=f.dashDir*Math.max(8,f.sp*2.35)*(0.88+f.dashTime*.012);f.st='r'}else{const dir=(c.r?1:0)-(c.l?1:0);if(dir&&!f.cr){f.runTicks=Math.min(60,(f.runTicks||0)+1);const speed=f.sp*(g?(f.runTicks>9?1.35:1):.82);f.vx+=(dir*speed-f.vx)*(g?.24:.14);f.st='r'}else{f.runTicks=0;f.vx*=g?.72:.94;if(Math.abs(f.vx)<.15)f.vx=0}}}if(f.st!=='b'&&f.guardBreak<=0){
if(c.jP&&f.jc<2){f.vy=-11.5;f.jc++;snd(400,.08,'sine')}
if(f.st!=='b'){if(c.liP)doAtk(f,o,'li');else if(c.heP&&c.d&&MVS[f.c.n][3]&&f.ki>=mc(f,3)){f.ki-=mc(f,3);doAtk(f,o,'sp');f.at='sp';f.mv=MV(f,3)}else if(c.heP)doAtk(f,o,'he');
else if(c.spP&&f.ki>=mc(f,c.d?1:0)){const mi=c.d?1:0;f.ki-=mc(f,mi);doAtk(f,o,'sp');f.at='sp';f.mv=MV(f,mi);snd(260,.35,'triangle',.04)}
else if(c.ulP&&f.ki>=mc(f,2)){f.ki-=mc(f,2);f.st='a';f.at='ul';f.t=0;f.atk=1;f.mv=MV(f,2);snd(180,.7,'triangle',.05);ultFx(f)}
else if(c.trP&&f.ki>=50&&(f.fm|0)<mfm(f)){f.ki-=50;f.st='t';f.t=0}
else if(c.tpP&&f.ki>=10&&f.cd<=0){f.ki-=10;f.st='d';f.t=0;f.inv=Math.max(10,12+(f.c.dodgeBonus||0));f.cd=Math.max(22,Math.round(45*(f.c.cdMult||1)));ghostAt(f);spark(f.x,f.y-60,'#9ff',14);ring(f.x,f.y-60,'#9ff',60);f.x=blinkAwayX(f,o);spark(f.x,f.y-60,'#9ff',14);ring(f.x,f.y-60,'#9ff',60);snd(900,.1,'sine')}else if(c.dgP&&f.cd<=0){f.st='d';f.t=0;f.inv=Math.max(12,16+(f.c.dodgeBonus||0));f.cd=Math.max(20,Math.round(40*(f.c.cdMult||1)));ghostAt(f);spark(f.x,f.y-60,'#fff',10);snd(800,.1,'sine')}}}}
if(f.inputBuffer){
const q=f.inputBuffer;
if(G.tick>q.until)f.inputBuffer=null;
else if(f.st==='i'||f.st==='r'){
if(q.k==='li'){doAtk(f,o,'li');if(f.st==='a')f.inputBuffer=null}
else if(q.k==='he'){doAtk(f,o,'he');if(f.st==='a')f.inputBuffer=null}
else if(q.k==='sp'&&f.ki>=mc(f,q.down?1:0)){
const mi=q.down?1:0;f.ki-=mc(f,mi);doAtk(f,o,'sp');if(f.st==='a'){f.at='sp';f.mv=MV(f,mi);f.inputBuffer=null}
}
else if(q.k==='ul'&&f.ki>=mc(f,2)){
f.ki-=mc(f,2);f.st='a';f.at='ul';f.t=0;f.atk=1;f.mv=MV(f,2);snd(180,.7,'triangle',.05);ultFx(f);f.inputBuffer=null;
}
}
}
if(f.st!=='h'&&f.st!=='a'||f.st==='h')f.x+=f.vx;if(f.st==='a')f.x+=f.vx*.2;f.vx*=f.dashTime>0?1:(f.st==='h'?.92:1);f.y+=f.vy;f.x=Math.max(30,Math.min(W-30,f.x));if(f.y>GY)f.y=GY}
function upProj(){for(const p of G.pr){p.x=p.tg?p.tg.x-Math.sign(p.vx)*30:p.x+p.vx;p.y+=p.vy||0;p.l--;if(p.ul)shake=Math.max(shake,5);const v=p.o===G.a?G.b:G.a;if(p.m.trk)p.x+=(v.x-p.x)*.08;if(!(p.cd>0&&p.cd--)&&!(p.wait>0&&p.wait--)&&v.inv<=0&&Math.abs(p.x-v.x)<(p.m.w*.8+14)&&Math.abs(p.y-(v.y-60))<(p.m.w*.8+30)){if(!dmg(v,p.o,p.d*(p.ul?54:58),p.ul?16:8,p.ul?40:20+(p.o.c.techStunBonus||0)))continue;if(p.m.mh&&(p.mh=(p.mh==null?p.m.mh:p.mh)-1)>0){p.cd=7;p.l=Math.max(p.l,40);p.vx=Math.sign(p.vx)*.1;p.tg=v;spark(p.x,p.y,p.m.c,8,6);ring(p.x,p.y,p.m.c,40);continue}p.l=0;spark(p.x,p.y,'#fff',30,10);ring(p.x,p.y,p.m.c,p.m.imp);if(p.ul){ring(p.x,p.y,'#fff',p.m.imp*.6);spark(p.x,p.y,p.m.c,40,14);shake=22}if(['sphere','genki','nova','planet','hakai','meteor','fireball','volcano','rain','stardust'].includes(p.m.sh)){ring(p.x,p.y,p.m.c,p.m.imp*1.3);flash=12}else if(p.m.sh==='wave')ring(p.x,p.y+40,p.m.c,p.m.imp*1.2);flash=p.ul?8:0;snd(70,.3,'sawtooth',.1)}
if(p.x<0||p.x>W||p.y>GY+90)p.l=0}G.pr=G.pr.filter(p=>p.l>0)}
function step(){G.tick++;const a=G.a,b=G.b;a.px=a.x;a.py=a.y;b.px=b.x;b.py=b.y;if(G.over){return}
a.face=b.x>=a.x?1:-1;b.face=a.x>=b.x?1:-1;const ca=ctrl(a,b),cb=b.dummy?{}:ctrl(b,a);if(cfg.mode==='online'&&onlineRoomChannel&&onlineRoomReady){const localInput=onlineLocalSide===0?ca:cb;for(const k of onlinePulseKeys)if(localInput[k])onlinePendingPulses[k]=1;if(G.tick%2===0){const packet={...localInput,...onlinePendingPulses};onlinePendingPulses={};const seq=++onlineInputSeq;onlineRoomChannel.send({type:'broadcast',event:'input',payload:{from:onlineUser.id,seq,input:packet}}).then(status=>{if(status!=='ok'){console.warn('Envoi des commandes en ligne échoué',status);onlinePendingPulses={...packet,...onlinePendingPulses}}}).catch(e=>{console.warn('Envoi des commandes en ligne impossible',e);onlinePendingPulses={...packet,...onlinePendingPulses}})}}if(G.fz>0){G.fz--;}
upd(a,b,ca);upd(b,a,cb);sep(a,b);upProj();if(G.tick%60==0&&G.time>0&&cfg.mode!=='train')G.time--;
if(cfg.mode==='train'){b.hp=b.mhp||HPB;a.hp=a.mhp||HPB}
if(a.hp<=0||b.hp<=0||G.time<=0){G.over=1;G.ot=0;G.win=a.hp<=0&&b.hp>0?b:b.hp<=0&&a.hp>0?a:(a.hp/(a.mhp||HPB)>=b.hp/(b.mhp||HPB)?a:b);slow=60;
if(!G.win.ai&&!G.win.dummy||cfg.mode==='versus'){}
if(cfg.mode==='online'&&!G.reported){G.reported=true;setTimeout(onlineResultConfirmMenu,350)}else if(cfg.mode==='online-ai'&&!G.reported){G.reported=true;alert(G.win===a&&b.hp<=0&&a.hp>0?'Entraînement terminé : victoire contre l’IA. Les points de classement sont réservés aux duels entre joueurs.':'Entraînement terminé : réessaie pour progresser.')}else if(cfg.mode!=='versus'&&cfg.mode!=='online'&&cfg.mode!=='online-ai'){if(G.win===a){sv.w++;sv.xp+=50+20*cfg.diff;sv.rp=(sv.rp||0)+20+10*cfg.diff}else{sv.l++;sv.xp+=10;sv.rp=Math.max(0,(sv.rp||0)-8)}if(cfg.mode==='story')storyEnd(G);save()}if(cfg.mode!=='train'&&cfg.mode!=='online'&&cfg.mode!=='online-ai'){recordAdventureBattle(G.win===a,cfg.mode,cfg.diff);const rewards=recordDailyBattle(G.win===a,cfg.mode==='story');if(rewards.length)console.info('Récompenses des quêtes quotidiennes :',rewards)}}}
