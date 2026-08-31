
'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,k)=>a+(b-a)*k;
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const DPR=Math.min(devicePixelRatio||1,2);

let stage=0;
let site=0;

const SW ={repel:0,conflict:0,delay:0,relabel:0,dissolve:0,reset:0,occlude:0};
const SWT={repel:0,conflict:0,delay:0,relabel:0,dissolve:0,reset:0,occlude:0};
const W_INTRO=[];
const W_LADDER=[1.0,0.8,0.7,0.6,0.5,0.45,0.35];
function raiseWeight(key){
  if(!W_INTRO.includes(key)) W_INTRO.push(key);
  for(let i=0;i<W_INTRO.length;i++){
    const rank=W_INTRO.length-1-i;
    SWT[W_INTRO[i]]=Math.max(W_LADDER[Math.min(rank,W_LADDER.length-1)],0.3);
  }
}
let wRepel=1,wConflict=1,wDelay=1,s4W=1,s3W=1,s5W=1,wOcclude=1;
function stepRepel(w){ wRepel=w; stepWords(); }
function stepConflict(w){ wConflict=w; stepStage2(); }
function stepDelay(w){ wDelay=w; stepStage6(); }
function stepRelabel(w){ s4W=w; }
function stepDissolve(w){ s3W=w; s3StepLetters(); }
function stepReset(w){ s5W=w; }
function stepOcclude(w){ wOcclude=w; stepStage7(); }
let t=0, dt=1/60, lastNow=performance.now();
let W=innerWidth, H=innerHeight;

let mpx=W/2, mpy=H/2, mx=0, my=0, tmx=0, tmy=0, everMoved=false;
addEventListener('pointermove',e=>{
  mpx=e.clientX; mpy=e.clientY;
  mx=(mpx/W)*2-1; my=(mpy/H)*2-1;
  if(!everMoved){ everMoved=true; onFirstMove(); }
});
const cursorEl=$('cursor');

const FOG_SND_BASE='assets/audio/';
let fogSnd={};
function fogPlay(file,vol,loop){
  try{
    let a=fogSnd[file];
    if(!a){
      a=new Audio(FOG_SND_BASE+encodeURI(file));
      a.preload='auto';
      fogSnd[file]=a;
    }
    a.loop=!!loop;
    a.volume=Math.max(0,Math.min(1,vol==null?0.6:vol));
    a.currentTime=0;
    const pr=a.play();
    if(pr&&pr.catch) pr.catch(()=>{});
    return a;
  }catch(e){ return null; }
}
function fogAudible(file){
  const a=fogSnd[file];
  return !!(a && !a.paused && !a.ended && a.readyState>=2 && a.currentTime>0);
}
function fogFade(file,to,ms){
  const a=fogSnd[file]; if(!a) return;
  const from=a.volume, t0=performance.now();
  const step=()=>{
    const p=Math.min(1,(performance.now()-t0)/Math.max(1,ms));
    a.volume=Math.max(0,Math.min(1,from+(to-from)*p));
    if(p<1) requestAnimationFrame(step);
    else if(to<=0.001){ try{ a.pause(); }catch(e){} }
  };
  step();
}
function initAudio(){ fogPlay('128 BPM Metronome.mp3',0,true); }

const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
renderer.setPixelRatio(DPR); renderer.setSize(W,H);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x04101a);
scene.fog=new THREE.FogExp2(0x06121e,0.048);

const camera=new THREE.PerspectiveCamera(68,W/H,0.1,140);
const camGroup=new THREE.Group(), camTilt=new THREE.Group();
camGroup.add(camTilt); camTilt.add(camera); scene.add(camGroup);
camGroup.position.set(0,2.2,4);

addEventListener('resize',()=>{
  W=innerWidth;H=innerHeight;
  renderer.setSize(W,H);
  camera.aspect=W/H;camera.updateProjectionMatrix();
});

const NOISE=`
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p);
    f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }`;
const FOGV=`varying vec3 vW; varying float vD;
  void main(){
    vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz;
    vec4 mv=viewMatrix*w; vD=-mv.z;
    gl_Position=projectionMatrix*mv;
  }`;
const shaderMats=[];
function fogUniforms(){return{
  uT:{value:0},
  uFogC:{value:new THREE.Color(0x06121e)},
  uFogD:{value:0.048}};}

function basaltMat(pulsed){
  const m=new THREE.ShaderMaterial({
    vertexShader:FOGV,
    fragmentShader:`
      varying vec3 vW; varying float vD;
      uniform float uT,uFogD; uniform vec3 uFogC;
      ${NOISE}
      void main(){
        float n=noise(vW.xz*0.5+vW.y*0.7);

        float strata=smoothstep(0.22,0.78,0.5+0.5*sin(vW.y*2.2+n*3.0));
        vec3 base=mix(vec3(0.028,0.055,0.082),vec3(0.055,0.10,0.145),strata*0.55+n*0.25);
        float crev=noise(vW.xy*1.1+vW.zx*0.65);

        float edge=smoothstep(0.10,0.0,abs(crev-0.5));
        base=mix(base, base*0.55+vec3(0.008,0.03,0.055), edge*0.45);

        base*=0.94+0.06*hash(vW.xy*7.0+vW.zz);
        float pulse=${pulsed
          ? '0.5+0.25*sin(uT*0.23)+0.25*sin(uT*0.37)'
          : '0.55+0.45*sin(uT*0.6+crev*21.0)'};
        float seep=smoothstep(0.72,0.95,crev)*pulse;
        vec3 col=base+vec3(0.04,0.30,0.34)*seep*0.5;
        float f=1.0-exp(-pow(uFogD*vD,2.0));
        gl_FragColor=vec4(mix(col,uFogC,f),1.0);
      }`,
    uniforms:fogUniforms(), side:THREE.DoubleSide});
  shaderMats.push(m); return m;
}

function membraneMat(){
  const m=new THREE.ShaderMaterial({
    vertexShader:FOGV,
    fragmentShader:`
      varying vec3 vW; varying float vD;
      uniform float uT,uFogD; uniform vec3 uFogC;
      ${NOISE}
      void main(){
        float n=noise(vW.zy*0.7+uT*0.03);
        float vein=1.0-smoothstep(0.0,0.08,abs(fract(n*4.0+vW.y*0.4)-0.5)*0.4);
        vec3 col=vec3(0.024,0.05,0.075)+vec3(0.08,0.20,0.26)*vein*0.35*(0.6+0.4*sin(uT*0.5+vW.z));
        float f=1.0-exp(-pow(uFogD*vD,2.0));
        gl_FragColor=vec4(mix(col,uFogC,f),1.0);
      }`,
    uniforms:fogUniforms(), side:THREE.DoubleSide});
  shaderMats.push(m); return m;
}

