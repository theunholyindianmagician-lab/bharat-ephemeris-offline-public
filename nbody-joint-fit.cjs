'use strict';
/*
 * JOINT N-body differential-corrector (batch least-squares orbit determination).
 *
 * Solves the epoch 6-state of 7 bodies (Mercury,Venus,Earth,Moon,Mars,Jupiter,Saturn)
 * SIMULTANEOUSLY against the sovereign reference span (VSOP87 heliocentric planets +
 * ELP2000 geocentric Moon). Sun = frame anchor (fixed at origin/rest, removes the
 * translation/boost gauge freedom); Uranus+Neptune = fixed perturbers (Kepler seed).
 *
 * Residuals are ANGULAR (Cartesian error / distance) so Moon and Jupiter weigh equally.
 * Jacobian = finite-difference from the REAL dop853 model (8th-order + EIH 1PN + Earth J2).
 * Gauss-Newton with Levenberg damping. Fit window 0.5..8 yr; HELD-OUT test 9..15 yr.
 */
const path=require('path'), R=f=>require(path.join(__dirname,f));
const NB=R('dop853-nbody.js'), V=R('vsop87-full.js'), E=R('elp-moon.js');
const EPOCH=2451545.0, DEG=Math.PI/180, YR=365.25, AUKM=149597870.7;
const OB=84381.406/3600*DEG, cE=Math.cos(OB), sE=Math.sin(OB);
const GM=NB.STANDARD_GM, NB10=10;
const VKEY={1:'mercury',2:'venus',3:'earth',5:'mars',6:'jupiter',7:'saturn'};
const FITBODIES=[1,2,3,4,5,6,7];  // indices of bodies whose 6-state we solve
const eqEclLon=(x,y,z)=>{const l=Math.atan2(y*cE+z*sE,x)/DEG;return(l%360+360)%360;};
const dArc=(a,b)=>{let d=((a-b+540)%360)-180;return d*3600;};

function keplerEqState(el){const a=el.a,e=el.e,i=el.i*DEG,Om=el.Om*DEG,w=(el.pi-el.Om)*DEG,M=((el.L-el.pi)%360)*DEG;
  let Ec=M;for(let k=0;k<60;k++){const d=(Ec-e*Math.sin(Ec)-M)/(1-e*Math.cos(Ec));Ec-=d;if(Math.abs(d)<1e-15)break;}
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(Ec/2),Math.sqrt(1-e)*Math.cos(Ec/2)),r=a*(1-e*Math.cos(Ec)),p=a*(1-e*e),vf=Math.sqrt(GM[0]/p);
  const xo=r*Math.cos(nu),yo=r*Math.sin(nu),vxo=-vf*Math.sin(nu),vyo=vf*(e+Math.cos(nu));
  const cO=Math.cos(Om),sO=Math.sin(Om),ci=Math.cos(i),si=Math.sin(i),cw=Math.cos(w),sw=Math.sin(w);
  const P=[cO*cw-sO*sw*ci,sO*cw+cO*sw*ci,sw*si],Q=[-cO*sw-sO*cw*ci,-sO*sw+cO*cw*ci,cw*si];
  const E2=(u,v)=>[P[0]*u+Q[0]*v,P[1]*u+Q[1]*v,P[2]*u+Q[2]*v],pe=E2(xo,yo),ve=E2(vxo,vyo);
  const toEq=([x,y,z])=>[x,y*cE-z*sE,y*sE+z*cE];return{pos:toEq(pe),vel:toEq(ve)};}
function moonGeo(jd){const h=0.125,s=k=>E.equatorialJ2000(jd+k*h),p=s(0),n3=s(-3),n2=s(-2),n1=s(-1),q1=s(1),q2=s(2),q3=s(3),
  d=(m3,m2,m1,P1,P2,P3)=>(-m3/60+3*m2/20-3*m1/4+3*P1/4-3*P2/20+P3/60)/h;
  return{pos:[p.x,p.y,p.z],vel:[d(n3.x,n2.x,n1.x,q1.x,q2.x,q3.x),d(n3.y,n2.y,n1.y,q1.y,q2.y,q3.y),d(n3.z,n2.z,n1.z,q1.z,q2.z,q3.z)]};}
