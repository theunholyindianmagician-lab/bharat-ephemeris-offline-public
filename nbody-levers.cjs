'use strict';
/*
 * Three sovereign levers on the N-body cross-check:
 *   L1  add Uranus+Neptune (classical J2000 Kepler elements) -> kill Saturn's ~30" gap
 *   L2  account the lunar tidal (n-dot) term + confirm Earth-J2 already modelled
 *   L3  differential-correct the Moon's EPOCH ANCHOR (6-state) to the ELP trajectory
 *       -> show the ~12"/yr drift is an osculating-vs-mean seed error, not physics
 *
 * Seed stays sovereign-stack-internal: VSOP87 (6 planets, analytic pos+vel),
 * ELP2000 (Moon), and measured Kepler elements for Uranus/Neptune. dop853-nbody
 * (8th-order + EIH 1PN + Earth J2/J3/J4) is the propagator. Everything equ J2000.
 */
const path = require('path');
const R = (f) => require(path.join(__dirname, f));
const NB = R('dop853-nbody.js');
const V = R('vsop87-full.js');
const E = R('elp-moon.js');

const EPOCH = 2451545.0, DEG = Math.PI/180, YR = 365.25;
const OB = 84381.406/3600*DEG, cE = Math.cos(OB), sE = Math.sin(OB);
const GM = NB.STANDARD_GM;                        // 11 GMs, DE440
const VKEY = {1:'mercury',2:'venus',3:'earth',5:'mars',6:'jupiter',7:'saturn'};
const LAB = ['Sun','Mercury','Venus','Earth','Moon','Mars','Jupiter','Saturn','Uranus','Neptune'];

// ---- frame + angle helpers ----
const eqEclLon = (x,y,z) => { const lon=Math.atan2(y*cE+z*sE, x)/DEG; return (lon%360+360)%360; };
const eqEclLat = (x,y,z) => { const yе=y*cE+z*sE, zе=-y*sE+z*cE; return Math.atan2(zе, Math.hypot(x,yе))/DEG; };
const dArc = (a,b)=>{ let d=((a-b+540)%360)-180; return d*3600; };

// ---- classical J2000 heliocentric-ecliptic Kepler elements (Standish 1992; measured, not an ephemeris table) ----
// a(AU), e, i(deg), Omega(deg), varpi=long.peri(deg), L=mean long(deg) @ J2000
const ELEM = {
  uranus:  {a:19.19126393, e:0.04716771, i:0.76986, Om:74.22988, pi:170.96424, L:313.23218},
  neptune: {a:30.06896348, e:0.00858587, i:1.76917, Om:131.72169, pi:44.97135, L:304.88003},
};
function keplerEqState(el) {                      // -> {pos,vel} heliocentric EQUATORIAL J2000 (AU, AU/day)
  const a=el.a, e=el.e, i=el.i*DEG, Om=el.Om*DEG, w=(el.pi-el.Om)*DEG, M=((el.L-el.pi)%360)*DEG;
  let Ecc=M; for(let k=0;k<50;k++){ const dE=(Ecc-e*Math.sin(Ecc)-M)/(1-e*Math.cos(Ecc)); Ecc-=dE; if(Math.abs(dE)<1e-14)break; }
  const nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(Ecc/2), Math.sqrt(1-e)*Math.cos(Ecc/2));
  const r=a*(1-e*Math.cos(Ecc)), p=a*(1-e*e), GMs=GM[0], vf=Math.sqrt(GMs/p);
  const xo=r*Math.cos(nu), yo=r*Math.sin(nu), vxo=-vf*Math.sin(nu), vyo=vf*(e+Math.cos(nu));
  const cO=Math.cos(Om),sO=Math.sin(Om),ci=Math.cos(i),si=Math.sin(i),cw=Math.cos(w),sw=Math.sin(w);
  const P=[cO*cw-sO*sw*ci, sO*cw+cO*sw*ci, sw*si];   // perifocal->ecliptic Gauss vectors
  const Q=[-cO*sw-sO*cw*ci, -sO*sw+cO*cw*ci, cw*si];
  const ecl=(u,v)=>[P[0]*u+Q[0]*v, P[1]*u+Q[1]*v, P[2]*u+Q[2]*v];
  const pe=ecl(xo,yo), ve=ecl(vxo,vyo);
  const toEq=([x,y,z])=>[x, y*cE - z*sE, y*sE + z*cE]; // ecliptic->equatorial
  return {pos:toEq(pe), vel:toEq(ve)};
}