function glowMat(){
  const m=new THREE.ShaderMaterial({
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`
      varying vec2 vUv; uniform float uT; uniform vec3 uCol;
      void main(){
        float r=length(vUv*2.0-1.0);
        float pulse=0.5+0.25*sin(uT*0.23)+0.25*sin(uT*0.37);
        float a=exp(-r*r*3.2)*pulse*0.9;
        gl_FragColor=vec4(uCol,a);
      }`,
    uniforms:{uT:{value:0},uCol:{value:[0.32,0.58,0.85]}},
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  shaderMats.push(m); return m;
}

const corridorGroup=new THREE.Group(); corridorGroup.visible=false; scene.add(corridorGroup);
const SEG_LEN=14, SEG_COUNT=6, TUBE_R=7;
const segs=[];
function buildTubeSegment(variant){
  const g=new THREE.Group();
  const ribs=4+variant;
  for(let r=0;r<ribs;r++){
    const rad=TUBE_R+(variant%2?0.6:0)+Math.sin(r*1.7+variant)*0.8;
    const geo=new THREE.CylinderGeometry(rad,rad,0.9,9,1,true);
    const m=new THREE.Mesh(geo,basaltMat(false));
    m.rotation.x=Math.PI/2;
    m.position.z=-r*(SEG_LEN/ribs)-(SEG_LEN/ribs)*0.5;
    m.rotation.z=r*0.5+variant;
    g.add(m);
  }
  const nkr=2+variant%3;
  for(let k=0;k<nkr;k++){
    const rr=0.5+Math.random()*1.1;
    const rock=new THREE.Mesh(new THREE.SphereGeometry(rr,5,4),basaltMat(false));
    const ang=Math.random()*Math.PI*2, rad=TUBE_R-1.2;
    rock.position.set(Math.cos(ang)*rad,Math.sin(ang)*rad,-Math.random()*SEG_LEN);
    rock.scale.set(1,0.6+Math.random()*0.5,1.2);
    g.add(rock);
  }
  return g;
}
for(let i=0;i<SEG_COUNT;i++){
  const s=buildTubeSegment(i%4);
  s.position.z=-i*SEG_LEN;
  corridorGroup.add(s);
  segs.push(s);
}
const corridorGlow=new THREE.Mesh(new THREE.PlaneGeometry(9,9),glowMat());
corridorGroup.add(corridorGlow);

let swim=null;

function startSwim(dist, arc, branch, done){
  hideAllOverlays&&hideAllOverlays();
  corridorGroup.visible=true;
  corridorGroup.position.z=camGroup.position.z;
  for(let i=0;i<SEG_COUNT;i++) segs[i].position.z=-i*SEG_LEN;
  const gcol={light:[0.85,0.42,0.34],grey:[0.32,0.58,0.85],dark:[0.18,0.34,0.62]}[arc]||[0.32,0.58,0.85];
  corridorGlow.material.uniforms.uCol&&(corridorGlow.material.uniforms.uCol.value=gcol);
  swim={t0:t, dist, travelled:0, branch:branch||0, arc, done, pulsed:false};
}
function stepSwim(){
  const SPEED=11;
  const adv=SPEED*dt;
  swim.travelled+=adv;
  const k=Math.min(swim.travelled/swim.dist,1);

  corridorGroup.position.z+=adv;

  for(const s of segs){
    if(s.position.z+corridorGroup.position.z > camGroup.position.z+SEG_LEN){
      let minZ=Infinity; for(const o of segs) minZ=Math.min(minZ,o.position.z);
      s.position.z=minZ-SEG_LEN;

      for(const c of s.children){ if(c.geometry&&c.geometry.type==='SphereGeometry'){
        const ang=Math.random()*Math.PI*2, rad=TUBE_R-1.2;
        c.position.set(Math.cos(ang)*rad,Math.sin(ang)*rad,-Math.random()*SEG_LEN);
      }}
    }
  }

  camGroup.position.x=swim.branch*1.4*Math.sin(Math.PI*k);
  camTilt.rotation.y=lerp(camTilt.rotation.y,swim.branch*-0.12*Math.sin(Math.PI*k)-tmx*0.10,0.1);
  camTilt.rotation.x=lerp(camTilt.rotation.x,tmy*0.06,0.08);
  camGroup.position.y=1.7+Math.sin(t*0.5)*0.06;

  corridorGlow.position.set(0,0.3,camGroup.position.z-SEG_LEN*2.2);
  corridorGlow.lookAt(camGroup.position);
  if(swim.branch&&!swim.pulsed&&k>0.86){
    swim.pulsed=true;
    const lb=$('leave-btn'); if(lb){lb.classList.add('real'); setTimeout(()=>lb.classList.remove('real'),2000);} }
  if(k>=1){
    camGroup.position.x=0;
    corridorGroup.visible=false;
    const cb=swim.done; swim=null; cb&&cb();
  }
}

function swimTo(done, arc, dist){
  const lane = mx<-0.28?-1 : mx>0.28?1 : 0;
  startSwim(dist||SEG_LEN*3.2, arc||'grey', lane, done);
}

const crossroads=new THREE.Group(); scene.add(crossroads);
const stage1Group=new THREE.Group(); scene.add(stage1Group);

function edgeFrame(x,w,h,color,opacity){
  const pts=[];
  const N=54, hw=w/2, top=h;
  for(let i=0;i<N;i++){
    const a0=i/N*Math.PI*2, a1=(i+1)/N*Math.PI*2;
    const rag=(ang)=>{
      const s1=Math.sin(ang*3.1+x)*0.09;
      const s2=Math.sin(ang*7.3-x*2)*0.045;
      const s3=Math.sin(ang*13.7+x*0.5)*0.022;
      return 1+s1+s2+s3;
    };
    const p=(ang)=>new THREE.Vector3(
      x+Math.sin(ang)*hw*rag(ang),
      top*0.5-Math.cos(ang)*(top*0.5)*rag(ang+1.7),
      Math.sin(ang*2.3)*0.35);
    pts.push(p(a0),p(a1));
  }
  const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({color,transparent:true,opacity}));
  crossroads.add(l); return l;
}
function perspLines(x,w,h,vp,color,opacity){
  const pts=[];
  for(let i=0;i<7;i++){
    const ang=i/7*Math.PI*2+0.4;
    const rr=1+Math.sin(ang*3.1+x)*0.09+Math.sin(ang*7.3-x*2)*0.045;
    pts.push(new THREE.Vector3(
      x+Math.sin(ang)*(w/2)*rr,
      h*0.5-Math.cos(ang)*(h*0.5)*rr,
      0), vp.clone());
  }
  const l=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({color,transparent:true,opacity}));
  crossroads.add(l);
}
function ravine(x,w,h,depth,open){
  const mat=basaltMat(false);
  const wall=(ww,hh,px,py,pz,ry)=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(ww,hh),mat);
    m.position.set(px,py,pz); m.rotation.y=ry||0; crossroads.add(m);
  };
  wall(depth,h, x-w/2, h/2, -depth/2,  Math.PI/2);
  wall(depth,h, x+w/2, h/2, -depth/2, -Math.PI/2);
  const top=new THREE.Mesh(new THREE.PlaneGeometry(w,depth),mat);
  top.position.set(x,h,-depth/2); top.rotation.x=Math.PI/2; crossroads.add(top);
  if(!open) wall(w,h, x, h/2, -depth, 0);
}
   ravine(-9,5,7,20,false);
    ravine( 0,7,9,20,true);
  ravine( 9,5,7,20,false);
const mouthL=edgeFrame(-9,5,7,0x4a86ad,0.70);
const mouthC=edgeFrame( 0,7,9,0x4f8fb8,0.74);
const mouthR=edgeFrame( 9,5,7,0x4a86ad,0.70);
perspLines(-9,5,7,new THREE.Vector3(-9,2.4,-18),0x16283a,0.28);
perspLines( 0,7,9,new THREE.Vector3(0,2.2,-55),0x5599dd,0.4);
perspLines( 9,5,7,new THREE.Vector3(9,2.4,-18),0x16283a,0.28);

function rockPillar(x,z,r,h,group){
  const geo=new THREE.CylinderGeometry(r*0.7,r,h,8,6);
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const px=p.getX(i),py=p.getY(i),pz=p.getZ(i);
    const k=1+0.22*Math.sin(py*1.7+px*3.1)+0.14*Math.sin(pz*4.2);
    p.setX(i,px*k); p.setZ(i,pz*k);
  }
  geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,basaltMat(false));
  m.position.set(x,h/2,z);(group||crossroads).add(m);
  const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo,28),
    new THREE.LineBasicMaterial({color:0x2f7f74,transparent:true,opacity:0.10}));
  e.position.copy(m.position);(group||crossroads).add(e);
  return m;
}
rockPillar(-6,-0.8,0.55,8);
rockPillar( 6,-0.8,0.55,8);

const steleSide=basaltMat(false), steleFace=basaltMat(true);
const stele=new THREE.Mesh(new THREE.BoxGeometry(3.2,4.5,0.45),
  [steleSide,steleSide,steleSide,steleSide,steleFace,steleSide]);
stele.position.set(0,2.25,-6); crossroads.add(stele);
const steleShadow=new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.6),
  new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.35}));
steleShadow.rotation.x=-Math.PI/2; steleShadow.position.set(0,0.02,-6);
crossroads.add(steleShadow);

const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,110),basaltMat(false));
floor.rotation.x=-Math.PI/2; floor.position.set(0,0,-30); scene.add(floor);

const L=(c,i,d,x,y,z)=>{const l=new THREE.PointLight(c,i,d);l.position.set(x,y,z);scene.add(l);return l;};
L(0x4488cc,12,30, 0,3,-4);
L(0x0a1828, 3,20,-9,2,-3);
L(0x0a1828, 3,20, 9,2,-3);
L(0x2255aa, 6,25, 0,2,-22);
scene.add(new THREE.AmbientLight(0x08121e,3));

const ceil1=new THREE.Mesh(new THREE.PlaneGeometry(60,60),basaltMat(false));
ceil1.rotation.x=Math.PI/2; ceil1.position.set(0,5.5,-30); stage1Group.add(ceil1);
const memL=new THREE.Mesh(new THREE.PlaneGeometry(52,6),membraneMat());
memL.rotation.y=Math.PI/2; memL.position.set(-9,2.6,-30); stage1Group.add(memL);
const memR=memL.clone(); memR.material=membraneMat();
memR.rotation.y=-Math.PI/2; memR.position.x=9; stage1Group.add(memR);
for(let i=0;i<16;i++){
  const px=(i%2?1:-1)*(4.5+Math.random()*3.6);
  rockPillar(px,-8-Math.random()*18,0.32+Math.random()*0.3,3+Math.random()*2.4,stage1Group);
}
const vanish=new THREE.Mesh(new THREE.PlaneGeometry(16,16),glowMat());
vanish.position.set(0,2.2,-55); stage1Group.add(vanish);

