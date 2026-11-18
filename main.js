import { initCombat, startCombat, stopCombat } from './combat.js';
import { initStory, showSagaChapters, renderCollection, storyState, completeChapter } from './story.js';
import { save } from './save.js';

const screens=[...document.querySelectorAll('.screen')];
export function showScreen(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));}
const characters=['Goku','Vegeta','Gogeta','Vegetto','Broly','Gohan Beast','Freezer'];
const p1=document.querySelector('#p1Select'),p2=document.querySelector('#p2Select');
characters.forEach((name,i)=>{p1.add(new Option(name,name,i===0,i===0));p2.add(new Option(name,name,i===1,i===1));});
function setPreview(select,el){el.dataset.character=select.value;el.setAttribute('aria-label',select.value);}
p1.addEventListener('change',()=>setPreview(p1,document.querySelector('#p1Preview')));p2.addEventListener('change',()=>setPreview(p2,document.querySelector('#p2Preview')));
setPreview(p1,document.querySelector('#p1Preview'));setPreview(p2,document.querySelector('#p2Preview'));
document.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>showScreen(btn.dataset.screen)));
document.querySelector('#storyItemsBtn').addEventListener('click',()=>{renderCollection();showScreen('itemsScreen');});
document.querySelector('#startVersus').addEventListener('click',()=>{showScreen('fightScreen');startCombat({mode:'versus',left:p1.value,right:p2.value});});
document.querySelector('#startTraining').addEventListener('click',()=>{showScreen('fightScreen');startCombat({mode:'training',left:'Goku',right:'Vegeta'});});
document.querySelector('#leaveFight').addEventListener('click',()=>{stopCombat();document.querySelector('#resultPanel').classList.add('hidden');showScreen('menuScreen');});
document.querySelector('#resultContinue').addEventListener('click',()=>{
 const next=window.__nextStoryChapter;
 stopCombat();document.querySelector('#resultPanel').classList.add('hidden');
 if(next){completeChapter(next.sagaId,next.chapterId);window.__nextStoryChapter=null;showSagaChapters(next.sagaId);showScreen('chapterScreen');}
 else showScreen('menuScreen');
});
document.querySelector('#soundBtn').addEventListener('click',e=>{e.currentTarget.classList.toggle('muted-sound');e.currentTarget.textContent=e.currentTarget.classList.contains('muted-sound')?'×':'♫';});
initCombat();initStory({showScreen,startStoryFight:(saga,chapter)=>{window.__nextStoryChapter={sagaId:saga.id,chapterId:chapter.id};showScreen('fightScreen');startCombat({mode:'story',left:'Goku',right:chapter.enemy||'Vegeta',chapter});}});