// ---- Moon geocentric state from ELP (7-pt velocity) ----
function moonGeo(jd){ const h=0.125, s=k=>E.equatorialJ2000(jd+k*h);
  const p=s(0),n3=s(-3),n2=s(-2),n1=s(-1),q1=s(1),q2=s(2),q3=s(3);
  const d=(m3,m2,m1,P1,P2,P3)=>(-m3/60+3*m2/20-3*m1/4+3*P1/4-3*P2/20+P3/60)/h;
  return {pos:[p.x,p.y,p.z], vel:[d(n3.x,n2.x,n1.x,q1.x,q2.x,q3.x),d(n3.y,n2.y,n1.y,q1.y,q2.y,q3.y),d(n3.z,n2.z,n1.z,q1.z,q2.z,q3.z)]}; }

// ---- build seed (nBodies = 8 or 10) ----
function seed(nBodies){
  const pos=Array.from({length:nBodies},()=>[0,0,0]), vel=Array.from({length:nBodies},()=>[0,0,0]);
  let eP,eV;
  for(const [idx,key] of Object.entries(VKEY)){ const s=V.equatorialJ2000(key,EPOCH); pos[idx]=[s.x,s.y,s.z]; vel[idx]=[s.vx,s.vy,s.vz]; if(key==='earth'){eP=pos[idx];eV=vel[idx];} }
  const m=moonGeo(EPOCH); pos[4]=[eP[0]+m.pos[0],eP[1]+m.pos[1],eP[2]+m.pos[2]]; vel[4]=[eV[0]+m.vel[0],eV[1]+m.vel[1],eV[2]+m.vel[2]];
  if(nBodies>=10){ const u=keplerEqState(ELEM.uranus), n=keplerEqState(ELEM.neptune); pos[8]=u.pos;vel[8]=u.vel; pos[9]=n.pos;vel[9]=n.vel; }
  return {pos,vel};
}
function prop(pos,vel,evalDays,nBodies){ return NB.propagate(pos,vel,evalDays,{relativistic:true,rtol:1e-13,atol:1e-16,maxStep:0.25,gm:GM.slice(0,nBodies)}); }

// ============ LEVER 1 : Uranus+Neptune ============
function lever1(){
  const days=[0]; for(let y=1;y<=30;y++)days.push(y*YR);
  const runN=(nB)=>{ const s=seed(nB); return prop(s.pos,s.vel,days,nB).results; };
  const r8=runN(8), r10=runN(10);
  console.log('\n==== LEVER 1 · add Uranus+Neptune (arcsec helio-lon vs VSOP) ====');
  console.log(['yr','Sat(8)','Sat(10)','Jup(8)','Jup(10)'].map(h=>String(h).padStart(9)).join(''));
  for(let k=0;k<r8.length;k++){ const yr=r8[k].t/YR; if(![1,5,10,20,30].includes(Math.round(yr)))continue;
    const jd=EPOCH+r8[k].t;
    const lon=(snap,i)=>{const b=snap.bodies[i].pos,su=snap.bodies[0].pos;return eqEclLon(b[0]-su[0],b[1]-su[1],b[2]-su[2]);};
    const ref=(key)=>{const s=V.equatorialJ2000(key,jd);return eqEclLon(s.x,s.y,s.z);};
    const row=[yr.toFixed(0),
      dArc(lon(r8[k],7),ref('saturn')).toFixed(2), dArc(lon(r10[k],7),ref('saturn')).toFixed(2),
      dArc(lon(r8[k],6),ref('jupiter')).toFixed(2), dArc(lon(r10[k],6),ref('jupiter')).toFixed(2)];
    console.log(row.map(c=>String(c).padStart(9)).join('')); }
}

// ============ LEVER 2 : lunar tidal (n-dot) magnitude ============
function lever2(){
  console.log('\n==== LEVER 2 · lunar tidal secular term (derived) + Earth-J2 status ====');
  // Lunar longitude tidal term: dL = 0.5 * ndot * (T_cy)^2, ndot ~= -25.858 "/cy^2 (Chapront 2002, LLR).
  const ndot = -25.858; // arcsec/century^2 in mean longitude
  for(const yr of [1,10,30,100]){ const Tcy=yr/100; console.log(`  tidal ΔL @ ${String(yr).padStart(3)} yr = ${(0.5*ndot*Tcy*Tcy).toFixed(3)} arcsec`); }
  console.log('  => negligible over decades (curved T^2); NOT the ~12"/yr LINEAR Moon drift.');
  console.log('  Earth J2/J3/J4 on Moon: ALREADY in dop853-nbody (lines 252-267, active in relativistic mode).');
}