function baseSeed(){const pos=Array.from({length:NB10},()=>[0,0,0]),vel=Array.from({length:NB10},()=>[0,0,0]);let eP,eV;
  for(const[idx,key]of Object.entries(VKEY)){const s=V.equatorialJ2000(key,EPOCH);pos[idx]=[s.x,s.y,s.z];vel[idx]=[s.vx,s.vy,s.vz];if(key==='earth'){eP=pos[idx];eV=vel[idx];}}
  const m=moonGeo(EPOCH);pos[4]=[eP[0]+m.pos[0],eP[1]+m.pos[1],eP[2]+m.pos[2]];vel[4]=[eV[0]+m.vel[0],eV[1]+m.vel[1],eV[2]+m.vel[2]];
  const u=keplerEqState({a:19.19126393,e:0.04716771,i:0.76986,Om:74.22988,pi:170.96424,L:313.23218});
  const n=keplerEqState({a:30.06896348,e:0.00858587,i:1.76917,Om:131.72169,pi:44.97135,L:304.88003});
  pos[8]=u.pos;vel[8]=u.vel;pos[9]=n.pos;vel[9]=n.vel;return{pos,vel};}

const BASE=baseSeed();
function paramsFromSeed(){const p=[];for(const b of FITBODIES)p.push(...BASE.pos[b],...BASE.vel[b]);return p;}
function seedFromParams(p){const pos=BASE.pos.map(v=>v.slice()),vel=BASE.vel.map(v=>v.slice());
  FITBODIES.forEach((b,k)=>{pos[b]=[p[k*6],p[k*6+1],p[k*6+2]];vel[b]=[p[k*6+3],p[k*6+4],p[k*6+5]];});return{pos,vel};}
function propAt(p,days,maxStep){const s=seedFromParams(p);return NB.propagate(s.pos,s.vel,[0,...days],{relativistic:true,rtol:1e-12,atol:1e-15,maxStep,gm:GM.slice(0,NB10)}).results.slice(1);}

// angular residual vector (dimensionless) at fit samples
const FITDAYS=[];for(let k=1;k<=24;k++)FITDAYS.push(k*(2.0/24)*YR); // ~monthly, 0..2 yr short arc (Moon-friendly)
const HOLD=[];for(const y of [3,5,8,12,15])HOLD.push(y*YR);         // held-out 3..15 yr
function refVecs(jd){const o={};for(const[idx,key]of Object.entries(VKEY)){const s=V.equatorialJ2000(key,jd);o[idx]=[s.x,s.y,s.z];}const m=E.equatorialJ2000(jd);o[4]=[m.x,m.y,m.z];return o;}
const REF=FITDAYS.map(d=>refVecs(EPOCH+d));
function nbVecs(snap){const su=snap.bodies[0].pos,ea=snap.bodies[3].pos,o={};
  for(const idx of [1,2,3,5,6,7]){const b=snap.bodies[idx].pos;o[idx]=[b[0]-su[0],b[1]-su[1],b[2]-su[2]];}
  const mo=snap.bodies[4].pos;o[4]=[mo[0]-ea[0],mo[1]-ea[1],mo[2]-ea[2]];return o;}
function residuals(p,maxStep){const res=[];const snaps=propAt(p,FITDAYS,maxStep);
  snaps.forEach((sn,i)=>{const nb=nbVecs(sn),rf=REF[i];for(const idx of [1,2,3,4,5,6,7]){const dist=Math.hypot(...rf[idx]);
    res.push((nb[idx][0]-rf[idx][0])/dist,(nb[idx][1]-rf[idx][1])/dist,(nb[idx][2]-rf[idx][2])/dist);}});return res;}
function maxLonByBody(p,days,maxStep){const snaps=propAt(p,days,maxStep);const mx={};for(const idx of [1,2,3,4,5,6,7])mx[idx]=0;
  snaps.forEach(sn=>{const jd=EPOCH+sn.t,nb=nbVecs(sn);for(const idx of [1,2,3,5,6,7]){const s=V.equatorialJ2000(VKEY[idx],jd);
    mx[idx]=Math.max(mx[idx],Math.abs(dArc(eqEclLon(...nb[idx]),eqEclLon(s.x,s.y,s.z))));}
    const m=E.equatorialJ2000(jd);mx[4]=Math.max(mx[4],Math.abs(dArc(eqEclLon(...nb[4]),eqEclLon(m.x,m.y,m.z))));});return mx;}