const SNOWN=1800;
{ const g=new THREE.BufferGeometry(), a=new Float32Array(SNOWN*3);
  for(let i=0;i<SNOWN;i++){a[i*3]=(Math.random()-0.5)*40;a[i*3+1]=Math.random()*6;a[i*3+2]=4-Math.random()*64;}
  g.setAttribute('position',new THREE.BufferAttribute(a,3));
  const snow=new THREE.Points(g,new THREE.ShaderMaterial({
    vertexShader:`uniform float uT;
      void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_PointSize=2.4*(30.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`void main(){ float d=length(gl_PointCoord-0.5);
      if(d>0.5) discard;
      gl_FragColor=vec4(0.749,0.847,0.894,0.5*(1.0-d*2.0)); }`,
    uniforms:{uT:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  scene.add(snow); window.__snow=g; }

{ const N=280, g=new THREE.BufferGeometry();
  const a=new Float32Array(N*3), ph=new Float32Array(N);
  for(let i=0;i<N;i++){a[i*3]=(Math.random()-0.5)*30;a[i*3+1]=0.06;a[i*3+2]=2-Math.random()*56;ph[i]=Math.random()*10;}
  g.setAttribute('position',new THREE.BufferAttribute(a,3));
  g.setAttribute('ph',new THREE.BufferAttribute(ph,1));
  const m=new THREE.ShaderMaterial({
    vertexShader:`attribute float ph;varying float vs;uniform float uT;
      void main(){vs=0.5+0.5*sin(uT*1.3+ph);
      vec4 mv=modelViewMatrix*vec4(position,1.0);
      gl_PointSize=(2.0+3.0*vs)*(30.0/-mv.z);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vs;
      void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;
      gl_FragColor=vec4(0.25,0.75,0.8,vs*0.8*(1.0-d*2.0));}`,
    uniforms:{uT:{value:0}},transparent:true,depthWrite:false,
    blending:THREE.AdditiveBlending});
  shaderMats.push(m);
  scene.add(new THREE.Points(g,m)); }

let gazeProgress=0, dolly=null, consume=null, stage1BaseZ=-7.8, stage1StartT=0;
let hintedHold=false, forkChosen=false;
addEventListener('pointerdown',function(){
  if(stage!==0||!fogEntered||dolly) return;
  const lane=gazeLaneAt();
  if(lane===null) return;
  forkChosen=true;
  const fh=$('forkhint'); if(fh) fh.classList.remove('on');
  startDolly(lane);
});
let fogEntered=false;
(function(){
  var lift=function(){
    var o=$('opening');
    if(o) o.classList.add('gone');
  };
  if(document.readyState==='complete') setTimeout(lift,260);
  else addEventListener('load',function(){ setTimeout(lift,260); });
  setTimeout(lift,3200);
})();

function startFog(){
  fogEntered=true;
  gazeProgress=0;
  setTimeout(function(){
    if(stage!==0||forkChosen) return;
    const fh=$('forkhint'); if(fh) fh.classList.add('on');
  },700);
  $('opening').classList.add('gone');
  initAudio();
}
$('fogentry').addEventListener('click',()=>{
  if(fogEntered)return;
  $('fogentry').classList.add('gone');
  const jump=(location.hash||'').replace('#','');
  if(/^stage[1-7]$/.test(jump)){
    fogEntered=true; initAudio();
    $('opening').classList.add('gone');
    if(jump==='stage1'){ beginStage1(); }
    else{

      crossroads.visible=false; stage1Group.visible=false;
      const fn={stage2:beginStage2,stage3:beginStage3,stage4:beginStage4,
                stage5:beginStage5,stage6:beginStage6,stage7:beginStage7}[jump];
      camGroup.position.set(0,1.6,-7.8); scene.fog.density=0.093;
      fn&&fn();
    }
    return;
  }
  startFog();
});

function gazeLaneAt(){
  if(mpy<H*0.25||mpy>H*0.82) return null;
  if(mpx<W*0.30) return -1;
  if(mpx>W*0.70) return 1;
  if(mpx>W*0.36&&mpx<W*0.64) return 0;
  return null;
}
let gazeLaneCur=0;
function startDolly(lane){ if(!fogEntered)return;
  document.body.style.cursor='default';
  dolly={t0:t,lane:lane||0,pulsed:false}; }
function startConsume(){ consume={t0:t}; $('consume').classList.add('ink'); }

const WORDS=[
  ['home',-2,-10,0],['the way back',3.5,-14,0],
  ['a name',-4.5,-18,1],['I know this place',-3.5,-26,1],
  ['I love you',2,-12,2],["don't go",4,-22,2],['crying',-5,-16,2],
  ['almost',1.5,-20,1]];
const WORD_BASE_LIFE=34, REPEL_R=200, REPEL_F=620;
const VIG=[55,52,49,46,43,40,36,32,28,24,20,18];
let words=[], nearMissCount=0, s1FirstMoveT=0, attractWord=null, plunge=null;
let s1Wave=0;
const v3=new THREE.Vector3();

let s1SymptomOn=false;
function beginSymptom1(){
  if(s1SymptomOn)return; s1SymptomOn=true;
  raiseWeight('repel');
  footnote('new experiences fail to encode long before old ones fade \u00b7 Peters-Founshtein et al., 2024');
}
function beginStage1(){
  stage=1; s1SymptomOn=false;
  stage1BaseZ=camGroup.position.z;
  stage1StartT=t;
  setTimeout(()=>$('consume').classList.remove('ink'),600);
  WORDS.forEach((wd,i)=>{
    const el=document.createElement('div');
    el.className='w'; el.textContent=wd[0];
    el.style.fontWeight=400;
    el.style.transform='translate(-50%,-50%) translate(-9999px,-9999px)';
    document.body.appendChild(el);
    words.push({el,wx:wd[1],wz:wd[2],wave:wd[3],i,px:0,py:0,vx:0,vy:0,seeded:false,
      shown:false,born:0,extraLife:0,wasNear:false,
      dph:Math.random()*9,dfq:0.4+Math.random()*0.5,dead:false});
  });
  s1Wave=0;
  if(everMoved) revealWords();
  s1whispers();
}
function onFirstMove(){ if(stage===1) revealWords(); }
let wordsRevealed=false;

function revealWords(){
  if(wordsRevealed)return; wordsRevealed=true;
  s1FirstMoveT=t;
  releaseWave(0);
}
function releaseWave(wave){
  const ws=words.filter(w=>w.wave===wave && !w.shown);
  ws.forEach((w,k)=>{
    setTimeout(()=>{
      w.el.style.opacity=0.01;
      requestAnimationFrame(()=>{w.el.style.opacity=1;});
      w.shown=true; w.born=t+(500+k*420)/1000;
    },500+k*420);
  });
}
function s1whispers(){
  const say=(txt,delay)=>setTimeout(()=>{if(stage===1)whisper(txt);},delay*1000);
  say('reach out',7); say('they were just here',30); say("you can't hold on",54);
}
const whisperEl=$('whisper');
let whisperTimer=null;
function whisper(txt){
  whisperEl.textContent=txt; whisperEl.classList.add('on');
  clearTimeout(whisperTimer);
  whisperTimer=setTimeout(()=>whisperEl.classList.remove('on'),4200);
}
function updateVignette(n){
  const idx=clamp(n,0,VIG.length-1), v=VIG[idx];
  const vg=$('vignette');
  vg.style.background=
    `radial-gradient(ellipse ${v}% ${v}% at 50% 50%, rgba(0,0,0,0) 62%, rgba(1,3,5,0.98) 100%)`;
  vg.style.opacity=0.3+(n/12)*0.7;
}
function nearMiss(word,fleeDir){
  if(!s1SymptomOn){ if(t-s1FirstMoveT>4) beginSymptom1(); return; }
  nearMissCount++;
  word.extraLife+=2.8;
  updateVignette(nearMissCount);

  if(nearMissCount===4 && s1Wave<1){ s1Wave=1; releaseWave(1);
    whisper('who lives here?'); }
  if(nearMissCount===8 && s1Wave<2){ s1Wave=2; releaseWave(2); }

  if(nearMissCount===14){
    const love=words.find(w=>w.el.textContent==='I love you' && !w.dead)
      || words.find(w=>w.wave===2 && !w.dead) || word;
    beginFalseHope(love);
  }
}
function beginFalseHope(word){
  attractWord=word; word.attractT0=t;
}
function beginPlunge(){
  if(plunge)return;
  plunge={t0:t};
  words.forEach(w=>{ if(w!==attractWord){ w.el.classList.add('dying'); } });

  setTimeout(()=>{ $('descent').style.opacity=1; },900);
  setTimeout(()=>{ beginStage2(); $('descent').style.opacity=0; },1500);
}
function stepWords(){
  const cx=mpx, cy=mpy;
  let alive=0;
  for(const w of words){
    if(w.dead) continue; alive++;
    if(!w.shown) continue;

    v3.set(w.wx,1.6,w.wz).project(camera);
    const bx=(v3.x*0.5+0.5)*W, by=(-v3.y*0.5+0.5)*H;
    if(!w.seeded){ w.px=bx; w.py=by; w.seeded=true; }
    const drift=Math.sin(t*w.dfq+w.dph)*26;
    const drifty=Math.cos(t*w.dfq*0.8+w.dph)*18;

    if(attractWord===w && t-w.attractT0<3.5){

      const settle=clamp((t-w.attractT0)/0.8,0,1);
      w.vx+=(cx-w.px)*(6+settle*10)*dt; w.vy+=(cy-w.py)*(6+settle*10)*dt;
      const g=1;
      w.el.style.textShadow=
        `0 0 ${18}px rgba(200,230,255,0.98),`+
        `0 0 ${40}px rgba(150,205,255,0.85),`+
        `0 0 ${70}px rgba(90,170,255,0.6)`;
    }else if(attractWord===w && !w.shattered){
      w.shattered=true;
      w.el.classList.add('shattering');
      setTimeout(beginPlunge,620);
    }else{

      w.vx+=((bx+drift)-w.px)*0.018;
      w.vy+=((by+drifty)-w.py)*0.018;

      const dx=w.px-cx, dy=w.py-cy, d=Math.hypot(dx,dy);
      if(d<REPEL_R && d>0.001){
        const k=(1-d/REPEL_R); const f=REPEL_F*wRepel*k*k*dt;
        w.vx+=dx/d*f; w.vy+=dy/d*f;
      }

      if(d<90) w.wasNear=true;
      else if(d>115 && w.wasNear){ w.wasNear=false; nearMiss(w, dx>0?1:-1); }

      const g=1-clamp(d/REPEL_R,0,1);
      w.el.style.textShadow=
        `0 0 ${8+g*14}px rgba(200,230,255,0.95),`+
        `0 0 ${22+g*30}px rgba(150,205,255,${0.65+g*0.3}),`+
        `0 0 ${50+g*55}px rgba(90,170,255,${0.32+g*0.38}),`+
        `0 0 ${90+g*85}px rgba(70,140,235,${0.12+g*0.22})`;
      w.el.style.fontSize=(22+g*2.4)+'px';
    }

    const thick=clamp(nearMissCount/14,0,1);
    const damp=0.84-thick*0.06;
    w.vx*=damp; w.vy*=damp;
    const sp=Math.hypot(w.vx,w.vy);
    const cap=280*(1-thick*0.35);
    if(sp>cap){ w.vx*=cap/sp; w.vy*=cap/sp; }
    w.px+=w.vx; w.py+=w.vy;
    if(w.px<48)w.px=48; if(w.px>W-48)w.px=W-48;
    if(w.py<48)w.py=48; if(w.py>H-48)w.py=H-48;
    if(!w.shattered)
      w.el.style.transform=`translate(-50%,-50%) translate(${w.px}px,${w.py}px)`;

    if(w.born && !w.dying2){
      const age=t-w.born;
      if(age > WORD_BASE_LIFE + w.i*4 + w.extraLife){
        w.dying2=true; w.el.classList.add('dying');
        setTimeout(()=>{ w.dead=true; w.el.remove(); },7000);
      }
    }
  }

  if(alive===0 && !plunge && stage===1) beginPlunge();
}

function corridor(arc, swap){
  const c=$('corridor'), door=c.querySelector('.door');
  const glow={light:'rgba(216,108,88,0.15)',grey:'rgba(150,160,170,0.07)',dark:'rgba(120,120,130,0.03)'}[arc];
  door.style.setProperty('--door',glow); door.style.background=glow;
  c.classList.remove('grow','black');
  c.classList.add('on');
  requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.add('grow')));
  setTimeout(()=>{ c.classList.add('black'); swap(); },800);
  setTimeout(()=>{ c.classList.remove('on','grow','black'); },1200);
}
let clinT=null;
function footnote(txt){
  const n=$('clin-note');
  n.textContent=txt;
  n.classList.add('on');
  clearTimeout(clinT);
  clinT=setTimeout(()=>n.classList.remove('on'),8000);
}
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  if(id) $(id).classList.add('on');
}
function hideAllOverlays(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
}

let s2Swapping=false, s2Over=false, slips=[], notches=[], s2GrabT=-9;
let dragSlip=null;
function beginStage2(){
  footnote('chronology breaks before the memories themselves \u00b7 Khot et al., 2026');
  stage=2; raiseWeight('conflict');
  renderer.domElement.style.opacity=0.25;
  showScreen('screen-stage2');

  const scatter=[[30,26],[62,22],[76,40],[38,44],[54,34]];
  document.querySelectorAll('#screen-stage2 .slip').forEach((el,i)=>{
    const s={el,i,x:scatter[i][0]*W/100,y:scatter[i][1]*H/100,
      hx:scatter[i][0]*W/100,hy:scatter[i][1]*H/100,
      slot:null,ph:Math.random()*9,held:false};
    slips.push(s);
    setTimeout(()=>el.classList.add('shown'),500+i*320);
  });
  document.querySelectorAll('#screen-stage2 .notch').forEach((el,i)=>{
    notches.push({el,x:parseFloat(el.style.left)/100,slip:null});
    setTimeout(()=>el.classList.add('on'),400);
  });
  setTimeout(()=>$('s2-thread').classList.add('on'),400);
  addEventListener('pointerdown',s2Grab);
  addEventListener('pointerup',s2Drop);
  addEventListener('pointercancel',s2Drop);
  setTimeout(()=>{ if(stage===2&&!s2Over) $('s2-hint').classList.add('on'); },6500);
  setTimeout(()=>{ if(stage===2&&!s2Over) whisper('put them in order. any order.'); },9000);
}
function s2Grab(e){
  if(stage!==2||s2Over) return;
  if(dragSlip) s2Drop();
  const px=e.clientX, py=e.clientY;
  let pick=null, pd=1e9;
  const PAD=26;
  for(const s of slips){
    if(s.el.classList.contains('leaving')) continue;
    const r=s.el.getBoundingClientRect();
    if(!r.width) continue;
    if(px>=r.left-PAD && px<=r.right+PAD && py>=r.top-PAD && py<=r.bottom+PAD){
      const d=Math.hypot(px-(r.left+r.width/2), py-(r.top+r.height/2));
      if(d<pd){ pd=d; pick=s; }
    }
  }
  if(!pick) return;
  dragSlip=pick;
  pick.held=true; pick.rise=0;
  pick.el.classList.add('held');
  pick.el.classList.remove('adrift');
  pick.grabDX=pick.x-px; pick.grabDY=pick.y-py;
  pick.prevSlot=pick.slot;
  if(pick.slot!==null){ notches[pick.slot].slip=null; pick.slot=null; }
  e.preventDefault();
}

function s2Drop(){
  if(!dragSlip)return;
  const s=dragSlip; dragSlip=null; s.held=false; s.el.classList.remove('held');
  notches.forEach(n=>n.el.classList.remove('near'));
  if(s2Over)return;

  const ty=H*0.62, reach=Math.max(150,W*0.075), yTol=Math.max(190,H*0.22);
  const sr=s.el.getBoundingClientRect();
  const sx=sr.width?(sr.left+sr.width/2):mpx, sy2=sr.height?(sr.top+sr.height/2):mpy;
  let best=null,bd=1e9;
  for(const n of notches){
    const dx=Math.abs(sx-n.x*W), dy=Math.abs(sy2-ty);
    if(dx<reach && dy<yTol && dx<bd){bd=dx;best=n;}
  }
  if(best){
    if(best.slip){

      const b=best.slip;
      if(s.prevSlot!=null && !notches[s.prevSlot].slip){
        notches[s.prevSlot].slip=b; b.slot=s.prevSlot;
      }else{ b.slot=null; b.hx=mpx; b.hy=ty-120; }
    }
    best.slip=s; s.slot=notches.indexOf(best); s.rise=0;
  }else{ s.hx=s.x; s.hy=s.y; }
  s.prevSlot=null;
}
let s2DropT=0, s2FirstSlip=true, s2Murmured=false, s2StruggleT=0, s2Losses=0;

function s2LoseGrip(){
  if(s2Over||stage!==2||dragSlip)return;
  const ty=H*0.62;
  const hung=slips.filter(s=>s.slot!==null);
  if(hung.length===0)return;

  if(hung.length<2) return;
  const away=hung.filter(s=>{
    const nx=notches[s.slot].x*W;
    return Math.hypot(mpx-nx,mpy-ty) > Math.max(150,W*0.10);
  });
  if(away.length===0)return;
  const s=away[Math.floor(Math.random()*away.length)];
  notches[s.slot].slip=null; s.slot=null; s2Losses++;

  s.hx=s.x+(Math.random()*2-1)*40;
  s.hy=s.y; s.rise=5+Math.random()*6;
  s.el.classList.add('adrift');
  if(s2FirstSlip){ s2FirstSlip=false; }
  else if(!s2Murmured){ s2Murmured=true;
    whisper('was it before, or after?'); }
}
function s2Dissolve(){
  s2Over=true;

  $('s2-thread').classList.add('gone');
  notches.forEach(n=>n.el.classList.add('gone'));
  whisper('the days are all still here.');
  setTimeout(()=>whisper('only the string is gone.'),3400);
  slips.forEach((s,i)=>{
    s.slot=null; s.rise=8+Math.random()*14;
    setTimeout(()=>s.el.classList.add('leaving'),1200+i*600);
  });
  setTimeout(()=>{
    removeEventListener('pointerdown',s2Grab);
    removeEventListener('pointerup',s2Drop);
    removeEventListener('pointercancel',s2Drop);
    dragSlip=null;
    swimTo(beginStage3,'grey');
  },8200);
}
function s2Report(){
  return slips.map(s=>({
    text:s.el.textContent, i:s.i, slot:s.slot,
    x:Math.round(s.x), y:Math.round(s.y), rise:+(s.rise||0).toFixed(2),
    shown:s.el.classList.contains('shown'),
    adrift:s.el.classList.contains('adrift'),
    leaving:s.el.classList.contains('leaving'),
    onTop:(function(){
      var r=s.el.getBoundingClientRect();
      var hit=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      return hit===s.el?'yes':(hit?('BLOCKED by '+(hit.id||hit.className||hit.tagName)):'offscreen');
    })()
  }));
}
window.S2 = { report:s2Report, get over(){return s2Over;}, get drag(){return dragSlip&&dragSlip.el.textContent;},
  get struggle(){return +s2StruggleT.toFixed(1);}, get losses(){return s2Losses;} };

function stepStage2(){
  const ty=H*0.62;

  if(!s2Over && stage===2){
    const placed=slips.filter(s=>s.slot!==null).length;
    if(placed>=1||s2Losses>0){
      s2StruggleT+=dt;
      const phase = s2StruggleT<15?1 : s2StruggleT<35?2 : 3;
      const interval = phase===1?5.5 : phase===2?3.2 : 2.0;
      if(t-s2DropT>interval){ s2DropT=t; s2LoseGrip(); }
    }

    if((s2StruggleT>52 || s2Losses>=7) && !s2Over){ s2Over=true; setTimeout(s2Dissolve,900); }
  }
  if(dragSlip){
    const reach=Math.max(150,W*0.075), yTol=Math.max(190,H*0.22);
    let best=null,bd=1e9;
    const dr=dragSlip.el.getBoundingClientRect();
    const dcx=dr.width?(dr.left+dr.width/2):mpx, dcy=dr.height?(dr.top+dr.height/2):mpy;
    for(const n of notches){ if(n.slip)continue;
      const dx=Math.abs(dcx-n.x*W), dy=Math.abs(dcy-ty);
      if(dx<reach&&dy<yTol&&dx<bd){bd=dx;best=n;} }
    for(const n of notches) n.el.classList.toggle('near', n===best);
  }
  for(const s of slips){
    if(s===dragSlip){
      s.x=lerp(s.x,mpx+(s.grabDX||0),0.45);
      s.y=lerp(s.y,mpy+(s.grabDY||0),0.45);
    }
    else if(s.slot!==null){

      s.x=lerp(s.x, notches[s.slot].x*W, 0.02);
      s.y=lerp(s.y, ty-26+Math.sin(t*0.7+s.ph)*2.5, 0.06);
    }else{

      if(s.rise){
        s.hy-=s.rise*dt;
        s.rise=Math.max(0,s.rise-dt*3.2);
        if(s.hy<H*0.16){ s.hy=H*0.16; s.rise=0; }
      }
      s.hx=Math.max(W*0.10,Math.min(W*0.90,s.hx));
      s.hy=Math.max(H*0.14,Math.min(H*0.86,s.hy));
      s.x=lerp(s.x, s.hx+Math.sin(t*0.33+s.ph)*22*(0.6+0.4*wConflict), 0.03);
      s.y=lerp(s.y, s.hy+Math.cos(t*0.27+s.ph)*15*(0.6+0.4*wConflict), 0.03);
    }
    s.el.style.transform=`translate(-50%,-50%) translate(${s.x}px,${s.y}px)`;
  }
}

const S3_ROWS=['QWERTYUIOP?','ASDFGHJKL!','ZXCVBNM,.'];
let s3KeyHandler=null, s3FootT=null;
function s3BuildKeyboard(){
  const kb=$('s3-keyboard'); kb.innerHTML='';
  S3_ROWS.forEach(row=>{
    const r=document.createElement('div'); r.className='krow';
    [...row].forEach(ch=>{
      const k=document.createElement('div'); k.className='key'; k.textContent=ch;
      k.dataset.ch=ch;
      k.addEventListener('mousedown',e=>{ e.preventDefault(); s3Press(ch,k); });
      r.appendChild(k);
    });
    kb.appendChild(r);
  });
  const last=kb.lastChild;
  if(last){
    const del=document.createElement('div');
    del.className='key key-del';
    del.textContent='delete';
    del.setAttribute('role','button');
    del.setAttribute('tabindex','0');
    del.setAttribute('aria-label','delete the last letter');
    const fire=e=>{ e.preventDefault();
      del.classList.add('down'); setTimeout(()=>del.classList.remove('down'),150);
      if(stage===3&&!s3EndScheduled) s3Backspace(); };
    del.addEventListener('mousedown',fire);
    del.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' ') fire(e); });
    last.appendChild(del);
  }
}
function s3KeyByChar(ch){
  return [...$('s3-keyboard').querySelectorAll('.key')].find(k=>k.dataset.ch===ch.toUpperCase());
}

let s3Letters=[], s3StartT=0, s3EndScheduled=false;
function s3Phase(){
  const e=t-s3StartT;
  return e<8?1 : e<17?2 : 3;
}
const S3_NEAR={Q:'WA',W:'QES',E:'WRD',R:'ETF',T:'RYG',Y:'TUH',U:'YIJ',I:'UOK',O:'IPL',P:'O',
  A:'QSZ',S:'AWDX',D:'SEFC',F:'DRGV',G:'FTHB',H:'GYJN',J:'HUKM',K:'JIL',L:'KO',
  Z:'AX',X:'ZSC',C:'XDV',V:'CFB',B:'VGN',N:'BHM',M:'NJ'};
function s3Slip(ch){
  const near=S3_NEAR[ch];
  if(!near) return ch;
  return near[Math.floor(Math.random()*near.length)];
}
function s3Press(ch,keyEl){
  keyEl=keyEl||s3KeyByChar(ch); if(!keyEl)return;

  keyEl.classList.add('down');
  setTimeout(()=>keyEl.classList.remove('down'),150);
  if(stage!==3||s3EndScheduled)return;
  const ph=s3Phase();
  if(ph===3){

    if(!s3Muttered){ s3Muttered=true;
      setTimeout(()=>{ if(stage===3) whisper('what was it'); },900);
      setTimeout(()=>{ if(stage===3&&!s3EndScheduled){ s3EndScheduled=true; endStage3(); } },2600); }
    return;
  }

  const life = ph===2 ? (1.2+Math.random()*2.6) : 999;
  const shown = (ph===1 && Math.random()<0.34) ? s3Slip(ch) : ch;
  s3Letters.push({ch:shown, born:t, life, el:null});

  if(ph===1 && s3Letters.length>=2 && Math.random()<0.5){
    const n=s3Letters.length;
    const a=s3Letters[n-1], b=s3Letters[n-2];
    s3Letters[n-1]=b; s3Letters[n-2]=a;
  }
  s3Render();
}
let s3Muttered=false;
function s3Render(){
  const el=$('s3-typed'); el.innerHTML='';
  for(const L of s3Letters){
    const sp=document.createElement('span'); sp.textContent=L.ch;
    L.el=sp; el.appendChild(sp);
  }
}

function s3StepLetters(){
  if(stage!==3||s3EndScheduled)return;
  let changed=false;
  for(let i=s3Letters.length-1;i>=0;i--){
    if(t-s3Letters[i].born > s3Letters[i].life){
      s3Letters.splice(i,1); changed=true;
    }
  }
  if(changed) s3Render();
}
function s3Backspace(){
  if(s3Letters.length){ s3Letters.pop(); s3Render(); }
}
function shuffle(str){
  const a=str.split('');
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t2=a[i]; a[i]=a[j]; a[j]=t2; }
  return a.join('');
}
function beginStage3(){
  stage=3; raiseWeight('dissolve');
  showScreen('screen-stage3');
  s3Letters=[]; s3StartT=t; s3EndScheduled=false; s3Muttered=false;
  s3BuildKeyboard();
  $('s3-typed').innerHTML='';
  const kb=$('s3-keyboard'); if(kb) kb.style.opacity=1;
  const pr=$('s3-prompt'); pr.textContent='What is your name?'; pr.style.opacity=1;
  s3KeyHandler=e=>{
    if(stage!==3)return;
    const ch=e.key.length===1?e.key.toUpperCase():'';
    if(ch && 'QWERTYUIOPASDFGHJKLZXCVBNM,.?!'.includes(ch)){ s3Press(ch); }
    else if(e.key==='Backspace'){ s3Backspace(); }
  };
  window.addEventListener('keydown',s3KeyHandler);
  clearTimeout(s3FootT);
  s3FootT=setTimeout(()=>{ if(stage===3) footnote('the word is known; the saying of it fails \u00b7 Weekes, 2020'); },3200);
  setTimeout(()=>{ if(stage===3&&!s3Letters.length) whisper('type your name.'); },9000);
}
function endStage3(){
  if(s3KeyHandler){ window.removeEventListener('keydown',s3KeyHandler); s3KeyHandler=null; }
  whisper('you knew it a moment ago.');
  const kb=$('s3-keyboard'); if(kb) kb.style.opacity=0;
  const p=$('s3-prompt'), base='What is your name?';
  let step=0;
  const twist=setInterval(()=>{
    step++;
    const cut=Math.min(step*5,base.length);
    p.textContent=base.slice(0,base.length-cut)+shuffle(base.slice(base.length-cut));
    if(step>=4){ clearInterval(twist);
      setTimeout(()=>{ if(stage===3) whisper('let it go. there is something else.'); },500);
      setTimeout(()=>swimTo(beginStage4,'grey'),2600); }
  },450);
}

const S4_LABELS=['key','the small one','mine','my keys',
  'I know this','what is it','the thing for the door','...','ours','wasn\u2019t it'];
let s4Idx=0, s4Peak=0, s4LabelT=0, s4Done=false, s4T0=0;
let s4paths=[], s4seed=[];

let s4Dwell=0, s4Attempts=0, s4WasClose=false, s4W2A=false, s4W3A=false;
function beginStage4(){
  stage=4; raiseWeight('relabel');
  showScreen('screen-stage4');
  s4Idx=0; s4Peak=0; s4Done=false; s4T0=t;
  s4Dwell=0; s4Attempts=0; s4WasClose=false; s4W2A=false; s4W3A=false;
  s4paths=[...document.querySelectorAll('#s4-obj path, #s4-obj circle')];
  s4seed=s4paths.map(()=>({ax:Math.random()*2-1, ay:Math.random()*2-1, ar:Math.random()*2-1}));
  s4paths.forEach(p=>{ p.style.transition='none'; p.style.transformOrigin='center'; p.style.transformBox='fill-box'; });
  const l=$('s4-label'); l.textContent=''; l.style.transform='translateX(-50%)';
  clearTimeout(s4FootT);
  s4FootT=setTimeout(()=>{ if(stage===4) footnote('naming fails before the thing is unknown \u00b7 Isella et al., 2022'); },3200);
  setTimeout(()=>{ if(stage===4&&s4Peak<0.15) whisper('what is that.'); },16000);
}
let s4FootT=null;
function stepRelabel(w){
  s4W=w;
  if(stage!==4||s4Done||!s4paths.length)return;
  const obj=$('s4-obj');
  const r=obj.getBoundingClientRect();
  const cx=r.left+r.width/2, cy=r.top+r.height/2;
  const d=Math.hypot(mpx-cx,mpy-cy);
  const R=Math.max(280,W*0.17);
  let k=1-clamp(d/R,0,1); k=k*k;
  if(k>s4Peak)s4Peak=k;

  if(k>0.3){ s4Dwell=Math.min(s4Dwell+dt,9); }
  else{ s4Dwell=Math.max(s4Dwell-dt*2.4,0); }

  if(k>0.5) s4WasClose=true;
  else if(k<0.15 && s4WasClose){ s4WasClose=false; s4Attempts++; }

  const ph2=clamp((s4Dwell-3)/3,0,1);
  const ph3=clamp((s4Dwell-6)/3,0,1);
  const intensity=k*(1+ph2*0.9+ph3*1.4);

  const ang=Math.atan2(cy-mpy,cx-mpx);
  const push=k*22*(1+ph2*0.8+ph3*1.3);
  s4paths.forEach((p,i)=>{
    const sd=s4seed[i];
    const dx=Math.cos(ang)*push + sd.ax*intensity*11;
    const dy=Math.sin(ang)*push + sd.ay*intensity*11;
    const rot=sd.ar*intensity*16;
    p.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px) rotate('+rot.toFixed(1)+'deg)';
    p.style.strokeDasharray=(Math.max(30-intensity*24,3)).toFixed(0)+' '+(intensity*7).toFixed(0);
    p.style.opacity=(1-Math.min(intensity*0.72,0.94)).toFixed(2);
  });

  obj.style.filter='blur('+(k*4+ph2*3+ph3*4).toFixed(1)+'px)';

  const l=$('s4-label');
  l.style.fontWeight=Math.max(100,Math.round(300-k*160-ph3*80));
  l.style.letterSpacing=(k*0.12+ph3*0.10).toFixed(3)+'em';

  if(k>0.4){
    const flash=Math.max(0.10,0.46-ph2*0.22-ph3*0.14);
    if(t-s4LabelT>flash){
      s4LabelT=t;

      if(ph3>0.5 && Math.random()<0.55) s4Idx=7;
      else s4Idx=(s4Idx+1)%S4_LABELS.length;
      l.style.opacity=0.35;
      const shown=S4_LABELS[s4Idx];
      setTimeout(()=>{ l.textContent=shown; l.style.opacity=Math.max(0.06,1-k*0.4); },130);
    }
  }else if(k<0.15){
    if(l.textContent!=='key' && t-s4LabelT>0.7){ s4LabelT=t; l.textContent='key'; l.style.opacity=0.55; }
  }

  if(!s4W2A && s4Dwell>3.2){ s4W2A=true; whisper('almost.'); }
  if(!s4W3A && s4Dwell>6.2){ s4W3A=true; whisper('it was just here.'); }

  if(((s4Attempts>=3 && t-s4T0>16) || s4Peak>0.9 && s4Dwell>7) && !s4Done){
    s4Done=true; whisper('it was mine. wasn\u2019t it?'); setTimeout(endStage4,4200);
  }else if(t-s4T0>50 && !s4Done){
    s4Done=true; whisper('it was mine. wasn\u2019t it?'); setTimeout(endStage4,4200);
  }
}
function endStage4(){
  if(stage!==4)return;
  const obj=$('s4-obj'); if(obj) obj.style.filter='';
  swimTo(beginStage5,'grey');
}

const S5_TASKS=['task-lamp','task-lock','task-key'];
let s5Done={}, s5T0=0, s5Ended=false, s5UndoT=0, s5Completes=0, s5Murmured=false, s5LastTap=null;
let s5Center={};
function s5Recompute(){
  s5Center={};
  S5_TASKS.forEach(id=>{ const el=$(id); if(!el)return;
    const r=el.getBoundingClientRect(); s5Center[id]={x:r.left+r.width/2,y:r.top+r.height/2}; });
}
function beginStage5(){
  stage=5; raiseWeight('reset');
  showScreen('screen-stage5');
  s5Done={}; s5T0=t; s5Ended=false; s5UndoT=t; s5Completes=0; s5Murmured=false;
  S5_TASKS.forEach(id=>{ s5Done[id]=false; const el=$(id); el.classList.remove('done'); });
  s5Recompute();
  S5_TASKS.forEach(id=>{ $(id).onclick=()=>s5Tap(id); });
  clearTimeout(s5FootT);
  s5FootT=setTimeout(()=>{ if(stage===5) footnote('the steps of a task will not stay done \u00b7 Gleichgerrcht et al., 2011'); },2600);
  setTimeout(()=>{ if(stage===5&&s5Completes===0) whisper('lamp. door. key.'); },2200);
  clearTimeout(s5SafetyT);
  s5SafetyT=setTimeout(()=>{
    if(stage===5&&!s5Ended){
      s5Ended=true;
      whisper('did I already do this?');
      setTimeout(()=>{ whisper('I think so.'); },1900);
      setTimeout(endStage5,3800);
    }
  },30000);
}
let s5FootT=null, s5SafetyT=null;

function s5Tap(id){
  if(stage!==5||s5Ended)return;
  const el=$(id);
  s5LastTap=id;
  if(!s5Done[id]){
    s5Done[id]=true; el.classList.add('done');

    dimScreen();
    if(S5_TASKS.every(x=>s5Done[x])) s5OnComplete();
  }else{

    s5Done[id]=true; el.classList.add('done');
  }
}
let s5Dim=0;
function dimScreen(){
  s5Dim=Math.min(s5Dim+1,3);
  $('screen-stage5').style.filter='brightness('+(1-s5Dim*0.12).toFixed(2)+')';
}
function s5OnComplete(){
  s5Completes++;
  if(s5Completes<2){
    whisper('that\u2019s everything. goodnight.');
    setTimeout(()=>{
      if(stage!==5||s5Ended) return;
      S5_TASKS.forEach(id=>{ s5Done[id]=false; const el=$(id); if(el) el.classList.remove('done'); });
      s5UndoT=t;
    },1900);
  }
  if(s5Completes>=2){ if(!s5Ended){ s5Ended=true;
    whisper('did I already do this?');
    setTimeout(()=>{ whisper('I think so.'); },2600);
    setTimeout(endStage5,5200); } }
}

function stepReset(w){
  s5W=w;
  if(stage!==5||s5Ended)return;
  s5Recompute();

  const e=t-s5T0;
  const phase = e<7?1 : e<16?2 : 3;
  const interval = phase===1?4.2 : phase===2?3.0 : 2.4;
  const undoCount = 1;
  if(t-s5UndoT>interval){
    s5UndoT=t;

    const away=S5_TASKS.filter(id=>{
      if(!s5Done[id])return false;
      const c=s5Center[id]; if(!c)return false;
      if(id===s5LastTap) return false;
      return Math.hypot(mpx-c.x,mpy-c.y) > Math.max(210,W*0.14);
    });
    for(let i=0;i<undoCount && away.length;i++){
      const pick=away.splice(Math.floor(Math.random()*away.length),1)[0];
      s5Done[pick]=false;
      const el=$(pick); el.classList.remove('done');
    }
  }
}
function endStage5(){
  const sc=$('screen-stage5'); if(sc) sc.style.filter='';
  swimTo(beginStage6,'dark');
}

let s6Streak=0, s6LastConduct=-99, s6Held=false, s6Accent=-99;
let s6Start=0, s6Phases=[], s6Base=[], s6Drift=[], s6Bonus=0, s6Clicked=false, s6BarEls=[];
let s6Ended=false, s6Lying=false, s6LieVal=0, s6Beat=0, s6Focus='none', s6FocusT=0;
function beginStage6(){
  footnote('sound and sight drift apart: the binding window widens \u00b7 Wu et al., 2012 / Festa et al., 2017');
  stage=6; raiseWeight('delay');
  showScreen('screen-stage6');
  s6Start=t; s6Ended=false; s6Lying=false; s6LieVal=0; s6Focus='none';
  s6Streak=0; s6LastConduct=-99; s6Held=false; s6Accent=-99;
  const holder=$('s6-bars');
  if(!holder.children.length){
    for(let i=0;i<16;i++){
      const wrap=document.createElement('div'); wrap.className='barw';
      const b=document.createElement('div'); b.className='bar';
      wrap.appendChild(b); holder.appendChild(wrap); s6BarEls.push(b);
      s6Base.push(i*0.42); s6Phases.push(i*0.42); s6Drift.push(0);
      wrap.addEventListener('click',()=>s6Conduct(i,b));
    }
  }else{
    s6BarEls.forEach((b,i)=>{ s6Phases[i]=s6Base[i]; s6Drift[i]=0; });
  }
  $('s6-sync').classList.remove('lying');
  $('s6-sync').textContent='sync: 100%';
  $('s6-label').style.opacity=1;
  $('s6-label').textContent='click a bar to pull it back';
  fogPlay('128 BPM Metronome.mp3',0.0,true);
  fogFade('128 BPM Metronome.mp3',0.55,2200);
  setTimeout(()=>{
    if(stage!==6) return;
    if(fogAudible('128 BPM Metronome.mp3')) $('s6-label').textContent='listen. watch.';
  },1400);
  setTimeout(()=>{ if(stage===6) $('s6-label').style.opacity=0; },7000);
}

function s6Conduct(i,bar){
  if(stage!==6||s6Ended||s6Lying)return;
  const now=t;
  s6Streak=(now-s6LastConduct<1.1)?Math.min(s6Streak+1,6):1;
  s6LastConduct=now;
  const reach=1+Math.floor(s6Streak/2);
  for(let d=0;d<=reach;d++){
    [i-d,i+d].forEach(j=>{
      if(j<0||j>=s6BarEls.length)return;
      const pull=1-(d/(reach+1));
      s6Phases[j]=s6Phases[j]+(s6Base[j]-s6Phases[j])*pull;
      s6Drift[j]*=(1-pull);
      const el=s6BarEls[j];
      setTimeout(()=>{
        if(stage!==6)return;
        el.classList.add('pulse');
        el.style.setProperty('--lit',pull.toFixed(2));
        setTimeout(()=>{ el.classList.remove('pulse'); el.style.removeProperty('--lit'); },300);
      },d*45);
    });
  }
  s6Bonus=Math.min(s6Bonus+7+s6Streak*1.5,34);
  const met=fogSnd['128 BPM Metronome.mp3'];
  if(met&&!met.paused){
    try{
      met.volume=Math.min(1,met.volume+0.16);
      s6Accent=now;
      if(window.Pan){
        const span=Math.max(1,s6BarEls.length-1);
        Pan.glide(met,((i/span)*2-1)*0.7,220,'amb');
      }
    }catch(e){}
  }
  if(!s6Clicked){ s6Clicked=true;
    setTimeout(()=>{ if(stage===6) whisper('it will not hold.'); },1600); }
}
function stepStage6(){
  if(stage!==6)return;
  const e=t-s6Start;
  const bars=s6BarEls;

  const BEAT=0.75;
  const beatNow=Math.floor(e/BEAT);
  if(beatNow!==s6Beat){ s6Beat=beatNow;

    const lateShift = e>12 ? clamp((e-12)/16,0,1)*0.55 : 0;
    const idx=Math.round((0.5+0.5*Math.sin(t*2.4))*(bars.length-1));
    if(!s6Lying && bars[idx]){ bars[idx].classList.add('pulse');
      const bi=bars[idx]; setTimeout(()=>bi.classList.remove('pulse'),120); }
  }

  if(e>12 && !s6Lying){
    const overBars = mpy>H*0.34 && mpy<H*0.66;
    const nf = overBars ? 'watch' : 'listen';
    if(nf!==s6Focus){ s6Focus=nf; s6FocusT=t; }
  }

  for(let i=0;i<bars.length;i++){
    if(e>5){
      if(Math.random()<0.004) s6Drift[i]=(Math.random()-0.5)*0.5;
      s6Phases[i]+=s6Drift[i]*dt*(e/12)*wDelay;
    }

    let scatter=0;
    if(s6Focus==='watch') scatter=0;
    else if(s6Focus==='listen') scatter=0.6*Math.sin(t*7+i);
    if(i===0){
      const met=fogSnd['128 BPM Metronome.mp3'];
      if(met&&!met.paused){
        const acc=Math.max(0,1-(t-s6Accent)/0.5);
        const want=Math.min(1,((s6Focus==='watch')?0.16:0.62)+acc*0.3);
        met.volume+=(want-met.volume)*(acc>0?0.25:0.035);
        const rate=(s6Focus==='watch')?(1-0.055*wDelay):1;
        try{ met.playbackRate+=(rate-met.playbackRate)*0.04; }catch(e){}
      }
    }
    const jitter=(e>6 && Math.random()<0.02*wDelay)?Math.random()*0.5:0;
    const h=0.16+0.84*Math.abs(Math.sin(t*2.4+s6Phases[i]+scatter))+jitter;
    bars[i].style.transform=`scaleY(${clamp(h,0.05,1.35)})`;
  }

  if(!s6Lying){
    s6Bonus=Math.max(0,s6Bonus-(2.0+e*0.12)*dt);
    if(window.Pan && t-s6Accent>0.8){
      const met2=fogSnd['128 BPM Metronome.mp3'];
      if(met2&&!met2.paused) Pan.glide(met2,0,900,'amb');
    }
    if(t-s6LastConduct>1.4) s6Streak=0;
    const sync=clamp(Math.round(100-(e/24)*100+s6Bonus),0,100);
    $('s6-sync').textContent='sync: '+sync+'%';
    $('s6-sync').classList.toggle('holding',sync>=92);
    if(sync>=100&&!s6Held){ s6Held=true;
      setTimeout(()=>{ if(stage===6&&!s6Lying) whisper('there. you have it.'); },500); }

    if(e>28 && sync<35){ s6Lying=true; s6LieVal=sync;
      $('s6-sync').classList.add('lying');
      $('s6-sync').classList.remove('holding');
      $('s6-label').style.opacity=0; }
  }else{

    s6LieVal=Math.min(100,s6LieVal+9*dt);
    $('s6-sync').textContent='sync: '+Math.round(s6LieVal)+'%';
    if(s6LieVal>=100 && !s6Ended){
      s6Ended=true;
      whisper('it matches now.');
      setTimeout(endStage6,4200);
    }
  }
}
function endStage6(){
  if(stage!==6)return;
  fogFade('128 BPM Metronome.mp3',0,1600);
  $('s6-sync').classList.remove('lying');
  showScreen('screen-stage7');
  beginStage7();
}

let s7Clicks=0, s7Speed=1, s7Done=false, whiteO=0;
let s7LastMove=0, s7Still=0, s7Struggle=0, s7Murmured=false;
function beginStage7(){
  footnote('in the late stage, perception itself withdraws \u00b7 Alzheimer\u2019s Society, 2023');
  stage=7; raiseWeight('occlude');
  s7LastMove=t; s7Still=0; s7Struggle=0;

  $('s7-stop').addEventListener('click',()=>{
    s7Clicks++;
    if(s7Clicks===1){  }
    else if(s7Clicks===2){  $('s7-stop').style.opacity=0.7; }
    else if(s7Clicks>=3){
      const b=$('s7-stop');
      b.textContent="it's okay"; b.classList.add('soft');
      $('s7-note').style.opacity=0;
    }
  });
}
let s7PrevMx=0, s7PrevMy=0;
function stepStage7(){
  if(s7Done)return;

  const moved=Math.hypot(mpx-s7PrevMx,mpy-s7PrevMy);
  s7PrevMx=mpx; s7PrevMy=mpy;
  if(moved>2){ s7LastMove=t; s7Struggle=Math.min(s7Struggle+dt*1.4,1); }
  else { s7Struggle=Math.max(s7Struggle-dt*0.8,0); }
  s7Still=t-s7LastMove;

  const agit=$('s7-agit');
  agit.style.opacity=(s7Struggle*0.85).toFixed(2);
  agit.style.boxShadow='inset 0 0 '+(90+s7Struggle*70).toFixed(0)+'px '
    +(30+s7Struggle*40).toFixed(0)+'px rgba(120,150,170,'+(s7Struggle*0.5).toFixed(2)+')';

  const surrender=clamp(s7Still/1.2,0,1);
  const rate=0.0016*(0.18+0.82*surrender)*s7Speed*Math.max(wOcclude,0.4);
  whiteO+=rate;
  $('s7-white').style.opacity=clamp(whiteO,0,1);

  if(!s7Murmured && surrender>0.9 && whiteO>0.15){ s7Murmured=true;
    whisper('let go.'); }

  if(whiteO>=1){
    s7Done=true;
    agit.style.opacity=0;
    sessionStorage.setItem('fog_complete','true');

    setTimeout(()=>{ $('s7-final').style.opacity=1;
    },1800);

    setTimeout(()=>{ $('s7-final').style.opacity=0;
      s7RollEpitaph(); },7600);

    setTimeout(()=>{ s7ShowReplay(); }, 7600+16000);
  }
}
function s7ShowReplay(){
  const ev=$('s7-evidence'); if(ev){ ev.style.transition='opacity 3s ease'; ev.style.opacity=0; }
  const rp=$('s7-replay'); if(!rp)return;
  setTimeout(()=>{
    rp.classList.add('on');
    rp.querySelectorAll('.rp-line[data-stage]').forEach(a=>{
      a.addEventListener('click',()=>{
        const st=a.getAttribute('data-stage');
        location.hash = st==='0' ? '' : 'stage'+st;
        location.reload();
      });
    });
    const sea=rp.querySelector('.rp-sea');
    if(sea) sea.addEventListener('click',e=>{
      e.preventDefault();
      $('s7-fade').style.opacity=1;
      setTimeout(()=>{ location.href='index.html#/sea'; },900);
    });
  },3200);
}

function s7RollEpitaph(){
  const ev=$('s7-evidence'); ev.classList.add('on');
  const lines=[...ev.querySelectorAll('.ev-line')];
  lines.forEach((ln,i)=>{ ln.style.opacity=0;
    setTimeout(()=>{ ln.style.transition='opacity 2.4s ease'; ln.style.opacity=1; }, 900+i*1700); });
}

function animate(){
  const now=performance.now();
  dt=Math.min((now-lastNow)/1000,0.05); lastNow=now; t+=dt;

  tmx=lerp(tmx,mx,0.06); tmy=lerp(tmy,my,0.06);

  cursorEl.style.left=mpx+'px'; cursorEl.style.top=mpy+'px';

  whisperEl.style.left=(mpx+20)+'px'; whisperEl.style.top=(mpy+26)+'px';

  for(const m of shaderMats){ if(m.uniforms.uT) m.uniforms.uT.value=t;
    if(m.uniforms.uFogD) m.uniforms.uFogD.value=scene.fog.density; }

  if(stage===0){

    if(!dolly){
      camGroup.position.y=2.2+Math.sin(t*0.16)*0.04;
      camTilt.rotation.y=-tmx*0.09; camTilt.rotation.x=tmy*0.045;

      const lane=fogEntered?gazeLaneAt():null;
      if(lane!==null) gazeLaneCur=lane;
      const pulse=0.10*Math.sin(t*1.9);
      const breath=0.06*Math.sin(t*0.9);
      const litL=(lane===-1)?(1.30+pulse):(0.64+breath);
      const litR=(lane=== 1)?(1.30+pulse):(0.64+breath);
      const litC=(lane=== 0)?(1.30+pulse):(0.70+breath);
      mouthL.material.opacity+=(litL-mouthL.material.opacity)*0.10;
      mouthR.material.opacity+=(litR-mouthR.material.opacity)*0.10;
      mouthC.material.opacity+=(litC-mouthC.material.opacity)*0.10;
      mouthL.scale.setScalar(lane===-1?1.07:1);
      mouthR.scale.setScalar(lane=== 1?1.07:1);
      mouthC.scale.setScalar(lane=== 0?1.07:1);
      document.body.style.cursor=(lane!==null)?'pointer':'default';
    }else if(!consume){
      const dur=dolly.lane?1.7:0.9;
      const k=smooth(Math.min((t-dolly.t0)/dur,1));
      camera.fov=Math.min(68+15*k,85); camera.updateProjectionMatrix();
      camGroup.position.z=lerp(4,1.2,k);
      camGroup.position.y=lerp(2.2,1.8,k);

      camGroup.position.x=(dolly.lane)*1.15*Math.sin(Math.PI*k);
      camTilt.rotation.y=lerp(camTilt.rotation.y,(dolly.lane)*-0.10*Math.sin(Math.PI*k),0.1);
      camTilt.rotation.x=lerp(camTilt.rotation.x,0,0.08);
      if(dolly.lane&&!dolly.pulsed&&k>0.86){
        dolly.pulsed=true;
        const lb=$('leave-btn'); lb.classList.add('real');
        setTimeout(()=>lb.classList.remove('real'),2400);
      }
      if(k>=1){ camGroup.position.x=0; startConsume(); }
    }else{
      const k=Math.min((t-consume.t0)/1.0,1);
      camGroup.position.z=lerp(1.2,-7.8,k);
      scene.fog.density=0.048+0.045*k;
      scene.fog.color.setRGB(
        lerp(0.024,0.012,k), lerp(0.071,0.043,k), lerp(0.118,0.078,k));
      for(const sm of shaderMats){ if(sm.uniforms.uFogC) sm.uniforms.uFogC.value.copy(scene.fog.color); }
      if(camGroup.position.z<-5.5){ stele.visible=false; steleShadow.visible=false; }
      if(k>=1 && stage===0){ camera.fov=68; camera.updateProjectionMatrix(); beginStage1(); }
    }
  }
  else if(stage===1){
    const e=t-stage1StartT;
    camGroup.position.y=1.6+Math.sin(t*0.17)*0.055;
    camGroup.position.z=stage1BaseZ+Math.sin(t*0.12)*0.14
      -Math.min(Math.max(e-4,0)*0.0025,0.35);
    camTilt.rotation.y=-tmx*0.16; camTilt.rotation.x=tmy*0.08;
    if(plunge){
      const jT=t-plunge.t0;
      if(jT<0.9) camGroup.position.y+=Math.sin(jT*7)*Math.exp(-jT*3.5)*1.4;
    }
  }
  if(swim){
    stepSwim();
    for(const m of shaderMats){ if(m.uniforms.uT) m.uniforms.uT.value=t; }
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
    return;
  }

  site=stage;
  for(const k in SW) SW[k]+=(SWT[k]-SW[k])*(1-Math.exp(-dt/0.45));

  if(stage===1){ wRepel=SW.repel; stepWords(); }
  else if(SW.repel>0.001) stepRepel(SW.repel);
  if(SW.conflict>0.001) stepConflict(SW.conflict);
  if(SW.delay>0.001)    stepDelay(SW.delay);
  if(SW.relabel>0.001)  stepRelabel(SW.relabel);
  if(SW.dissolve>0.001) stepDissolve(SW.dissolve);
  if(SW.reset>0.001)    stepReset(SW.reset);
  if(SW.occlude>0.001)  stepOcclude(SW.occlude);

  if(window.__snow){
    const a=window.__snow.attributes.position.array;
    for(let i=0;i<SNOWN;i++){ a[i*3+1]+=0.0035; if(a[i*3+1]>6)a[i*3+1]=0; }
    window.__snow.attributes.position.needsUpdate=true;
  }
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
updateVignette(0);
$('vignette').style.opacity=0;
animate();