// ============ LEVER 3 : differential-correct the Moon epoch anchor ============
function moonGeoLonNb(snap){ const mo=snap.bodies[4].pos, ea=snap.bodies[3].pos; return eqEclLon(mo[0]-ea[0],mo[1]-ea[1],mo[2]-ea[2]); }
function moonGeoVecNb(snap){ const mo=snap.bodies[4].pos, ea=snap.bodies[3].pos; return [mo[0]-ea[0],mo[1]-ea[1],mo[2]-ea[2]]; }
function refMoonVec(jd){ const m=E.equatorialJ2000(jd); return [m.x,m.y,m.z]; }
function refMoonLon(jd){ const m=E.equatorialJ2000(jd); return eqEclLon(m.x,m.y,m.z); }

function solve6(A,b){ // Gaussian elimination 6x6
  const n=6, M=A.map((r,i)=>r.concat(b[i]));
  for(let c=0;c<n;c++){ let piv=c; for(let r=c+1;r<n;r++) if(Math.abs(M[r][c])>Math.abs(M[piv][c]))piv=r; [M[c],M[piv]]=[M[piv],M[c]];
    const d=M[c][c]; if(Math.abs(d)<1e-300)continue; for(let j=c;j<=n;j++)M[c][j]/=d;
    for(let r=0;r<n;r++){ if(r===c)continue; const f=M[r][c]; for(let j=c;j<=n;j++)M[r][j]-=f*M[c][j]; } }
  return M.map(r=>r[n]);
}
function lever3(){
  console.log('\n==== LEVER 3 · differential-correct Moon epoch anchor (10-body model) ====');
  const nB=10;
  const sampleDays=[]; for(let k=1;k<=20;k++)sampleDays.push(k*0.5*YR); // 0.5..10 yr, 20 samples
  const s0=seed(nB);
  let moonState=[...s0.pos[4],...s0.vel[4]]; // 6-vector to fit
  const residuals=(mst)=>{ const s=seed(nB); s.pos[4]=[mst[0],mst[1],mst[2]]; s.vel[4]=[mst[3],mst[4],mst[5]];
    const out=prop(s.pos,s.vel,[0,...sampleDays],nB).results; const snaps=out.slice(1); // drop t=0
    const r=[]; for(const sn of snaps){ const jd=EPOCH+sn.t; const a=moonGeoVecNb(sn), b=refMoonVec(jd); r.push(a[0]-b[0],a[1]-b[1],a[2]-b[2]); } return r; };
  const rmsLon=(mst)=>{ const s=seed(nB); s.pos[4]=[mst[0],mst[1],mst[2]]; s.vel[4]=[mst[3],mst[4],mst[5]];
    const out=prop(s.pos,s.vel,[0,...sampleDays],nB).results; let mx=0; for(const sn of out.slice(1)){ const jd=EPOCH+sn.t; mx=Math.max(mx,Math.abs(dArc(moonGeoLonNb(sn),refMoonLon(jd)))); } return mx; };
  console.log('  Moon max |Δlon| over 0.5..10 yr BEFORE fit =', rmsLon(moonState).toFixed(2), 'arcsec');
  const dPos=1e-9, dVel=1e-11;
  for(let iter=0;iter<5;iter++){
    const R0=residuals(moonState); const m=R0.length; const J=Array.from({length:m},()=>new Array(6).fill(0));
    for(let p=0;p<6;p++){ const step=p<3?dPos:dVel; const mp=[...moonState]; mp[p]+=step; const Rp=residuals(mp); for(let k=0;k<m;k++)J[k][p]=(Rp[k]-R0[k])/step; }
    const JTJ=Array.from({length:6},()=>new Array(6).fill(0)), JTr=new Array(6).fill(0);
    for(let a=0;a<6;a++){ for(let b=0;b<6;b++){ let s=0; for(let k=0;k<m;k++)s+=J[k][a]*J[k][b]; JTJ[a][b]=s; } let s=0; for(let k=0;k<m;k++)s+=J[k][a]*R0[k]; JTr[a]=s; }
    for(let a=0;a<6;a++)JTJ[a][a]*=1.0+1e-9; // tiny Levenberg damping
    const dp=solve6(JTJ,JTr.map(x=>-x)); for(let p=0;p<6;p++)moonState[p]+=dp[p];
  }
  console.log('  Moon max |Δlon| over 0.5..10 yr AFTER  fit =', rmsLon(moonState).toFixed(2), 'arcsec');
  const s0v=[...s0.pos[4],...s0.vel[4]]; const dv=Math.hypot(moonState[3]-s0v[3],moonState[4]-s0v[4],moonState[5]-s0v[5]);
  const dp=Math.hypot(moonState[0]-s0v[0],moonState[1]-s0v[1],moonState[2]-s0v[2]);
  console.log('  anchor shift: |Δpos|=', (dp*1.496e8).toFixed(1),'km  |Δvel|=', (dv*1.496e8/86400).toFixed(4),'m/s  (how much the epoch state moved)');
}

lever1(); lever2(); lever3();
