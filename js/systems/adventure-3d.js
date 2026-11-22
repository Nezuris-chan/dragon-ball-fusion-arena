/* Monde 3D temps réel de Fusion Arena — Three.js r128 */
function adventureWalk3D(opts){
 if(!window.THREE||!opts||!opts.canvas)return null;
 const probe=document.createElement('canvas');
 if(!(probe.getContext('webgl2')||probe.getContext('webgl')||probe.getContext('experimental-webgl')))return null;
 const T=window.THREE,{canvas,world,walls,points,pickups,onPickup,onNear,onCounter}=opts;
 let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'})}catch(e){return null}
 const W=960,H=540;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setSize(W,H,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 const scene=new T.Scene();scene.background=new T.Color('#9bc9d8');scene.fog=new T.FogExp2('#a9cbd1',.00048);
 const camera=new T.PerspectiveCamera(48,W/H,.1,3600);camera.position.set(0,460,620);
 const toX=x=>x-world.w/2,toZ=y=>y-world.h/2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const hemi=new T.HemisphereLight('#e8f8ff','#304a35',1.35);scene.add(hemi);
 const sun=new T.DirectionalLight('#fff0d1',2.1);sun.position.set(-360,760,420);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-1150;sun.shadow.camera.right=1150;sun.shadow.camera.top=900;sun.shadow.camera.bottom=-900;sun.shadow.bias=-.00025;scene.add(sun);
 const groundCanvas=document.createElement('canvas');groundCanvas.width=512;groundCanvas.height=512;const gx=groundCanvas.getContext('2d');gx.fillStyle='#547d50';gx.fillRect(0,0,512,512);
 let seed=173;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<15000;i++){const x=rnd()*512,y=rnd()*512,r=1+rnd()*2.8;gx.fillStyle=rnd()>.5?'rgba(181,190,105,.17)':'rgba(20,62,48,.2)';gx.beginPath();gx.ellipse(x,y,r,r*.55,rnd(),0,Math.PI*2);gx.fill()}
 const groundTex=new T.CanvasTexture(groundCanvas);groundTex.wrapS=groundTex.wrapT=T.RepeatWrapping;groundTex.repeat.set(5,4);groundTex.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const ground=new T.Mesh(new T.PlaneGeometry(world.w,world.h),new T.MeshStandardMaterial({map:groundTex,color:'#c5d7a4',roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 const mat=(color,roughness=.88,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const grassMats=['#5f8c57','#6d985d','#47784f','#86a66a'].map(c=>mat(c));
 const pathMat=mat('#c5ad7d'),stoneMat=mat('#687b78'),woodMat=mat('#75543b'),leafMats=['#326c50','#47845a','#6b9857'].map(c=>mat(c));
 const path=new T.Mesh(new T.PlaneGeometry(145,world.h*1.08),pathMat);path.rotation.x=-Math.PI/2;path.position.set(-world.w*.12,.35,0);path.receiveShadow=true;scene.add(path);
 const path2=new T.Mesh(new T.PlaneGeometry(world.w*.82,105),pathMat);path2.rotation.x=-Math.PI/2;path2.position.set(0,.38,toZ(world.h*.56));path2.receiveShadow=true;scene.add(path2);
 const addMesh=(geo,material,x,y,z,shadow=true)=>{const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;scene.add(m);return m};
 const hills=[[-760,90,-430,280,110,250],[-520,55,430,210,65,180],[660,70,-380,300,85,220],[720,80,410,270,100,240],[-40,48,-610,330,55,170]];
 for(const [x,y,z,sx,sy,sz] of hills){const h=addMesh(new T.SphereGeometry(1,24,16),mat('#668d61'),x,y,z);h.scale.set(sx,sy,sz)}
 const buildTree=(x,z,s=1)=>{const trunk=addMesh(new T.CylinderGeometry(8*s,13*s,66*s,8),woodMat,x,33*s,z);trunk.castShadow=true;for(let i=0;i<3;i++){const crown=addMesh(new T.SphereGeometry((34-i*4)*s,12,10),leafMats[i],x+(i%2?9:-8)*s,70*s+i*22*s,z);crown.scale.set(1,.85,1);crown.castShadow=true}};
 for(let i=0;i<74;i++){let x=(rnd()-.5)*(world.w-120),z=(rnd()-.5)*(world.h-120);if(Math.abs(x+world.w*.12)<130||Math.abs(z-toZ(world.h*.56))<110)continue;if(walls.some(o=>Math.abs(x-toX(o.x+o.w/2))<o.w*.7&&Math.abs(z-toZ(o.y+o.h/2))<o.h*.7))continue;buildTree(x,z,.65+rnd()*.75)}
 const addRock=(x,z,s)=>{const r=addMesh(new T.DodecahedronGeometry(18*s,0),stoneMat,x,10*s,z);r.scale.y=.65;r.rotation.set(rnd(),rnd()*2,rnd())};
 for(let i=0;i<52;i++)addRock((rnd()-.5)*(world.w-100),(rnd()-.5)*(world.h-100),.45+rnd()*.85);
 for(const o of walls){const x=toX(o.x+o.w/2),z=toZ(o.y+o.h/2);const base=addMesh(new T.BoxGeometry(o.w,76,o.h),mat('#78877c'),x,38,z);base.castShadow=true;const roof=addMesh(new T.ConeGeometry(Math.max(o.w,o.h)*.68,75,4),mat('#765c48'),x,113,z);roof.rotation.y=Math.PI/4;roof.castShadow=true}
 // Petit sanctuaire qui sert de point de repère au centre du monde
 const shrineX=toX(world.w*.76),shrineZ=toZ(world.h*.28);addMesh(new T.BoxGeometry(190,18,145),stoneMat,shrineX,9,shrineZ);
 for(const x of [-65,65]){addMesh(new T.CylinderGeometry(8,10,110,10),mat('#a75c3d'),shrineX+x,64,shrineZ-35);addMesh(new T.CylinderGeometry(8,10,110,10),mat('#a75c3d'),shrineX+x,64,shrineZ+35)}
 const roof=addMesh(new T.BoxGeometry(220,16,175),mat('#b74d39'),shrineX,125,shrineZ);roof.rotation.y=.08;
 const label=(txt)=>{const c=document.createElement('canvas');c.width=512;c.height=112;const g=c.getContext('2d');g.fillStyle='rgba(5,13,25,.78)';g.strokeStyle='rgba(116,220,255,.72)';g.lineWidth=5;g.beginPath();g.roundRect(4,4,504,104,18);g.fill();g.stroke();g.fillStyle='#effaff';g.font='bold 34px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(txt.slice(0,22),256,56);const texture=new T.CanvasTexture(c);const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.scale.set(170,37,1);return sprite};
 for(const p of points){const x=toX(p.x),z=toZ(p.y);const ring=addMesh(new T.RingGeometry(34,43,36),new T.MeshBasicMaterial({color:'#69e4ff',transparent:true,opacity:.82,side:T.DoubleSide}),x,.8,z,false);ring.rotation.x=-Math.PI/2;const pin=addMesh(new T.CylinderGeometry(2,2,36,8),mat('#65dcff',.3,.4),x,20,z,false);const orb=addMesh(new T.SphereGeometry(8,14,12),mat('#fff0a7',.25,.3),x,42,z,false);const tag=label(p.label);tag.position.set(x,94,z);scene.add(tag)}
 const pickupMat={};for(const item of pickups){if(item.taken)continue;const color=item.color||'#ffb34e';const gemMat=pickupMat[color]||(pickupMat[color]=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.7,metalness:.25,roughness:.28}));const gem=addMesh(new T.OctahedronGeometry(15,1),gemMat,toX(item.x),30,toZ(item.y),false);const halo=addMesh(new T.TorusGeometry(23,1.8,8,32),new T.MeshBasicMaterial({color,transparent:true,opacity:.8}),toX(item.x),10,toZ(item.y),false);halo.rotation.x=Math.PI/2;item.mesh=gem;item.halo=halo}
 // Guerrier stylisé avec tenue, bottes, gants, cheveux en pics et aura discrète
 const player=new T.Group();scene.add(player);const skin=mat('#efbd91'),gi=mat('#e56b28'),undershirt=mat('#243c83'),belt=mat('#e9d8a4'),boot=mat('#263b76'),hair=mat('#172238'),glove=mat('#f0d8b1');
 const part=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;player.add(o);return o};
 const torso=part(new T.CapsuleGeometry(15,26,5,10),gi,0,43,0);torso.scale.set(1,.95,.72);
 part(new T.BoxGeometry(26,7,18),belt,0,28,0);part(new T.SphereGeometry(11,14,12),skin,0,70,0);
 part(new T.SphereGeometry(12,12,10),hair,0,79,-1);
 for(let i=0;i<7;i++){const angle=(i/7)*Math.PI*2,spike=part(new T.ConeGeometry(7,25,7),hair,Math.cos(angle)*8,88,Math.sin(angle)*8);spike.rotation.z=Math.cos(angle)*-.5;spike.rotation.x=Math.sin(angle)*.45}
 for(const side of [-1,1]){const arm=part(new T.CapsuleGeometry(5,20,4,8),gi,side*20,44,0);arm.rotation.z=side*.22;part(new T.SphereGeometry(6,10,8),glove,side*21,30,0);const leg=part(new T.CapsuleGeometry(6,19,4,8),undershirt,side*8,13,0);part(new T.BoxGeometry(13,8,19),boot,side*8,3,2)}
 const aura=new T.Mesh(new T.CylinderGeometry(25,34,3,32,1,true),new T.MeshBasicMaterial({color:'#58dfff',transparent:true,opacity:.24,side:T.DoubleSide}));aura.position.y=3;player.add(aura);
 const state={x:world.w/2,y:world.h/2},keys=new Set();let raf=0,last=0,active=true,near='Explore la zone et cherche des objets cachés.',camX=0,camY=0;
 const collides=(x,y)=>walls.some(o=>x>o.x-24&&x<o.x+o.w+24&&y>o.y-24&&y<o.y+o.h+24);
 const down=e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','z','q'].includes(k)){e.preventDefault();keys.add(k)}},up=e=>keys.delete(e.key.toLowerCase());
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);
 const tick=t=>{if(!active)return;const dt=Math.min(.04,(t-last)/1000||0);last=t;let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a')||keys.has('q'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;if(keys.has('arrowup')||keys.has('w')||keys.has('z'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;const moving=!!(dx||dy);if(moving){const n=Math.hypot(dx,dy);dx/=n;dy/=n;const nx=clamp(state.x+dx*250*dt,28,world.w-28),ny=clamp(state.y+dy*250*dt,28,world.h-28);if(!collides(nx,state.y))state.x=nx;if(!collides(state.x,ny))state.y=ny;player.rotation.y=Math.atan2(dx,-dy)}
 const bob=moving?Math.sin(t*.018)*2.2:Math.sin(t*.002)*.8;player.position.set(toX(state.x),bob,toZ(state.y));player.children.forEach(o=>{if(o.geometry&&o.geometry.type==='CapsuleGeometry'&&o.position.y<20)o.rotation.x=moving?Math.sin(t*.018)*.3:0});aura.material.opacity=.18+Math.sin(t*.006)*.07;
 for(const item of pickups){if(item.taken)continue;item.mesh.rotation.y+=dt*1.5;item.mesh.position.y=30+Math.sin(t*.003+item.x)*5;item.halo.rotation.z+=dt*.7;if(Math.hypot(state.x-item.x,state.y-item.y)<38){item.taken=true;item.mesh.visible=false;item.halo.visible=false;if(onPickup)onPickup(item)}}
 const target=pickups.find(x=>!x.taken&&Math.hypot(state.x-x.x,state.y-x.y)<110),place=points.find(x=>Math.hypot(state.x-x.x,state.y-x.y)<82);near=target?'Objet proche : '+target.name+' — approche-toi !':place?'Lieu découvert : '+place.label+' — ouvre la carte des lieux pour le visiter.':'Explore la zone et cherche des objets cachés.';if(onNear)onNear(near);if(onCounter)onCounter(pickups.filter(x=>x.taken).length,pickups.length);
 const desiredX=player.position.x,desiredZ=player.position.z+360;camX+=(desiredX-camX)*Math.min(1,dt*5);camY+=(desiredZ-camY)*Math.min(1,dt*5);camera.position.set(camX,420,camY);camera.lookAt(player.position.x,15,player.position.z-35);
 renderer.render(scene,camera);raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick);
 return{stop(){active=false;cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);keys.clear();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}});renderer.dispose()}};
}