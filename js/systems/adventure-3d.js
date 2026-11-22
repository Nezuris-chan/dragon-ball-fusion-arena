/* Exploration 3D de l'Aventure. Retourne null si WebGL/Three.js ne sont pas disponibles. */
function adventureWalk3D(opts){
 if(!window.THREE||!opts||!opts.canvas)return null;
 const probe=document.createElement('canvas');
 if(!(probe.getContext('webgl')||probe.getContext('experimental-webgl')))return null;
 const T=window.THREE,{canvas,world,walls,points,pickups,onPickup,onNear,onCounter}=opts;
 let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false})}catch(e){return null}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(960,540,false);
 const scene=new T.Scene();scene.background=new T.Color('#183e43');scene.fog=new T.Fog('#183e43',900,2200);
 const camera=new T.PerspectiveCamera(50,960/540,1,3500),toX=x=>x-world.w/2,toZ=y=>y-world.h/2;
 scene.add(new T.HemisphereLight('#dff7ff','#24402f',1));
 const sun=new T.DirectionalLight('#fff3d6',.9);sun.position.set(400,900,300);scene.add(sun);
 const ground=new T.Mesh(new T.PlaneGeometry(world.w,world.h),new T.MeshStandardMaterial({color:'#3f7d5f',roughness:1}));ground.rotation.x=-Math.PI/2;scene.add(ground);
 const grid=new T.GridHelper(Math.max(world.w,world.h),28,'#b4ebd3','#b4ebd3');grid.material.transparent=true;grid.material.opacity=.12;scene.add(grid);
 for(const o of walls){const m=new T.Mesh(new T.BoxGeometry(o.w,60,o.h),new T.MeshStandardMaterial({color:'#4b5f75'}));m.position.set(toX(o.x+o.w/2),30,toZ(o.y+o.h/2));scene.add(m)}
 const makeLabel=(txt)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.fillStyle='rgba(5,14,28,.8)';g.fillRect(0,0,512,96);g.fillStyle='#e9f7ff';g.font='bold 38px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,256,48);const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true}));sp.scale.set(190,36,1);return sp};
 for(const p of points){const ring=new T.Mesh(new T.RingGeometry(38,50,36),new T.MeshBasicMaterial({color:'#5ad6ff',transparent:true,opacity:.65,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(toX(p.x),2,toZ(p.y));scene.add(ring);const l=makeLabel('⌖ '+p.label);l.position.set(toX(p.x),82,toZ(p.y));scene.add(l)}
 for(const item of pickups){if(item.taken)continue;const orb=new T.Mesh(new T.SphereGeometry(13,20,16),new T.MeshStandardMaterial({color:item.color,emissive:item.color,emissiveIntensity:.75}));orb.position.set(toX(item.x),24,toZ(item.y));scene.add(orb);item.mesh=orb}
 const player=new T.Group(),body=new T.Mesh(new T.BoxGeometry(22,24,16),new T.MeshStandardMaterial({color:'#243f76'})),head=new T.Mesh(new T.SphereGeometry(13,18,14),new T.MeshStandardMaterial({color:'#ffe0a5'})),hair=new T.Mesh(new T.ConeGeometry(12,16,10),new T.MeshStandardMaterial({color:'#17233c'}));body.position.y=22;head.position.y=50;hair.position.y=66;player.add(body,head,hair);scene.add(player);
 const state={x:world.w/2,y:world.h/2},keys=new Set();let raf=0,last=0,active=true,near='Explore la zone et cherche des objets cachés.';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),collides=(x,y)=>walls.some(o=>x>o.x-18&&x<o.x+o.w+18&&y>o.y-18&&y<o.y+o.h+18);
 const down=e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','z','q'].includes(k)){e.preventDefault();keys.add(k)}},up=e=>keys.delete(e.key.toLowerCase());
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);
 const tick=t=>{if(!active)return;const dt=Math.min(.035,(t-last)/1000||0);last=t;let dx=0,dy=0;if(keys.has('arrowleft')||keys.has('a')||keys.has('q'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;if(keys.has('arrowup')||keys.has('w')||keys.has('z'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;if(dx||dy){const n=Math.hypot(dx,dy);dx/=n;dy/=n;const nx=clamp(state.x+dx*230*dt,25,world.w-25),ny=clamp(state.y+dy*230*dt,25,world.h-25);if(!collides(nx,state.y))state.x=nx;if(!collides(state.x,ny))state.y=ny;player.rotation.y=Math.atan2(dx,-dy)}
 player.position.set(toX(state.x),0,toZ(state.y));for(const item of pickups){if(item.taken)continue;item.mesh.rotation.y+=dt*2;item.mesh.scale.setScalar(1+Math.sin(t/220+item.x)*.12);if(Math.hypot(state.x-item.x,state.y-item.y)<34){item.taken=true;item.mesh.visible=false;if(onPickup)onPickup(item)}}
 const target=pickups.find(x=>!x.taken&&Math.hypot(state.x-x.x,state.y-x.y)<95),place=points.find(x=>Math.hypot(state.x-x.x,state.y-x.y)<75);near=target?'Objet proche : '+target.name+' — approche-toi !':place?'Lieu découvert : '+place.label+' — ouvre la carte des lieux pour le visiter.':'Explore la zone et cherche des objets cachés.';if(onNear)onNear(near);if(onCounter)onCounter(pickups.filter(x=>x.taken).length,pickups.length);
 camera.position.set(player.position.x,520,player.position.z+430);camera.lookAt(player.position.x,30,player.position.z-40);renderer.render(scene,camera);raf=requestAnimationFrame(tick)};
 raf=requestAnimationFrame(tick);
 return{stop(){active=false;cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);keys.clear();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});renderer.dispose()}};
}