function solveLin(A,b){const n=b.length,M=A.map((r,i)=>r.concat(b[i]));
  for(let c=0;c<n;c++){let pv=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[pv][c]))pv=r;[M[c],M[pv]]=[M[pv],M[c]];
    const d=M[c][c];if(Math.abs(d)<1e-300)continue;for(let j=c;j<=n;j++)M[c][j]/=d;
    for(let r=0;r<n;r++){if(r===c)continue;const f=M[r][c];for(let j=c;j<=n;j++)M[r][j]-=f*M[c][j];}}return M.map(r=>r[n]);}

const NAME={1:'Mercury',2:'Venus',3:'Earth',4:'Moon',5:'Mars',6:'Jupiter',7:'Saturn'};
function report(tag,p){const fit=maxLonByBody(p,FITDAYS,0.25),ho=maxLonByBody(p,HOLD,0.25);
  const fl=`fit ${(FITDAYS[0]/YR).toFixed(1)}-${(FITDAYS[FITDAYS.length-1]/YR).toFixed(0)}yr`;
  const hl=`held ${(HOLD[0]/YR).toFixed(0)}-${(HOLD[HOLD.length-1]/YR).toFixed(0)}yr`;
  console.log(`\n  ${tag}  (max |Δlon| arcsec)`);
  console.log('    body     '+fl.padStart(9)+'   '+hl.padStart(11));
  for(const idx of [1,2,3,5,6,4,7])console.log('    '+NAME[idx].padEnd(9)+fit[idx].toFixed(2).padStart(9)+ho[idx].toFixed(2).padStart(13));}

console.log('=== JOINT N-BODY DIFFERENTIAL-CORRECTOR ===');
console.log(`params: ${FITBODIES.length*6} (7 bodies x 6-state) · fit residuals: ${FITDAYS.length*7*3} · Sun+U/N fixed`);
let p=paramsFromSeed();
report('BEFORE (raw VSOP/ELP seed)', p);
const NP=FITBODIES.length*6, dPos=1e-9, dVel=1e-11, MS=0.5;
for(let iter=0;iter<6;iter++){
  const R0=residuals(p,MS),m=R0.length,J=Array.from({length:m},()=>new Array(NP).fill(0));
  for(let j=0;j<NP;j++){const step=(j%6<3)?dPos:dVel,pp=p.slice();pp[j]+=step;const Rp=residuals(pp,MS);for(let k=0;k<m;k++)J[k][j]=(Rp[k]-R0[k])/step;}
  const JTJ=Array.from({length:NP},()=>new Array(NP).fill(0)),JTr=new Array(NP).fill(0);
  for(let a=0;a<NP;a++){for(let b=0;b<NP;b++){let s=0;for(let k=0;k<m;k++)s+=J[k][a]*J[k][b];JTJ[a][b]=s;}let s=0;for(let k=0;k<m;k++)s+=J[k][a]*R0[k];JTr[a]=s;}
  for(let a=0;a<NP;a++)JTJ[a][a]*=(1+1e-6);
  const dp=solveLin(JTJ,JTr.map(x=>-x));for(let j=0;j<NP;j++)p[j]+=dp[j];
  let rms=0;for(const r of R0)rms+=r*r;rms=Math.sqrt(rms/R0.length)/DEG*3600;
  process.stdout.write(`  iter ${iter+1}: pre-step RMS ${rms.toFixed(3)}"  `);
}
console.log();
report('AFTER joint fit', p);
// how far each body's anchor moved
console.log('\n  anchor shifts (epoch state move):');
const p0=paramsFromSeed();
for(let k=0;k<FITBODIES.length;k++){const dp=Math.hypot(p[k*6]-p0[k*6],p[k*6+1]-p0[k*6+1],p[k*6+2]-p0[k*6+2])*AUKM;
  const dv=Math.hypot(p[k*6+3]-p0[k*6+3],p[k*6+4]-p0[k*6+4],p[k*6+5]-p0[k*6+5])*AUKM/86400*1000;
  console.log('    '+NAME[FITBODIES[k]].padEnd(9)+' Δpos '+dp.toFixed(1).padStart(9)+' km   Δvel '+dv.toFixed(3).padStart(8)+' mm/s');}
