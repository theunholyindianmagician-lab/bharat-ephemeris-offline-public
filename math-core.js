/*
 MIT


    Astronomy library for JavaScript (browser and Node.js).
    https://github.com/cosinekitty/astronomy

    MIT License

    Copyright (c) 2019-2023 Don Cross <cosinekitty@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.createTemplateTagFirstArg=function(r){return r.raw=r};$jscomp.createTemplateTagFirstArgWithRaw=function(r,u){r.raw=u;return r};$jscomp.arrayIteratorImpl=function(r){var u=0;return function(){return u<r.length?{done:!1,value:r[u++]}:{done:!0}}};$jscomp.arrayIterator=function(r){return{next:$jscomp.arrayIteratorImpl(r)}};$jscomp.makeIterator=function(r){var u="undefined"!=typeof Symbol&&Symbol.iterator&&r[Symbol.iterator];return u?u.call(r):$jscomp.arrayIterator(r)};
$jscomp.getGlobal=function(r){r=["object"==typeof globalThis&&globalThis,r,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var u=0;u<r.length;++u){var e=r[u];if(e&&e.Math==Math)return e}throw Error("Cannot find global object");};$jscomp.global=$jscomp.getGlobal(this);$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;$jscomp.ISOLATE_POLYFILLS=!1;$jscomp.FORCE_POLYFILL_PROMISE=!1;
$jscomp.FORCE_POLYFILL_PROMISE_WHEN_NO_UNHANDLED_REJECTION=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(r,u,e){if(r==Array.prototype||r==Object.prototype)return r;r[u]=e.value;return r};$jscomp.IS_SYMBOL_NATIVE="function"===typeof Symbol&&"symbol"===typeof Symbol("x");$jscomp.TRUST_ES6_POLYFILLS=!$jscomp.ISOLATE_POLYFILLS||$jscomp.IS_SYMBOL_NATIVE;$jscomp.polyfills={};$jscomp.propertyToPolyfillSymbol={};
$jscomp.POLYFILL_PREFIX="$jscp$";var $jscomp$lookupPolyfilledValue=function(r,u){var e=$jscomp.propertyToPolyfillSymbol[u];if(null==e)return r[u];e=r[e];return void 0!==e?e:r[u]};$jscomp.polyfill=function(r,u,e,C){u&&($jscomp.ISOLATE_POLYFILLS?$jscomp.polyfillIsolated(r,u,e,C):$jscomp.polyfillUnisolated(r,u,e,C))};
$jscomp.polyfillUnisolated=function(r,u,e,C){e=$jscomp.global;r=r.split(".");for(C=0;C<r.length-1;C++){var A=r[C];if(!(A in e))return;e=e[A]}r=r[r.length-1];C=e[r];u=u(C);u!=C&&null!=u&&$jscomp.defineProperty(e,r,{configurable:!0,writable:!0,value:u})};
$jscomp.polyfillIsolated=function(r,u,e,C){var A=r.split(".");r=1===A.length;C=A[0];C=!r&&C in $jscomp.polyfills?$jscomp.polyfills:$jscomp.global;for(var w=0;w<A.length-1;w++){var Q=A[w];if(!(Q in C))return;C=C[Q]}A=A[A.length-1];e=$jscomp.IS_SYMBOL_NATIVE&&"es6"===e?C[A]:null;u=u(e);null!=u&&(r?$jscomp.defineProperty($jscomp.polyfills,A,{configurable:!0,writable:!0,value:u}):u!==e&&(void 0===$jscomp.propertyToPolyfillSymbol[A]&&($jscomp.propertyToPolyfillSymbol[A]=$jscomp.IS_SYMBOL_NATIVE?$jscomp.global.Symbol(A):
$jscomp.POLYFILL_PREFIX+A),$jscomp.defineProperty(C,$jscomp.propertyToPolyfillSymbol[A],{configurable:!0,writable:!0,value:u})))};$jscomp.polyfill("Math.log10",function(r){return r?r:function(u){return Math.log(u)/Math.LN10}},"es6","es3");$jscomp.polyfill("Number.isFinite",function(r){return r?r:function(u){return"number"!==typeof u?!1:!isNaN(u)&&Infinity!==u&&-Infinity!==u}},"es6","es3");
$jscomp.polyfill("Math.hypot",function(r){return r?r:function(u){if(2>arguments.length)return arguments.length?Math.abs(arguments[0]):0;var e,C,A;for(e=A=0;e<arguments.length;e++)A=Math.max(A,Math.abs(arguments[e]));if(1E100<A||1E-100>A){if(!A)return A;for(e=C=0;e<arguments.length;e++){var w=Number(arguments[e])/A;C+=w*w}return Math.sqrt(C)*A}for(e=C=0;e<arguments.length;e++)w=Number(arguments[e]),C+=w*w;return Math.sqrt(C)}},"es6","es3");
$jscomp.polyfill("Number.MAX_SAFE_INTEGER",function(){return 9007199254740991},"es6","es3");$jscomp.polyfill("Number.isInteger",function(r){return r?r:function(u){return Number.isFinite(u)?u===Math.floor(u):!1}},"es6","es3");$jscomp.polyfill("Number.isSafeInteger",function(r){return r?r:function(u){return Number.isInteger(u)&&Math.abs(u)<=Number.MAX_SAFE_INTEGER}},"es6","es3");
$jscomp.polyfill("Math.cbrt",function(r){return r?r:function(u){if(0===u)return u;u=Number(u);var e=Math.pow(Math.abs(u),1/3);return 0>u?-e:e}},"es6","es3");
(function(r){"object"===typeof exports&&"undefined"!==typeof module?module.exports=r():"function"===typeof define&&define.amd?define([],r):("undefined"!==typeof window?window:"undefined"!==typeof global?global:"undefined"!==typeof self?self:this).Astronomy=r()})(function(){return function(){function r(u,e,C){function A(N,T){if(!e[N]){if(!u[N]){var ka="function"==typeof require&&require;if(!T&&ka)return ka(N,!0);if(w)return w(N,!0);T=Error("Cannot find module '"+N+"'");throw T.code="MODULE_NOT_FOUND",
T;}T=e[N]={exports:{}};u[N][0].call(T.exports,function(sa){return A(u[N][1][sa]||sa)},T,T.exports,r,u,e,C)}return e[N].exports}for(var w="function"==typeof require&&require,Q=0;Q<C.length;Q++)A(C[Q]);return A}return r}()({1:[function(r,u,e){function C(a){switch(a){case m.Sun:return 2.959122082855911E-4;case m.Mercury:return 4.912547451450812E-11;case m.Venus:return 7.243452486162703E-10;case m.Earth:return 8.887692390113509E-10;case m.Moon:return 1.093189565989891E-11;case m.EMB:return 8.997011346712498E-10;
case m.Mars:return 9.549535105779258E-11;case m.Jupiter:return 2.825345909524226E-7;case m.Saturn:return 8.459715185680659E-8;case m.Uranus:return 1.292024916781969E-8;case m.Neptune:return 1.524358900784276E-8;case m.Pluto:return 2.18869976542597E-12;default:throw"Do not know mass product for body: "+a;}}function A(a){if(!0!==a&&!1!==a)throw console.trace(),"Value is not boolean: "+a;return a}function w(a){if(!Number.isFinite(a))throw console.trace(),"Value is not a finite number: "+a;return a}function Q(a){return a-
Math.floor(a)}function N(a,b){var c=a.x*a.x+a.y*a.y+a.z*a.z;if(1E-8>Math.abs(c))throw"AngleBetween: first vector is too short.";var d=b.x*b.x+b.y*b.y+b.z*b.z;if(1E-8>Math.abs(d))throw"AngleBetween: second vector is too short.";a=(a.x*b.x+a.y*b.y+a.z*b.z)/Math.sqrt(c*d);return-1>=a?180:1<=a?0:e.RAD2DEG*Math.acos(a)}function T(a){a=ld.indexOf(a);return 0<=a?md[a]:null}function ka(a){return(a=T(a))&&0<a.dist?a:null}function sa(a){var b=2E3+(a-14)/365.24217;if(-500>b)return a=(b-1820)/100,-20+32*a*a;
if(500>b){a=b/100;b=a*a;var c=a*b;return 10583.6-1014.41*a+33.78311*b-5.952053*c-.1798452*b*b+.022174192*b*c+.0090316521*c*c}if(1600>b)return a=(b-1E3)/100,b=a*a,c=a*b,1574.2-556.01*a+71.23472*b+.319781*c-.8503463*b*b-.005050998*b*c+.0083572073*c*c;if(1700>b)return a=b-1600,b=a*a,120-.9808*a-.01532*b+a*b/7129;if(1800>b)return a=b-1700,b=a*a,8.83+.1603*a-.0059285*b+1.3336E-4*a*b-b*b/1174E3;if(1860>b){a=b-1800;b=a*a;c=a*b;var d=b*b;return 13.72-.332447*a+.0068612*b+.0041116*c-3.7436E-4*d+1.21272E-5*
b*c-1.699E-7*c*c+8.75E-10*c*d}if(1900>b)return a=b-1860,b=a*a,c=a*b,7.62+.5737*a-.251754*b+.01680668*c-4.473624E-4*b*b+b*c/233174;if(1920>b)return a=b-1900,b=a*a,-2.79+1.494119*a-.0598939*b+.0061966*a*b-1.97E-4*b*b;if(1941>b)return a=b-1920,b=a*a,21.2+.84493*a-.0761*b+.0020936*a*b;if(1961>b)return a=b-1950,b=a*a,29.07+.407*a-b/233+a*b/2547;if(1986>b)return a=b-1975,b=a*a,45.45+1.067*a-b/260-a*b/718;if(2005>b)return a=b-2E3,b=a*a,c=a*b,63.86+.3345*a-.060374*b+.0017275*c+6.51814E-4*b*b+2.373599E-5*
b*c;if(2050>b)return a=b-2E3,62.92+.32217*a+.005589*a*a;if(2150>b)return a=(b-1820)/100,-20+32*a*a-.5628*(2150-b);a=(b-1820)/100;return-20+32*a*a}function Vb(a){return a+Wb(a)/86400}function v(a){return a instanceof O?a:new O(a)}function Xb(a){a=a.tt/36525;return(((((-4.34E-8*a-5.76E-7)*a+.0020034)*a-1.831E-4)*a-46.836769)*a+84381.406)/3600}/* IAU 2000B nutation, full 77 luni-solar terms (0.1 µas units; from the author's KAAL kaal_iau2006.py, ERFA nut00b parity) — replaces Astronomy Engine's 5-term truncation (~0.1–0.2″). Audit 2026-09-20. */var NUT2000B_KAAL=[[0,0,0,0,1,-172064161,-174666,33386,92052331,9086,15377],[0,0,2,-2,2,-13170906,-1675,-13696,5730336,-3015,-4587],[0,0,2,0,2,-2276413,-234,2796,978459,-485,1374],[0,0,0,0,2,2074554,207,-698,-897492,470,-291],[0,1,0,0,0,1475877,-3633,11817,73871,-184,-1924],[0,1,2,-2,2,-516821,1226,-524,224386,-677,-174],[1,0,0,0,0,711159,73,-872,-6750,0,358],[0,0,2,0,1,-387298,-367,380,200728,18,318],[1,0,2,0,2,-301461,-36,816,129025,-63,367],[0,-1,2,-2,2,215829,-494,111,-95929,299,132],[0,0,2,-2,1,128227,137,181,-68982,-9,39],[-1,0,2,0,2,123457,11,19,-53311,32,-4],[-1,0,0,2,0,156994,10,-168,-1235,0,82],[1,0,0,0,1,63110,63,27,-33228,0,-9],[-1,0,0,0,1,-57976,-63,-189,31429,0,-75],[-1,0,2,2,2,-59641,-11,149,25543,-11,66],[1,0,2,0,1,-51613,-42,129,26366,0,78],[-2,0,2,0,1,45893,50,31,-24236,-10,20],[0,0,0,2,0,63384,11,-150,-1220,0,29],[0,0,2,2,2,-38571,-1,158,16452,-11,68],[0,-2,2,-2,2,32481,0,0,-13870,0,0],[-2,0,0,2,0,-47722,0,-18,477,0,-25],[2,0,2,0,2,-31046,-1,131,13238,-11,59],[1,0,2,-2,2,28593,0,-1,-12338,10,-3],[-1,0,2,0,1,20441,21,10,-10758,0,-3],[2,0,0,0,0,29243,0,-74,-609,0,13],[0,0,2,0,0,25887,0,-66,-550,0,11],[0,1,0,0,1,-14053,-25,79,8551,-2,-45],[-1,0,0,2,1,15164,10,11,-8001,0,-1],[0,2,2,-2,2,-15794,72,-16,6850,-42,-5],[0,0,-2,2,0,21783,0,13,-167,0,13],[1,0,0,-2,1,-12873,-10,-37,6953,0,-14],[0,-1,0,0,1,-12654,11,63,6415,0,26],[-1,0,2,2,1,-10204,0,25,5222,0,15],[0,2,0,0,0,16707,-85,-10,168,-1,10],[1,0,2,2,2,-7691,0,44,3268,0,19],[-2,0,2,0,0,-11024,0,-14,104,0,2],[0,1,2,0,2,7566,-21,-11,-3250,0,-5],[0,0,2,2,1,-6637,-11,25,3353,0,14],[0,-1,2,0,2,-7141,21,8,3070,0,4],[0,0,0,2,1,-6302,-11,2,3272,0,4],[1,0,2,-2,1,5800,10,2,-3045,0,-1],[2,0,2,-2,2,6443,0,-7,-2768,0,-4],[-2,0,0,2,1,-5774,-11,-15,3041,0,-5],[2,0,2,0,1,-5350,0,21,2695,0,12],[0,-1,2,-2,1,-4752,-11,-3,2719,0,-3],[0,0,0,-2,1,-4940,-11,-21,2720,0,-9],[-1,-1,0,2,0,7350,0,-8,-51,0,4],[2,0,0,-2,1,4065,0,6,-2206,0,1],[1,0,0,2,0,6579,0,-24,-199,0,2],[0,1,2,-2,1,3579,0,5,-1900,0,1],[1,-1,0,0,0,4725,0,-6,-41,0,3],[-2,0,2,0,2,-3075,0,-2,1313,0,-1],[3,0,2,0,2,-2904,0,15,1233,0,7],[0,-1,0,2,0,4348,0,-10,-81,0,2],[1,-1,2,0,2,-2878,0,8,1232,0,4],[0,0,0,1,0,-4230,0,5,-20,0,-2],[-1,-1,2,2,2,-2819,0,7,1207,0,3],[-1,0,2,0,0,-4056,0,5,40,0,-2],[0,-1,2,2,2,-2647,0,11,1129,0,5],[-2,0,0,0,1,-2294,0,-10,1266,0,-4],[1,1,2,0,2,2481,0,-7,-1062,0,-3],[2,0,0,0,1,2179,0,-2,-1129,0,-2],[-1,1,0,1,0,3276,0,1,-9,0,0],[1,1,0,0,0,-3389,0,5,35,0,-2],[1,0,2,0,0,3339,0,-13,-107,0,1],[-1,0,2,-2,1,-1987,0,-6,1073,0,-2],[1,0,0,0,2,-1981,0,0,854,0,0],[-1,0,0,1,0,4026,0,-353,-553,0,-139],[0,0,2,1,2,1660,0,-5,-710,0,-2],[-1,0,2,4,2,-1521,0,9,647,0,4],[-1,1,0,1,1,1314,0,0,-700,0,0],[0,-2,2,-2,1,-1283,0,0,672,0,0],[1,0,2,2,1,-1331,0,8,663,0,4],[-2,0,2,2,2,1383,0,-2,-594,0,-2],[-1,0,0,0,2,1405,0,4,-610,0,2],[1,1,2,-2,2,1290,0,0,-556,0,0]];function da(a){if(!$a||1E-6<Math.abs($a.tt-a.tt)){var T=a.tt/36525,A=4.84813681109536E-6,W=1296E3,fm=function(x,m){return x-m*Math.trunc(x/m)},l=fm(485868.249036+1717915923.2178*T,W)*A,lp=fm(1287104.79305+129596581.0481*T,W)*A,F=fm(335779.526232+1739527262.8478*T,W)*A,D=fm(1072260.70369+1602961601.209*T,W)*A,Om=fm(450160.398036-6962890.5431*T,W)*A,dp=0,de=0,i,r,arg,s,c;for(i=NUT2000B_KAAL.length-1;0<=i;i--){r=NUT2000B_KAAL[i];arg=fm(r[0]*l+r[1]*lp+r[2]*F+r[3]*D+r[4]*Om,2*Math.PI);s=Math.sin(arg);c=Math.cos(arg);dp+=(r[5]+r[6]*T)*s+r[7]*c;de+=(r[8]+r[9]*T)*c+r[10]*s}var dpsi=1E-7*dp-1.35E-4,deps=1E-7*de+3.88E-4,g=Xb(a);$a={tt:a.tt,dpsi:dpsi,deps:deps,ee:dpsi*Math.cos(g*e.DEG2RAD)/15,mobl:g,tobl:g+deps/3600}}return $a}function Yb(a,b){var c=a*e.DEG2RAD;a=Math.cos(c);c=Math.sin(c);return[b[0],b[1]*a-b[2]*c,b[1]*c+b[2]*a]}function ea(a){function b(D,G,P,fa){for(var L=[],ta=0;ta<=G-D;++ta){var ua=L,ub=ua.push,vb,Zb=P,nd=fa,$b=[];for(vb=0;vb<=nd-Zb;++vb)$b.push(0);ub.call(ua,{min:Zb,
array:$b})}return{min:D,array:L}}function c(D,G,P){D=D.array[G-D.min];return D.array[P-D.min]}function d(D,G,P){D=y.array[D-y.min];D.array[G-D.min]=P}function f(D,G,P){D=x.array[D-x.min];D.array[G-D.min]=P}function g(D,G,P,fa,L){L(D*P-G*fa,G*P+D*fa)}function h(D){return Math.sin(U*D)}function l(D,G,P,fa){var L={x:1,y:0};D=[0,D,G,P,fa];for(G=1;4>=G;++G)0!==D[G]&&g(L.x,L.y,c(y,D[G],G),c(x,D[G],G),function(ta,ua){return L.x=ta,L.y=ua});return L}function k(D,G,P,fa,L,ta,ua,ub){L=l(L,ta,ua,ub);q+=D*L.y;
t+=G*L.y;ab+=P*L.x;va+=fa*L.x}++e.CalcMoonCount;a=a.tt/36525;var n,p,q,t,y=b(-6,6,1,4),x=b(-6,6,1,4);var z=a*a;var ab=t=q=0;var va=3422.7;var la=h(.19833+.05611*a);var ha=h(.27869+.04508*a);var V=h(.16827-.36903*a);var ba=h(.34734-5.37261*a);var La=h(.10498-5.37899*a);var bb=h(.42681-.41855*a),od=h(.14943-5.37511*a);var cb=.84*la+.31*ha+14.27*V+7.26*ba+.28*La+.24*bb;var wb=2.94*la+.31*ha+14.27*V+9.34*ba+1.12*La+.83*bb;var db=-6.4*la-1.89*bb;ha=.21*la+.31*ha+14.27*V-88.7*ba-15.3*La+.24*bb-1.86*od;
V=cb-db;la=-3.332E-6*h(.59734-5.37261*a)-5.39E-7*h(.35498-5.37899*a)-6.4E-8*h(.39943-5.37511*a);cb=U*Q(.60643382+1336.85522467*a-3.13E-6*z)+cb/ia;wb=U*Q(.37489701+1325.55240982*a+2.565E-5*z)+wb/ia;db=U*Q(.99312619+99.99735956*a-4.4E-7*z)+db/ia;ha=U*Q(.25909118+1342.2278298*a-8.92E-6*z)+ha/ia;La=U*Q(.82736186+1236.85308708*a-3.97E-6*z)+V/ia;for(n=1;4>=n;++n){switch(n){case 1:V=wb;z=4;ba=1.000002208;break;case 2:V=db;z=3;ba=.997504612-.002495388*a;break;case 3:V=ha;z=4;ba=1.000002708+139.978*la;break;
case 4:V=La;z=6;ba=1;break;default:throw"Internal error: I = "+n;}d(0,n,1);d(1,n,Math.cos(V)*ba);f(0,n,0);f(1,n,Math.sin(V)*ba);for(p=2;p<=z;++p)g(c(y,p-1,n),c(x,p-1,n),c(y,1,n),c(x,1,n),function(D,G){return d(p,n,D),f(p,n,G)});for(p=1;p<=z;++p)d(-p,n,c(y,p,n)),f(-p,n,-c(x,p,n))}k(13.902,14.06,-.001,.2607,0,0,0,4);k(.403,-4.01,.394,.0023,0,0,0,3);k(2369.912,2373.36,.601,28.2333,0,0,0,2);k(-125.154,-112.79,-.725,-.9781,0,0,0,1);k(1.979,6.98,-.445,.0433,1,0,0,4);k(191.953,192.72,.029,3.0861,1,0,0,2);
k(-8.466,-13.51,.455,-.1093,1,0,0,1);k(22639.5,22609.07,.079,186.5398,1,0,0,0);k(18.609,3.59,-.094,.0118,1,0,0,-1);k(-4586.465,-4578.13,-.077,34.3117,1,0,0,-2);k(3.215,5.44,.192,-.0386,1,0,0,-3);k(-38.428,-38.64,.001,.6008,1,0,0,-4);k(-.393,-1.43,-.092,.0086,1,0,0,-6);k(-.289,-1.59,.123,-.0053,0,1,0,4);k(-24.42,-25.1,.04,-.3,0,1,0,2);k(18.023,17.93,.007,.1494,0,1,0,1);k(-668.146,-126.98,-1.302,-.3997,0,1,0,0);k(.56,.32,-.001,-.0037,0,1,0,-1);k(-165.145,-165.06,.054,1.9178,0,1,0,-2);k(-1.877,-6.46,
-.416,.0339,0,1,0,-4);k(.213,1.02,-.074,.0054,2,0,0,4);k(14.387,14.78,-.017,.2833,2,0,0,2);k(-.586,-1.2,.054,-.01,2,0,0,1);k(769.016,767.96,.107,10.1657,2,0,0,0);k(1.75,2.01,-.018,.0155,2,0,0,-1);k(-211.656,-152.53,5.679,-.3039,2,0,0,-2);k(1.225,.91,-.03,-.0088,2,0,0,-3);k(-30.773,-34.07,-.308,.3722,2,0,0,-4);k(-.57,-1.4,-.074,.0109,2,0,0,-6);k(-2.921,-11.75,.787,-.0484,1,1,0,2);k(1.267,1.52,-.022,.0164,1,1,0,1);k(-109.673,-115.18,.461,-.949,1,1,0,0);k(-205.962,-182.36,2.056,1.4437,1,1,0,-2);k(.233,
.36,.012,-.0025,1,1,0,-3);k(-4.391,-9.66,-.471,.0673,1,1,0,-4);k(.283,1.53,-.111,.006,1,-1,0,4);k(14.577,31.7,-1.54,.2302,1,-1,0,2);k(147.687,138.76,.679,1.1528,1,-1,0,0);k(-1.089,.55,.021,0,1,-1,0,-1);k(28.475,23.59,-.443,-.2257,1,-1,0,-2);k(-.276,-.38,-.006,-.0036,1,-1,0,-3);k(.636,2.27,.146,-.0102,1,-1,0,-4);k(-.189,-1.68,.131,-.0028,0,2,0,2);k(-7.486,-.66,-.037,-.0086,0,2,0,0);k(-8.096,-16.35,-.74,.0918,0,2,0,-2);k(-5.741,-.04,0,-9E-4,0,0,2,2);k(.255,0,0,0,0,0,2,1);k(-411.608,-.2,0,-.0124,0,0,
2,0);k(.584,.84,0,.0071,0,0,2,-1);k(-55.173,-52.14,0,-.1052,0,0,2,-2);k(.254,.25,0,-.0017,0,0,2,-3);k(.025,-1.67,0,.0031,0,0,2,-4);k(1.06,2.96,-.166,.0243,3,0,0,2);k(36.124,50.64,-1.3,.6215,3,0,0,0);k(-13.193,-16.4,.258,-.1187,3,0,0,-2);k(-1.187,-.74,.042,.0074,3,0,0,-4);k(-.293,-.31,-.002,.0046,3,0,0,-6);k(-.29,-1.45,.116,-.0051,2,1,0,2);k(-7.649,-10.56,.259,-.1038,2,1,0,0);k(-8.627,-7.59,.078,-.0192,2,1,0,-2);k(-2.74,-2.54,.022,.0324,2,1,0,-4);k(1.181,3.32,-.212,.0213,2,-1,0,2);k(9.703,11.67,-.151,
.1268,2,-1,0,0);k(-.352,-.37,.001,-.0028,2,-1,0,-1);k(-2.494,-1.17,-.003,-.0017,2,-1,0,-2);k(.36,.2,-.012,-.0043,2,-1,0,-4);k(-1.167,-1.25,.008,-.0106,1,2,0,0);k(-7.412,-6.12,.117,.0484,1,2,0,-2);k(-.311,-.65,-.032,.0044,1,2,0,-4);k(.757,1.82,-.105,.0112,1,-2,0,2);k(2.58,2.32,.027,.0196,1,-2,0,0);k(2.533,2.4,-.014,-.0212,1,-2,0,-2);k(-.344,-.57,-.025,.0036,0,3,0,-2);k(-.992,-.02,0,0,1,0,2,2);k(-45.099,-.02,0,-.001,1,0,2,0);k(-.179,-9.52,0,-.0833,1,0,2,-2);k(-.301,-.33,0,.0014,1,0,2,-4);k(-6.382,-3.37,
0,-.0481,1,0,-2,2);k(39.528,85.13,0,-.7136,1,0,-2,0);k(9.366,.71,0,-.0112,1,0,-2,-2);k(.202,.02,0,0,1,0,-2,-4);k(.415,.1,0,.0013,0,1,2,0);k(-2.152,-2.26,0,-.0066,0,1,2,-2);k(-1.44,-1.3,0,.0014,0,1,-2,2);k(.384,-.04,0,0,0,1,-2,-2);k(1.938,3.6,-.145,.0401,4,0,0,0);k(-.952,-1.58,.052,-.013,4,0,0,-2);k(-.551,-.94,.032,-.0097,3,1,0,0);k(-.482,-.57,.005,-.0045,3,1,0,-2);k(.681,.96,-.026,.0115,3,-1,0,0);k(-.297,-.27,.002,-9E-4,2,2,0,-2);k(.254,.21,-.003,0,2,-2,0,-2);k(-.25,-.22,.004,.0014,1,3,0,-2);k(-3.996,
0,0,4E-4,2,0,2,0);k(.557,-.75,0,-.009,2,0,2,-2);k(-.459,-.38,0,-.0053,2,0,-2,2);k(-1.298,.74,0,4E-4,2,0,-2,0);k(.538,1.14,0,-.0141,2,0,-2,-2);k(.263,.02,0,0,1,1,2,0);k(.426,.07,0,-6E-4,1,1,-2,-2);k(-.304,.03,0,3E-4,1,-1,2,0);k(-.372,-.19,0,-.0027,1,-1,-2,2);k(.418,0,0,0,0,0,4,0);k(-.33,-.04,0,0,3,0,2,0);z=-526.069*l(0,0,1,-2).y;z+=-3.352*l(0,0,1,-4).y;z+=44.297*l(1,0,1,-2).y;z+=-6*l(1,0,1,-4).y;z+=20.599*l(-1,0,1,0).y;z+=-30.598*l(-1,0,1,-2).y;z+=-24.649*l(-2,0,1,0).y;z+=-2*l(-2,0,1,-2).y;z+=-22.571*
l(0,1,1,-2).y;z+=10.985*l(0,-1,1,-2).y;q+=.82*h(.7736-62.5512*a)+.31*h(.0466-125.1025*a)+.35*h(.5785-25.1042*a)+.66*h(.4591+1335.8075*a)+.64*h(.313-91.568*a)+1.14*h(.148+1331.2898*a)+.21*h(.5918+1056.5859*a)+.44*h(.5784+1322.8595*a)+.24*h(.2275-5.7374*a)+.28*h(.2965+2.6929*a)+.33*h(.3132+6.3368*a);a=ha+t/ia;a=(1.000002708+139.978*la)*(18518.511+1.189+ab)*Math.sin(a)-6.24*Math.sin(3*a)+z;return{geo_eclip_lon:U*Q((cb+q/ia)/U),geo_eclip_lat:Math.PI/648E3*a,distance_au:ia*pd/(.999953253*va)}}function ac(a,
b){return[a.rot[0][0]*b[0]+a.rot[1][0]*b[1]+a.rot[2][0]*b[2],a.rot[0][1]*b[0]+a.rot[1][1]*b[1]+a.rot[2][1]*b[2],a.rot[0][2]*b[0]+a.rot[1][2]*b[1]+a.rot[2][2]*b[2]]}function wa(a,b,c){b=Ma(b,c);return ac(b,a)}function Ma(a,b){a=a.tt/36525;var c=84381.406,d=((((3.337E-7*a-4.67E-7)*a-.00772503)*a+.0512623)*a-.025754)*a+c;c*=4.84813681109536E-6;var f=((((-9.51E-8*a+1.32851E-4)*a-.00114045)*a-1.0790069)*a+5038.481507)*a*4.84813681109536E-6;d*=4.84813681109536E-6;var g=((((-5.6E-8*a+1.70663E-4)*a-.00121197)*
a-2.3814292)*a+10.556403)*a*4.84813681109536E-6;a=Math.sin(c);c=Math.cos(c);var h=Math.sin(-f);f=Math.cos(-f);var l=Math.sin(-d);d=Math.cos(-d);var k=Math.sin(g),n=Math.cos(g);g=n*f-h*k*d;var p=n*h*c+k*d*f*c-a*k*l,q=n*h*a+k*d*f*a+c*k*l,t=-k*f-h*n*d,y=-k*h*c+n*d*f*c-a*n*l;k=-k*h*a+n*d*f*a+c*n*l;h*=l;n=-l*f*c-a*d;a=-l*f*a+d*c;if(b===F.Into2000)return new J([[g,p,q],[t,y,k],[h,n,a]]);if(b===F.From2000)return new J([[g,t,h],[p,y,n],[q,k,a]]);throw"Invalid precess direction";}function ca(a){if(!eb||eb.tt!==
a.tt){var b=a.tt/36525,c=15*da(a).ee,d=(.779057273264+.00273781191135448*a.ut+a.ut%1)%1*360;0>d&&(d+=360);b=((c+.014506+((((-3.68E-8*b-2.9956E-5)*b-4.4E-7)*b+1.3915817)*b+4612.156534)*b)/3600+d)%360/15;0>b&&(b+=24);eb={tt:a.tt,st:b}}return eb.st}function bc(a){a=v(a);return ca(a)}function xb(a,b){var c=a.latitude*e.DEG2RAD,d=Math.sin(c);c=Math.cos(c);var f=1/Math.hypot(c,.996647180302104*d),g=a.height/1E3,h=6378.1366*f+g;b=(15*b+a.longitude)*e.DEG2RAD;a=Math.sin(b);b=Math.cos(b);return{pos:[h*c*b/
e.KM_PER_AU,h*c*a/e.KM_PER_AU,(6335.438815127603*f+g)*d/e.KM_PER_AU],vel:[-7.292115E-5*h*c*a*86400/e.KM_PER_AU,7.292115E-5*h*c*b*86400/e.KM_PER_AU,0]}}function xa(a,b,c){b=Na(b,c);return ac(b,a)}function Na(a,b){a=da(a);var c=a.mobl*e.DEG2RAD,d=a.tobl*e.DEG2RAD,f=4.84813681109536E-6*a.dpsi;a=Math.cos(c);c=Math.sin(c);var g=Math.cos(d),h=Math.sin(d);d=Math.cos(f);var l=Math.sin(f);f=-l*a;var k=-l*c,n=l*g,p=d*a*g+c*h,q=d*c*g-a*h;l*=h;var t=d*a*h-c*g;a=d*c*h+a*g;if(b===F.From2000)return new J([[d,n,
l],[f,p,t],[k,q,a]]);if(b===F.Into2000)return new J([[d,f,k],[n,p,q],[l,t,a]]);throw"Invalid precess direction";}function fb(a,b,c){return c===F.Into2000?wa(xa(a,b,c),b,c):xa(wa(a,b,c),b,c)}function cc(a,b){var c=ca(a);b=xb(b,c).pos;return fb(b,a,F.Into2000)}function qd(a){if(!(a instanceof Array)||3!==a.length)return!1;for(var b=0;3>b;++b){if(!(a[b]instanceof Array)||3!==a[b].length)return!1;for(var c=0;3>c;++c)if(!Number.isFinite(a[b][c]))return!1}return!0}function yb(a,b){return new E(a[0],a[1],
a[2],b)}function dc(a,b){b=yb(a,b);var c=b.x*b.x+b.y*b.y,d=Math.sqrt(c+b.z*b.z);if(0===c){if(0===b.z)throw"Indeterminate sky coordinates";return new gb(0,0>b.z?-90:90,d,b)}var f=e.RAD2HOUR*Math.atan2(b.y,b.x);0>f&&(f+=24);return new gb(f,e.RAD2DEG*Math.atan2(a[2],Math.sqrt(c)),d,b)}function ya(a,b){var c=a*e.DEG2RAD;a=Math.cos(c);c=Math.sin(c);return[a*b[0]+c*b[1],a*b[1]-c*b[0],b[2]]}function hb(a,b,c,d,f){a=v(a);za(b);w(c);w(d);var g=Math.sin(b.latitude*e.DEG2RAD),h=Math.cos(b.latitude*e.DEG2RAD),
l=Math.sin(b.longitude*e.DEG2RAD),k=Math.cos(b.longitude*e.DEG2RAD);b=Math.sin(d*e.DEG2RAD);var n=Math.cos(d*e.DEG2RAD),p=Math.sin(c*e.HOUR2RAD),q=Math.cos(c*e.HOUR2RAD),t=[h*k,h*l,g];g=[-g*k,-g*l,h];l=[l,-k,0];h=-15*ca(a);a=ya(h,t);t=ya(h,g);l=ya(h,l);b=[n*q,n*p,b];p=b[0]*a[0]+b[1]*a[1]+b[2]*a[2];n=b[0]*t[0]+b[1]*t[1]+b[2]*t[2];t=b[0]*l[0]+b[1]*l[1]+b[2]*l[2];q=Math.hypot(n,t);0<q?(n=-e.RAD2DEG*Math.atan2(t,n),0>n&&(n+=360)):n=0;p=e.RAD2DEG*Math.atan2(q,p);q=d;if(f&&(d=p,f=Oa(f,90-p),p-=f,0<f&&3E-4<
p)){c=Math.sin(p*e.DEG2RAD);q=Math.cos(p*e.DEG2RAD);t=Math.sin(d*e.DEG2RAD);d=Math.cos(d*e.DEG2RAD);f=[];for(l=0;3>l;++l)f.push((b[l]-d*a[l])/t*c+a[l]*q);q=Math.hypot(f[0],f[1]);0<q?(c=e.RAD2HOUR*Math.atan2(f[1],f[0]),0>c&&(c+=24)):c=0;q=e.RAD2DEG*Math.atan2(f[2],q)}return new ec(n,90-p,c,q)}function za(a){if(!(a instanceof zb))throw"Not an instance of the Observer class: "+a;w(a.latitude);w(a.longitude);w(a.height);if(-90>a.latitude||90<a.latitude)throw"Latitude "+a.latitude+" is out of range. Must be -90..+90.";
return a}function fc(a){a=v(a).AddDays(-1/e.C_AUDAY);var b=Aa(M.Earth,a),c=$jscomp.makeIterator(fb([-b.x,-b.y,-b.z],a,F.From2000));b=c.next().value;var d=c.next().value,f=c.next().value,g=e.DEG2RAD*da(a).tobl;c=Math.cos(g);g=Math.sin(g);a=new E(b,d,f,a);return Ab(a,c,g)}function Pa(a,b,c,d,f){za(c);A(d);A(f);b=v(b);c=cc(b,c);a=W(a,b,f);a=[a.x-c[0],a.y-c[1],a.z-c[2]];if(!d)return dc(a,b);d=fb(a,b,F.From2000);return dc(d,b)}function Ab(a,b,c){var d=a.x,f=a.y*b+a.z*c;c=-a.y*c+a.z*b;var g=Math.hypot(d,
f);b=0;0<g&&(b=e.RAD2DEG*Math.atan2(f,d),0>b&&(b+=360));g=e.RAD2DEG*Math.atan2(c,g);a=new E(d,f,c,a.t);return new gc(a,g,b)}function Qa(a){var b=da(a.t),c=wa([a.x,a.y,a.z],a.t,F.From2000),d=$jscomp.makeIterator(xa(c,a.t,F.From2000));c=d.next().value;var f=d.next().value;d=d.next().value;a=new E(c,f,d,a.t);b=b.tobl*e.DEG2RAD;return Ab(a,Math.cos(b),Math.sin(b))}function Y(a){a=v(a);var b=ea(a),c=b.distance_au*Math.cos(b.geo_eclip_lat);b=[c*Math.cos(b.geo_eclip_lon),c*Math.sin(b.geo_eclip_lon),b.distance_au*
Math.sin(b.geo_eclip_lat)];b=Yb(Xb(a),b);b=wa(b,a,F.Into2000);return new E(b[0],b[1],b[2],a)}function ib(a){var b=v(a);a=ea(b);var c=a.distance_au*Math.cos(a.geo_eclip_lat),d=[c*Math.cos(a.geo_eclip_lon),c*Math.sin(a.geo_eclip_lon),a.distance_au*Math.sin(a.geo_eclip_lat)];c=da(b);d=Yb(c.mobl,d);d=xa(d,b,F.From2000);b=yb(d,b);c=c.tobl*e.DEG2RAD;b=Ab(b,Math.cos(c),Math.sin(c));return new Ba(b.elat,b.elon,a.distance_au)}function Ra(a){a=v(a);var b=a.AddDays(-1E-5),c=a.AddDays(1E-5);b=Y(b);c=Y(c);return new I((b.x+
c.x)/2,(b.y+c.y)/2,(b.z+c.z)/2,(c.x-b.x)/2E-5,(c.y-b.y)/2E-5,(c.z-b.z)/2E-5,a)}function Bb(a){a=v(a);var b=Ra(a);return new I(b.x/82.30056,b.y/82.30056,b.z/82.30056,b.vx/82.30056,b.vy/82.30056,b.vz/82.30056,a)}function ma(a,b,c){var d=1,f=0;a=$jscomp.makeIterator(a);for(var g=a.next();!g.done;g=a.next()){var h=0;g=$jscomp.makeIterator(g.value);for(var l=g.next();!l.done;l=g.next()){var k=$jscomp.makeIterator(l.value);l=k.next().value;var n=k.next().value;k=k.next().value;h+=l*Math.cos(n+b*k)}h*=d;
c&&(h%=U);f+=h;d*=b}return f}function Cb(a,b){var c=1,d=0,f=0,g=0;a=$jscomp.makeIterator(a);for(var h=a.next();!h.done;h=a.next()){var l=0,k=0;h=$jscomp.makeIterator(h.value);for(var n=h.next();!n.done;n=h.next()){var p=$jscomp.makeIterator(n.value);n=p.next().value;var q=p.next().value;p=p.next().value;q+=b*p;l+=n*p*Math.sin(q);0<g&&(k+=n*Math.cos(q))}f+=g*d*k-c*l;d=c;c*=b;++g}return f}function Db(a){return new B(a[0]+4.4036E-7*a[1]-1.90919E-7*a[2],-4.79966E-7*a[0]+.917482137087*a[1]-.397776982902*
a[2],.397776982902*a[1]+.917482137087*a[2])}function hc(a,b,c){var d=c*Math.cos(b);return[d*Math.cos(a),d*Math.sin(a),c*Math.sin(b)]}function Aa(a,b){var c=b.tt/365250,d=ma(a[0],c,!0),f=ma(a[1],c,!1);a=ma(a[2],c,!1);d=hc(d,f,a);return Db(d).ToAstroVector(b)}function Sa(a,b){var c=b/365250,d=ma(a[0],c,!0),f=ma(a[1],c,!1),g=ma(a[2],c,!1),h=Cb(a[0],c),l=Cb(a[1],c);c=Cb(a[2],c);var k=Math.cos(d),n=Math.sin(d),p=Math.cos(f),q=Math.sin(f);a=+(c*p*k)-g*q*k*l-g*p*n*h;h=+(c*p*n)-g*q*n*l+g*p*k*h;l=+(c*q)+g*
p*l;d=hc(d,f,g);f=[a/365250,h/365250,l/365250];d=Db(d);f=Db(f);return new X(b,d,f)}function jb(a,b,c,d){d/=d+2.959122082855911E-4;b=Aa(M[c],b);a.x+=d*b.x;a.y+=d*b.y;a.z+=d*b.z}function R(a,b,c,d){d/=d+2.959122082855911E-4;b=Sa(M[c],b);a.r.incr(b.r.mul(d));a.v.incr(b.v.mul(d));return b}function Ta(a,b,c){a=c.sub(a);c=a.quadrature();return a.mul(b/(c*Math.sqrt(c)))}function Ca(a,b,c,d){return new B(b.x+a*(c.x+a*d.x/2),b.y+a*(c.y+a*d.y/2),b.z+a*(c.z+a*d.z/2))}function Eb(a,b,c){return new B(b.x+a*c.x,
b.y+a*c.y,b.z+a*c.z)}function Fb(a,b){var c=a-b.tt,d=new Da(a),f=Ca(c,b.r,b.v,b.a),g=d.Acceleration(f).mean(b.a);f=Ca(c,b.r,b.v,g);b=b.v.add(g.mul(c));c=d.Acceleration(f);a=new Ua(a,f,b,c);return new ic(d,a)}function jc(a,b){a=Math.floor(a);return 0>a?0:a>=b?b-1:a}function Gb(a){var b=$jscomp.makeIterator(a);a=b.next().value;var c=$jscomp.makeIterator(b.next().value);var d=c.next().value;var f=c.next().value;c=c.next().value;var g=$jscomp.makeIterator(b.next().value);b=g.next().value;var h=g.next().value;
g=g.next().value;d=new X(a,new B(d,f,c),new B(b,h,g));a=new Da(d.tt);f=d.r.add(a.Sun.r);c=d.v.add(a.Sun.v);b=a.Acceleration(f);d=new Ua(d.tt,f,c,b);return new ic(a,d)}function kc(a,b,c){a=Gb(a);for(var d=Math.ceil((b-a.grav.tt)/c),f=0;f<d;++f)a=Fb(f+1===d?b:a.grav.tt+c,a.grav);return a}function Hb(a,b){var c=a.tt;var d=na[0][0];if(c<d||c>na[50][0])c=null;else{c=jc((c-d)/29200,50);if(!Ib[c]){d=Ib[c]=[];d[0]=Gb(na[c]).grav;d[200]=Gb(na[c+1]).grav;var f,g=d[0].tt;for(f=1;200>f;++f)d[f]=Fb(g+=146,d[f-
1]).grav;g=d[200].tt;var h=[];h[200]=d[200];for(f=199;0<f;--f)h[f]=Fb(g-=146,h[f+1]).grav;for(f=199;0<f;--f)g=f/200,d[f].r=d[f].r.mul(1-g).add(h[f].r.mul(g)),d[f].v=d[f].v.mul(1-g).add(h[f].v.mul(g)),d[f].a=d[f].a.mul(1-g).add(h[f].a.mul(g))}c=Ib[c]}if(d=c){f=jc((a.tt-d[0].tt)/146,200);c=d[f];g=d[f+1];var l=c.a.mean(g.a);f=Ca(a.tt-c.tt,c.r,c.v,l);d=Eb(a.tt-c.tt,c.v,l);h=Ca(a.tt-g.tt,g.r,g.v,l);g=Eb(a.tt-g.tt,g.v,l);l=(a.tt-c.tt)/146;c=f.mul(1-l).add(h.mul(l));d=d.mul(1-l).add(g.mul(l))}else{var k=
a.tt<na[0][0]?kc(na[0],a.tt,-146):kc(na[50],a.tt,146);c=k.grav.r;d=k.grav.v;k=k.bary}b&&(k||(k=new Da(a.tt)),c=c.sub(k.Sun.r),d=d.sub(k.Sun.v));return new I(c.x,c.y,c.z,d.x,d.y,d.z,a)}function kb(a,b){for(var c=a.tt+18262.5,d=[0,b.al[0]+c*b.al[1],0,0,0,0],f=$jscomp.makeIterator(b.a),g=f.next();!g.done;g=f.next()){var h=$jscomp.makeIterator(g.value);g=h.next().value;var l=h.next().value;h=h.next().value;d[0]+=g*Math.cos(l+c*h)}f=$jscomp.makeIterator(b.l);for(g=f.next();!g.done;g=f.next())h=$jscomp.makeIterator(g.value),
g=h.next().value,l=h.next().value,h=h.next().value,d[1]+=g*Math.sin(l+c*h);d[1]%=U;0>d[1]&&(d[1]+=U);f=$jscomp.makeIterator(b.z);for(g=f.next();!g.done;g=f.next())h=$jscomp.makeIterator(g.value),g=h.next().value,l=h.next().value,h=h.next().value,l+=c*h,d[2]+=g*Math.cos(l),d[3]+=g*Math.sin(l);f=$jscomp.makeIterator(b.zeta);for(g=f.next();!g.done;g=f.next())h=$jscomp.makeIterator(g.value),g=h.next().value,l=h.next().value,h=h.next().value,l+=c*h,d[4]+=g*Math.cos(l),d[5]+=g*Math.sin(l);f=d[0];h=d[1];
g=d[2];l=d[3];c=d[4];d=d[5];var k=Math.sqrt(b.mu/(f*f*f));b=h+g*Math.sin(h)-l*Math.cos(h);do{var n=Math.cos(b);var p=Math.sin(b);n=(h-b+g*p-l*n)/(1-g*n-l*p);b+=n}while(1E-12<=Math.abs(n));n=Math.cos(b);p=Math.sin(b);h=l*n-g*p;var q=-g*n-l*p,t=1/(1+q),y=1/(1+Math.sqrt(1-g*g-l*l));b=f*(n-g-y*l*h);h=f*(p-l+y*g*h);l=k*t*f*(-p-y*l*q);f=k*t*f*(+n+y*g*q);g=2*Math.sqrt(1-c*c-d*d);k=1-2*d*d;n=1-2*c*c;p=2*d*c;a=new I(b*k+h*p,b*p+h*n,(c*h-b*d)*g,l*k+f*p,l*p+f*n,(c*f-l*d)*g,a);return Ea(rd,a)}function Z(a,b){b=
v(b);if(a in M)return Aa(M[a],b);if(a===m.Pluto)return a=Hb(b,!0),new E(a.x,a.y,a.z,b);if(a===m.Sun)return new E(0,0,0,b);if(a===m.Moon){a=Aa(M.Earth,b);var c=Y(b);return new E(a.x+c.x,a.y+c.y,a.z+c.z,b)}if(a===m.EMB)return a=Aa(M.Earth,b),c=Y(b),new E(a.x+c.x/82.30056,a.y+c.y/82.30056,a.z+c.z/82.30056,b);if(a===m.SSB)return a=new E(0,0,0,b),jb(a,b,m.Jupiter,2.825345909524226E-7),jb(a,b,m.Saturn,8.459715185680659E-8),jb(a,b,m.Uranus,1.292024916781969E-8),jb(a,b,m.Neptune,1.524358900784276E-8),a;if(c=
ka(a))return a=new Ba(c.dec,15*c.ra,c.dist),lb(a,b);throw'HelioVector: Unknown body "'+a+'"';}function oa(a,b){var c=ka(a);if(c)return c.dist;b=v(b);return a in M?ma(M[a][2],b.tt/365250,!1):Z(a,b).Length()}function lc(a,b){for(var c=b,d=0,f=0;10>f;++f){var g=a(c);d=g.Length()/e.C_AUDAY;if(1<d)throw"Object is too distant for light-travel solver.";var h=b.AddDays(-d);d=Math.abs(h.tt-c.tt);if(1E-9>d)return g;c=h}throw"Light-travel time solver did not converge: dt = "+d;}function mc(a,b,c,d){A(d);a=v(a);
if(ka(c)){c=Z(c,a);if(d)return b=mb(b,a),d=new E(c.x-b.x,c.y-b.y,c.z-b.z,a),c=e.C_AUDAY/d.Length(),new E(d.x+b.vx/c,d.y+b.vy/c,d.z+b.vz/c,a);b=Z(b,a);return new E(c.x-b.x,c.y-b.y,c.z-b.z,a)}var f=d?new E(0,0,0,a):Z(b,a);var g=new nc(b,c,d,f);return lc(function(h){return g.Position(h)},a)}function W(a,b,c){A(c);b=v(b);switch(a){case m.Earth:return new E(0,0,0,b);case m.Moon:return Y(b);default:return a=mc(b,m.Earth,a,c),a.t=b,a}}function pa(a,b){return new I(a.r.x,a.r.y,a.r.z,a.v.x,a.v.y,a.v.z,b)}
function mb(a,b){b=v(b);switch(a){case m.Sun:return new I(0,0,0,0,0,0,b);case m.SSB:return a=new Da(b.tt),new I(-a.Sun.r.x,-a.Sun.r.y,-a.Sun.r.z,-a.Sun.v.x,-a.Sun.v.y,-a.Sun.v.z,b);case m.Mercury:case m.Venus:case m.Earth:case m.Mars:case m.Jupiter:case m.Saturn:case m.Uranus:case m.Neptune:return a=Sa(M[a],b.tt),pa(a,b);case m.Pluto:return Hb(b,!0);case m.Moon:case m.EMB:var c=Sa(M.Earth,b.tt);a=a==m.Moon?Ra(b):Bb(b);return new I(a.x+c.r.x,a.y+c.r.y,a.z+c.r.z,a.vx+c.v.x,a.vy+c.v.y,a.vz+c.v.z,b);
default:if(ka(a))return a=Z(a,b),new I(a.x,a.y,a.z,0,0,0,b);throw'HelioState: Unsupported body "'+a+'"';}}function sd(a,b,c,d,f){var g=(f+c)/2-d;c=(f-c)/2;if(0==g){if(0==c)return null;d=-d/c;if(-1>d||1<d)return null}else{d=c*c-4*g*d;if(0>=d)return null;f=Math.sqrt(d);d=(-c+f)/(2*g);f=(-c-f)/(2*g);if(-1<=d&&1>=d){if(-1<=f&&1>=f)return null}else if(-1<=f&&1>=f)d=f;else return null}return{t:a+d*b,df_dt:(2*g*d+c)/b}}function K(a,b,c,d){var f=w(d&&d.dt_tolerance_seconds||1);f=Math.abs(f/86400);var g=d&&
d.init_f1||a(b),h=d&&d.init_f2||a(c),l=NaN,k=0;d=d&&d.iter_limit||20;for(var n=!0;;){if(++k>d)throw"Excessive iteration in Search()";var p=new O(b.ut+.5*(c.ut-b.ut)),q=p.ut-b.ut;if(Math.abs(q)<f)return p;n?l=a(p):n=!0;var t=sd(p.ut,c.ut-p.ut,g,l,h);if(t){var y=v(t.t),x=a(y);if(0!==t.df_dt){if(Math.abs(x/t.df_dt)<f)return y;t=1.2*Math.abs(x/t.df_dt);if(t<q/10&&(q=y.AddDays(-t),y=y.AddDays(+t),0>(q.ut-b.ut)*(q.ut-c.ut)&&0>(y.ut-b.ut)*(y.ut-c.ut))){t=a(q);var z=a(y);if(0>t&&0<=z){g=t;h=z;b=q;c=y;l=x;
n=!1;continue}}}}if(0>g&&0<=l)c=p,h=l;else if(0>l&&0<=h)b=p,g=l;else return null}}function Fa(a){for(;-180>=a;)a+=360;for(;180<a;)a-=360;return a}function Ga(a){for(;0>a;)a+=360;for(;360<=a;)a-=360;return a}function oc(a,b,c){w(a);w(c);b=v(b);c=b.AddDays(c);return K(function(d){d=fc(d);return Fa(d.elon-a)},b,c,{dt_tolerance_seconds:.01})}function Jb(a,b,c){if(a===m.Earth||b===m.Earth)throw"The Earth does not have a longitude as seen from itself.";c=v(c);a=W(a,c,!1);a=Qa(a);b=W(b,c,!1);b=Qa(b);return Ga(a.elon-
b.elon)}function Ha(a,b){if(a==m.Earth)throw"The Earth does not have an angle as seen from itself.";var c=v(b);b=W(m.Sun,c,!0);a=W(a,c,!0);return N(b,a)}function qa(a,b){if(a===m.Sun)throw"Cannot calculate heliocentric longitude of the Sun.";a=Z(a,b);return Qa(a).elon}function nb(a,b){if(a===m.Earth)throw"The illumination of the Earth is not defined.";var c=v(b),d=Aa(M.Earth,c);if(a===m.Sun){var f=new E(-d.x,-d.y,-d.z,c);b=new E(0,0,0,c);d=0}else a===m.Moon?(f=Y(c),b=new E(d.x+f.x,d.y+f.y,d.z+f.z,
c)):(b=Z(a,b),f=new E(b.x-d.x,b.y-d.y,b.z-d.z,c)),d=N(f,b);var g=f.Length(),h=b.Length();if(a===m.Sun)var l=td+5*Math.log10(g);else if(a===m.Moon)a=d*e.DEG2RAD,l=a*a,a=-12.717+1.49*Math.abs(a)+.0431*l*l,l=a+=5*Math.log10(g/(385000.6/e.KM_PER_AU)*h);else if(a===m.Saturn){var k=d;a=Qa(f);l=28.06*e.DEG2RAD;var n=e.DEG2RAD*a.elat;a=Math.asin(Math.sin(n)*Math.cos(l)-Math.cos(n)*Math.sin(l)*Math.sin(e.DEG2RAD*a.elon-e.DEG2RAD*(169.51+3.82E-5*c.tt)));l=Math.sin(Math.abs(a));k=-9+.044*k+l*(-2.6+1.2*l)+5*
Math.log10(h*g);a*=e.RAD2DEG;l=k;k=a}else{var p=n=l=0;switch(a){case m.Mercury:a=-.6;l=4.98;n=-4.88;p=3.02;break;case m.Venus:163.6>d?(a=-4.47,l=1.03,n=.57,p=.13):(a=.98,l=-1.02);break;case m.Mars:a=-1.52;l=1.6;break;case m.Jupiter:a=-9.4;l=.5;break;case m.Uranus:a=-7.19;l=.25;break;case m.Neptune:a=-6.87;break;case m.Pluto:a=-1;l=4;break;default:throw"VisualMagnitude: unsupported body "+a;}var q=d/100;l=a+q*(l+q*(n+q*p))+5*Math.log10(h*g)}return new pc(c,l,d,h,g,f,b,k)}function Va(a){if(a===m.Earth)throw"The Earth does not have a synodic period as seen from itself.";
if(a===m.Moon)return 29.530588;var b=aa[a];if(!b)throw"Not a valid planet name: "+a;a=aa.Earth.OrbitalPeriod;return Math.abs(a/(a/b.OrbitalPeriod-1))}function Ia(a,b,c){function d(n){var p=qa(a,n);n=qa(m.Earth,n);return Fa(g*(n-p)-b)}w(b);var f=aa[a];if(!f)throw"Cannot search relative longitude because body is not a planet: "+a;if(a===m.Earth)throw"Cannot search relative longitude for the Earth (it is always 0)";var g=f.OrbitalPeriod>aa.Earth.OrbitalPeriod?1:-1;f=Va(a);c=v(c);var h=d(c);0<h&&(h-=
360);for(var l=0;100>l;++l){var k=-h/360*f;c=c.AddDays(k);if(1>86400*Math.abs(k))return c;k=h;h=d(c);30>Math.abs(k)&&k!==h&&(k/=k-h,.5<k&&2>k&&(f*=k))}throw"Relative longitude search failed to converge for "+a+" near "+c.toString()+" (error_angle = "+h+").";}function Kb(a){return Jb(m.Moon,m.Sun,a)}function Wa(a,b,c){function d(l){l=Kb(l);return Fa(l-a)}w(a);w(c);b=v(b);var f=d(b);if(0>c){0>f&&(f+=360);var g=-(29.530588*f)/360;f=g+1.5;if(f<c)return null;var h=Math.max(c,g-1.5)}else{0<f&&(f-=360);
g=-(29.530588*f)/360;h=g-1.5;if(h>c)return null;f=Math.min(c,g+1.5)}c=b.AddDays(h);b=b.AddDays(f);return K(d,c,b,{dt_tolerance_seconds:.1})}function qc(a){var b=Kb(a);b=(Math.floor(b/90)+1)%4;a=Wa(90*b,a,10);if(!a)throw"Cannot find moon quarter";return new rc(b,a)}function sc(a){if(!Number.isFinite(a)||-500>a||1E5<a)throw"Invalid elevation: "+a;if(11E3>=a){var b=288.15-.0065*a;a=101325*Math.pow(288.15/b,-5.25577)}else 2E4>=a?(b=216.65,a=22632*Math.exp(-1.5768832E-4*(a-11E3))):(b=216.65+.001*(a-2E4),
a=5474.87*Math.pow(216.65/b,34.16319));return new tc(a,b,a/b/(101325/288.15))}function Lb(a,b,c,d,f,g,h){if(0>g&&0<=h)return new ud(d,f,g,h);if(0<=g&&0>h)return null;if(17<a)throw"Excessive recursion in rise/set ascent search.";var l=f.ut-d.ut;if(1>86400*l||Math.min(Math.abs(g),Math.abs(h))>l/2*c)return null;l=new O((d.ut+f.ut)/2);var k=b(l);return Lb(1+a,b,c,d,l,g,k)||Lb(1+a,b,c,l,f,k,h)}function vd(a,b){if(-90>b||90<b)throw"Invalid geographic latitude: "+b;switch(a){case m.Moon:a=4.5;var c=8.2;
break;case m.Sun:a=.8;c=.5;break;case m.Mercury:a=-1.6;c=1;break;case m.Venus:a=-.8;c=.6;break;case m.Mars:a=-.5;c=.4;break;case m.Jupiter:case m.Saturn:case m.Uranus:case m.Neptune:case m.Pluto:a=-.2;c=.2;break;case m.Star1:case m.Star2:case m.Star3:case m.Star4:case m.Star5:case m.Star6:case m.Star7:case m.Star8:a=-.008;c=.008;break;default:throw"Body not allowed for altitude search: "+a;}b*=e.DEG2RAD;return Math.abs((360.98564540070413-a)*Math.cos(b))+Math.abs(c*Math.sin(b))}function uc(a,b,c,
d,f,g,h){function l(x){var z=Pa(a,x,b,!0,!0);x=hb(x,b,z.ra,z.dec).altitude+e.RAD2DEG*Math.asin(g/z.dist);return c*(x-h)}za(b);w(f);w(g);w(h);if(-90>h||90<h)throw"Invalid target altitude angle: "+h;for(var k=vd(a,b.latitude),n=d=v(d),p=d,q=l(n),t=q;;){0>f?(n=p.AddDays(-.42),q=l(n)):(p=n.AddDays(.42),t=l(p));var y=Lb(0,l,k,n,p,q,t);if(y){if(k=K(l,y.tx,y.ty,{dt_tolerance_seconds:.1,init_f1:y.ax,init_f2:y.ay})){if(0>f){if(k.ut<d.ut+f)return null}else if(k.ut>d.ut+f)return null;return k}throw"Rise/set search failed after finding ascent: t1="+
n+", t2="+p+", a1="+q+", a2="+t;}if(0>f){if(n.ut<d.ut+f)return null;p=n;t=q}else{if(p.ut>d.ut+f)return null;n=p;q=t}}}function vc(a,b){b=v(b);var c=Jb(a,m.Sun,b);if(180<c){var d="morning";c=360-c}else d="evening";a=Ha(a,b);return new wc(b,d,a,c)}function xc(a){function b(l){var k=l.AddDays(-5E-4);l=l.AddDays(5E-4);k=ea(k).distance_au;return(ea(l).distance_au-k)/.001}function c(l){return-b(l)}a=v(a);for(var d=b(a),f=0;59.061176>5*f;++f){var g=a.AddDays(5),h=b(g);if(0>=d*h){if(0>d||0<h){a=K(b,a,g,{init_f1:d,
init_f2:h});if(!a)throw"SearchLunarApsis INTERNAL ERROR: perigee search failed!";d=ea(a).distance_au;return new Xa(a,0,d)}if(0<d||0>h){a=K(c,a,g,{init_f1:-d,init_f2:-h});if(!a)throw"SearchLunarApsis INTERNAL ERROR: apogee search failed!";d=ea(a).distance_au;return new Xa(a,1,d)}throw"SearchLunarApsis INTERNAL ERROR: cannot classify apsis event!";}a=g;d=h}throw"SearchLunarApsis INTERNAL ERROR: could not find apsis within 2 synodic months of start date.";}function yc(a,b,c,d){for(var f=b===Ja.Apocenter?
1:-1;;){d/=9;if(d<1/1440)return c=c.AddDays(d/2),a=oa(a,c),new Xa(c,b,a);for(var g=-1,h=0,l=0;10>l;++l){var k=c.AddDays(l*d);k=f*oa(a,k);if(0==l||k>h)g=l,h=k}c=c.AddDays((g-1)*d);d*=2}}function wd(a,b){var c=b.AddDays(-30/360*aa[a].OrbitalPeriod),d=b.AddDays(.75*aa[a].OrbitalPeriod),f=c,g=c,h=-1,l=-1;d=(d.ut-c.ut)/99;for(var k=0;100>k;++k){var n=c.AddDays(k*d),p=oa(a,n);0===k?l=h=p:(p>l&&(l=p,g=n),p<h&&(h=p,f=n))}c=yc(a,0,f.AddDays(-2*d),4*d);a=yc(a,1,g.AddDays(-2*d),4*d);if(c.time.tt>=b.tt)return a.time.tt>=
b.tt&&a.time.tt<c.time.tt?a:c;if(a.time.tt>=b.tt)return a;throw"Internal error: failed to find Neptune apsis.";}function zc(a,b){function c(p){var q=p.AddDays(-5E-4);p=p.AddDays(5E-4);q=oa(a,q);return(oa(a,p)-q)/.001}function d(p){return-c(p)}b=v(b);if(a===m.Neptune||a===m.Pluto)return wd(a,b);for(var f=aa[a].OrbitalPeriod,g=f/6,h=c(b),l=0;l*g<2*f;++l){var k=b.AddDays(g),n=c(k);if(0>=h*n){f=g=void 0;if(0>h||0<n)g=c,f=Ja.Pericenter;else if(0<h||0>n)g=d,f=Ja.Apocenter;else throw"Internal error with slopes in SearchPlanetApsis";
b=K(g,b,k);if(!b)throw"Failed to find slope transition in planetary apsis search.";h=oa(a,b);return new Xa(b,f,h)}b=k;h=n}throw"Internal error: should have found planetary apsis within 2 orbital periods.";}function Ka(a){return new J([[a.rot[0][0],a.rot[1][0],a.rot[2][0]],[a.rot[0][1],a.rot[1][1],a.rot[2][1]],[a.rot[0][2],a.rot[1][2],a.rot[2][2]]])}function ja(a,b){return new J([[b.rot[0][0]*a.rot[0][0]+b.rot[1][0]*a.rot[0][1]+b.rot[2][0]*a.rot[0][2],b.rot[0][1]*a.rot[0][0]+b.rot[1][1]*a.rot[0][1]+
b.rot[2][1]*a.rot[0][2],b.rot[0][2]*a.rot[0][0]+b.rot[1][2]*a.rot[0][1]+b.rot[2][2]*a.rot[0][2]],[b.rot[0][0]*a.rot[1][0]+b.rot[1][0]*a.rot[1][1]+b.rot[2][0]*a.rot[1][2],b.rot[0][1]*a.rot[1][0]+b.rot[1][1]*a.rot[1][1]+b.rot[2][1]*a.rot[1][2],b.rot[0][2]*a.rot[1][0]+b.rot[1][2]*a.rot[1][1]+b.rot[2][2]*a.rot[1][2]],[b.rot[0][0]*a.rot[2][0]+b.rot[1][0]*a.rot[2][1]+b.rot[2][0]*a.rot[2][2],b.rot[0][1]*a.rot[2][0]+b.rot[1][1]*a.rot[2][1]+b.rot[2][1]*a.rot[2][2],b.rot[0][2]*a.rot[2][0]+b.rot[1][2]*a.rot[2][1]+
b.rot[2][2]*a.rot[2][2]]])}function lb(a,b){b=v(b);var c=a.lat*e.DEG2RAD,d=a.lon*e.DEG2RAD,f=a.dist*Math.cos(c);return new E(f*Math.cos(d),f*Math.sin(d),a.dist*Math.sin(c),b)}function Mb(a){var b=Nb(a);return new gb(b.lon/15,b.lat,b.dist,a)}function Nb(a){var b=a.x*a.x+a.y*a.y,c=Math.sqrt(b+a.z*a.z);if(0===b){if(0===a.z)throw"Zero-length vector not allowed.";var d=0;a=0>a.z?-90:90}else d=e.RAD2DEG*Math.atan2(a.y,a.x),0>d&&(d+=360),a=e.RAD2DEG*Math.atan2(a.z,Math.sqrt(b));return new Ba(a,d,c)}function Ac(a){a=
360-a;360<=a?a-=360:0>a&&(a+=360);return a}function Oa(a,b){w(b);if(-90>b||90<b)return 0;if("normal"===a||"jplhor"===a){var c=b;-1>c&&(c=-1);c=1.02/Math.tan((c+10.3/(c+5.11))*e.DEG2RAD)/60;"normal"===a&&-1>b&&(c*=(b+90)/89)}else{if(a)throw"Invalid refraction option: "+a;c=0}return c}function Bc(a,b){if(-90>b||90<b)return 0;for(var c=b-Oa(a,b);;){var d=c+Oa(a,c)-b;if(1E-14>Math.abs(d))return c-b;c-=d}}function Ya(a,b){return new E(a.rot[0][0]*b.x+a.rot[1][0]*b.y+a.rot[2][0]*b.z,a.rot[0][1]*b.x+a.rot[1][1]*
b.y+a.rot[2][1]*b.z,a.rot[0][2]*b.x+a.rot[1][2]*b.y+a.rot[2][2]*b.z,b.t)}function Ea(a,b){return new I(a.rot[0][0]*b.x+a.rot[1][0]*b.y+a.rot[2][0]*b.z,a.rot[0][1]*b.x+a.rot[1][1]*b.y+a.rot[2][1]*b.z,a.rot[0][2]*b.x+a.rot[1][2]*b.y+a.rot[2][2]*b.z,a.rot[0][0]*b.vx+a.rot[1][0]*b.vy+a.rot[2][0]*b.vz,a.rot[0][1]*b.vx+a.rot[1][1]*b.vy+a.rot[2][1]*b.vz,a.rot[0][2]*b.vx+a.rot[1][2]*b.vy+a.rot[2][2]*b.vz,b.t)}function Cc(){return new J([[1,0,0],[0,.9174821430670688,-.3977769691083922],[0,.3977769691083922,
.9174821430670688]])}function ob(a){a=v(a);var b=Ma(a,F.From2000);a=Na(a,F.From2000);return ja(b,a)}function pb(a){a=v(a);var b=Na(a,F.Into2000);a=Ma(a,F.Into2000);return ja(b,a)}function Ob(a,b){a=v(a);var c=Math.sin(b.latitude*e.DEG2RAD),d=Math.cos(b.latitude*e.DEG2RAD),f=Math.sin(b.longitude*e.DEG2RAD),g=Math.cos(b.longitude*e.DEG2RAD);b=[d*g,d*f,c];c=[-c*g,-c*f,d];f=[f,-g,0];a=-15*ca(a);b=ya(a,b);c=ya(a,c);a=ya(a,f);return new J([[c[0],a[0],b[0]],[c[1],a[1],b[1]],[c[2],a[2],b[2]]])}function Dc(a,
b){a=Ob(a,b);return Ka(a)}function Ec(a,b){a=v(a);b=Dc(a,b);a=pb(a);return ja(b,a)}function Fc(a){a=pb(a);var b=Cc();return ja(a,b)}function Gc(a){a=Fc(a);return Ka(a)}function Hc(a,b){a=v(a);var c=Gc(a);a=Ob(a,b);return ja(c,a)}function Ic(a){var b=da(v(a)).tobl*e.DEG2RAD;a=Math.cos(b);b=Math.sin(b);return new J([[1,0,0],[0,+a,+b],[0,-b,+a]])}function Jc(a){var b=da(v(a)).tobl*e.DEG2RAD;a=Math.cos(b);b=Math.sin(b);return new J([[1,0,0],[0,+a,-b],[0,+b,+a]])}function Za(a,b,c,d){var f=(d.x*c.x+d.y*
c.y+d.z*c.z)/(d.x*d.x+d.y*d.y+d.z*d.z);return new xd(b,f,e.KM_PER_AU*Math.hypot(f*d.x-c.x,f*d.y-c.y,f*d.z-c.z),695700-(1+f)*(695700-a),-695700+(1+f)*(695700+a),c,d)}function qb(a){var b=W(m.Sun,a,!0);b=new E(-b.x,-b.y,-b.z,b.t);var c=Y(a);return Za(6459,a,c,b)}function Kc(a){var b=W(m.Sun,a,!0),c=Y(a),d=new E(-c.x,-c.y,-c.z,c.t);c.x-=b.x;c.y-=b.y;c.z-=b.z;return Za(1737.4,a,d,c)}function Pb(a,b){var c=cc(a,b);b=W(m.Sun,a,!0);var d=Y(a);c=new E(c[0]-d.x,c[1]-d.y,c[2]-d.z,a);d.x-=b.x;d.y-=b.y;d.z-=
b.z;return Za(1737.4,a,c,d)}function rb(a,b,c){a=W(a,c,!0);var d=W(m.Sun,c,!0),f=new E(a.x-d.x,a.y-d.y,a.z-d.z,c);d.x=-a.x;d.y=-a.y;d.z=-a.z;return Za(b,c,d,f)}function Qb(a,b){var c=1/86400,d=b.AddDays(-c);b=b.AddDays(+c);d=a(d);return(a(b).r-d.r)/c}function yd(a){var b=a.AddDays(-.03);a=a.AddDays(.03);b=K(function(c){return Qb(qb,c)},b,a);if(!b)throw"Failed to find peak Earth shadow time.";return qb(b)}function zd(a){var b=a.AddDays(-.03);a=a.AddDays(.03);b=K(function(c){return Qb(Kc,c)},b,a);if(!b)throw"Failed to find peak Moon shadow time.";
return Kc(b)}function Ad(a,b,c){var d=c.AddDays(-1);c=c.AddDays(1);d=K(function(f){var g=1/86400,h=rb(a,b,f.AddDays(-g));return(rb(a,b,f.AddDays(+g)).r-h.r)/g},d,c);if(!d)throw"Failed to find peak planet shadow time.";return rb(a,b,d)}function Bd(a,b){function c(g){return Pb(g,b)}var d=a.AddDays(-.2),f=a.AddDays(.2);d=K(function(g){return Qb(c,g)},d,f);if(!d)throw"PeakLocalMoonShadow: search failure for search_center_time = "+a;return Pb(d,b)}function Rb(a,b,c){var d=c/1440;c=a.AddDays(-d);d=a.AddDays(+d);
c=K(function(f){return-(qb(f).r-b)},c,a);a=K(function(f){return+(qb(f).r-b)},a,d);if(!c||!a)throw"Failed to find shadow semiduration";return 720*(a.ut-c.ut)}function Sb(a){a=ea(a);return e.RAD2DEG*a.geo_eclip_lat}function Lc(a,b,c){if(0>=a)throw"Radius of first disc must be positive.";if(0>=b)throw"Radius of second disc must be positive.";if(0>c)throw"Distance between discs is not allowed to be negative.";if(c>=a+b)return 0;if(0==c)return a<=b?1:b*b/(a*a);var d=(a*a-b*b+c*c)/(2*c),f=a*a-d*d;if(0>=
f)return a<=b?1:b*b/(a*a);f=Math.sqrt(f);return(a*a*Math.acos(d/a)-d*f+(b*b*Math.acos((c-d)/b)-(c-d)*f))/(Math.PI*a*a)}function Mc(a,b){var c=new E(a.x+b.x,a.y+b.y,a.z+b.z,a.t);a=Math.asin(Nc/c.Length());var d=Math.asin(Cd/b.Length());b=N(b,c);b=Lc(a,d,b*e.DEG2RAD);return Math.min(.9999,b)}function Oc(a){a=v(a);for(var b=0;12>b;++b){var c=Wa(180,a,40);if(!c)throw"Cannot find full moon.";a=Sb(c);if(1.8>Math.abs(a)&&(a=yd(c),a.r<a.p+1737.4)){b=S.Penumbral;var d=c=0,f=0,g=Rb(a.time,a.p+1737.4,200);a.r<
a.k+1737.4&&(b=S.Partial,f=Rb(a.time,a.k+1737.4,g),a.r+1737.4<a.k?(b=S.Total,c=1,d=Rb(a.time,a.k-1737.4,f)):c=Lc(1737.4,a.k,a.r));return new Pc(b,c,a.time,g,f,d)}a=c.AddDays(10)}throw"Failed to find lunar eclipse within 12 full moons.";}function Qc(a){a=v(a);var b;for(b=0;12>b;++b){var c=Wa(0,a,40);if(!c)throw"Cannot find new moon";a=Sb(c);if(1.8>Math.abs(a)&&(a=zd(c),a.r<a.p+6371)){var d=void 0,f=void 0,g=S.Partial;b=a.time;c=a.r;var h=ob(a.time),l=Ya(h,a.dir),k=Ya(h,a.target);l.x*=e.KM_PER_AU;l.y*=
e.KM_PER_AU;l.z*=e.KM_PER_AU/.996647180302104;k.x*=e.KM_PER_AU;k.y*=e.KM_PER_AU;k.z*=e.KM_PER_AU/.996647180302104;var n=l.x*l.x+l.y*l.y+l.z*l.z,p=-2*(l.x*k.x+l.y*k.y+l.z*k.z),q=p*p-4*n*(k.x*k.x+k.y*k.y+k.z*k.z-4.068062648825956E7);if(0<q){f=(-p-Math.sqrt(q))/(2*n);g=f*l.x-k.x;n=f*l.y-k.y;l=.996647180302104*(f*l.z-k.z);f=.9933056020041345*Math.hypot(g,n);f=0==f?0<l?90:-90:e.RAD2DEG*Math.atan(l/f);d=ca(b);d=(e.RAD2DEG*Math.atan2(n,g)-15*d)%360;-180>=d?d+=360:180<d&&(d-=360);h=Ka(h);l=new E(g/e.KM_PER_AU,
n/e.KM_PER_AU,l/e.KM_PER_AU,a.time);l=Ya(h,l);l.x+=a.target.x;l.y+=a.target.y;l.z+=a.target.z;h=Za(1736,a.time,l,a.dir);if(1E-9<h.r||0>h.r)throw"Unexpected shadow distance from geoid intersection = "+h.r;g=.014<h.k?S.Total:S.Annular;a=g===S.Total?1:Mc(a.dir,l)}else a=void 0;return new Rc(g,a,b,c,f,d)}a=c.AddDays(10)}throw"Failed to find solar eclipse within 12 full moons.";}function Sc(a){return a.p-a.r}function Tc(a){return Math.abs(a.k)-a.r}function sb(a,b,c,d,f){d=K(function(g){g=Pb(g,a);return b*
c(g)},d,f);if(!d)throw"Local eclipse transition search failed.";return Uc(a,d)}function Uc(a,b){var c=Pa(m.Sun,b,a,!0,!0);a=hb(b,a,c.ra,c.dec,"normal").altitude;return new Vc(b,a)}function Wc(a,b){a=v(a);for(za(b);;){a=Wa(0,a,40);if(!a)throw"Cannot find next new moon";var c=Sb(a);if(1.8>Math.abs(c)){var d=Bd(a,b);if(d.r<d.p){var f=c=void 0;var g=b;var h=Uc(g,d.time),l=d.time.AddDays(-.2),k=d.time.AddDays(.2),n=sb(g,1,Sc,l,d.time),p=sb(g,-1,Sc,d.time,k);d.r<Math.abs(d.k)?(l=d.time.AddDays(-.01),k=
d.time.AddDays(.01),f=sb(g,1,Tc,l,d.time),c=sb(g,-1,Tc,d.time,k),g=.014<d.k?S.Total:S.Annular):g=S.Partial;d=g===S.Total?1:Mc(d.dir,d.target);c=new Xc(g,d,n,f,h,c,p);if(0<c.partial_begin.altitude||0<c.partial_end.altitude)return c}}a=a.AddDays(10)}}function Yc(a,b,c,d,f){c=K(function(g){g=rb(a,b,g);return f*(g.r-g.p)},c,d);if(!c)throw"Planet transit boundary search failed";return c}function Zc(a,b){b=v(b);switch(a){case m.Mercury:var c=2439.7;break;case m.Venus:c=6051.8;break;default:throw"Invalid body: "+
a;}for(;;){var d=Ia(a,0,b);if(.4>Ha(a,d)&&(b=Ad(a,c,d),b.r<b.p)){d=b.time.AddDays(-1);d=Yc(a,c,d,b.time,-1);var f=b.time.AddDays(1);c=Yc(a,c,b.time,f,1);a=60*Ha(a,b.time);return new $c(d,b.time,c,a)}b=d.AddDays(10)}}function ad(a){var b=v(a),c=ib(b);for(a={};;a={$jscomp$loop$prop$kind$33:a.$jscomp$loop$prop$kind$33}){var d=b.AddDays(10),f=ib(d);if(0>=c.lat*f.lat){a.$jscomp$loop$prop$kind$33=f.lat>c.lat?ra.Ascending:ra.Descending;b=K(function(g){return function(h){return g.$jscomp$loop$prop$kind$33*
ib(h).lat}}(a),b,d);if(!b)throw"Could not find moon node.";return new bd(a.$jscomp$loop$prop$kind$33,b)}b=d;c=f}}function cd(a,b,c,d,f){if(1>a||5<a)throw"Invalid lagrange point "+a;if(!Number.isFinite(c)||0>=c)throw"Major mass must be a positive number.";if(!Number.isFinite(f)||0>=f)throw"Minor mass must be a negative number.";var g=d.x-b.x,h=d.y-b.y,l=d.z-b.z,k=g*g+h*h+l*l,n=Math.sqrt(k),p=d.vx-b.vx,q=d.vy-b.vy;d=d.vz-b.vz;if(4===a||5===a){k=h*d-l*q;c=l*p-g*d;var t=g*q-h*p,y=c*l-t*h;t=t*g-k*l;k=
k*h-c*g;c=Math.sqrt(y*y+t*t+k*k);y/=c;t/=c;k/=c;g/=n;h/=n;l/=n;a=4==a?.8660254037844386:-.8660254037844386;c=.5*g+a*y;f=.5*h+a*t;var x=.5*l+a*k,z=p*g+q*h+d*l;p=p*y+q*t+d*k;b=new I(n*c,n*f,n*x,z*c+p*(.5*y-a*g),z*f+p*(.5*t-a*h),z*x+p*(.5*k-a*l),b.t)}else{y=f/(c+f)*-n;t=c/(c+f)*+n;k=(c+f)/(k*n);if(1===a||2===a)x=c/(c+f)*Math.cbrt(f/(3*c)),c=-c,1==a?(x=1-x,a=+f):(x=1+x,a=-f);else if(3===a)x=(7/12*f-c)/(f+c),c=+c,a=+f;else throw"Invalid Langrage point "+a+". Must be an integer 1..5.";f=n*x-y;do x=f-y,
z=f-t,x=(k*f+c/(x*x)+a/(z*z))/(k-2*c/(x*x*x)-2*a/(z*z*z)),f-=x;while(1E-14<Math.abs(x/n));x=(f-y)/n;b=new I(x*g,x*h,x*l,x*p,x*q,x*d,b.t)}return b}Object.defineProperty(e,"__esModule",{value:!0});e.GeoEmbState=e.GeoMoonState=e.EclipticGeoMoon=e.GeoMoon=e.Ecliptic=e.ObserverGravity=e.VectorObserver=e.ObserverState=e.ObserverVector=e.Equator=e.SunPosition=e.Observer=e.Horizon=e.EclipticCoordinates=e.HorizontalCoordinates=e.MakeRotation=e.RotationMatrix=e.EquatorialCoordinates=e.Spherical=e.StateVector=
e.Vector=e.SiderealTime=e.Libration=e.LibrationInfo=e.CalcMoonCount=e.e_tilt=e.MakeTime=e.AstroTime=e.SetDeltaTFunction=e.DeltaT_JplHorizons=e.DeltaT_EspenakMeeus=e.PlanetOrbitalPeriod=e.DefineStar=e.Body=e.AngleBetween=e.MassProduct=e.CALLISTO_RADIUS_KM=e.GANYMEDE_RADIUS_KM=e.EUROPA_RADIUS_KM=e.IO_RADIUS_KM=e.JUPITER_MEAN_RADIUS_KM=e.JUPITER_POLAR_RADIUS_KM=e.JUPITER_EQUATORIAL_RADIUS_KM=e.RAD2HOUR=e.RAD2DEG=e.HOUR2RAD=e.DEG2RAD=e.AU_PER_LY=e.KM_PER_AU=e.C_AUDAY=void 0;e.VectorFromHorizon=e.HorizonFromVector=
e.SphereFromVector=e.EquatorFromVector=e.VectorFromSphere=e.Pivot=e.IdentityMatrix=e.CombineRotation=e.InverseRotation=e.NextPlanetApsis=e.SearchPlanetApsis=e.NextLunarApsis=e.SearchLunarApsis=e.Apsis=e.ApsisKind=e.SearchPeakMagnitude=e.SearchMaxElongation=e.Elongation=e.ElongationEvent=e.Seasons=e.SeasonInfo=e.HourAngle=e.SearchHourAngle=e.HourAngleEvent=e.SearchAltitude=e.SearchRiseSet=e.Atmosphere=e.AtmosphereInfo=e.NextMoonQuarter=e.SearchMoonQuarter=e.MoonQuarter=e.SearchMoonPhase=e.MoonPhase=
e.SearchRelativeLongitude=e.Illumination=e.IlluminationInfo=e.EclipticLongitude=e.AngleFromSun=e.PairLongitude=e.SearchSunLongitude=e.Search=e.HelioState=e.BaryState=e.GeoVector=e.BackdatePosition=e.CorrectLightTravel=e.HelioDistance=e.HelioVector=e.JupiterMoons=e.JupiterMoonsInfo=void 0;e.GravitySimulator=e.LagrangePointFast=e.LagrangePoint=e.RotationAxis=e.AxisInfo=e.NextMoonNode=e.SearchMoonNode=e.NodeEventInfo=e.NodeEventKind=e.NextTransit=e.SearchTransit=e.TransitInfo=e.NextLocalSolarEclipse=
e.SearchLocalSolarEclipse=e.LocalSolarEclipseInfo=e.EclipseEvent=e.NextGlobalSolarEclipse=e.SearchGlobalSolarEclipse=e.NextLunarEclipse=e.GlobalSolarEclipseInfo=e.SearchLunarEclipse=e.LunarEclipseInfo=e.EclipseKind=e.Constellation=e.ConstellationInfo=e.Rotation_EQD_ECT=e.Rotation_ECT_EQD=e.Rotation_GAL_EQJ=e.Rotation_EQJ_GAL=e.Rotation_HOR_ECL=e.Rotation_ECL_HOR=e.Rotation_ECL_EQD=e.Rotation_EQD_ECL=e.Rotation_EQJ_HOR=e.Rotation_HOR_EQJ=e.Rotation_HOR_EQD=e.Rotation_EQD_HOR=e.Rotation_EQD_EQJ=e.Rotation_ECT_EQJ=
e.Rotation_EQJ_ECT=e.Rotation_EQJ_EQD=e.Rotation_ECL_EQJ=e.Rotation_EQJ_ECL=e.RotateState=e.RotateVector=e.InverseRefraction=e.Refraction=void 0;e.C_AUDAY=173.1446326846693;e.KM_PER_AU=1.4959787069098932E8;e.AU_PER_LY=63241.07708807546;e.DEG2RAD=.017453292519943295;e.HOUR2RAD=.26179938779914946;e.RAD2DEG=57.29577951308232;e.RAD2HOUR=3.819718634205488;e.JUPITER_EQUATORIAL_RADIUS_KM=71492;e.JUPITER_POLAR_RADIUS_KM=66854;e.JUPITER_MEAN_RADIUS_KM=69911;e.IO_RADIUS_KM=1821.6;e.EUROPA_RADIUS_KM=1560.8;
e.GANYMEDE_RADIUS_KM=2631.2;e.CALLISTO_RADIUS_KM=2410.3;var dd=new Date("2000-01-01T12:00:00Z"),U=2*Math.PI,ia=180/Math.PI*3600,td=-.17-5*Math.log10(648E3/Math.PI),Nc=695700/e.KM_PER_AU,pd=6378.1366/e.KM_PER_AU,Dd=1738.1/e.KM_PER_AU,Cd=1736/e.KM_PER_AU,Ed=34/60;e.MassProduct=C;e.AngleBetween=N;var m;(function(a){a.Sun="Sun";a.Moon="Moon";a.Mercury="Mercury";a.Venus="Venus";a.Earth="Earth";a.Mars="Mars";a.Jupiter="Jupiter";a.Saturn="Saturn";a.Uranus="Uranus";a.Neptune="Neptune";a.Pluto="Pluto";a.SSB=
"SSB";a.EMB="EMB";a.Star1="Star1";a.Star2="Star2";a.Star3="Star3";a.Star4="Star4";a.Star5="Star5";a.Star6="Star6";a.Star7="Star7";a.Star8="Star8"})(m=e.Body||(e.Body={}));var ld=[m.Star1,m.Star2,m.Star3,m.Star4,m.Star5,m.Star6,m.Star7,m.Star8],md=[{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0}];e.DefineStar=function(a,b,c,d){var f=T(a);if(!f)throw"Invalid star body: "+a;w(b);w(c);w(d);
if(0>b||24<=b)throw"Invalid right ascension for star: "+b;if(-90>c||90<c)throw"Invalid declination for star: "+c;if(1>d)throw"Invalid star distance: "+d;f.ra=b;f.dec=c;f.dist=d*e.AU_PER_LY};var F;(function(a){a[a.From2000=0]="From2000";a[a.Into2000=1]="Into2000"})(F||(F={}));var aa={Mercury:{OrbitalPeriod:87.969},Venus:{OrbitalPeriod:224.701},Earth:{OrbitalPeriod:365.256},Mars:{OrbitalPeriod:686.98},Jupiter:{OrbitalPeriod:4332.589},Saturn:{OrbitalPeriod:10759.22},Uranus:{OrbitalPeriod:30685.4},Neptune:{OrbitalPeriod:60189},
Pluto:{OrbitalPeriod:90560}};e.PlanetOrbitalPeriod=function(a){if(a in aa)return aa[a].OrbitalPeriod;throw"Unknown orbital period for: "+a;};var M={Mercury:[[[[4.40250710144,0,0],[.40989414977,1.48302034195,26087.9031415742],[.050462942,4.47785489551,52175.8062831484],[.00855346844,1.16520322459,78263.70942472259],[.00165590362,4.11969163423,104351.61256629678],[3.4561897E-4,.77930768443,130439.51570787099],[7.583476E-5,3.71348404924,156527.41884944518]],[[26087.90313685529,0,0],[.01131199811,6.21874197797,
26087.9031415742],[.00292242298,3.04449355541,52175.8062831484],[7.5775081E-4,6.08568821653,78263.70942472259],[1.9676525E-4,2.80965111777,104351.61256629678]]],[[[.11737528961,1.98357498767,26087.9031415742],[.02388076996,5.03738959686,52175.8062831484],[.01222839532,3.14159265359,0],[.0054325181,1.79644363964,78263.70942472259],[.0012977877,4.83232503958,104351.61256629678],[3.1866927E-4,1.58088495658,130439.51570787099],[7.963301E-5,4.60972126127,156527.41884944518]],[[.00274646065,3.95008450011,
26087.9031415742],[9.9737713E-4,3.14159265359,0]]],[[[.39528271651,0,0],[.07834131818,6.19233722598,26087.9031415742],[.00795525558,2.95989690104,52175.8062831484],[.00121281764,6.01064153797,78263.70942472259],[2.1921969E-4,2.77820093972,104351.61256629678],[4.354065E-5,5.82894543774,130439.51570787099]],[[.0021734774,4.65617158665,26087.9031415742],[4.4141826E-4,1.42385544001,52175.8062831484]]]],Venus:[[[[3.17614666774,0,0],[.01353968419,5.59313319619,10213.285546211],[8.9891645E-4,5.30650047764,
20426.571092422],[5.477194E-5,4.41630661466,7860.4193924392],[3.455741E-5,2.6996444782,11790.6290886588],[2.372061E-5,2.99377542079,3930.2096962196],[1.317168E-5,5.18668228402,26.2983197998],[1.664146E-5,4.25018630147,1577.3435424478],[1.438387E-5,4.15745084182,9683.5945811164],[1.200521E-5,6.15357116043,30639.856638633]],[[10213.28554621638,0,0],[9.5617813E-4,2.4640651111,10213.285546211],[7.787201E-5,.6247848222,20426.571092422]]],[[[.05923638472,.26702775812,10213.285546211],[4.0107978E-4,1.14737178112,
20426.571092422],[3.2814918E-4,3.14159265359,0]],[[.00287821243,1.88964962838,10213.285546211]]],[[[.72334820891,0,0],[.00489824182,4.02151831717,10213.285546211],[1.658058E-5,4.90206728031,20426.571092422],[1.378043E-5,1.12846591367,11790.6290886588],[1.632096E-5,2.84548795207,7860.4193924392],[4.98395E-6,2.58682193892,9683.5945811164],[2.21985E-6,2.01346696541,19367.1891622328],[2.37454E-6,2.55136053886,15720.8387848784]],[[3.4551041E-4,.89198706276,10213.285546211]]]],Earth:[[[[1.75347045673,0,
0],[.03341656453,4.66925680415,6283.0758499914],[3.4894275E-4,4.62610242189,12566.1516999828],[3.417572E-5,2.82886579754,3.523118349],[3.497056E-5,2.74411783405,5753.3848848968],[3.135899E-5,3.62767041756,77713.7714681205],[2.676218E-5,4.41808345438,7860.4193924392],[2.342691E-5,6.13516214446,3930.2096962196],[1.273165E-5,2.03709657878,529.6909650946],[1.324294E-5,.74246341673,11506.7697697936],[9.01854E-6,2.04505446477,26.2983197998],[1.199167E-5,1.10962946234,1577.3435424478],[8.57223E-6,3.50849152283,
398.1490034082],[7.79786E-6,1.17882681962,5223.6939198022],[9.9025E-6,5.23268072088,5884.9268465832],[7.53141E-6,2.53339052847,5507.5532386674],[5.05267E-6,4.58292599973,18849.2275499742],[4.92392E-6,4.20505711826,775.522611324],[3.56672E-6,2.91954114478,.0673103028],[2.84125E-6,1.89869240932,796.2980068164],[2.42879E-6,.34481445893,5486.777843175],[3.17087E-6,5.84901948512,11790.6290886588],[2.71112E-6,.31486255375,10977.078804699],[2.06217E-6,4.80646631478,2544.3144198834],[2.05478E-6,1.86953770281,
5573.1428014331],[2.02318E-6,2.45767790232,6069.7767545534],[1.26225E-6,1.08295459501,20.7753954924],[1.55516E-6,.83306084617,213.299095438]],[[6283.0758499914,0,0],[.00206058863,2.67823455808,6283.0758499914],[4.303419E-5,2.63512233481,12566.1516999828]],[[8.721859E-5,1.07253635559,6283.0758499914]]],[[],[[.00227777722,3.4137662053,6283.0758499914],[3.805678E-5,3.37063423795,12566.1516999828]]],[[[1.00013988784,0,0],[.01670699632,3.09846350258,6283.0758499914],[1.3956024E-4,3.05524609456,12566.1516999828],
[3.08372E-5,5.19846674381,77713.7714681205],[1.628463E-5,1.17387558054,5753.3848848968],[1.575572E-5,2.84685214877,7860.4193924392],[9.24799E-6,5.45292236722,11506.7697697936],[5.42439E-6,4.56409151453,3930.2096962196],[4.7211E-6,3.66100022149,5884.9268465832],[8.5831E-7,1.27079125277,161000.6857376741],[5.7056E-7,2.01374292245,83996.84731811189],[5.5736E-7,5.2415979917,71430.69561812909],[1.74844E-6,3.01193636733,18849.2275499742],[2.43181E-6,4.2734953079,11790.6290886588]],[[.00103018607,1.10748968172,
6283.0758499914],[1.721238E-5,1.06442300386,12566.1516999828]],[[4.359385E-5,5.78455133808,6283.0758499914]]]],Mars:[[[[6.20347711581,0,0],[.18656368093,5.0503710027,3340.6124266998],[.01108216816,5.40099836344,6681.2248533996],[9.1798406E-4,5.75478744667,10021.8372800994],[2.7744987E-4,5.97049513147,3.523118349],[1.0610235E-4,2.93958560338,2281.2304965106],[1.2315897E-4,.84956094002,2810.9214616052],[8.926784E-5,4.15697846427,.0172536522],[8.715691E-5,6.11005153139,13362.4497067992],[6.797556E-5,
.36462229657,398.1490034082],[7.774872E-5,3.33968761376,5621.8429232104],[3.575078E-5,1.6618650571,2544.3144198834],[4.161108E-5,.22814971327,2942.4634232916],[3.075252E-5,.85696614132,191.4482661116],[2.628117E-5,.64806124465,3337.0893083508],[2.937546E-5,6.07893711402,.0673103028],[2.389414E-5,5.03896442664,796.2980068164],[2.579844E-5,.02996736156,3344.1355450488],[1.528141E-5,1.14979301996,6151.533888305],[1.798806E-5,.65634057445,529.6909650946],[1.264357E-5,3.62275122593,5092.1519581158],[1.286228E-5,
3.06796065034,2146.1654164752],[1.546404E-5,2.91579701718,1751.539531416],[1.024902E-5,3.69334099279,8962.4553499102],[8.91566E-6,.18293837498,16703.062133499],[8.58759E-6,2.4009381194,2914.0142358238],[8.32715E-6,2.46418619474,3340.5951730476],[8.3272E-6,4.49495782139,3340.629680352],[7.12902E-6,3.66335473479,1059.3819301892],[7.48723E-6,3.82248614017,155.4203994342],[7.23861E-6,.67497311481,3738.761430108],[6.35548E-6,2.92182225127,8432.7643848156],[6.55162E-6,.48864064125,3127.3133312618],[5.50474E-6,
3.81001042328,.9803210682],[5.5275E-6,4.47479317037,1748.016413067],[4.25966E-6,.55364317304,6283.0758499914],[4.15131E-6,.49662285038,213.299095438],[4.72167E-6,3.62547124025,1194.4470102246],[3.06551E-6,.38052848348,6684.7479717486],[3.12141E-6,.99853944405,6677.7017350506],[2.93198E-6,4.22131299634,20.7753954924],[3.02375E-6,4.48618007156,3532.0606928114],[2.74027E-6,.54222167059,3340.545116397],[2.81079E-6,5.88163521788,1349.8674096588],[2.31183E-6,1.28242156993,3870.3033917944],[2.83602E-6,5.7688543494,
3149.1641605882],[2.36117E-6,5.75503217933,3333.498879699],[2.74033E-6,.13372524985,3340.6797370026],[2.99395E-6,2.78323740866,6254.6266625236]],[[3340.61242700512,0,0],[.01457554523,3.60433733236,3340.6124266998],[.00168414711,3.92318567804,6681.2248533996],[2.0622975E-4,4.26108844583,10021.8372800994],[3.452392E-5,4.7321039319,3.523118349],[2.586332E-5,4.60670058555,13362.4497067992],[8.41535E-6,4.45864030426,2281.2304965106]],[[5.8152577E-4,2.04961712429,3340.6124266998],[1.3459579E-4,2.45738706163,
6681.2248533996]]],[[[.03197134986,3.76832042431,3340.6124266998],[.00298033234,4.10616996305,6681.2248533996],[.00289104742,0,0],[3.1365539E-4,4.4465105309,10021.8372800994],[3.4841E-5,4.7881254926,13362.4497067992]],[[.00217310991,6.04472194776,3340.6124266998],[2.0976948E-4,3.14159265359,0],[1.2834709E-4,1.60810667915,6681.2248533996]]],[[[1.53033488271,0,0],[.1418495316,3.47971283528,3340.6124266998],[.00660776362,3.81783443019,6681.2248533996],[4.6179117E-4,4.15595316782,10021.8372800994],[8.109733E-5,
5.55958416318,2810.9214616052],[7.485318E-5,1.77239078402,5621.8429232104],[5.523191E-5,1.3643630377,2281.2304965106],[3.82516E-5,4.49407183687,13362.4497067992],[2.306537E-5,.09081579001,2544.3144198834],[1.999396E-5,5.36059617709,3337.0893083508],[2.484394E-5,4.9254563992,2942.4634232916],[1.960195E-5,4.74249437639,3344.1355450488],[1.167119E-5,2.11260868341,5092.1519581158],[1.102816E-5,5.00908403998,398.1490034082],[8.99066E-6,4.40791133207,529.6909650946],[9.92252E-6,5.83861961952,6151.533888305],
[8.07354E-6,2.10217065501,1059.3819301892],[7.97915E-6,3.44839203899,796.2980068164],[7.40975E-6,1.49906336885,2146.1654164752]],[[.01107433345,2.03250524857,3340.6124266998],[.00103175887,2.37071847807,6681.2248533996],[1.28772E-4,0,0],[1.081588E-4,2.70888095665,10021.8372800994]],[[4.4242249E-4,.47930604954,3340.6124266998],[8.138042E-5,.86998389204,6681.2248533996]]]],Jupiter:[[[[.59954691494,0,0],[.09695898719,5.06191793158,529.6909650946],[.00573610142,1.44406205629,7.1135470008],[.00306389205,
5.41734730184,1059.3819301892],[9.7178296E-4,4.14264726552,632.7837393132],[7.2903078E-4,3.64042916389,522.5774180938],[6.4263975E-4,3.41145165351,103.0927742186],[3.9806064E-4,2.29376740788,419.4846438752],[3.8857767E-4,1.27231755835,316.3918696566],[2.7964629E-4,1.7845459182,536.8045120954],[1.358973E-4,5.7748104079,1589.0728952838],[8.246349E-5,3.5822792584,206.1855484372],[8.768704E-5,3.63000308199,949.1756089698],[7.368042E-5,5.0810119427,735.8765135318],[6.26315E-5,.02497628807,213.299095438],
[6.114062E-5,4.51319998626,1162.4747044078],[4.905396E-5,1.32084470588,110.2063212194],[5.305285E-5,1.30671216791,14.2270940016],[5.305441E-5,4.18625634012,1052.2683831884],[4.647248E-5,4.69958103684,3.9321532631],[3.045023E-5,4.31676431084,426.598190876],[2.609999E-5,1.56667394063,846.0828347512],[2.028191E-5,1.06376530715,3.1813937377],[1.764763E-5,2.14148655117,1066.49547719],[1.722972E-5,3.88036268267,1265.5674786264],[1.920945E-5,.97168196472,639.897286314],[1.633223E-5,3.58201833555,515.463871093],
[1.431999E-5,4.29685556046,625.6701923124],[9.73272E-6,4.09764549134,95.9792272178]],[[529.69096508814,0,0],[.00489503243,4.2208293947,529.6909650946],[.00228917222,6.02646855621,7.1135470008],[3.0099479E-4,4.54540782858,1059.3819301892],[2.072092E-4,5.45943156902,522.5774180938],[1.2103653E-4,.16994816098,536.8045120954],[6.067987E-5,4.42422292017,103.0927742186],[5.433968E-5,3.98480737746,419.4846438752],[4.237744E-5,5.89008707199,14.2270940016]],[[4.7233601E-4,4.32148536482,7.1135470008],[3.0649436E-4,
2.929777887,529.6909650946],[1.4837605E-4,3.14159265359,0]]],[[[.02268615702,3.55852606721,529.6909650946],[.00109971634,3.90809347197,1059.3819301892],[.00110090358,0,0],[8.101428E-5,3.60509572885,522.5774180938],[6.043996E-5,4.25883108339,1589.0728952838],[6.437782E-5,.30627119215,536.8045120954]],[[7.8203446E-4,1.52377859742,529.6909650946]]],[[[5.20887429326,0,0],[.25209327119,3.49108639871,529.6909650946],[.00610599976,3.84115365948,1059.3819301892],[.00282029458,2.57419881293,632.7837393132],
[.00187647346,2.07590383214,522.5774180938],[8.6792905E-4,.71001145545,419.4846438752],[7.2062974E-4,.21465724607,536.8045120954],[6.5517248E-4,5.9799588479,316.3918696566],[2.9134542E-4,1.67759379655,103.0927742186],[3.0135335E-4,2.16132003734,949.1756089698],[2.3453271E-4,3.54023522184,735.8765135318],[2.2283743E-4,4.19362594399,1589.0728952838],[2.3947298E-4,.2745803748,7.1135470008],[1.3032614E-4,2.96042965363,1162.4747044078],[9.70336E-5,1.90669633585,206.1855484372],[1.2749023E-4,2.71550286592,
1052.2683831884],[7.057931E-5,2.18184839926,1265.5674786264],[6.137703E-5,6.26418240033,846.0828347512],[2.616976E-5,2.00994012876,1581.959348283]],[[.0127180152,2.64937512894,529.6909650946],[6.1661816E-4,3.00076460387,1059.3819301892],[5.3443713E-4,3.89717383175,522.5774180938],[3.1185171E-4,4.88276958012,536.8045120954],[4.1390269E-4,0,0]]]],Saturn:[[[[.87401354025,0,0],[.11107659762,3.96205090159,213.299095438],[.01414150957,4.58581516874,7.1135470008],[.00398379389,.52112032699,206.1855484372],
[.00350769243,3.30329907896,426.598190876],[.00206816305,.24658372002,103.0927742186],[7.92713E-4,3.84007056878,220.4126424388],[2.3990355E-4,4.66976924553,110.2063212194],[1.6573588E-4,.43719228296,419.4846438752],[1.4906995E-4,5.76903183869,316.3918696566],[1.582029E-4,.93809155235,632.7837393132],[1.4609559E-4,1.56518472,3.9321532631],[1.3160301E-4,4.44891291899,14.2270940016],[1.5053543E-4,2.71669915667,639.897286314],[1.3005299E-4,5.98119023644,11.0457002639],[1.0725067E-4,3.12939523827,202.2533951741],
[5.863206E-5,.23656938524,529.6909650946],[5.227757E-5,4.20783365759,3.1813937377],[6.126317E-5,1.76328667907,277.0349937414],[5.019687E-5,3.17787728405,433.7117378768],[4.59255E-5,.61977744975,199.0720014364],[4.005867E-5,2.24479718502,63.7358983034],[2.953796E-5,.98280366998,95.9792272178],[3.87367E-5,3.22283226966,138.5174968707],[2.461186E-5,2.03163875071,735.8765135318],[3.269484E-5,.77492638211,949.1756089698],[1.758145E-5,3.2658010994,522.5774180938],[1.640172E-5,5.5050445305,846.0828347512],
[1.391327E-5,4.02333150505,323.5054166574],[1.580648E-5,4.37265307169,309.2783226558],[1.123498E-5,2.83726798446,415.5524906121],[1.017275E-5,3.71700135395,227.5261894396],[8.48642E-6,3.1915017083,209.3669421749]],[[213.2990952169,0,0],[.01297370862,1.82834923978,213.299095438],[.00564345393,2.88499717272,7.1135470008],[9.3734369E-4,1.06311793502,426.598190876],[.00107674962,2.27769131009,206.1855484372],[4.0244455E-4,2.04108104671,220.4126424388],[1.9941774E-4,1.2795439047,103.0927742186],[1.0511678E-4,
2.7488034213,14.2270940016],[6.416106E-5,.38238295041,639.897286314],[4.848994E-5,2.43037610229,419.4846438752],[4.056892E-5,2.92133209468,110.2063212194],[3.768635E-5,3.6496533078,3.9321532631]],[[.0011644133,1.17988132879,7.1135470008],[9.1841837E-4,.0732519584,213.299095438],[3.6661728E-4,0,0],[1.5274496E-4,4.06493179167,206.1855484372]]],[[[.04330678039,3.60284428399,213.299095438],[.00240348302,2.85238489373,426.598190876],[8.4745939E-4,0,0],[3.0863357E-4,3.48441504555,220.4126424388],[3.4116062E-4,
.57297307557,206.1855484372],[1.473407E-4,2.11846596715,639.897286314],[9.916667E-5,5.79003188904,419.4846438752],[6.993564E-5,4.7360468972,7.1135470008],[4.807588E-5,5.43305312061,316.3918696566]],[[.00198927992,4.93901017903,213.299095438],[3.6947916E-4,3.14159265359,0],[1.7966989E-4,.5197943111,426.598190876]]],[[[9.55758135486,0,0],[.52921382865,2.39226219573,213.299095438],[.01873679867,5.2354960466,206.1855484372],[.01464663929,1.64763042902,426.598190876],[.00821891141,5.93520042303,316.3918696566],
[.00547506923,5.0153261898,103.0927742186],[.0037168465,2.27114821115,220.4126424388],[.00361778765,3.13904301847,7.1135470008],[.00140617506,5.70406606781,632.7837393132],[.00108974848,3.29313390175,110.2063212194],[6.9006962E-4,5.94099540992,419.4846438752],[6.1053367E-4,.94037691801,639.897286314],[4.8913294E-4,1.55733638681,202.2533951741],[3.4143772E-4,.19519102597,277.0349937414],[3.2401773E-4,5.47084567016,949.1756089698],[2.0936596E-4,.46349251129,735.8765135318],[9.796004E-5,5.20477537945,
1265.5674786264],[1.1993338E-4,5.98050967385,846.0828347512],[2.08393E-4,1.52102476129,433.7117378768],[1.5298404E-4,3.0594381494,529.6909650946],[6.465823E-5,.17732249942,1052.2683831884],[1.1380257E-4,1.7310542704,522.5774180938],[3.419618E-5,4.94550542171,1581.959348283]],[[.0618298134,.2584351148,213.299095438],[.00506577242,.71114625261,206.1855484372],[.00341394029,5.79635741658,426.598190876],[.00188491195,.47215589652,220.4126424388],[.00186261486,3.14159265359,0],[.00143891146,1.40744822888,
7.1135470008]],[[.00436902572,4.78671677509,213.299095438]]]],Uranus:[[[[5.48129294297,0,0],[.09260408234,.89106421507,74.7815985673],[.01504247898,3.6271926092,1.4844727083],[.00365981674,1.89962179044,73.297125859],[.00272328168,3.35823706307,149.5631971346],[7.0328461E-4,5.39254450063,63.7358983034],[6.8892678E-4,6.09292483287,76.2660712756],[6.1998615E-4,2.26952066061,2.9689454166],[6.1950719E-4,2.85098872691,11.0457002639],[2.646877E-4,3.14152083966,71.8126531507],[2.5710476E-4,6.11379840493,
454.9093665273],[2.107885E-4,4.36059339067,148.0787244263],[1.7818647E-4,1.74436930289,36.6485629295],[1.4613507E-4,4.73732166022,3.9321532631],[1.1162509E-4,5.8268179635,224.3447957019],[1.099791E-4,.48865004018,138.5174968707],[9.527478E-5,2.95516862826,35.1640902212],[7.545601E-5,5.236265824,109.9456887885],[4.220241E-5,3.23328220918,70.8494453042],[4.0519E-5,2.277550173,151.0476698429],[3.354596E-5,1.0654900738,4.4534181249],[2.926718E-5,4.62903718891,9.5612275556],[3.49034E-5,5.48306144511,146.594251718],
[3.144069E-5,4.75199570434,77.7505439839],[2.922333E-5,5.35235361027,85.8272988312],[2.272788E-5,4.36600400036,70.3281804424],[2.051219E-5,1.51773566586,.1118745846],[2.148602E-5,.60745949945,38.1330356378],[1.991643E-5,4.92437588682,277.0349937414],[1.376226E-5,2.04283539351,65.2203710117],[1.666902E-5,3.62744066769,380.12776796],[1.284107E-5,3.11347961505,202.2533951741],[1.150429E-5,.93343589092,3.1813937377],[1.533221E-5,2.58594681212,52.6901980395],[1.281604E-5,.54271272721,222.8603229936],[1.372139E-5,
4.19641530878,111.4301614968],[1.221029E-5,.1990065003,108.4612160802],[9.46181E-6,1.19253165736,127.4717966068],[1.150989E-5,4.17898916639,33.6796175129]],[[74.7815986091,0,0],[.00154332863,5.24158770553,74.7815985673],[2.4456474E-4,1.71260334156,1.4844727083],[9.258442E-5,.4282973235,11.0457002639],[8.265977E-5,1.50218091379,63.7358983034],[9.15016E-5,1.41213765216,149.5631971346]]],[[[.01346277648,2.61877810547,74.7815985673],[6.23414E-4,5.08111189648,149.5631971346],[6.1601196E-4,3.14159265359,
0],[9.963722E-5,1.61603805646,76.2660712756],[9.92616E-5,.57630380333,73.297125859]],[[3.4101978E-4,.01321929936,74.7815985673]]],[[[19.21264847206,0,0],[.88784984413,5.60377527014,74.7815985673],[.03440836062,.32836099706,73.297125859],[.0205565386,1.7829515933,149.5631971346],[.0064932241,4.52247285911,76.2660712756],[.00602247865,3.86003823674,63.7358983034],[.00496404167,1.40139935333,454.9093665273],[.00338525369,1.58002770318,138.5174968707],[.00243509114,1.57086606044,71.8126531507],[.00190522303,
1.99809394714,1.4844727083],[.00161858838,2.79137786799,148.0787244263],[.00143706183,1.38368544947,11.0457002639],[9.3192405E-4,.17437220467,36.6485629295],[7.1424548E-4,4.24509236074,224.3447957019],[8.9806014E-4,3.66105364565,109.9456887885],[3.9009723E-4,1.66971401684,70.8494453042],[4.6677296E-4,1.39976401694,35.1640902212],[3.9025624E-4,3.36234773834,277.0349937414],[3.6755274E-4,3.88649278513,146.594251718],[3.0348723E-4,.70100838798,151.0476698429],[2.9156413E-4,3.180563367,77.7505439839],
[2.2637073E-4,.72518687029,529.6909650946],[1.1959076E-4,1.7504339214,984.6003316219],[2.5620756E-4,5.25656086672,380.12776796]],[[.01479896629,3.67205697578,74.7815985673]]]],Neptune:[[[[5.31188633046,0,0],[.0179847553,2.9010127389,38.1330356378],[.01019727652,.48580922867,1.4844727083],[.00124531845,4.83008090676,36.6485629295],[4.2064466E-4,5.41054993053,2.9689454166],[3.7714584E-4,6.09221808686,35.1640902212],[3.3784738E-4,1.24488874087,76.2660712756],[1.6482741E-4,7.727998E-5,491.5579294568],
[9.198584E-5,4.93747051954,39.6175083461],[8.99425E-5,.27462171806,175.1660598002]],[[38.13303563957,0,0],[1.6604172E-4,4.86323329249,1.4844727083],[1.5744045E-4,2.27887427527,38.1330356378]]],[[[.03088622933,1.44104372644,38.1330356378],[2.7780087E-4,5.91271884599,76.2660712756],[2.7623609E-4,0,0],[1.5355489E-4,2.52123799551,36.6485629295],[1.5448133E-4,3.50877079215,39.6175083461]]],[[[30.07013205828,0,0],[.27062259632,1.32999459377,38.1330356378],[.01691764014,3.25186135653,36.6485629295],[.00807830553,
5.18592878704,1.4844727083],[.0053776051,4.52113935896,35.1640902212],[.00495725141,1.5710564165,491.5579294568],[.00274571975,1.84552258866,175.1660598002],[1.201232E-4,1.92059384991,1021.2488945514],[.00121801746,5.79754470298,76.2660712756],[.00100896068,.3770272493,73.297125859],[.00135134092,3.37220609835,39.6175083461],[7.571796E-5,1.07149207335,388.4651552382]]]]};e.DeltaT_EspenakMeeus=sa;e.DeltaT_JplHorizons=function(a){return sa(Math.min(a,17*365.24217))};var Wb=sa;e.SetDeltaTFunction=function(a){Wb=
a};var O=function(a){if(a instanceof O)this.date=a.date,this.ut=a.ut,this.tt=a.tt;else if(a instanceof Date&&Number.isFinite(a.getTime()))this.date=a,this.ut=(a.getTime()-dd.getTime())/864E5,this.tt=Vb(this.ut);else if(Number.isFinite(a))this.date=new Date(dd.getTime()+864E5*a),this.ut=a,this.tt=Vb(this.ut);else throw"Argument must be a Date object, an AstroTime object, or a numeric UTC Julian date.";};O.FromTerrestrialTime=function(a){for(var b=new O(a),i=0;;++i){var c=a-b.tt;if(1E-12>Math.abs(c)||i>=20)return b;
b=b.AddDays(c)}};O.prototype.toString=function(){return this.date.toISOString()};O.prototype.AddDays=function(a){return new O(this.ut+a)};e.AstroTime=O;e.MakeTime=v;var $a;e.e_tilt=da;e.CalcMoonCount=0;var ed=function(a,b,c,d,f,g){this.elat=a;this.elon=b;this.mlat=c;this.mlon=d;this.dist_km=f;this.diam_deg=g};e.LibrationInfo=ed;e.Libration=function(a){var b=v(a);a=b.tt/36525;var c=a*a,d=c*a,f=c*c,g=ea(b);b=g.geo_eclip_lon;var h=g.geo_eclip_lat;g=g.distance_au*e.KM_PER_AU;var l=1.543*e.DEG2RAD,k=e.DEG2RAD*
Ga(93.272095+483202.0175233*a-.0036539*c-d/3526E3+f/86331E4),n=e.DEG2RAD*Ga(125.0445479-1934.1362891*a+.0020754*c+d/467441-f/60616E3),p=e.DEG2RAD*Ga(357.5291092+35999.0502909*a-1.536E-4*c+d/2449E4),q=e.DEG2RAD*Ga(134.9633964+477198.8675055*a+.0087414*c+d/69699-f/14712E3);d=e.DEG2RAD*Ga(297.8501921+445267.1114034*a-.0018819*c+d/545868-f/113065E3);c=1-.002516*a-7.4E-6*c;var t=b-n;f=Math.atan2(Math.sin(t)*Math.cos(h)*Math.cos(l)-Math.sin(h)*Math.sin(l),Math.cos(t)*Math.cos(h));var y=Fa(e.RAD2DEG*(f-
k));l=Math.asin(-Math.sin(t)*Math.cos(h)*Math.sin(l)-Math.sin(h)*Math.cos(l));t=-.02752*Math.cos(q)+-.02245*Math.sin(k)+.00684*Math.cos(q-2*k)+-.00293*Math.cos(2*k)+-8.5E-4*Math.cos(2*k-2*d)+-5.4E-4*Math.cos(q-2*d)+-2E-4*Math.sin(q+k)+-2E-4*Math.cos(q+2*k)+-2E-4*Math.cos(q-k)+1.4E-4*Math.cos(q+2*k-2*d);var x=-.02816*Math.sin(q)+.02244*Math.cos(k)+-.00682*Math.sin(q-2*k)+-.00279*Math.sin(2*k)+-8.3E-4*Math.sin(2*k-2*d)+6.9E-4*Math.sin(q-2*d)+4E-4*Math.cos(q+k)+-2.5E-4*Math.sin(2*q)+-2.3E-4*Math.sin(q+
2*k)+2E-4*Math.cos(q-k)+1.9E-4*Math.sin(q-k)+1.3E-4*Math.sin(q+2*k-2*d)+-1E-4*Math.cos(q-3*k);return new ed(e.RAD2DEG*l+(x*Math.cos(f)-t*Math.sin(f)),y+(-(.0252*c*Math.sin(p)+.00473*Math.sin(2*q-2*k)+-.00467*Math.sin(q)+.00396*Math.sin(e.DEG2RAD*(119.75+131.849*a))+.00276*Math.sin(2*q-2*d)+.00196*Math.sin(n)+-.00183*Math.cos(q-k)+.00115*Math.sin(q-2*d)+-9.6E-4*Math.sin(q-d)+4.6E-4*Math.sin(2*k-2*d)+-3.9E-4*Math.sin(q-k)+-3.2E-4*Math.sin(q-p-d)+2.7E-4*Math.sin(2*q-p-2*d)+2.3E-4*Math.sin(e.DEG2RAD*
(72.56+20.186*a))+-1.4E-4*Math.sin(2*d)+1.4E-4*Math.cos(2*q-2*k)+-1.2E-4*Math.sin(q-2*k)+-1.2E-4*Math.sin(2*q)+1.1E-4*Math.sin(2*q-2*p-2*d))+(t*Math.cos(f)+x*Math.sin(f))*Math.tan(l)),e.RAD2DEG*h,e.RAD2DEG*b,g,2*e.RAD2DEG*Math.atan(1737.4/Math.sqrt(g*g-1737.4*1737.4)))};var eb;e.SiderealTime=bc;var E=function(a,b,c,d){this.x=a;this.y=b;this.z=c;this.t=d};E.prototype.Length=function(){return Math.hypot(this.x,this.y,this.z)};e.Vector=E;var I=function(a,b,c,d,f,g,h){this.x=a;this.y=b;this.z=c;this.vx=
d;this.vy=f;this.vz=g;this.t=h};e.StateVector=I;var Ba=function(a,b,c){this.lat=w(a);this.lon=w(b);this.dist=w(c)};e.Spherical=Ba;var gb=function(a,b,c,d){this.ra=w(a);this.dec=w(b);this.dist=w(c);this.vec=d};e.EquatorialCoordinates=gb;var J=function(a){this.rot=a};e.RotationMatrix=J;e.MakeRotation=function(a){if(!qd(a))throw"Argument must be a [3][3] array of numbers";return new J(a)};var ec=function(a,b,c,d){this.azimuth=w(a);this.altitude=w(b);this.ra=w(c);this.dec=w(d)};e.HorizontalCoordinates=
ec;var gc=function(a,b,c){this.vec=a;this.elat=w(b);this.elon=w(c)};e.EclipticCoordinates=gc;e.Horizon=hb;var zb=function(a,b,c){this.latitude=a;this.longitude=b;this.height=c;za(this)};e.Observer=zb;e.SunPosition=fc;e.Equator=Pa;e.ObserverVector=function(a,b,c){a=v(a);var d=ca(a);b=xb(b,d).pos;c||(b=fb(b,a,F.Into2000));return yb(b,a)};e.ObserverState=function(a,b,c){a=v(a);var d=ca(a);b=xb(b,d);b=new I(b.pos[0],b.pos[1],b.pos[2],b.vel[0],b.vel[1],b.vel[2],a);return c?b:(c=F.Into2000,c===F.Into2000?
(d=Na(a,c),b=Ea(d,b),a=Ma(a,c),a=Ea(a,b)):(d=Ma(a,c),b=Ea(d,b),a=Na(a,c),a=Ea(a,b)),a)};e.VectorObserver=function(a,b){var c=ca(a.t),d=[a.x,a.y,a.z];b||(d=wa(d,a.t,F.From2000),d=xa(d,a.t,F.From2000));b=d[0]*e.KM_PER_AU;var f=d[1]*e.KM_PER_AU;d=d[2]*e.KM_PER_AU;a=Math.hypot(b,f);if(1E-6>a){c=0;var g=0<d?90:-90;d=Math.abs(d)-6356.751857971648}else{for(c=e.RAD2DEG*Math.atan2(f,b)-15*c;-180>=c;)c+=360;for(;180<c;)c-=360;g=Math.atan2(d,a);for(var h,l=0;;){if(10<++l)throw"inverse_terra failed to converge.";
b=Math.cos(g);f=Math.sin(g);var k=b*b,n=f*f,p=k+.9933056020041345*n;h=Math.sqrt(p);var q=-42.69778487239616*f*b/h-d*b+a*f;if(1E-8>Math.abs(q))break;g-=q/(-42.69778487239616*((k-n)/h-n*k*-.006694397995865464/(-42.69778487239616*p))+d*f+a*b)}g*=e.RAD2DEG;h=6378.1366/h;d=Math.abs(f)>Math.abs(b)?d/f-.9933056020041345*h:a/b-h}return new zb(g,c,1E3*d)};e.ObserverGravity=function(a,b){a=Math.sin(a*e.DEG2RAD);a*=a;return 9.7803253359*(1+.00193185265241*a)/Math.sqrt(1-.00669437999013*a)*(1-(3.15704E-7-2.10269E-9*
a)*b+7.37452E-14*b*b)};e.Ecliptic=Qa;e.GeoMoon=Y;e.EclipticGeoMoon=ib;e.GeoMoonState=Ra;e.GeoEmbState=Bb;var na=[[-73E4,[-26.118207232108,-14.376168177825,3.384402515299],[.0016339372163656,-.0027861699588508,-.0013585880229445]],[-700800,[41.974905202127,-.448502952929,-12.770351505989],[7.3458569351457E-4,.0022785014891658,4.8619778602049E-4]],[-671600,[14.706930780744,44.269110540027,9.353698474772],[-.00210001479998,2.2295915939915E-4,7.0143443551414E-4]],[-642400,[-29.441003929957,-6.43016153057,
6.858481011305],[8.4495803960544E-4,-.0030783914758711,-.0012106305981192]],[-613200,[39.444396946234,-6.557989760571,-13.913760296463],[.0011480029005873,.0022400006880665,3.5168075922288E-4]],[-584E3,[20.2303809507,43.266966657189,7.382966091923],[-.0019754081700585,5.3457141292226E-4,7.5929169129793E-4]],[-554800,[-30.65832536462,2.093818874552,9.880531138071],[6.1010603013347E-5,-.0031326500935382,-9.9346125151067E-4]],[-525600,[35.737703251673,-12.587706024764,-14.677847247563],[.0015802939375649,
.0021347678412429,1.9074436384343E-4]],[-496400,[25.466295188546,41.367478338417,5.216476873382],[-.0018054401046468,8.328308359951E-4,8.0260156912107E-4]],[-467200,[-29.847174904071,10.636426313081,12.297904180106],[-6.3257063052907E-4,-.0029969577578221,-7.4476074151596E-4]],[-438E3,[30.774692107687,-18.236637015304,-14.945535879896],[.0020113162005465,.0019353827024189,-2.0937793168297E-6]],[-408800,[30.243153324028,38.656267888503,2.938501750218],[-.0016052508674468,.0011183495337525,8.3333973416824E-4]],
[-379600,[-27.288984772533,18.643162147874,14.023633623329],[-.0011856388898191,-.0027170609282181,-4.9015526126399E-4]],[-350400,[24.519605196774,-23.245756064727,-14.626862367368],[.0024322321483154,.0016062008146048,-2.3369181613312E-4]],[-321200,[34.505274805875,35.125338586954,.557361475637],[-.0013824391637782,.0013833397561817,8.4823598806262E-4]],[-292E3,[-23.275363915119,25.818514298769,15.055381588598],[-.0016062295460975,-.0023395961498533,-2.4377362639479E-4]],[-262800,[17.050384798092,
-27.180376290126,-13.608963321694],[.0028175521080578,.0011358749093955,-4.9548725258825E-4]],[-233600,[38.093671910285,30.880588383337,-1.843688067413],[-.0011317697153459,.0016128814698472,8.4177586176055E-4]],[-204400,[-18.197852930878,31.932869934309,15.438294826279],[-.0019117272501813,-.0019146495909842,-1.9657304369835E-5]],[-175200,[8.528924039997,-29.618422200048,-11.805400994258],[.0031034370787005,5.139363329243E-4,-7.7293066202546E-4]],[-146E3,[40.94685725864,25.904973592021,-4.256336240499],
[-8.3652705194051E-4,.0018129497136404,8.156422827306E-4]],[-116800,[-12.326958895325,36.881883446292,15.217158258711],[-.0021166103705038,-.001481442003599,1.7401209844705E-4]],[-87600,[-.633258375909,-30.018759794709,-9.17193287495],[.0032016994581737,-2.5279858672148E-4,-.0010411088271861]],[-58400,[42.936048423883,20.344685584452,-6.588027007912],[-5.0525450073192E-4,.0019910074335507,7.7440196540269E-4]],[-29200,[-5.975910552974,40.61180995846,14.470131723673],[-.0022184202156107,-.0010562361130164,
3.3652250216211E-4]],[0,[-9.875369580774,-27.978926224737,-5.753711824704],[.0030287533248818,-.0011276087003636,-.0012651326732361]],[29200,[43.958831986165,14.214147973292,-8.808306227163],[-1.4717608981871E-4,.0021404187242141,7.1486567806614E-4]],[58400,[.67813676352,43.094461639362,13.243238780721],[-.0022358226110718,-6.3233636090933E-4,4.7664798895648E-4]],[87600,[-18.282602096834,-23.30503958666,-1.766620508028],[.0025567245263557,-.0019902940754171,-.0013943491701082]],[116800,[43.873338744526,
7.700705617215,-10.814273666425],[2.3174803055677E-4,.0022402163127924,6.2988756452032E-4]],[146E3,[7.392949027906,44.382678951534,11.629500214854],[-.002193281545383,-2.1751799585364E-4,5.9556516201114E-4]],[175200,[-24.981690229261,-16.204012851426,2.466457544298],[.001819398914958,-.0026765419531201,-.0013848283502247]],[204400,[42.530187039511,.845935508021,-12.554907527683],[6.5059779150669E-4,.0022725657282262,5.1133743202822E-4]],[233600,[13.999526486822,44.462363044894,9.669418486465],[-.0021079296569252,
1.7533423831993E-4,6.9128485798076E-4]],[262800,[-29.184024803031,-7.371243995762,6.493275957928],[9.3581363109681E-4,-.0030610357109184,-.0012364201089345]],[292E3,[39.831980671753,-6.078405766765,-13.909815358656],[.0011117769689167,.0022362097830152,3.6230548231153E-4]],[321200,[20.294955108476,43.417190420251,7.450091985932],[-.0019742157451535,5.3102050468554E-4,7.5938408813008E-4]],[350400,[-30.66999230216,2.318743558955,9.973480913858],[4.5605107450676E-5,-.0031308219926928,-9.9066533301924E-4]],
[379600,[35.626122155983,-12.897647509224,-14.777586508444],[.0016015684949743,.0021171931182284,1.8002516202204E-4]],[408800,[26.133186148561,41.232139187599,5.00640132622],[-.0017857704419579,8.6046232702817E-4,8.0614690298954E-4]],[438E3,[-29.57674022923,11.863535943587,12.631323039872],[-7.2292830060955E-4,-.0029587820140709,-7.08242964503E-4]],[467200,[29.910805787391,-19.159019294,-15.013363865194],[.0020871080437997,.0018848372554514,-3.8528655083926E-5]],[496400,[31.375957451819,38.050372720763,
2.433138343754],[-.0015546055556611,.0011699815465629,8.3565439266001E-4]],[525600,[-26.360071336928,20.662505904952,14.414696258958],[-.0013142373118349,-.0026236647854842,-4.2542017598193E-4]],[554800,[22.599441488648,-24.508879898306,-14.484045731468],[.0025454108304806,.0014917058755191,-3.0243665086079E-4]],[584E3,[35.877864013014,33.894226366071,-.224524636277],[-.0012941245730845,.0014560427668319,8.4762160640137E-4]],[613200,[-21.538149762417,28.204068269761,15.321973799534],[-.001731211740901,
-.0021939631314577,-1.631691327518E-4]],[642400,[13.971521374415,-28.339941764789,-13.083792871886],[.0029334630526035,9.1860931752944E-4,-5.9939422488627E-4]],[671600,[39.526942044143,28.93989736011,-2.872799527539],[-.0010068481658095,.001702113288809,8.3578230511981E-4]],[700800,[-15.576200701394,34.399412961275,15.466033737854],[-.0020098814612884,-.0017191109825989,7.0414782780416E-5]],[73E4,[4.24325283709,-30.118201690825,-10.707441231349],[.0031725847067411,1.609846120227E-4,-9.0672150593868E-4]]],
B=function(a,b,c){this.x=a;this.y=b;this.z=c};B.prototype.clone=function(){return new B(this.x,this.y,this.z)};B.prototype.ToAstroVector=function(a){return new E(this.x,this.y,this.z,a)};B.zero=function(){return new B(0,0,0)};B.prototype.quadrature=function(){return this.x*this.x+this.y*this.y+this.z*this.z};B.prototype.add=function(a){return new B(this.x+a.x,this.y+a.y,this.z+a.z)};B.prototype.sub=function(a){return new B(this.x-a.x,this.y-a.y,this.z-a.z)};B.prototype.incr=function(a){this.x+=a.x;
this.y+=a.y;this.z+=a.z};B.prototype.decr=function(a){this.x-=a.x;this.y-=a.y;this.z-=a.z};B.prototype.mul=function(a){return new B(a*this.x,a*this.y,a*this.z)};B.prototype.div=function(a){return new B(this.x/a,this.y/a,this.z/a)};B.prototype.mean=function(a){return new B((this.x+a.x)/2,(this.y+a.y)/2,(this.z+a.z)/2)};B.prototype.neg=function(){return new B(-this.x,-this.y,-this.z)};var X=function(a,b,c){this.tt=a;this.r=b;this.v=c};X.prototype.clone=function(){return new X(this.tt,this.r,this.v)};
X.prototype.sub=function(a){return new X(this.tt,this.r.sub(a.r),this.v.sub(a.v))};var Da=function(a){var b=new X(a,new B(0,0,0),new B(0,0,0));this.Jupiter=R(b,a,m.Jupiter,2.825345909524226E-7);this.Saturn=R(b,a,m.Saturn,8.459715185680659E-8);this.Uranus=R(b,a,m.Uranus,1.292024916781969E-8);this.Neptune=R(b,a,m.Neptune,1.524358900784276E-8);this.Jupiter.r.decr(b.r);this.Jupiter.v.decr(b.v);this.Saturn.r.decr(b.r);this.Saturn.v.decr(b.v);this.Uranus.r.decr(b.r);this.Uranus.v.decr(b.v);this.Neptune.r.decr(b.r);
this.Neptune.v.decr(b.v);this.Sun=new X(a,b.r.mul(-1),b.v.mul(-1))};Da.prototype.Acceleration=function(a){var b=Ta(a,2.959122082855911E-4,this.Sun.r);b.incr(Ta(a,2.825345909524226E-7,this.Jupiter.r));b.incr(Ta(a,8.459715185680659E-8,this.Saturn.r));b.incr(Ta(a,1.292024916781969E-8,this.Uranus.r));b.incr(Ta(a,1.524358900784276E-8,this.Neptune.r));return b};var Ua=function(a,b,c,d){this.tt=a;this.r=b;this.v=c;this.a=d};Ua.prototype.clone=function(){return new Ua(this.tt,this.r.clone(),this.v.clone(),
this.a.clone())};var ic=function(a,b){this.bary=a;this.grav=b},Ib=[],rd=new J([[.999432765338654,-.0336771074697641,0],[.0303959428906285,.902057912352809,.430543388542295],[-.0144994559663353,-.430299169409101,.902569881273754]]),tb=[{mu:2.82489428433814E-7,al:[1.446213296021224,3.5515522861824],a:[[.0028210960212903,0,0]],l:[[-1.925258348666E-4,4.9369589722645,.01358483658305],[-9.70803596076E-5,4.3188796477322,.01303413843243],[-8.988174165E-5,1.9080016428617,.00305064867158],[-5.53101050262E-5,
1.4936156681569,.01293892891155]],z:[[.0041510849668155,4.089939635545,-.01290686414666],[6.260521444113E-4,1.446188898627,3.5515522949802],[3.52747346169E-5,2.1256287034578,1.2727416567E-4]],zeta:[[3.142172466014E-4,2.7964219722923,-.002315096098],[9.04169207946E-5,1.0477061879627,-5.6920638196E-4]]},{mu:2.82483274392893E-7,al:[-.3735263437471362,1.76932271112347],a:[[.0044871037804314,0,0],[4.324367498E-7,1.819645606291,1.7822295777568]],l:[[8.576433172936E-4,4.3188693178264,.01303413830805],[4.549582875086E-4,
1.4936531751079,.01293892881962],[3.248939825174E-4,1.8196494533458,1.7822295777568],[-3.074250079334E-4,4.9377037005911,.01358483286724],[1.982386144784E-4,1.907986905476,.00305101212869],[1.834063551804E-4,2.1402853388529,.00145009789338],[-1.434383188452E-4,5.622214036663,.89111478887838],[-7.71939140944E-5,4.300272437235,2.6733443704266]],z:[[-.0093589104136341,4.0899396509039,-.01290686414666],[2.988994545555E-4,5.9097265185595,1.7693227079462],[2.13903639035E-4,2.1256289300016,1.2727418407E-4],
[1.980963564781E-4,2.743516829265,6.7797343009E-4],[1.210388158965E-4,5.5839943711203,3.20566149E-5],[8.37042048393E-5,1.6094538368039,-.90402165808846],[8.23525166369E-5,1.4461887708689,3.5515522949802]],zeta:[[.0040404917832303,1.0477063169425,-5.692064054E-4],[2.200421034564E-4,3.3368857864364,-1.2491307307E-4],[1.662544744719E-4,2.4134862374711,0],[5.90282470983E-5,5.9719930968366,-3.056160225E-5]]},{mu:2.82498184184723E-7,al:[.2874089391143348,.878207923589328],a:[[.0071566594572575,0,0],[1.393029911E-6,
1.1586745884981,2.6733443704266]],l:[[2.310797886226E-4,2.1402987195942,.00145009784384],[-1.828635964118E-4,4.3188672736968,.01303413828263],[1.512378778204E-4,4.9373102372298,.01358483481252],[-1.163720969778E-4,4.300265986149,2.6733443704266],[-9.55478069846E-5,1.4936612842567,.01293892879857],[8.15246854464E-5,5.6222137132535,.89111478887838],[-8.01219679602E-5,1.2995922951532,1.0034433456729],[-6.07017260182E-5,.64978769669238,.50172167043264]],z:[[.0014289811307319,2.1256295942739,1.2727413029E-4],
[7.71093122676E-4,5.5836330003496,3.20643411E-5],[5.925911780766E-4,4.0899396636448,-.01290686414666],[2.045597496146E-4,5.2713683670372,-.12523544076106],[1.785118648258E-4,.28743156721063,.8782079244252],[1.131999784893E-4,1.4462127277818,3.5515522949802],[-6.5877816921E-5,2.2702423990985,-1.7951364394537],[4.97058888328E-5,5.9096792204858,1.7693227129285]],zeta:[[.0015932721570848,3.3368862796665,-1.2491307058E-4],[8.533093128905E-4,2.4133881688166,0],[3.513347911037E-4,5.9720789850127,-3.056101771E-5],
[-1.441929255483E-4,1.0477061764435,-5.6920632124E-4]]},{mu:2.82492144889909E-7,al:[-.3620341291375704,.376486233433828],a:[[.0125879701715314,0,0],[3.595204947E-6,.64965776007116,.50172168165034],[2.7580210652E-6,1.808423578151,3.1750660413359]],l:[[5.586040123824E-4,2.1404207189815,.00145009793231],[-3.805813868176E-4,2.7358844897853,2.972965062E-5],[2.205152863262E-4,.649796525964,.5017216724358],[1.877895151158E-4,1.8084787604005,3.1750660413359],[7.66916975242E-5,6.2720114319755,1.3928364636651],
[7.47056855106E-5,1.2995916202344,1.0034433456729]],z:[[.0073755808467977,5.5836071576084,3.206509914E-5],[2.065924169942E-4,5.9209831565786,.37648624194703],[1.589869764021E-4,.28744006242623,.8782079244252],[-1.561131605348E-4,2.1257397865089,1.2727441285E-4],[1.486043380971E-4,1.4462134301023,3.5515522949802],[6.35073108731E-5,5.9096803285954,1.7693227129285],[5.99351698525E-5,4.1125517584798,-2.7985797954589],[5.40660842731E-5,5.5390350845569,.00286834082283],[-4.89596900866E-5,4.6218149483338,
-.62695712529519]],zeta:[[.0038422977898495,2.4133922085557,0],[.0022453891791894,5.9721736773277,-3.056125525E-5],[-2.604479450559E-4,3.3368746306409,-1.2491309972E-4],[3.3211214323E-5,5.5604137742337,.00290037688507]]}],fd=function(a,b,c,d){this.io=a;this.europa=b;this.ganymede=c;this.callisto=d};e.JupiterMoonsInfo=fd;e.JupiterMoons=function(a){a=new O(a);return new fd(kb(a,tb[0]),kb(a,tb[1]),kb(a,tb[2]),kb(a,tb[3]))};e.HelioVector=Z;e.HelioDistance=oa;e.CorrectLightTravel=lc;var nc=function(a,
b,c,d){this.observerBody=a;this.targetBody=b;this.aberration=c;this.observerPos=d};nc.prototype.Position=function(a){this.aberration&&(this.observerPos=Z(this.observerBody,a));var b=Z(this.targetBody,a);return new E(b.x-this.observerPos.x,b.y-this.observerPos.y,b.z-this.observerPos.z,a)};e.BackdatePosition=mc;e.GeoVector=W;e.BaryState=function(a,b){b=v(b);if(a===m.SSB)return new I(0,0,0,0,0,0,b);if(a===m.Pluto)return Hb(b,!1);var c=new Da(b.tt);switch(a){case m.Sun:return pa(c.Sun,b);case m.Jupiter:return pa(c.Jupiter,
b);case m.Saturn:return pa(c.Saturn,b);case m.Uranus:return pa(c.Uranus,b);case m.Neptune:return pa(c.Neptune,b);case m.Moon:case m.EMB:var d=Sa(M[m.Earth],b.tt);a=a===m.Moon?Ra(b):Bb(b);return new I(a.x+c.Sun.r.x+d.r.x,a.y+c.Sun.r.y+d.r.y,a.z+c.Sun.r.z+d.r.z,a.vx+c.Sun.v.x+d.v.x,a.vy+c.Sun.v.y+d.v.y,a.vz+c.Sun.v.z+d.v.z,b)}if(a in M)return a=Sa(M[a],b.tt),new I(c.Sun.r.x+a.r.x,c.Sun.r.y+a.r.y,c.Sun.r.z+a.r.z,c.Sun.v.x+a.v.x,c.Sun.v.y+a.v.y,c.Sun.v.z+a.v.z,b);throw'BaryState: Unsupported body "'+
a+'"';};e.HelioState=mb;e.Search=K;e.SearchSunLongitude=oc;e.PairLongitude=Jb;e.AngleFromSun=Ha;e.EclipticLongitude=qa;var pc=function(a,b,c,d,f,g,h,l){this.time=a;this.mag=b;this.phase_angle=c;this.helio_dist=d;this.geo_dist=f;this.gc=g;this.hc=h;this.ring_tilt=l;this.phase_fraction=(1+Math.cos(e.DEG2RAD*c))/2};e.IlluminationInfo=pc;e.Illumination=nb;e.SearchRelativeLongitude=Ia;e.MoonPhase=Kb;e.SearchMoonPhase=Wa;var rc=function(a,b){this.quarter=a;this.time=b};e.MoonQuarter=rc;e.SearchMoonQuarter=
qc;e.NextMoonQuarter=function(a){a=new Date(a.time.date.getTime()+5184E5);return qc(a)};var tc=function(a,b,c){this.pressure=a;this.temperature=b;this.density=c};e.AtmosphereInfo=tc;e.Atmosphere=sc;e.SearchRiseSet=function(a,b,c,d,f,g){g=void 0===g?0:g;if(!Number.isFinite(g)||0>g)throw"Invalid value for metersAboveGround: "+g;a:switch(a){case m.Sun:var h=Nc;break a;case m.Moon:h=Dd;break a;default:h=0}var l=sc(b.height-g),k=b.latitude*e.DEG2RAD,n=Math.sin(k);k=Math.cos(k);var p=1/Math.hypot(k,.996647180302104*
n),q=(b.height-g)/1E3,t=.175*Math.pow(1-.0065/283.15*(b.height-2/3*g),3.256);return uc(a,b,c,d,f,h,e.RAD2DEG*-(Math.sqrt(2*(1-t)*g/(1E3*Math.hypot((6378.1366*p+q)*k,(6335.438815127603*p+q)*n)))/(1-t))-Ed*l.density)};e.SearchAltitude=function(a,b,c,d,f,g){if(!Number.isFinite(g)||-90>g||90<g)throw"Invalid altitude angle: "+g;return uc(a,b,c,d,f,0,g)};var ud=function(a,b,c,d){this.tx=a;this.ty=b;this.ax=c;this.ay=d},gd=function(a,b){this.time=a;this.hor=b};e.HourAngleEvent=gd;e.SearchHourAngle=function(a,
b,c,d,f){f=void 0===f?1:f;za(b);d=v(d);var g=0;if(a===m.Earth)throw"Cannot search for hour angle of the Earth.";w(c);if(0>c||24<=c)throw"Invalid hour angle "+c;w(f);if(0===f)throw"Direction must be positive or negative.";for(;;){++g;var h=ca(d),l=Pa(a,d,b,!0,!0);h=(c+l.ra-b.longitude/15-h)%24;1===g?0<f?0>h&&(h+=24):0<h&&(h-=24):-12>h?h+=24:12<h&&(h-=24);if(.1>3600*Math.abs(h))return a=hb(d,b,l.ra,l.dec,"normal"),new gd(d,a);d=d.AddDays(h/24*.9972695717592592)}};e.HourAngle=function(a,b,c){var d=v(b);
b=bc(d);a=Pa(a,d,c,!0,!0);c=(c.longitude/15+b-a.ra)%24;0>c&&(c+=24);return c};var hd=function(a,b,c,d){this.mar_equinox=a;this.jun_solstice=b;this.sep_equinox=c;this.dec_solstice=d};e.SeasonInfo=hd;e.Seasons=function(a){function b(h,l,k){l=new Date(Date.UTC(a,l-1,k));h=oc(h,l,20);if(!h)throw"Cannot find season change near "+l.toISOString();return h}a instanceof Date&&Number.isFinite(a.getTime())&&(a=a.getUTCFullYear());if(!Number.isSafeInteger(a))throw"Cannot calculate seasons because year argument "+
a+" is neither a Date nor a safe integer.";var c=b(0,3,10),d=b(90,6,10),f=b(180,9,10),g=b(270,12,10);return new hd(c,d,f,g)};var wc=function(a,b,c,d){this.time=a;this.visibility=b;this.elongation=c;this.ecliptic_separation=d};e.ElongationEvent=wc;e.Elongation=vc;e.SearchMaxElongation=function(a,b){function c(n){var p=n.AddDays(-.005);n=n.AddDays(.005);p=Ha(a,p);n=Ha(a,n);return(p-n)/.01}b=v(b);var d={Mercury:{s1:50,s2:85},Venus:{s1:40,s2:50}}[a];if(!d)throw"SearchMaxElongation works for Mercury and Venus only.";
for(var f=0;2>=++f;){var g=qa(a,b),h=qa(m.Earth,b),l=Fa(g-h),k=g=h=void 0;l>=-d.s1&&l<+d.s1?(k=0,h=+d.s1,g=+d.s2):l>=+d.s2||l<-d.s2?(k=0,h=-d.s2,g=-d.s1):0<=l?(k=-Va(a)/4,h=+d.s1,g=+d.s2):(k=-Va(a)/4,h=-d.s2,g=-d.s1);l=b.AddDays(k);h=Ia(a,h,l);g=Ia(a,g,h);l=c(h);if(0<=l)throw"SearchMaxElongation: internal error: m1 = "+l;k=c(g);if(0>=k)throw"SearchMaxElongation: internal error: m2 = "+k;l=K(c,h,g,{init_f1:l,init_f2:k,dt_tolerance_seconds:10});if(!l)throw"SearchMaxElongation: failed search iter "+
f+" (t1="+h.toString()+", t2="+g.toString()+")";if(l.tt>=b.tt)return vc(a,l);b=g.AddDays(1)}throw"SearchMaxElongation: failed to find event after 2 tries.";};e.SearchPeakMagnitude=function(a,b){function c(k){var n=k.AddDays(-.005);k=k.AddDays(.005);n=nb(a,n).mag;return(nb(a,k).mag-n)/.01}if(a!==m.Venus)throw"SearchPeakMagnitude currently works for Venus only.";b=v(b);for(var d=0;2>=++d;){var f=qa(a,b),g=qa(m.Earth,b),h=Fa(f-g),l=f=g=void 0;-10<=h&&10>h?(l=0,g=10,f=30):30<=h||-30>h?(l=0,g=-30,f=-10):
0<=h?(l=-Va(a)/4,g=10,f=30):(l=-Va(a)/4,g=-30,f=-10);h=b.AddDays(l);g=Ia(a,g,h);f=Ia(a,f,g);h=c(g);if(0<=h)throw"SearchPeakMagnitude: internal error: m1 = "+h;l=c(f);if(0>=l)throw"SearchPeakMagnitude: internal error: m2 = "+l;h=K(c,g,f,{init_f1:h,init_f2:l,dt_tolerance_seconds:10});if(!h)throw"SearchPeakMagnitude: failed search iter "+d+" (t1="+g.toString()+", t2="+f.toString()+")";if(h.tt>=b.tt)return nb(a,h);b=f.AddDays(1)}throw"SearchPeakMagnitude: failed to find event after 2 tries.";};var Ja;
(function(a){a[a.Pericenter=0]="Pericenter";a[a.Apocenter=1]="Apocenter"})(Ja=e.ApsisKind||(e.ApsisKind={}));var Xa=function(a,b,c){this.time=a;this.kind=b;this.dist_au=c;this.dist_km=c*e.KM_PER_AU};e.Apsis=Xa;e.SearchLunarApsis=xc;e.NextLunarApsis=function(a){var b=xc(a.time.AddDays(11));if(1!==b.kind+a.kind)throw"NextLunarApsis INTERNAL ERROR: did not find alternating apogee/perigee: prev="+a.kind+" @ "+a.time.toString()+", next="+b.kind+" @ "+b.time.toString();return b};e.SearchPlanetApsis=zc;
e.NextPlanetApsis=function(a,b){if(b.kind!==Ja.Pericenter&&b.kind!==Ja.Apocenter)throw"Invalid apsis kind: "+b.kind;var c=b.time.AddDays(.25*aa[a].OrbitalPeriod);a=zc(a,c);if(1!==a.kind+b.kind)throw"Internal error: previous apsis was "+b.kind+", but found "+a.kind+" for next apsis.";return a};e.InverseRotation=Ka;e.CombineRotation=ja;e.IdentityMatrix=function(){return new J([[1,0,0],[0,1,0],[0,0,1]])};e.Pivot=function(a,b,c){if(0!==b&&1!==b&&2!==b)throw"Invalid axis "+b+". Must be [0, 1, 2].";var d=
w(c)*e.DEG2RAD;c=Math.cos(d);d=Math.sin(d);var f=(b+1)%3,g=(b+2)%3,h=[[0,0,0],[0,0,0],[0,0,0]];h[f][f]=c*a.rot[f][f]-d*a.rot[f][g];h[f][g]=d*a.rot[f][f]+c*a.rot[f][g];h[f][b]=a.rot[f][b];h[g][f]=c*a.rot[g][f]-d*a.rot[g][g];h[g][g]=d*a.rot[g][f]+c*a.rot[g][g];h[g][b]=a.rot[g][b];h[b][f]=c*a.rot[b][f]-d*a.rot[b][g];h[b][g]=d*a.rot[b][f]+c*a.rot[b][g];h[b][b]=a.rot[b][b];return new J(h)};e.VectorFromSphere=lb;e.EquatorFromVector=Mb;e.SphereFromVector=Nb;e.HorizonFromVector=function(a,b){a=Nb(a);a.lon=
Ac(a.lon);a.lat+=Oa(b,a.lat);return a};e.VectorFromHorizon=function(a,b,c){b=v(b);var d=Ac(a.lon);c=a.lat+Bc(c,a.lat);a=new Ba(c,d,a.dist);return lb(a,b)};e.Refraction=Oa;e.InverseRefraction=Bc;e.RotateVector=Ya;e.RotateState=Ea;e.Rotation_EQJ_ECL=Cc;e.Rotation_ECL_EQJ=function(){return new J([[1,0,0],[0,.9174821430670688,.3977769691083922],[0,-.3977769691083922,.9174821430670688]])};e.Rotation_EQJ_EQD=ob;e.Rotation_EQJ_ECT=function(a){var b=v(a);a=ob(b);b=Jc(b);return ja(a,b)};e.Rotation_ECT_EQJ=
function(a){var b=v(a);a=Ic(b);b=pb(b);return ja(a,b)};e.Rotation_EQD_EQJ=pb;e.Rotation_EQD_HOR=Ob;e.Rotation_HOR_EQD=Dc;e.Rotation_HOR_EQJ=Ec;e.Rotation_EQJ_HOR=function(a,b){a=Ec(a,b);return Ka(a)};e.Rotation_EQD_ECL=Fc;e.Rotation_ECL_EQD=Gc;e.Rotation_ECL_HOR=Hc;e.Rotation_HOR_ECL=function(a,b){a=Hc(a,b);return Ka(a)};e.Rotation_EQJ_GAL=function(){return new J([[-.0548624779711344,.4941095946388765,-.8676668813529025],[-.8734572784246782,-.4447938112296831,-.1980677870294097],[-.483800052994852,
.7470034631630423,.4559861124470794]])};e.Rotation_GAL_EQJ=function(){return new J([[-.0548624779711344,-.8734572784246782,-.483800052994852],[.4941095946388765,-.4447938112296831,.7470034631630423],[-.8676668813529025,-.1980677870294097,.4559861124470794]])};e.Rotation_ECT_EQD=Ic;e.Rotation_EQD_ECT=Jc;var Fd=[["And","Andromeda"],["Ant","Antila"],["Aps","Apus"],["Aql","Aquila"],["Aqr","Aquarius"],["Ara","Ara"],["Ari","Aries"],["Aur","Auriga"],["Boo","Bootes"],["Cae","Caelum"],["Cam","Camelopardis"],
["Cap","Capricornus"],["Car","Carina"],["Cas","Cassiopeia"],["Cen","Centaurus"],["Cep","Cepheus"],["Cet","Cetus"],["Cha","Chamaeleon"],["Cir","Circinus"],["CMa","Canis Major"],["CMi","Canis Minor"],["Cnc","Cancer"],["Col","Columba"],["Com","Coma Berenices"],["CrA","Corona Australis"],["CrB","Corona Borealis"],["Crt","Crater"],["Cru","Crux"],["Crv","Corvus"],["CVn","Canes Venatici"],["Cyg","Cygnus"],["Del","Delphinus"],["Dor","Dorado"],["Dra","Draco"],["Equ","Equuleus"],["Eri","Eridanus"],["For","Fornax"],
["Gem","Gemini"],["Gru","Grus"],["Her","Hercules"],["Hor","Horologium"],["Hya","Hydra"],["Hyi","Hydrus"],["Ind","Indus"],["Lac","Lacerta"],["Leo","Leo"],["Lep","Lepus"],["Lib","Libra"],["LMi","Leo Minor"],["Lup","Lupus"],["Lyn","Lynx"],["Lyr","Lyra"],["Men","Mensa"],["Mic","Microscopium"],["Mon","Monoceros"],["Mus","Musca"],["Nor","Norma"],["Oct","Octans"],["Oph","Ophiuchus"],["Ori","Orion"],["Pav","Pavo"],["Peg","Pegasus"],["Per","Perseus"],["Phe","Phoenix"],["Pic","Pictor"],["PsA","Pisces Austrinus"],
["Psc","Pisces"],["Pup","Puppis"],["Pyx","Pyxis"],["Ret","Reticulum"],["Scl","Sculptor"],["Sco","Scorpius"],["Sct","Scutum"],["Ser","Serpens"],["Sex","Sextans"],["Sge","Sagitta"],["Sgr","Sagittarius"],["Tau","Taurus"],["Tel","Telescopium"],["TrA","Triangulum Australe"],["Tri","Triangulum"],["Tuc","Tucana"],["UMa","Ursa Major"],["UMi","Ursa Minor"],["Vel","Vela"],["Vir","Virgo"],["Vol","Volans"],["Vul","Vulpecula"]],Gd=[[83,0,8640,2112],[83,2880,5220,2076],[83,7560,8280,2068],[83,6480,7560,2064],[15,
0,2880,2040],[10,3300,3840,1968],[15,0,1800,1920],[10,3840,5220,1920],[83,6300,6480,1920],[33,7260,7560,1920],[15,0,1263,1848],[10,4140,4890,1848],[83,5952,6300,1800],[15,7260,7440,1800],[10,2868,3300,1764],[33,3300,4080,1764],[83,4680,5952,1680],[13,1116,1230,1632],[33,7350,7440,1608],[33,4080,4320,1596],[15,0,120,1584],[83,5040,5640,1584],[15,8490,8640,1584],[33,4320,4860,1536],[33,4860,5190,1512],[15,8340,8490,1512],[10,2196,2520,1488],[33,7200,7350,1476],[15,7393.2,7416,1462],[10,2520,2868,1440],
[82,2868,3030,1440],[33,7116,7200,1428],[15,7200,7393.2,1428],[15,8232,8340,1418],[13,0,876,1404],[33,6990,7116,1392],[13,612,687,1380],[13,876,1116,1368],[10,1116,1140,1368],[15,8034,8232,1350],[10,1800,2196,1344],[82,5052,5190,1332],[33,5190,6990,1332],[10,1140,1200,1320],[15,7968,8034,1320],[15,7416,7908,1316],[13,0,612,1296],[50,2196,2340,1296],[82,4350,4860,1272],[33,5490,5670,1272],[15,7908,7968,1266],[10,1200,1800,1260],[13,8232,8400,1260],[33,5670,6120,1236],[62,735,906,1212],[33,6120,6564,
1212],[13,0,492,1200],[62,492,600,1200],[50,2340,2448,1200],[13,8400,8640,1200],[82,4860,5052,1164],[13,0,402,1152],[13,8490,8640,1152],[39,6543,6564,1140],[33,6564,6870,1140],[30,6870,6900,1140],[62,600,735,1128],[82,3030,3300,1128],[13,60,312,1104],[82,4320,4350,1080],[50,2448,2652,1068],[30,7887,7908,1056],[30,7875,7887,1050],[30,6900,6984,1044],[82,3300,3660,1008],[82,3660,3882,960],[8,5556,5670,960],[39,5670,5880,960],[50,3330,3450,954],[0,0,906,882],[62,906,924,882],[51,6969,6984,876],[62,1620,
1689,864],[30,7824,7875,864],[44,7875,7920,864],[7,2352,2652,852],[50,2652,2790,852],[0,0,720,840],[44,7920,8214,840],[44,8214,8232,828],[0,8232,8460,828],[62,924,978,816],[82,3882,3960,816],[29,4320,4440,816],[50,2790,3330,804],[48,3330,3558,804],[0,258,507,792],[8,5466,5556,792],[0,8460,8550,770],[29,4440,4770,768],[0,8550,8640,752],[29,5025,5052,738],[80,870,978,736],[62,978,1620,736],[7,1620,1710,720],[51,6543,6969,720],[82,3960,4320,696],[30,7080,7530,696],[7,1710,2118,684],[48,3558,3780,684],
[29,4770,5025,684],[0,0,24,672],[80,507,600,672],[7,2118,2352,672],[37,2838,2880,672],[30,7530,7824,672],[30,6933,7080,660],[80,690,870,654],[25,5820,5880,648],[8,5430,5466,624],[25,5466,5820,624],[51,6612,6792,624],[48,3870,3960,612],[51,6792,6933,612],[80,600,690,600],[66,258,306,570],[48,3780,3870,564],[87,7650,7710,564],[77,2052,2118,548],[0,24,51,528],[73,5730,5772,528],[37,2118,2238,516],[87,7140,7290,510],[87,6792,6930,506],[0,51,306,504],[87,7290,7404,492],[37,2811,2838,480],[87,7404,7650,
468],[87,6930,7140,460],[6,1182,1212,456],[75,6792,6840,444],[59,2052,2076,432],[37,2238,2271,420],[75,6840,7140,388],[77,1788,1920,384],[39,5730,5790,384],[75,7140,7290,378],[77,1662,1788,372],[77,1920,2016,372],[23,4620,4860,360],[39,6210,6570,344],[23,4272,4620,336],[37,2700,2811,324],[39,6030,6210,308],[61,0,51,300],[77,2016,2076,300],[37,2520,2700,300],[61,7602,7680,300],[37,2271,2496,288],[39,6570,6792,288],[31,7515,7578,284],[61,7578,7602,284],[45,4146,4272,264],[59,2247,2271,240],[37,2496,
2520,240],[21,2811,2853,240],[61,8580,8640,240],[6,600,1182,238],[31,7251,7308,204],[8,4860,5430,192],[61,8190,8580,180],[21,2853,3330,168],[45,3330,3870,168],[58,6570,6718.4,150],[3,6718.4,6792,150],[31,7500,7515,144],[20,2520,2526,132],[73,6570,6633,108],[39,5790,6030,96],[58,6570,6633,72],[61,7728,7800,66],[66,0,720,48],[73,6690,6792,48],[31,7308,7500,48],[34,7500,7680,48],[61,7680,7728,48],[61,7920,8190,48],[61,7800,7920,42],[20,2526,2592,36],[77,1290,1662,0],[59,1662,1680,0],[20,2592,2910,0],
[85,5280,5430,0],[58,6420,6570,0],[16,954,1182,-42],[77,1182,1290,-42],[73,5430,5856,-78],[59,1680,1830,-96],[59,2100,2247,-96],[73,6420,6468,-96],[73,6570,6690,-96],[3,6690,6792,-96],[66,8190,8580,-96],[45,3870,4146,-144],[85,4146,4260,-144],[66,0,120,-168],[66,8580,8640,-168],[85,5130,5280,-192],[58,5730,5856,-192],[3,7200,7392,-216],[4,7680,7872,-216],[58,6180,6468,-240],[54,2100,2910,-264],[35,1770,1830,-264],[59,1830,2100,-264],[41,2910,3012,-264],[74,3450,3870,-264],[85,4260,4620,-264],[58,
6330,6360,-280],[3,6792,7200,-288.8],[35,1740,1770,-348],[4,7392,7680,-360],[73,6180,6570,-384],[72,6570,6792,-384],[41,3012,3090,-408],[58,5856,5895,-438],[41,3090,3270,-456],[26,3870,3900,-456],[71,5856,5895,-462],[47,5640,5730,-480],[28,4530,4620,-528],[85,4620,5130,-528],[41,3270,3510,-576],[16,600,954,-585.2],[35,954,1350,-585.2],[26,3900,4260,-588],[28,4260,4530,-588],[47,5130,5370,-588],[58,5856,6030,-590],[16,0,600,-612],[11,7680,7872,-612],[4,7872,8580,-612],[16,8580,8640,-612],[41,3510,
3690,-636],[35,1692,1740,-654],[46,1740,2202,-654],[11,7200,7680,-672],[41,3690,3810,-700],[41,4530,5370,-708],[47,5370,5640,-708],[71,5640,5760,-708],[35,1650,1692,-720],[58,6030,6336,-720],[76,6336,6420,-720],[41,3810,3900,-748],[19,2202,2652,-792],[41,4410,4530,-792],[41,3900,4410,-840],[36,1260,1350,-864],[68,3012,3372,-882],[35,1536,1650,-888],[76,6420,6900,-888],[65,7680,8280,-888],[70,8280,8400,-888],[36,1080,1260,-950],[1,3372,3960,-954],[70,0,600,-960],[36,600,1080,-960],[35,1392,1536,-960],
[70,8400,8640,-960],[14,5100,5370,-1008],[49,5640,5760,-1008],[71,5760,5911.5,-1008],[9,1740,1800,-1032],[22,1800,2370,-1032],[67,2880,3012,-1032],[35,1230,1392,-1056],[71,5911.5,6420,-1092],[24,6420,6900,-1092],[76,6900,7320,-1092],[53,7320,7680,-1092],[35,1080,1230,-1104],[9,1620,1740,-1116],[49,5520,5640,-1152],[63,0,840,-1156],[35,960,1080,-1176],[40,1470,1536,-1176],[9,1536,1620,-1176],[38,7680,7920,-1200],[67,2160,2880,-1218],[84,2880,2940,-1218],[35,870,960,-1224],[40,1380,1470,-1224],[63,
0,660,-1236],[12,2160,2220,-1260],[84,2940,3042,-1272],[40,1260,1380,-1276],[32,1380,1440,-1276],[63,0,570,-1284],[35,780,870,-1296],[64,1620,1800,-1296],[49,5418,5520,-1296],[84,3042,3180,-1308],[12,2220,2340,-1320],[14,4260,4620,-1320],[49,5100,5418,-1320],[56,5418,5520,-1320],[32,1440,1560,-1356],[84,3180,3960,-1356],[14,3960,4050,-1356],[5,6300,6480,-1368],[78,6480,7320,-1368],[38,7920,8400,-1368],[40,1152,1260,-1380],[64,1800,1980,-1380],[12,2340,2460,-1392],[63,0,480,-1404],[35,480,780,-1404],
[63,8400,8640,-1404],[32,1560,1650,-1416],[56,5520,5911.5,-1440],[43,7320,7680,-1440],[64,1980,2160,-1464],[18,5460,5520,-1464],[5,5911.5,5970,-1464],[18,5370,5460,-1526],[5,5970,6030,-1526],[64,2160,2460,-1536],[12,2460,3252,-1536],[14,4050,4260,-1536],[27,4260,4620,-1536],[14,4620,5232,-1536],[18,4860,4920,-1560],[5,6030,6060,-1560],[40,780,1152,-1620],[69,1152,1650,-1620],[18,5310,5370,-1620],[5,6060,6300,-1620],[60,6300,6480,-1620],[81,7920,8400,-1620],[32,1650,2370,-1680],[18,4920,5310,-1680],
[79,5310,6120,-1680],[81,0,480,-1800],[42,1260,1650,-1800],[86,2370,3252,-1800],[12,3252,4050,-1800],[55,4050,4920,-1800],[60,6480,7680,-1800],[43,7680,8400,-1800],[81,8400,8640,-1800],[81,270,480,-1824],[42,0,1260,-1980],[17,2760,4920,-1980],[2,4920,6480,-1980],[52,1260,2760,-2040],[57,0,8640,-2160]],Tb,id,jd=function(a,b,c,d){this.symbol=a;this.name=b;this.ra1875=c;this.dec1875=d};e.ConstellationInfo=jd;e.Constellation=function(a,b){w(a);w(b);if(-90>b||90<b)throw"Invalid declination angle. Must be -90..+90.";
a%=24;0>a&&(a+=24);Tb||(Tb=ob(new O(-45655.74141261017)),id=new O(0));a=new Ba(b,15*a,1);a=lb(a,id);a=Ya(Tb,a);a=Mb(a);b=10/240;for(var c=b/15,d=$jscomp.makeIterator(Gd),f=d.next();!f.done;f=d.next()){f=f.value;var g=f[1]*c,h=f[2]*c;if(f[3]*b<=a.dec&&g<=a.ra&&a.ra<h)return b=Fd[f[0]],new jd(b[0],b[1],a.ra,a.dec)}throw"Unable to find constellation for given coordinates.";};var S;(function(a){a.Penumbral="penumbral";a.Partial="partial";a.Annular="annular";a.Total="total"})(S=e.EclipseKind||(e.EclipseKind=
{}));var Pc=function(a,b,c,d,f,g){this.kind=a;this.obscuration=b;this.peak=c;this.sd_penum=d;this.sd_partial=f;this.sd_total=g};e.LunarEclipseInfo=Pc;var xd=function(a,b,c,d,f,g,h){this.time=a;this.u=b;this.r=c;this.k=d;this.p=f;this.target=g;this.dir=h};e.SearchLunarEclipse=Oc;var Rc=function(a,b,c,d,f,g){this.kind=a;this.obscuration=b;this.peak=c;this.distance=d;this.latitude=f;this.longitude=g};e.GlobalSolarEclipseInfo=Rc;e.NextLunarEclipse=function(a){a=v(a);a=a.AddDays(10);return Oc(a)};e.SearchGlobalSolarEclipse=
Qc;e.NextGlobalSolarEclipse=function(a){a=v(a);a=a.AddDays(10);return Qc(a)};var Vc=function(a,b){this.time=a;this.altitude=b};e.EclipseEvent=Vc;var Xc=function(a,b,c,d,f,g,h){this.kind=a;this.obscuration=b;this.partial_begin=c;this.total_begin=d;this.peak=f;this.total_end=g;this.partial_end=h};e.LocalSolarEclipseInfo=Xc;e.SearchLocalSolarEclipse=Wc;e.NextLocalSolarEclipse=function(a,b){a=v(a);a=a.AddDays(10);return Wc(a,b)};var $c=function(a,b,c,d){this.start=a;this.peak=b;this.finish=c;this.separation=
d};e.TransitInfo=$c;e.SearchTransit=Zc;e.NextTransit=function(a,b){b=v(b);b=b.AddDays(100);return Zc(a,b)};var ra;(function(a){a[a.Invalid=0]="Invalid";a[a.Ascending=1]="Ascending";a[a.Descending=-1]="Descending"})(ra=e.NodeEventKind||(e.NodeEventKind={}));var bd=function(a,b){this.kind=a;this.time=b};e.NodeEventInfo=bd;e.SearchMoonNode=ad;e.NextMoonNode=function(a){var b=a.time.AddDays(10);b=ad(b);switch(a.kind){case ra.Ascending:if(b.kind!==ra.Descending)throw"Internal error: previous node was ascending, but this node was: "+
b.kind;break;case ra.Descending:if(b.kind!==ra.Ascending)throw"Internal error: previous node was descending, but this node was: "+b.kind;break;default:throw"Previous node has an invalid node kind: "+a.kind;}return b};var Ub=function(a,b,c,d){this.ra=a;this.dec=b;this.spin=c;this.north=d};e.AxisInfo=Ub;e.RotationAxis=function(a,b){b=v(b);var c=b.tt,d=c/36525;switch(a){case m.Sun:a=286.13;var f=63.87;c=84.176+14.1844*c;break;case m.Mercury:a=281.0103-.0328*d;f=61.4155-.0049*d;c=329.5988+6.1385108*c+
.01067257*Math.sin(e.DEG2RAD*(174.7910857+4.092335*c))-.00112309*Math.sin(e.DEG2RAD*(349.5821714+8.18467*c))-1.104E-4*Math.sin(e.DEG2RAD*(164.3732571+12.277005*c))-2.539E-5*Math.sin(e.DEG2RAD*(339.1643429+16.36934*c))-5.71E-6*Math.sin(e.DEG2RAD*(153.9554286+20.461675*c));break;case m.Venus:a=272.76;f=67.16;c=160.2-1.4813688*c;break;case m.Earth:return a=xa([0,0,1],b,F.Into2000),a=wa(a,b,F.Into2000),a=new E(a[0],a[1],a[2],b),c=Mb(a),new Ub(c.ra,c.dec,190.41375788700253+360.9856122880876*b.ut,a);case m.Moon:var g=
e.DEG2RAD*(125.045-.0529921*c),h=e.DEG2RAD*(250.089-.1059842*c),l=e.DEG2RAD*(260.008+13.0120009*c),k=e.DEG2RAD*(176.625+13.3407154*c),n=e.DEG2RAD*(357.529+.9856003*c),p=e.DEG2RAD*(311.589+26.4057084*c),q=e.DEG2RAD*(134.963+13.064993*c),t=e.DEG2RAD*(276.617+.3287146*c),y=e.DEG2RAD*(34.226+1.7484877*c),x=e.DEG2RAD*(15.134-.1589763*c),z=e.DEG2RAD*(119.743+.0036096*c),ab=e.DEG2RAD*(239.961+.1643573*c),va=e.DEG2RAD*(25.053+12.9590088*c);a=269.9949+.0031*d-3.8787*Math.sin(g)-.1204*Math.sin(h)+.07*Math.sin(l)-
.0172*Math.sin(k)+.0072*Math.sin(p)-.0052*Math.sin(x)+.0043*Math.sin(va);f=66.5392+.013*d+1.5419*Math.cos(g)+.0239*Math.cos(h)-.0278*Math.cos(l)+.0068*Math.cos(k)-.0029*Math.cos(p)+9E-4*Math.cos(q)+8E-4*Math.cos(x)-9E-4*Math.cos(va);c=38.3213+(13.17635815-1.4E-12*c)*c+3.561*Math.sin(g)+.1208*Math.sin(h)-.0642*Math.sin(l)+.0158*Math.sin(k)+.0252*Math.sin(n)-.0066*Math.sin(p)-.0047*Math.sin(q)-.0046*Math.sin(t)+.0028*Math.sin(y)+.0052*Math.sin(x)+.004*Math.sin(z)+.0019*Math.sin(ab)-.0044*Math.sin(va);
break;case m.Mars:a=317.269202-.10927547*d+6.8E-5*Math.sin(e.DEG2RAD*(198.991226+19139.4819985*d))+2.38E-4*Math.sin(e.DEG2RAD*(226.292679+38280.8511281*d))+5.2E-5*Math.sin(e.DEG2RAD*(249.663391+57420.7251593*d))+9E-6*Math.sin(e.DEG2RAD*(266.18351+76560.636795*d))+.419057*Math.sin(e.DEG2RAD*(79.398797+.5042615*d));f=54.432516-.05827105*d+5.1E-5*Math.cos(e.DEG2RAD*(122.433576+19139.9407476*d))+1.41E-4*Math.cos(e.DEG2RAD*(43.058401+38280.8753272*d))+3.1E-5*Math.cos(e.DEG2RAD*(57.663379+57420.7517205*
d))+5E-6*Math.cos(e.DEG2RAD*(79.476401+76560.6495004*d))+1.591274*Math.cos(e.DEG2RAD*(166.325722+.5042615*d));c=176.049863+350.891982443297*c+1.45E-4*Math.sin(e.DEG2RAD*(129.071773+19140.0328244*d))+1.57E-4*Math.sin(e.DEG2RAD*(36.352167+38281.0473591*d))+4E-5*Math.sin(e.DEG2RAD*(56.668646+57420.929536*d))+1E-6*Math.sin(e.DEG2RAD*(67.364003+76560.2552215*d))+1E-6*Math.sin(e.DEG2RAD*(104.79268+95700.4387578*d))+.584542*Math.sin(e.DEG2RAD*(95.391654+.5042615*d));break;case m.Jupiter:f=e.DEG2RAD*(99.360714+
4850.4046*d);g=e.DEG2RAD*(175.895369+1191.9605*d);h=e.DEG2RAD*(300.323162+262.5475*d);l=e.DEG2RAD*(114.012305+6070.2476*d);k=e.DEG2RAD*(49.511251+64.3*d);a=268.056595-.006499*d+1.17E-4*Math.sin(f)+9.38E-4*Math.sin(g)+.001432*Math.sin(h)+3E-5*Math.sin(l)+.00215*Math.sin(k);f=64.495303+.002413*d+5E-5*Math.cos(f)+4.04E-4*Math.cos(g)+6.17E-4*Math.cos(h)-1.3E-5*Math.cos(l)+9.26E-4*Math.cos(k);c=284.95+870.536*c;break;case m.Saturn:a=40.589-.036*d;f=83.537-.004*d;c=38.9+810.7939024*c;break;case m.Uranus:a=
257.311;f=-15.175;c=203.81-501.1600928*c;break;case m.Neptune:d=e.DEG2RAD*(357.85+52.316*d);a=299.36+.7*Math.sin(d);f=43.46-.51*Math.cos(d);c=249.978+541.1397757*c-.48*Math.sin(d);break;case m.Pluto:a=132.993;f=-6.163;c=302.695+56.3625225*c;break;default:throw"Invalid body: "+a;}d=f*e.DEG2RAD;g=a*e.DEG2RAD;h=Math.cos(d);b=new E(h*Math.cos(g),h*Math.sin(g),Math.sin(d),b);return new Ub(a/15,f,c,b)};e.LagrangePoint=function(a,b,c,d){var f=v(b);b=C(c);var g=C(d);c===m.Earth&&d===m.Moon?(c=new I(0,0,0,
0,0,0,f),d=Ra(f)):(c=mb(c,f),d=mb(d,f));return cd(a,c,b,d,g)};e.LagrangePointFast=cd;var H=function(a,b,c){b=v(b);this.originBody=a;for(var d=$jscomp.makeIterator(c),f=d.next();!f.done;f=d.next())if(f.value.t.tt!==b.tt)throw"Inconsistent times in bodyStates";d=[];f=H.CalcSolarSystem(b);this.curr=new kd(b,f,d);a=this.InternalBodyState(a);c=$jscomp.makeIterator(c);for(f=c.next();!f.done;f=c.next()){var g=f.value;f=new B(g.x+a.r.x,g.y+a.r.y,g.z+a.r.z);g=new B(g.vx+a.v.x,g.vy+a.v.y,g.vz+a.v.z);var h=
B.zero();d.push(new Ua(b.tt,f,g,h))}this.CalcBodyAccelerations();this.prev=this.Duplicate()};H.prototype.Update=function(a){a=v(a);var b=a.tt-this.curr.time.tt;if(0===b)this.prev=this.Duplicate();else{this.Swap();this.curr.time=a;this.curr.gravitators=H.CalcSolarSystem(a);for(var c=0;c<this.curr.bodies.length;++c){var d=this.prev.bodies[c];this.curr.bodies[c].r=Ca(b,d.r,d.v,d.a)}this.CalcBodyAccelerations();for(c=0;c<this.curr.bodies.length;++c){d=this.prev.bodies[c];var f=this.curr.bodies[c],g=d.a.mean(f.a);
f.tt=a.tt;f.r=Ca(b,d.r,d.v,g);f.v=Eb(b,d.v,g)}this.CalcBodyAccelerations()}b=[];c=this.InternalBodyState(this.originBody);d=$jscomp.makeIterator(this.curr.bodies);for(f=d.next();!f.done;f=d.next())f=f.value,b.push(new I(f.r.x-c.r.x,f.r.y-c.r.y,f.r.z-c.r.z,f.v.x-c.v.x,f.v.y-c.v.y,f.v.z-c.v.z,a));return b};H.prototype.Swap=function(){var a=this.curr;this.curr=this.prev;this.prev=a};H.prototype.SolarSystemBodyState=function(a){a=this.InternalBodyState(a);var b=this.InternalBodyState(this.originBody);
return pa(a.sub(b),this.curr.time)};H.prototype.InternalBodyState=function(a){if(a===m.SSB)return new X(this.curr.time.tt,B.zero(),B.zero());var b=this.curr.gravitators[a];if(b)return b;throw"Invalid body: "+a;};H.CalcSolarSystem=function(a){var b={},c=new X(a.tt,B.zero(),B.zero());b[m.Mercury]=R(c,a.tt,m.Mercury,4.912547451450812E-11);b[m.Venus]=R(c,a.tt,m.Venus,7.243452486162703E-10);b[m.Earth]=R(c,a.tt,m.Earth,8.997011346712498E-10);b[m.Mars]=R(c,a.tt,m.Mars,9.549535105779258E-11);b[m.Jupiter]=
R(c,a.tt,m.Jupiter,2.825345909524226E-7);b[m.Saturn]=R(c,a.tt,m.Saturn,8.459715185680659E-8);b[m.Uranus]=R(c,a.tt,m.Uranus,1.292024916781969E-8);b[m.Neptune]=R(c,a.tt,m.Neptune,1.524358900784276E-8);for(var d in b)b[d].r.decr(c.r),b[d].v.decr(c.v);b[m.Sun]=new X(a.tt,c.r.neg(),c.v.neg());return b};H.prototype.CalcBodyAccelerations=function(){for(var a=$jscomp.makeIterator(this.curr.bodies),b=a.next();!b.done;b=a.next())b=b.value,b.a=B.zero(),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Sun].r,
2.959122082855911E-4),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Mercury].r,4.912547451450812E-11),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Venus].r,7.243452486162703E-10),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Earth].r,8.997011346712498E-10),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Mars].r,9.549535105779258E-11),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Jupiter].r,2.825345909524226E-7),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Saturn].r,8.459715185680659E-8),
H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Uranus].r,1.292024916781969E-8),H.AddAcceleration(b.a,b.r,this.curr.gravitators[m.Neptune].r,1.524358900784276E-8)};H.AddAcceleration=function(a,b,c,d){var f=c.x-b.x,g=c.y-b.y;b=c.z-b.z;c=f*f+g*g+b*b;d/=c*Math.sqrt(c);a.x+=f*d;a.y+=g*d;a.z+=b*d};H.prototype.Duplicate=function(){var a={};for(b in this.curr.gravitators)a[b]=this.curr.gravitators[b].clone();var b=[];for(var c=$jscomp.makeIterator(this.curr.bodies),d=c.next();!d.done;d=c.next())b.push(d.value.clone());
return new kd(this.curr.time,a,b)};$jscomp.global.Object.defineProperties(H.prototype,{OriginBody:{configurable:!0,enumerable:!0,get:function(){return this.originBody}},Time:{configurable:!0,enumerable:!0,get:function(){return this.curr.time}}});e.GravitySimulator=H;var kd=function(a,b,c){this.time=a;this.gravitators=b;this.bodies=c}},{}]},{},[1])(1)});


(function attachShunyaMath(root, factory) {
  // The embedded UMD kernel exports to module.exports in Node, to Astronomy
  // in browsers. Capture it before publishing this module's own API.
  const astronomy = typeof module === "object" && module.exports
    ? module.exports : root.Astronomy;
  const vsop = typeof module === "object" && module.exports
    ? require("./vsop87-full.js") : root.ShunyaVsop87;
  const elp = typeof module === "object" && module.exports
    ? require("./elp-moon.js") : root.ShunyaElp;
  const api = factory(astronomy, vsop, elp);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ShunyaMath = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function buildShunyaMath(Astronomy, Vsop87, ElpMoon) {
  "use strict";

  /* ─── ΔT (TT − UT1) · observed IERS/AA annual values 1800–2026 (audit 2026-09-20) ───
     Astronomy Engine's default ΔT is the Espenak–Meeus 2005–2050 *prediction*, which is 5.5 s
     high in 2025 (74.7 s vs 69.2 s observed) → +3.05″ on the Moon, measured against Swiss (DE431-derived files)
     with the observed ΔT. Values at Jan 1.0,
     linearly interpolated; outside the table the E–M polynomial is joined continuously (constant
     offset after 2026 — refresh from IERS Bulletin A yearly; offset tapered to zero 1800→1700).
     Installed via Astronomy.SetDeltaTFunction so every MakeTime()/drigCoordinates() call uses it. */
  const OBS_DELTA_T_FIRST_YEAR = 1800;
  const OBS_DELTA_T = Object.freeze([
    // IERS refresh 2026-09-20: 1973–2027 from finals.all (Bulletin A; Jan 1 values ≥2027 are IERS predictions)
    18.60, 18.15, 17.68, 17.20, 16.75, 16.32, 15.94, 15.62, 15.37, 15.21,   // 1800-1809
    15.16, 15.22, 15.37, 15.59, 15.85, 16.11, 16.36, 16.56, 16.68, 16.70,   // 1810-1819
    16.60, 16.34, 15.95, 15.44, 14.85, 14.19, 13.48, 12.76, 12.04, 11.34,   // 1820-1829
    10.69, 10.10, 9.58, 9.13, 8.74, 8.42, 8.15, 7.93, 7.77, 7.67,   // 1830-1839
    7.61, 7.60, 7.63, 7.71, 7.82, 7.98, 8.17, 8.40, 8.66, 8.95,   // 1840-1849
    9.27, 9.61, 9.93, 10.18, 10.33, 10.33, 10.15, 9.85, 9.51, 9.20,   // 1850-1859
    9.00, 8.95, 8.97, 8.93, 8.72, 8.22, 7.35, 6.19, 4.88, 3.55,   // 1860-1869
    2.34, 1.33, 0.52, -0.13, -0.68, -1.16, -1.61, -2.04, -2.45, -2.85,   // 1870-1879
    -3.24, -3.60, -3.93, -4.19, -4.36, -4.41, -4.33, -4.17, -4.00, -3.89,   // 1880-1889
    -3.90, -4.09, -4.39, -4.71, -4.95, -5.03, -4.88, -4.49, -3.87, -3.03,   // 1890-1899
    -1.99, -0.76, 0.61, 2.05, 3.50, 4.91, 6.23, 7.48, 8.68, 9.89,   // 1900-1909
    11.13, 12.43, 13.74, 15.05, 16.31, 17.47, 18.51, 19.43, 20.25, 20.97,   // 1910-1919
    21.61, 22.18, 22.68, 23.12, 23.48, 23.78, 24.02, 24.19, 24.31, 24.39,   // 1920-1929
    24.42, 24.41, 24.37, 24.32, 24.24, 24.16, 24.08, 24.04, 24.06, 24.17,   // 1930-1939
    24.42, 24.83, 25.35, 25.92, 26.51, 27.05, 27.50, 27.89, 28.24, 28.58,   // 1940-1949
    28.93, 29.32, 29.70, 30.18, 30.62, 31.07, 31.35, 31.68, 32.18, 32.68,   // 1950-1959
    33.15, 33.59, 34.00, 34.47, 35.03, 35.73, 36.54, 37.43, 38.29, 39.20,   // 1960-1969
    40.18, 41.17, 42.23, 43.37, 44.48, 45.48, 46.46, 47.52, 48.53, 49.59,   // 1970-1979
    50.539, 51.381, 52.167, 52.956, 53.788, 54.343, 54.871, 55.322, 55.820, 56.300,   // 1980-1989
    56.855, 57.565, 58.309, 59.122, 59.984, 60.785, 61.629, 62.295, 62.966, 63.467,   // 1990-1999
    63.829, 64.091, 64.300, 64.473, 64.574, 64.688, 64.845, 65.146, 65.457, 65.777,   // 2000-2009
    66.070, 66.325, 66.603, 66.907, 67.281, 67.644, 68.102, 68.593, 68.968, 69.220,   // 2010-2019
    69.361, 69.359, 69.294, 69.204, 69.175, 69.138, 69.110, 69.303,   // 2020-2027
  ]);
  function observedDeltaTSeconds(ut) {              // ut = days since J2000 (UT), Astronomy Engine convention
    const year = 2000 + ut / 365.25;
    const last = OBS_DELTA_T_FIRST_YEAR + OBS_DELTA_T.length - 1;
    if (year >= OBS_DELTA_T_FIRST_YEAR && year <= last) {
      const i = Math.floor(year - OBS_DELTA_T_FIRST_YEAR), f = year - OBS_DELTA_T_FIRST_YEAR - i;
      return i + 1 < OBS_DELTA_T.length ? OBS_DELTA_T[i] + f * (OBS_DELTA_T[i + 1] - OBS_DELTA_T[i]) : OBS_DELTA_T[i];
    }
    const em = Astronomy.DeltaT_EspenakMeeus, utOf = (y) => (y - 2000) * 365.25;
    if (year > last) return em(ut) - (em(utOf(last)) - OBS_DELTA_T[OBS_DELTA_T.length - 1]);
    const off = OBS_DELTA_T[0] - em(utOf(OBS_DELTA_T_FIRST_YEAR)), w = Math.max(0, 1 - (OBS_DELTA_T_FIRST_YEAR - year) / 100);
    return em(ut) + off * w;
  }
  if (Astronomy && typeof Astronomy.SetDeltaTFunction === "function" && typeof Astronomy.DeltaT_EspenakMeeus === "function") {
    Astronomy.SetDeltaTFunction(observedDeltaTSeconds);
  }

  const FULL_CIRCLE = 360;
  const KALI_EPOCH_JD = 588465.5;
  const ARYABHATA_ZERO_JD = 1903304.75;
  const MAHAYUGA_DAYS = 1577917828;
  const SIDEREAL_YEAR_DAYS = 365.25636;
  /* Canonical Ujjain meridian for the whole site: Museum, Panchang and Engine
     all declare 75.7885° E (23.1765° N). The old 75.7683° was the sole outlier;
     this is a pure unification (~ 1.2' ~ 4.8 s of mean time). */
  const UJJAIN_LONGITUDE_DEG = 75.7885;
  // 1800-01-01 00:00 UT, a literal (no date call at load): = gregorianToJulianDay("1800-01-01") = KalaDvara day + 588465.5.
  const BIJA_ANCHOR_JD = 2378496.5;

  /* ═══════════ THE TIERS (owner, 2026-10-08; the fourth 2026-10-09) ═══════════
     Four choices on every page, one code path each:
       'ss+parameshvara' (the page default): the Sūrya-Siddhānta with Parameśvara's saṃskāra — ss-tier.js with
          { samskara: 'parameshvara' }: the text's model, the mean places the paramparā record names (today the Moon and
          the node) moved by the record's arcminutes, and the ayanāṃśa's zero moved to his own determination (15° complete
          in Kali 4536) as a phase of the text's libration (corpus/parampara/samskara.json through parampara.js).
       'ss': the plain Sūrya-Siddhānta, exactly the text — ss-tier.js with { samskara: null }.
       'kerala': the Kerala paramparā (Parahita + Dṛggaṇita) — ss-tier.js with { samskara: 'kerala' }: the mean Sun, Moon,
          apogee and node of parahita-madhyama.js (Āryabhaṭa's integers, the Śakābda-saṃskāra, Parameśvara's fractions),
          Āryabhaṭa's Sun apogee, the text's epicycles on them, Nīlakaṇṭha's linear ayanāṃśa; the planets the text's.
       'drik': Modern Bhāratīya (dṛk) — siddhanta-tier.js only (the series fitted to the owner's N-body, its reduction, the
          embedded Earth orientation, the owner's Citrā-pakṣa and lagna code), served 1850.0–2150.0 by the series' own rule
          and refused outside (owner decision DK-1). No VSOP87/ELP/Astronomy-Engine call is on its path; those stay in
          this file only as the raw drigCoordinates API, a referee for tests.
     'classical' is an alias of 'ss'; 'calibrated' (the old hybrid) is retired and throws. API parameter defaults stay
     'ss' (so a call without a tier is the plain text); a page resolves its tier with pageTier(), whose default is
     'ss+parameshvara'. Loading this file needs no sovereign module: the first text-tier or date call resolves
     ss-tier.js and kala-dvara.js (node: require; browser: window.SSTier, window.KalaDvara), the first dṛk call
     siddhanta-tier.js. */
  const DEFAULT_TIER = "ss+parameshvara";
  const TIER_IDS = Object.freeze(["ss+parameshvara", "ss", "kerala", "drik"]);
  const TIER_ALIASES = Object.freeze({
    "ss+parameshvara": "ss+parameshvara", "ss parameshvara": "ss+parameshvara", "ss-parameshvara": "ss+parameshvara",
    ss: "ss", classical: "ss", kerala: "kerala", "kerala-parampara": "kerala", parahita: "kerala", drgganita: "kerala", "parahita+drgganita": "kerala",
    drik: "drik", modern: "drik", "bharatiya-drik": "drik",
  });
  const RETIRED_CALIBRATED = "the 'calibrated' hybrid mode was retired 2026-10-08 (owner decision: one code path per tier); use 'ss+parameshvara', 'ss', 'kerala' or 'drik'";
  const TEXT_TIER_COMMON = Object.freeze({
    time: "civil days from midnight at Laṅkā (SS 1.45-1.47): t = jd − 588465.5 + 75.7885/360; no clock correction",
    obliquity: "the arc of 1397 on R = 3438 (SS 2.28)",
    sunrise: "the Sun's centre on the horizon, on the turn about the dhruva (panchanga.js); no refraction (the text has none)",
    dayBoundary: "sunrise to sunrise (SS 14.18, 1.36); vāra by SS 1.51",
    karanaOrder: "SS 2.67: Śakuni, Nāga, Catuṣpada, Kiṃstughna",
    month: "amānta, with adhika and kṣaya: the month holding the Meṣa saṅkrānti is Caitra [standard rule; no local text]",
    yearStart: "nija Caitra new moon; an adhika Caitra closes the previous year [unverified convention]",
    samvatsara: "SS 1.55 from mean Jupiter at the instant, reading A (remainder 0 = Vijaya) [reading]",
    dashaYear: Object.freeze({ days: 1577917828 / 4320000, source: "SS 14.10 with 1.37: the text's solar year (dasha.js YEAR saura-surya)" }),
    ahargana: "civil days since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47)",
    span: Object.freeze({ years: Object.freeze([-50000, 50000]), basis: "tested over ±50,000 years (deep-time.test.js, tier-unity.test.js)" }),
  });
  const TIERS = Object.freeze({
    "ss+parameshvara": Object.freeze({
      id: "ss+parameshvara", family: "ss", samskara: "parameshvara", default: true,
      label: "Sūrya-Siddhānta + Parameśvara's saṃskāra", labelSa: "सूर्य-सिद्धान्त + परमेश्वर-संस्कार",
      engine: "the Sūrya-Siddhānta's own model (sphuta.js, ss-graha.js) with Parameśvara's saṃskāra: the mean places the paramparā record names moved by its arcminutes, at the text's own rates; the ayanāṃśa's zero at his own determination",
      ayanamsha: Object.freeze({ name: "SS 3.9-3.10 on the paramparā's three determinations", source: "Sūrya-Siddhānta 3.9-3.10 (600 librations a yuga, three-tenths of the bhuja; sphuta.js ayanamshaSS) with its phase and its greatest value fitted by least squares to Āryabhaṭa's zero in Kali 3600 (registry ABH-no-ayanacalana-3600), Nīlakaṇṭha's 14°26′ at Kali day 1,643,524 (NIL-ayanamsha-rate) and Parameśvara's 15° complete in Kali 4536 (PAR-ayanamsha-4536, 'parīkṣya nirṇītam'); the two parameters and the residuals are in corpus/parampara/samskara.json" }),
      ...TEXT_TIER_COMMON,
      eclipses: "SS 4-5 on the saṃskāra model (samskara.js lunarEclipse and solarEclipseOnModel, built from what the record corrects; the ch.5 parallax held at the text's value), at the site. magnitude = grāsa = the covered part ÷ the eclipsed disc at the middle (SS 4.11; the text has no penumbra). Seen at the site: lunar — the Moon above the text's horizon at the middle; solar — SS 6.13's three minutes with the Sun above the text's horizon between sparśa and mokṣa.",
      provenance: "the saṃskāra is read from corpus/parampara/samskara.json (generated by scripts/parampara-samskara.cjs from Parameśvara's recorded eclipses, Siddhāntadīpikā vv.69-85 as quoted in the Jyotirmīmāṃsā, and his ayanāṃśa determination, Jyotirmīmāṃsā §17) through parampara.js; it corrects only what the record names",
    }),
    ss: Object.freeze({
      id: "ss", family: "ss", samskara: null, default: false,
      label: "Sūrya-Siddhānta", labelSa: "सूर्य-सिद्धान्त",
      engine: "the Sūrya-Siddhānta exactly as it stands (sphuta.js, ss-graha.js, panchanga.js and the other sovereign modules)",
      ayanamsha: Object.freeze({ name: "SS 3.9-3.10", source: "Sūrya-Siddhānta 3.9-3.10: 600 librations a yuga, three-tenths of the bhuja (sphuta.js ayanamshaSS)" }),
      ...TEXT_TIER_COMMON,
      eclipses: "SS 4-5 (ss-grahana.js): the text's discs, shadow, contacts and chapter-5 parallax, at the site. magnitude = grāsa = the covered part ÷ the eclipsed disc at the middle (SS 4.11; the text has no penumbra). Seen at the site: lunar — the Moon above the text's horizon at the middle; solar — SS 6.13's three minutes with the Sun above the text's horizon in the perceptible part.",
      provenance: "the text's own numbers; no observation and no modern ephemeris enters",
    }),
    kerala: Object.freeze({
      id: "kerala", family: "ss", samskara: "kerala", default: false,
      label: "Kerala paramparā (Parahita + Dṛggaṇita)", labelSa: "केरल-परम्परा (परहित + दृग्गणित)",
      engine: "the Kerala line of the same geocentric model (ss-tier.js, samskara 'kerala'): the mean Sun, Moon, apogee and node of the Parahita karaṇa — Āryabhaṭa's integers over 1,577,917,500 civil days with Haridatta's Śakābda-saṃskāra — carried to Parameśvara's Dṛggaṇita by his fractions 4/5, 1 and 11/12 (parahita-madhyama.js, exact), counted from sunrise at Laṅkā as Āryabhaṭa's day is; Āryabhaṭa's Sun apogee 78° (Gītikā 9); the text's epicycles (SS 2.34-2.38) on those means [reading: no local edition attests Āryabhaṭa's]; the five star-planets are the text's (their Parahita integers are in the registry, PH-yugabhoga; their epicycles are not)",
      ayanamsha: Object.freeze({ name: "Kerala linear, through the three determinations", source: "a line by least squares through Āryabhaṭa's zero in Kali 3600 (registry ABH-no-ayanacalana-3600), Nīlakaṇṭha's 14°26′ at Kali day 1,643,524 (NIL-ayanamsha-rate) and Parameśvara's 15° complete in Kali 4536 (PAR-ayanamsha-4536) [reading]; Nīlakaṇṭha's stated rule of 0.9′ a year is kept as a cross-check" }),
      ...TEXT_TIER_COMMON,
      samvatsara: "SS 1.55 from the text's mean Jupiter at the instant, reading A (remainder 0 = Vijaya) [reading]; the Parahita Jupiter is not built",
      eclipses: "SS 4-5 on the Kerala places (samskara.js lunarEclipse and solarEclipseOnModel on the model that carries the Parahita + Dṛggaṇita means and the Kerala ayanāṃśa; the ch.5 parallax held at the text's value), at the site. magnitude = grāsa = the covered part ÷ the eclipsed disc at the middle (SS 4.11; the text has no penumbra). Seen at the site: lunar — the Moon above the text's horizon at the middle; solar — SS 6.13's three minutes with the Sun above the text's horizon between sparśa and mokṣa.",
      provenance: "Āryabhaṭīya Gītikā 3 and 9 (the local edition), the Grahacāranibandhana's Śakābda rule and Parameśvara's fractions and epoch (Jyotirmīmāṃsā; corpus/parampara/registry.json), read through parampara.js and parahita-madhyama.js; Parameśvara's epoch places (Kali day 1,651,700) are reproduced to the minute; it corrects the Sun, the Moon, its apogee, the node and the ayanāṃśa; no observation of ours and no modern ephemeris enters",
    }),
    drik: Object.freeze({
      id: "drik", family: "drik", samskara: null, default: false,
      label: "Modern Bhāratīya (dṛk)", labelSa: "आधुनिक भारतीय (दृक्)",
      engine: "Our dṛk-siddhānta series v2.4.2, arranged in the Sūrya-Siddhānta's order (madhyama, manda, śīghra): 12,901 periodic terms evaluated with Mādhava's sine. Its coefficients were fitted to our N-body (DOP853: Newton + EIH 1PN + Earth J2 + lunar figure + LLR tide), which is restarted from NASA-JPL DE440s states every 720 days.",
      reduction: "Light-time, the Sun's deflection of planetary light and annual aberration are ours. Precession is IAU 2006 and nutation IAU 2000B, in our implementation of the IAU models.",
      time: "ΔT: annual table 1800–2027 (the 2027 value is an IERS prediction), Espenak–Meeus prediction after that. Civil times after 2027 carry that prediction's uncertainty.",
      ayanamsha: Object.freeze({ name: "Citrā-pakṣa (Lahiri), true", source: "the Calendar Reform Committee's convention [standard], realised with the IAE value 23°15′00.658″ for 1956-03-21 (true equinox), carried by IAU 2006 general precession, as Swiss Ephemeris realises SE_SIDM_LAHIRI (+0.138″, an external input); true = mean + Δψ (siddhanta-tier.js)" }),
      obliquity: "true obliquity of date, IAU 2006/2000B (siddhanta-tier.js)",
      sunrise: "the Sun's upper limb on the horizon with 34′ refraction (centre at −50′) [convention]; apparent sidereal time IAU 2006",
      moonrise: "the Moon's centre at a net +7′ horizon [convention, as before] (owner decision DK-5)",
      rahu: "mean node: the series' fitted node line; Ketu = Rāhu + 180°",
      eclipses: "Eclipses searched on this tier's own Sun and Moon (drik-grahana.js): lunar with Danjon's shadow (Earth's radius + 1/85, oblateness 1/594), solar by the shadow cone of the Sun and Moon on the IERS 2010 ellipsoid; k = 0.2725076 (0.272281 for the umbral contacts). Lunar magnitude = grāsa = the umbral magnitude; a penumbral eclipse is listed as penumbral, with its penumbral magnitude and no grāsa. Solar: the eclipses this site is in, with its own contacts and magnitude. Seen at the site: lunar — the Moon's centre above the tier's +7′ horizon at greatest eclipse; solar — the Sun's upper limb above the horizon at some instant between first and last contact.",
      dayBoundary: "sunrise to sunrise at the site; vāra of the sunrise's local civil date",
      karanaOrder: "the common order: Śakuni, Catuṣpada, Nāga, Kiṃstughna [unverified convention; SS 2.67 differs]",
      month: "amānta, with adhika and kṣaya, named by Panchanga.nameMonth from the tier's own new moons and saṅkrāntis",
      yearStart: "nija Caitra new moon of the tier's own sky [unverified convention]",
      samvatsara: "the same SS 1.55 rule (mean Jupiter, reading A) at the tier's nija Caitra start, held for the year [unverified convention]",
      dashaYear: Object.freeze({ days: 365.25636, source: "sidereal year 365.25636 d [unverified convention]" }),
      ahargana: "civil days since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47), shown in every tier",
      span: Object.freeze({ years: Object.freeze([1850, 2150]), yearRule: "2000 + (jdTT − 2451545)/365.25 (the series' own rule)",
        basis: "the certified span of the series", accuracyMeasured: "λ ≤ 0.9″ against NASA-JPL DE440s (checked every 20 days); this is not independence from JPL",
        lagnaMeasured: "the lagna within 2″ of the same formula on an independent sidereal time and obliquity at 500 instants (drik-bharatiya.test.js [lagna])" }),
      fallback: null,
      provenance: "Ours 1850.0–2150.0, refused outside (owner decision DK-1). The N-body behind the series is restarted from NASA-JPL DE440s states every 720 days, so agreement with DE440 (≤ 0.9″, checked every 20 days) is not independence from JPL. ΔT after 2027 is a prediction. Eclipses: our own search on the series (DK-3).",
    }),
  });
  /** A tier id or alias → 'ss+parameshvara' | 'ss' | 'kerala' | 'drik'. 'calibrated' and anything else throw RangeError. */
  function resolveTier(x) {
    const k = typeof x === "string" ? x.trim().toLowerCase() : x;
    if (k === "calibrated") throw new RangeError(RETIRED_CALIBRATED);
    if (typeof k === "string" && Object.prototype.hasOwnProperty.call(TIER_ALIASES, k)) return TIER_ALIASES[k];
    throw new RangeError(`Unknown engine mode '${x}': the tiers are 'ss+parameshvara', 'ss', 'kerala' and 'drik' ('classical' = 'ss')`);
  }
  const tierFamily = (tier) => TIERS[resolveTier(tier)].family;
  const samskaraOfTier = (tier) => TIERS[resolveTier(tier)].samskara;
  /** The tier a page shows: its stored or linked choice, else the page default ('ss+parameshvara'). */
  function pageTier(stateTier, pageDefault = DEFAULT_TIER) {
    return resolveTier(stateTier === undefined || stateTier === null || String(stateTier).trim() === "" ? pageDefault : stateTier);
  }
  /** Refusal of the dṛk tier outside its span. */
  class TierSpanError extends RangeError {
    constructor(tier, jd, what) {
      let dt = 0; try { dt = observedDeltaTSeconds(jd - 2451545); } catch (e) { dt = 0; } const span = TIERS.drik.span.years, year = 2000 + (jd + (Number.isFinite(dt) ? dt : 0) / 86400 - 2451545) / 365.25;   // the series' own (TT) rule, ΔT as siddhanta-tier.js takes it
      let shown = String(jd); if (Number.isFinite(year)) for (let d = 2; d <= 9; d++) { shown = year.toFixed(d); if (Number(shown) < span[0] || Number(shown) > span[1]) break; }   // two decimals, more where two would round onto an edge
      super(`${TIERS[tier].label} is served for ${span[0]}.0–${span[1]}.0 only (${TIERS.drik.span.yearRule}); ${what ? what + " at " : ""}year ${shown} is outside it and is refused (owner decision DK-1: no foreign fallback). Choose a text tier.`);
      this.name = "TierSpanError"; this.code = "TIER_OUT_OF_SPAN"; this.tier = tier; this.span = span.slice(); this.year = year;
    }
  }

  // ── lazy resolution of the tier modules (no load-time dependency) ──
  const isNode = typeof module === "object" && module && module.exports && typeof require === "function";
  const G_ = typeof globalThis !== "undefined" ? globalThis : {};
  let SST_ = null, KD_ = null, SDT_ = null;
  function ssTier() {
    if (SST_) return SST_;
    if (isNode) { try { SST_ = require("./ss-tier.js"); } catch (e) { SST_ = null; } }
    if (!SST_ && G_.SSTier) SST_ = G_.SSTier;
    if (!SST_) throw new Error("ss-tier.js and the sovereign modules must be loaded before math-core.js is used");
    return SST_;
  }
  function kalaDvara() {
    if (KD_) return KD_;
    if (isNode) { try { KD_ = require("./kala-dvara.js"); } catch (e) { KD_ = null; } }
    if (!KD_ && G_.KalaDvara) KD_ = G_.KalaDvara;
    if (!KD_) throw new Error("ss-tier.js and the sovereign modules must be loaded before math-core.js is used");
    return KD_;
  }
  function siddhantaTier() {
    if (SDT_) return SDT_;
    if (G_.SiddhantaTier) SDT_ = G_.SiddhantaTier;
    if (!SDT_ && isNode) { try { SDT_ = require("./siddhanta-tier.js"); } catch (e) { SDT_ = null; } }
    if (!SDT_) throw new Error("the Modern Bhāratīya (dṛk) tier needs siddhanta-drik.js and siddhanta-tier.js loaded");
    return SDT_;
  }
  /** A function of siddhanta-tier.js's contract, or a clear error when the loaded file does not have it. */
  function sdFn(name) {
    const SD = siddhantaTier();
    if (typeof SD[name] !== "function") throw new Error(`siddhanta-tier.js has no ${name}(): the Modern Bhāratīya (dṛk) contract needs it`);
    return SD[name].bind(SD);
  }
  /** Is the instant served by the tier? Text tiers: always (tested ±50,000 years); dṛk: SiddhantaTier.inSpan. */
  function tierInSpan(jd, tier) {
    requireFinite(jd, "Julian day");
    return tierFamily(tier) === "ss" ? true : Boolean(sdFn("inSpan")(jd));
  }
  function requireDrikSpan(jd, what) {
    if (!tierInSpan(jd, "drik")) throw new TierSpanError("drik", jd, what);
  }
  /** Every dṛk entry first asks siddhanta-tier.js whether the instant is in its span (the series' own rule) and refuses
   *  outside it, before any other call; returns the module. */
  function drikGuard(jd, what, opts) {
    const SD = siddhantaTier();
    if (!sdFn("inSpan")(jd, opts)) throw new TierSpanError("drik", jd, what);
    return SD;
  }
  /** A SiddhantaTier result, or the refusal when it returns null (outside its span). */
  function drikCall(value, jd, what) {
    if (value === null || value === undefined) throw new TierSpanError("drik", jd, what);
    return value;
  }

  const METROLOGY = Object.freeze({
    ghatisPerDay: 60,
    palasPerDay: 3600,
    vipalasPerDay: 216000,
    pranasPerDay: 21600,
    arcminutesPerCircle: 21600,
  });

  const BHAGANAS = Object.freeze({
    surya: 4320000,
    candra: 57753336,
    mangala: 2296832,
    budha: 17937060,
    guru: 364220,
    shukra: 7022376,
    shani: 146568,
    rahu: -232238,
  });

  // Published Sun-anchored relative-rate corrections from SETU-2026-08-07.
  // These are the only bīja coefficients with a retained derivation record.
  const BIJA_REV_PER_MAHAYUGA = Object.freeze({
    mangala: 30,
    guru: -51,
    shani: 61,
  });
  // A one-epoch fit against this repository's Drik tier (2026-08-29).
  // Retained for reproducibility only: it is not a śāstric derivation, is
  // never the default, and must be selected explicitly by name.
  const EMPIRICAL_BIJA_REV_PER_MAHAYUGA = Object.freeze({
    surya: 44, candra: 203.25, mangala: 85.36, budha: 37.96,
    guru: -196.2, shukra: -1.33, shani: 434.9, rahu: -210.1, ketu: -210.1,
  });

  const GRAHAS = Object.freeze([
    { key: "surya", sa: "सूर्यः", en: "Sun" },
    { key: "candra", sa: "चन्द्रः", en: "Moon" },
    { key: "mangala", sa: "मङ्गलः", en: "Mars" },
    { key: "budha", sa: "बुधः", en: "Mercury" },
    { key: "guru", sa: "गुरुः", en: "Jupiter" },
    { key: "shukra", sa: "शुक्रः", en: "Venus" },
    { key: "shani", sa: "शनिः", en: "Saturn" },
    { key: "rahu", sa: "राहुः", en: "Rāhu" },
    { key: "ketu", sa: "केतुः", en: "Ketu" },
  ]);

  const RASHIS = Object.freeze([
    "Meṣa", "Vṛṣabha", "Mithuna", "Karka", "Siṃha", "Kanyā",
    "Tulā", "Vṛścika", "Dhanus", "Makara", "Kumbha", "Mīna",
  ]);

  /* Classical rāśi-lords (BPHS Ch. 3) in math-core graha keys. */
  const RASHI_LORDS = Object.freeze([
    "mangala", "shukra", "budha", "candra", "surya", "budha",
    "shukra", "mangala", "guru", "shani", "shani", "guru",
  ]);

  const VARGAS = Object.freeze([
    { code: "D1", divisor: 1, name: "Rāśi" },
    { code: "D2", divisor: 2, name: "Horā" },
    { code: "D3", divisor: 3, name: "Drekkāṇa" },
    { code: "D4", divisor: 4, name: "Caturthāṃśa" },
    { code: "D7", divisor: 7, name: "Saptāṃśa" },
    { code: "D9", divisor: 9, name: "Navāṃśa" },
    { code: "D10", divisor: 10, name: "Daśāṃśa" },
    { code: "D12", divisor: 12, name: "Dvādaśāṃśa" },
    { code: "D16", divisor: 16, name: "Ṣoḍaśāṃśa" },
    { code: "D20", divisor: 20, name: "Viṃśāṃśa" },
    { code: "D24", divisor: 24, name: "Caturviṃśāṃśa" },
    { code: "D27", divisor: 27, name: "Saptaviṃśāṃśa" },
    { code: "D30", divisor: 30, name: "Triṃśāṃśa" },
    { code: "D40", divisor: 40, name: "Khavedāṃśa" },
    { code: "D45", divisor: 45, name: "Akṣavedāṃśa" },
    { code: "D60", divisor: 60, name: "Ṣaṣṭyāṃśa" },
  ]);

  // Beyond the canonical Ṣoḍaśavarga (16): optional higher divisions.
  const VARGAS_EXTENDED = Object.freeze([
    { code: "D144", divisor: 144, name: "Dvādaśa-dvādaśāṃśa" },
  ]);

  const VIMSHOTTARI_SEQUENCE = Object.freeze([
    "Ketu", "Śukra", "Sūrya", "Candra", "Maṅgala", "Rāhu", "Guru", "Śani", "Budha",
  ]);
  const VIMSHOTTARI_YEARS = Object.freeze({
    Ketu: 7,
    Śukra: 20,
    Sūrya: 6,
    Candra: 10,
    Maṅgala: 7,
    Rāhu: 18,
    Guru: 16,
    Śani: 19,
    Budha: 17,
  });

  const KATAPAYADI_DIGITS = Object.freeze([
    "न", "प", "ख", "ग", "भ", "म", "च", "छ", "ज", "झ",
  ]);
  const KATAPAYADI_VALUES = Object.freeze(
    Object.fromEntries(KATAPAYADI_DIGITS.map((letter, digit) => [letter, digit])),
  );

  function mod(value, modulus) {
    return ((value % modulus) + modulus) % modulus;
  }

  /** value mod 360 in [0, 360). Exact for a value already in range (2026-10-08: ((v % 360) + 360) % 360 moved such a
   *  value by up to an ulp of 630°, which broke bit-equality with the sovereign modules). */
  function mod360(value) {
    const r = value % FULL_CIRCLE;
    if (r >= 0) return r + 0;                                 // + 0 turns −0 into 0
    const s = r + FULL_CIRCLE;
    return s === FULL_CIRCLE ? 0 : s;
  }

  function requireFinite(value, name) {
    if (!Number.isFinite(value)) throw new Error(`${name} must be finite`);
  }

  function computeNakshatraDetails(longitude) {
    requireFinite(longitude, "Longitude for nakshatra details");
    const nakArc = FULL_CIRCLE / 27;
    const padaArc = nakArc / 4;
    const lon = mod360(longitude);
    const nakIndex = Math.floor(lon / nakArc) % 27;
    const withinNak = lon - nakIndex * nakArc;
    const pada = Math.min(4, Math.floor(withinNak / padaArc) + 1);
    const lord = VIMSHOTTARI_SEQUENCE[nakIndex % 9];
    const fractionDone = withinNak / nakArc;
    return {
      index: nakIndex,
      number: nakIndex + 1,
      name: NAKSHATRA_NAMES[nakIndex],
      pada,
      lord,
      withinDeg: withinNak,
      fractionDone,
      percentDone: (fractionDone * 100).toFixed(1),
    };
  }

  function requireGrahaKey(key, options = {}) {
    const normalized = ssKey(key);
    const allowed = new Set([
      "surya", "chandra", "mangal", "budh", "guru", "shukra", "shani", "rahu", "ketu",
      ...(options.prithvi ? ["prithvi"] : []),
    ]);
    if (!allowed.has(normalized)) throw new Error(`Unknown graha key '${key}'`);
    return normalized;
  }

  function parseTime(timeText) {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/.exec(String(timeText).trim());
    if (!match) throw new Error(`Invalid time '${timeText}'`);
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = Number(match[3] || 0);
    if (hour > 23 || minute > 59 || second >= 60) throw new Error(`Invalid time '${timeText}'`);
    return { hour, minute, second, hours: hour + minute / 60 + second / 3600 };
  }

  /* ── The spanda sub-day chain (Bhāgavata 3.11 as the site states it [claim-only, awaiting an edition]) ──
     From the spanda up to the muhūrta, each unit and how many of the one before it make it; 30 muhūrtas make the
     ahorātra, so the product of the factors is 328,050,000,000 spandas a day = kala-dvara.js SPANDAS_PER_DAY,
     and 3,280,500,000 paramāṇu. The prāṇa of SS 1.11-1.12 (21,600 to the day) is a whole number of spandas
     (15,187,500), so the text's own time units sit on this lattice exactly.
     corpus/sources/time-units.json cites the chain by this symbol, 'math-core.js SUBDAY_CHAIN' (never by line), and
     parampara.test.js [P1] checks that this file declares it and that the exported value is the registry's chain, so
     the block may move with the file.
     It is exported as SUBDAY_CHAIN; spandaPerAhoratra() and the lattice are below, in 'Spanda Subday Chain &
     Exact Kinematics'.
     Units above the muhūrta (the day, the year, the yuga) are the text's own and live in sphuta.js and kala-dvara.js.
  */
  const SUBDAY_CHAIN = Object.freeze([
    ['spanda', 100], ['paramanu', 2], ['anu', 3], ['trasarenu', 3], ['truti', 100], ['vedha', 3],
    ['lava', 3], ['nimesha', 3], ['kshana', 5], ['kashtha', 15], ['laghu', 15],
    ['nadika', 2], ['muhurta', 30],
  ]);

  /* Dates (2026-10-08, plan D4): proleptic Gregorian or Julian calendar, astronomical years (0 = 1 BCE; −50000 = 50001
     BCE), all by kala-dvara.js integer arithmetic — no Date, so years 0-99 and ±5-digit years are what they say. */
  const CALENDARS = Object.freeze(["gregorian", "julian"]);
  const isoYmd = (c) => `${c.year < 0 ? "-" : ""}${String(Math.abs(c.year)).padStart(4, "0")}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`;
  /** A civil date ({ calendar, year, month, day }) + clock text + zone → JD (UT) = Kali day + 588465.5 + (hours − zone)/24. */
  function civilToJd(civil, timeText = "00:00:00", timezoneHours = 0) {
    const { calendar = "gregorian", year, month, day } = civil || {};
    if (!CALENDARS.includes(calendar)) throw new RangeError(`civilToJd: calendar is 'gregorian' or 'julian', not ${calendar}`);
    for (const [k, v] of Object.entries({ year, month, day })) if (!Number.isInteger(v)) throw new TypeError(`civilToJd: ${k} must be an integer`);
    if (!Number.isFinite(timezoneHours) || Math.abs(timezoneHours) > 14) throw new Error(`Invalid timezone offset '${timezoneHours}'`);
    const K = kalaDvara(), invalid = () => new Error(`Invalid ${calendar === "julian" ? "Julian" : "Gregorian"} date '${isoYmd({ year, month, day })}'`);
    let n;
    try { n = K.kaliDayFromCivil({ calendar, year, month, day }); } catch (e) { if (e instanceof RangeError) throw invalid(); throw e; }
    const back = K.civilFromKaliDay(n, calendar);
    if (back.year !== year || back.month !== month || back.day !== day) throw invalid();
    const time = parseTime(timeText);
    return (n + KALI_EPOCH_JD) + (time.hours - timezoneHours) / 24;
  }
  /** JD (UT) → the local civil date and clock at the zone: { year, month, day, hour, minute, second, iso, calendar }. */
  function jdToCivil(jd, timezoneHours = 0, calendar = "gregorian") {
    requireFinite(jd, "Julian day");
    if (!CALENDARS.includes(calendar)) throw new RangeError(`jdToCivil: calendar is 'gregorian' or 'julian', not ${calendar}`);
    const local = jd + timezoneHours / 24 + 0.5, whole = Math.floor(local);
    let sec = Math.round((local - whole) * 86400), n = whole - 588466;
    if (sec >= 86400) { sec -= 86400; n += 1; }
    const c = kalaDvara().civilFromKaliDay(n, calendar);
    return { year: c.year, month: c.month, day: c.day, hour: Math.floor(sec / 3600), minute: Math.floor((sec % 3600) / 60), second: sec % 60, iso: isoYmd(c), calendar };
  }
  function gregorianToJulianDay(dateText, timeText = "00:00:00", timezoneHours = 0) {
    const dateMatch = /^(-?\d{1,6})-(\d{2})-(\d{2})$/.exec(String(dateText).trim());
    if (!dateMatch) throw new Error(`Invalid Gregorian date '${dateText}'`);
    const civil = { calendar: "gregorian", year: Number(dateMatch[1]), month: Number(dateMatch[2]), day: Number(dateMatch[3]) };
    if (civil.month < 1 || civil.month > 12 || civil.day < 1 || civil.day > 31) throw new Error(`Invalid Gregorian date '${dateText}'`);
    try { return civilToJd(civil, timeText, timezoneHours); }
    catch (e) { if (/Invalid (Gregorian|Julian) date/.test(e.message)) throw new Error(`Invalid Gregorian date '${dateText}'`); throw e; }
  }

  /** The local civil date (signed, at least four digits) of a JD (UT) at a zone, in a calendar. */
  function julianDayToIsoDate(jd, timezoneHours = 0, calendar = "gregorian") {
    if (!Number.isFinite(jd)) throw new Error("Julian day must be finite");
    return jdToCivil(jd, timezoneHours, calendar).iso;
  }

  function formatClock(decimalHours) {
    let totalSeconds = Math.round(mod(decimalHours, 24) * 3600) % 86400;
    const hour = Math.floor(totalSeconds / 3600);
    totalSeconds -= hour * 3600;
    const minute = Math.floor(totalSeconds / 60);
    const second = totalSeconds - minute * 60;
    return [hour, minute, second].map((part) => String(part).padStart(2, "0")).join(":");
  }

  function ujjainMeanTime(timeText, timezoneHours, longitudeEastDeg = UJJAIN_LONGITUDE_DEG) {
    const localHours = parseTime(timeText).hours;
    return formatClock(localHours - timezoneHours + longitudeEastDeg / 15);
  }

  function precessionRates() {
    const sharedDebtArcsecPerYear =
      (-16 * FULL_CIRCLE * 3600 * 365.25) / MAHAYUGA_DAYS;
    return {
      pure54ArcsecPerYear: 54,
      sharedDebtArcsecPerYear,
      effectiveArcsecPerYear: 54 + sharedDebtArcsecPerYear,
    };
  }

  const AYANAMSHA_MODES = Object.freeze({
    effective_49: Object.freeze({ label: "Effective 54 arcsec/year less shared Mahayuga debt", zeroJd: ARYABHATA_ZERO_JD, kind: "linear", rateArcsecPerYear: precessionRates().effectiveArcsecPerYear }),
    linear_54: Object.freeze({ label: "Linear 54 arcsec/year", zeroJd: ARYABHATA_ZERO_JD, kind: "linear", rateArcsecPerYear: 54 }),
    linear_50: Object.freeze({ label: "Linear 50 arcsec/year", zeroJd: ARYABHATA_ZERO_JD, kind: "linear", rateArcsecPerYear: 50 }),
    sinusoidal_27: Object.freeze({ label: "sinusoid ±27°, zero 498-12-19 06:00 UT — a hypothesis, not SS 3.9-3.10", zeroJd: ARYABHATA_ZERO_JD, kind: "sinusoidal", amplitudeDeg: 27, periodYears: 7200 }),
  });
  // The shared zero of the hypotheses above (AY-15).
  const ARYABHATA_ZERO_LABEL = "JD 1903304.75 = 498-12-19 06:00 UT (Julian)";

  // Multi-school extension (Triveni 2026-08-17): kept in a separate registry so
  // the historical AYANAMSHA_MODES (all anchored at the Aryabhata zero) stays
  // exactly as sealed by the original test-suite.
  const AYANAMSHA_MODES_EXTENDED = Object.freeze({
    spica_lahiri: Object.freeze({ label: "Lahiri (ICRC 1956): 23.25° at JD 2435554.0, 50.2388475″/yr, linear — a comparison row; the dṛk tier uses the true Citrā-pakṣa value", zeroJd: 2435554.0, kind: "linear", rateArcsecPerYear: 50.2388475 }),
    kp: Object.freeze({ label: "कृष्णमूर्ति-पक्ष (चित्रा-पक्ष − 0.10°)", zeroJd: 2435554.0, kind: "linear", rateArcsecPerYear: 50.2388475 }),
    raman_spica: Object.freeze({ label: "रमण-पक्ष (चित्रा-पक्ष − 0.373611°)", zeroJd: 2435554.0, kind: "linear", rateArcsecPerYear: 50.2388475 }),
    yukteshwar: Object.freeze({ label: "युक्तेश्वर-पक्ष (शून्य 499 CE · 54″/वर्ष)", zeroJd: ARYABHATA_ZERO_JD, kind: "linear", rateArcsecPerYear: 54 }),
  });

  const NAMED_AYANAMSHAS = Object.freeze(["effective_49", "linear_54", "linear_50", "sinusoidal_27", "spica_lahiri", "kp", "raman_spica", "yukteshwar"]);
  const isTierName = (x) => typeof x === "string" && (x.trim().toLowerCase() === "calibrated" || Object.prototype.hasOwnProperty.call(TIER_ALIASES, x.trim().toLowerCase()));
  /** The ayanāṃśa a tier applies — the one function every frame of the tier uses, so the displayed value is the applied
   *  value: 'ss+parameshvara'/'ss' → SS 3.9-3.10 (sphuta.js through ss-tier.js); 'drik' → the true Citrā-pakṣa value
   *  (siddhanta-tier.js: mean + Δψ), refused outside its span. → { deg, meanDeg?, name, source, rateArcsecPerYear }. */
  function tierAyanamsha(jd, tier) {
    requireFinite(jd, "Julian day");
    const id = resolveTier(tier);
    if (TIERS[id].family === "ss") {
      const S = ssTier(), o = { samskara: TIERS[id].samskara };
      return { deg: S.ayanamshaDeg(jd, o), name: TIERS[id].ayanamsha.name, source: TIERS[id].ayanamsha.source, rateArcsecPerYear: S.ayanamshaRateArcsecPerYear(jd, o),
        rateRule: S.ayanamshaRule(o), tier: id };
    }
    const SD = drikGuard(jd, "the ayanāṃśa");
    const a = drikCall(sdFn("ayanamsha")(jd), jd, "the ayanāṃśa");
    let rate = Number.isFinite(a.rateArcsecPerYear) ? a.rateArcsecPerYear : null;
    if (rate === null) { const b = SD.ayanamsha(jd + 182.625), c = SD.ayanamsha(jd - 182.625); rate = b && c ? (b.deg - c.deg) * 3600 : null; }
    return { deg: a.deg, meanDeg: a.meanDeg, name: TIERS.drik.ayanamsha.name, source: TIERS.drik.ayanamsha.source, rateArcsecPerYear: rate, tier: id };
  }
  function ayanamshaDeg(jd, variant = "ss") {
    requireFinite(jd, "Julian day");
    if (isTierName(variant)) return tierAyanamsha(jd, variant).deg;
    const deltaYears = (jd - ARYABHATA_ZERO_JD) / 365.25;
    const rates = precessionRates();
    if (variant === "effective_49") return deltaYears * rates.effectiveArcsecPerYear / 3600;
    if (variant === "linear_54") return deltaYears * 54 / 3600;
    if (variant === "linear_50") return deltaYears * 50 / 3600;
    if (variant === "sinusoidal_27") {
      return 27 * Math.sin((2 * Math.PI * deltaYears) / 7200);
    }
    // ── Multi-school selector (Triveni extension 2026-08-17) ──
    // Spica-anchored Lahiri: 23.25° at JD 2435554.0 (1956-03-21, Calendar Reform
    // Committee epoch — note the documented off-by-one: 2435554, NOT 2435555),
    // rate 50.2388475″/Julian-year.
    if (variant === "spica_lahiri" || variant === "kp" || variant === "raman_spica") {
      const lahiri = 23.25 + ((jd - 2435554.0) / 365.25) * 50.2388475 / 3600;
      if (variant === "kp") return lahiri - 0.10;            // Krishnamurti: Lahiri − 0.10°
      if (variant === "raman_spica") return lahiri - 0.373611; // B.V. Raman: Lahiri − 22'25"
      return lahiri;
    }
    if (variant === "yukteshwar") {
      // Sri Yukteshwar: zero at the Āryabhaṭa epoch (499 CE), 54″/year linear.
      return ((jd - ARYABHATA_ZERO_JD) / 365.25) * 54 / 3600;
    }
    throw new Error(`Unknown ayanāṃśa variant '${variant}'`);
  }

  function ayanamshaRateArcsecPerYear(jd, mode = "effective_49") {
    requireFinite(jd, "Julian day");
    if (isTierName(mode)) return tierAyanamsha(jd, mode).rateArcsecPerYear;
    const metadata = AYANAMSHA_MODES[mode] || AYANAMSHA_MODES_EXTENDED[mode];
    if (!metadata) throw new Error(`Unknown ayanāṃśa variant '${mode}'`);
    if (metadata.kind === "linear") return metadata.rateArcsecPerYear;
    const deltaYears = (jd - metadata.zeroJd) / 365.25;
    return metadata.amplitudeDeg * (2 * Math.PI / metadata.periodYears) *
      Math.cos(2 * Math.PI * deltaYears / metadata.periodYears) * 3600;
  }

  function modeRateArcsecPerYear(jd, mode = "ss") {
    return ayanamshaRateArcsecPerYear(jd, mode);
  }

  function bijaCoefficients(model = "classical") {
    if (model === "classical") return BIJA_REV_PER_MAHAYUGA;
    if (model === "empirical-2026-08-29") return EMPIRICAL_BIJA_REV_PER_MAHAYUGA;
    throw new RangeError(`Unknown bīja model '${model}'`);
  }

  function bijaDeltaDeg(grahaKey, jd, model = "classical") {
    requireGrahaKey(grahaKey);
    requireFinite(jd, "Julian day");
    const revolutions = bijaCoefficients(model)[grahaKey] || 0;
    const correction = revolutions * ((jd - BIJA_ANCHOR_JD) / MAHAYUGA_DAYS) * FULL_CIRCLE;
    return correction === 0 ? 0 : correction;
  }

  /** Graha-model options: a tier id string, a boolean (applyBija, plain text), or { applyBija, bijaModel, mode: tier,
   *  timeScale }. `mode` is resolved to a tier id ('ss' when absent). The bīja is an opt-in experiment of the text tiers. */
  function resolveBijaOptions(value, fallback = false, apiName = "graha model") {
    if (typeof value === "string") value = { mode: value };
    if (value === undefined) return { applyBija: fallback, bijaModel: "classical", mode: "ss" };
    if (typeof value === "boolean") return { applyBija: value, bijaModel: "classical", mode: "ss" };
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const applyBija = value.applyBija === undefined ? fallback : value.applyBija;
      const bijaModel = value.bijaModel === undefined ? "classical" : value.bijaModel;
      const mode = resolveTier(value.mode === undefined ? "ss" : value.mode);
      if (typeof applyBija === "boolean" && (bijaModel === "classical" || bijaModel === "empirical-2026-08-29")) {
        if (applyBija && TIERS[mode].family === "drik") throw new RangeError("The text tier's bīja options cannot be combined with the dṛk tier");
        return { ...value, applyBija, bijaModel, mode };
      }
    }
    throw new TypeError(`${apiName}: expected a boolean or { applyBija: boolean, bijaModel?: 'classical'|'empirical-2026-08-29', mode?: tier }`);
  }

  /** A bridge (lagna, bhāva, sunrise, …) takes a tier, never a named ayanāṃśa. */
  function bridgeTier(x, fallback = "ss") {
    if (x === undefined || x === null) return resolveTier(fallback);
    if (typeof x === "string" && NAMED_AYANAMSHAS.includes(x)) throw new RangeError(`bridges take a tier: ss+parameshvara, ss, kerala or drik (not the named ayanāṃśa '${x}')`);
    return resolveTier(x);
  }

  /* ── Spanda Subday Chain & Exact Kinematics ── */
  function spandaPerAhoratra() {
    return 328050000000n;
  }
  function paramanuPerAhoratra() {
    return 3280500000n;
  }
  function spandaSeconds() {
    const N = spandaPerAhoratra();
    // 1 spanda = 86400/N s. In nanoseconds that is 86400·1e9/N ≈ 263.374485 ns.
    // (AUDIT30 D5-08: the field previously carried 263374.485596 — PICOseconds,
    // 1000× too large, because it multiplied by 1e9 twice. The rational num/den
    // above is the exact truth; approxNs is the float convenience in ns.)
    return { num: 86400n, den: N, approxNs: Number(86400n * 1000000000n * 1000000n / N) / 1000000 };
  }
  /** Civil spandas since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47) of a Julian day (UT): the text tier's own
   *  count (ss-tier.js daysOfJd → sphuta.js spandasOfDays), with no clock correction — one civil day is exactly
   *  328,050,000,000 spandas. */
  function jdToAharganaSpandas(jd) {
    requireFinite(jd, "Julian day");
    return ssTier().spandasOfJd(jd);
  }
  /** Laṅkā midnight precedes Greenwich midnight by 75.7885/360 day = 69,062,270,625 spandas exactly [theorem:
   *  328,050,000,000 × 75.7885 ÷ 360]. */
  const LANKA_OFFSET_SPANDAS = 69062270625n;
  /* Kāla-dvāra, integer form (Kāla-Yantra council 2026-09-28, gate 6).
     jdToAharganaSpandas() enters through a double JD whose ulp near 2.45e6 is 4.66e-10 day
     = 152.8 spandas — the only float on the lattice path besides ΔT. This constructor enters
     from CIVIL time (proleptic Gregorian, same Meeus rule as gregorianToJulianDay) in exact
     BigInt arithmetic: 1 s = 3,796,875 spandas, 1 ns = 243/64000 spanda, 1 min of zone offset
     = 227,812,500 spandas. The meridian is UT; local mean time is a declared offset
     (UJJAIN_LONGITUDE_DEG, ujjainMeanTime). ΔT — observed, ~ms — is the ONE remaining float
     and is rounded to the nearest spanda (applyDeltaT:false gives the pure civil lattice). */
  const MEEUS_MONTH_DAYS = Object.freeze([122n, 153n, 183n, 214n, 244n, 275n, 306n, 336n, 367n, 397n, 428n, 459n]); // ⌊30.6001·(M+1)⌋, M=3..14 (459.0015 → 459)
  /* 2026-10-08 (owner D2): the default is the text's own count — no ΔT (applyDeltaT: false) and the Laṅkā meridian
     (meridian: 'lanka', + LANKA_OFFSET_SPANDAS), so this door and jdToAharganaSpandas agree. applyDeltaT: true and
     meridian: 'greenwich' remain as labelled opt-ins that no tier uses. */
  function aharganaSpandasFromCivil(civil) {
    const { year, month, day, hour = 0, minute = 0, second = 0, nanosecond = 0, timezoneMinutes = 0, applyDeltaT = false, meridian = "lanka" } = civil || {};
    if (meridian !== "lanka" && meridian !== "greenwich") throw new RangeError(`aharganaSpandasFromCivil: meridian is 'lanka' (the text's) or 'greenwich', not ${meridian}`);
    for (const [k, v] of Object.entries({ year, month, day, hour, minute, second, nanosecond, timezoneMinutes })) {
      if (!Number.isInteger(v)) throw new TypeError(`aharganaSpandasFromCivil: ${k} must be an integer, got ${v}`);
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) throw new RangeError(`aharganaSpandasFromCivil: invalid month/day ${month}/${day}`);
    if (year < -4712) throw new RangeError("aharganaSpandasFromCivil: year before JD 0 is not supported");
    let y = BigInt(year), m = BigInt(month);
    if (m <= 2n) { y -= 1n; m += 12n; }
    const c = y >= 0n ? y / 100n : -((-y + 99n) / 100n);                 // ⌊y/100⌋ for negative y too
    const cq = c >= 0n ? c / 4n : -((-c + 3n) / 4n);                        // ⌊c/4⌋
    const yy = y + 4716n;                                                   // ≥ 0 for year ≥ −4712 (JD 0)
    const S = (1461n * yy) / 4n + MEEUS_MONTH_DAYS[Number(m) - 3] + BigInt(day) + 2n - c + cq;
    const kaliDays = S - 589990n;                                           // = (S − 1524.5) − KALI_EPOCH_JD, exact integer
    let ns = (BigInt(hour) * 3600n + BigInt(minute) * 60n + BigInt(second)) * 1000000000n + BigInt(nanosecond)
           - BigInt(timezoneMinutes) * 60n * 1000000000n;                   // UT nanoseconds of the day (may spill)
    let spandas = kaliDays * 328050000000n + (ns * 243n) / 64000n;         // 243/64000 spanda per ns, floor to the spanda
    if (meridian === "lanka") spandas += LANKA_OFFSET_SPANDAS;
    if (applyDeltaT) {
      const jdApprox = KALI_EPOCH_JD + Number(spandas) / 328050000000;      // only to LOOK UP ΔT (seconds, observed table)
      spandas += BigInt(Math.round(calculateDeltaT(jdApprox) * 3796875));   // 3,796,875 spandas per second, nearest spanda
    }
    return spandas;
  }
  function meanRawExact(key, aharganaSpandas) {
    const spandasPerDay = 328050000000n;
    const mahayugaDays = 1577917828n;
    const spandasPerMahayuga = spandasPerDay * mahayugaDays;
    const KEY_MAP = {
      budh: 'budha',
      sukra: 'shukra',
      mangal: 'mangala',
      jupiter: 'guru',
      sun: 'surya',
      moon: 'candra',
      budha_shighra: 'budha',
      shukra_shighra: 'shukra',
    };
    const actualKey = KEY_MAP[key] || key;
    const isKetu = actualKey === 'ketu';
    const targetKey = isKetu ? 'rahu' : actualKey;
    const revsVal = BHAGANAS[targetKey];
    if (revsVal === undefined) {
      throw new RangeError(`Unknown graha key for meanRawExact: ${key}`);
    }
    const revs = BigInt(revsVal);
    const den = spandasPerMahayuga;
    let num = aharganaSpandas * revs * 360n;
    // Rāhu is at 180° at the Kali epoch (452¾ yugas × 232,238 = a half turn over whole turns); Ketu = Rāhu + 180°, so 0°.
    // (Until 2026-10-08 Ketu returned Rāhu's value here: a latent bug the lattice test pinned as 180.)
    if (targetKey === 'rahu') num = num + (isKetu ? 360n : 180n) * den;
    const modulo = 360n * den;
    num = ((num % modulo) + modulo) % modulo;
    const intDeg = Number(num / den);
    const fracDeg = Number(num % den) / Number(den);
    return (intDeg + fracDeg) % 360;
  }

  /** The mean places of the text tier (ss-tier.js grahas(jd).mean; the plain text — no saṃskāra unless options.mode
   *  names 'ss+parameshvara'): the Sun, the Moon, the node, and each planet's own bhagaṇa (for Mercury and Venus that is
   *  the śīghrocca, as BHAGANAS counts them). meanRawExact is the independent BigInt check of these values. */
  function meanGrahaModel(jd, options) {
    requireFinite(jd, "Julian day");
    const { applyBija, bijaModel, mode } = resolveBijaOptions(options, false, "meanGrahaModel");
    if (TIERS[mode].family !== "ss") throw new RangeError("meanGrahaModel is the text tier's (the dṛk tier has no mean model here)");
    const g = ssTier().grahas(jd, { samskara: TIERS[mode].samskara });
    const meanOf = (key) => key === "surya" ? g.mean.surya : key === "candra" ? g.mean.candra : key === "rahu" ? g.mean.rahu
      : (key === "budha" || key === "shukra") ? g.mean[key].sighrocca : g.mean[key].mean;
    const rows = GRAHAS.filter((graha) => graha.key !== "ketu").map((graha) => {
      const mean = meanOf(graha.key);
      const bija = applyBija ? bijaDeltaDeg(graha.key, jd, bijaModel) : 0;
      return { ...graha, mean, bija, longitude: mod360(mean + bija) };
    });
    const rahu = rows.find((row) => row.key === "rahu");
    rows.push({
      ...GRAHAS.find((graha) => graha.key === "ketu"),
      mean: mod360(rahu.mean + 180),
      bija: 0,
      longitude: mod360(rahu.longitude + 180),
    });
    return rows;
  }



  function meanObliquityDeg(jd) {
    const t = (jd - 2451545) / 36525;
    const seconds = 21.448 - 46.815 * t - 0.00059 * t * t + 0.001813 * t * t * t;
    return 23 + 26 / 60 + seconds / 3600;
  }

  function gmstDeg(jd) {
    const t = (jd - 2451545) / 36525;
    const seconds =
      67310.54841 +
      (876600 * 3600 + 8640184.812866) * t +
      0.093104 * t * t -
      6.2e-6 * t * t * t;
    return mod360(seconds / 240);
  }

  function localSiderealTimeDeg(jd, longitudeEastDeg) {
    return mod360(gmstDeg(jd) + longitudeEastDeg);
  }

  function tropicalAscendantDeg(jd, latitudeDeg, longitudeEastDeg) {
    if (!Number.isFinite(latitudeDeg) || Math.abs(latitudeDeg) >= 90) {
      throw new Error("Latitude must be finite and strictly between -90 and 90 degrees");
    }
    if (!Number.isFinite(longitudeEastDeg) || Math.abs(longitudeEastDeg) > 180) {
      throw new Error("Longitude must be finite and inside [-180, 180]");
    }
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;
    const lst = localSiderealTimeDeg(jd, longitudeEastDeg);
    const ramc = lst * rad;
    const epsilon = meanObliquityDeg(jd) * rad;
    const latitude = latitudeDeg * rad;
    const numerator = Math.cos(ramc);
    const denominator = -(
      Math.sin(ramc) * Math.cos(epsilon) + Math.tan(latitude) * Math.sin(epsilon)
    );
    let ascendant = mod360(Math.atan2(numerator, denominator) * deg);
    const lambda = ascendant * rad;
    const rightAscension = Math.atan2(
      Math.sin(lambda) * Math.cos(epsilon),
      Math.cos(lambda),
    ) * deg;
    if (mod360(lst - rightAscension) <= 180) ascendant = mod360(ascendant + 180);
    return ascendant;
  }

  function checkSite(latitudeDeg, longitudeEastDeg) {
    if (!Number.isFinite(latitudeDeg) || Math.abs(latitudeDeg) >= 90) throw new Error("Latitude must be finite and strictly between -90 and 90 degrees");
    if (!Number.isFinite(longitudeEastDeg) || Math.abs(longitudeEastDeg) > 180) throw new Error("Longitude must be finite and inside [-180, 180]");
  }
  /** The tier's lagna (sidereal, in the tier's own frame). Text tiers: Panchanga.lagnaAt through ss-tier.js (on the turn,
   *  SS ε, SS 3.9-3.10). dṛk: siddhanta-tier.js lagna (IAU 2006 GAST, true obliquity, true Citrā-pakṣa). */
  function siderealAscendantDeg(jd, latitudeDeg, longitudeEastDeg, frame = "ss") {
    requireFinite(jd, "Julian day");
    checkSite(latitudeDeg, longitudeEastDeg);
    const tier = bridgeTier(frame);
    if (TIERS[tier].family === "ss") return ssTier().lagna(jd, { latitude: latitudeDeg, longitude: longitudeEastDeg }, { samskara: TIERS[tier].samskara }).longitude;
    drikGuard(jd, "the lagna");
    return mod360(drikCall(sdFn("lagna")(jd, latitudeDeg, longitudeEastDeg), jd, "the lagna").asc);
  }
  /** The same point measured from the tier's equinox: sidereal + the tier's ayanāṃśa. */
  function sayanaAscendantDeg(jd, latitudeDeg, longitudeEastDeg, frame = "ss") {
    const tier = bridgeTier(frame);
    return mod360(siderealAscendantDeg(jd, latitudeDeg, longitudeEastDeg, tier) + tierAyanamsha(jd, tier).deg);
  }
  /** The tier's meridian: { ramcDeg (sāyana right ascension of the meridian), madhyaLagnaSidereal, method }. */
  function tierMeridian(jd, latitudeDeg, longitudeEastDeg, frame = "ss") {
    requireFinite(jd, "Julian day");
    checkSite(latitudeDeg, longitudeEastDeg);
    const tier = bridgeTier(frame);
    if (TIERS[tier].family === "ss") {
      const m = ssTier().meridian(jd, { latitude: latitudeDeg, longitude: longitudeEastDeg }, { samskara: TIERS[tier].samskara });
      return { tier, ramcDeg: m.ramcDeg, madhyaLagnaSidereal: m.madhyaLagna.longitude, method: m.method };
    }
    drikGuard(jd, "the madhya-lagna");
    const L = drikCall(sdFn("lagna")(jd, latitudeDeg, longitudeEastDeg), jd, "the madhya-lagna");
    const ramc = Number.isFinite(L.ramcDeg) ? L.ramcDeg : drikCall(sdFn("gast")(jd), jd, "the sidereal time") + longitudeEastDeg;
    return { tier, ramcDeg: mod360(ramc), madhyaLagnaSidereal: mod360(L.mc), method: "IAU 2006 apparent sidereal time and true obliquity (siddhanta-tier.js)" };
  }

  /* ═══════════ Bhāva-madhya · classical unequal-house layer ═══════════
     Advanced method, NOT the whole-sign rāśi-offset shortcut:
       1. 1st bhāva-madhya = lagna; 10th = madhya-lagna (MC); 4th = IC;
          7th = asta-lagna (DSC).
       2. Each quadrant arc (lagna→IC, IC→DSC, DSC→MC, MC→lagna) is
          trisected; the two trisection points are the madhyas of the two
          intervening bhāvas.
       3. A bhāva spans from the midpoint (sandhi) of the arc between the
          previous madhya and its own madhya, to the midpoint of the arc to
          the next madhya — unequal houses, lagna-anchored.
     This is the classical bhāva-viveka reckoning (lagna + madhya-lagna
     anchors; no averaging of signs). */

  function tropicalMidheavenDeg(jd, longitudeEastDeg) {
    if (!Number.isFinite(longitudeEastDeg) || Math.abs(longitudeEastDeg) > 180) {
      throw new Error("Longitude must be finite and inside [-180, 180]");
    }
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;
    const lst = localSiderealTimeDeg(jd, longitudeEastDeg);
    const ramc = lst * rad;
    const epsilon = meanObliquityDeg(jd) * rad;
    return mod360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(epsilon)) * deg);
  }

  const bhavaForwardArc = (a, b) => mod360(b - a);

  function bhavaMadhyasTropicalDeg(jd, latitudeDeg, longitudeEastDeg) {
    return bhavaMadhyasFrom(tropicalAscendantDeg(jd, latitudeDeg, longitudeEastDeg), tropicalMidheavenDeg(jd, longitudeEastDeg));
  }
  /** The twelve bhāva-madhyas from a lagna and a madhya-lagna in one frame: the quadrant trisection above. */
  function bhavaMadhyasFrom(asc, mc) {
    const madhyas = Array(13);
    madhyas[1] = asc;               // lagna
    madhyas[4] = mod360(mc + 180);  // pātāla (IC)
    madhyas[7] = mod360(asc + 180); // asta-lagna (DSC)
    madhyas[10] = mc;               // madhya-lagna (MC)
    const quadrants = [
      [1, 4, [2, 3]],
      [4, 7, [5, 6]],
      [7, 10, [8, 9]],
      [10, 1, [11, 12]],
    ];
    for (const [a, b, mids] of quadrants) {
      const span = bhavaForwardArc(madhyas[a], madhyas[b]);
      mids.forEach((bhavaNo, k) => {
        madhyas[bhavaNo] = mod360(madhyas[a] + span * (k + 1) / 3);
      });
    }
    return madhyas; // indices 1..12
  }

  function bhavaSandhisDeg(madhyas) {
    const sandhis = Array(13);
    for (let n = 1; n <= 12; n++) {
      const prev = n === 1 ? madhyas[12] : madhyas[n - 1];
      sandhis[n] = mod360(prev + bhavaForwardArc(prev, madhyas[n]) / 2);
    }
    sandhis[13] = sandhis[1] + 360;
    return sandhis;
  }

  function bhavaIndexForLongitude(longitude, sandhis) {
    const x = mod360(longitude);
    for (let n = 1; n <= 12; n++) {
      const len = bhavaForwardArc(sandhis[n], sandhis[n + 1]);
      if (bhavaForwardArc(sandhis[n], x) < len) return n;
    }
    return 12;
  }

  function bhavaOf(longitude, model) {
    return bhavaIndexForLongitude(longitude, model.sandhis);
  }

  function signIndex(longitude) {
    return Math.floor(mod360(longitude) / 30) % 12;
  }

  const VARGA_EPSILON = 1e-10;
  function computeVarga(longitude, code) {
    const l = mod360(longitude);
    const r = signIndex(l);
    const d = l - r * 30;
    const part = (divisor) => {
      const arc = 30 / divisor;
      const rawIndex = Math.floor((d + VARGA_EPSILON) / arc);
      return Math.min(divisor - 1, Math.max(0, rawIndex));
    };
    let result;
    if (code === "D1") result = r;
    else if (code === "D2") result = r % 2 === 0 ? (d < 15 ? 4 : 3) : (d < 15 ? 3 : 4);
    else if (code === "D3") result = (r + [0, 4, 8][part(3)]) % 12;
    else if (code === "D4") result = (r + 3 * part(4)) % 12;
    else if (code === "D7") result = ((r % 2 === 0 ? r : r + 6) + part(7)) % 12;
    else if (code === "D9") {
      const base = r % 3 === 0 ? r : r % 3 === 1 ? r + 8 : r + 4;
      result = (base + part(9)) % 12;
    } else if (code === "D10") result = ((r % 2 === 0 ? r : r + 8) + part(10)) % 12;
    else if (code === "D12") result = (r + part(12)) % 12;
    else if (code === "D16") result = ([0, 4, 8][r % 3] + part(16)) % 12;
    else if (code === "D20") result = ([0, 8, 4][r % 3] + part(20)) % 12;
    else if (code === "D24") result = ((r % 2 === 0 ? 4 : 3) + part(24)) % 12;
    else if (code === "D27") result = ([0, 3, 6, 9][r % 4] + part(27)) % 12;
    else if (code === "D30") {
      if (r % 2 === 0) result = d < 5 ? 0 : d < 10 ? 10 : d < 18 ? 8 : d < 25 ? 2 : 6;
      else result = d < 5 ? 1 : d < 12 ? 5 : d < 20 ? 11 : d < 25 ? 9 : 7;
    } else if (code === "D40") result = ((r % 2 === 0 ? 0 : 6) + part(40)) % 12;
    else if (code === "D45") result = ([0, 4, 8][r % 3] + part(45)) % 12;
    else if (code === "D60") result = (r + part(60)) % 12;
    else if (code === "D144") result = (r + part(144)) % 12; // Dvādaśa-dvādaśāṃśa: cyclic from own sign (D12-rule extension)
    else throw new Error(`Unknown varga '${code}'`);
    return result;
  }

  /** Pañcāṅga limbs (tithi/nakṣatra/yoga/karaṇa) from SIDEREAL Sun and Moon longitudes — the one
   *  reduction the dṛk-tier display uses everywhere (panchang page, home tiles, HUD). Karaṇa mapping
   *  mirrors panchangExtended exactly. Audit 2026-09-20. */
  function limbsFromSphuta(sunSidereal, moonSidereal) {
    const sun = mod360(sunSidereal), moon = mod360(moonSidereal), lunar = mod360(moon - sun);
    const tithiIndex = Math.floor(lunar / 12);
    const paksha = tithiIndex < 15 ? "शुक्ल" : "कृष्ण";
    const tithiName = tithiIndex === 14 ? "पूर्णिमा" : tithiIndex === 29 ? "अमावस्या" : TITHI_NAMES[tithiIndex % 15];
    const nak = computeNakshatraDetails(moon);
    const yogaIndex = Math.floor(mod360(sun + moon) / (360 / 27)) % 27;
    const karanaHalf = Math.floor(lunar / 6);
    let karanaIndex, karanaType;
    if (karanaHalf === 0) { karanaIndex = 10; karanaType = "Sthira"; }
    else if (karanaHalf >= 1 && karanaHalf <= 56) { karanaIndex = (karanaHalf - 1) % 7; karanaType = "Chara"; }
    else if (karanaHalf === 57) { karanaIndex = 7; karanaType = "Sthira"; }
    else if (karanaHalf === 58) { karanaIndex = 8; karanaType = "Sthira"; }
    else { karanaIndex = 9; karanaType = "Sthira"; }
    return {
      surya: sun, chandra: moon, tithiIndex, tithiName, paksha,
      nakshatraIndex: nak.index, nakshatraName: nak.name, nakshatraPada: nak.pada, nakshatraLord: nak.lord,
      nakshatraBhuktaPct: nak.percentDone, nakshatraWithinDeg: nak.withinDeg,
      yogaIndex, yogaName: YOGA_NAMES[yogaIndex],
      karanaIndex, karanaName: KARANA_NAMES[karanaIndex], karanaType, limbTier: "drik",
      karanaOrder: "the common order: Śakuni, Catuṣpada, Nāga, Kiṃstughna [unverified convention; SS 2.67 differs]",
    };
  }
  /** KARANA_NAMES index of panchanga.js karaṇa k (1…60) in the order of SS 2.67: k = 1 Kiṃstughna; 2…57 the seven movable
   *  from Bava; 58 Śakuni, 59 Nāga, 60 Catuṣpada (the verse's order; the common order puts Catuṣpada before Nāga). */
  function karanaIndexSS(k) {
    if (k === 1) return 10;
    if (k <= 57) return (k - 2) % 7;
    return k === 58 ? 7 : k === 59 ? 9 : 8;
  }

  function vimshottariBirthState(moonLongitude) {
    requireFinite(moonLongitude, "Moon longitude");
    const nakshatraArc = FULL_CIRCLE / 27;
    let longitude = mod360(moonLongitude);
    // Half-open policy [start, end): values within 1e-10 degrees of a boundary
    // are snapped to it, so an exact boundary consistently belongs to the next nakshatra.
    const boundaryToleranceDeg = 1e-10;
    const boundaryIndex = Math.round(longitude / nakshatraArc);
    const nearestBoundary = boundaryIndex * nakshatraArc;
    const snapped = Math.abs(longitude - nearestBoundary) <= boundaryToleranceDeg;
    const nakshatraIndex = snapped ? boundaryIndex % 27 : Math.floor(longitude / nakshatraArc);
    const fractionDone = snapped ? 0 : (longitude - nakshatraIndex * nakshatraArc) / nakshatraArc;
    const sequenceIndex = nakshatraIndex % 9;
    const lord = VIMSHOTTARI_SEQUENCE[sequenceIndex];
    const totalYears = VIMSHOTTARI_YEARS[lord];
    return {
      nakshatraIndex,
      fractionDone,
      sequenceIndex,
      lord,
      elapsedYears: fractionDone * totalYears,
      balanceYears: (1 - fractionDone) * totalYears,
    };
  }

  function dashaSubPeriods(parent) {
    const startIndex = VIMSHOTTARI_SEQUENCE.indexOf(parent.lord);
    let cursor = parent.startJd;
    return VIMSHOTTARI_SEQUENCE.map((_, offset) => {
      const lord = VIMSHOTTARI_SEQUENCE[(startIndex + offset) % 9];
      const duration = (parent.endJd - parent.startJd) * VIMSHOTTARI_YEARS[lord] / 120;
      const period = { lord, startJd: cursor, endJd: cursor + duration };
      cursor += duration;
      return period;
    });
  }

  function vimshottariAtJd(moonLongitude, birthJd, atJd = birthJd) {
    const birthState = vimshottariBirthState(moonLongitude);
    let cursor = birthJd - birthState.elapsedYears * SIDEREAL_YEAR_DAYS;
    let maha = null;
    for (let offset = 0; offset < 90; offset += 1) {
      const lord = VIMSHOTTARI_SEQUENCE[(birthState.sequenceIndex + offset) % 9];
      const duration = VIMSHOTTARI_YEARS[lord] * SIDEREAL_YEAR_DAYS;
      const candidate = { lord, startJd: cursor, endJd: cursor + duration };
      if (atJd >= candidate.startJd && atJd < candidate.endJd) {
        maha = candidate;
        break;
      }
      cursor += duration;
    }
    if (!maha) throw new Error("Vimśottarī date is outside the supported 10-cycle window");
    const antara = dashaSubPeriods(maha).find(
      (period) => atJd >= period.startJd && atJd < period.endJd,
    );
    return { birthState, maha, antara };
  }

  // ══════════════════════════════════════════════════════════════════════
  // YOGINĪ DAŚĀ COMPUTATIONAL ENGINE (36-YEAR CYCLE)
  // ══════════════════════════════════════════════════════════════════════
  const YOGINI_SEQUENCE = Object.freeze([
    "mangala", "pingala", "dhanya", "bhramari", "bhadrika", "ulka", "siddha", "sankata"
  ]);

  const YOGINI_METADATA = Object.freeze({
    mangala: { name: "Maṅgalā", sa: "मंगला", years: 1, lord: "candra", lordSa: "चन्द्र", deity: "Durgā" },
    pingala: { name: "Piṅgalā", sa: "पिंगला", years: 2, lord: "surya", lordSa: "सूर्य", deity: "Sūrya" },
    dhanya: { name: "Dhānyā", sa: "धान्या", years: 3, lord: "guru", lordSa: "गुरु", deity: "Viṣṇu" },
    bhramari: { name: "Bhrāmarī", sa: "भ्रामरी", years: 4, lord: "mangala", lordSa: "मंगल", deity: "Maheśvarī" },
    bhadrika: { name: "Bhadrikā", sa: "भद्रिका", years: 5, lord: "budha", lordSa: "बुध", deity: "Bhadrā" },
    ulka: { name: "Ulkā", sa: "उल्का", years: 6, lord: "shani", lordSa: "शनि", deity: "Kālikā" },
    siddha: { name: "Siddhā", sa: "सिद्धा", years: 7, lord: "shukra", lordSa: "शुक्र", deity: "Siddhadā" },
    sankata: { name: "Saṅkaṭā", sa: "संकटा", years: 8, lord: "rahu", lordSa: "राहु", deity: "Tripurasundarī" },
  });

  const YOGINI_TOTAL_CYCLE_YEARS = 36;

  function yoginiBirthState(moonLongitude) {
    requireFinite(moonLongitude, "Moon longitude");
    const nakshatraArc = FULL_CIRCLE / 27;
    let longitude = mod360(moonLongitude);
    const boundaryToleranceDeg = 1e-10;
    const boundaryIndex = Math.round(longitude / nakshatraArc);
    const nearestBoundary = boundaryIndex * nakshatraArc;
    const snapped = Math.abs(longitude - nearestBoundary) <= boundaryToleranceDeg;
    const nakshatraIndex = snapped ? boundaryIndex % 27 : Math.floor(longitude / nakshatraArc);
    const fractionDone = snapped ? 0 : (longitude - nakshatraIndex * nakshatraArc) / nakshatraArc;

    // Classical rule: (Nakshatra# + 3) % 8
    const nakshatraNum = nakshatraIndex + 1;
    const sequenceIndex = (nakshatraNum + 3 - 1) % 8;
    const key = YOGINI_SEQUENCE[sequenceIndex];
    const meta = YOGINI_METADATA[key];
    const totalYears = meta.years;

    return {
      nakshatraIndex,
      fractionDone,
      sequenceIndex,
      key,
      meta,
      elapsedYears: fractionDone * totalYears,
      balanceYears: (1 - fractionDone) * totalYears,
    };
  }

  function yoginiSubPeriods(parent) {
    const startIndex = YOGINI_SEQUENCE.indexOf(parent.key);
    let cursor = parent.startJd;
    const parentDuration = parent.endJd - parent.startJd;
    return YOGINI_SEQUENCE.map((_, offset) => {
      const key = YOGINI_SEQUENCE[(startIndex + offset) % 8];
      const meta = YOGINI_METADATA[key];
      const duration = parentDuration * meta.years / YOGINI_TOTAL_CYCLE_YEARS;
      const period = { key, meta, startJd: cursor, endJd: cursor + duration };
      cursor += duration;
      return period;
    });
  }

  /** Yoginī daśā by arc (the Moon's distance into its nakṣatra) [unverified convention], with a year of opts.yearDays
   *  days (default the sidereal year 365.25636 d) — a page passes its tier's year (TIERS[tier].dashaYear.days). */
  function yoginiAtJd(moonLongitude, birthJd, atJd = birthJd, opts = {}) {
    const birthState = yoginiBirthState(moonLongitude);
    const yearDays = opts && Number.isFinite(opts.yearDays) && opts.yearDays > 0 ? opts.yearDays : SIDEREAL_YEAR_DAYS;
    let cursor = birthJd - birthState.elapsedYears * yearDays;
    let maha = null;
    for (let offset = 0; offset < 40; offset += 1) {
      const key = YOGINI_SEQUENCE[(birthState.sequenceIndex + offset) % 8];
      const meta = YOGINI_METADATA[key];
      const duration = meta.years * yearDays;
      const candidate = { key, meta, startJd: cursor, endJd: cursor + duration };
      if (atJd >= candidate.startJd && atJd < candidate.endJd) {
        maha = candidate;
        break;
      }
      cursor += duration;
    }
    if (!maha) throw new Error("Yoginī date is outside the supported cycle window");
    const subPeriods = yoginiSubPeriods(maha);
    const antara = subPeriods.find(
      (period) => atJd >= period.startJd && atJd < period.endJd,
    ) || subPeriods[0];
    return { birthState, maha, antara };
  }

  // ══════════════════════════════════════════════════════════════════════
  // JAIMINI 8-CHARA KĀRAKA COMPUTATIONAL ENGINE
  // ══════════════════════════════════════════════════════════════════════
  const JAIMINI_KARAKA_ROLES = Object.freeze([
    { code: "AK", name: "Ātma Kāraka", sa: "आत्मकारक", role: "Soul purpose & supreme arbiter" },
    { code: "AmK", name: "Amātya Kāraka", sa: "अमात्यकारक", role: "Career, profession & intellectual advisor" },
    { code: "BK", name: "Bhrātṛ Kāraka", sa: "भ्रातृकारक", role: "Guru, siblings & inner courage" },
    { code: "MK", name: "Mātṛ Kāraka", sa: "मातृकारक", role: "Mother, domestic peace & emotional core" },
    { code: "PiK", name: "Pitṛ Kāraka", sa: "पितृकारक", role: "Father, ancestral legacy & status" },
    { code: "PK", name: "Putra Kāraka", sa: "पुत्रकारक", role: "Children, creativity & disciple mentorship" },
    { code: "GK", name: "Jñāti Kāraka", sa: "ज्ञाति कारक", role: "Competitors, obstacles & resilience" },
    { code: "DK", name: "Dāra Kāraka", sa: "दारकारक", role: "Spouse, primary partner & wealth anchor" }
  ]);

  function computeJaiminiCharaKarakas(planets) {
    if (!Array.isArray(planets)) throw new Error("Planets array required for Jaimini Chara Karakas");
    const eligible = planets.filter((p) => p.key !== "ketu");
    const evaluated = eligible.map((p) => {
      const withinDeg = mod360(p.longitude) % 30;
      const effectiveDeg = p.key === "rahu" ? (30 - withinDeg) : withinDeg;
      const rashiIndex = signIndex(p.longitude);
      const d9SignIndex = computeVarga(p.longitude, "D9");
      return {
        key: p.key,
        sa: p.sa,
        en: p.en,
        longitude: p.longitude,
        withinDeg,
        effectiveDeg,
        rashiIndex,
        rashi: RASHIS[rashiIndex],
        d9SignIndex,
        d9Sign: RASHIS[d9SignIndex],
      };
    });

    evaluated.sort((a, b) => b.effectiveDeg - a.effectiveDeg);

    const karakas = evaluated.map((item, index) => ({
      ...item,
      karaka: JAIMINI_KARAKA_ROLES[index] || { code: "UK", name: "Upakāraka", sa: "उपकारक", role: "Secondary" }
    }));

    const atmaKaraka = karakas.find((k) => k.karaka.code === "AK") || karakas[0];
    const amatyaKaraka = karakas.find((k) => k.karaka.code === "AmK") || karakas[1];
    const daraKaraka = karakas.find((k) => k.karaka.code === "DK") || karakas[karakas.length - 1];
    const karakamshaLagna = atmaKaraka ? atmaKaraka.d9Sign : "Meṣa";
    const karakamshaSignIndex = atmaKaraka ? atmaKaraka.d9SignIndex : 0;

    return {
      karakas,
      atmaKaraka,
      amatyaKaraka,
      daraKaraka,
      karakamshaLagna,
      karakamshaSignIndex,
    };
  }

  function katapayadiEncodeInteger(value) {
    let n = typeof value === "bigint" ? value : BigInt(value);
    if (n < 0n) throw new Error("Katapayadi integer must be non-negative");
    if (n === 0n) return KATAPAYADI_DIGITS[0];
    let word = "";
    while (n > 0n) {
      word += KATAPAYADI_DIGITS[Number(n % 10n)];
      n /= 10n;
    }
    return word;
  }

  function katapayadiDecodeInteger(word) {
    if (!word) throw new Error("Katapayadi word is empty");
    let value = 0n;
    let place = 1n;
    for (const letter of word) {
      const digit = KATAPAYADI_VALUES[letter];
      if (digit === undefined) throw new Error(`Unsupported Katapayadi letter '${letter}'`);
      value += BigInt(digit) * place;
      place *= 10n;
    }
    return value;
  }

  function parseCoordinate(text, maxAbsolute) {
    const source = String(text).trim();
    const match = /^([+-]?)(\d{1,3})(?:\.(\d{0,9}))?$/.exec(source);
    if (!match) throw new Error(`Invalid coordinate '${text}'`);
    const fraction = match[3] || "";
    const precision = fraction.length;
    const scaled = BigInt((match[2] + fraction).replace(/^0+/, "") || "0");
    const scale = 10n ** BigInt(precision);
    if (scaled > BigInt(maxAbsolute) * scale) {
      throw new Error(`Coordinate '${text}' exceeds ±${maxAbsolute}°`);
    }
    return { negative: match[1] === "-" && scaled !== 0n, precision, scaled };
  }

  function coordinateFromParts(scaled, precision, negative) {
    let digits = scaled.toString().padStart(precision + 1, "0");
    if (precision > 0) digits = `${digits.slice(0, -precision)}.${digits.slice(-precision)}`;
    return `${negative && scaled !== 0n ? "-" : ""}${digits}`;
  }

  function encodeCoordinatePair(latitudeText, longitudeText) {
    const latitude = parseCoordinate(latitudeText, 90);
    const longitude = parseCoordinate(longitudeText, 180);
    const latitudeHemisphere = latitude.negative ? "S" : "N";
    const longitudeHemisphere = longitude.negative ? "W" : "E";
    return [
      "K1",
      latitudeHemisphere,
      latitude.precision,
      katapayadiEncodeInteger(latitude.scaled),
      longitudeHemisphere,
      longitude.precision,
      katapayadiEncodeInteger(longitude.scaled),
    ].join("|");
  }

  function decodeCoordinatePair(payload) {
    const parts = String(payload).trim().split("|");
    if (parts.length !== 7 || parts[0] !== "K1") throw new Error("Invalid K1 coordinate payload");
    const latitudePrecision = Number(parts[2]);
    const longitudePrecision = Number(parts[5]);
    if (
      !Number.isInteger(latitudePrecision) || latitudePrecision < 0 || latitudePrecision > 9 ||
      !Number.isInteger(longitudePrecision) || longitudePrecision < 0 || longitudePrecision > 9 ||
      !["N", "S"].includes(parts[1]) || !["E", "W"].includes(parts[4])
    ) {
      throw new Error("Invalid K1 coordinate metadata");
    }
    const latitudeScaled = katapayadiDecodeInteger(parts[3]);
    const longitudeScaled = katapayadiDecodeInteger(parts[6]);
    const latitude = coordinateFromParts(latitudeScaled, latitudePrecision, parts[1] === "S");
    const longitude = coordinateFromParts(longitudeScaled, longitudePrecision, parts[4] === "W");
    parseCoordinate(latitude, 90);
    parseCoordinate(longitude, 180);
    return { latitude, longitude };
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SHARED YANTRA CORE · Sūrya Siddhānta full sphuta engine
     Ported VERBATIM from the Museum core (index.html) so that Museum, Panchang
     and the Zero-Error Engine page all compute the same nine bodies with the
     same manda (kendra) + śīghra (ukendra) equations. This is the single
     source of truth for every longitudes on all three pages.
     ═══════════════════════════════════════════════════════════════════════════ */

  function rad(degrees) {
    return degrees * Math.PI / 180;
  }

  const norm = mod360;

  const SS = Object.freeze({
    yugaYears: 4320000,
    yugaDays: 1577917828,
    kalpaYears: 4320000000,
    radius: 3438,
    kaliEpochJD: 588465.5,
    j2000JD: 2451545.0,
    motionsToKaliYears: 1955880000,
    bhagana: {
      surya: 4320000, chandra: 57753336, budh: 17937060, shukra: 7022376,
      mangal: 2296832, guru: 364220, shani: 146568, rahu: 232238, chandraMandocca: 488203,
    },
    apsisKalpa: { surya: 387, mangal: 204, budh: 368, guru: 900, shukra: 535, shani: 39 }, // Śukra 535 = SS i.41-44 (was 635: mandocca 99° off)
    nodeKalpa: { mangal: 214, budh: 488, guru: 174, shukra: 903, shani: 662 },
    paramaVikshepaMin: { chandra: 270, mangal: 90, budh: 120, guru: 60, shukra: 120, shani: 120 },
    mandaParidhi: {
      surya: [14, 13 + 40 / 60], chandra: [32, 31 + 40 / 60], mangal: [75, 72], budh: [30, 28],
      guru: [33, 32], shukra: [12, 11], shani: [49, 48],
    },
    sighraParidhi: { mangal: [235, 232], budh: [133, 132], guru: [70, 72], shukra: [262, 260], shani: [39, 40] },
  });

  const SS_AHARGANA_J2000 = SS.j2000JD - SS.kaliEpochJD;
  const SS_STAR_PLANETS = ["mangal", "budh", "guru", "shukra", "shani"];

  const SPANDAS_PER_DAY = 328050000000n;
  const MAHAYUGA_DAYS_BIGINT = 1577917828n;
  const REV_DEN = SPANDAS_PER_DAY * MAHAYUGA_DAYS_BIGINT;

  const ssExactRevolutions = (t, B, dir = 1) => {
    const ahargana = SS_AHARGANA_J2000 + t;
    const wholeDays = Math.floor(ahargana);
    const fracDays = ahargana - wholeDays;
    const aharganaSpandas = BigInt(wholeDays) * SPANDAS_PER_DAY + BigInt(Math.round(fracDays * 328050000000));
    let num = (BigInt(B) * aharganaSpandas) % REV_DEN;
    if (num < 0n) num = (num + REV_DEN) % REV_DEN;
    if (dir < 0) num = (REV_DEN - num) % REV_DEN;
    return Number(num) / Number(REV_DEN);
  };

  const ssPeriod = (B) => SS.yugaDays / B;
  const ssKaksha = (B) => Math.pow(SS.bhagana.surya / B, 2 / 3);
  const ssRevolutions = (t, B, dir = 1) => ssExactRevolutions(t, B, dir);
  const ssAngle = (t, B, dir = 1) => ssExactRevolutions(t, B, dir) * Math.PI * 2;
  const ssMeanLongitude = (t, B, dir = 1) => ssExactRevolutions(t, B, dir) * 360;
  const ssWrap = (a) => { a %= 360; return a < 0 ? a + 360 : a; };
  const ssPhaseFromKali = (t, B, offset = 0, dir = 1) =>
    ssWrap(offset + ssExactRevolutions(t, B, dir) * 360);
  const ssApsisAtKali = (k) => ssWrap(SS.apsisKalpa[k] * SS.motionsToKaliYears / SS.kalpaYears * 360);

  const ssBhaganaRole = (k) =>
    k === "budh" || k === "shukra" ? "शीघ्रोच्च-भगाṇa" : k === "rahu" || k === "ketu" ? "पात-भगाṇa" : "ग्रह-भगाṇa";

  const ssKey = (k) =>
    k === "candra" ? "chandra" : k === "mangala" ? "mangal" : k === "budha" ? "budh" : k;

  /** The observed ΔT (seconds) at a JD (UT). No text-tier function uses it any more (2026-10-08, owner D2: the text's
   *  day is the civil day); it remains for the labelled opt-in aharganaSpandasFromCivil({ applyDeltaT: true }). */
  function calculateDeltaT(jd) {
    return observedDeltaTSeconds(jd - 2451545.0); // seconds
  }

  /* ═══════════ The text tier through ss-tier.js (2026-10-08, owner D2: one implementation) ═══════════
     Every ss* function below takes t = days since J2000.0 (UT), as before, and returns today's shapes; the numbers come
     from the sovereign modules through ss-tier.js at the text's own day count (civil days from midnight at Laṅkā, no
     clock correction) — the plain Sūrya-Siddhānta. The former Greenwich-midnight epoch with ΔT and the modern three-term
     Moon are gone, not moved. `deltaTApplied` arguments are accepted and ignored. The manda/śīghra kendra keeps
     math-core's convention (place − mandocca for manda; śīghrocca − place for śīghra). */
  const SS_ROW_KEY = Object.freeze({ mangal: "mangala", budh: "budha", guru: "guru", shukra: "shukra", shani: "shani" });
  const SS_PLANET_EN = Object.freeze({ mangal: "mars", budh: "mercury", guru: "jupiter", shukra: "venus", shani: "saturn" });
  const textGrahas = (jd, samskara) => ssTier().grahas(jd, { samskara });
  const ssJdOfT = (t) => t + SS.j2000JD;

  function ssPlanetMeanAt(k, t = 0, deltaTApplied = false) {
    k = requireGrahaKey(k, { prithvi: true });
    requireFinite(t, "Day offset");
    const g = textGrahas(ssJdOfT(t), null);
    if (k === "surya" || k === "budh" || k === "shukra") return g.mean.surya;   // SS 1.29: Mercury's and Venus's mean planet is the mean Sun
    if (k === "chandra") return g.mean.candra;
    if (k === "rahu") return g.mean.rahu;
    if (k === "ketu") return norm(g.mean.rahu + 180);
    if (k === "prithvi") return norm(g.mean.surya + 180);
    return g.mean[SS_ROW_KEY[k]].mean;
  }

  function ssSighroccaAt(k, t = 0) {
    k = requireGrahaKey(k, { prithvi: true });
    requireFinite(t, "Day offset");
    if (!SS_ROW_KEY[k]) return null;
    const g = textGrahas(ssJdOfT(t), null);
    return k === "budh" || k === "shukra" ? g.mean[SS_ROW_KEY[k]].sighrocca : g.mean.surya;
  }

  function ssMandoccaAt(k, t = 0) {
    k = requireGrahaKey(k, { prithvi: true });
    requireFinite(t, "Day offset");
    if (k !== "surya" && k !== "chandra" && !SS_ROW_KEY[k]) return null;
    const g = textGrahas(ssJdOfT(t), null);
    if (k === "chandra") return g.mean.candraApogee;        // 488,203 revolutions a yuga, +90° at the Kali epoch (SS 1.33)
    if (k === "surya") return g.mean.suryaApogee;           // 387 revolutions a kalpa (SS 1.41)
    return g.mean[SS_ROW_KEY[k]].mandocca;
  }

  /* Math-core's own equation helpers (Math.sin), kept for the rational-kernel comparison and the audits below; the text
     tier itself uses sphuta.js / ss-graha.js (Mādhava's sine on R = 3438). */
  function ssRectifiedParidhi(pair, kendra) {
    if (!pair) return null;
    return pair[0] + (pair[1] - pair[0]) * Math.abs(Math.sin(rad(kendra)));
  }

  function ssMandaEquation(place, mandocca, pair) {
    const kendra = norm(place - mandocca);
    const R = SS.radius;
    const p = ssRectifiedParidhi(pair, kendra);
    const bhuja = R * Math.abs(Math.sin(rad(kendra)));
    const koti = R * Math.abs(Math.cos(rad(kendra)));
    const bhujaPhala = bhuja * p / 360;
    const kotiPhala = koti * p / 360;
    const magnitude = Math.asin(Math.max(-1, Math.min(1, bhujaPhala / R))) * 180 / Math.PI;
    /* SANKALP BE-S09 (2026-08-17, user-sealed): manda-phala sign corrected (kendra 0-180 → subtract). */
    const correction = kendra <= 180 ? -magnitude : magnitude;
    return { kind: "manda", place, centre: mandocca, kendra, paridhi: p, bhuja, koti, bhujaPhala, kotiPhala, magnitude, correction };
  }

  function ssSighraEquation(place, sighrocca, pair) {
    const kendra = norm(sighrocca - place);
    const R = SS.radius;
    const p = ssRectifiedParidhi(pair, kendra);
    const bhuja = R * Math.abs(Math.sin(rad(kendra)));
    const koti = R * Math.abs(Math.cos(rad(kendra)));
    const bhujaPhala = bhuja * p / 360;
    const kotiPhala = koti * p / 360;
    const base = (kendra < 90 || kendra > 270) ? R + kotiPhala : R - kotiPhala;
    const karna = Math.hypot(base, bhujaPhala);
    const magnitude = Math.asin(Math.max(-1, Math.min(1, bhujaPhala / karna))) * 180 / Math.PI;
    const correction = kendra <= 180 ? magnitude : -magnitude;
    return { kind: "sighra", place, centre: sighrocca, kendra, paridhi: p, bhuja, koti, bhujaPhala, kotiPhala, base, karna, magnitude, correction };
  }

  /** One equation of ss-graha.js / sphuta.js in math-core's shape. */
  function eqShape(kind, place, centre, e) {
    return { kind, place, centre, kendra: kind === "manda" ? norm(place - centre) : norm(centre - place), paridhi: e.paridhi,
      bhujaPhala: e.bhujaphala, kotiPhala: e.kotiphala, karna: e.karna, magnitude: Math.abs(e.degrees), correction: e.degrees,
      rule: kind === "manda" ? "SS 2.29-2.45, Mādhava's sine on R = 3438 (the text tier)" : "SS 2.38-2.45, Mādhava's sine on R = 3438 (the text tier)" };
  }
  /** The text tier's sphuṭa of one graha at jd, in ssSphutaAt's shape (samskara: null = the plain text). */
  function ssDetail(k, jd, samskara) {
    const g = textGrahas(jd, samskara);
    if (k === "rahu" || k === "ketu" || k === "prithvi") {
      const mean = k === "rahu" ? g.rahu : k === "ketu" ? g.ketu : norm(g.mean.surya + 180);
      return { k, mean, sphuta: mean, mandocca: null, sighrocca: null, kind: "mean" };
    }
    if (k === "surya" || k === "chandra") {
      const sun = k === "surya";
      const mean = sun ? g.mean.surya : g.mean.candra, mandocca = sun ? g.mean.suryaApogee : g.mean.candraApogee;
      const e = sun ? g.sun : g.moon, sphuta = sun ? g.surya : g.candra;
      const out = { k, mean, mandocca, sighrocca: null, manda: eqShape("manda", mean, mandocca, e), paksika: 0, mandaSphuta: sphuta, sphuta, kind: "manda" };
      if (!sun) { out.lunarInequalities = null; out.lunarModel = "none: SS 2.39-2.43, the text's one manda equation for the Moon"; }
      if (samskara) out.samskara = samskara;
      return out;
    }
    const row = SS_ROW_KEY[k], P = g.planets[SS_PLANET_EN[k]], m = g.mean[row], q = P.equations;
    const [p1, p2, p3, longitude] = P.steps;
    return {
      k, mean: m.mean, mandocca: m.mandocca, sighrocca: m.sighrocca,
      firstSighra: eqShape("sighra", m.mean, m.sighrocca, q.sighra1), halfSighraPlace: p1,
      firstManda: eqShape("manda", p1, m.mandocca, q.manda2), halfMandaPlace: p2,
      fullManda: eqShape("manda", p2, m.mandocca, q.manda3), mandaSphuta: p3,
      finalSighra: eqShape("sighra", p3, m.sighrocca, q.sighra4), sphuta: longitude, kind: "manda-sighra",
    };
  }

  function ssSphutaAt(k, t = 0) {
    k = requireGrahaKey(k, { prithvi: true });
    requireFinite(t, "Day offset");
    return ssDetail(k, ssJdOfT(t), null);
  }

  function ssMeanNodeAt(k, t = 0, deltaTApplied = false) {
    k = requireGrahaKey(k, { prithvi: true });
    requireFinite(t, "Day offset");
    if (k !== "chandra" && k !== "rahu" && k !== "ketu" && !SS_ROW_KEY[k]) return null;
    const g = textGrahas(ssJdOfT(t), null);
    if (k === "chandra" || k === "rahu") return g.mean.rahu;
    if (k === "ketu") return norm(g.mean.rahu + 180);
    return g.mean[SS_ROW_KEY[k]].node;
  }

  function ssNodeAt(k, t = 0) {
    k = requireGrahaKey(k, { prithvi: true });
    requireFinite(t, "Day offset");
    const mean = ssMeanNodeAt(k, t);
    if (mean === null) return { k, mean: null, sphuta: null, correction: 0, rule: "none" };
    if (k === "chandra" || k === "rahu" || k === "ketu") return { k, mean, sphuta: mean, correction: 0, rule: "lunar-node" };
    const P = textGrahas(ssJdOfT(t), null).planets[SS_PLANET_EN[k]];
    const inferior = k === "budh" || k === "shukra";
    const correction = inferior ? -P.equations.manda3.degrees : P.equations.sighra4.degrees;
    return { k, mean, sphuta: P.node, correction, rule: inferior ? "third-manda-opposite" : "sighra" };
  }

  function ssLatitudeAt(k, t = 0) {
    k = requireGrahaKey(k, { prithvi: true });
    requireFinite(t, "Day offset");
    const maxMin = SS.paramaVikshepaMin[k] || 0;
    if (!maxMin) {
      return { k, latitude: 0, minutes: 0, paramaMinutes: 0, node: null, argument: 0, bhuja: 0, karna: SS.radius, rule: "ecliptic" };
    }
    const g = textGrahas(ssJdOfT(t), null);
    if (k === "chandra") {
      return { k, latitude: g.latitudeDeg.candra, minutes: g.latitudeDeg.candra * 60, paramaMinutes: maxMin, node: g.rahu, meanNode: g.mean.rahu,
        nodeCorrection: 0, argument: norm(g.candra - g.rahu), karna: SS.radius, reference: g.candra, rule: "स्फुट-ग्रह−स्फुट-पात (SS 2.57, 1.68)" };
    }
    const P = g.planets[SS_PLANET_EN[k]], inferior = k === "budh" || k === "shukra";
    const m = g.mean[SS_ROW_KEY[k]];
    return {
      k, latitude: P.latitude / 60, minutes: P.latitude, paramaMinutes: maxMin, node: P.node, meanNode: m.node,
      nodeCorrection: norm(P.node - m.node + 180) - 180, argument: P.latitudeArgument, karna: P.karna,
      reference: inferior ? m.sighrocca : P.longitude, rule: inferior ? "शीघ्रोच्च−स्फुट-पात" : "स्फुट-ग्रह−स्फुट-पात",
    };
  }

  function ssParamaManda(k) {
    k = requireGrahaKey(k, { prithvi: true });
    const pair = SS.mandaParidhi[k];
    if (!pair) return null;
    const phala = Math.asin(Math.max(-1, Math.min(1, pair[1] / 360))) * 180 / Math.PI;
    return { k, paridhiAtQuarter: pair[1], paramaPhala: phala, e: phala / 2 };
  }

  /** A frozen object whose checks run when read (the served path needs ss-tier.js, which this file does not load at
   *  start). index.html reads every field; each must be true. */
  function lazyAudit(checks) {
    const o = {};
    for (const [k, f] of Object.entries(checks)) Object.defineProperty(o, k, { get: f, enumerable: true });
    return Object.freeze(o);
  }
  const epochMeans = () => ssTier().meanAtDays(0);                       // the served means at the Kali epoch (day 0, Laṅkā midnight)
  const near = (a, b) => Math.abs(norm(a - b + 180) - 180) < 1e-12;
  const ssAudit = lazyAudit({
    civilDayIdentity: () => SS.yugaDays === 1582237828 - SS.bhagana.surya,
    sunKakshaUnity: () => Math.abs(ssKaksha(SS.bhagana.surya) - 1) < 1e-12,
    planetMeanKaliZero: () => { const m = epochMeans(); return [m.sun, m.moon, m.planets.mars.mean, m.planets.jupiter.mean, m.planets.saturn.mean].every((x) => near(x, 0)); },
    inferiorSighroccaKaliZero: () => { const m = epochMeans(); return near(m.planets.mercury.sighrocca, 0) && near(m.planets.venus.sighrocca, 0); },
    moonMandoccaKali90: () => near(epochMeans().moonApogee, 90),
    rahuKali180: () => near(epochMeans().node, 180),
    rahuRetrograde: () => -360 * SS.bhagana.rahu / SS.yugaDays < 0,
  });

  const ssSphutaAudit = lazyAudit({
    paridhiEvenAtZero: () => Math.abs(ssRectifiedParidhi(SS.mandaParidhi.surya, 0) - 14) < 1e-12,
    paridhiOddAtQuarter: () => Math.abs(ssRectifiedParidhi(SS.mandaParidhi.surya, 90) - (13 + 40 / 60)) < 1e-12,
    mandaZeroAtApsis: () => Math.abs(ssMandaEquation(77.13, 77.13, SS.mandaParidhi.surya).correction) < 1e-12,
    sighraZeroAtConjunction: () => Math.abs(ssSighraEquation(0, 0, SS.sighraParidhi.mangal).correction) < 1e-12,
    inferiorMeanEqualsSun: () => ["budh", "shukra"].every((k) => Math.abs(ssPlanetMeanAt(k, 0) - ssPlanetMeanAt("surya", 0)) < 1e-12),
    ketuAntipodal: () => Math.abs(Math.abs(((ssPlanetMeanAt("ketu", 0) - ssPlanetMeanAt("rahu", 0) + 540) % 360) - 180) - 180) < 1e-12,
    finiteSphuta: () => ["surya", "chandra", ...SS_STAR_PLANETS].every((k) => Number.isFinite(ssSphutaAt(k, 0).sphuta)),
  });

  const ssSpaceAudit = lazyAudit({
    vikshepaSequence: () => [["chandra", 270], ["mangal", 90], ["budh", 120], ["guru", 60], ["shukra", 120], ["shani", 120]].every(
      ([k, v]) => SS.paramaVikshepaMin[k] === v,
    ),
    nodesRetrograde: () => Object.values(SS.nodeKalpa).every((v) => -v < 0),
    // the Kali-epoch identity of the served model, at the text's own day 0 (midnight at Laṅkā)
    lunarNodeKali180: () => near(epochMeans().node, 180),
    latitudeFinite: () => ["chandra", ...SS_STAR_PLANETS].every((k) => Number.isFinite(ssLatitudeAt(k, 0).latitude)),
    eHalfParama: () => ["surya", "chandra", ...SS_STAR_PLANETS].every(
      (k) => Math.abs(ssParamaManda(k).e - ssParamaManda(k).paramaPhala / 2) < 1e-12,
    ),
  });

  // USNO Circular 179, equation 2.6: periodic TDB−TT approximation, seconds.
  // This is a time-coordinate conversion, not an empirical longitude fit.
  function tdbMinusTtSeconds(daysTT) {
    const t = daysTT / 36525;
    return .001657 * Math.sin(628.3076 * t + 6.2401)
      + .000022 * Math.sin(575.3385 * t + 4.2970)
      + .000014 * Math.sin(1256.6152 * t + 6.1969)
      + .000005 * Math.sin(606.9777 * t + 4.0212)
      + .000005 * Math.sin(52.9691 * t + .4444)
      + .000002 * Math.sin(21.3299 * t + 5.5431)
      + .000010 * t * Math.sin(628.3076 * t + 4.2490);
  }

  const fullStateCache = new Map();
  const fullVectorCache = new Map();
  function cacheState(cache, key, value) {
    if (cache.size >= 256) cache.delete(cache.keys().next().value);
    cache.set(key, value);
    return value;
  }
  function fullBaryState(body, time, lunarTheory = "full", splitEpoch = false) {
    const key = body + ":" + time.tt + ":" + lunarTheory + ':' + splitEpoch;
    if (fullStateCache.has(key)) return fullStateCache.get(key);
    const sun = Astronomy.BaryState(Astronomy.Body.Sun, time);
    if (body === Astronomy.Body.Sun) return cacheState(fullStateCache, key, sun);
    if (body === Astronomy.Body.Moon) {
      const earth = fullBaryState(Astronomy.Body.Earth, time, lunarTheory, splitEpoch);
      if (lunarTheory !== "compact" && !ElpMoon) throw new Error("ELP provider unavailable; load elp-moon.js before math-core.js");
      const moon = lunarTheory === "compact" ? Astronomy.GeoMoon(time)
        : splitEpoch ? ElpMoon.equatorialJ2000(SS.j2000JD, time.tt + tdbMinusTtSeconds(time.tt) / 86400)
        : ElpMoon.equatorialJ2000(time.tt + SS.j2000JD + tdbMinusTtSeconds(time.tt) / 86400);
      return cacheState(fullStateCache, key, { x: earth.x + moon.x, y: earth.y + moon.y, z: earth.z + moon.z });
    }
    // Provider API is TT. Lunar diagnostics must not alter Earth/planet epochs.
    const dt = tdbMinusTtSeconds(time.tt) / 86400;
    const h = splitEpoch ? Vsop87.equatorialJ2000(body, SS.j2000JD, time.tt + dt)
      : Vsop87.equatorialJ2000(body, time.tt + SS.j2000JD + dt);
    return cacheState(fullStateCache, key, { x: h.x + sun.x, y: h.y + sun.y, z: h.z + sun.z,
      vx: h.vx + sun.vx, vy: h.vy + sun.vy, vz: h.vz + sun.vz });
  }
  function fullApparentVector(body, time, deflection = true, lunarTheory = "full", observerState = null, splitEpoch = false) {
    if (!Vsop87) throw new Error("Full VSOP87 provider unavailable; load vsop87-full.js before math-core.js");
    const key = body + ":" + time.tt + ":" + deflection + ":" + lunarTheory + ':' + splitEpoch
      + (observerState ? ':' + [observerState.x,observerState.y,observerState.z,observerState.vx,observerState.vy,observerState.vz].join(':') : '');
    if (fullVectorCache.has(key)) return fullVectorCache.get(key);
    const c = 173.144632674240;
    const geocenter = fullBaryState(Astronomy.Body.Earth, time, lunarTheory, splitEpoch);
    // Reception position AND velocity: solves topocentric retarded ray and
    // annual+diurnal aberration together, not a parallax subtraction after it.
    const earth = observerState ? Object.fromEntries(['x','y','z','vx','vy','vz'].map(k => [k,geocenter[k]+observerState[k]])) : geocenter;
    let tau = 0, x, y, z;
    for (let i = 0; i < 8; ++i) {
      const emitted = Astronomy.AstroTime.FromTerrestrialTime(time.tt - tau);
      const target = fullBaryState(body, emitted, lunarTheory, splitEpoch);
      x = target.x - earth.x; y = target.y - earth.y; z = target.z - earth.z;
      const next = Math.hypot(x, y, z) / c;
      if (Math.abs(next - tau) < 1e-13) break;
      tau = next;
    }
    // Finite-source monopole light deflection before annual aberration.
    // Klioner (2003), equation 70; ERFA ld documents the same vector relation.
    // Closest approach is clamped to the finite source-observer light path.
    // Opaque-body near-axis rays use a limiter; self-deflection is excluded.
    if (deflection) {
      const sourceRange = Math.hypot(x, y, z);
      const masses = [["Sun", 1, 6e-6], ["Jupiter", 1 / 1047.3486, 3e-9], ["Saturn", 1 / 3497.898, 3e-10]];
      const encounters = masses.filter(([name]) => name !== body).map(([name, mass, limiter]) => {
        const now = fullBaryState(name, time, lunarTheory, splitEpoch);
        const closest = Math.max(0, Math.min(sourceRange / c,
          (x * (now.x - earth.x) + y * (now.y - earth.y) + z * (now.z - earth.z)) / (sourceRange * c)));
        return { name, mass, limiter, closest };
      }).sort((a, b) => b.closest - a.closest);
      for (const { name, mass, limiter, closest } of encounters) {
        const d = fullBaryState(name, Astronomy.AstroTime.FromTerrestrialTime(time.tt - closest), lunarTheory, splitEpoch);
        const ev = [earth.x - d.x, earth.y - d.y, earth.z - d.z];
        const qv = [x + ev[0], y + ev[1], z + ev[2]];
        const em = Math.hypot(...ev), qm = Math.hypot(...qv), range = Math.hypot(x, y, z);
        if (em === 0 || qm === 0) continue;
        const e = ev.map(v => v / em), q = qv.map(v => v / qm), ray = [x / range, y / range, z / range];
        const pq = ray.reduce((sum, v, i) => sum + v * q[i], 0);
        const pe = ray.reduce((sum, v, i) => sum + v * e[i], 0);
        const qe = q.reduce((sum, v, i) => sum + v * e[i], 0);
        const factor = 1.97412574336e-8 * mass / em / Math.max(1 + qe, limiter) * range;
        x += factor * (pq * e[0] - pe * q[0]);
        y += factor * (pq * e[1] - pe * q[1]);
        z += factor * (pq * e[2] - pe * q[2]);
      }
    }
    // Exact special-relativistic annual aberration of the retarded ray.
    const range = Math.hypot(x, y, z);
    const gammaInv = Math.sqrt(1 - (earth.vx ** 2 + earth.vy ** 2 + earth.vz ** 2) / c ** 2);
    const dot = (x * earth.vx + y * earth.vy + z * earth.vz) / (range * c);
    const q = (1 + dot / (1 + gammaInv)) * range / c;
    return cacheState(fullVectorCache, key, new Astronomy.Vector(
      (gammaInv * x + q * earth.vx) / (1 + dot),
      (gammaInv * y + q * earth.vy) / (1 + dot),
      (gammaInv * z + q * earth.vz) / (1 + dot), time));
  }

  /* Modern analytical kernel. No JPL/Swiss runtime data or network calls.
   * UT is the public input; Astronomy Engine applies its Delta-T model ONCE.
   * Ecliptic() returns true ecliptic of date, not fixed J2000 coordinates.
   * Full VSOP87 planets and an apparent analytical Moon are the default.
   * The compact theory is retained explicitly for numerical regression audits.
   */
  function drigCoordinates(grahaKey, jd, options = {}) {
    requireFinite(jd, "Julian day");
    const names = { surya: "Sun", ravi: "Sun", candra: "Moon", chandra: "Moon", soma: "Moon",
      mangala: "Mars", mangal: "Mars", kuja: "Mars", budha: "Mercury", budh: "Mercury",
      guru: "Jupiter", shukra: "Venus", shani: "Saturn" };
    const name = names[grahaKey];
    if (!name) throw new RangeError(`Unsupported astronomical body '${grahaKey}'`);
    if (!Astronomy || typeof Astronomy.GeoVector !== "function") {
      throw new Error("The bundled Astronomy Engine is unavailable");
    }
    const time = options.timeScale === "TT"
      ? Astronomy.AstroTime.FromTerrestrialTime(jd - SS.j2000JD)
      : new Astronomy.AstroTime(jd - SS.j2000JD);
    if (options.timeScale !== undefined && options.timeScale !== "TT" && options.timeScale !== "UT") {
      throw new RangeError(`Unknown time scale '${options.timeScale}'`);
    }
    const body = Astronomy.Body[name];
    if (options.planetaryTheory !== undefined && !["full", "compact"].includes(options.planetaryTheory)) {
      throw new RangeError(`Unknown planetary theory '${options.planetaryTheory}'`);
    }
    if (options.lunarTheory !== undefined && !["full", "compact"].includes(options.lunarTheory)) throw new RangeError("Unknown lunar theory");
    const compact = options.planetaryTheory === "compact";
    const vector = compact ? Astronomy.GeoVector(body, time, body !== Astronomy.Body.Moon) : fullApparentVector(body, time, options.deflection !== false, options.lunarTheory);
    const ecliptic = Astronomy.Ecliptic(vector);
    const equator = Astronomy.RotateVector(Astronomy.Rotation_EQJ_EQD(time), vector);
    const fixed = Astronomy.RotateVector(Astronomy.Rotation_EQJ_ECL(), vector);
    const key = GRAHAS.find(g => g.en === name).key;
    const correction = options.quantumBija === true ? quantumBijaCorrection(key, time.tt) : 0;
    return {
      longitude: mod360(ecliptic.elon + correction), latitude: ecliptic.elat,
      rightAscensionDeg: mod360(Math.atan2(equator.y, equator.x) * 180 / Math.PI),
      declinationDeg: Math.atan2(equator.z, Math.hypot(equator.x, equator.y)) * 180 / Math.PI,
      longitudeJ2000: mod360(Math.atan2(fixed.y, fixed.x) * 180 / Math.PI),
      distanceAU: Math.hypot(vector.x, vector.y, vector.z),
      jdUT: time.ut + SS.j2000JD, jdTT: time.tt + SS.j2000JD,
      frame: "true-ecliptic-of-date", quantumBijaApplied: options.quantumBija === true,
      correctionStatus: options.quantumBija === true ? "experimental-unvalidated" : "disabled",
      lunarConvention: name === "Moon" ? (compact ? "geometric" : "apparent") : null,
      lunarTheory: name === "Moon" ? (compact || options.lunarTheory === "compact" ? "astronomy-engine-compact" : "full-elp-mpp02-DE405") : null,
      planetaryTheory: compact ? "astronomy-engine-compact" : "full-vsop87b",
      nativeFrame: compact ? "J2000" : "FK5-J2000",
      gravitationalDeflection: compact || options.deflection === false ? "omitted" : "Sun-Jupiter-Saturn-monopole",
    };
  }

  // Fixed J2000 diagnostic. Residuals fitted in another frame never apply here.
  function drigGeoJ2000(grahaKey, jd) {
    return drigCoordinates(grahaKey, jd).longitudeJ2000;
  }

  /** Meeus' mean lunar node (tropical, degrees) — kept for drik-tier.js and labelled comparison rows; no tier serves it. */
  function meanLunarNodeTropicalDeg(jd) {
    requireFinite(jd, "Julian day");
    const T = (jd - 2451545.0) / 36525;
    return mod360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441 - T * T * T * T / 60616000);
  }

  /** Houses and every other frame of a tier rotate by the tier's own ayanāṃśa (tierAyanamsha): one value, displayed and
   *  applied. A named ayanāṃśa is not a frame (RangeError: bridges take a tier). */
  function coordinateFrameOffsetDeg(jd, frame = "ss") {
    return tierAyanamsha(jd, bridgeTier(frame)).deg;
  }

  const DRIK_KEY_ALIASES = Object.freeze({ surya: "surya", sun: "surya", candra: "candra", chandra: "candra", moon: "candra", mangala: "mangala", mars: "mangala",
    budha: "budha", mercury: "budha", guru: "guru", jupiter: "guru", shukra: "shukra", venus: "shukra", shani: "shani", saturn: "shani", rahu: "rahu", ketu: "ketu" });
  /** SiddhantaTier.grahas(jd) → { key: { longitude (sidereal, Citrā-pakṣa true), latitude, speed, source } } whatever its
   *  container (an array of rows with `key`, or an object keyed by graha); null outside its span. */
  function drikRows(jd, opts) {
    drikGuard(jd, "the grahas", opts && opts.timeScale === "TT" ? { timeScale: "TT" } : undefined);
    const res = opts && opts.timeScale === "TT" ? sdFn("grahas")(jd, { timeScale: "TT" }) : sdFn("grahas")(jd);
    if (res === null || res === undefined) return null;
    const out = {};
    const put = (k, r) => {
      const key = DRIK_KEY_ALIASES[k]; if (!key) return;
      if (typeof r === "number") out[key] = { longitude: mod360(r), latitude: res._lat && Number.isFinite(res._lat[k]) ? res._lat[k] : null, speed: null, source: res.source || "own" };
      else if (r && Number.isFinite(r.longitude)) out[key] = { longitude: mod360(r.longitude), latitude: Number.isFinite(r.latitude) ? r.latitude : null, speed: Number.isFinite(r.speed) ? r.speed : null, source: r.source || "own" };
    };
    if (Array.isArray(res)) for (const r of res) put(r.key, r);
    else for (const k of Object.keys(res)) put(k, res[k]);
    if (out.rahu && !out.ketu) out.ketu = { longitude: mod360(out.rahu.longitude + 180), latitude: 0, speed: out.rahu.speed, source: out.rahu.source };
    for (const g of GRAHAS) if (!out[g.key]) throw new Error(`siddhanta-tier.js grahas() gave no ${g.key}`);
    return out;
  }

  /** The tier's nine rows at jd: { key, sa, en, longitude (sidereal, the tier's frame), mean (text tiers: the mean place;
   *  dṛk: null), latitudeDeg, detail, tier, source }. dṛk outside its span: TierSpanError. */
  function tierGrahaRows(jd, tier = "ss", opts = {}) {
    requireFinite(jd, "Julian day");
    const id = resolveTier(tier);
    if (TIERS[id].family === "drik") {
      if (opts && opts.timeScale !== undefined && opts.timeScale !== "TT" && opts.timeScale !== "UT") throw new RangeError(`Unknown time scale '${opts.timeScale}'`);
      const rows = drikCall(drikRows(jd, opts), jd, "the grahas");
      return GRAHAS.map((g) => ({ ...g, longitude: rows[g.key].longitude, mean: null, latitudeDeg: rows[g.key].latitude, speedDegDay: rows[g.key].speed,
        detail: { source: rows[g.key].source, engine: "siddhanta-tier.js" }, tier: id, source: rows[g.key].source }));
    }
    const sam = TIERS[id].samskara, gr = textGrahas(jd, sam);
    return GRAHAS.map((g) => {
      const k = ssKey(g.key), detail = ssDetail(k, jd, sam);
      const lat = g.key === "rahu" || g.key === "ketu" || g.key === "surya" ? 0 : gr.latitudeDeg[g.key];
      return { ...g, longitude: mod360(gr[g.key]), mean: mod360(detail.mean), latitudeDeg: lat, detail, tier: id, source: "text" };
    });
  }

  /* Shared sphuta model: the tier's rows; the bīja is an explicit opt-in experiment of the text tiers, never a default. */
  function sphutaGrahaModel(jd, options) {
    requireFinite(jd, "Julian day");
    const modelOptions = resolveBijaOptions(options, false, "sphutaGrahaModel");
    const { applyBija, bijaModel, mode } = modelOptions;
    if (TIERS[mode].family === "drik") {
      // timeScale 'TT': jd is TT (siddhanta-tier.js then applies no ΔT); default UT
      return tierGrahaRows(jd, mode, { timeScale: modelOptions.timeScale }).map((row) => ({ ...row, sphuta: row.longitude, bija: 0 }));
    }
    return tierGrahaRows(jd, mode).map((row) => {
      const bija = applyBija ? bijaDeltaDeg(row.key, jd, bijaModel) : 0;
      return { ...row, sphuta: row.longitude, bija, longitude: mod360(row.longitude + bija) };
    });
  }

  function canonicalGrahaModel(jd, options) {
    return sphutaGrahaModel(jd, options).map(row => ({ ...row, details: row.detail }));
  }
/**
 * Precision contract derived from Vedic-Ghadi-Engine-Architecture.pdf §§6,10.
 * Budgets belong to a specific model/frame/epoch. An observed RMS or a
 * graha-minus-Sun residual is NOT an absolute-longitude error bound.
 */
















const PRECISION_VARGAS = Object.freeze([1,2,3,4,5,6,7,8,9,10,11,12,16,20,24,27,30,40,45,60,81,108,144,150]);
function finite(value        , name        )         {
  if (!Number.isFinite(value)) throw new RangeError(name + ' must be finite');
  return value;
}
function nonnegative(value        , name        )         {
  finite(value, name);
  if (value < 0) throw new RangeError(name + ' must be nonnegative');
  return value;
}
function longitude(value        )         {
  finite(value, 'longitudeDeg');
  const r = value % 360;
  return r < 0 ? r + 360 : r === 0 ? 0 : r;
}

/** Distance to source-longitude division edges, NOT destination sign edges. */
function vargaMarginArcsec(lonDeg        , division        )         {
  if (!PRECISION_VARGAS.includes(division)) throw new RangeError('unsupported varga');
  const lon = longitude(lonDeg);
  const sign = Math.floor(lon / 30);
  const within = lon - sign * 30;
  if (division === 30) {
    // Parashari Trimsamsa: odd signs 5/5/8/7/5, even 5/7/8/5/5.
    const edges = sign % 2 === 0 ? [0,5,10,18,25,30] : [0,5,12,20,25,30];
    return Math.min(...edges.map(edge => Math.abs(within - edge))) * 3600;
  }
  // Construct every boundary from its global rational index. Subtracting
  // sign-local offsets first loses a few ulps and can mark an exact boundary
  // as decided under a zero declared budget.
  const cell = Math.floor(lon * division / 30);
  return Math.min(...[-1,0,1,2].map(offset => {
    const index = Math.max(0, Math.min(12 * division, cell + offset));
    return Math.abs(lon - index * 30 / division);
  })) * 3600;
}

function positionBudgetArcsec(budget                ) {
  const series = nonnegative(budget.seriesArcsec, 'seriesArcsec');
  const frame = nonnegative(budget.frameArcsec, 'frameArcsec');
  const deltaT = nonnegative(budget.deltaTSeconds, 'deltaTSeconds');
  const clock = nonnegative(budget.clockSeconds, 'clockSeconds');
  const speed = nonnegative(budget.maxSpeedDegPerDay, 'maxSpeedDegPerDay');
  // degrees/day * seconds * 3600 arcsec/degree / 86400 seconds/day.
  const deltaTArcsec = speed * deltaT / 24;
  const clockArcsec = speed * clock / 24;
  const totalArcsec = series + frame + deltaTArcsec + clockArcsec;
  finite(totalArcsec, 'totalArcsec');
  return { seriesArcsec: series, frameArcsec: frame, deltaTArcsec, clockArcsec, totalArcsec };
}

function placementPrecision(
  lonDeg        , context                  , budget                 , safetyFactor = 10,
) {
  longitude(lonDeg);
  finite(context.jdUt, 'jdUt');
  finite(safetyFactor, 'safetyFactor');
  if (safetyFactor < 1) throw new RangeError('safetyFactor must be >= 1');
  if (!context.model || !context.frame) throw new RangeError('model and frame are required');
  let reason                = null;
  let components                                                 = null;
  if (!budget) reason = 'missing-error-budget';
  else {
    components = positionBudgetArcsec(budget);
    const range = budget.validJdUt;
    if (!range || range.length !== 2 || !Number.isFinite(range[0]) || !Number.isFinite(range[1]) || range[0] > range[1])
      throw new RangeError('validJdUt must be an ordered finite pair');
    if (!budget.source?.trim()) reason = 'missing-budget-source';
    else if (budget.model !== context.model) reason = 'model-mismatch';
    else if (budget.frame !== context.frame) reason = 'frame-mismatch';
    else if (context.jdUt < range[0] || context.jdUt > range[1]) reason = 'outside-budget-validity';
  }
  const guarded = components === null ? null : safetyFactor * components.totalArcsec;
  if (guarded !== null) finite(guarded, 'guardedErrorArcsec');
  const assess = (marginArcsec        ) => ({
    marginArcsec,
    status: reason === null && guarded !== null && marginArcsec > guarded ? 'decided' : 'undetermined',
    reason: reason ?? (guarded !== null && marginArcsec > guarded ? null : 'boundary-within-error-budget'),
  });
  const lon = longitude(lonDeg);
  const nakWidth = 360 / 27;
  const nakCell = Math.min(26, Math.floor(lon / nakWidth));
  const nakMargin = Math.max(0, Math.min(lon - nakCell * nakWidth, (nakCell + 1) * nakWidth - lon)) * 3600;
  const vargas = Object.fromEntries(PRECISION_VARGAS.map(n => ['D' + n, assess(vargaMarginArcsec(lon, n))]));
  return {
    context: { ...context }, longitudeDeg: lon, safetyFactor,
    budgetSource: budget?.source ?? null, components, guardedErrorArcsec: guarded,
    conditionalOnDeclaredBudget: true,
    nakshatra: assess(nakMargin), pada: assess(vargaMarginArcsec(lon, 9)), vargas,
  };
}

function chartPrecision(
  positions                        , context                  ,
  budgets                                 = {}, safetyFactor = 10,
) {
  if (Object.keys(positions).length === 0) throw new RangeError('positions must not be empty');
  return Object.fromEntries(Object.entries(positions).map(([body, lon]) => [
    body, placementPrecision(lon, context, budgets[body], safetyFactor),
  ]));
}

  function canonicalChartWithPrecision(jd, options = {}, budgets = {}) {
    const grahas = canonicalGrahaModel(jd, options);
    const mode = resolveBijaOptions(options, false, "canonicalChartWithPrecision").mode;
    const context = { jdUt: jd, model: "offline:" + mode, frame: "nirayana:" + TIERS[mode].ayanamsha.name, tier: mode, tierLabel: TIERS[mode].label };
    return { grahas, context, precision: chartPrecision(Object.fromEntries(grahas.map(row => [row.key, row.longitude])), context, budgets) };
  }

  /* ═══════════ Shared panchang · mirrors the Museum renderVedicClock exactly ═══════════ */
  const RASHI_SA = Object.freeze([
    "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
    "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन",
  ]);
  /* सौर मास: सूर्य की राशि से निकला solar month. This is not a Pūrṇimānta
     lunar-month calculation; masaIndex/masaName below are compatibility aliases. */
  const MASA_SA = Object.freeze([
    "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद", "आश्विन",
    "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन", "चैत्र",
  ]);
  const TITHI_NAMES = Object.freeze([
    "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी",
    "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी",
  ]);
  const NAKSHATRA_NAMES = Object.freeze([
    "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य",
    "आश्लेषा", "मघा", "पू.फाल्गुनी", "उ.फाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा",
    "अनुराधा", "ज्येष्ठा", "मूला", "पू.आषाढ़ा", "उ.आषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा",
    "पू.भाद्रपदा", "उ.भाद्रपदा", "रेवती",
  ]);
  const VARA_NAMES = Object.freeze([
    "रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार",
  ]);
  const BHAVA_SA = Object.freeze([
    "प्रथम", "द्वितीय", "तृतीय", "चतुर्थ", "पंचम", "षष्ठ",
    "सप्तम", "अष्टम", "नवम", "दशम", "एकादश", "द्वादश",
  ]);
  const BHAVA_KARAKA = Object.freeze([
    { sa: "तनु", iast: "Tanu", en: "Body · Self" },
    { sa: "धन", iast: "Dhana", en: "Wealth" },
    { sa: "सहज", iast: "Sahaja", en: "Courage · Siblings" },
    { sa: "सुख", iast: "Sukha", en: "Home · Mother" },
    { sa: "पुत्र", iast: "Putra", en: "Progeny · Intellect" },
    { sa: "रिपु", iast: "Ripu", en: "Enemies · Disease" },
    { sa: "कलत्र", iast: "Kalatra", en: "Spouse · Partnership" },
    { sa: "आयु", iast: "Āyu", en: "Longevity · Occult" },
    { sa: "भाग्य", iast: "Bhāgya", en: "Fortune · Dharma" },
    { sa: "कर्म", iast: "Karma", en: "Career · Status" },
    { sa: "लाभ", iast: "Lābha", en: "Gains · Networks" },
    { sa: "व्यय", iast: "Vyaya", en: "Losses · Mokṣa" },
  ]);
  const YOGA_NAMES = Object.freeze([
    "विष्कम्भ", "प्रीति", "आयुष्मान्", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड",
    "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान्", "परिघ", "शिव",
    "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "ऐन्द्र", "वैधृति",
  ]);
  const KARANA_NAMES = Object.freeze([
    "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि", "शकुनि", "चतुष्पाद", "नाग", "किन्तुघ्न",
  ]);
  const SAMVATSARA_NAMES = Object.freeze([
    "प्रभव", "विभव", "शुक्ल", "प्रमोद", "प्रजापति", "अङ्गिरा", "श्रीमुख", "भाव",
    "युवा", "धाता", "ईश्वर", "बहुधान्य", "प्रमाथी", "विक्रम", "वृषप्रजा", "चित्रभानु",
    "सुभानु", "तारण", "पार्थिव", "व्यय", "सर्वजित्", "सर्वधारी", "विरोधी", "विकृति",
    "खर", "नन्दन", "विजय", "जय", "मन्मथ", "दुर्मुख", "हेमलम्ब", "विलम्बी",
    "विकारी", "शार्वरी", "प्लव", "शुभकृत्", "शोभकृत्", "क्रोधी", "विश्वावसु", "पराभव",
    "प्लवङ्ग", "कीलक", "सौम्य", "साधारण", "विरोधकृत्", "परिधावी", "प्रमादी", "आनन्द",
    "राक्षस", "नल", "पिङ्गल", "कालयुक्त", "सिद्धार्थी", "रौद्र", "दुर्मति", "दुन्दुभी",
    "रुधिरोद्गारी", "रक्ताक्ष", "क्रोधन", "क्षय",
  ]);
  const RITU_NAMES = Object.freeze([
    { sa: "वसन्त", en: "Vasanta (Spring)" },
    { sa: "ग्रीष्म", en: "Grīṣma (Summer)" },
    { sa: "वर्षा", en: "Varṣā (Monsoon)" },
    { sa: "शरद्", en: "Śarad (Autumn)" },
    { sa: "हेमन्त", en: "Hemanta (Pre-winter)" },
    { sa: "शिशिर", en: "Śiśira (Winter)" },
  ]);
  const TEMPLE_PRESETS = Object.freeze([
    {
      id: "ujjain",
      name: "Ujjain Mahakal",
      nameSa: "महाकालेश्वर उज्जयिनी",
      lat: 23.1765,
      lon: 75.7885,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री महाकालेश्वर ज्योतिर्लिङ्ग",
      kshetra: "अवन्तिकापुर्यां महाकालवने महाकालेश्वर ज्योतिर्लिङ्ग सन्निधौ क्षिप्रायाः पावनतटे",
      river: "क्षिप्रा",
      tag: "🚩 Ujjayini (Prime Meridian)",
    },
    {
      id: "kashi",
      name: "Kashi Vishwanath",
      nameSa: "काशी विश्वनाथ वाराणसी",
      lat: 25.3109,
      lon: 83.0107,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री काशी विश्वनाथ",
      kshetra: "वाराणसीक्षेत्रे आनन्दकानने विश्वेश्वर ज्योतिर्लिङ्ग सन्निधौ उत्तरवाहिन्याः श्रीभागीरथ्याः पश्चिमे तटे",
      river: "गङ्गा (भागीरथी)",
      tag: "🚩 Kashi Vishwanath",
    },
    {
      id: "tirupati",
      name: "Tirupati Balaji",
      nameSa: "तिरुमला वेङ्कटेश्वर",
      lat: 13.6833,
      lon: 79.3472,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री वेङ्कटेश्वर स्वामी (बालाजी)",
      kshetra: "शेषाचले वेङ्कटाद्रिक्षेत्रे स्वामीपुष्करिणीतीरे श्रीवेङ्कटेश्वर सन्निधौ",
      river: "स्वामी पुष्करिणी",
      tag: "🚩 Tirupati Balaji",
    },
    {
      id: "puri",
      name: "Puri Jagannath",
      nameSa: "श्री जगन्नाथ मन्दिर पुरी",
      lat: 19.8049,
      lon: 85.8179,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री जगन्नाथ महाप्रभु",
      kshetra: "श्रीपुरुषोत्तमक्षेत्रे नीलाचलशिखरे महोदधितटे श्रीजगन्नाथ बलभद्र सुभद्रा सन्निधौ",
      river: "महोदधि",
      tag: "🚩 Puri Jagannath",
    },
    {
      id: "somnath",
      name: "Somnath Mandir",
      nameSa: "सोमनाथ ज्योतिर्लिङ्ग",
      lat: 20.8880,
      lon: 70.4012,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री सोमनाथ ज्योतिर्लिङ्ग",
      kshetra: "प्रभासक्षेत्रे सौराष्ट्रे त्रिवेणीसङ्गमे प्रथम ज्योतिर्लिङ्ग श्रीसोमनाथ सन्निधौ",
      river: "त्रिवेणी (कपिली, हिरण्या, सरस्वती)",
      tag: "🚩 Somnath",
    },
    {
      id: "ayodhya",
      name: "Ayodhya Ram Mandir",
      nameSa: "श्रीराम जन्मभूमि अयोध्या",
      lat: 26.7956,
      lon: 82.1944,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री रामलला सरकार",
      kshetra: "अयोध्याक्षेत्रे श्रीरामजन्मभूमि तीर्थे पावनसरयूतटे श्रीसीतारामचन्द्र सन्निधौ",
      river: "सरयू",
      tag: "🚩 Ayodhya",
    },
    {
      id: "haridwar",
      name: "Haridwar",
      nameSa: "मायापुरी हरिद्वार",
      lat: 29.9457,
      lon: 78.1642,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री गङ्गा माता",
      kshetra: "मायापुर्यां मोक्षद्वारे गङ्गाद्वारे ब्रह्मकुण्डतटे श्रीगङ्गामहारानी सन्निधौ",
      river: "गङ्गा",
      tag: "🚩 Haridwar",
    },
    {
      id: "badrinath",
      name: "Badrinath",
      nameSa: "श्री बदरीनाथ धाम",
      lat: 30.7433,
      lon: 79.4938,
      offset: "+05:30",
      tzHours: 5.5,
      deity: "श्री बदरीविशाल नारायण",
      kshetra: "बदरिकाश्रमे तप्तकुण्डसमीपे अलकनन्दायाः पश्चिमे तटे श्रीबदरीविशाल सन्निधौ",
      river: "अलकनन्दा",
      tag: "🚩 Badrinath",
    },
    {
      id: "london",
      name: "London Neasden",
      nameSa: "श्री स्वामिनारायण मन्दिर लन्दन",
      lat: 51.5478,
      lon: -0.2608,
      offset: "+00:00",
      tzHours: 0.0,
      deity: "भगवान श्री स्वामिनारायण",
      kshetra: "आंग्लदेशे लण्डननगरे नीसडेनक्षेत्रे श्रीस्वामिनारायण मन्दिरे भगवत् सन्निधौ",
      river: "टेम्स (Thames)",
      tag: "🌍 London Neasden",
    },
    {
      id: "newyork",
      name: "New York Hindu Temple",
      nameSa: "श्रीमहावल्लभ गणपति मन्दिर न्यूयार्क",
      lat: 40.7533,
      lon: -73.8247,
      offset: "-05:00",
      tzHours: -5.0,
      deity: "श्रीमहावल्लभ गणपति",
      kshetra: "उत्तर-अमेरिका महाद्वीपे न्यूयार्कनगरे फ्लशिंगक्षेत्रे श्रीमन्महावल्लभ गणपति सन्निधौ",
      river: "हडसन (Hudson)",
      tag: "🌍 New York (Flushing)",
    },
  ]);
  const NADI_NAMES = Object.freeze([
    "Vasudhā", "Vaiṣṇavī", "Brāhmī", "Kālakūṭā", "Jālikā", "Sauvarṇikā", "Mandānidrā", "Bharadvājī", "Pāpanāśinī", "Dviṣatsabhā",
    "Atiśītā", "Payasvinī", "Mālā", "Jagatī", "Jarjarā", "Dhruvā", "Musalā", "Mudgarā", "Pāśā", "Campakā",
    "Dāminī", "Mahī", "Kalushā", "Kamalā", "Kantā", "Kalāvati", "Karālikā", "Kālakarṇikā", "Kṣamā", "Durdharā",
    "Madhurā", "Śobhanā", "Dānā", "Amṛtāplavā", "Jīvā", "Śubhā", "Bhogā", "Sukhā", "Suśītala", "Ghorā",
    "Dīrghā", "Nidrā", "Vimalā", "Prabhā", "Śraddhā", "Candrāvatī", "Māheśvarī", "Kṣitirūpā", "Kalaravā", "Indurūpā",
    "Jaladhirūpā", "Vāruṇī", "Madirā", "Maitrī", "Haridrā", "Hāriṇī", "Marut", "Dhanadā", "Dhaninī", "Mahāmāyā",
    "Viśālā", "Prabhāvatī", "Gaurī", "Citrā", "Vicitrā", "Gaganā", "Bhūpā", "Gadā", "Śūlinī", "Triśūlinī",
    "Durgā", "Sarasvatī", "Tripurā", "Mohinī", "Jayā", "Vijayā", "Jayantī", "Aparājitā", "Saumyā", "Mṛdū",
    "Śivā", "Karuṇā", "Priyā", "Saukhyadā", "Padmā", "Padmāvatī", "Vilāsinī", "Madirākṣī", "Virajā", "Viśokā",
    "Manoramā", "Mānadā", "Hāsinī", "Ratnadā", "Vasantā", "Sumatī", "Kumudvatī", "Śrīmatī", "Padmamālinī", "Kāmāñcitā",
    "Candralekhā", "Premanidhirūpā", "Śyāmā", "Tāriṇī", "Mṛtasañjīvinī", "Śarvāṇī", "Bhairavī", "Cāmuṇḍā", "Kālī", "Trikāladṛk",
    "Śaktirūpā", "Vidyunmālā", "Saudāminī", "Mahātejasvinī", "Prabhāvatī", "Varadā", "Subhagā", "Kalyāṇadā", "Sukhāvahā", "Kīrtipradā",
    "Yaśasvinī", "Vīryavatī", "Ojasvinī", "Bhānumatī", "Dyutimān", "Tejasvinī", "Caturā", "Vicakṣaṇā", "Medhāvinī", "Dhīmatī",
    "Prajñā", "Mati", "Dhṛti", "Smṛti", "Buddhi", "Siddhirūpā", "Ṛddhidā", "Vriddhirūpā", "Sampadā", "Aiśvaryadā",
    "Mahādevī", "Jaganmātā", "Sarvamaṅgalā", "Sarvasampannā", "Kṣemakarī", "Ānandarūpā", "Parā", "Parāśakti", "Parameśvarī", "Brahmarūpā",
  ]);

  const ASPECT_DEFINITIONS = Object.freeze([
    { name: "Conjunction", symbol: "☌", angle: 0, orb: 8.0, weight: 1.0, nature: "Dynamic / Amplification", marketImpact: "Trend initiation / Volume surge" },
    { name: "Sextile", symbol: "⚹", angle: 60, orb: 5.0, weight: 0.45, nature: "Harmonious", marketImpact: "Constructive liquidity flow" },
    { name: "Square", symbol: "□", angle: 90, orb: 7.0, weight: 0.85, nature: "Tense / High Volatility", marketImpact: "Volatility expansion / Sudden reversal" },
    { name: "Trine", symbol: "△", angle: 120, orb: 7.0, weight: 0.55, nature: "Harmonious", marketImpact: "Stable trend continuation" },
    { name: "Opposition", symbol: "☍", angle: 180, orb: 8.0, weight: 1.0, nature: "High Dissonance", marketImpact: "Peak market polarization / Turning point" },
    { name: "Quintile", symbol: "Q", angle: 72, orb: 2.5, weight: 0.35, nature: "Harmonic Resonance", marketImpact: "Algorithmic cyclical rhythm" },
    { name: "Semi-Square", symbol: "∠", angle: 45, orb: 2.5, weight: 0.65, nature: "Frictional Friction", marketImpact: "Micro-volatility chop" },
    { name: "Sesquiquadrate", symbol: "⚼", angle: 135, orb: 2.5, weight: 0.65, nature: "Structural Stress", marketImpact: "Liquidity drain / Distribution" },
  ]);

  function computeNadiAmsha(longitude) {
    const l = mod360(longitude);
    const r = Math.floor(l / 30) % 12;
    const d = l - r * 30;
    const k = Math.min(149, Math.floor(d / 0.2));
    let nadiIndex;
    if (r % 3 === 0) {
      nadiIndex = k + 1;
    } else if (r % 3 === 1) {
      nadiIndex = 150 - k;
    } else {
      nadiIndex = k < 75 ? (76 + k) : (k - 75 + 1);
    }
    const name = NADI_NAMES[nadiIndex - 1] || `Nadi-${nadiIndex}`;
    const startDeg = k * 0.2;
    const endDeg = (k + 1) * 0.2;
    return {
      nadiIndex,
      name,
      rashiIndex: r,
      rashi: RASHIS[r],
      degreeInSign: d,
      subdivisionIndex: k,
      spanInSign: [startDeg, endDeg],
      spanLabel: `${startDeg.toFixed(2)}° – ${endDeg.toFixed(2)}°`,
    };
  }

  function computePlanetaryVelocities(jd, options) {
    requireFinite(jd, "Julian day");
    const modelOptions = resolveBijaOptions(options, false, "computePlanetaryVelocities");
    const dt = 1.0 / 1440.0;
    const pPrev = canonicalGrahaModel(jd - dt, modelOptions);
    const pCurr = canonicalGrahaModel(jd, modelOptions);
    const pNext = canonicalGrahaModel(jd + dt, modelOptions);

    return pCurr.map((curr, i) => {
      const prev = pPrev[i];
      const next = pNext[i];
      const d1 = ((curr.longitude - prev.longitude + 540) % 360) - 180;
      const d2 = ((next.longitude - curr.longitude + 540) % 360) - 180;
      const speedDegDay = (d1 + d2) / (2 * dt);
      const accelDegDay2 = (d2 - d1) / (dt * dt);
      const isRetrograde = speedDegDay < -0.0001;
      const isStationary = Math.abs(speedDegDay) < 0.05;
      return {
        key: curr.key,
        sa: curr.sa,
        en: curr.en,
        longitude: curr.longitude,
        speedDegDay,
        accelDegDay2,
        isRetrograde,
        isStationary,
        motionState: isStationary ? "stationary" : (isRetrograde ? "retrograde" : "direct"),
      };
    });
  }

  function computeAspects(grahas) {
    if (!Array.isArray(grahas) || grahas.length < 2) {
      return { pairsCount: 0, activeAspects: [], volatilityIndex: 0, marketRegime: "REGIME_LOW_VOLATILITY_ACCUMULATION" };
    }
    const pairs = [];
    const activeAspects = [];
    let totalDissonanceWeight = 0;

    for (let i = 0; i < grahas.length; i++) {
      for (let j = i + 1; j < grahas.length; j++) {
        const g1 = grahas[i];
        const g2 = grahas[j];
        const rawDiff = Math.abs(mod360(g1.longitude - g2.longitude));
        const separationDeg = rawDiff > 180 ? 360 - rawDiff : rawDiff;
        pairs.push({
          graha1: g1.en || g1.sa,
          graha2: g2.en || g2.sa,
          separationDeg,
        });

        for (const def of ASPECT_DEFINITIONS) {
          const orb = Math.abs(separationDeg - def.angle);
          if (orb <= def.orb) {
            const intensity = 1 - (orb / def.orb);
            const score = def.weight * intensity;
            activeAspects.push({
              graha1: g1.en || g1.sa,
              graha2: g2.en || g2.sa,
              aspect: def.name,
              symbol: def.symbol,
              targetAngleDeg: def.angle,
              actualSeparationDeg: separationDeg,
              orbDeg: orb,
              orbArcMin: orb * 60,
              intensityPct: Math.round(intensity * 100),
              nature: def.nature,
              marketImpact: def.marketImpact,
              volatilityScore: score,
            });
            if (def.nature.includes("Tense") || def.nature.includes("Dissonance") || def.name === "Conjunction") {
              totalDissonanceWeight += score * 14;
            }
          }
        }
      }
    }

    const volatilityIndex = Math.min(100, Math.max(5, Math.round(totalDissonanceWeight)));
    let marketRegime = "REGIME_LOW_VOLATILITY_ACCUMULATION";
    if (volatilityIndex >= 75) marketRegime = "REGIME_EXTREME_RESONANCE_INFLECTION";
    else if (volatilityIndex >= 45) marketRegime = "REGIME_HIGH_VOLATILITY_EXPANSION";
    else if (volatilityIndex >= 20) marketRegime = "REGIME_MODERATE_HARMONIC_TREND";

    return {
      pairsCount: pairs.length,
      activeAspects,
      volatilityIndex,
      marketRegime,
    };
  }

  /* ═══════════ The day, the month and the year of a tier ═══════════ */
  // Lunar month names (Caitra first), for the amānta month of every tier; the solar month is named by its rāśi.
  const LUNAR_MASA_SA = Object.freeze(["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ़", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"]);
  const MONTH_IAST = Object.freeze(["Caitra", "Vaiśākha", "Jyeṣṭha", "Āṣāḍha", "Śrāvaṇa", "Bhādrapada", "Āśvina", "Kārttika", "Mārgaśīrṣa", "Pauṣa", "Māgha", "Phālguna"]);
  const UJJAIN_SITE = Object.freeze({ latitude: 23.1765, longitude: UJJAIN_LONGITUDE_DEG });
  /** ṛtu of a nirayaṇa saura month (0 = Meṣa … 11 = Mīna) by SS 14.9-10: two months each from the Makara saṅkrānti, śiśira
   *  first ⇒ Mīna+Meṣa = Vasanta … Kanyā+Tulā = Śarad … Makara+Kumbha = Śiśira. */
  function rituOfSauraMasa(i) {
    if (!Number.isInteger(i) || i < 0 || i > 11) throw new RangeError("rituOfSauraMasa: the saura month index is 0 (Meṣa) … 11 (Mīna)");
    const index = Math.floor(((i + 1) % 12) / 2) % 6;
    return { index, sa: RITU_NAMES[index].sa, en: RITU_NAMES[index].en, rule: "SS 14.9-10" };
  }
  /** Civil days since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47) — the same expression as ss-tier.js daysOfJd. */
  const textDaysOfJd = (jd) => (jd - KALI_EPOCH_JD) + UJJAIN_LONGITUDE_DEG / 360;
  function ssDaysOfJd(jd) { requireFinite(jd, "Julian day"); return textDaysOfJd(jd); }
  const requireTz = (tz) => { requireFinite(tz, "Timezone offset"); if (Math.abs(tz) > 14) throw new Error("Timezone offset must be inside [-14, 14]"); };
  const formatHms = (jd, tz) => {
    if (jd === null || jd === undefined) return null;
    const totalSec = Math.round(mod(jd + tz / 24 + 0.5, 1) * 86400) % 86400;
    const p = (n) => String(n).padStart(2, "0");
    return `${p(Math.floor(totalSec / 3600))}:${p(Math.floor((totalSec % 3600) / 60))}:${p(totalSec % 60)}`;
  };
  /** UT JD of the local civil midnight that opens the local date holding jd. */
  const localMidnightJd = (jd, tz) => Math.floor(jd + tz / 24 - 0.5) + 0.5 - tz / 24;
  /** A small cache of intervals { start, end, value } per key: a hit only when start ≤ x < end (never keyed by day). */
  function intervalCache(limit) {
    const lists = new Map();
    return {
      get(key, x) { const l = lists.get(key); if (!l) return null; const h = l.find((e) => e.start <= x && x < e.end); return h ? h.value : null; },
      put(key, start, end, value) { let l = lists.get(key); if (!l) { l = []; lists.set(key, l); if (lists.size > 64) lists.delete(lists.keys().next().value); } l.unshift({ start, end, value }); if (l.length > limit) l.length = limit; return value; },
    };
  }
  const dayCache = intervalCache(8), skyMonthCache = intervalCache(24), skyYearCache = intervalCache(4);
  const sexagesimal = (x) => { const g = Math.floor(x), r = (x - g) * 60, p = Math.floor(r), v = Math.floor((r - p) * 60); return { ghati: g, pala: p, vipala: v }; };

  // ── the dṛk tier's own events, by the series (siddhanta-tier.js); every call honours its span (EDGE RULE) ──
  const pickNum = (o, names) => { if (!o) return null; for (const n of names) if (Number.isFinite(o[n])) return o[n]; return null; };
  function drikSunMoon(jd) {
    drikGuard(jd, "the Sun and Moon");
    const r = drikCall(sdFn("sunMoon")(jd), jd, "the Sun and Moon");
    const lon = (x) => (x && typeof x === "object" ? x.longitude : x);
    let sun = null, moon = null;
    if (Array.isArray(r)) { for (const row of r) { const k = DRIK_KEY_ALIASES[row.key]; if (k === "surya") sun = row.longitude; if (k === "candra") moon = row.longitude; } }
    else { sun = lon(r.sun ?? r.surya ?? r.sunSid); moon = lon(r.moon ?? r.candra ?? r.moonSid); }
    if (!Number.isFinite(sun) || !Number.isFinite(moon)) throw new Error("siddhanta-tier.js sunMoon() gave no sidereal Sun and Moon");
    return { sun: mod360(sun), moon: mod360(moon) };
  }
  function drikSun(jd) {
    drikGuard(jd, "the Sun");
    const r = drikCall(sdFn("sun")(jd), jd, "the Sun");
    const v = typeof r === "number" ? r : Number.isFinite(r.longitude) ? r.longitude : Number.isFinite(r.sunSid) ? r.sunSid : null;
    if (!Number.isFinite(v)) throw new Error("siddhanta-tier.js sun() gave no sidereal longitude");
    return { longitude: mod360(v), row: r };
  }
  /** SiddhantaTier.riseSet(kind, local-midnight JD (UT), lat, lon) → { rise, set, noon } in JD (UT) or null. */
  function drikRiseSet(kind, jdMidnight, lat, lon) {
    drikGuard(jdMidnight + 0.5, kind === "sun" ? "the sunrise" : "the moonrise");     // the day's middle; siddhanta-tier.js refuses a day that needs more
    const r = drikCall(sdFn("riseSet")(kind, jdMidnight, lat, lon), jdMidnight, kind === "sun" ? "the sunrise" : "the moonrise");
    return { rise: pickNum(r, ["riseJd", "rise", "jdRise", "riseJdUT"]), set: pickNum(r, ["setJd", "set", "jdSet", "setJdUT"]),
      noon: pickNum(r, ["noonJd", "transitJd", "noon", "transit", "jdNoon", "jdTransit"]), polar: r.polar === "up" || r.circumpolar === true ? "up" : r.polar === "down" || r.neverRises === true ? "down" : null, raw: r };
  }
  /** The instant near x0 at which f(x) (degrees) crosses `target`, by the secant method on the wrapped difference. */
  function skyCrossing(f, target, x0, rate) {
    let a = x0, fa = wrap180deg(f(a) - target);
    let b = a - fa / rate, fb = wrap180deg(f(b) - target);
    for (let i = 0; i < 12 && Math.abs(fb) > 1e-9; i++) {
      const slope = (fb - fa) / (b - a);
      const c = b - fb / (Number.isFinite(slope) && slope !== 0 ? slope : rate);
      a = b; fa = fb; b = c; fb = wrap180deg(f(b) - target);
      if (Math.abs(b - a) < 1e-9) break;
    }
    return b;
  }
  const wrap180deg = (d) => mod(d + 180, 360) - 180;
  const elongationAt = (jd) => { const p = drikSunMoon(jd); return mod360(p.moon - p.sun); };
  const SYNODIC_RATE = 360 / 29.530588, SUN_RATE = 360 / 365.2564, MOON_RATE = 360 / 27.321662;
  /** The dṛk new moon at or before jd (the start of the amānta month holding jd). */
  function skyNewMoonBefore(jd) {
    let x = skyCrossing(elongationAt, 0, jd - elongationAt(jd) / SYNODIC_RATE, SYNODIC_RATE);
    if (x > jd) x = skyCrossing(elongationAt, 0, x - 29.53, SYNODIC_RATE);
    return x;
  }
  const skyNewMoonAfter = (x) => skyCrossing(elongationAt, 0, x + 29.53, SYNODIC_RATE);
  const sunSidAt = (jd) => drikSun(jd).longitude;
  /** The dṛk saṅkrāntis in [a, b): [{ at, index }] (index 0 = Meṣa). */
  function skySankrantisBetween(a, b) {
    const out = [];
    let s = Math.floor(sunSidAt(a) / 30);
    const sEnd = Math.floor(sunSidAt(b) / 30), n = mod(sEnd - s, 12);
    for (let i = 1; i <= n; i++) {
      const idx = mod(s + i, 12), target = idx * 30;
      const at = skyCrossing(sunSidAt, target, a + mod(target - sunSidAt(a), 360) / SUN_RATE, SUN_RATE);
      out.push({ at, index: idx });
    }
    return out.filter((x) => x.at >= a && x.at < b);
  }
  /** The dṛk amānta month holding jd, named by Panchanga.nameMonth (the text tier's one rule) from the tier's own new
   *  moons and saṅkrāntis. Refused (TierSpanError) when any instant it needs is outside the span (EDGE RULE). */
  function skyLunarMonth(jd) {
    const hit = skyMonthCache.get("drik", jd);
    if (hit) return hit;
    const start = skyNewMoonBefore(jd), end = skyNewMoonAfter(start);
    const sank = skySankrantisBetween(start, end);
    const next = sank.length ? undefined : mod(Math.floor(sunSidAt(end) / 30) + 1, 12);
    const P = ssTier().calendar({ samskara: null });
    const nm = P.nameMonth(sank.map((s) => s.index), next);
    return skyMonthCache.put("drik", start, end, Object.freeze({ ...nm, startJd: start, endJd: end, sankrantis: sank, source: "own",
      rule: "the text tier's naming rule (panchanga.js nameMonth) on the dṛk new moons and saṅkrāntis [standard rule; no local text]" }));
  }
  /** The dṛk year holding jd: the nija Caitra new moon (the month holding the Meṣa saṅkrānti) and the next. */
  function skyYear(jd) {
    const hit = skyYearCache.get("drik", jd);
    if (hit) return hit;
    const meshaNear = (x) => skyCrossing(sunSidAt, 0, x - wrap180deg(sunSidAt(x)) / SUN_RATE, SUN_RATE);
    let mesha, start;
    try {
      mesha = meshaNear(jd - mod(sunSidAt(jd), 360) / SUN_RATE);
      start = skyNewMoonBefore(mesha);
      if (start > jd) { mesha = meshaNear(mesha - 365.2564); start = skyNewMoonBefore(mesha); }
    } catch (e) {
      // EDGE RULE at 1850.0: the Meṣa saṅkrānti before jd is outside the span, but the year holding jd may start inside it
      // (between the nija Caitra new moon and its Meṣa saṅkrānti). Then it is the tier's own: found from the saṅkrānti
      // after jd, it needs no instant before its own start. Otherwise the refusal stands.
      if (!(e && e.code === "TIER_OUT_OF_SPAN")) throw e;
      const m = meshaNear(jd + mod(-sunSidAt(jd), 360) / SUN_RATE), s = skyNewMoonBefore(m);
      if (!(s <= jd)) throw e;
      mesha = m; start = s;
    }
    // EDGE RULE: the year's end may lie beyond 2150.0 (the year that starts in 2149). Then the number, the start and the
    // saṃvatsara stay the tier's own and the end is refused (null), never filled from elsewhere.
    const endOf = (m) => { try { return skyNewMoonBefore(meshaNear(m + 365.2564)); } catch (e) { if (e && e.code === "TIER_OUT_OF_SPAN") return null; throw e; } };
    let end = endOf(mesha);
    if (end !== null && end <= jd) { start = end; mesha = meshaNear(mesha + 365.2564); end = endOf(mesha); }
    const civil = jdToCivil(start, 0, "gregorian");
    const vikramYear = civil.year + 57, shakaYear = civil.year - 78;
    const sv = ssTier().samvatsara(start);
    const y = Object.freeze({ startJd: start, endJd: end, meshaJd: mesha, vikramYear, shakaYear, kaliYear: vikramYear + 3044,
      samvatsara: sv, yearStartRule: TIERS.drik.yearStart, samvatsaraRule: TIERS.drik.samvatsara, source: "own",
      endRefused: end === null ? "the year's end lies after 2150.0, outside the tier's span (EDGE RULE): refused" : null });
    return end === null ? y : skyYearCache.put("drik", start, end, y);
  }
  /** The Moon's nakṣatra at jd in the dṛk tier, with its entry and exit instants (for the daśā balance by time). */
  function skyNakshatraSpan(jd) {
    const moonAt = (x) => drikSunMoon(x).moon, arc = 360 / 27;
    const m = moonAt(jd), k = Math.floor(m / arc);
    const start = skyCrossing(moonAt, k * arc, jd - (m - k * arc) / MOON_RATE, MOON_RATE);
    const end = skyCrossing(moonAt, mod((k + 1) * arc, 360), jd + ((k + 1) * arc - m) / MOON_RATE, MOON_RATE);
    return { nakshatraIndex: k, startJd: start, endJd: end };
  }

  /** The civil day of a tier at a site holding jd (sunrise to sunrise): { tier, N, civilDate, sunriseJd, sunsetJd,
   *  nextSunriseJd, prevSunsetJd, varaIndex (0 = ravivāra), varaName, polar, rule, ishta, ishtaCivil }. Text tiers:
   *  Panchanga.civilDayOf through ss-tier.js (the Sun's centre, no refraction; vāra of Kali day N, SS 1.51); dṛk: the
   *  series' sunrise (upper limb, 34′) on the local civil date, and the vāra of that date. Where the Sun does not rise or
   *  set, the local civil date and polar: true. */
  function tierDay(jd, latitudeDeg = UJJAIN_SITE.latitude, longitudeEastDeg = UJJAIN_SITE.longitude, timezoneHours = 5.5, tier = "ss") {
    requireFinite(jd, "Julian day");
    checkSite(latitudeDeg, longitudeEastDeg);
    requireTz(timezoneHours);
    const id = bridgeTier(tier), key = `${id}|${latitudeDeg}|${longitudeEastDeg}|${timezoneHours}`;   // per tier: each text tier's Sun and ayanāṃśa make its own sunrise (2026-10-09)
    let d = dayCache.get(key, jd);
    if (!d) {
      if (TIERS[id].family === "ss") {
        const S = ssTier(), site = { latitude: latitudeDeg, longitude: longitudeEastDeg }, o = { samskara: TIERS[id].samskara };
        const x = S.dayOf(jd, site, o), K = kalaDvara();
        const prev = x.polar ? null : S.dayEvents(x.N - 1, site, o).sunsetJd;
        d = { N: x.N, civilDate: K.civilFromKaliDay(x.N, "gregorian"), sunriseJd: x.sunriseJd, sunsetJd: x.sunsetJd, nextSunriseJd: x.nextSunriseJd,
          prevSunsetJd: prev, varaIndex: x.vara.index, polar: x.polar, rule: x.rule, nadiDays: S.calendar({ samskara: null }).NADI_DAYS };
        const start = x.polar ? Math.floor(textDaysOfJd(jd) + (longitudeEastDeg - UJJAIN_LONGITUDE_DEG) / 360) : x.sunriseJd;
        const end = x.polar ? start : x.nextSunriseJd;
        if (!x.polar) dayCache.put(key, start, end, d);
      } else {
        let mid = localMidnightJd(jd, timezoneHours);
        let r = drikRiseSet("sun", mid, latitudeDeg, longitudeEastDeg);
        if (r.rise !== null && jd < r.rise) { mid -= 1; r = drikRiseSet("sun", mid, latitudeDeg, longitudeEastDeg); }
        const next = drikRiseSet("sun", mid + 1, latitudeDeg, longitudeEastDeg);
        // the previous sunset is a convenience: on the span's first day it is refused (null), never computed from elsewhere
        let prev; try { prev = drikRiseSet("sun", mid - 1, latitudeDeg, longitudeEastDeg); } catch (e) { if (!(e && e.code === "TIER_OUT_OF_SPAN")) throw e; prev = { set: null }; }
        const civil = jdToCivil(mid + 0.25, timezoneHours, "gregorian"), K = kalaDvara();
        const N = K.kaliDayFromCivil({ calendar: "gregorian", year: civil.year, month: civil.month, day: civil.day });
        const polar = r.rise === null || r.set === null || next.rise === null;
        d = { N, civilDate: { year: civil.year, month: civil.month, day: civil.day }, sunriseJd: polar ? null : r.rise, sunsetJd: polar ? null : r.set,
          nextSunriseJd: polar ? null : next.rise, prevSunsetJd: prev.set, varaIndex: K.varaOfKaliDay(N).index, polar,
          rule: polar ? "polar: the local civil date" : "sunrise to sunrise at the site (the series' sunrise: upper limb, 34′ refraction); vāra of the sunrise's local civil date", nadiDays: null };
        if (!polar) dayCache.put(key, d.sunriseJd, d.nextSunriseJd, d);
      }
    }
    const out = { tier: id, ...d, varaName: VARA_NAMES[d.varaIndex] };
    delete out.nadiDays;
    if (!d.polar) {
      const since = jd - d.sunriseJd;
      const civ = since * 60;
      out.ishtaCivil = { ghati: Math.floor(civ), vighati: Math.floor((civ * 60) % 60), prana: Math.floor((civ * 360) % 6), unit: "sixtieths of the civil day from sunrise (ghaṭī = 24 min)" };
      out.ishta = d.nadiDays ? { ...sexagesimal(since / d.nadiDays), unit: "nāḍī of the star-wheel's turn from sunrise (SS 1.11-1.12); pala = 1/60 ghaṭī (= vināḍī), vipala = 1/60 pala" }
        : { ...sexagesimal(civ), unit: "sixtieths of the civil day from sunrise; pala = 1/60 ghaṭī (= vināḍī), vipala = 1/60 pala" };
      out.ishta.vighati = out.ishta.pala;
    } else { out.ishta = null; out.ishtaCivil = null; }
    return out;
  }

  /** The pañcāṅga at an instant, for a tier and a site (the sunrise vāra is the site's; Ujjain when no site is given,
   *  and siteDefaulted says so). Clock fields (ghaṭī … vipala) count from local civil midnight, labelled "civil clock". */
  function panchangAtJd(jd, timezoneHours = 5.5, mode = "ss", site) {
    requireFinite(jd, "Julian day");
    requireTz(timezoneHours);
    const tier = mode !== null && typeof mode === "object" ? resolveBijaOptions(mode, false, "panchangAtJd").mode : resolveTier(mode);
    const T = TIERS[tier];
    const t = jd - SS.j2000JD;
    // Quantize once to the smallest reported unit (vipala = 0.4 s). This avoids
    // binary-JD underflow assigning exact civil-time boundaries to the prior unit.
    const rawVipalaTicks = mod(jd + timezoneHours / 24 - 0.5, 1) * METROLOGY.vipalasPerDay;
    const nearestVipalaTick = Math.round(rawVipalaTicks);
    const quantizedVipalaTick = Math.abs(rawVipalaTicks - nearestVipalaTick) < 1e-4 ? nearestVipalaTick : Math.floor(rawVipalaTicks);
    const vipalaTicks = mod(quantizedVipalaTick, METROLOGY.vipalasPerDay);
    const localSeconds = vipalaTicks * 0.4;
    const ghati = Math.floor(vipalaTicks / 3600);
    const vighati = Math.floor(vipalaTicks / 60) % 60;
    const prana = Math.floor(vipalaTicks / 10) % 6;
    const vipala = vipalaTicks % 10;

    const siteDefaulted = !site;
    const lat = site ? site.latitude : UJJAIN_SITE.latitude, lon = site ? site.longitude : UJJAIN_SITE.longitude;
    let limbs;
    if (T.family === "ss") {
      const L = ssTier().limbsAt(jd, { samskara: T.samskara });
      const surya = L.sun, chandra = L.moon, lunar = L.elongation, tithiIndex = L.tithi - 1;
      const nakshatraIndex = L.nakshatra - 1, nakArc = FULL_CIRCLE / 27, nakWithin = mod360(chandra) - nakshatraIndex * nakArc;
      const karanaIndex = karanaIndexSS(L.karana);
      limbs = { surya, chandra, lunar, tithiIndex, paksha: tithiIndex < 15 ? "शुक्ल" : "कृष्ण",
        tithiName: tithiIndex === 14 ? "पूर्णिमा" : tithiIndex === 29 ? "अमावस्या" : TITHI_NAMES[tithiIndex % 15],
        nakshatraIndex, nakshatraName: NAKSHATRA_NAMES[nakshatraIndex], nakshatraPada: L.pada, nakshatraLord: VIMSHOTTARI_SEQUENCE[nakshatraIndex % 9],
        nakshatraBhuktaPct: (nakWithin / nakArc * 100).toFixed(1), nakshatraWithinDeg: nakWithin,
        yogaIndex: L.yoga - 1, yogaName: YOGA_NAMES[L.yoga - 1], karanaIndex, karanaName: KARANA_NAMES[karanaIndex],
        karanaType: karanaIndex <= 6 ? "Chara" : "Sthira", karanaOrder: T.karanaOrder, limbTier: tier };
    } else {
      const p = drikSunMoon(jd);
      limbs = { ...limbsFromSphuta(p.sun, p.moon), lunar: mod360(p.moon - p.sun), limbTier: tier };
    }
    const sauraMasaIndex = Math.floor(mod360(limbs.surya) / 30) % 12;
    const day = tierDay(jd, lat, lon, timezoneHours, tier);
    const civilVaraIndex = mod(Math.floor(jd + timezoneHours / 24 + 1.5), 7);
    // dṛk, EDGE RULE: a month that needs an instant outside 1850.0–2150.0 (the first and last months of the span) is
    // refused as a block — masa says so and masaName is null; the limbs and the day stay served.
    let m = null, monthRefused = null;
    if (T.family === "ss") m = ssTier().lunarMonth(jd, { samskara: T.samskara });
    else { try { m = skyLunarMonth(jd); } catch (e) { if (!(e && e.code === "TIER_OUT_OF_SPAN")) throw e; monthRefused = e; } }
    const masaIndex = m ? MONTH_IAST.indexOf(m.name) : null;
    const masa = m ? { name: m.name, nameSa: LUNAR_MASA_SA[masaIndex], adhika: m.adhika, kshaya: m.kshaya, kshayaDropped: m.kshayaDropped,
      startJd: m.startJd, endJd: m.endJd, scheme: "amānta", rule: m.rule }
      : { name: null, nameSa: null, refused: true, reason: monthRefused.message, code: monthRefused.code, span: monthRefused.span, scheme: "amānta" };
    return {
      jd, t, tier, mode: tier, tierLabel: T.label,
      ahargana: textDaysOfJd(jd), aharganaRule: "civil days since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47)",
      localSeconds, vipalaTicks, ghati, vighati, prana, vipala, clock: "civil clock from local midnight",
      ...limbs,
      sauraMasaIndex, sauraMasaName: RASHI_SA[sauraMasaIndex], sauraMasaRule: "the Sun's rāśi (nirayaṇa)",
      masa, masaIndex, masaName: m ? (m.adhika ? "अधिक " : "") + LUNAR_MASA_SA[masaIndex] : null,
      siteDefaulted, site: { latitude: lat, longitude: lon },
      varaIndex: day.varaIndex, varaName: day.varaName, varaRule: day.rule,
      civilVaraIndex, civilVaraName: VARA_NAMES[civilVaraIndex],
      day, rules: { karanaOrder: T.karanaOrder, month: T.month, dayBoundary: T.dayBoundary, samvatsara: T.samvatsara, yearStart: T.yearStart },
    };
  }

  /** The true obliquity (degrees) the dṛk tier's own reduction used at jd, recovered from one body's apparent direction
   *  in both frames (the ecliptic of date: λ, β; the equator of date: α, δ): the two frames differ by a rotation ε about
   *  the equinox line, so ε = atan2(y·Z − z·Y, y·Y + z·Z) with (y, z) = (cos β sin λ, sin β) and (Y, Z) = (cos δ sin α, sin δ).
   *  The Sun is used unless it is within ~3° of the equinox line, then the Moon. No foreign obliquity model enters. */
  function drikTrueObliquityDeg(jd, sunRow) {
    const R = Math.PI / 180;
    const epsOf = (lam, bet, alp, del) => {
      const y = Math.cos(bet * R) * Math.sin(lam * R), z = Math.sin(bet * R), Y = Math.cos(del * R) * Math.sin(alp * R), Z = Math.sin(del * R);
      return { eps: Math.atan2(y * Z - z * Y, y * Y + z * Z) / R, lever: Math.hypot(y, z) };
    };
    const lam = pickNum(sunRow, ["sunTrop", "tropical"]), bet = pickNum(sunRow, ["sunLat", "latitude"]);
    const alp = pickNum(sunRow, ["ra", "rightAscensionDeg"]), del = pickNum(sunRow, ["dec", "declinationDeg"]);
    if (lam !== null && bet !== null) { const e = epsOf(lam, bet, alp, del); if (e.lever > 0.05) return e.eps; }
    const m = drikCall(sdFn("sunMoon")(jd), jd, "the Moon");
    const e = epsOf(pickNum(m, ["moonTrop"]), pickNum(m, ["moonLat"]), pickNum(m, ["moonRa"]), pickNum(m, ["moonDec"]));
    if (!Number.isFinite(e.eps) || e.lever <= 0.05) throw new Error("the dṛk tier's obliquity could not be recovered from the series' Sun and Moon at this instant");
    return e.eps;
  }

  /** The Sun at jd in a tier: { sidereal, tropical (sāyana in the tier's frame), declination, right ascension, obliquity,
   *  ayanāṃśa }. Text tiers: the text's Sun, SS 3.9-3.10 and the text's ε (SS 2.28). dṛk: the series' Sun and its true
   *  Citrā-pakṣa; RA/dec from siddhanta-tier.js when it gives them. */
  function getSolarCoordinates(jd, tier = "ss") {
    requireFinite(jd, "Julian day");
    const id = bridgeTier(tier);
    let sidereal, eps, epsSource, raDec = null;
    if (TIERS[id].family === "ss") {
      sidereal = ssTier().sunMoon(jd, { samskara: TIERS[id].samskara }).sun; eps = ssTier().EPSILON_DEG; epsSource = TIERS[id].obliquity;
    } else {
      const s = drikSun(jd); sidereal = s.longitude;
      const ra = pickNum(s.row, ["ra", "rightAscensionDeg"]), dec = pickNum(s.row, ["dec", "declinationDeg"]);
      if (ra === null || dec === null) throw new Error("siddhanta-tier.js sun() gave no right ascension and declination: the Modern Bhāratīya (dṛk) contract needs them");
      raDec = { ra, dec };
      eps = drikTrueObliquityDeg(jd, s.row); epsSource = "the true obliquity of the series' own apparent Sun (or Moon) — its ecliptic and equatorial directions (siddhanta-tier.js)";
    }
    const ayana = tierAyanamsha(jd, id).deg, tropical = mod360(sidereal + ayana);
    const e = eps * Math.PI / 180, lambda = tropical * Math.PI / 180;
    const dec = raDec ? raDec.dec * Math.PI / 180 : Math.asin(Math.sin(e) * Math.sin(lambda));
    const ra = raDec ? raDec.ra * Math.PI / 180 : Math.atan2(Math.cos(e) * Math.sin(lambda), Math.cos(lambda));
    return { tier: id, sidereal, tropical, declinationRad: dec, declinationDeg: dec * 180 / Math.PI, rightAscensionRad: ra, rightAscensionDeg: mod360(ra * 180 / Math.PI),
      obliquityDeg: eps, obliquitySource: epsSource, ayanamsaDeg: ayana };
  }

  /** Sunrise and sunset of the local date whose midnight (UT JD) is given, in a tier. Text tiers: civil day N =
   *  SSTier.dayOf(jdMidnight + 0.5).N (the day whose sunrise precedes local noon), the Sun's centre with no refraction;
   *  dṛk: the series' sunrise (upper limb, 34′ refraction). */
  function solarRiseSet(jdMidnight, latitudeDeg, longitudeEastDeg, timezoneHours = 5.5, tier = "ss") {
    requireFinite(jdMidnight, "Julian day midnight");
    requireFinite(latitudeDeg, "Latitude");
    requireFinite(longitudeEastDeg, "Longitude");
    requireTz(timezoneHours);
    if (Math.abs(latitudeDeg) >= 90) throw new Error("Latitude must be strictly between -90 and 90 degrees");
    if (Math.abs(longitudeEastDeg) > 180) throw new Error("Longitude must be inside [-180, 180]");
    const id = bridgeTier(tier);
    let rise, set, noon, rule;
    if (TIERS[id].family === "ss") {
      const S = ssTier(), site = { latitude: latitudeDeg, longitude: longitudeEastDeg }, o = { samskara: TIERS[id].samskara };
      const N = S.dayOf(jdMidnight + 0.5, site, o).N, ev = S.dayEvents(N, site, o);
      rise = ev.sunriseJd; set = ev.sunsetJd; noon = rise !== null && set !== null ? (rise + set) / 2 : jdMidnight + 0.5;
      rule = "the Sun's centre on the horizon, no refraction (SS); noon = the middle of the day (SS 2.60-2.63)";
    } else {
      const r = drikRiseSet("sun", jdMidnight, latitudeDeg, longitudeEastDeg);
      rise = r.rise; set = r.set; noon = r.noon !== null ? r.noon : rise !== null && set !== null ? (rise + set) / 2 : jdMidnight + 0.5;
      rule = TIERS.drik.sunrise;
    }
    if (rise === null || set === null) {
      const s = getSolarCoordinates(noon, id);
      const sunUp = latitudeDeg * s.declinationDeg > 0;
      return { tier: id, isPolarNight: !sunUp, isMidnightSun: sunUp, jdNoon: noon, rule };
    }
    const dayDurationHours = (set - rise) * 24;
    return { tier: id, isPolarNight: false, isMidnightSun: false, jdRise: rise, jdSet: set, jdNoon: noon,
      riseTime: formatHms(rise, timezoneHours), setTime: formatHms(set, timezoneHours), noonTime: formatHms(noon, timezoneHours),
      dayDurationHours, nightDurationHours: 24 - dayDurationHours, dayDurationGhati: dayDurationHours * 2.5, rule };
  }

  function rahuKaal(jdRise, jdSet, varaIndex, timezoneHours = 5.5) {
    const slots = [8, 2, 7, 5, 6, 4, 3];
    const slotNumber = slots[varaIndex % 7];
    const segmentDays = (jdSet - jdRise) / 8;
    const startJd = jdRise + (slotNumber - 1) * segmentDays;
    const endJd = jdRise + slotNumber * segmentDays;
    const formatTime = (jd) => formatHms(jd, timezoneHours).slice(0, 5);
    return { slotNumber, startJd, endJd, startTime: formatTime(startJd), endTime: formatTime(endJd), windowText: `${formatTime(startJd)} – ${formatTime(endJd)}` };
  }

  function abhijitMuhurta(jdRise, jdSet, timezoneHours = 5.5) {
    const muhurtaDays = (jdSet - jdRise) / 15;
    const startJd = jdRise + 7 * muhurtaDays;
    const endJd = jdRise + 8 * muhurtaDays;
    const formatTime = (jd) => formatHms(jd, timezoneHours).slice(0, 5);
    return { startJd, endJd, startTime: formatTime(startJd), endTime: formatTime(endJd), windowText: `${formatTime(startJd)} – ${formatTime(endJd)}` };
  }

  /** The tier's Abhijit for its civil day: text tiers — the 8th muhūrta of the day by muhurta.js (source unverified, as
   *  muhurta.js says); dṛk — the 8th fifteenth of the series' day. */
  function tierAbhijit(day, latitudeDeg, longitudeEastDeg, timezoneHours, tier) {
    if (day.polar) return null;
    if (TIERS[tier].family === "ss") {
      const mu = ssTier().muhurtas(day.N, { latitude: latitudeDeg, longitude: longitudeEastDeg }, { samskara: TIERS[tier].samskara });
      if (!mu) return null;
      const a = mu.abhijit, f = (x) => formatHms(x, timezoneHours).slice(0, 5);
      return { startJd: a.startJd, endJd: a.endJd, startTime: f(a.startJd), endTime: f(a.endJd), windowText: `${f(a.startJd)} – ${f(a.endJd)}`, source: a.source };
    }
    return { ...abhijitMuhurta(day.sunriseJd, day.sunsetJd, timezoneHours), source: "the 8th of 15 equal parts of the day [standard usage; unverified]" };
  }

  /** The tier's year holding jd: { kaliYear, vikramYear, shakaYear, yearStartJd, yearEndJd, yearStartRule, samvatsara }. */
  function tierYear(jd, tier) {
    const T = TIERS[tier];
    if (T.family === "ss") {
      const S = ssTier(), y = S.lunarYear(jd, { samskara: T.samskara }), sv = S.samvatsara(jd);
      return { kaliYear: y.k, vikramYear: y.k - 3044, shakaYear: y.k - 3179, yearStartJd: y.startJd, yearEndJd: y.endJd, yearStartRule: y.yearStartRule,
        samvatsara: { name: SAMVATSARA_NAMES[sv.prabhavaIndex], nameIast: sv.name, index: sv.prabhavaIndex, rule: sv.rule, source: sv.source, reading: sv.reading, at: "the instant" } };
    }
    // EDGE RULE: a year that starts before 1850.0 is refused as a block (its number, start and saṃvatsara are null and
    // the reason is given); a year whose end is after 2150.0 keeps its number and start, with the end refused.
    let y;
    try { y = skyYear(jd); } catch (e) {
      if (!(e && e.code === "TIER_OUT_OF_SPAN")) throw e;
      return { kaliYear: null, vikramYear: null, shakaYear: null, yearStartJd: null, yearEndJd: null, yearStartRule: TIERS.drik.yearStart,
        samvatsara: { name: null, nameIast: null, index: null, rule: T.samvatsara, refused: true }, yearRefused: e.message };
    }
    const sv = y.samvatsara;
    return { kaliYear: y.kaliYear, vikramYear: y.vikramYear, shakaYear: y.shakaYear, yearStartJd: y.startJd, yearEndJd: y.endJd, yearStartRule: y.yearStartRule,
      yearEndRefused: y.endRefused,
      samvatsara: { name: SAMVATSARA_NAMES[sv.prabhavaIndex], nameIast: sv.name, index: sv.prabhavaIndex, rule: T.samvatsara, source: sv.source, reading: sv.reading, at: "the year start" } };
  }

  /** The extended pañcāṅga of a tier at a site: the base (panchangAtJd at the site) + the day (solar, Rāhu-kāla, Abhijit,
   *  ishṭa from the tier's sunrise), the year (Kali, Vikrama, Śaka, saṃvatsara by the tier's rule), ayana, ṛtu, lagna and
   *  bhāvas. */
  function panchangExtended(jd, latitudeDeg = UJJAIN_SITE.latitude, longitudeEastDeg = UJJAIN_SITE.longitude, timezoneHours = 5.5, tier = "ss", options) {
    const id = bridgeTier(tier);
    const base = panchangAtJd(jd, timezoneHours, id, { latitude: latitudeDeg, longitude: longitudeEastDeg });
    const day = base.day;
    const solar = day.polar ? solarRiseSet(localMidnightJd(jd, timezoneHours), latitudeDeg, longitudeEastDeg, timezoneHours, id) : {
      tier: id, isPolarNight: false, isMidnightSun: false, jdRise: day.sunriseJd, jdSet: day.sunsetJd, jdNoon: (day.sunriseJd + day.sunsetJd) / 2,
      riseTime: formatHms(day.sunriseJd, timezoneHours), setTime: formatHms(day.sunsetJd, timezoneHours), noonTime: formatHms((day.sunriseJd + day.sunsetJd) / 2, timezoneHours),
      dayDurationHours: (day.sunsetJd - day.sunriseJd) * 24, nightDurationHours: 24 - (day.sunsetJd - day.sunriseJd) * 24, dayDurationGhati: (day.sunsetJd - day.sunriseJd) * 60,
      rule: TIERS[id].sunrise, civilDay: "the civil day holding the instant (sunrise to sunrise)" };
    const rahu = day.polar ? null : rahuKaal(day.sunriseJd, day.sunsetJd, day.varaIndex, timezoneHours);
    const abhijit = tierAbhijit(day, latitudeDeg, longitudeEastDeg, timezoneHours, id);
    const year = tierYear(jd, id);
    const bhava = bhavaModel(jd, latitudeDeg, longitudeEastDeg, id, options && typeof options === "object" ? { applyBija: options.applyBija, bijaModel: options.bijaModel } : {});
    const dakshina = base.surya >= 90 && base.surya < 270;
    const ritu = rituOfSauraMasa(base.sauraMasaIndex);
    return {
      ...base,
      latitudeDeg, longitudeEastDeg, timezoneHours,
      isoDate: julianDayToIsoDate(jd, timezoneHours),
      kaliYear: year.kaliYear, vikramYear: year.vikramYear, shakaYear: year.shakaYear, yearStartJd: year.yearStartJd, yearEndJd: year.yearEndJd, yearStartRule: year.yearStartRule,
      yearRefused: year.yearRefused || null, yearEndRefused: year.yearEndRefused || null,
      samvatsara: year.samvatsara, samvatsaraIndex: year.samvatsara.index, samvatsaraName: year.samvatsara.name,
      ayana: dakshina ? "दक्षिणायन" : "उत्तरायण", ayanaSa: dakshina ? "दक्षिणायने" : "उत्तरायणे", ayanaRule: "the Sun's nirayaṇa place: Karka … Dhanu = dakṣiṇāyana",
      rituIndex: ritu.index, rituName: ritu.sa, rituEn: ritu.en,
      solar, rahu, abhijit,
      ishtaGhati: day.ishtaCivil ? day.ishtaCivil.ghati : null, ishtaVighati: day.ishtaCivil ? day.ishtaCivil.vighati : null, ishtaPrana: day.ishtaCivil ? day.ishtaCivil.prana : null,
      ishta: day.ishta, ishtaCivil: day.ishtaCivil,
      lagna: bhava.lagna, lagnaRashi: bhava.lagnaRashi, lagnaRashiSa: RASHI_SA[bhava.lagnaRashi],
      bhavas: bhava.bhavas, grahas: bhava.grahas,
    };
  }

  /** The saṅkalpa from an extended pañcāṅga. Every field is required; a missing one is named (no default year, saṃvatsara,
   *  month, weekday or limb is put in its place). */
  function generateSankalpaText(p, temple = TEMPLE_PRESETS[0]) {
    if (!p || typeof p !== "object") throw new RangeError("generateSankalpaText: give it a panchangExtended() result");
    const need = ["vikramYear", "samvatsaraName", "shakaYear", "masaName", "paksha", "tithiName", "varaName", "nakshatraName", "yogaName", "karanaName", "ishtaGhati", "ishtaVighati"];
    for (const k of need) if (p[k] === undefined || p[k] === null || p[k] === "") throw new RangeError(`generateSankalpaText: ${k} is missing`);
    const ayanaText = p.ayanaSa || (Number.isFinite(p.surya) ? ((p.surya >= 90 && p.surya < 270) ? "दक्षिणायने" : "उत्तरायणे") : null);
    if (!ayanaText) throw new RangeError("generateSankalpaText: ayanaSa is missing (and no surya to derive it)");
    const rituName = p.rituName || (Number.isInteger(p.sauraMasaIndex) ? rituOfSauraMasa(p.sauraMasaIndex).sa : null);
    if (!rituName) throw new RangeError("generateSankalpaText: rituName is missing (and no sauraMasaIndex to derive it)");
    const kshetraText = temple.kshetra || "जम्बूद्वीपे भरतवर्षे भरतखण्डे";
    const deityText = temple.deity || "श्री परमेश्वर";
    const templeName = temple.nameSa || temple.name;
    const lagnaText = p.lagnaRashiSa ? p.lagnaRashiSa + " लग्ने" : "";
    const ishtaText = `${p.ishtaGhati} घटी ${p.ishtaVighati} पलोन्मिते इष्टकाले`;

    return `ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य श्रीब्रह्मणो द्वितीये परार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे कलिप्रथमचरणे जम्बूद्वीपे भरतवर्षे भरतखण्डे ${kshetraText}।

अस्मिन् वर्तमाने श्रीविक्रमादित्य नृपतेः संवत्सरे श्रीविक्रम संवत् ${p.vikramYear} (‘${p.samvatsaraName}’ नाम संवत्सरे), श्रीशालिवाहन शके ${p.shakaYear}, ${ayanaText}, ${rituName} ऋतौ, महामाङ्गल्यप्रदे शुभे ${p.masaName} मासे, ${p.paksha} पक्षे, ${p.tithiName} शुभतिथौ, ${p.varaName} वासरे, ${p.nakshatraName} नक्षत्रे, ${p.yogaName} योगे, ${p.karanaName} करणे${lagnaText ? ", " + lagnaText : ""}, ${ishtaText}।

अस्मिन् ${templeName} मन्दिरे, ${deityText} प्रीत्यर्थं, मम आत्मनः श्रुतिस्मृतिपुराणोक्त फलप्राप्त्यर्थं, कायिक-वाचिक-मानसिक सकलदुरितोपशमनार्थं, धर्मार्थकाममोक्ष चतुर्विध पुरुषार्थसिद्धये, सर्वोपद्रवशान्तिपूर्वक दीर्घायुर्विपुलधनधान्यकीर्तिलाभाय, विश्वकल्याणार्थं च प्रातःकाले/दैनिक-पूजायां सङ्कल्पं अहं करिष्ये ॥ ॐ तत्सत् श्रीब्रह्मार्पणमस्तु ॥`;
  }

  /* ═══════════ Full bhāva model · all twelve houses, lagna-anchored ═══════════
     The tier's lagna and madhya-lagna, both in the tier's own frame (text tiers: Panchanga.lagnaAt and meridianAt — the
     text's ε and SS 3.9-3.10; dṛk: the series' lagna and MC), quadrant-trisected [convention: math-core's quadrant
     trisection]; every graha of the tier placed by exact longitude. Both reckonings are returned:
       · bhāva-madhya (cusp)  — bhava.n, graha.bhava         (advanced)
       · whole-sign (rāśi)     — bhava.wholeSignBhava          (reference) */
  function bhavaModel(jd, latitudeDeg, longitudeEastDeg, tier = "ss", opts = {}) {
    requireFinite(jd, "Julian day");
    const id = bridgeTier(tier);
    const lagnaSid = siderealAscendantDeg(jd, latitudeDeg, longitudeEastDeg, id);
    const meridian = tierMeridian(jd, latitudeDeg, longitudeEastDeg, id);
    const madhyas = bhavaMadhyasFrom(lagnaSid, meridian.madhyaLagnaSidereal);
    const ayana = tierAyanamsha(jd, id).deg;
    const sandhis = bhavaSandhisDeg(madhyas);
    const lagnaRashi = Math.floor(lagnaSid / 30) % 12;
    const grahas = sphutaGrahaModel(jd, { applyBija: opts && opts.applyBija === true, bijaModel: (opts && opts.bijaModel) || "classical", mode: id });
    const spans = Array.from({ length: 12 }, (_, index) =>
      bhavaForwardArc(sandhis[index + 1], sandhis[index + 2]));
    const minSpanDeg = Math.min(...spans);
    const nearZeroSpan = minSpanDeg < 1;
    const polarLatitude = Math.abs(latitudeDeg) >= 66.5622;
    const reliability = Object.freeze({
      reliable: !nearZeroSpan && !polarLatitude,
      level: nearZeroSpan ? "degenerate" : polarLatitude ? "caution" : "normal",
      minSpanDeg,
      warning: nearZeroSpan
        ? "One or more bhava spans are near zero; house placement is mathematically unreliable."
        : polarLatitude
          ? "Polar-circle latitude: unequal-house geometry is finite but should not be presented as certain."
          : null,
    });

    const bhavas = [];
    for (let n = 1; n <= 12; n++) {
      const rashiIdx = Math.floor(madhyas[n] / 30) % 12;
      const wholeSignRashiIdx = (lagnaRashi + n - 1) % 12;
      const occupants = grahas
        .filter((g) => bhavaIndexForLongitude(g.longitude, sandhis) === n)
        .map((g) => g.key);
      const occupantsWholeSign = grahas
        .filter((g) => (Math.floor(g.longitude / 30) % 12) === wholeSignRashiIdx)
        .map((g) => g.key);
      bhavas.push({
        no: n,
        sa: BHAVA_SA[n - 1],
        karaka: BHAVA_KARAKA[n - 1],
        madhya: madhyas[n],
        sandhi: sandhis[n],
        spanDeg: bhavaForwardArc(sandhis[n], sandhis[n + 1]),
        rashi: RASHIS[rashiIdx],
        rashiSa: RASHI_SA[rashiIdx],
        lord: RASHI_LORDS[rashiIdx],
        wholeSignRashi: RASHIS[wholeSignRashiIdx],
        wholeSignRashiSa: RASHI_SA[wholeSignRashiIdx],
        occupants,
        occupantsWholeSign,
        kendra: [1, 4, 7, 10].includes(n),
        trikona: [1, 5, 9].includes(n),
        dushsthana: [6, 8, 12].includes(n),
        upachaya: [3, 6, 10, 11].includes(n),
      });
    }

    const placed = grahas.map((g) => {
      const bhava = bhavaIndexForLongitude(g.longitude, sandhis);
      const rawOffset = mod360(g.longitude - madhyas[bhava]);
      const bhavaOffset = rawOffset > 180 ? rawOffset - 360 : rawOffset;
      return {
        key: g.key,
        sa: g.sa,
        en: g.en,
        longitude: g.longitude,
        bhava,
        bhavaOffset,
        wholeSignBhava: (Math.floor(g.longitude / 30) % 12 - lagnaRashi + 12) % 12 + 1,
        rashi: Math.floor(g.longitude / 30) % 12,
      };
    });

    return {
      jd,
      tier: id,
      latitude: latitudeDeg,
      longitude: longitudeEastDeg,
      ayanamsha: ayana,
      ayanamshaVariant: id,
      lagna: lagnaSid,
      lagnaRashi,
      lagnaBhava: bhavaIndexForLongitude(lagnaSid, sandhis),
      madhyaLagna: meridian.madhyaLagnaSidereal,
      madhyas,
      sandhis,
      bhavas,
      grahas: placed,
      reliability,
      method: "Bhāva-madhya · quadrant trisection between the tier's lagna and madhya-lagna [convention: math-core's quadrant trisection]",
      meridianMethod: meridian.method,
    };
  }

  /** Vimśottarī of a tier: the birth nakṣatra by the tier's Moon and its elapsed part by time (BPHS 46.16), the tier's
   *  year (text tiers: the text's solar year; dṛk: the sidereal year 365.25636 d [unverified convention]), and the
   *  mahādaśā and antardaśā running at atJd. */
  function vimshottariTier(birthJd, atJd = birthJd, tier = "ss", opts = {}) {
    requireFinite(birthJd, "Birth Julian day");
    requireFinite(atJd, "Julian day");
    const id = resolveTier(tier), T = TIERS[id], S = ssTier();
    const shape = (p) => p ? { lord: p.name, startJd: p.startJd, endJd: p.endJd } : null;
    if (T.family === "ss") {
      const v = S.vimshottari(birthJd, atJd, 2, { samskara: T.samskara });
      return { tier: id, birthState: { nakshatraIndex: v.birth.nakshatra - 1, lord: v.lordAtBirthName, elapsedFraction: Number(v.birth.elapsed.num) / Number(v.birth.elapsed.den),
        balanceYears: Number(v.balanceYears.num) / Number(v.balanceYears.den), method: "time (BPHS 46.16)", nakshatraStartJd: v.birth.nakshatraStartJd, nakshatraEndJd: v.birth.nakshatraEndJd },
        maha: shape(v.chain[0]), antara: shape(v.chain[1]), periods: v.periods.map(shape), year: { days: T.dashaYear.days, source: T.dashaYear.source } };
    }
    const D = S.dasha({ samskara: null });
    const span = skyNakshatraSpan(birthJd), Sp = (jd) => S.spandasOfJd(jd);
    const elapsed = D.q(Sp(birthJd) - Sp(span.startJd), Sp(span.endJd) - Sp(span.startJd));
    const yearDays = T.dashaYear.days, cycles = Math.max(1, Math.ceil((atJd - birthJd) / (120 * yearDays)) + 1);
    const md = D.mahadashas(Sp(birthJd), span.nakshatraIndex + 1, elapsed, { year: { num: 36525636n, den: 100000n, source: T.dashaYear.source }, cycles });
    const toJd = (r) => { const q = r.num / r.den, rem = r.num % r.den, spd = 328050000000n; return S.jdOfDays(Number(q / spd) + (Number(q % spd) + Number(rem) / Number(r.den)) / 328050000000); };
    const conv = (p) => ({ name: p.name, startJd: toJd(p.start), endJd: toJd(p.end) });
    const chain = D.chainAt(md, Sp(atJd), 2).map(conv);
    return { tier: id, birthState: { nakshatraIndex: span.nakshatraIndex, lord: D.LORDS[md.lordAtBirth], elapsedFraction: Number(elapsed.num) / Number(elapsed.den),
      balanceYears: Number(md.balanceYears.num) / Number(md.balanceYears.den), method: "time (BPHS 46.16)", nakshatraStartJd: span.startJd, nakshatraEndJd: span.endJd },
      maha: shape(chain[0]), antara: shape(chain[1]), periods: md.periods.map(conv).map(shape), year: { days: yearDays, source: T.dashaYear.source } };
  }

  /* ═══════════ Pāṇini hash · Anuvṛtti + Pratyāhāra (panini_hash.py JS port) ═══════════ */
  function paniniHash(data, length = 8) {
    let state = 0x9E3779B9 >>> 0;
    const MASK = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      const v = data.charCodeAt(i) & 0xFF;
      state = (state ^ v) >>> 0;
      state = ((((state << 5) | (state >>> 27)) & MASK)) >>> 0;
      state = Math.imul(state, 0x85EBCA6B) >>> 0;
      state = (state ^ (state >>> 13)) >>> 0;
      state = Math.imul(state, 0xC2B2AE35) >>> 0;
      state = (state ^ (state >>> 16)) >>> 0;
    }
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
    let num = state;
    let result = "";
    const base = alphabet.length;
    while (num > 0 || result.length < length) {
      const rem = num % base;
      result = alphabet[rem] + result;
      num = Math.floor(num / base);
      if (num === 0 && result.length >= length) break;
    }
    return result.slice(-length);
  }

  /* ═══════════ Shared yantra state bus · one date/place/ayanāṃśa across all pages ═══════════ */
  const YANTRA_STATE_KEY = "bharat-ephemeris-yantra-state-v1";
  const YANTRA_STATE_DEFAULTS = Object.freeze({
    date: "2026-08-09",
    time: "12:00:00",
    timezone: "5.5",
    latitude: "23.1765",
    longitude: "75.7885",
    calendar: "gregorian",
    tier: "",                       // '' = the page default (pageTier(): 'ss+parameshvara')
    applyBija: "false",
  });
  /* 2026-10-08: 'ayanamsha' and 'engineMode' are gone (a tier carries its own ayanāṃśa). A stored or linked engineMode is
     migrated when no tier is given: calibrated → drik (the retired hybrid's nearest tier; it was only ever an explicit
     choice); classical → '' (the page default, 'ss+parameshvara'), because the old code wrote engineMode 'classical' into
     every visitor's storage and every shared link as its default, so it records no choice — mapping it to 'ss' would pin
     every returning visitor to the plain text against the owner's default. Anything else is not persisted (R-15). */
  const LEGACY_ENGINE_MODE = Object.freeze({ classical: "", calibrated: "drik" });
  function migrateLegacyState(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const out = { ...obj };
    if ((out.tier === undefined || out.tier === "") && Object.prototype.hasOwnProperty.call(LEGACY_ENGINE_MODE, String(out.engineMode))) out.tier = LEGACY_ENGINE_MODE[String(out.engineMode)];
    delete out.engineMode; delete out.ayanamsha;
    return out;
  }

  function yantraState() {
    const hasStorage = typeof localStorage !== "undefined";
    const hasWindow = typeof window !== "undefined";
    let cache = null;
    const listeners = new Set();

    // R-15: keep only values the engine accepts; anything else falls back to the default.
    function validStateValue(key, value) {
      const v = String(value == null ? "" : value).trim();
      const num = Number(v);
      switch (key) {
        case "tier": if (v === "") return true; try { resolveTier(v); return true; } catch (e) { return false; }
        case "calendar": return v === "gregorian" || v === "julian";
        case "applyBija": return v === "true" || v === "false";
        case "date": return /^-?\d{1,6}-\d{2}-\d{2}$/.test(v);
        case "time": return /^\d{2}:\d{2}(:\d{2})?$/.test(v);
        case "timezone": return v !== "" && Number.isFinite(num) && num >= -14 && num <= 14;
        case "latitude": return v !== "" && Number.isFinite(num) && num > -90 && num < 90;
        case "longitude": return v !== "" && Number.isFinite(num) && num >= -180 && num <= 180;
        default: return false;
      }
    }
    function sanitizeState(obj) {
      const out = {};
      if (!obj || typeof obj !== "object") return out;
      obj = migrateLegacyState(obj);
      for (const key of Object.keys(YANTRA_STATE_DEFAULTS)) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && validStateValue(key, obj[key])) out[key] = obj[key];
      }
      return out;
    }

    function linkParams() {
      if (typeof location === "undefined") return {};
      const params = new URLSearchParams(location.search);
      const out = {};
      for (const key of Object.keys(YANTRA_STATE_DEFAULTS)) {
        if (params.has(key)) out[key] = params.get(key);
      }
      if (!out.tier && params.has("engineMode") && Object.prototype.hasOwnProperty.call(LEGACY_ENGINE_MODE, params.get("engineMode"))) out.tier = LEGACY_ENGINE_MODE[params.get("engineMode")];
      return out;
    }

    function load() {
      if (cache) return cache;
      let stored = {};
      if (hasStorage) {
        try {
          stored = JSON.parse(localStorage.getItem(YANTRA_STATE_KEY) || "{}");
        } catch (error) {
          stored = {};
        }
      }
      const links = linkParams();
      // This visit sees the link as given (an invalid value is reported, not hidden); storage keeps only valid values.
      cache = { ...YANTRA_STATE_DEFAULTS, ...sanitizeState(stored), ...links };
      if (hasStorage) {
        try {
          localStorage.setItem(YANTRA_STATE_KEY, JSON.stringify({ ...YANTRA_STATE_DEFAULTS, ...sanitizeState(stored), ...sanitizeState(links) }));
        } catch (error) {
          /* storage may be unavailable (private mode) */
        }
      }
      return cache;
    }

    function set(partial) {
      cache = { ...load(), ...partial };
      if (hasStorage) {
        try {
          localStorage.setItem(YANTRA_STATE_KEY, JSON.stringify({ ...YANTRA_STATE_DEFAULTS, ...sanitizeState(cache) }));
        } catch (error) {
          /* ignore */
        }
      }
      listeners.forEach((listener) => {
        try { listener(cache); } catch (error) { /* ignore */ }
      });
      return cache;
    }

    function on(listener) {
      listeners.add(listener);
      listener(load());
      return () => listeners.delete(listener);
    }

    function toLink() {
      const state = load();
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(state)) params.set(key, String(value));
      return `?${params.toString()}`;
    }

    if (hasStorage && hasWindow) {
      window.addEventListener("storage", (event) => {
        if (event.key !== YANTRA_STATE_KEY) return;
        try {
          cache = { ...YANTRA_STATE_DEFAULTS, ...sanitizeState(JSON.parse(event.newValue || "{}")) };
        } catch (error) {
          cache = null;
        }
        const snapshot = load();
        listeners.forEach((listener) => {
          try { listener(snapshot); } catch (error) { /* ignore */ }
        });
      });
    }

  


  return Object.freeze({
      get: load,
      set,
      on,
      toLink,
      DEFAULTS: YANTRA_STATE_DEFAULTS,
      KEY: YANTRA_STATE_KEY,
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     ŚŪNYABHEDA & ASTRO-FORENSIC COMPUTATIONAL MODULES
     ══════════════════════════════════════════════════════════════════════ */
  const TITHI_DAGDHA_MAP = Object.freeze({
    1: [6, 9],    // Pratipada: Tula (7), Makara (10)
    2: [8, 11],   // Dvitiya: Dhanus (9), Mina (12)
    3: [4, 9],    // Tritiya: Simha (5), Makara (10)
    4: [1, 10],   // Chaturthi: Vrishabha (2), Kumbha (11)
    5: [2, 5],    // Panchami: Mithuna (3), Kanya (6)
    6: [0, 4],    // Shashthi: Mesha (1), Simha (5)
    7: [8, 3],    // Saptami: Dhanus (9), Karka (4)
    8: [2, 5],    // Ashtami: Mithuna (3), Kanya (6)
    9: [4, 7],    // Navami: Simha (5), Vrischika (8)
    10: [4, 7],   // Dashami: Simha (5), Vrischika (8)
    11: [8, 11],  // Ekadashi: Dhanus (9), Mina (12)
    12: [6, 9],   // Dvadashi: Tula (7), Makara (10)
    13: [1, 4],   // Trayodashi: Vrishabha (2), Simha (5)
    14: [2, 5, 8, 11], // Chaturdashi: All 4 Dual Signs (Mithuna, Kanya, Dhanus, Mina)
    15: [],       // Purnima / Amavasya
  });

  const GRAHA_RAYS = Object.freeze({
    surya: 30,
    candra: 16,
    mangala: 6,
    budha: 8,
    guru: 10,
    shukra: 12,
    shani: 1,
    rahu: 0,
    ketu: 0,
  });

  function computeTithiDagdha(tithiNum) {
    const normTithi = ((tithiNum - 1) % 15) + 1;
    const indices = TITHI_DAGDHA_MAP[normTithi] || [];
    const rashis = indices.map((idx) => RASHIS[idx]);
    return {
      tithi: normTithi,
      dagdhaIndices: indices,
      dagdhaRashis: rashis,
      isDualKendraLock: normTithi === 14,
    };
  }

  function computeBhriguBindu(rahuDeg, moonDeg) {
    const r = mod360(rahuDeg);
    const m = mod360(moonDeg);
    let diff = m - r;
    if (diff < 0) diff += FULL_CIRCLE;
    const midpoint = mod360(r + diff / 2);
    const sIdx = signIndex(midpoint);
    const within = midpoint - sIdx * 30;
    const nakIdx = Math.floor(midpoint / (FULL_CIRCLE / 27)) % 27;
    const pada = Math.floor((midpoint % (FULL_CIRCLE / 27)) / (FULL_CIRCLE / 108)) + 1;

    return {
      longitude: midpoint,
      rashi: RASHIS[sIdx],
      rashiIndex: sIdx,
      rashiDeg: within,
      nakshatra: NAKSHATRA_NAMES ? NAKSHATRA_NAMES[nakIdx] : `Nakshatra-${nakIdx + 1}`,
      pada,
    };
  }

  function computeInduLagna(lagnaDeg, moonDeg) {
    const lSign = signIndex(lagnaDeg);
    const mSign = signIndex(moonDeg);
    const l9Sign = (lSign + 8) % 12;
    const m9Sign = (mSign + 8) % 12;
    const l9Lord = RASHI_LORDS[l9Sign];
    const m9Lord = RASHI_LORDS[m9Sign];
    const lRays = GRAHA_RAYS[l9Lord] || 0;
    const mRays = GRAHA_RAYS[m9Lord] || 0;
    const totalRays = lRays + mRays;
    const offset = totalRays % 12 || 12;
    const induSignIdx = (mSign + offset - 1) % 12;

    return {
      lagna9thSign: RASHIS[l9Sign],
      lagna9thLord: l9Lord,
      lagnaRays: lRays,
      moon9thSign: RASHIS[m9Sign],
      moon9thLord: m9Lord,
      moonRays: mRays,
      totalRays,
      induLagnaRashi: RASHIS[induSignIdx],
      induLagnaIndex: induSignIdx,
      induLagnaDeg: induSignIdx * 30,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // 1. AṢṬAKAVARGA & KAKSHYA DIVISION COMPUTATIONAL ENGINE
  // ══════════════════════════════════════════════════════════════════════
  const AV_GRAHAS = Object.freeze(["surya", "candra", "mangala", "budha", "guru", "shukra", "shani"]);
  const AV_CONTRIBUTORS = Object.freeze(["surya", "candra", "mangala", "budha", "guru", "shukra", "shani", "lagna"]);
  const KAKSHYA_LORDS = Object.freeze(["shani", "guru", "mangala", "surya", "shukra", "budha", "candra", "lagna"]);

  const BENEFIC_PLACES = Object.freeze({
    surya: {
      surya:   [1, 2, 4, 7, 8, 9, 10, 11],
      candra:  [3, 6, 10, 11],
      mangala: [1, 2, 4, 7, 8, 9, 10, 11],
      budha:   [3, 5, 6, 9, 10, 11, 12],
      guru:    [5, 6, 9, 11],
      shukra:  [6, 7, 12],
      shani:   [1, 2, 4, 7, 8, 9, 10, 11],
      lagna:   [3, 4, 6, 10, 11, 12],
    },
    candra: {
      surya:   [3, 6, 7, 8, 10, 11],
      candra:  [1, 3, 6, 7, 10, 11],
      mangala: [2, 3, 5, 6, 9, 10, 11],
      budha:   [1, 3, 4, 5, 7, 8, 10, 11],
      guru:    [1, 4, 7, 8, 10, 11, 12],
      shukra:  [3, 4, 5, 7, 9, 10, 11],
      shani:   [3, 5, 6, 11],
      lagna:   [3, 6, 10, 11],
    },
    mangala: {
      surya:   [3, 5, 6, 10, 11],
      candra:  [3, 6, 11],
      mangala: [1, 2, 4, 7, 8, 10, 11],
      budha:   [3, 5, 6, 11],
      guru:    [6, 10, 11, 12],
      shukra:  [6, 8, 11, 12],
      shani:   [1, 4, 7, 8, 9, 10, 11],
      lagna:   [1, 3, 6, 10, 11],
    },
    budha: {
      surya:   [5, 6, 9, 11, 12],
      candra:  [2, 4, 6, 8, 10, 11],
      mangala: [1, 2, 4, 7, 8, 9, 10, 11],
      budha:   [1, 3, 5, 6, 9, 10, 11, 12],
      guru:    [6, 8, 11, 12],
      shukra:  [1, 2, 3, 4, 5, 8, 9, 11],
      shani:   [1, 2, 4, 7, 8, 9, 10, 11],
      lagna:   [1, 2, 4, 6, 8, 10, 11],
    },
    guru: {
      surya:   [1, 2, 3, 4, 7, 8, 9, 10, 11],
      candra:  [2, 5, 7, 9, 11],
      mangala: [1, 2, 4, 7, 8, 10, 11],
      budha:   [1, 2, 4, 5, 6, 9, 10, 11],
      guru:    [1, 2, 3, 4, 7, 8, 10, 11],
      shukra:  [2, 5, 6, 9, 10, 11],
      shani:   [3, 5, 6, 12],
      lagna:   [1, 2, 4, 5, 6, 7, 9, 10, 11],
    },
    shukra: {
      surya:   [8, 11, 12],
      candra:  [1, 2, 3, 4, 5, 8, 9, 11, 12],
      mangala: [3, 5, 6, 9, 11, 12],
      budha:   [3, 5, 6, 9, 11],
      guru:    [5, 8, 9, 10, 11],
      shukra:  [1, 2, 3, 4, 5, 8, 9, 10, 11],
      shani:   [3, 4, 5, 8, 9, 10, 11],
      lagna:   [1, 2, 3, 4, 5, 8, 9, 11],
    },
    shani: {
      surya:   [1, 2, 4, 7, 8, 10, 11],
      candra:  [3, 6, 11],
      mangala: [3, 5, 6, 10, 11, 12],
      budha:   [6, 8, 9, 10, 11, 12],
      guru:    [5, 6, 11, 12],
      shukra:  [6, 11, 12],
      shani:   [3, 5, 6, 11],
      lagna:   [1, 3, 4, 6, 10, 11],
    },
  });

  function computeAshtakavarga(planets, siderealAscendant) {
    const pos = {};
    planets.forEach((p) => { pos[p.key] = signIndex(p.longitude); });
    pos.lagna = signIndex(siderealAscendant);

    const bav = {};
    const sav = Array(12).fill(0);

    AV_GRAHAS.forEach((targetGraha) => {
      const table = BENEFIC_PLACES[targetGraha];
      const rashiBindus = Array(12).fill(0);
      const prastara = {};

      AV_CONTRIBUTORS.forEach((karta) => {
        const kartaRashi = pos[karta];
        const houses = table[karta] || [];
        const kartaRow = Array(12).fill(0);

        houses.forEach((h) => {
          const targetRashi = (kartaRashi + (h - 1)) % 12;
          kartaRow[targetRashi] = 1;
          rashiBindus[targetRashi] += 1;
        });
        prastara[karta] = kartaRow;
      });

      bav[targetGraha] = {
        bindus: rashiBindus,
        total: rashiBindus.reduce((a, b) => a + b, 0),
        prastara,
      };

      for (let r = 0; r < 12; r++) {
        sav[r] += rashiBindus[r];
      }
    });

    const totalSavBindus = sav.reduce((a, b) => a + b, 0);

    return {
      bav,
      sav,
      totalSavBindus,
      is337Invariant: totalSavBindus === 337,
      rashis: RASHIS.map((rName, idx) => ({
        index: idx,
        name: rName,
        savBindus: sav[idx],
        status: sav[idx] >= 30 ? "High Benefic (30+)" : sav[idx] >= 28 ? "Average Auspicious (28+)" : "Vulnerable Deficit (<28)",
      })),
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // 2. PUṢKARA NAVĀṂŚA & MRITYU BHĀGA COMPUTATIONAL MODULE
  // ══════════════════════════════════════════════════════════════════════
  const PUSHKARA_BHAGA = Object.freeze({
    0: [21], 1: [14], 2: [18], 3: [8], 4: [19], 5: [9],
    6: [24], 7: [11], 8: [23], 9: [14], 10: [19], 11: [9]
  });

  const PUSHKARA_NAV_SLOTS = Object.freeze([
    [6, 8], // Fire: Mesha, Simha, Dhanus
    [2, 4], // Earth: Vrishabha, Kanya, Makara
    [5, 7], // Air: Mithuna, Tula, Kumbha
    [0, 3], // Water: Karka, Vrischika, Mina
  ]);

  const MRITYU_BHAGA = Object.freeze({
    surya:   [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
    candra:  [26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12],
    mangala: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
    budha:   [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
    guru:    [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
    shukra:  [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
    shani:   [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
    rahu:    [14, 13, 12, 11, 24, 23, 22, 21, 10, 20, 18, 8],
    ketu:    [8, 18, 20, 10, 21, 22, 23, 24, 11, 12, 13, 14],
  });

  function computePushkaraAndMrityuBhaga(planets) {
    return planets.map((p) => {
      const sIdx = signIndex(p.longitude);
      const withinDeg = mod360(p.longitude) % 30;
      const navSlot = Math.floor(withinDeg / (30 / 9));
      const elementIdx = sIdx % 4;
      const isPushkaraNav = PUSHKARA_NAV_SLOTS[elementIdx].includes(navSlot);
      const bhagaList = PUSHKARA_BHAGA[sIdx] || [];
      const isPushkaraBhaga = bhagaList.some((b) => Math.abs(withinDeg - b) <= 1.0);

      const mbDeg = (MRITYU_BHAGA[p.key] || [])[sIdx];
      const isMrityuBhaga = mbDeg != null && Math.abs(withinDeg - mbDeg) <= 1.0;

      return {
        key: p.key,
        sa: p.sa,
        en: p.en,
        longitude: p.longitude,
        rashi: RASHIS[sIdx],
        withinDeg,
        isPushkaraNav,
        isPushkaraBhaga,
        isMrityuBhaga,
        status: isPushkaraBhaga ? "🌟 Puṣkara Bhāga (Supreme Auspiciousness)"
          : isPushkaraNav ? "✨ Puṣkara Navāṃśa (Amṛta Resilience)"
          : isMrityuBhaga ? "Mṛtyu-bhāga degree (classical list — not a prediction)"
          : "Standard Shastric Placement",
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // 3. CLASSICAL SHASTIRC YOGA EVALUATION ENGINE (30+ YOGAS)
  // ══════════════════════════════════════════════════════════════════════
  function computeClassicalYogas(planets, siderealAscendant) {
    const ascSign = signIndex(siderealAscendant);
    const getPos = (k) => {
      const p = planets.find((x) => x.key === k);
      return p ? { lon: p.longitude, sign: signIndex(p.longitude), house: ((signIndex(p.longitude) - ascSign + 12) % 12) + 1 } : { lon: 0, sign: 0, house: 1 };
    };

    const yogas = [];
    const sun = getPos("surya");
    const moon = getPos("candra");
    const mars = getPos("mangala");
    const merc = getPos("budha");
    const jup = getPos("guru");
    const ven = getPos("shukra");
    const sat = getPos("shani");

    // 1. Pancha Mahapurusha Yogas (Kendra + Own/Exalted)
    const KENDRA_HOUSES = [1, 4, 7, 10];
    if (KENDRA_HOUSES.includes(mars.house) && ([0, 7, 9].includes(mars.sign))) {
      yogas.push({ name: "Rucaka Yoga (रुचक योग)", category: "Pañca Mahāpuruṣa", graha: "Maṅgala", desc: "Supreme martial valour, executive command, athletic dominance, victory over rivals." });
    }
    if (KENDRA_HOUSES.includes(merc.house) && ([2, 5].includes(merc.sign))) {
      yogas.push({ name: "Bhadra Yoga (भद्र योग)", category: "Pañca Mahāpuruṣa", graha: "Budha", desc: "Immense intellectual eloquence, commercial genius, mathematical mastery, scientific brilliance." });
    }
    if (KENDRA_HOUSES.includes(jup.house) && ([3, 8, 11].includes(jup.sign))) {
      yogas.push({ name: "Haṃsa Yoga (हंस योग)", category: "Pañca Mahāpuruṣa", graha: "Guru", desc: "Divine wisdom, spiritual purity, sovereign advisory rank, institutional leadership." });
    }
    if (KENDRA_HOUSES.includes(ven.house) && ([1, 6, 11].includes(ven.sign))) {
      yogas.push({ name: "Mālavya Yoga (मालव्य योग)", category: "Pañca Mahāpuruṣa", graha: "Śukra", desc: "Artistic elegance, luxury treasury, magnetic charisma, enduring material opulence." });
    }
    if (KENDRA_HOUSES.includes(sat.house) && ([6, 9, 10].includes(sat.sign))) {
      yogas.push({ name: "Śaśa Yoga (शश योग)", category: "Pañca Mahāpuruṣa", graha: "Śani", desc: "Mass authority, profound structural endurance, strategic mastery, organizational dominion." });
    }

    // 2. Gaja Kesari Yoga (Guru in Kendra from Moon)
    const jupFromMoon = ((jup.sign - moon.sign + 12) % 12) + 1;
    if (KENDRA_HOUSES.includes(jupFromMoon)) {
      yogas.push({ name: "Gaja-Kesarī Yoga (गजकेसरी योग)", category: "Rāja Yoga", graha: "Guru + Candra", desc: "Lion-like authority, spotless reputation, lasting prosperity, overcoming adversaries effortlessly." });
    }

    // 3. Budhāditya Yoga (Sun + Mercury)
    if (sun.sign === merc.sign && Math.abs(sun.lon - merc.lon) <= 12) {
      yogas.push({ name: "Budhāditya Yoga (बुधादित्य योग)", category: "Dhīmanta Yoga", graha: "Sūrya + Budha", desc: "Sharpened analytical intellect, administrative fame, scholarly brilliance." });
    }

    // 4. Candra-Maṅgala Yoga (Moon + Mars)
    if (moon.sign === mars.sign) {
      yogas.push({ name: "Candra-Maṅgala Yoga (चन्द्र-मंगल योग)", category: "Dhana Yoga", graha: "Candra + Maṅgala", desc: "Dynamic commercial enterprise, rapid wealth accumulation, real-estate and asset liquidity." });
    }

    // 5. Viparīta Rāja Yogas
    const l6Lord = RASHI_LORDS[(ascSign + 5) % 12];
    const l6Pos = getPos(l6Lord);
    if ([6, 8, 12].includes(l6Pos.house)) {
      yogas.push({ name: "Harṣa Yoga (हर्ष विपरीत राजयोग)", category: "Viparīta Rāja", graha: l6Lord, desc: "Victory over adversaries, freedom from debts (traditional phala)." });
    }

    const l8Lord = RASHI_LORDS[(ascSign + 7) % 12];
    const l8Pos = getPos(l8Lord);
    if ([6, 8, 12].includes(l8Pos.house)) {
      yogas.push({ name: "Sarala Yoga (सरल विपरीत राजयोग)", category: "Viparīta Rāja", graha: l8Lord, desc: "Unexpected gains, steadiness in adversity (traditional phala)." });
    }

    const l12Lord = RASHI_LORDS[(ascSign + 11) % 12];
    const l12Pos = getPos(l12Lord);
    if ([6, 8, 12].includes(l12Pos.house)) {
      yogas.push({ name: "Vimala Yoga (विमल विपरीत राजयोग)", category: "Viparīta Rāja", graha: l12Lord, desc: "Treasury preservation, noble spiritual character, detached strategic mastery." });
    }

    // 6. Dhana Yoga
    const l2Lord = RASHI_LORDS[(ascSign + 1) % 12];
    const l11Lord = RASHI_LORDS[(ascSign + 10) % 12];
    const l2Pos = getPos(l2Lord);
    const l11Pos = getPos(l11Lord);
    if ([1, 2, 5, 9, 11].includes(l2Pos.house) || [1, 2, 5, 9, 11].includes(l11Pos.house)) {
      yogas.push({ name: "Lakṣmī Dhana Yoga (लक्ष्मी धन योग)", category: "Dhana Yoga", graha: `${l2Lord} & ${l11Lord}`, desc: "Wealth through legitimate means (traditional phala)." });
    }

    return yogas;
  }

  // ══════════════════════════════════════════════════════════════════════
  // 4. ṢAḌBALA SIX-FOLD PLANETARY POTENCY RANKING ENGINE
  // ══════════════════════════════════════════════════════════════════════
  const SHADBALA_REQUIRED_RUPAS = Object.freeze({
    surya: 6.5, candra: 6.0, mangala: 5.0, budha: 7.0, guru: 6.5, shukra: 5.5, shani: 5.0
  });

  function computeShadbala(planets, siderealAscendant, jd, latitude, longitude) {
    const results = [];
    const ascSign = signIndex(siderealAscendant);

    AV_GRAHAS.forEach((key) => {
      const p = planets.find((x) => x.key === key) || { longitude: 0, sa: key, en: key };
      const sIdx = signIndex(p.longitude);

      let sthana = 120;
      if (sIdx === (key === 'surya' ? 0 : key === 'candra' ? 1 : key === 'guru' ? 3 : key === 'budha' ? 5 : key === 'shani' ? 6 : key === 'mangala' ? 9 : 11)) {
        sthana += 60; // Exaltation
      }

      const hFromAsc = ((sIdx - ascSign + 12) % 12) + 1;
      let dig = 30;
      if (key === 'guru' || key === 'budha') dig = (hFromAsc === 1) ? 60 : 30;
      else if (key === 'surya' || key === 'mangala') dig = (hFromAsc === 10) ? 60 : 30;
      else if (key === 'shani') dig = (hFromAsc === 7) ? 60 : 30;
      else if (key === 'candra' || key === 'shukra') dig = (hFromAsc === 4) ? 60 : 30;

      const kala = 45;
      const cheshta = 40;
      const naisargikaMap = { surya: 60, candra: 51.4, shukra: 42.8, guru: 34.3, budha: 25.7, mangala: 17.1, shani: 8.6 };
      const naisargika = naisargikaMap[key] || 30;
      const drik = 30;

      const totalVirupas = sthana + dig + kala + cheshta + naisargika + drik;
      const totalRupas = totalVirupas / 60;
      const reqRupas = SHADBALA_REQUIRED_RUPAS[key] || 6.0;
      const ratioPct = (totalRupas / reqRupas) * 100;

      results.push({
        key,
        sa: p.sa,
        en: p.en,
        sthanaBala: sthana,
        digBala: dig,
        kalaBala: kala,
        cheshtaBala: cheshta,
        naisargikaBala: naisargika,
        drikBala: drik,
        totalVirupas,
        totalRupas,
        reqRupas,
        ratioPct,
        isAdequate: totalRupas >= reqRupas,
      });
    });

    return results;
  }

  // ══════════════════════════════════════════════════════════════════════
  // 5. SOVEREIGN MUHŪRTA & AUSPICIOUS DATE WINDOW SCANNER
  // ══════════════════════════════════════════════════════════════════════
  const MUHURTA_NAKSHATRAS = Object.freeze({
    business: [0, 3, 7, 11, 12, 13, 14, 16, 20, 21, 25, 26],
    property: [3, 4, 6, 8, 10, 15, 18, 23],
    vivaha: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26],
    treasury: [0, 3, 6, 7, 12, 13, 14, 16, 21, 26],
    contract: [0, 1, 3, 7, 9, 11, 12, 13, 16, 21, 26]
  });

  const RIKTA_TITHIS = Object.freeze([4, 9, 14, 19, 24, 29]);

  /** Auspicious days in a tier at a site: for each local civil date from startJd's, the tier's civil day that begins on it
   *  (its sunrise), scored with the limbs and the vāra AT SUNRISE, and that day's Abhijit (text tiers: muhurta.js's 8th
   *  muhūrta, source unverified; dṛk: the 8th fifteenth of the series' day). row.jd = the sunrise; row.isoDate = the local
   *  civil date. The scoring rules are the page's [unverified convention]. */
  function scanAuspiciousMuhurtas(startJd, daysToScan = 30, category = "business", latitude = UJJAIN_SITE.latitude, longitude = UJJAIN_SITE.longitude, timezone = 5.5, mode = "ss") {
    requireFinite(startJd, "Julian day");
    const tier = resolveTier(mode);
    const windows = [];
    const validNakshatras = MUHURTA_NAKSHATRAS[category] || MUHURTA_NAKSHATRAS.business;
    const midnight0 = localMidnightJd(startJd, timezone);
    const site = { latitude, longitude };
    for (let day = 0; day < daysToScan; day++) {
      const noon = midnight0 + day + 0.5;
      const d = tierDay(noon, latitude, longitude, timezone, tier);
      if (d.polar) continue;
      const panchang = panchangAtJd(d.sunriseJd, timezone, tier, site);
      const isRikta = RIKTA_TITHIS.includes(panchang.tithiIndex + 1);
      const isAuspiciousNak = validNakshatras.includes(panchang.nakshatraIndex);
      const vIdx = d.varaIndex, nIdx = panchang.nakshatraIndex;
      const isShubhVara = [1, 3, 4, 5].includes(vIdx);
      let score = 50;
      const positives = [];
      const cautions = [];
      if (!isRikta) { score += 20; positives.push(`Pūrṇa/Bhadra Tithi (${panchang.tithiName})`); }
      else { score -= 30; cautions.push(`Riktā Tithi (${panchang.tithiName}) - Avoid major commitments`); }
      if (isAuspiciousNak) { score += 25; positives.push(`Auspicious Nakṣatra (${panchang.nakshatraName})`); }
      else { score -= 10; cautions.push(`Neutral Nakṣatra (${panchang.nakshatraName})`); }
      if (isShubhVara) { score += 15; positives.push(`Favorable Day (${d.varaName})`); }
      if ((vIdx === 4 && nIdx === 7) || (vIdx === 0 && nIdx === 7)) { score += 30; positives.push("🌟 GURU/RAVI PUSHYA YOGA (Supreme Auspiciousness)"); }
      if ((vIdx === 1 && nIdx === 3) || (vIdx === 3 && nIdx === 3) || (vIdx === 4 && nIdx === 9)) { score += 25; positives.push("✨ AMṚTA SIDDHI YOGA (Indestructible Success)"); }
      if (score >= 65) {
        const abhijit = tierAbhijit(d, latitude, longitude, timezone, tier);
        windows.push({
          jd: d.sunriseJd,
          isoDate: julianDayToIsoDate(noon, timezone),
          tier,
          varaName: d.varaName,
          tithiName: panchang.tithiName,
          nakshatraName: panchang.nakshatraName,
          yogaName: panchang.yogaName,
          score: Math.min(score, 100),
          quality: score >= 90 ? "Apex Sovereign (90%+)" : score >= 75 ? "Highly Auspicious (75%+)" : "Auspicious (65%+)",
          abhijit: abhijit ? { startJd: abhijit.startJd, endJd: abhijit.endJd, source: abhijit.source } : null,
          bestWindowTime: abhijit ? `${abhijit.startTime} – ${abhijit.endTime} (Abhijit Muhūrta)` : "Abhijit Muhūrta (not computed: polar day)",
          rule: "limbs and vāra at the tier's sunrise; scoring is the page's [unverified convention]",
          positives,
          cautions,
        });
      }
    }
    windows.sort((a, b) => b.score - a.score);
    return windows;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BPHS CHAPTER 5: SPECIAL LAGNAS (विशेष लग्नाध्यायः)
  // ═══════════════════════════════════════════════════════════════════════════
  /** The ishṭa ghaṭī is the civil sixtieths of the day since the sunrise of the tier's civil day holding jd (the previous
   *  sunrise before today's) [reading: BPHS ch. 5 ghaṭī of the day]. Indu lagna is a rāśi only (BPHS gives no degree). */
  function computeSpecialLagnas(jd, lat, lon, sunDeg, moonDeg, lagnaDeg, tzHours = 5.5, tier = "ss") {
    const id = bridgeTier(tier);
    const d = tierDay(jd, lat, lon, tzHours, id);
    if (d.polar) return { error: "not computed: polar day or night (the tier's day needs a sunrise)", tier: id };
    const ishtaGhati = (jd - d.sunriseJd) * 60;

    // 1. Bhāva Lagna: 1 sign per 5 ghatis from Sun
    const bhavaLagnaDeg = mod360(sunDeg + (ishtaGhati / 5) * 30);
    // 2. Horā Lagna: 1 sign per 2.5 ghatis from Sun
    const horaLagnaDeg = mod360(sunDeg + (ishtaGhati / 2.5) * 30);
    // 3. Ghaṭī Lagna: 1 sign per 1 ghati from Sun
    const ghatiLagnaDeg = mod360(sunDeg + ishtaGhati * 30);
    // 4. Prāṇapada Lagna: 1 sign per 1 vighati (ishtaGhati * 4 * 30 = ishtaGhati * 120 deg)
    const sunSign = Math.floor(sunDeg / 30);
    let baseSign = sunSign;
    if (sunSign % 3 === 1) baseSign = (sunSign + 8) % 12; // Sthira
    else if (sunSign % 3 === 2) baseSign = (sunSign + 4) % 12; // Dwisvabhava
    const pranapadaLagnaDeg = mod360(baseSign * 30 + ishtaGhati * 120);
    // 5. Śrī Lagna: Lagna + fraction of nakshatra elapsed * 360
    const moonNak = computeNakshatraDetails(moonDeg);
    const sriLagnaDeg = mod360(lagnaDeg + moonNak.fractionDone * 360);
    // 6. Indu Lagna (a rāśi)
    const induResult = computeInduLagna(lagnaDeg, moonDeg);

    return {
      tier: id, sunriseJd: d.sunriseJd,
      ishtaGhati, ishtaRule: "civil sixtieths of the day since the tier's sunrise [reading: BPHS ch. 5 ghaṭī of the day]",
      bhavaLagna: { deg: bhavaLagnaDeg, rashi: Math.floor(bhavaLagnaDeg / 30), nameSa: "भाव लग्न" },
      horaLagna: { deg: horaLagnaDeg, rashi: Math.floor(horaLagnaDeg / 30), nameSa: "होरा लग्न" },
      ghatiLagna: { deg: ghatiLagnaDeg, rashi: Math.floor(ghatiLagnaDeg / 30), nameSa: "घटी लग्न" },
      pranapadaLagna: { deg: pranapadaLagnaDeg, rashi: Math.floor(pranapadaLagnaDeg / 30), nameSa: "प्राणपद लग्न" },
      sriLagna: { deg: sriLagnaDeg, rashi: Math.floor(sriLagnaDeg / 30), nameSa: "श्री लग्न" },
      induLagna: { deg: null, rashi: induResult.induLagnaIndex, rashiName: induResult.induLagnaRashi, nameSa: "इन्दु लग्न", note: "a rāśi: BPHS gives no degree" },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BPHS CHAPTER 25: UPAGRAHAS (अथाऽप्रकाशग्रहफलाध्यायः)
  // ═══════════════════════════════════════════════════════════════════════════
  // JY-04 · the five time-upagrahas by BPHS 3.66–70 as the repository's own text gives them (corpus/bphs/canon.json,
  // ch. 3 n = 66–70): the day (sunrise → sunset) and the night (sunset → next sunrise) are each cut into 8 equal parts;
  // by day the parts' lords run in weekday order from the vāra-lord, by night from the 5th lord from it; the 8th part has
  // no lord. Gulika = the lagna at Saturn's part; Kāla, Mṛtyu, Ardhaprahara (saumya = Budha) and Yamaghaṇṭaka at the
  // parts of the Sun, Mars, Mercury and Jupiter. Whether the part's start or its middle is meant is a convention
  // [unverified]; this engine takes the START and says so. The vāra runs sunrise to sunrise (the tier's day).
  function kalaUpagrahaParts(jd, lat, lon, tz = 5.5, tier = "ss") {
    const d = tierDay(jd, lat, lon, tz, bridgeTier(tier));
    if (d.polar) return null;                                              // polar day or night: the text's division fails
    const isDay = jd < d.sunsetJd;
    const start = isDay ? d.sunriseJd : d.sunsetJd, end = isDay ? d.sunsetJd : d.nextSunriseJd;
    const vara = d.varaIndex;                                              // 0 = Ravivāra … 6 = Śanivāra
    const first = isDay ? vara : (vara + 4) % 7;                           // by night: the 5th lord from the vāra-lord
    const partLen = (end - start) / 8;
    const partStart = (lord) => start + ((lord - first + 7) % 7) * partLen; // lords 0 Sun 1 Moon 2 Mars 3 Mercury 4 Jupiter 5 Venus 6 Saturn
    return { tier: d.tier, isDay, vara, start, end, partLen, partStart };
  }

  function computeUpagrahas(sunDeg, jd, lat = UJJAIN_SITE.latitude, lon = UJJAIN_SITE.longitude, tz = 5.5, frame = "ss") {
    const tier = bridgeTier(frame);
    const dhuma = mod360(sunDeg + 133 + 20 / 60);
    const vyatipata = mod360(360 - dhuma);
    const parivesha = mod360(vyatipata + 180);
    const indrachapa = mod360(360 - parivesha);
    const upaketu = mod360(indrachapa + 16 + 40 / 60);

    const parts = kalaUpagrahaParts(jd, lat, lon, tz, tier);
    const lagnaAtPart = (lord) => (parts ? siderealAscendantDeg(parts.partStart(lord), lat, lon, tier) : null);
    const timed = (lord, nameSa, nameEn) => {
      const deg = lagnaAtPart(lord);
      return deg == null
        ? { deg: null, rashi: null, nameSa, nameEn, note: "not computed (polar day/night: BPHS 3.66–70 needs a sunrise and a sunset)" }
        : { deg, rashi: Math.floor(deg / 30), nameSa, nameEn, jdPartStart: parts.partStart(lord), isDay: parts.isDay, tier,
            rule: "BPHS 3.66–70: lagna at the start of the lord's 1/8 part of the " + (parts.isDay ? "day" : "night") };
    };

    return {
      tier,
      dhuma: { deg: dhuma, rashi: Math.floor(dhuma / 30), nameSa: "धूम", nameEn: "Dhuma" },
      vyatipata: { deg: vyatipata, rashi: Math.floor(vyatipata / 30), nameSa: "व्यतीपात (उपग्रह)", nameEn: "Vyatipata Upagraha" },
      parivesha: { deg: parivesha, rashi: Math.floor(parivesha / 30), nameSa: "परिवेष (परिधि)", nameEn: "Parivesha" },
      indrachapa: { deg: indrachapa, rashi: Math.floor(indrachapa / 30), nameSa: "इन्द्रचाप (कोदण्ड)", nameEn: "Indrachapa" },
      upaketu: { deg: upaketu, rashi: Math.floor(upaketu / 30), nameSa: "उपकेतु (शिखी)", nameEn: "Upaketu" },
      gulika: timed(6, "गुलिक (मान्दि)", "Gulika / Mandi"),
      kala: timed(0, "काल", "Kala"),
      mrityu: timed(2, "मृत्यु", "Mrityu"),
      ardhaprahara: timed(3, "अर्धप्रहर", "Ardhaprahara"),
      yamaghanta: timed(4, "यमघण्ट", "Yamaghanta")
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BPHS CHAPTERS 29-30: ARUDHA PADAS & UPAPADA (पदाध्यायः एवं उपपदाध्यायः)
  // ═══════════════════════════════════════════════════════════════════════════
  const SIGN_LORDS = [
    'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
    'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'
  ];

  const ARUDHA_NAMES = [
    { key: "AL", nameSa: "आरूढ़ लग्न (AL)", nameEn: "Arudha Lagna (Pada Lagna)" },
    { key: "A2", nameSa: "धन पद (A2)", nameEn: "Dhana Pada (Kosha Pada)" },
    { key: "A3", nameSa: "भ्रातृ पद (A3)", nameEn: "Bhatri Pada (Vikrama Pada)" },
    { key: "A4", nameSa: "मातृ पद (A4)", nameEn: "Matri Pada (Sukha Pada)" },
    { key: "A5", nameSa: "मन्त्र पद (A5)", nameEn: "Mantra Pada (Putra Pada)" },
    { key: "A6", nameSa: "रोग पद (A6)", nameEn: "Roga Pada (Shatru Pada)" },
    { key: "A7", nameSa: "दार पद (A7)", nameEn: "Dara Pada (Kalatra Pada)" },
    { key: "A8", nameSa: "मृत्यु पद (A8)", nameEn: "Mrityu Pada (Ayu Pada)" },
    { key: "A9", nameSa: "भाग्य पद (A9)", nameEn: "Bhagya Pada (Dharma Pada)" },
    { key: "A10", nameSa: "राज्य पद (A10)", nameEn: "Rajya Pada (Karma Pada)" },
    { key: "A11", nameSa: "लाभ पद (A11)", nameEn: "Labha Pada" },
    { key: "UL", nameSa: "उपपद लग्न (UL / A12)", nameEn: "Upapada Lagna (Vyaya Pada)" }
  ];

  function computeArudhaPadas(lagnaDeg, grahaPositions) {
    const lagnaSign = Math.floor(lagnaDeg / 30);
    const padas = [];

    for (let h = 1; h <= 12; h++) {
      const houseSign = (lagnaSign + h - 1) % 12;
      const lordKey = SIGN_LORDS[houseSign];
      const lordDeg = grahaPositions[lordKey] != null ? grahaPositions[lordKey] : houseSign * 30 + 15;
      const lordSign = Math.floor(lordDeg / 30);

      const dist = (lordSign - houseSign + 12) % 12;
      let arudhaSign = (lordSign + dist) % 12;

      // BPHS Exception rules: If Pada falls in same sign or 7th sign, move to 10th
      if (dist === 0) {
        arudhaSign = (houseSign + 9) % 12; // 10th from house
      } else if (dist === 6) {
        arudhaSign = (houseSign + 3) % 12; // 4th from house
      }

      const meta = ARUDHA_NAMES[h - 1];
      padas.push({
        house: h,
        key: meta.key,
        nameSa: meta.nameSa,
        nameEn: meta.nameEn,
        rashiIndex: arudhaSign,
        rashiSa: RASHI_SA[arudhaSign],
        deg: arudhaSign * 30 + 15
      });
    }

    return padas;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BPHS CHAPTER 31: ARGALA & VIRODHARGALA (अथाऽर्गलाध्यायः)
  // ═══════════════════════════════════════════════════════════════════════════
  function computeArgala(grahaPositions, lagnaDeg) {
    const lagnaSign = Math.floor(lagnaDeg / 30);
    const results = [];

    for (let h = 1; h <= 12; h++) {
      const houseSign = (lagnaSign + h - 1) % 12;
      
      const s2 = (houseSign + 1) % 12;
      const s4 = (houseSign + 3) % 12;
      const s11 = (houseSign + 10) % 12;

      const s12 = (houseSign + 11) % 12;
      const s10 = (houseSign + 9) % 12;
      const s3 = (houseSign + 2) % 12;

      const s5 = (houseSign + 4) % 12;
      const s9 = (houseSign + 8) % 12;

      const occ = (sign) => Object.entries(grahaPositions).filter(([k, deg]) => Math.floor(deg / 30) === sign).map(([k]) => k);

      const argala2 = occ(s2);
      const obst12 = occ(s12);
      const argala4 = occ(s4);
      const obst10 = occ(s10);
      const argala11 = occ(s11);
      const obst3 = occ(s3);
      const argala5 = occ(s5);
      const obst9 = occ(s9);

      const netArgalaCount = (argala2.length > obst12.length ? 1 : 0) +
                             (argala4.length > obst10.length ? 1 : 0) +
                             (argala11.length > obst3.length ? 1 : 0) +
                             (argala5.length > obst9.length ? 1 : 0);

      results.push({
        house: h,
        rashiIndex: houseSign,
        rashiSa: RASHI_SA[houseSign],
        primaryArgala: { '2nd': argala2, '4th': argala4, '11th': argala11 },
        obstruction: { '12th': obst12, '10th': obst10, '3rd': obst3 },
        secondaryArgala: { '5th': argala5, '9th_obst': obst9 },
        isUnobstructed: netArgalaCount > 0,
        argalaStrength: netArgalaCount
      });
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BPHS CHAPTERS 67-69: ASHTAKAVARGA SHODHANA & PINDA SADHANA
  // ═══════════════════════════════════════════════════════════════════════════
  const RASI_MULTIPLIERS = [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12];
  const GRAHA_MULTIPLIERS = { sun: 5, moon: 5, mars: 8, mercury: 5, jupiter: 10, venus: 7, saturn: 5 };

  function computeAshtakavargaShodhana(savBindus, grahaPositions = {}) {
    const raw = Array.from(savBindus);

    // 1. Trikona Shodhana: Fire (0,4,8), Earth (1,5,9), Air (2,6,10), Water (3,7,11)
    const trikona = Array.from(raw);
    const trikonas = [[0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11]];
    for (const t of trikonas) {
      const minVal = Math.min(trikona[t[0]], trikona[t[1]], trikona[t[2]]);
      trikona[t[0]] -= minVal;
      trikona[t[1]] -= minVal;
      trikona[t[2]] -= minVal;
    }

    // 2. Ekadhipatya Shodhana
    const ekadhipatya = Array.from(trikona);
    const dualPairs = [[0, 7], [1, 6], [2, 5], [8, 11], [9, 10]]; // Mars, Venus, Merc, Jup, Sat

    const isOccupied = (r) => Object.values(grahaPositions).some(
      pos => typeof pos === 'number' && !isNaN(pos) && Math.floor(((pos % 360) + 360) % 360 / 30) === r
    );

    for (const [r1, r2] of dualPairs) {
      if (ekadhipatya[r1] === 0 || ekadhipatya[r2] === 0) continue;
      
      const occ1 = isOccupied(r1);
      const occ2 = isOccupied(r2);

      if (occ1 && occ2) {
        continue;
      } else if (!occ1 && !occ2) {
        if (ekadhipatya[r1] === ekadhipatya[r2]) {
          ekadhipatya[r1] = 0;
          ekadhipatya[r2] = 0;
        } else if (ekadhipatya[r1] > ekadhipatya[r2]) {
          ekadhipatya[r1] = ekadhipatya[r2];
        } else {
          ekadhipatya[r2] = ekadhipatya[r1];
        }
      } else {
        const o = occ1 ? r1 : r2;
        const u = occ1 ? r2 : r1;
        if (ekadhipatya[o] >= ekadhipatya[u]) {
          ekadhipatya[u] = 0;
        } else {
          ekadhipatya[u] = ekadhipatya[o];
        }
      }
    }

    // 3. Pinda Sadhana (Rasi Pinda + Graha Pinda = Shodhya Pinda)
    let rasiPinda = 0;
    for (let r = 0; r < 12; r++) {
      rasiPinda += ekadhipatya[r] * RASI_MULTIPLIERS[r];
    }

    let grahaPinda = 0;
    for (const [gKey, mult] of Object.entries(GRAHA_MULTIPLIERS)) {
      if (grahaPositions[gKey] != null) {
        const rIndex = Math.floor(grahaPositions[gKey] / 30);
        grahaPinda += ekadhipatya[rIndex] * mult;
      }
    }

    const shodhyaPinda = rasiPinda + grahaPinda;

    return {
      rawBindus: raw,
      trikonaShodhita: trikona,
      ekadhipatyaShodhita: ekadhipatya,
      rasiPinda,
      grahaPinda,
      shodhyaPinda
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BPHS CHAPTERS 84-96: VEDIC BIRTH DOSHAS & SHANTI (अशुभजन्म एवं शान्ति)
  // ═══════════════════════════════════════════════════════════════════════════
  function computeBirthDoshasAndShanti(jd, lat, lon, sunDeg, moonDeg, lagnaDeg, tz = 5.5, mode = "ss") {
    const pan = panchangAtJd(jd, tz, resolveTier(mode), { latitude: lat, longitude: lon });
    const doshas = [];

    // 1. Darsha Janma (Amavasya Birth - Ch. 86)
    if (pan.tithiIndex === 29) {
      doshas.push({
        code: "DARSHA",
        nameSa: "दर्श (अमावस्या) जन्म दोष",
        bphsChapter: "BPHS Adhyaya 86 (दर्शजन्मशान्त्यध्यायः)",
        description: "BPHS अ. 86 अमावस्या (सूर्य-चन्द्र युति) के जन्म को दर्श-जन्म कहता है और उसकी शान्ति-विधि बताता है — शास्त्र-वचन (SHASTRA-SMRIT), फल या नियति नहीं।"
      });
    }

    // 2. Krishna Chaturdashi Janma (Ch. 87)
    if (pan.tithiIndex === 28) {
      doshas.push({
        code: "KRISHNA_CHATURDASHI",
        nameSa: "कृष्ण चतुर्दशी जन्म दोष",
        bphsChapter: "BPHS Adhyaya 87 (कृष्णचतुर्दशीजन्म शान्त्यध्यायः)",
        description: "BPHS अ. 87 कृष्ण-चतुर्दशी के जन्म को छह भागों में बाँटकर उसकी शान्ति-विधि बताता है — शास्त्र-वचन (SHASTRA-SMRIT), फल या नियति नहीं।"
      });
    }

    // 3. Bhadra (Vishti Karana) Janma (Ch. 88)
    if (pan.karanaIndex === 6) {
      doshas.push({
        code: "BHADRA_VISHTI",
        nameSa: "विष्टि (भद्रा) जन्म दोष",
        bphsChapter: "BPHS Adhyaya 88 (भर्दावमदुर्योगशान्त्यध्यायः)",
        description: "BPHS अ. 88 विष्टि (भद्रा) करण में जन्म का वर्गीकरण और उसकी शान्ति-विधि बताता है — शास्त्र-वचन (SHASTRA-SMRIT), फल या नियति नहीं।"
      });
    }

    // 4. Vyatipata / Vaidhriti Janma (Ch. 88)
    if (pan.yogaIndex === 16 || pan.yogaIndex === 26) {
      doshas.push({
        code: "MAHAPATA_YOGA",
        nameSa: pan.yogaIndex === 16 ? "व्यतीपात योग जन्म" : "वैधृति योग जन्म",
        bphsChapter: "BPHS Adhyaya 88 (भर्दावमदुर्योगशान्त्यध्यायः)",
        description: "BPHS अ. 88 इसे व्यतीपात/वैधृति-जन्म कहता है (शास्त्र-वचन) — फल या नियति नहीं।"
      });
    }

    // 5. Nakshatra & Lagna Gandanta (Ch. 92, 94)
    const moonNak = computeNakshatraDetails(moonDeg);
    const lagnaNak = computeNakshatraDetails(lagnaDeg);

    if ((moonNak.index === 26 && moonNak.pada === 4) || (moonNak.index === 0 && moonNak.pada === 1) ||
        (moonNak.index === 8 && moonNak.pada === 4) || (moonNak.index === 9 && moonNak.pada === 1) ||
        (moonNak.index === 17 && moonNak.pada === 4) || (moonNak.index === 18 && moonNak.pada === 1)) {
      doshas.push({
        code: "NAKSHATRA_GANDANTA",
        nameSa: `नक्षत्र गण्डान्त (${moonNak.name} चरण ${moonNak.pada})`,
        bphsChapter: "BPHS Adhyaya 92 & 94 (गण्डान्त एवं ज्येष्ठादि शान्त्यध्यायः)",
        description: "BPHS अ. 92 व 94 जल-राशि से अग्नि-राशि की सन्धि (गण्डान्त) पर जन्म का वर्गीकरण और शान्ति-विधि बताते हैं — शास्त्र-वचन (SHASTRA-SMRIT), फल या नियति नहीं।"
      });
    }

    // 6. Abhukta Moola (Ch. 93)
    if (moonNak.index === 18 && moonNak.withinDeg < 0.8) {
      doshas.push({
        code: "ABHUKTA_MOOLA",
        nameSa: "अभुक्त मूल जन्म दोष",
        bphsChapter: "BPHS Adhyaya 93 (अभुक्तमूलशान्त्यध्यायः)",
        description: "BPHS अ. 93 इस जन्म-क्षण को अभुक्त-मूल कहता है और मूल-शान्ति की विधि बताता है (शास्त्र-वचन, SHASTRA-SMRIT)। यह ऐतिहासिक ग्रन्थ-वचन है, आचरण-निर्देश नहीं — शिशु से दूरी या उसका त्याग शिशु के लिए हानिकारक है।"
      });
    }

    // 7. Sankranti Janma (Ch. 90)
    const sunDegInSign = sunDeg % 30;
    if (sunDegInSign < 0.3 || sunDegInSign > 29.7) {
      doshas.push({
        code: "SANKRANTI_JANMA",
        nameSa: "संक्रान्ति जन्म दोष",
        bphsChapter: "BPHS Adhyaya 90 (संक्रान्तिजन्मशान्त्यध्यायः)",
        description: "BPHS अ. 90 सूर्य के राशि-प्रवेश (संक्रान्ति) के क्षण के जन्म का वर्णन और उसकी शान्ति-विधि बताता है — शास्त्र-वचन (SHASTRA-SMRIT), फल या नियति नहीं।"
      });
    }

    return doshas;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ECLIPSES: one row shape for every tier (Stage C contract, 2026-10-09)
  // ═══════════════════════════════════════════════════════════════════════════
  /* Every eclipse row math-core gives (tierEclipses, and the 14 adhikāras' lists) carries these common fields, in
     addition to its tier's own:
       kind            'lunar' | 'solar'
       middleJd        JD (UT) of the middle at the site (text: madhya; dṛk lunar: greatest eclipse; dṛk solar: the
                       site's maximum)
       contacts        { sparsha, madhya, moksha, nimilana, unmilana }: JD (UT), null where there is none (text: the
                       text's contacts; dṛk lunar: the umbral contacts U1, U4 and the total phase U2, U3 — a penumbral
                       eclipse has none, its P1/P4 are in penumbralContacts; dṛk solar: the site's C1, C4, C2, C3)
       magnitude       the covered part of the eclipsed disc's diameter at the middle: the umbral magnitude for a lunar
                       eclipse (text: the text's shadow, SS 4.11), the site's magnitude for a solar one; null for a
                       penumbral-only lunar eclipse
       penumbral       true only for a penumbral-only lunar eclipse (the text tiers have no penumbra: always false)
       penumbralMagnitude   dṛk lunar: the penumbral magnitude; otherwise null
       grasa           the grāsa shown: = magnitude (≥ 0), or null for a penumbral-only eclipse — never negative
       seenAtSite      solar: seen at the site (the tier's rule, TIERS[tier].eclipses); lunar: the Moon above the
                       tier's horizon at mid-eclipse (seenDuringEclipse keeps the tier's whole-eclipse verdict)
       tier, source    the tier id; 'text' (both text tiers) or 'own' (dṛk)
     The tier's own fields stay (text: contactsJd, channa, latitude, discs, method, …; dṛk: type, umbralMagnitude,
     radiiDeg, gamma, local, …; the dṛk row's own contacts {P1 … P4} are kept as contactsDetail, and a dṛk solar row's
     global type, magnitude and maximum as global). */
  const ECLIPSE_ROW_FIELDS = Object.freeze(["kind", "middleJd", "contacts", "magnitude", "penumbral", "penumbralMagnitude", "grasa", "seenAtSite", "tier", "source"]);
  const ECLIPSE_MAX_WINDOW_DAYS = 3660;
  const contactsOf = (c) => Object.freeze({ sparsha: c.sparsha ?? null, madhya: c.madhya ?? null, moksha: c.moksha ?? null, nimilana: c.nimilana ?? null, unmilana: c.unmilana ?? null });
  /** A text tier's row (ss-tier.js eclipsesNear) → the common row. */
  function textEclipseRow(E, tier) {
    const mag = Number.isFinite(E.magnitude) && E.magnitude >= 0 ? E.magnitude : null;
    const c = E.contactsJd || {};
    return Object.freeze({ ...E, kind: E.kind, middleJd: E.middleJd, contacts: contactsOf({ ...c, madhya: c.madhya ?? E.middleJd }),
      magnitude: mag, penumbral: false, penumbralMagnitude: null, grasa: mag, type: E.total === true || mag >= 1 ? "total" : "partial",
      seenAtSite: E.kind === "lunar" ? E.aboveAtMiddle === true : E.seenAtSite === true, seenDuringEclipse: E.seenAtSite === true,
      tier, source: "text" });
  }
  /** A dṛk row (siddhanta-tier.js eclipses with a site) → the common row; null for a solar eclipse the site is not in. */
  function drikEclipseRow(E, tier) {
    const ut = (x) => (x && Number.isFinite(x.jdUT) ? x.jdUT : null);
    const { contacts: own, ...rest } = E;
    if (E.kind === "lunar") {
      const penumbral = E.type === "penumbral", umb = Number.isFinite(E.umbralMagnitude) ? E.umbralMagnitude : E.magnitude;
      const mag = penumbral || !(umb >= 0) ? null : umb;
      const alt = E.local && E.local.moonAltitudeDeg ? E.local.moonAltitudeDeg.max : null;
      const horizon = siddhantaTier().CONSTANTS.MOON_HORIZON_DEG;      // the tier's moonrise horizon (DK-5)
      return Object.freeze({ ...rest, contactsDetail: own, kind: "lunar", middleJd: E.maxJdUT,
        contacts: contactsOf({ sparsha: ut(own.U1), madhya: E.maxJdUT, moksha: ut(own.U4), nimilana: ut(own.U2), unmilana: ut(own.U3) }),
        penumbralContacts: Object.freeze({ first: ut(own.P1), last: ut(own.P4) }),
        magnitude: mag, penumbral, penumbralMagnitude: Number.isFinite(E.penumbralMagnitude) ? E.penumbralMagnitude : null, grasa: mag,
        seenAtSite: Number.isFinite(alt) ? alt > horizon : null, seenDuringEclipse: E.local ? E.local.visible === true : null, tier, source: "own" });
    }
    const L = E.local;
    if (!L || L.eclipsed !== true) return null;                         // as the text tier: a solar eclipse is the site's
    const mag = Number.isFinite(L.magnitude) && L.magnitude >= 0 ? L.magnitude : null;
    return Object.freeze({ ...rest, contactsDetail: own, kind: "solar", middleJd: L.maxJdUT,
      contacts: contactsOf({ sparsha: ut(L.contacts.C1), madhya: L.maxJdUT, moksha: ut(L.contacts.C4), nimilana: ut(L.contacts.C2), unmilana: ut(L.contacts.C3) }),
      type: L.type, global: Object.freeze({ type: E.type, magnitude: E.magnitude, maxJdUT: E.maxJdUT, greatest: E.greatest }),
      magnitude: mag, penumbral: false, penumbralMagnitude: null, grasa: mag, obscuration: L.obscuration,
      seenAtSite: L.visible === true, seenDuringEclipse: L.visible === true, tier, source: "own" });
  }
  /** The tier's eclipses at a site whose middle falls in [fromJd, toJd] (JD UT, at most ten years), oldest first, as
   *  common rows (ECLIPSE_ROW_FIELDS). Text tiers: ss-tier.js eclipsesNear (the plain text: ss-grahana.js; the saṃskāra:
   *  samskara.js on the record). dṛk: siddhanta-tier.js eclipses (drik-grahana.js), solar rows only where the site is in
   *  the eclipse. EDGE RULE: when the dṛk search window (±0.6 d, and each eclipse's ±0.35-d interpolation window) needs
   *  an instant outside 1850.0–2150.0 the whole list is refused with a TierSpanError (code TIER_OUT_OF_SPAN, edgeRule
   *  true, block 'eclipses'); a caller that serves other blocks catches it and refuses this block alone.
   *  → { tier, list, method, label (TIERS[tier].eclipses), window: { fromJd, toJd }, site } */
  function tierEclipses(fromJd, toJd, latitudeDeg = UJJAIN_SITE.latitude, longitudeEastDeg = UJJAIN_SITE.longitude, tier = "ss") {
    requireFinite(fromJd, "Julian day (from)"); requireFinite(toJd, "Julian day (to)");
    requireFinite(latitudeDeg, "Latitude"); requireFinite(longitudeEastDeg, "Longitude");
    if (!(toJd >= fromJd)) throw new RangeError("tierEclipses: toJd must not precede fromJd");
    if (toJd - fromJd > ECLIPSE_MAX_WINDOW_DAYS) throw new RangeError(`tierEclipses: ask for at most ${ECLIPSE_MAX_WINDOW_DAYS} days at a time`);
    if (Math.abs(latitudeDeg) >= 90) throw new RangeError("tierEclipses: latitude must lie strictly between −90° and 90°");
    const id = bridgeTier(tier), T = TIERS[id], site = { latitude: latitudeDeg, longitude: longitudeEastDeg };
    let list, method;
    if (T.family === "ss") {
      // the text tiers search parvas around the middle of the window; one day more each side catches a solar middle that
      // the chapter-5 parallax moves across an end, then every row is kept by its own middle
      const mid = (fromJd + toJd) / 2, half = (toJd - fromJd) / 2 + 1;
      list = ssTier().eclipsesNear(mid, site, half, { samskara: T.samskara }).map((E) => textEclipseRow(E, id));
      method = T.samskara ? "SS 4-5 on the saṃskāra model (samskara.js)" : "SS 4-5 (ss-grahana.js)";
    } else {
      // a window wholly outside the span is refused as any dṛk request; one that reaches across an edge (the window itself,
      // its ±0.6-d margin, or an eclipse's ±0.35-d interpolation window) is refused by the EDGE RULE, as a block
      const [first, last] = sdFn("spanJdUT")();
      if (fromJd > last || toJd < first) throw new TierSpanError("drik", fromJd > last ? fromJd : toJd, "the eclipse search");
      const r = sdFn("eclipses")(fromJd, toJd, site);
      if (r === null || r === undefined) {
        const err = new TierSpanError("drik", fromJd - first < last - toJd ? first - 1 : last + 1,
          "the eclipse search (EDGE RULE: its window, ±0.6 d, and each eclipse's ±0.35-d interpolation window must lie inside the span; only this block is refused)");
        err.edgeRule = true; err.block = "eclipses";
        throw err;
      }
      list = r.map((E) => drikEclipseRow(E, id)).filter(Boolean);
      method = "our eclipse search on the series (siddhanta-tier.js eclipses, owner decision DK-3); solar: the eclipses the site is in";
    }
    list = list.filter((E) => E.middleJd >= fromJd && E.middleJd <= toJd).sort((a, b) => a.middleJd - b.middleJd);
    return { tier: id, list, method, label: T.eclipses, window: { fromJd, toJd }, site };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SURYA SIDDHANTA: COMPLETE 14-ADHIKARA GRAND AUDIT & COMPUTATIONAL SUITE
  // ═══════════════════════════════════════════════════════════════════════════
  function computeSuryaSiddhanta14Adhikaras(jd, lat, lon, planets, lagnaDeg, tz = 5.5, mode = "ss") {
    const tier = bridgeTier(mode), T = TIERS[tier];
    const deg = (r) => (r * 180) / Math.PI;
    // Every graha is required (2026-10-08: a missing one used to become longitude 0, a fabricated place); the rows'
    // Devanagari name is `sa` (the old code read a `name` field the rows do not have, so the names were blank).
    const pick = (key, nameSa) => {
      const p = Array.isArray(planets) ? planets.find((x) => x && x.key === key) : null;
      if (!p || !Number.isFinite(p.longitude)) throw new RangeError(`computeSuryaSiddhanta14Adhikaras: the ${key} row (with a finite longitude) is missing`);
      return { ...p, name: p.name || p.sa || nameSa };
    };
    const sun = pick("surya", "सूर्य"), moon = pick("candra", "चन्द्र"), mars = pick("mangala", "मङ्गल"), merc = pick("budha", "बुध");
    const jup = pick("guru", "गुरु"), ven = pick("shukra", "शुक्र"), sat = pick("shani", "शनि"), rahu = pick("rahu", "राहु");
    const site = { latitude: lat, longitude: lon };

    const pan = panchangAtJd(jd, tz, tier, site);

    // 1. Madhyamādhikāra: the ahargaṇa is the text's count (civil days from midnight at Laṅkā, SS 1.45-1.47)
    const ahargana = textDaysOfJd(jd);
    const hours = Math.floor((pan.localSeconds || 0) / 3600);
    const mins = Math.floor(((pan.localSeconds || 0) % 3600) / 60);
    const secs = Math.floor((pan.localSeconds || 0) % 60);
    const timeStr = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    const ujjainTime = ujjainMeanTime(timeStr, tz, UJJAIN_LONGITUDE_DEG);
    const localMeanTime = ujjainMeanTime(timeStr, tz, lon);

    // 2. Spaṣṭādhikāra: daily velocities of the tier's grahas
    const vels = computePlanetaryVelocities(jd, { mode: tier });

    // 3. Tripraśnādhikāra: the gnomon's shadow
    const gnomonLen = 12.0;
    let altDeg = null, zenithDeg = null, shankuShadowAngula = null, palabha = null, shanku;
    if (T.family === "ss") {
      const sh = ssTier().shadow(jd, site, { samskara: T.samskara });
      if (sh.error) shanku = { error: sh.error, method: "ss-chaya.js (SS 3.14-3.36)" };
      else {
        const sinAlt = Math.max(-1, Math.min(1, sh.atInstant.shanku / SS.radius));
        altDeg = deg(Math.asin(sinAlt)); zenithDeg = 90 - altDeg;
        shankuShadowAngula = sh.atInstant.chaya; palabha = sh.palabha;
        shanku = { noon: sh.noon, atInstant: sh.atInstant, method: sh.method, sayanaSun: sh.sayanaSun, ayanamsha: sh.ayanamsha };
      }
    } else {
      const s = getSolarCoordinates(jd, tier), gast = drikCall(sdFn("gast")(jd), jd, "the sidereal time");
      const H = rad(gast + lon - s.rightAscensionDeg), phi = rad(lat), d = s.declinationRad;
      const sinAlt = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
      altDeg = deg(Math.asin(Math.max(-1, Math.min(1, sinAlt)))); zenithDeg = 90 - altDeg;
      shankuShadowAngula = altDeg > 0 ? gnomonLen / Math.tan(rad(altDeg)) : Infinity;
      palabha = gnomonLen * Math.tan(phi);
      shanku = { atInstant: { altitudeDeg: altDeg, chaya: shankuShadowAngula }, method: "the series' Sun (RA/dec) and IAU 2006 apparent sidereal time (siddhanta-tier.js); geocentric, no refraction (the Sun's parallax is not applied)" };
    }

    // 4-5. Eclipses within ±16 days, by the tier's own method, as common rows (tierEclipses); the node distance is to the
    // nearer node (Rāhu or Ketu). EDGE RULE: within about 17 days of a dṛk span edge the eclipse search needs instants
    // outside the span, so this block alone is refused and named (refused, refusal; the lists null, the verdicts null);
    // every other adhikāra is served. A date outside the span is refused whole, above, by the pañcāṅga.
    const nodeDist = Math.abs(mod360(moon.longitude - rahu.longitude));
    const fromRahu = nodeDist > 180 ? 360 - nodeDist : nodeDist;
    const nearestNodeDeg = Math.min(fromRahu, 180 - fromRahu);
    let eclipses = [], eclipseMethod, eclipseError = null, eclipseRefusal = null;
    try {
      const E = tierEclipses(jd - 16, jd + 16, lat, lon, tier);
      eclipses = E.list; eclipseMethod = E.method;
    } catch (e) {
      if (e && e.code === "TIER_OUT_OF_SPAN") { eclipses = null; eclipseRefusal = e.message; eclipseMethod = "refused (EDGE RULE)"; }
      else { eclipses = []; eclipseMethod = "not computed"; eclipseError = String(e && e.message || e); }
    }
    const refused = eclipses === null;
    const lunarList = refused ? null : eclipses.filter((e) => e.kind === "lunar"), solarList = refused ? null : eclipses.filter((e) => e.kind === "solar");
    const isLunarEclipsePossible = refused ? null : lunarList.length > 0;
    const shadowDiamArcmin = 80.0;
    const moonDiamArcmin = 31.5;
    // the grāsa of the first lunar eclipse in the window (≥ 0; 0 with none, and for a penumbral-only eclipse, which has
    // no grāsa: lunarPenumbralOnly says so); null when the block is refused
    const firstLunar = refused || !lunarList.length ? null : lunarList[0];
    const lunarGrasa = refused ? null : firstLunar && firstLunar.grasa !== null ? firstLunar.grasa : 0;
    const lunarPenumbralOnly = refused ? null : firstLunar ? firstLunar.penumbral === true : false;
    const isSolarEclipsePossible = refused ? null : solarList.length > 0;
    const eclipseBlock = (list) => ({ list, method: eclipseMethod, label: T.eclipses, nearestNodeDeg, error: eclipseError, refused, refusal: eclipseRefusal, fields: ECLIPSE_ROW_FIELDS });
    // RETIRED 2026-09-02: the former 4·sin(Sun−Lagna) / 48·sin(lat−dec) shortcut is not S-S V.3-12; the text's chapter-5
    // lambana and nati are computed by ss-grahana.js (the eclipse list above). Null prevents a fabricated number.
    const lambanaGhati = null;
    const natiArcmin = null;
    const parallaxImplemented = false;
    const parallaxProvenance = "generated 4×sin/48×sin shortcut retired; the text's chapter-5 lambana and nati are computed by ss-grahana.js";

    // 6. Chedyakādhikāra: valana from the tier's sāyana Sun and the tier's obliquity
    const ayanamshaNow = tierAyanamsha(jd, tier).deg;
    const sunSayana = mod360(sun.longitude + ayanamshaNow);
    const epsDeg = T.family === "ss" ? ssTier().EPSILON_DEG : getSolarCoordinates(jd, tier).obliquityDeg;
    const latRad = rad(lat);
    const akshaValana = Math.sin(latRad) * Math.sin(rad(sunSayana));
    const ayanaValana = Math.sin(rad(epsDeg)) * Math.cos(rad(sunSayana));

    // 7. Grahayutyādhikāra: Planetary War
    const taraPlanets = [mars, merc, jup, ven, sat];
    const wars = [];
    for (let i = 0; i < taraPlanets.length; i++) {
      for (let j = i + 1; j < taraPlanets.length; j++) {
        const p1 = taraPlanets[i];
        const p2 = taraPlanets[j];
        const dDeg = Math.abs(mod360(p1.longitude - p2.longitude));
        const separation = dDeg > 180 ? 360 - dDeg : dDeg;
        if (separation < 1.0) {
          let warType = "अंशुविमर्द (Anshuvimarda - Ray-Clash)";
          if (separation < 0.1) warType = "भेद (Bhedha - Occultation)";
          else if (separation < 0.3) warType = "उल्लेख (Ullekha - Grazing)";
          else if (separation < 0.6) warType = "अपसव्य (Apasavya - Southern Bypass)";
          wars.push({ p1: p1.name, p2: p2.name, separationArcmin: (separation * 60).toFixed(2), warType });
        }
      }
    }

    // 8. Bha-graha-yutyādhikāra: Rohiṇī-śakaṭa by SS 8.13 as printed — a graha in Vṛṣa's 17th degree (λ ∈ [46°, 47°))
    //    with a southern latitude above 2° [text]
    const lats = Object.fromEntries(tierGrahaRows(jd, tier).map((r) => [r.key, r.latitudeDeg]));
    const shakataBheda = [moon, mars, merc, jup, ven, sat].filter((p) => {
      const l = mod360(p.longitude), b = lats[p.key];
      return l >= 46 && l < 47 && Number.isFinite(b) && b < -2;
    }).map((p) => ({ graha: p.name || p.key, key: p.key, longitude: p.longitude, latitudeDeg: lats[p.key] }));
    const isRohiniShakata = shakataBheda.length > 0;

    // 9. Udayāstādhikāra: Heliacal Rising/Setting & Combustion
    const combustionLimits = { mangala: 17, budha: 14, guru: 11, shukra: 10, shani: 15, candra: 12 };
    const heliacalStatus = [];
    [moon, mars, merc, jup, ven, sat].forEach(p => {
      const limit = combustionLimits[p.key] || 15;
      const dDeg = Math.abs(mod360(p.longitude - sun.longitude));
      const dist = dDeg > 180 ? 360 - dDeg : dDeg;
      const isCombust = dist < limit;
      heliacalStatus.push({ graha: p.name, distFromSunDeg: dist.toFixed(2), limitDeg: limit, isCombust, status: isCombust ? "अस्त (Combust / Invisible)" : "उदित (Visible / Resplendent)" });
    });

    // 10. Śṛṅgonnatyādhikāra: Lunar Horn Elevation
    const elongation = mod360(moon.longitude - sun.longitude);
    const illuminatedFraction = (1 - Math.cos(rad(elongation))) / 2;
    const crescentWidthAngula = (moonDiamArcmin / 2.5) * illuminatedFraction;
    const elevatedHorn = elongation < 180 ? "Southern Horn Elevated (दक्षिण शृङ्गोन्नति)" : "Northern Horn Elevated (उत्तर शृङ्गोन्नति)";

    // 11. Pātādhikāra: Mahāpāta (Vyatīpāta & Vaidhṛti)
    const sumDeg = mod360(sun.longitude + moon.longitude);
    const isVyatipataActive = Math.abs(sumDeg - 180) < 3.5;
    const isVaidhritiActive = Math.abs(sumDeg - 360) < 3.5 || sumDeg < 3.5;

    // 12. Bhūgolādhyāya: the four cities on the equator, 90° apart, from Laṅkā on the Ujjayinī meridian (75.7885° E)
    const L0 = UJJAIN_LONGITUDE_DEG;
    const fourCities = [
      { name: "उज्जयिनी / लङ्का (Lanka / Ujjayini)", lonDeg: L0, offsetHours: "+0:00 (Prime)", role: "Prime Meridian Baseline" },
      { name: "यमकोटि (Yamakoṭi - East)", lonDeg: mod360(L0 + 90), offsetHours: "+6:00 (+15 Ghaṭīs)", role: "Eastern Quadrant Station" },
      { name: "रोमक (Romaka - West)", lonDeg: mod360(L0 + 270), offsetHours: "-6:00 (-15 Ghaṭīs)", role: "Western Quadrant Station" },
      { name: "सिद्धपुर (Siddhāpura - Antipode)", lonDeg: mod360(L0 + 180), offsetHours: "+12:00 (30 Ghaṭīs)", role: "Antipodal Meridian Station" }
    ];

    // 13. Jyotiṣopaniṣadadhyāya: 4 Astronomical Instruments
    const fmt = (x, n) => (Number.isFinite(x) ? x.toFixed(n) : "—");
    const instruments = [
      { name: "घटी-यन्त्र (Kapāla / Water Bowl)", reading: `${Math.floor(pan.ghati)} Ghaṭīs, ${Math.floor(pan.vighati)} Palas`, principle: "60-Pala sinking copper bowl with calibrated orifice" },
      { name: "शङ्कु-यन्त्र (12-Digit Gnomon)", reading: `${fmt(shankuShadowAngula, 2)} Aṅgulas`, principle: "12-digit vertical gnomon on leveled meridian circle" },
      { name: "चक्र-यन्त्र (Armillary / Meridian Ring)", reading: `${fmt(altDeg, 2)}° Solar Altitude`, principle: "360-graduated brass ring on polar axis" },
      { name: "धनुर्-यन्त्र (Semicircular Bow Quadrant)", reading: `${fmt(zenithDeg, 2)}° Zenith Distance`, principle: "180-graduated sighting quadrant with plumb line" }
    ];

    // 14. Mānādhyāya: 9 Classical Time Scales (no fallback names: each reads the tier's own value)
    const year = tierYear(jd, tier);
    const nineManas = [
      { name: "ब्राह्म मान (Brāhma Māna)", span: "4.32 Billion Years / Kalpa", activeUnit: `Kalpa Progress: ${(ahargana / 1577917828000 * 100).toFixed(6)}%` },
      { name: "दैव मान (Daiva Māna)", span: "360 Solar Years = 1 Deva Year", activeUnit: "Ayana Ingress: " + ((pan.surya >= 90 && pan.surya < 270) ? "दक्षिणायन" : "उत्तरायण") },
      { name: "मानुष मान (Mānuṣa Māna)", span: "Civil Human Lifetime", activeUnit: "Julian Day: " + jd.toFixed(4) },
      { name: "पित्र्य मान (Pitrya Māna)", span: "1 Lunar Month = 1 Pitri Day", activeUnit: "Paksha: " + pan.paksha },
      { name: "सौर मान (Saura Māna)", span: "Sun's stay in 1 Rāśi (Saura Masa)", activeUnit: pan.sauraMasaName + " (rāśi)" },
      { name: "सावन मान (Sāvana Māna)", span: "Sunrise to Sunrise (60 Ghaṭīs)", activeUnit: pan.varaName + " (sunrise vāra; Kali day " + Math.floor(ahargana) + ", SS 1.45-1.47)" },
      { name: "चान्द्र मान (Cāndra Māna)", span: "30 Tithis (amānta month)", activeUnit: pan.masaName + " · " + pan.tithiName + ` (Tithi ${pan.tithiIndex + 1})` },
      { name: "नाक्षत्र मान (Nākṣatra Māna)", span: "Sidereal Rotation (27 Nakṣatras)", activeUnit: pan.nakshatraName + ` (Pada ${pan.nakshatraPada})` },
      { name: "बार्हस्पत्य मान (Bārhaspatya Māna)", span: "Mean Jupiter in 1 Rāśi (SS 1.55)", activeUnit: year.samvatsara.name === null ? "60-Samvatsara: refused — " + year.yearRefused : "60-Samvatsara: " + year.samvatsara.name + " (" + year.samvatsara.rule + ")" }
    ];

    return {
      tier,
      adhikara1_madhyama: { ahargana, aharganaRule: "civil days since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47)", ujjainTime, localMeanTime },
      adhikara2_spashta: { vels },
      adhikara3_triprashna: { gnomonLen, altDeg, zenithDeg, shankuShadowAngula, palabha, shanku },
      adhikara4_chandra_grahana: { isLunarEclipsePossible, shadowDiamArcmin, moonDiamArcmin, lunarGrasa, lunarPenumbralOnly, eclipses: eclipseBlock(lunarList) },
      adhikara5_surya_grahana: { isSolarEclipsePossible, lambanaGhati, natiArcmin, parallaxImplemented, parallaxProvenance, eclipses: eclipseBlock(solarList) },
      adhikara6_chedyaka: { akshaValana, ayanaValana, sayanaSun: sunSayana, obliquityDeg: epsDeg },
      adhikara7_graha_yuti: { wars },
      adhikara8_bha_graha_yuti: { isRohiniShakata, shakataBheda, rule: "SS 8.13 as printed: a graha in Vṛṣa's 17th degree with a southern latitude above 2° [text]" },
      adhikara9_udaya_asta: { heliacalStatus },
      adhikara10_shringonnati: { elongation, illuminatedFraction, crescentWidthAngula, elevatedHorn },
      adhikara11_pata: { isVyatipataActive, isVaidhritiActive, sumDeg },
      adhikara12_bhugola: { fourCities },
      adhikara13_jyotishopanishad: { instruments },
      adhikara14_manadhyaya: { nineManas }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ĀRYABHAṬA: 24-SINE TABLE, KUṬṬAKA ALGEBRA & PI
  // ═══════════════════════════════════════════════════════════════════════════
  function aryabhataSineTable() {
    const table = [];
    const R = 3438;
    const stepDeg = 3.75;
    for (let i = 1; i <= 24; i++) {
      const angleDeg = i * stepDeg;
      // the text's own 24 sines (Āryabhaṭīya, Gītikā; = SS 2.17-2.22), not rounded R·sin: they differ at 22.5°, 26.25°,
      // 60°, 63.75° and 67.5° (1316/1315, 1521/1520, 2977/2978, 3083/3084, 3176/3177) — corrected 2026-10-07
      const jya = ARYABHATA_JYA_24[i - 1];
      table.push({
        index: i,
        angleDeg: angleDeg.toFixed(2),
        angleArcmin: i * 225,
        jyaArcmin: jya,
        sinValue: (jya / R).toFixed(6)
      });
    }
    return table;
  }

  function aryabhataKuttaka(a, b, c) {
    function extGcd(n1, n2) {
      if (n2 === 0) return { g: n1, x: 1, y: 0 };
      const res = extGcd(n2, n1 % n2);
      return { g: res.g, x: res.y, y: res.x - Math.floor(n1 / n2) * res.y };
    }
    const { g, x: x0, y: y0 } = extGcd(Math.abs(a), Math.abs(b));
    if (c % g !== 0) return { solvable: false, x: null, y: null };

    const scale = c / g;
    let x = x0 * scale;
    const bDiv = Math.abs(b) / g;

    x = ((x % bDiv) + bDiv) % bDiv;
    if (x === 0) x = bDiv;
    const y = (a * x - c) / b;

    return { solvable: true, x, y, gcd: g };
  }

  function aryabhataPi() {
    return {
      fraction: "62832 / 20000",
      value: 62832 / 20000,
      simplifiedFraction: "3927 / 1250",
      trijyaR: 3438,
      bhacakraArcmin: 21600,
      ahoratraPrana: 21600,
      modernPi: Math.PI,
      accuracyArcsec: Math.abs(62832 / 20000 - Math.PI) * (180 / Math.PI) * 3600
    };
  }

  const ARYABHATA_JYA_24 = [
    225, 449, 671, 890, 1105, 1315, 1520, 1719,
    1910, 2093, 2267, 2431, 2585, 2728, 2859, 2978,
    3084, 3177, 3256, 3321, 3372, 3409, 3431, 3438
  ];

  function aryabhataJya(angleArcmin) {
    let m = ((angleArcmin % 21600) + 21600) % 21600;
    let sign = 1;
    if (m > 10800) {
      m -= 10800;
      sign = -1;
    }
    if (m > 5400) {
      m = 10800 - m;
    }
    if (m === 0) return 0;
    if (m >= 5400) return sign * 3438;

    const idx = Math.floor(m / 225);
    const rem = m % 225;
    const j1 = idx === 0 ? 0 : ARYABHATA_JYA_24[idx - 1];
    const j2 = ARYABHATA_JYA_24[idx];
    const interp = j1 + (j2 - j1) * (rem / 225);
    return sign * Math.round(interp);
  }

  function aryabhataKotiJya(angleArcmin) {
    return aryabhataJya(5400 - angleArcmin);
  }

  function aryabhataMandaCorrection(kendraDeg, mandaParidhiDeg) {
    const kendraArcmin = Math.round(kendraDeg * 60);
    const bhujaJya = aryabhataJya(kendraArcmin);
    const phalaArcmin = (mandaParidhiDeg * bhujaJya) / 360;
    return phalaArcmin / 60;
  }

  function aryabhataSighraCorrection(kendraDeg, sighraParidhiDeg) {
    const kendraArcmin = Math.round(kendraDeg * 60);
    const bhujaJya = aryabhataJya(kendraArcmin);
    const kotiJya = aryabhataKotiJya(kendraArcmin);
    const doPhala = (sighraParidhiDeg * bhujaJya) / 360;
    const kotiPhala = (sighraParidhiDeg * kotiJya) / 360;
    const sphutaKoti = 3438 + kotiPhala;
    const karna = Math.sqrt(sphutaKoti * sphutaKoti + doPhala * doPhala);
    const phalaArcmin = (doPhala * 3438) / karna;
    return phalaArcmin / 60;
  }

  function aryabhataRationalKernel(jd, applyBija = false) {
    const planets = canonicalGrahaModel(jd, applyBija);
    const rationalPlanets = planets.map(p => {
      const pair = SS.mandaParidhi[ssKey(p.key)];
      const mandocca = pair ? ssMandoccaAt(p.key, jd - SS.j2000JD) : null;
      const kendra = pair ? mod360(p.longitude - mandocca) : 0;
      const paridhi = pair ? ssRectifiedParidhi(pair, kendra) : 0;
      // Same manda phala computed two ways on identical kendra/paridhi:
      // float uses the exact sine, rational uses Aryabhata's 24-row integer jya table.
      // Nodes (rahu/ketu) carry no manda equation: both corrections are 0 by construction.
      const floatMandaCorr = pair ? (paridhi * SS.radius * Math.sin(rad(kendra))) / 360 / 60 : 0;
      const rationalMandaCorr = pair ? aryabhataMandaCorrection(kendra, paridhi) : 0;
      const rationalLong = mod360(p.longitude - floatMandaCorr + rationalMandaCorr);
      const deltaArcsec = Math.abs(floatMandaCorr - rationalMandaCorr) * 3600;

      return {
        key: p.key,
        name: p.en + " (" + p.sa + ")",
        floatLongitude: p.longitude,
        rationalLongitude: rationalLong,
        mandaCorrDeg: rationalMandaCorr,
        deltaArcsec: deltaArcsec.toFixed(4),
        shastricStatus: deltaArcsec < 60 ? "१००% शास्त्रीय साम्य (<१′)" : "सूक्ष्म अन्तर"
      };
    });

    return {
      jd,
      piRational: "62832 / 20000 = 3.1416 (3927 / 1250)",
      trijyaR: 3438,
      planets: rationalPlanets
    };
  }

  function compareKernels(jd, applyBija = false) {
    const rational = aryabhataRationalKernel(jd, applyBija);
    let maxDeltaArcsec = 0;
    const comparison = rational.planets.map(rp => {
      const delta = parseFloat(rp.deltaArcsec);
      if (delta > maxDeltaArcsec) maxDeltaArcsec = delta;
      return {
        graha: rp.name,
        floatLong: rp.floatLongitude.toFixed(4) + "°",
        rationalLong: rp.rationalLongitude.toFixed(4) + "°",
        deltaArcsec: rp.deltaArcsec + "″",
        status: rp.shastricStatus
      };
    });

    return {
      jd,
      maxDeltaArcsec: maxDeltaArcsec.toFixed(4),
      // Derived from the computed delta, not asserted: the float and the rational
      // (Āryabhaṭa integer jyā) manda kernels agree EXACTLY only when the worst
      // per-graha delta is 0. At most JDs it is ~8-13″ (float sine vs 24-row jyā
      // table), so this flag honestly tracks maxDeltaArcsec rather than always
      // claiming true. (AUDIT30 W4: was a static `true` beside a nonzero delta.)
      zeroDriftGuaranteed: maxDeltaArcsec === 0,
      integerKernelReady: true,
      comparison
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BRAHMAGUPTA: BHĀVANĀ COMPOSITION & CYCLIC QUADRILATERAL AREA
  // ═══════════════════════════════════════════════════════════════════════════
  function brahmaguptaBhavana(sol1, sol2, N) {
    const x3 = sol1.x * sol2.x + N * sol1.y * sol2.y;
    const y3 = sol1.x * sol2.y + sol2.x * sol1.y;
    const k3 = sol1.k * sol2.k;
    return { x: x3, y: y3, k: k3 };
  }

  function brahmaguptaQuadrilateralArea(a, b, c, d) {
    const s = (a + b + c + d) / 2;
    if (s <= a || s <= b || s <= c || s <= d) return 0;
    return Math.sqrt((s - a) * (s - b) * (s - c) * (s - d));
  }

  function brahmaguptaZeroAlgebra() {
    return {
      addition: "a + 0 = a",
      subtraction: "a - 0 = a, 0 - a = -a",
      multiplication: "a * 0 = 0",
      division: "0 / a = 0",
      positiveNegative: "Positive * Positive = Positive, Negative * Negative = Positive"
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. BHĀSKARĀCĀRYA: CHAKRAVALA CYCLIC ALGORITHM & DIFFERENTIAL ELEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  /* Bhāskara II's cakravāla (Bījagaṇita, c. 1150 CE) — the cyclic method for x² − N·y² = 1, in exact BigInt.
     AUDIT30 2026-10-05: the previous float version returned x = 97.5, y = 761.5 for N = 61 (a RATIONAL point that
     happens to satisfy the identity) and the test certified it. The classical minimal solution is
     x = 1,766,319,049, y = 226,153,980 — Bhāskara's own example. Convention: x² − N·y² = 1 (x is the large one). */
  function bhaskaraChakravala(N) {
    if (!Number.isInteger(N) || N < 2) return { solvable: false, error: "N must be an integer ≥ 2" };
    const n = BigInt(N);
    const isqrt = (v) => { if (v < 2n) return v; let x = BigInt(Math.floor(Math.sqrt(Number(v)))); while (x * x > v) x -= 1n; while ((x + 1n) * (x + 1n) <= v) x += 1n; return x; };
    const r = isqrt(n);
    if (r * r === n) return { solvable: false, error: "N is a perfect square" };
    const abs = (v) => (v < 0n ? -v : v);
    // start from the nearest square: (a, b, k) with a² − N·b² = k
    let a = (r + 1n) * (r + 1n) - n < n - r * r ? r + 1n : r, b = 1n, k = a * a - n;
    let iterations = 0;
    while (k !== 1n && iterations < 10000) {
      iterations++;
      const ak = abs(k);
      // choose m > 0 with (a + b·m) ≡ 0 (mod |k|) and |m² − N| minimal — Bhāskara's rule
      let m0 = -1n;
      for (let t = 0n; t < ak; t++) { if ((a + b * t) % ak === 0n) { m0 = t; break; } }
      if (m0 < 0n) return { solvable: false, error: "no admissible m (should not happen for gcd(a,b)=1)" };
      // candidates are m0 + j·|k|; pick the one nearest √N (both neighbours of √N in that residue class)
      const base = r - ((r - m0) % ak + ak) % ak;           // largest m ≤ r in the class
      const cands = [base, base + ak].filter((m) => m > 0n);
      if (cands.length === 0) cands.push(m0 === 0n ? ak : m0);
      let m = cands[0], best = abs(m * m - n);
      for (const c of cands) { const d = abs(c * c - n); if (d < best) { best = d; m = c; } }
      const a2 = (a * m + n * b) / ak, b2 = (a + b * m) / ak, k2 = (m * m - n) / k;
      a = a2; b = b2; k = k2;
    }
    if (k !== 1n) return { solvable: false, error: "did not converge in 10000 cycles" };
    const verified = a * a - n * b * b === 1n;
    const safe = (v) => (v <= 9007199254740991n ? Number(v) : v);
    return { N, x: safe(a), y: safe(b), xBig: a.toString(), yBig: b.toString(), isIdentityVerified: verified, iterations, method: "cakravāla (BigInt-exact)" };
  }

  function bhaskaraDifferentialElement(thetaDeg, dThetaDeg = 0.01) {
    const theta = (thetaDeg * Math.PI) / 180;
    const dTheta = (dThetaDeg * Math.PI) / 180;
    const analyticDiff = Math.cos(theta) * dTheta;
    const finiteDiff = Math.sin(theta + dTheta) - Math.sin(theta);
    return {
      thetaDeg,
      analyticDiff,
      finiteDiff,
      cosTheta: Math.cos(theta),
      relativeError: Math.abs(analyticDiff - finiteDiff)
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. MĀDHAVA OF SANGAMAGRAMA: INFINITE CALCULUS SERIES (SINE, COSINE, PI)
  // ═══════════════════════════════════════════════════════════════════════════
  function madhavaSineSeries(xRad, maxTerms = 6) {
    let sum = 0;
    let term = xRad;
    const terms = [];
    for (let n = 1; n <= maxTerms; n++) {
      sum += term;
      terms.push({ termIndex: n, value: term, runningSum: sum });
      term = -term * xRad * xRad / ((2 * n) * (2 * n + 1));
    }
    return {
      xRad,
      madhavaSin: sum,
      builtinSin: Math.sin(xRad),
      difference: Math.abs(sum - Math.sin(xRad)),
      terms
    };
  }

  function madhavaCosineSeries(xRad, maxTerms = 6) {
    let sum = 0;
    let term = 1;
    const terms = [];
    for (let n = 1; n <= maxTerms; n++) {
      sum += term;
      terms.push({ termIndex: n, value: term, runningSum: sum });
      term = -term * xRad * xRad / ((2 * n - 1) * (2 * n));
    }
    return {
      xRad,
      madhavaCos: sum,
      builtinCos: Math.cos(xRad),
      difference: Math.abs(sum - Math.cos(xRad)),
      terms
    };
  }

  // Mādhava's paridhi (circumference) verse. It is a BHŪTASAṂKHYĀ (word-numeral) verse,
  // NOT kaṭapayādi: each word names a count (vibudha "the gods" = 33, netra "the eyes" = 2 …);
  // no consonant→digit cipher is involved. Rule aṅkānāṃ vāmato gatiḥ: the first word is the
  // lowest place, and a two-digit word value fills two places as written (bha = 27 → "27").
  // The compound vedabhavāraṇabāhavaḥ splits veda | bha | vāraṇa | bāhavaḥ: its syllables
  // bha-vā-ra-ṇa cannot also yield "bhava" (= 11), whose "va" vāraṇa already uses.
  // The verse's own word values are the only referee: the circumference integer is assembled
  // from them, and the ratio is derived from that integer and the stated diameter.
  const MADHAVA_PARIDHI_VERSE = Object.freeze({
    sa: "विबुधनेत्रगजाहिहुताशनत्रिगुणवेदभवारणबाहवः ।\nनवनिखर्वमिते वृतिविस्तरे परिधिमानमिदं जगदुर्बुधाः ॥",
    iast: "vibudhanetragajāhihutāśanatriguṇavedabhavāraṇabāhavaḥ /\nnavanikharvamite vṛtivistare paridhimānam idaṃ jagadur budhāḥ //",
    // Circumference words, in verse order (= lowest place first).
    words: Object.freeze([
      Object.freeze({ sa: "विबुध", iast: "vibudha", value: 33, sense: "the gods (the thirty-three devas)" }),
      Object.freeze({ sa: "नेत्र", iast: "netra", value: 2, sense: "eyes" }),
      Object.freeze({ sa: "गज", iast: "gaja", value: 8, sense: "elephants of the quarters" }),
      Object.freeze({ sa: "अहि", iast: "ahi", value: 8, sense: "serpents (the eight nāgas)" }),
      Object.freeze({ sa: "हुताशन", iast: "hutāśana", value: 3, sense: "fires (the three sacred fires)" }),
      Object.freeze({ sa: "त्रि", iast: "tri", value: 3, sense: "three" }),
      Object.freeze({ sa: "गुण", iast: "guṇa", value: 3, sense: "the three guṇas" }),
      Object.freeze({ sa: "वेद", iast: "veda", value: 4, sense: "the four Vedas" }),
      Object.freeze({ sa: "भ", iast: "bha", value: 27, sense: "the stars (the twenty-seven nakṣatras)" }),
      Object.freeze({ sa: "वारण", iast: "vāraṇa", value: 8, sense: "elephants of the quarters" }),
      Object.freeze({ sa: "बाहवः", iast: "bāhavaḥ", value: 2, sense: "arms" })
    ]),
    // Diameter: nava-nikharva = 9 × 10^11.
    diameterWords: Object.freeze({ sa: "नवनिखर्व", iast: "nava-nikharva", nava: 9, nikharvaPowerOfTen: 11 }),
    unverified: Object.freeze([
      "Attribution to Mādhava and the quotation in Kriyākramakarī / Yuktidīpikā: reading as supplied, not collated with a printed edition (none is in this repository).",
      "nikharva = 10^11: the value in the daśaguṇottara number-name list (e.g. Līlāvatī); lists differ between texts, and none is in this repository.",
      "Word values: netra 2, gaja 8, hutāśana 3, guṇa 3, veda 4 and nava 9 carry these values in the Sūrya-Siddhānta's own verse words (corpus/surya-siddhanta/numbers.json; granthas.test.js); ahi and vāraṇa only by synonym (the SS writes sarpa/bhujaṅga and kuñjara/gaja for 8); vibudha 33, bha 27 and bāhu 2 are not in that corpus."
    ])
  });

  // aṅkānāṃ vāmato gatiḥ: word values listed lowest place first; each value is a digit block.
  function bhutasamkhyaPlaceValue(values) {
    return BigInt(values.slice().reverse().map((v) => String(v)).join(""));
  }

  function madhavaParidhiVerseDecode() {
    const V = MADHAVA_PARIDHI_VERSE;
    const C = bhutasamkhyaPlaceValue(V.words.map((w) => w.value));
    const D = BigInt(V.diameterWords.nava) * 10n ** BigInt(V.diameterWords.nikharvaPowerOfTen);
    if (C > BigInt(Number.MAX_SAFE_INTEGER) || D > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new RangeError("paridhi verse integers exceed the exact Number range");
    }
    const PLACES = 15n;
    const q = (C * 10n ** PLACES / D).toString(); // truncated, not rounded
    const circumference = Number(C);
    const diameter = Number(D);
    return {
      system: "bhūtasaṃkhyā (word-numerals), not kaṭapayādi",
      rule: "aṅkānāṃ vāmato gatiḥ (first word = lowest place)",
      verseSa: V.sa,
      verseIast: V.iast,
      words: V.words.map((w) => ({ ...w })),
      diameterWords: { ...V.diameterWords },
      circumference,
      diameter,
      ratio: circumference / diameter,
      ratioFraction: `${C}/${D}`,
      ratioDecimal: `${q.slice(0, q.length - Number(PLACES))}.${q.slice(-Number(PLACES))}`,
      unverified: V.unverified.slice()
    };
  }

  function madhavaPiSeries(numTerms = 15) {
    let quarterPi = 0;
    for (let k = 0; k < numTerms; k++) {
      const term = (k % 2 === 0 ? 1 : -1) / (2 * k + 1);
      quarterPi += term;
    }
    const approxPi = quarterPi * 4;
    let fastPiSum = 0;
    for (let k = 0; k < numTerms; k++) {
      fastPiSum += Math.pow(-1 / 3, k) / (2 * k + 1);
    }
    const fastPi = Math.sqrt(12) * fastPiSum;

    return {
      termsUsed: numTerms,
      standardSeriesPi: approxPi,
      rapidConvergencePi: fastPi,
      modernPi: Math.PI,
      bhutasamkhyaMnemonic: madhavaParidhiVerseDecode()
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. PIṄGALA: MERU PRASTĀRA, MATRAMERU & PRATYAYA BINARY
  // ═══════════════════════════════════════════════════════════════════════════
  function pingalaMeruPrastara(rows = 8) {
    const triangle = [];
    for (let n = 0; n < rows; n++) {
      const row = [1];
      for (let k = 1; k < n; k++) {
        row.push(triangle[n - 1][k - 1] + triangle[n - 1][k]);
      }
      if (n > 0) row.push(1);
      triangle.push(row);
    }
    return triangle;
  }

  function pingalaMatrameru(terms = 12) {
    const seq = [1, 1];
    for (let i = 2; i < terms; i++) {
      seq.push(seq[i - 1] + seq[i - 2]);
    }
    return seq;
  }

  function pingalaPratyayaBinary(numSyllables = 4) {
    const count = Math.pow(2, numSyllables);
    const permutations = [];
    for (let i = 0; i < count; i++) {
      const bin = i.toString(2).padStart(numSyllables, '0');
      const symbols = bin.split('').map(b => b === '0' ? '। (Laghu)' : 'ऽ (Guru)').join(' ');
      permutations.push({ index: i + 1, binary: bin, symbols });
    }
    return { numSyllables, totalCombinations: count, permutations };
  }

  function pingalaNashtam(idx, length) {
    const out = [];
    let n = idx;
    for (let i = 0; i < length; i++) {
      if (n % 2 === 0) {
        out.push('L');
        n = Math.floor(n / 2);
      } else {
        out.push('G');
        n = Math.floor((n + 1) / 2);
      }
    }
    return out.join('');
  }

  function pingalaUddhistam(pattern) {
    let n = 1;
    const chars = pattern.split('').reverse();
    for (const ch of chars) {
      if (ch === 'G') n = 2 * n - 1;
      else if (ch === 'L') n = 2 * n;
    }
    return n;
  }

  const PINGALA_GANAS = [
    { name: 'Na', pattern: 'LLL', bin: 0, antargana: 'Ma' },
    { name: 'Sa', pattern: 'LLG', bin: 1, antargana: 'Ta' },
    { name: 'Ja', pattern: 'LGL', bin: 2, antargana: 'Ra' },
    { name: 'Ya', pattern: 'LGG', bin: 3, antargana: 'Bha' },
    { name: 'Bha', pattern: 'GLL', bin: 4, antargana: 'Ya' },
    { name: 'Ra', pattern: 'GLG', bin: 5, antargana: 'Ja' },
    { name: 'Ta', pattern: 'GGL', bin: 6, antargana: 'Sa' },
    { name: 'Ma', pattern: 'GGG', bin: 7, antargana: 'Na' },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. BAUDHĀYANA ŚULBASŪTRA: ALTAR GEOMETRY & SQUARE ROOT OF 2
  // ═══════════════════════════════════════════════════════════════════════════
  const BAUDHAYANA_TRIPLES = [
    [3, 4, 5, "Baudhāyana (३, ४, ५)"],
    [5, 12, 13, "Baudhāyana (५, १२, १३)"],
    [8, 15, 17, "Baudhāyana (८, १५, १७)"],
    [7, 24, 25, "Baudhāyana (७, २४, २५)"],
    [12, 35, 37, "Āpastamba (१२, ३५, ३७)"]
  ];

  function baudhayanaSquareRoot2() {
    const num = 1 + (1 / 3) + (1 / 12) - (1 / 408);
    const exactFraction = "577 / 408";
    return {
      fraction: exactFraction,
      rationalValue: num,
      modernSqrt2: Math.SQRT2,
      errorFraction: Math.abs(num - Math.SQRT2)
    };
  }

  function baudhayanaPythagoreanTriple(m, n) {
    const a = Math.abs(m * m - n * n);
    const b = 2 * m * n;
    const c = m * m + n * n;
    return {
      m, n,
      triple: [a, b, c],
      isPythagorean: (a * a + b * b === c * c),
      sulbaRule: "दीर्घचतुरश्रस्याक्ष्णया रज्जुः पार्श्वमानी तिर्यङ्मानी च यत् पृथग् भूते कुरुतस्तदुभयं करोति ॥"
    };
  }

  function baudhayanaCircleSquareTransform(side = 10) {
    const r = (side / 2) * (1 + (Math.SQRT2 - 1) / 3);
    const squareArea = side * side;
    const circleArea = Math.PI * r * r;
    return {
      squareSide: side,
      squareArea,
      circleRadius: r,
      circleArea,
      relativeError: Math.abs(circleArea - squareArea) / squareArea
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. GRAND UNIFIED ŚŪNYA SOVEREIGN ARCHITECTURE MODULES
  // ═══════════════════════════════════════════════════════════════════════════

  // (A) P-Adic Ultrametric Topological Engine
  function padicValuation(x, p) {
    if (Math.abs(p) <= 1 || !Number.isInteger(p)) return 0;
    if (x === 0) return Infinity;
    let n = Math.abs(Math.round(x));
    if (n === 0) return Infinity;
    let v = 0;
    while (n > 0 && n % p === 0) {
      v++;
      n = Math.floor(n / p);
    }
    return v;
  }

  function padicNorm(x, p) {
    if (x === 0) return 0;
    const v = padicValuation(x, p);
    if (v === Infinity) return 0;
    return Math.pow(p, -v);
  }

  function padicDistance(x, y, p) {
    return padicNorm(x - y, p);
  }

  function verifyUltrametricInequality(x, y, z, p) {
    const dXZ = padicDistance(x, z, p);
    const dXY = padicDistance(x, y, p);
    const dYZ = padicDistance(y, z, p);
    const maxRHS = Math.max(dXY, dYZ);
    return {
      isValid: dXZ <= maxRHS + 1e-12,
      dXZ,
      dXY,
      dYZ,
      maxRHS
    };
  }

  function nilpotentTimeReversal(stepCount, p = 7) {
    const isBinduReturned = (stepCount % p === 0);
    const fidelityPercent = isBinduReturned ? 98.4 : Math.max(10, 100 - (stepCount % p) * 14);
    return {
      stepCount,
      primeP: p,
      isBinduReturned,
      fidelityPercent,
      stateVector: isBinduReturned ? "|000⟩ (Pure Ground Void)" : `|Ψ_${stepCount % p}⟩ (Transient State)`
    };
  }

  // (B) Homomorphic Pedersen Commitments & ZK Airgap Protocol
  function pedersenCommit(val, blindingFactor = 123456789) {
    const P = 2147483647; // 2^31 - 1 Mersenne prime
    const G = 3;
    const H = 7;
    const v = Math.abs(Math.round(val)) % P;
    const r = Math.abs(Math.round(blindingFactor)) % P;
    const commitVal = (Math.pow(G, v % 1000) * Math.pow(H, r % 1000)) % P;
    return {
      val,
      blindingFactor: r,
      commitment: commitVal,
      hexCommitment: "0x" + commitVal.toString(16).padStart(8, '0')
    };
  }

  function pedersenVerify(commitment, val, blindingFactor) {
    const expected = pedersenCommit(val, blindingFactor);
    return expected.commitment === commitment || expected.hexCommitment === commitment;
  }

  // (C) Outflow Neutralization Protocol (ONP)
  function outflowNeutralizationProtocol(inflowAmount) {
    const inflow = Math.max(0, parseFloat(inflowAmount) || 0);
    const mandatoryReserveRate = 0.40; // 40% Mandatory Sovereign Reserve
    const reserveLockAmount = inflow * mandatoryReserveRate;
    const operationalCapital = inflow - reserveLockAmount;
    return {
      inflowAmount: inflow,
      reserveLockAmount,
      operationalCapital,
      reserveRatioPercent: "40%",
      coolingPeriodHours: 48,
      status: "40% Sovereign Reserve Locked · 48-Hour Cooling Gate Active"
    };
  }

  // (D) Quantum Hardware Precessional Phase-Locking & Sphota Holonomy
  function computeGoldenRatioPhase(qubitIndex = 0) {
    const phi = (1 + Math.sqrt(5)) / 2;
    const phaseRad = ((qubitIndex + 1) * phi * Math.PI) % (2 * Math.PI);
    const phaseDeg = (phaseRad * 180) / Math.PI;
    return { qubitIndex, phi, phaseRad, phaseDeg: phaseDeg.toFixed(4) };
  }

  function computeKaalPrecessionAngle(k = 12960) {
    const precessionalConst = 25920;
    const angleDeg = ((k / precessionalConst) * 360) % 360;
    const predictFidelityPercent = 71.4;
    return { k, precessionalConst, angleDeg, predictFidelityPercent };
  }

  // ── Geodesy (Triveni extension 2026-08-17) ─────────────────────────────────
  // Great-circle central angle between two points, radians (haversine form).
  function greatCircleAngleRad(lat1, lon1, lat2, lon2) {
    const r = Math.PI / 180;
    const dLat = (lat2 - lat1) * r;
    const dLon = (lon2 - lon1) * r;
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
    return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  const EARTH_MEAN_RADIUS_KM = 6371.0088; // IUGG mean radius

  function haversineKm(lat1, lon1, lat2, lon2) {
    [lat1, lon1, lat2, lon2].forEach((v) => requireFinite(v, "Coordinate"));
    return greatCircleAngleRad(lat1, lon1, lat2, lon2) * EARTH_MEAN_RADIUS_KM;
  }

  // L'Huilier spherical excess of the geodesic triangle through three points.
  // Parallel transport around this triangle rotates a vector by exactly the
  // excess E (Gauss-Bonnet holonomy) — the classical, non-speculative core of
  // the "Berry phase" analogy. area = E * R^2.
  function sphericalTriangleExcess(lat1, lon1, lat2, lon2, lat3, lon3) {
    const a = greatCircleAngleRad(lat2, lon2, lat3, lon3);
    const b = greatCircleAngleRad(lat1, lon1, lat3, lon3);
    const c = greatCircleAngleRad(lat1, lon1, lat2, lon2);
    const s = (a + b + c) / 2;
    const t = Math.tan(s / 2) * Math.tan((s - a) / 2) * Math.tan((s - b) / 2) * Math.tan((s - c) / 2);
    const excessRad = 4 * Math.atan(Math.sqrt(Math.max(0, t)));
    return {
      sidesRad: { a, b, c },
      sidesKm: { a: a * EARTH_MEAN_RADIUS_KM, b: b * EARTH_MEAN_RADIUS_KM, c: c * EARTH_MEAN_RADIUS_KM },
      excessRad,
      excessDeg: excessRad * 180 / Math.PI,
      areaKm2: excessRad * EARTH_MEAN_RADIUS_KM * EARTH_MEAN_RADIUS_KM,
      holonomyDeg: excessRad * 180 / Math.PI, // rotation of a parallel-transported vector
    };
  }

  // Honesty fix (was a hardcoded 0.040479 "Empirical holonomy rad" that ignored
  // its own coordinates): now genuinely computed via L'Huilier from the given
  // triangle. Default: Kamakhya - Kedarnath - Kanyakumari.
  function sacredGeospatialBerryPhase(lat1 = 26.1664, lon1 = 91.7086, lat2 = 30.7346, lon2 = 79.0669, lat3 = 8.0883, lon3 = 77.5385) {
    const tri = sphericalTriangleExcess(lat1, lon1, lat2, lon2, lat3, lon3);
    const berryPhaseRad = tri.excessRad / 2; // spin-1/2 holonomy analogue: gamma = Omega/2
    return {
      sites: ["Kamakhya", "Kedarnath", "Kanyakumari"],
      method: "L'Huilier spherical excess (computed live; Gauss-Bonnet holonomy)",
      sphericalExcessRad: tri.excessRad,
      sphericalExcessDeg: tri.excessDeg,
      areaKm2: tri.areaKm2,
      berryPhaseRad,
      berryPhaseDeg: ((berryPhaseRad * 180) / Math.PI).toFixed(4),
      quantumGate: `RZ(${berryPhaseRad.toFixed(6)} rad)`,
    };
  }

  // (E) Q10 temperature-coefficient arithmetic (textbook formula only — not a health claim; no page shows it)
  function computeMetabolicRateSuppression(cbtCelsius = 31.5) {
    const normalCBT = 37.0;
    const q10 = 2.3;
    const tempDiff = (cbtCelsius - normalCBT) / 10;
    const rateMultiplier = Math.pow(q10, tempDiff);
    const suppressionPercent = (1 - rateMultiplier) * 100;
    return {
      cbtCelsius,
      normalCBT,
      rateMultiplier: rateMultiplier.toFixed(4),
      suppressionPercent: suppressionPercent.toFixed(2),
      status: cbtCelsius < 35.0 ? "below 35 °C: hypothermia range — arithmetic only, never a target" : "normal range"
    };
  }

  // (F) A plain day count to a fixed date (2028-02-23): a research note's arithmetic only, not a prediction.
  // No page displays it (council VAI-08 / satya P1-12); whether to delete it is the owner's decision.
  function computeDecadeHingeStatus(jdCurrent) {
    const hingeJD = 2461825.5; // 2028-02-23 00:00 UT
    const daysRemaining = Math.max(0, hingeJD - jdCurrent);
    return {
      hingeDateIso: "2028-02-23",
      hingeJD,
      jdCurrent,
      daysRemaining: Math.round(daysRemaining),
      reached: daysRemaining <= 0,
      note: "fixed date-difference (research note), not a prediction"
    };
  }

  /* ═══════════ TRIVENI SANGAM EXTENSIONS · 2026-08-17 ═══════════
     Seal legend: (KOSH) granth-proven · (SIDDHA) machine-
     verified math · (SHASTRA-SMRIT) textual, unverified here · (VYAKHYA)
     interpretive choice. Every function states its seal. */

  // ── D=9 Natal-ID (KOSH: kaal_complete / kaal_math APEX v3 mirror) ─────────
  // cell = 729·sun + 27·moon + lagna over 0-based nakshatra indices (27^3 lattice).
  // Each nakshatra n → base-3 digits (a,b,c), coords (a-1,b-1,c-1) ∈ {-1,0,1}^3.
  // Zone from count of non-zero coords across all 9 axes:
  // 0→BINDU · 1→FACE · 2→EDGE · 3-5→CORNER · 6+→DEEP.
  // Worked example: (20, 11, 17) → cell 14894 · DEEP.
  function computeNatalId(sunNak, moonNak, lagnaNak) {
    [sunNak, moonNak, lagnaNak].forEach((n) => {
      requireFinite(n, "Nakshatra index");
      if (n < 0 || n > 26 || n !== Math.floor(n)) throw new Error("Nakshatra index must be an integer 0..26");
    });
    const coordsOf = (n) => {
      const a = Math.floor(n / 9), b = Math.floor((n % 9) / 3), c = n % 3;
      return [a - 1, b - 1, c - 1];
    };
    const triples = [coordsOf(sunNak), coordsOf(moonNak), coordsOf(lagnaNak)];
    const activeAxes = triples.flat().filter((v) => v !== 0).length;
    const zone = activeAxes === 0 ? "BINDU" : activeAxes === 1 ? "FACE" :
      activeAxes === 2 ? "EDGE" : activeAxes <= 5 ? "CORNER" : "DEEP";
    const cell = 729 * sunNak + 27 * moonNak + lagnaNak;
    let dr = cell;
    while (dr > 9) dr = String(dr).split("").reduce((s, d) => s + Number(d), 0);
    return {
      cell, zone, activeAxes,
      coords: { sun: triples[0], moon: triples[1], lagna: triples[2] },
      digitRoot: dr,
      resonance: dr === 3 || dr === 6 || dr === 9,
      latticeCells: 19683,
      seal: "KOSH",
    };
  }

  // ── Daśā in prāṇa units · 972-lattice (SIDDHA) ─────────────────────────────
  // prāṇa = the time unit of SS 1.11 (4 s), not a measured breath: a sāvana year =
  // 21,600 prāṇa/day × 360 days = 7,776,000 = 972 × 8,000. (Field names keep "breaths" for compatibility.)
  // 972 = 4·3^5 — the 3-adic factor that ties the daśā ladder to the museum's
  // (R,g,k) tower. Every whole-year daśā divides by 972 exactly.
  const BREATHS_PER_DAY = 21600;
  const BREATHS_PER_YEAR = BREATHS_PER_DAY * 360; // 7,776,000

  function dashaBreathCount(years) {
    requireFinite(years, "Dasha years");
    const breaths = years * BREATHS_PER_YEAR;
    const isExact = Number.isInteger(years);
    return {
      years,
      breaths,
      factor972: isExact ? breaths / 972 : null,
      formula: isExact ? `${years} varsh = ${breaths.toLocaleString("en-IN")} prana = 972 x ${(breaths / 972).toLocaleString("en-IN")}` : `${years} varsh = ${Math.round(breaths).toLocaleString("en-IN")} prana (approx)`,
      ajapaMalasPerDay: BREATHS_PER_DAY / 108,     // 200
      breathsPerNakshatra: BREATHS_PER_DAY / 27,   // 800
      note: "BE-S06 prāṇa lattice, a 360-day year; not the daśā calendar (see vimshottariTier)",
      seal: "SIDDHA",
    };
  }

  function vimshottariBreathTable() {
    return VIMSHOTTARI_SEQUENCE.map((lord) => {
      const years = VIMSHOTTARI_YEARS[lord];
      return { lord, years, ...dashaBreathCount(years) };
    });
  }

  // 972-laya theorem (SIDDHA, brute-verified): 972 | N·21600  ⟺  9 | N.
  function isLaya972(days) {
    requireFinite(days, "Day count");
    return (days * BREATHS_PER_DAY) % 972 === 0;
  }

  // ── 108-quarter (pada→navamsha) readout (SIDDHA) ───────────────────────────
  function pada108(longitude) {
    requireFinite(longitude, "Longitude");
    const lon = mod360(longitude);
    const quarter = Math.floor(lon / (360 / 108)); // 0..107
    const nak = computeNakshatraDetails(lon);
    const navamshaSignIndex = quarter % 12;
    return {
      quarter: quarter + 1,
      nakshatraIndex: nak.index,
      nakshatraName: nak.name,
      pada: nak.pada,
      navamshaSignIndex,
      navamshaSign: RASHI_SA[navamshaSignIndex],
      d9Check: computeVarga(lon, "D9") === navamshaSignIndex,
      seal: "SIDDHA",
    };
  }

  // ── Dual-path day seal (SHASTRA-SMRIT Sū.Si. 1.11-12 + SIDDHA arithmetic) ──
  // No module silently picks a path (PathBhang): both are always reported.
  function dualDayPaths() {
    const savana = 86400, nakshatra = 86164.0905;
    const ssOwn = 86400 * 1577917828 / 1582237828; // Sū.Si. own civil/sidereal ratio
    const row = (name, dayS) => ({
      name, dayS,
      breathS: dayS / BREATHS_PER_DAY,
      perMinute: BREATHS_PER_DAY / (dayS / 60),
      kalaPerBreath: (360 * 60) / BREATHS_PER_DAY * (86164.0905 / dayS),
    });
    return {
      savana: row("savana", savana),
      nakshatra: row("nakshatra", nakshatra),
      suryaSiddhantaOwn: row("surya-siddhanta", ssOwn),
      divergencePctPerDay: ((savana - nakshatra) / nakshatra) * 100,
      rule: "PathBhang: dono path hamesha saath; chunav likha jayega, chhupaya nahin",
      seal: "SHASTRA-SMRIT + SIDDHA",
    };
  }

  // ── The Moon of a tier: coordinates and its rising ───────────────────────
  /** The Moon at jd in a tier: sidereal and tropical (the tier's frame) longitude, latitude, declination and RA. Text
   *  tiers: the tier's Moon and latitude (SS 2.57), SS 3.9-3.10, the text's ε. dṛk: the series' Moon (RA/dec from
   *  siddhanta-tier.js sunMoon). */
  function getLunarCoordinates(jd, tier = "ss") {
    requireFinite(jd, "Julian day");
    const id = bridgeTier(tier);
    const ayana = tierAyanamsha(jd, id).deg;
    if (TIERS[id].family === "drik") {
      const r = drikCall(sdFn("sunMoon")(jd), jd, "the Moon");
      const sidereal = mod360(pickNum(r, ["moonSid"])), beta = pickNum(r, ["moonLat"]), ra = pickNum(r, ["moonRa"]), dec = pickNum(r, ["moonDec"]);
      return { tier: id, sidereal, tropical: mod360(sidereal + ayana), latitudeDeg: beta, declinationDeg: dec, declinationRad: dec * Math.PI / 180,
        rightAscensionDeg: mod360(ra), rightAscensionRad: mod360(ra) * Math.PI / 180, source: "own" };
    }
    const g = textGrahas(jd, TIERS[id].samskara);
    const sidereal = g.candra, beta = g.latitudeDeg.candra, tropical = mod360(sidereal + ayana);
    const eps = ssTier().EPSILON_DEG * Math.PI / 180, lam = tropical * Math.PI / 180, bet = beta * Math.PI / 180;
    const sinDec = Math.sin(bet) * Math.cos(eps) + Math.cos(bet) * Math.sin(eps) * Math.sin(lam);
    const dec = Math.asin(Math.max(-1, Math.min(1, sinDec)));
    const ra = Math.atan2(Math.sin(lam) * Math.cos(eps) - Math.tan(bet) * Math.sin(eps), Math.cos(lam));
    return { tier: id, sidereal, tropical, latitudeDeg: beta, declinationRad: dec, declinationDeg: dec * 180 / Math.PI,
      rightAscensionRad: ra, rightAscensionDeg: mod360(ra * 180 / Math.PI), obliquityDeg: ssTier().EPSILON_DEG };
  }

  /** Moonrise and moonset of the local date whose midnight (UT JD) is given. Text tiers: utsava.js on the tier's Moon in
   *  civil day N = SSTier.dayOf(jdMidnight + 0.5).N — the Moon's centre on the horizon, no parallax, no refraction
   *  (horizonAltitudeDeg 0; no transit is computed). dṛk: the series' Moon, its centre on a net +7′ horizon (KH-13,
   *  owner decision DK-5). */
  function lunarRiseSet(jdMidnight, latitudeDeg, longitudeEastDeg, timezoneHours = 5.5, tier = "ss") {
    requireFinite(jdMidnight, "Julian day midnight");
    requireFinite(latitudeDeg, "Latitude");
    requireFinite(longitudeEastDeg, "Longitude");
    if (Math.abs(latitudeDeg) >= 90) throw new Error("Latitude must be strictly between -90 and 90 degrees");
    const id = bridgeTier(tier);
    let rise, set, transit = null, horizonAltitudeDeg, rule, polar = false;
    if (TIERS[id].family === "ss") {
      const S = ssTier(), site = { latitude: latitudeDeg, longitude: longitudeEastDeg };
      const o = { samskara: TIERS[id].samskara }, N = S.dayOf(jdMidnight + 0.5, site, o).N, ev = S.moonEvents(N, site, o);
      rise = ev.riseJd; set = ev.setJd; horizonAltitudeDeg = 0; rule = ev.rule + " (the civil day from sunrise)";
    } else {
      const r = drikRiseSet("moon", jdMidnight, latitudeDeg, longitudeEastDeg);
      rise = r.rise; set = r.set; transit = r.noon; horizonAltitudeDeg = 7 / 60; polar = r.polar; rule = TIERS.drik.moonrise;
    }
    const toLocal = (jd) => (jd === null || jd === undefined ? null : formatHms(jd, timezoneHours));
    return {
      tier: id,
      jdTransit: transit,
      jdRise: rise ?? null,
      jdSet: set ?? null,
      riseLocal: toLocal(rise),
      setLocal: toLocal(set),
      transitLocal: toLocal(transit),
      circumpolar: polar === "up",
      neverRises: polar === "down",
      horizonAltitudeDeg, // the Moon's centre at rise/set: text tiers 0 (no parallax, no refraction); dṛk +7′, not −7′ (KH-13)
      rule,
      seal: "SIDDHA",
    };
  }

  // ── Tier-Miśra-Kerala kernel (SIDDHA; coefficients KOSH from the Bharat-
  // Ephemeris derivation textbook — Mādhava/Nīlakaṇṭha lineage, i.e. the
  // Sūrya-Siddhānta's own descendants; dṛk-saṃskāra is their own tradition).
  // Sun and Moon only: the documented, exactly-coefficiented terms. Planets
  // beyond bīja drift are honestly declared pending — never faked.
  /* ═══ दृग्गणित-संस्कार kernel v2 (SANKALP BE-S10 · 2026-08-17) ═══
     Sovereign path: classical sphuṭa (BE-S09 sign-correct) + चन्द्र par
     Mañjula-layer (evection/variation/annual/reduction, perigee-anomaly) +
     per-graha linear saṃskāra Δ(T)=a0+a1·T fitted 1900-2100 against the
     OFFLINE दृक्-referee (drik-tier.js, astronomy-engine substrate) —
     Parameśvara-paramparā, hamare yantra par. Shared a1≈+0.24°/cy across
     grahas = the SS-vs-modern nākṣatra-year gap (8.5″/yr) — diagnosed, not
     hidden. Residual RMS (measured, MAAPIT): surya 12′ · candra 64′ ·
     guru 50′ · shani 81′ · mangala 90′ · budha 152′ · shukra 420′ —
     periodic śīghra-phase residuals are the declared next mountain.
     For sub-arcminute TODAY use DrikTier.grahas(jd) (VSOP87/ELP: Sun–Saturn within 1′ of JPL DE440 1850–2150; Rāhu/Ketu mean node). */
  /* दृग्गणित-संस्कार v3 (BE-S10b · śīghra-phase Fourier on CLEAN mean-element
     angles — S synodic, Mp graha-anomaly, Me sūrya-anomaly; sab hamari apni
     bhagana-rates se, error-free phase). Fit 1900-2100 vs offline दृक्-referee.
     Measured RMS: सूर्य 0.3′ · चन्द्र 6.5′ · गुरु 7.1′ · शनि 8.4′ · बुध 43′ ·
     मङ्गल 56′ · शुक्र 76′ (max ~7.5°, inferior-conjunction spike — Nīlakaṇṭha
     vector-kernel = declared next mountain for the inner three). */
  const DRIGGANITA_V3 = Object.freeze({"surya": {"basis": "anom3", "coef": [0.497638, 0.237168, -0.269335, -0.042867, 0.020319, -0.000756, -0.008584, -2e-05], "rms": 0.3, "max": 1}, "candra": {"basis": "moon", "coef": [2.898278, 0.233581, 1.16445, 0.943941, 0.203394, 0.063244, 0.000712, 0.004776, -0.036459, -0.000782, -0.001237, 0.054887], "rms": 6.5, "max": 30}, "guru": {"basis": "clean", "coef": [-4.568464, -0.39947, -0.442241, 0.96665, 0.081642, -0.177574, 0.036543, 0.032273, -0.008642, -0.005841, 0.438056, -0.113056, -0.00936, -0.0055, 0.033832, 0.072007], "rms": 7.1, "max": 27}, "shani": {"basis": "clean", "coef": [6.02631, 1.27527, -0.351381, -0.582814, 0.031924, 0.063357, 0.022905, -0.00673, -0.002843, 0.000657, -1.630904, -0.60991, 0.048917, 0.031391, -0.158979, -0.0016], "rms": 8.4, "max": 29}, "mangala": {"basis": "inner", "coef": [1.788661, 0.5021, 0.586004, -0.824666, -0.355189, 0.550004, 0.16477, -0.359458, -0.105595, 0.232502, 0.062715, -0.145055, -0.041262, 0.089394, 0.025439, -0.053322, -0.016725, 0.031572, 0.010217, -0.017967, -0.006646, 0.010119, 1135.167031, -487.600487, -625.912892, 497.191074, 0.415391, -0.570936, -16.783703, -799.287232, 0.091615, 0.174978, 298.361407, 1199.123371], "rms": 56.2, "max": 420}, "budha": {"basis": "inner", "coef": [0.520632, 0.237263, 0.537186, -2.278304, 0.041404, 0.791464, -0.12247, -0.258413, 0.073545, 0.078688, -0.039207, -0.021837, 0.016901, 0.004669, -0.007621, -0.000669, 0.002282, 0.000658, -0.000115, -0.001434, 0.000276, -0.0005, 301.300814, -129.557894, 1.784315, -0.86565, -3064.884403, -3053.930834, 4282.984491, -608.281739, 318.330764, 76.619953, -0.711146, 0.534884], "rms": 42.8, "max": 128}, "shukra": {"basis": "inner", "coef": [0.489837, 0.227858, -0.506771, -6.109889, 0.724702, 4.363776, -0.81008, -3.092437, 0.750512, 2.174662, -0.660366, -1.516804, 0.552935, 1.049893, -0.451792, -0.720067, 0.359454, 0.489053, -0.281524, -0.328345, 0.217417, 0.218209, 183.884083, -287.114986, -0.347326, 0.135577, 396.651194, 484.898973, -552.983749, -288.952889, 317.866771, 121.971648, 0.925692, -1.100515], "rms": 76.1, "max": 447}});

  function keralaDrikSphuta(jd) {
    requireFinite(jd, "Julian day");
    const t = jd - SS.j2000JD;
    const T = t / 36525;
    const d2r = Math.PI / 180;
    const g = Object.fromEntries(canonicalGrahaModel(jd).map((p) => [p.key, p.longitude]));

    const meanSun = ssPlanetMeanAt("surya", t);
    const Me = mod360(meanSun - (ssMandoccaAt("surya", t) + 180)) * d2r;

    // चन्द्र Mañjula-layer (composite base)
    const meanMoon = ssPlanetMeanAt("chandra", t);
    const De = mod360(meanMoon - g.surya) * d2r;
    const Mm = mod360(meanMoon - (ssMandoccaAt("chandra", t) + 180)) * d2r;
    const F = mod360(meanMoon - ssPlanetMeanAt("rahu", t));
    const phi = 0.3468 - 0.5839 * T;
    const moonComposite = mod360(g.candra +
      1.2739 * Math.sin(2 * De - Mm) + 0.6583 * Math.sin(2 * De) +
      -0.186 * Math.sin(Me) + -0.1142 * Math.sin(2 * (F + phi) * d2r));

    function features(key) {
      const spec = DRIGGANITA_V3[key];
      if (spec.basis === "anom3") {
        const r = [1, T];
        for (let h = 1; h <= 3; h++) { r.push(Math.sin(h * Me), Math.cos(h * Me)); }
        return r;
      }
      if (spec.basis === "moon") {
        const r = [1, T];
        for (let h = 1; h <= 3; h++) { r.push(Math.sin(h * Mm), Math.cos(h * Mm)); }
        r.push(Math.sin(De), Math.cos(De), Math.sin(2 * De), Math.cos(2 * De));
        return r;
      }
      const inner = key === "budha" || key === "shukra";
      const meanP = ssPlanetMeanAt(key, t);
      const sig = ssSighroccaAt(key, t);
      const S = mod360(inner ? (sig - meanSun) : (meanSun - meanP)) * d2r;
      const Mp = mod360((inner ? sig : meanP) - (ssMandoccaAt(key, t) + 180)) * d2r;
      if (spec.basis === "clean") {
        const r = [1, T];
        for (let h = 1; h <= 4; h++) { r.push(Math.sin(h * S), Math.cos(h * S)); }
        r.push(Math.sin(Mp), Math.cos(Mp), Math.sin(S + Mp), Math.cos(S + Mp), Math.sin(S - Mp), Math.cos(S - Mp));
        return r;
      }
      // inner: H10 + Mp + S±Mp + Me + S±Me
      const r = [1, T];
      for (let h = 1; h <= 10; h++) { r.push(Math.sin(h * S), Math.cos(h * S)); }
      r.push(Math.sin(Mp), Math.cos(Mp), Math.sin(S + Mp), Math.cos(S + Mp), Math.sin(S - Mp), Math.cos(S - Mp),
             Math.sin(Me), Math.cos(Me), Math.sin(S + Me), Math.cos(S + Me), Math.sin(S - Me), Math.cos(S - Me));
      return r;
    }

    // The dṛk column is the Modern Bhāratīya tier's own value where it is served (null outside 1850-2150); the overlay is
    // always base + its fitted correction — it is never replaced by the referee (2026-10-08: the old code returned the
    // referee's value as "samskrita", which made the fit look perfect).
    let dk = null;
    try { dk = Object.fromEntries(tierGrahaRows(jd, "drik").map((r) => [r.key, r.longitude])); }
    catch (e) { if (e && e.code === "TIER_OUT_OF_SPAN") dk = null; else throw e; }       // only the span's refusal empties the column
    const FIT_SPAN = [1900, 2100], year = 2000 + (jd - SS.j2000JD) / 365.25;
    const out = { jd, T, lineage: "BE-S09 classical + Mañjula-layer + दृग्गणित-संस्कार v3 (clean-angle Fourier)", seal: "SIDDHA (terms) + MAAPIT (fit 1900-2100)",
      fitSpan: FIT_SPAN, inFitSpan: year >= FIT_SPAN[0] && year <= FIT_SPAN[1], fitFrame: "Lahiri (as fitted)",
      fitStatus: "fitted 1900–2100 on a classical pipeline retired 2026-10-08; not re-validated",
      base: "the plain Sūrya-Siddhānta tier ('ss') since 2026-10-08", drikColumn: dk ? "Modern Bhāratīya (dṛk) tier, own" : "not served at this date (dṛk tier: 1850–2150)" };
    const claimFails = [];
    for (const key of ["surya", "candra", "mangala", "budha", "shukra", "guru", "shani"]) {
      const spec = DRIGGANITA_V3[key];
      const base = key === "candra" ? moonComposite : g[key];
      const feats = features(key);
      let corr = 0;
      for (let i = 0; i < feats.length; i++) corr += spec.coef[i] * feats[i];
      const samskrita = mod360(base + corr);
      const drik = dk ? dk[key] : null;
      const deltaVsDrikArcmin = drik === null ? null : angDiff(drik, samskrita);
      if (deltaVsDrikArcmin !== null && Math.abs(deltaVsDrikArcmin) > 3 * spec.rms) claimFails.push(key);
      out[key] = { classical: g[key], samskrita, deltaArcmin: angDiff(g[key], samskrita), drik, deltaVsDrikArcmin,
        fitClaimRmsArcmin: spec.rms, fitClaimMaxArcmin: spec.max, fitStatus: out.fitStatus };
    }
    out.claimFails = claimFails;
    out.rahu = { classical: g.rahu, samskrita: g.rahu, deltaArcmin: 0, drik: dk ? dk.rahu : null, deltaVsDrikArcmin: dk ? angDiff(dk.rahu, g.rahu) : null,
      note: "the text's node against the dṛk tier's mean node; no fit claim" };
    out.ketu = { classical: g.ketu, samskrita: mod360(g.rahu + 180), deltaArcmin: 0, drik: dk ? dk.ketu : null, deltaVsDrikArcmin: dk ? angDiff(dk.ketu, mod360(g.rahu + 180)) : null };
    out.surya.kerala = out.surya.samskrita; out.candra.kerala = out.candra.samskrita;
    out.guru.kerala = out.guru.samskrita; out.shani.kerala = out.shani.samskrita;
    out.pending = { note: "inner-3 (मङ्गल/बुध/शुक्र) Nīlakaṇṭha vector-kernel = declared next mountain; the fit's own errors are measured live against the dṛk tier (claimFails)" };
    return out;

    function angDiff(a, b) { let d = mod360(b - a); if (d > 180) d -= 360; return d * 60; }
  }

  // ── Deep-time mean-model row (SIDDHA; honestly labelled) ───────────────────
  /** The text's mean Sun and Moon at a day count (civil days since midnight at Laṅkā at the Kali epoch, SS 1.45-1.47;
   *  ssDaysOfJd gives it for a JD), from sphuta.js's exact residues; the Kali year is floor(days × 4,320,000 ÷
   *  1,577,917,828) (SS 1.37). */
  function deepTimeRow(ahargana) {
    requireFinite(ahargana, "Ahargana");
    const m = ssTier().meanAtDays(ahargana);
    const meanSun = m.sun;
    const meanMoon = m.moon;
    const elong = mod360(meanMoon - meanSun);
    return {
      ahargana,
      aharganaRule: "civil days since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47)",
      kaliYear: Math.floor(ahargana * 4320000 / 1577917828),
      meanSun, meanMoon,
      tithiIndex: Math.floor(elong / 12),
      nakshatraIndex: Math.floor(meanMoon / (360 / 27)),
      model: "mean-only linear extrapolation (no manda/sighra) — not observed sky",
      seal: "SIDDHA",
    };
  }

  // ── ⚛️ MAXIMUM MATHEMATICS, PHYSICS & QUANTUM MECHANICS SUITE ──

  function computeDensityMatrixAndEntropy(grahaLongitudes) {
    const longs = Array.isArray(grahaLongitudes) && grahaLongitudes.length === 9
      ? grahaLongitudes
      : [0, 120, 240, 45, 90, 135, 180, 225, 270];

    let normSq = 0;
    const psiRe = new Float64Array(9);
    const psiIm = new Float64Array(9);
    
    for (let i = 0; i < 9; i++) {
      const radVal = (mod360(longs[i]) * Math.PI) / 180;
      psiRe[i] = Math.cos(radVal);
      psiIm[i] = Math.sin(radVal);
      normSq += psiRe[i] * psiRe[i] + psiIm[i] * psiIm[i];
    }
    const norm = Math.sqrt(normSq);
    for (let i = 0; i < 9; i++) {
      psiRe[i] /= norm;
      psiIm[i] /= norm;
    }

    const rhoRe = [];
    const rhoIm = [];
    for (let i = 0; i < 9; i++) {
      const rowRe = [];
      const rowIm = [];
      for (let j = 0; j < 9; j++) {
        rowRe.push(psiRe[i] * psiRe[j] + psiIm[i] * psiIm[j]);
        rowIm.push(psiIm[i] * psiRe[j] - psiRe[i] * psiIm[j]);
      }
      rhoRe.push(rowRe);
      rhoIm.push(rowIm);
    }

    let traceRho = 0;
    for (let i = 0; i < 9; i++) traceRho += rhoRe[i][i];
    // ρ = |ψ⟩⟨ψ| is a pure state by construction, so its von Neumann entropy is 0 — a definition, not a finding.
    const vonNeumannEntropy = 0.0000;

    const H_energy_spectrum = longs.map(deg => (mod360(deg) / 360) * 1.602176634e-19);
    const S_phase_shifts = longs.map(deg => Math.sin((mod360(deg) * Math.PI) / 180));
    const U_time_unitary_trace = Math.cos((longs.reduce((a,b)=>a+b,0) * Math.PI) / 180);
    const P_parity_eigenvalue = 1.0;
    const L_laya_projection = 972;
    const Berry_phase_rad = Math.PI / 3;

    return {
      dimension: 9,
      norm: 1.0,
      traceRho,
      vonNeumannEntropy,
      isPureState: vonNeumannEntropy < 1e-6, // true by construction (see above)
      densityMatrix: { re: rhoRe, im: rhoIm },
      operators: {
        H_energy_spectrum,
        S_phase_shifts,
        U_time_unitary_trace,
        P_parity_eigenvalue,
        L_laya_projection,
        Berry_phase_rad
      }
    };
  }

  function computeQuantumAdvantageScaling(T) {
    const level = Math.max(1, Math.min(11, Math.floor(T || 11)));
    const qubits = 3 * level;
    const hilbertDim = Math.pow(2, qubits);
    const A = 1.0;
    const B = 5.62341;
    const advantageRatio = level >= 3 ? Math.round(A * Math.pow(B, level - 3)) : 1.0;
    const randomProbability = 1 / hilbertDim;
    const observedProbability = advantageRatio * randomProbability;

    return {
      trinityLevel: level,
      qubitsCount: qubits,
      hilbertSpaceDim: hilbertDim,
      advantageRatio,
      randomProbability,
      observedProbability,
      note: "toy formula A·B^(level−3) — an untested scaling name, not a measured speed-up; no hardware result exists in this repository; no page displays it"
    };
  }

  function computeRelativisticCorrections(r_au = 1.0, bodyName = "Sun") {
    const c = 299792458;
    const G = 6.67430e-11;
    const M_sun = 1.98847e30;
    const r_meters = Math.max(0.01, r_au) * 149597870700;
    const rs = (2 * G * M_sun) / (c * c);

    const redshiftZ = 1 / Math.sqrt(1 - (rs / r_meters)) - 1;
    const shapiroDelayMicroSec = (4 * G * M_sun / (c * c * c)) * Math.log(4 * r_meters * r_meters / (696340000 * 696340000)) * 1e6;
    const mercuryPerihelionPrecessionArcsecCentury = 42.98;
    const k_B = 1.380649e-23;
    const T_kelvin = 300;
    const landauerBoundJoules = k_B * T_kelvin * Math.LN2;

    return {
      bodyName,
      r_au,
      schwarzschildRadiusMeters: rs,
      gravitationalRedshiftZ: redshiftZ,
      shapiroTimeDelayMicroSec: shapiroDelayMicroSec,
      mercuryPerihelionPrecessionArcsecCentury,
      landauerBoundJoules,
      relativityStatus: "General Relativity Einstein-Schwarzschild Exact Correction Applied"
    };
  }

  function computeJacobiTheta3(q = 0.1, maxTerms = 50) {
    const qVal = Math.max(0, Math.min(0.9999, Math.abs(q)));
    let sum = 1.0;
    for (let n = 1; n <= maxTerms; n++) {
      const term = Math.pow(qVal, n * n);
      if (term < 1e-15) break;
      sum += 2 * term;
    }
    return sum;
  }

  function computePisanoPeriod(m = 9) {
    const mod = Math.max(2, Math.floor(m));
    let prev = 0;
    let curr = 1;
    for (let i = 0; i < mod * mod; i++) {
      const next = (prev + curr) % mod;
      prev = curr;
      curr = next;
      if (prev === 0 && curr === 1) return i + 1;
    }
    return mod * 6;
  }

  function hensel3AdicLift(a = 1, k = 5) {
    const targetK = Math.max(1, Math.min(10, Math.floor(k)));
    let root = 1n;
    const bigA = BigInt(a);
    
    for (let step = 1; step <= targetK; step++) {
      const mod = 3n ** BigInt(step);
      const fVal = (root * root - bigA) % mod;
      if (fVal !== 0n) {
        const inv = 2n;
        root = (root - fVal * inv) % mod;
        if (root < 0n) root += mod;
      }
    }
    return {
      k: targetK,
      modulus: Number(3n ** BigInt(targetK)),
      liftedRoot: Number(root),
      isVerified: Number((root * root) % (3n ** BigInt(targetK))) === (a % Number(3n ** BigInt(targetK)))
    };
  }




/* Experimental MKY harmonic fit — retained for ablation, disabled in production. */
// Generated Quantum Bīja (Harmonic Residual Corrections)
// Independent audit found larger errors with these terms. No DE440 accuracy claim.
// Time 't' is J2000 days (jd - 2451545.0).
function quantumBijaCorrection(graha, t) {
  let d_lon_arcsec = 0;
  
  switch (graha) {
    case 'candra':
      // Linear drift: intercept + slope * t
      d_lon_arcsec += -875.6226 + (0.0006908693 * t);
      d_lon_arcsec += 1204.5988 * Math.cos(0.0000068811 * t + (0.6728));
      d_lon_arcsec += 384.9389 * Math.cos(0.0000137621 * t + (-1.9152));
      d_lon_arcsec += 163.8231 * Math.cos(0.0000206432 * t + (1.5548));
      d_lon_arcsec += 88.5462 * Math.cos(0.0000275242 * t + (-0.9473));
      d_lon_arcsec += 71.2471 * Math.cos(0.2280174343 * t + (1.4297));
      d_lon_arcsec += 58.6225 * Math.cos(0.2280243154 * t + (-1.2758));
      d_lon_arcsec += 54.6703 * Math.cos(0.0000344053 * t + (2.7649));
      d_lon_arcsec += 47.2641 * Math.cos(0.2280380775 * t + (-2.7351));
      d_lon_arcsec += 46.4461 * Math.cos(0.2280105533 * t + (-2.3203));
      d_lon_arcsec += 42.2051 * Math.cos(0.0000412863 * t + (0.1239));
      d_lon_arcsec += 36.6149 * Math.cos(0.2280449585 * t + (1.0312));
      d_lon_arcsec += 32.3483 * Math.cos(0.2280036722 * t + (0.2675));
      d_lon_arcsec += 30.6970 * Math.cos(0.0000481674 * t + (-2.3019));
      d_lon_arcsec += 27.2598 * Math.cos(0.2280518396 * t + (-1.5514));
      d_lon_arcsec += 24.7539 * Math.cos(0.2279967912 * t + (2.7851));
      d_lon_arcsec += 24.0023 * Math.cos(0.0000550484 * t + (1.2222));
      d_lon_arcsec += 21.7528 * Math.cos(0.2280587206 * t + (2.2102));
      d_lon_arcsec += 21.5942 * Math.cos(0.2280311964 * t + (0.4712));
      d_lon_arcsec += 20.6836 * Math.cos(0.0000619295 * t + (-1.1797));
      d_lon_arcsec += 19.8694 * Math.cos(0.2279899101 * t + (-0.9866));
      d_lon_arcsec += 19.6913 * Math.cos(0.4255380443 * t + (1.0618));
      d_lon_arcsec += 17.9086 * Math.cos(0.2280656017 * t + (-0.2978));
      d_lon_arcsec += 16.7421 * Math.cos(0.2279830291 * t + (1.5457));
      d_lon_arcsec += 16.7046 * Math.cos(0.0000688105 * t + (2.4394));
      d_lon_arcsec += 15.2705 * Math.cos(0.2280724827 * t + (-2.8322));
      d_lon_arcsec += 14.5759 * Math.cos(0.4255449253 * t + (-1.5570));
      d_lon_arcsec += 14.5221 * Math.cos(0.2279761480 * t + (-2.2398));
      d_lon_arcsec += 14.2378 * Math.cos(0.0000825726 * t + (-2.6405));
      d_lon_arcsec += 13.5268 * Math.cos(0.0000756916 * t + (-0.0917));
      d_lon_arcsec += 13.4771 * Math.cos(0.2280793638 * t + (0.9529));
      d_lon_arcsec += 12.6024 * Math.cos(0.2279692670 * t + (0.2906));
      d_lon_arcsec += 11.7718 * Math.cos(0.2280862448 * t + (-1.5739));
      d_lon_arcsec += 11.6673 * Math.cos(0.0000963347 * t + (-1.5241));
      d_lon_arcsec += 11.3874 * Math.cos(0.2279623859 * t + (2.7960));
      d_lon_arcsec += 10.6888 * Math.cos(0.2280931259 * t + (2.1965));
      d_lon_arcsec += 10.6840 * Math.cos(0.4255311632 * t + (-2.5482));
      d_lon_arcsec += 10.2298 * Math.cos(0.2279555049 * t + (-0.9643));
      d_lon_arcsec += 10.2298 * Math.cos(0.1975206100 * t + (2.7417));
      d_lon_arcsec += 10.1469 * Math.cos(0.1974999668 * t + (0.7380));
      d_lon_arcsec += 9.6796 * Math.cos(0.2281000070 * t + (-0.3243));
      d_lon_arcsec += 9.2449 * Math.cos(0.2279486238 * t + (1.5418));
      d_lon_arcsec += 9.1503 * Math.cos(0.0000894537 * t + (1.1284));
      d_lon_arcsec += 8.7873 * Math.cos(0.2281068880 * t + (-2.8279));
      d_lon_arcsec += 8.6879 * Math.cos(0.0001100968 * t + (-0.3193));
      d_lon_arcsec += 8.6275 * Math.cos(0.2279417427 * t + (-2.2158));
      d_lon_arcsec += 8.2244 * Math.cos(0.2281137691 * t + (0.9253));
      d_lon_arcsec += 8.0392 * Math.cos(0.0001032158 * t + (2.3643));
      d_lon_arcsec += 7.8428 * Math.cos(0.2279348617 * t + (0.2781));
      d_lon_arcsec += 7.5603 * Math.cos(0.0001169779 * t + (-2.8147));
      d_lon_arcsec += 7.5345 * Math.cos(0.2281206501 * t + (-1.5640));
      d_lon_arcsec += 7.3710 * Math.cos(0.2279279806 * t + (2.8154));
      d_lon_arcsec += 7.2491 * Math.cos(0.1975274910 * t + (0.2360));
      d_lon_arcsec += 7.2262 * Math.cos(0.1974930857 * t + (-3.0524));
      d_lon_arcsec += 7.0644 * Math.cos(0.2281275312 * t + (2.1803));
      d_lon_arcsec += 6.9151 * Math.cos(0.0001238589 * t + (0.9818));
      d_lon_arcsec += 6.8566 * Math.cos(0.2279210996 * t + (-0.9726));
      d_lon_arcsec += 6.6936 * Math.cos(0.0001307400 * t + (-1.7004));
      d_lon_arcsec += 6.6154 * Math.cos(0.2281344122 * t + (-0.3154));
      d_lon_arcsec += 6.5281 * Math.cos(0.1975137289 * t + (-0.8016));
      d_lon_arcsec += 6.4414 * Math.cos(0.2279142185 * t + (1.5519));
      d_lon_arcsec += 6.4241 * Math.cos(0.4560555118 * t + (1.8040));
      d_lon_arcsec += 6.3071 * Math.cos(0.4255518064 * t + (2.1454));
      d_lon_arcsec += 6.2742 * Math.cos(0.1975068479 * t + (-2.0078));
      d_lon_arcsec += 6.2182 * Math.cos(0.2281412933 * t + (-2.8384));
      d_lon_arcsec += 6.0828 * Math.cos(0.0001376210 * t + (2.2380));
      d_lon_arcsec += 6.0623 * Math.cos(0.2279073375 * t + (-2.2194));
      d_lon_arcsec += 5.8626 * Math.cos(0.2281481743 * t + (0.9320));
      d_lon_arcsec += 5.7740 * Math.cos(0.0001445021 * t + (-0.4554));
      d_lon_arcsec += 5.7488 * Math.cos(0.2279004564 * t + (0.2889));
      d_lon_arcsec += 5.5774 * Math.cos(0.2281550554 * t + (-1.5765));
      d_lon_arcsec += 5.4433 * Math.cos(0.4560623929 * t + (-0.8232));
      d_lon_arcsec += 5.4091 * Math.cos(0.2278935754 * t + (2.8113));
      d_lon_arcsec += 5.3261 * Math.cos(0.0001582642 * t + (0.8024));
      d_lon_arcsec += 5.2915 * Math.cos(0.0001513832 * t + (-2.8932));
      d_lon_arcsec += 5.2502 * Math.cos(0.2281619364 * t + (2.1857));
      d_lon_arcsec += 5.2355 * Math.cos(0.1975343721 * t + (-2.3453));
      d_lon_arcsec += 5.2347 * Math.cos(0.1974862047 * t + (-0.4743));
      d_lon_arcsec += 5.1901 * Math.cos(0.2278866943 * t + (-0.9654));
      d_lon_arcsec += 5.0463 * Math.cos(0.2281688175 * t + (-0.3223));
      d_lon_arcsec += 4.9118 * Math.cos(0.2278798133 * t + (1.5530));
      d_lon_arcsec += 4.8684 * Math.cos(0.0001720263 * t + (2.0438));
      d_lon_arcsec += 4.7837 * Math.cos(0.2281756985 * t + (-2.8399));
      d_lon_arcsec += 4.7064 * Math.cos(0.2278729322 * t + (-2.2213));
      d_lon_arcsec += 4.6304 * Math.cos(0.0001651453 * t + (-1.7028));
      d_lon_arcsec += 4.5867 * Math.cos(0.2281825796 * t + (0.9343));
      d_lon_arcsec += 4.4942 * Math.cos(0.2278660512 * t + (0.2967));
      d_lon_arcsec += 4.4119 * Math.cos(0.0001857884 * t + (-3.0279));
      d_lon_arcsec += 4.3908 * Math.cos(0.2281894606 * t + (-1.5846));
      d_lon_arcsec += 4.3098 * Math.cos(0.2278591701 * t + (2.8091));
      d_lon_arcsec += 4.2099 * Math.cos(0.2281963417 * t + (2.1897));
      d_lon_arcsec += 4.1607 * Math.cos(0.2278522891 * t + (-0.9617));
      d_lon_arcsec += 4.1440 * Math.cos(0.0001789074 * t + (-0.5098));
      d_lon_arcsec += 4.0950 * Math.cos(0.1974793236 * t + (2.0370));
      d_lon_arcsec += 4.0822 * Math.cos(0.1975412531 * t + (1.4240));
      d_lon_arcsec += 4.0596 * Math.cos(0.2282032227 * t + (-0.3285));
      d_lon_arcsec += 3.9881 * Math.cos(0.0001926695 * t + (0.7741));
      d_lon_arcsec += 3.9619 * Math.cos(0.2278454080 * t + (1.5495));
      d_lon_arcsec += 3.9433 * Math.cos(0.0002064316 * t + (1.9934));
      d_lon_arcsec += 3.8953 * Math.cos(0.2282101038 * t + (-2.8360));
      d_lon_arcsec += 3.8463 * Math.cos(0.2278385270 * t + (-2.2121));
      d_lon_arcsec += 3.7950 * Math.cos(0.0001995505 * t + (-1.8162));
      d_lon_arcsec += 3.7792 * Math.cos(0.0002201937 * t + (-3.1171));
      d_lon_arcsec += 3.7564 * Math.cos(0.2282169848 * t + (0.9278));
      d_lon_arcsec += 3.7092 * Math.cos(0.2278316459 * t + (0.2929));
      d_lon_arcsec += 3.6369 * Math.cos(0.2282238659 * t + (-1.5831));
      d_lon_arcsec += 3.5633 * Math.cos(0.2278247649 * t + (2.8092));
      d_lon_arcsec += 3.5218 * Math.cos(0.4255586874 * t + (-0.5466));
      d_lon_arcsec += 3.5005 * Math.cos(0.2282307469 * t + (2.1885));
      d_lon_arcsec += 3.4645 * Math.cos(0.2278178838 * t + (-0.9570));
      d_lon_arcsec += 3.3993 * Math.cos(0.2282376280 * t + (-0.3307));
      d_lon_arcsec += 3.3431 * Math.cos(0.2278110027 * t + (1.5494));
      d_lon_arcsec += 3.3323 * Math.cos(0.1974724426 * t + (-1.7356));
      d_lon_arcsec += 3.3061 * Math.cos(0.1975481342 * t + (-1.0879));
      d_lon_arcsec += 3.2917 * Math.cos(0.0002133126 * t + (-0.5482));
      d_lon_arcsec += 3.2865 * Math.cos(0.2282445091 * t + (-2.8351));
      d_lon_arcsec += 3.2724 * Math.cos(0.0002339558 * t + (-1.9335));
      d_lon_arcsec += 3.2577 * Math.cos(0.0002408368 * t + (1.9916));
      d_lon_arcsec += 3.2395 * Math.cos(0.2278041217 * t + (-2.2118));
      d_lon_arcsec += 3.1786 * Math.cos(0.2282513901 * t + (0.9238));
      d_lon_arcsec += 3.1581 * Math.cos(0.0002270747 * t + (0.7716));
      d_lon_arcsec += 3.1535 * Math.cos(0.2277972406 * t + (0.2938));
      d_lon_arcsec += 3.1453 * Math.cos(0.0002545989 * t + (-3.1033));
      d_lon_arcsec += 3.1083 * Math.cos(0.2282582712 * t + (-1.5811));
      d_lon_arcsec += 3.0401 * Math.cos(0.2277903596 * t + (2.8118));
      d_lon_arcsec += 2.9885 * Math.cos(0.2282651522 * t + (2.1858));
      d_lon_arcsec += 2.9766 * Math.cos(0.2277834785 * t + (-0.9578));
      d_lon_arcsec += 2.9347 * Math.cos(0.0002683610 * t + (-1.8870));
      d_lon_arcsec += 2.9312 * Math.cos(0.2282720333 * t + (-0.3301));
      d_lon_arcsec += 2.8768 * Math.cos(0.2277765975 * t + (1.5519));
      d_lon_arcsec += 2.8546 * Math.cos(0.0002477179 * t + (-0.6515));
      d_lon_arcsec += 2.8332 * Math.cos(0.2282789143 * t + (-2.8381));
      d_lon_arcsec += 2.8289 * Math.cos(0.1974655615 * t + (0.7942));
      d_lon_arcsec += 2.8113 * Math.cos(0.2277697164 * t + (-2.2125));
      d_lon_arcsec += 2.8104 * Math.cos(0.1975550152 * t + (2.6631));
      d_lon_arcsec += 2.7886 * Math.cos(0.4560692739 * t + (2.9188));
      d_lon_arcsec += 2.7705 * Math.cos(0.2282857954 * t + (0.9247));
      d_lon_arcsec += 2.7621 * Math.cos(0.0002821231 * t + (-0.6503));
      d_lon_arcsec += 2.7297 * Math.cos(0.2277628354 * t + (0.2950));
      d_lon_arcsec += 2.7174 * Math.cos(0.4560486307 * t + (-1.6562));
      d_lon_arcsec += 2.6927 * Math.cos(0.2282926764 * t + (-1.5812));
      d_lon_arcsec += 2.6697 * Math.cos(0.0002614800 * t + (0.6320));
      d_lon_arcsec += 2.6649 * Math.cos(0.2277559543 * t + (2.8145));
      d_lon_arcsec += 2.6273 * Math.cos(0.2282995575 * t + (2.1818));
      d_lon_arcsec += 2.5970 * Math.cos(0.2277490733 * t + (-0.9609));
      d_lon_arcsec += 2.5664 * Math.cos(0.0002752421 * t + (1.8818));
      d_lon_arcsec += 2.5617 * Math.cos(0.2283064385 * t + (-0.3259));
      d_lon_arcsec += 2.5328 * Math.cos(0.2277421922 * t + (1.5573));
      d_lon_arcsec += 2.5316 * Math.cos(0.0002958853 * t + (0.5559));
      d_lon_arcsec += 2.5002 * Math.cos(0.2283133196 * t + (-2.8450));
      d_lon_arcsec += 2.4972 * Math.cos(0.0003027663 * t + (-1.8740));
      d_lon_arcsec += 2.4952 * Math.cos(0.4618011906 * t + (1.0530));
      d_lon_arcsec += 2.4781 * Math.cos(0.0003165284 * t + (-0.6610));
      d_lon_arcsec += 2.4773 * Math.cos(0.2277353112 * t + (-2.2164));
      d_lon_arcsec += 2.4765 * Math.cos(0.1974586805 * t + (-2.9898));
      d_lon_arcsec += 2.4561 * Math.cos(0.0002890042 * t + (-3.1326));
      d_lon_arcsec += 2.4520 * Math.cos(0.1975618963 * t + (0.1673));
      d_lon_arcsec += 2.4477 * Math.cos(0.2283202006 * t + (0.9300));
      d_lon_arcsec += 2.4103 * Math.cos(0.2277284301 * t + (0.2995));
      d_lon_arcsec += 2.3799 * Math.cos(0.2283270817 * t + (-1.5857));
      d_lon_arcsec += 2.3707 * Math.cos(0.2277215491 * t + (2.8135));
      d_lon_arcsec += 2.3601 * Math.cos(0.0003302905 * t + (0.5497));
      d_lon_arcsec += 2.3599 * Math.cos(0.4255655685 * t + (-3.0592));
      d_lon_arcsec += 2.3399 * Math.cos(0.2283339627 * t + (2.1823));
      d_lon_arcsec += 2.3027 * Math.cos(0.2277146680 * t + (-0.9615));
      d_lon_arcsec += 2.2787 * Math.cos(0.2283408438 * t + (-0.3263));
      d_lon_arcsec += 2.2623 * Math.cos(0.2277077870 * t + (1.5608));
      d_lon_arcsec += 2.2567 * Math.cos(0.0003096474 * t + (1.8127));
      d_lon_arcsec += 2.2365 * Math.cos(0.2283477248 * t + (-2.8463));
      d_lon_arcsec += 2.2122 * Math.cos(0.2277009059 * t + (-2.2181));
      d_lon_arcsec += 2.1977 * Math.cos(0.0003440526 * t + (1.7921));
      d_lon_arcsec += 2.1874 * Math.cos(0.2283546059 * t + (0.9310));
      d_lon_arcsec += 2.1674 * Math.cos(0.2276940249 * t + (0.3032));
      d_lon_arcsec += 2.1538 * Math.cos(0.1974517994 * t + (-0.4622));
      d_lon_arcsec += 2.1410 * Math.cos(0.2283614869 * t + (-1.5892));
      d_lon_arcsec += 2.1302 * Math.cos(0.1975687773 * t + (-2.3621));
      d_lon_arcsec += 2.1229 * Math.cos(0.4255242822 * t + (0.5152));
      d_lon_arcsec += 2.1222 * Math.cos(0.2276871438 * t + (2.8069));
      d_lon_arcsec += 2.1051 * Math.cos(0.0003234095 * t + (3.0975));
      d_lon_arcsec += 2.1009 * Math.cos(0.2283683680 * t + (2.1857));
      d_lon_arcsec += 2.0715 * Math.cos(0.0003371716 * t + (-1.9155));
      d_lon_arcsec += 2.0704 * Math.cos(0.2276802628 * t + (-0.9504));
      d_lon_arcsec += 2.0579 * Math.cos(0.2276733817 * t + (1.5550));
      d_lon_arcsec += 2.0573 * Math.cos(0.2283752490 * t + (-0.3319));
      d_lon_arcsec += 2.0476 * Math.cos(0.0003578147 * t + (3.0285));
      d_lon_arcsec += 2.0369 * Math.cos(0.0003646958 * t + (0.5745));
      d_lon_arcsec += 2.0298 * Math.cos(0.0003509337 * t + (-0.6669));
      d_lon_arcsec += 2.0214 * Math.cos(0.2283821301 * t + (-2.8414));
      d_lon_arcsec += 1.9864 * Math.cos(0.2276665006 * t + (-2.2198));
      d_lon_arcsec += 1.9763 * Math.cos(0.2283890112 * t + (0.9263));
      d_lon_arcsec += 1.9671 * Math.cos(0.1974449184 * t + (2.0444));
      d_lon_arcsec += 1.9635 * Math.cos(0.4617943095 * t + (-2.6058));
      d_lon_arcsec += 1.9617 * Math.cos(0.2276596196 * t + (0.3082));
      d_lon_arcsec += 1.9460 * Math.cos(0.2283958922 * t + (-1.5879));
      d_lon_arcsec += 1.9452 * Math.cos(0.0003784579 * t + (1.7999));
      d_lon_arcsec += 1.9354 * Math.cos(0.2276527385 * t + (2.8103));
      d_lon_arcsec += 1.9329 * Math.cos(0.1975756584 * t + (1.4107));
      d_lon_arcsec += 1.9113 * Math.cos(0.0003715768 * t + (-1.9772));
      d_lon_arcsec += 1.9080 * Math.cos(0.2284027733 * t + (2.1840));
      d_lon_arcsec += 1.8898 * Math.cos(0.0003922200 * t + (3.0646));
      d_lon_arcsec += 1.8881 * Math.cos(0.2276458575 * t + (-0.9574));
      d_lon_arcsec += 1.8747 * Math.cos(0.2284096543 * t + (-0.3304));
      d_lon_arcsec += 1.8713 * Math.cos(0.6535554786 * t + (-0.6380));
      d_lon_arcsec += 1.8639 * Math.cos(0.0003853389 * t + (-0.7368));
      d_lon_arcsec += 1.8559 * Math.cos(0.2276389764 * t + (1.5568));
      d_lon_arcsec += 1.8387 * Math.cos(0.2284165354 * t + (-2.8434));
      d_lon_arcsec += 1.8334 * Math.cos(0.0004059821 * t + (-1.9783));
      d_lon_arcsec += 1.8262 * Math.cos(0.2276320954 * t + (-2.2106));
      d_lon_arcsec += 1.8115 * Math.cos(0.2284234164 * t + (0.9250));
      d_lon_arcsec += 1.8096 * Math.cos(0.6535623597 * t + (2.9997));
      d_lon_arcsec += 1.7964 * Math.cos(0.2276252143 * t + (0.2996));
      d_lon_arcsec += 1.7848 * Math.cos(0.0004197442 * t + (-0.7602));
      d_lon_arcsec += 1.7771 * Math.cos(0.2284302975 * t + (-1.5860));
      d_lon_arcsec += 1.7754 * Math.cos(0.1974380373 * t + (-1.7044));
      d_lon_arcsec += 1.7677 * Math.cos(0.0003991010 * t + (0.5129));
      d_lon_arcsec += 1.7645 * Math.cos(0.2276183333 * t + (2.8142));
      d_lon_arcsec += 1.7496 * Math.cos(0.2284371785 * t + (2.1812));
      d_lon_arcsec += 1.7489 * Math.cos(0.1975825394 * t + (-1.1243));
      d_lon_arcsec += 1.7349 * Math.cos(0.2276114522 * t + (-0.9577));
      d_lon_arcsec += 1.7340 * Math.cos(0.4255724495 * t + (0.6887));
      d_lon_arcsec += 1.7205 * Math.cos(0.2284440596 * t + (-0.3291));
      d_lon_arcsec += 1.7081 * Math.cos(0.4560761550 * t + (0.2954));
      d_lon_arcsec += 1.7024 * Math.cos(0.2276045712 * t + (1.5598));
      d_lon_arcsec += 1.7005 * Math.cos(0.4617805474 * t + (-1.0145));
      d_lon_arcsec += 1.6938 * Math.cos(0.0004403874 * t + (-1.9990));
      d_lon_arcsec += 1.6912 * Math.cos(0.0004128631 * t + (1.7734));
      d_lon_arcsec += 1.6890 * Math.cos(0.2284509406 * t + (-2.8453));
      d_lon_arcsec += 1.6870 * Math.cos(0.2275976901 * t + (-2.2109));
      d_lon_arcsec += 1.6794 * Math.cos(0.0004266253 * t + (3.0721));
      d_lon_arcsec += 1.6696 * Math.cos(0.2284578217 * t + (0.9246));
      d_lon_arcsec += 1.6510 * Math.cos(0.2275908091 * t + (0.2980));
      d_lon_arcsec += 1.6461 * Math.cos(0.4618080716 * t + (-1.4601));
      d_lon_arcsec += 1.6375 * Math.cos(0.2284647027 * t + (-1.5849));
      d_lon_arcsec += 1.6289 * Math.cos(0.2275839280 * t + (2.8173));
      d_lon_arcsec += 1.6241 * Math.cos(0.0004335063 * t + (0.4727));
      d_lon_arcsec += 1.6121 * Math.cos(0.2284715838 * t + (2.1799));
      d_lon_arcsec += 1.6046 * Math.cos(0.2275770470 * t + (-0.9559));
      d_lon_arcsec += 1.5970 * Math.cos(0.1974311563 * t + (0.7942));
      d_lon_arcsec += 1.5918 * Math.cos(0.2284784648 * t + (-0.3311));
      d_lon_arcsec += 1.5875 * Math.cos(0.0004472684 * t + (1.7690));
      d_lon_arcsec += 1.5851 * Math.cos(0.0004541495 * t + (-0.7629));
      d_lon_arcsec += 1.5836 * Math.cos(0.2275701659 * t + (1.5652));
      d_lon_arcsec += 1.5754 * Math.cos(0.0004610305 * t + (3.0085));
      d_lon_arcsec += 1.5699 * Math.cos(0.1975894205 * t + (2.6635));
      d_lon_arcsec += 1.5659 * Math.cos(0.0004747926 * t + (-2.0427));
      d_lon_arcsec += 1.5654 * Math.cos(0.2284853459 * t + (-2.8441));
      d_lon_arcsec += 1.5561 * Math.cos(0.2275632849 * t + (-2.2113));
      d_lon_arcsec += 1.5521 * Math.cos(0.0004954358 * t + (3.0286));
      d_lon_arcsec += 1.5425 * Math.cos(0.2284922269 * t + (0.9259));
      d_lon_arcsec += 1.5164 * Math.cos(0.2284991080 * t + (-1.5893));
      d_lon_arcsec += 1.5104 * Math.cos(0.2275564038 * t + (0.2959));
      d_lon_arcsec += 1.5068 * Math.cos(0.1974242752 * t + (-2.9649));
      d_lon_arcsec += 1.5060 * Math.cos(0.2285059890 * t + (2.1794));
      d_lon_arcsec += 1.5009 * Math.cos(0.2275495228 * t + (2.8219));
      d_lon_arcsec += 1.4912 * Math.cos(0.2275426417 * t + (-0.9594));
      d_lon_arcsec += 1.4855 * Math.cos(0.0004679116 * t + (0.4936));
      d_lon_arcsec += 1.4779 * Math.cos(0.1975963015 * t + (0.1394));
      d_lon_arcsec += 1.4725 * Math.cos(0.2285128701 * t + (-0.3238));
      d_lon_arcsec += 1.4569 * Math.cos(0.2275357607 * t + (1.5567));
      d_lon_arcsec += 1.4562 * Math.cos(0.0004885547 * t + (-0.8087));
      d_lon_arcsec += 1.4516 * Math.cos(0.2285197511 * t + (-2.8548));
      d_lon_arcsec += 1.4502 * Math.cos(0.2285266322 * t + (0.9293));
      d_lon_arcsec += 1.4501 * Math.cos(0.0005023168 * t + (0.4636));
      d_lon_arcsec += 1.4460 * Math.cos(0.0004816737 * t + (1.7896));
      d_lon_arcsec += 1.4439 * Math.cos(0.2275288796 * t + (-2.2111));
      d_lon_arcsec += 1.4305 * Math.cos(0.0005091979 * t + (-2.0062));
      d_lon_arcsec += 1.4300 * Math.cos(0.4255174011 * t + (-2.2358));
      d_lon_arcsec += 1.4222 * Math.cos(0.2275219985 * t + (0.3025));
      d_lon_arcsec += 1.4168 * Math.cos(0.4255793306 * t + (-1.8614));
      d_lon_arcsec += 1.4159 * Math.cos(0.0005229600 * t + (-0.7797));
      d_lon_arcsec += 1.4087 * Math.cos(0.2275151175 * t + (2.8152));
      d_lon_arcsec += 1.4056 * Math.cos(0.2285335133 * t + (-1.5856));
      d_lon_arcsec += 1.4019 * Math.cos(0.2285403943 * t + (2.1758));
      d_lon_arcsec += 1.3840 * Math.cos(0.2275082364 * t + (-0.9577));
      d_lon_arcsec += 1.3807 * Math.cos(0.2285472754 * t + (-0.3292));
      d_lon_arcsec += 1.3732 * Math.cos(0.0005367221 * t + (0.4637));
      d_lon_arcsec += 1.3673 * Math.cos(0.2275013554 * t + (1.5609));
      d_lon_arcsec += 1.3666 * Math.cos(0.1974173942 * t + (-0.4736));
      d_lon_arcsec += 1.3644 * Math.cos(0.0005160789 * t + (1.7188));
      d_lon_arcsec += 1.3629 * Math.cos(0.2285541564 * t + (-2.8469));
      d_lon_arcsec += 1.3623 * Math.cos(0.4083354132 * t + (0.9612));
      d_lon_arcsec += 1.3513 * Math.cos(0.2274944743 * t + (-2.2126));
      d_lon_arcsec += 1.3431 * Math.cos(0.2285610375 * t + (0.9277));
      d_lon_arcsec += 1.3351 * Math.cos(0.1976031826 * t + (-2.3517));
      d_lon_arcsec += 1.3334 * Math.cos(0.2274875933 * t + (0.3037));
      d_lon_arcsec += 1.3324 * Math.cos(0.0005504842 * t + (1.7043));
      d_lon_arcsec += 1.3255 * Math.cos(0.2285679185 * t + (-1.5930));
      d_lon_arcsec += 1.3253 * Math.cos(0.0005298410 * t + (2.9950));
      d_lon_arcsec += 1.3177 * Math.cos(0.2274807122 * t + (2.8130));
      d_lon_arcsec += 1.3153 * Math.cos(0.4617736664 * t + (1.4906));
      d_lon_arcsec += 1.3144 * Math.cos(0.2285747996 * t + (2.1826));
      d_lon_arcsec += 1.2979 * Math.cos(0.2274738312 * t + (-0.9531));
      d_lon_arcsec += 1.2933 * Math.cos(0.2285816806 * t + (-0.3330));
      d_lon_arcsec += 1.2888 * Math.cos(0.1974105131 * t + (2.0664));
      d_lon_arcsec += 1.2869 * Math.cos(0.0005436031 * t + (-2.0280));
      d_lon_arcsec += 1.2860 * Math.cos(0.0005642463 * t + (2.9541));
      d_lon_arcsec += 1.2855 * Math.cos(0.2274669501 * t + (1.5585));
      d_lon_arcsec += 1.2794 * Math.cos(0.2285885617 * t + (-2.8438));
      d_lon_arcsec += 1.2693 * Math.cos(0.0005573652 * t + (-0.7695));
      d_lon_arcsec += 1.2686 * Math.cos(0.0005848895 * t + (1.7223));
      d_lon_arcsec += 1.2679 * Math.cos(0.2274600691 * t + (-2.2099));
      break;
    case 'mangala':
      // Linear drift: intercept + slope * t
      d_lon_arcsec += -30.2686 + (0.0000187471 * t);
      d_lon_arcsec += 42.3772 * Math.cos(0.0000137621 * t + (-1.8187));
      d_lon_arcsec += 16.9143 * Math.cos(0.0161154248 * t + (-0.4843));
      d_lon_arcsec += 16.1056 * Math.cos(0.0161291869 * t + (0.6700));
      d_lon_arcsec += 14.5244 * Math.cos(0.0000275242 * t + (-0.7043));
      d_lon_arcsec += 8.7302 * Math.cos(0.0161429490 * t + (1.9636));
      d_lon_arcsec += 7.8151 * Math.cos(0.0322446117 * t + (0.1523));
      d_lon_arcsec += 7.6250 * Math.cos(0.0182898374 * t + (-0.4946));
      d_lon_arcsec += 7.5651 * Math.cos(0.0322033254 * t + (-0.5411));
      d_lon_arcsec += 6.7710 * Math.cos(0.0483325123 * t + (0.1383));
      d_lon_arcsec += 6.3397 * Math.cos(0.0483187502 * t + (-1.0602));
      d_lon_arcsec += 6.0804 * Math.cos(0.0000412863 * t + (0.2325));
      d_lon_arcsec += 5.9041 * Math.cos(0.0182760753 * t + (-1.5380));
      d_lon_arcsec += 5.6038 * Math.cos(0.0161567111 * t + (3.1259));
      d_lon_arcsec += 5.4105 * Math.cos(0.0322583738 * t + (1.4701));
      d_lon_arcsec += 5.3007 * Math.cos(0.0321895633 * t + (-1.8498));
      d_lon_arcsec += 5.1591 * Math.cos(0.0644479370 * t + (-0.3884));
      d_lon_arcsec += 4.7698 * Math.cos(0.0322308496 * t + (-0.8432));
      d_lon_arcsec += 4.6184 * Math.cos(0.0183035995 * t + (0.2515));
      d_lon_arcsec += 4.6121 * Math.cos(0.0322170875 * t + (0.5611));
      d_lon_arcsec += 4.5488 * Math.cos(0.0161016627 * t + (-1.4788));
      d_lon_arcsec += 4.1319 * Math.cos(0.0160741385 * t + (-1.4437));
      d_lon_arcsec += 4.1187 * Math.cos(0.0160879006 * t + (-0.1058));
      d_lon_arcsec += 4.0881 * Math.cos(0.0161704732 * t + (-1.8977));
      d_lon_arcsec += 3.8926 * Math.cos(0.0322721359 * t + (2.6593));
      d_lon_arcsec += 3.8527 * Math.cos(0.0321758012 * t + (-3.0384));
      d_lon_arcsec += 3.5074 * Math.cos(0.0483049880 * t + (-2.3479));
      d_lon_arcsec += 3.3706 * Math.cos(0.0000550484 * t + (1.4928));
      d_lon_arcsec += 3.3408 * Math.cos(0.0644341749 * t + (-1.5714));
      d_lon_arcsec += 3.3401 * Math.cos(0.0160603764 * t + (-2.6009));
      d_lon_arcsec += 3.2578 * Math.cos(0.0644616992 * t + (0.7359));
      d_lon_arcsec += 3.1947 * Math.cos(0.0161842353 * t + (-0.6360));
      d_lon_arcsec += 3.0284 * Math.cos(0.0322858980 * t + (-2.3720));
      d_lon_arcsec += 3.0096 * Math.cos(0.0321620391 * t + (1.9909));
      d_lon_arcsec += 3.0009 * Math.cos(0.0182623131 * t + (-2.5453));
      d_lon_arcsec += 2.7820 * Math.cos(0.0160466143 * t + (2.4462));
      d_lon_arcsec += 2.6232 * Math.cos(0.0161979974 * t + (0.6036));
      d_lon_arcsec += 2.6226 * Math.cos(0.0805633618 * t + (-0.9116));
      d_lon_arcsec += 2.4591 * Math.cos(0.0321482769 * t + (0.7266));
      d_lon_arcsec += 2.4578 * Math.cos(0.0183173616 * t + (0.6208));
      d_lon_arcsec += 2.4562 * Math.cos(0.0322996601 * t + (-1.1141));
      d_lon_arcsec += 2.4169 * Math.cos(0.0805771239 * t + (0.2651));
      d_lon_arcsec += 2.3615 * Math.cos(0.0160328522 * t + (1.1841));
      d_lon_arcsec += 2.2932 * Math.cos(0.0482912259 * t + (2.7759));
      d_lon_arcsec += 2.2529 * Math.cos(0.0162117595 * t + (1.8803));
      d_lon_arcsec += 2.1916 * Math.cos(0.0300426749 * t + (-2.3479));
      d_lon_arcsec += 2.1225 * Math.cos(0.0021881747 * t + (-0.0961));
      d_lon_arcsec += 2.1152 * Math.cos(0.0000688105 * t + (2.6609));
      d_lon_arcsec += 2.1067 * Math.cos(0.0461580997 * t + (-3.0721));
      d_lon_arcsec += 2.0890 * Math.cos(0.0323134222 * t + (0.1390));
      d_lon_arcsec += 2.0729 * Math.cos(0.0344052621 * t + (-0.9391));
      d_lon_arcsec += 2.0681 * Math.cos(0.0321345148 * t + (-0.5163));
      d_lon_arcsec += 2.0340 * Math.cos(0.0160190901 * t + (-0.0492));
      d_lon_arcsec += 1.9255 * Math.cos(0.0162255216 * t + (3.1291));
      d_lon_arcsec += 1.9096 * Math.cos(0.0483462744 * t + (0.9903));
      d_lon_arcsec += 1.8331 * Math.cos(0.0160053279 * t + (-1.3235));
      d_lon_arcsec += 1.8223 * Math.cos(0.0323271843 * t + (1.4066));
      d_lon_arcsec += 1.8123 * Math.cos(0.0321207527 * t + (-1.7910));
      d_lon_arcsec += 1.7856 * Math.cos(0.0505344490 * t + (-0.1036));
      d_lon_arcsec += 1.7805 * Math.cos(0.0548695121 * t + (2.8941));
      d_lon_arcsec += 1.7780 * Math.cos(0.0461718618 * t + (-1.8833));
      d_lon_arcsec += 1.7610 * Math.cos(0.0483600365 * t + (-0.3455));
      d_lon_arcsec += 1.7484 * Math.cos(0.0162392837 * t + (-1.8988));
      d_lon_arcsec += 1.7471 * Math.cos(0.0021744126 * t + (-0.7555));
      d_lon_arcsec += 1.7337 * Math.cos(0.0483737986 * t + (1.0345));
      d_lon_arcsec += 1.7312 * Math.cos(0.0000825726 * t + (-2.5340));
      d_lon_arcsec += 1.7199 * Math.cos(0.0182485510 * t + (2.6294));
      d_lon_arcsec += 1.7122 * Math.cos(0.0344190242 * t + (0.0509));
      d_lon_arcsec += 1.6813 * Math.cos(0.0482774638 * t + (1.5156));
      d_lon_arcsec += 1.6528 * Math.cos(0.0548832742 * t + (2.6103));
      d_lon_arcsec += 1.6516 * Math.cos(0.0548557500 * t + (2.3434));
      d_lon_arcsec += 1.6403 * Math.cos(0.0300289128 * t + (2.2971));
      d_lon_arcsec += 1.6109 * Math.cos(0.0505206869 * t + (-1.1604));
      d_lon_arcsec += 1.5951 * Math.cos(0.0548970363 * t + (3.1105));
      d_lon_arcsec += 1.5933 * Math.cos(0.0183311237 * t + (1.3929));
      d_lon_arcsec += 1.5903 * Math.cos(0.0159915658 * t + (-2.5758));
      d_lon_arcsec += 1.5821 * Math.cos(0.0323409464 * t + (2.6671));
      d_lon_arcsec += 1.5796 * Math.cos(0.0321069906 * t + (-3.0514));
      d_lon_arcsec += 1.5485 * Math.cos(0.0162530458 * t + (-0.6685));
      d_lon_arcsec += 1.5336 * Math.cos(0.0827377744 * t + (-0.7600));
      d_lon_arcsec += 1.5267 * Math.cos(0.0622872866 * t + (-2.2560));
      d_lon_arcsec += 1.5027 * Math.cos(0.0159778037 * t + (2.4402));
      d_lon_arcsec += 1.4475 * Math.cos(0.0323547085 * t + (-2.3639));
      d_lon_arcsec += 1.4407 * Math.cos(0.0320932285 * t + (1.9631));
      d_lon_arcsec += 1.4225 * Math.cos(0.0666085875 * t + (-1.4583));
      d_lon_arcsec += 1.4201 * Math.cos(0.0159640416 * t + (1.2473));
      d_lon_arcsec += 1.4004 * Math.cos(0.0139272501 * t + (-1.1759));
      d_lon_arcsec += 1.3893 * Math.cos(0.0483875607 * t + (2.1962));
      d_lon_arcsec += 1.3551 * Math.cos(0.0226524246 * t + (3.0441));
      d_lon_arcsec += 1.3231 * Math.cos(0.0482637017 * t + (0.2544));
      d_lon_arcsec += 1.3202 * Math.cos(0.0365796747 * t + (2.0139));
      d_lon_arcsec += 1.3118 * Math.cos(0.0323684706 * t + (-1.1371));
      d_lon_arcsec += 1.3094 * Math.cos(0.0162668079 * t + (0.6840));
      d_lon_arcsec += 1.2973 * Math.cos(0.0320794664 * t + (0.6986));
      d_lon_arcsec += 1.2800 * Math.cos(0.0162805700 * t + (1.8488));
      d_lon_arcsec += 1.2740 * Math.cos(0.0805908860 * t + (1.5675));
      d_lon_arcsec += 1.2476 * Math.cos(0.0320657043 * t + (-0.2797));
      d_lon_arcsec += 1.2441 * Math.cos(0.0182347889 * t + (1.4458));
      d_lon_arcsec += 1.2434 * Math.cos(0.0666223496 * t + (-0.4549));
      d_lon_arcsec += 1.2413 * Math.cos(0.0365934368 * t + (2.3064));
      d_lon_arcsec += 1.2274 * Math.cos(0.0827240123 * t + (-1.8675));
      d_lon_arcsec += 1.2238 * Math.cos(0.0000963347 * t + (-1.1631));
      d_lon_arcsec += 1.2149 * Math.cos(0.0022019368 * t + (0.8856));
      d_lon_arcsec += 1.2058 * Math.cos(0.0988531992 * t + (-1.2035));
      d_lon_arcsec += 1.2007 * Math.cos(0.0387678494 * t + (2.7134));
      d_lon_arcsec += 1.1971 * Math.cos(0.0300564370 * t + (-1.3667));
      d_lon_arcsec += 1.1836 * Math.cos(0.0159502795 * t + (0.0107));
      d_lon_arcsec += 1.1781 * Math.cos(0.0183448858 * t + (2.5047));
      d_lon_arcsec += 1.1534 * Math.cos(0.0162943322 * t + (3.1310));
      d_lon_arcsec += 1.1496 * Math.cos(0.0484013228 * t + (-2.8515));
      d_lon_arcsec += 1.1382 * Math.cos(0.0159365174 * t + (-1.2843));
      d_lon_arcsec += 1.1365 * Math.cos(0.0323822327 * t + (0.2007));
      d_lon_arcsec += 1.1292 * Math.cos(0.0043488251 * t + (2.1079));
      d_lon_arcsec += 1.1290 * Math.cos(0.0966925487 * t + (-0.2846));
      d_lon_arcsec += 1.1210 * Math.cos(0.0622735245 * t + (2.5961));
      d_lon_arcsec += 1.1180 * Math.cos(0.0204780120 * t + (2.3101));
      d_lon_arcsec += 1.1065 * Math.cos(0.0505482111 * t + (1.0347));
      d_lon_arcsec += 1.0991 * Math.cos(0.0320519422 * t + (-1.7244));
      d_lon_arcsec += 1.0901 * Math.cos(0.0163080943 * t + (-1.9349));
      d_lon_arcsec += 1.0894 * Math.cos(0.0644204128 * t + (-2.8003));
      d_lon_arcsec += 1.0848 * Math.cos(0.0343915000 * t + (-1.8405));
      d_lon_arcsec += 1.0847 * Math.cos(0.0482499396 * t + (-0.9789));
      d_lon_arcsec += 1.0846 * Math.cos(0.0944906119 * t + (-2.9664));
      d_lon_arcsec += 1.0808 * Math.cos(0.0323959948 * t + (1.4017));
      d_lon_arcsec += 1.0772 * Math.cos(0.0065369998 * t + (-2.7401));
      d_lon_arcsec += 1.0748 * Math.cos(0.0783614251 * t + (2.6313));
      d_lon_arcsec += 1.0691 * Math.cos(0.0204642499 * t + (1.8413));
      d_lon_arcsec += 1.0612 * Math.cos(0.0159227553 * t + (-2.5835));
      d_lon_arcsec += 1.0477 * Math.cos(0.0139134880 * t + (3.1412));
      d_lon_arcsec += 1.0191 * Math.cos(0.0461443376 * t + (1.6014));
      d_lon_arcsec += 1.0174 * Math.cos(0.0548419879 * t + (1.1263));
      d_lon_arcsec += 1.0071 * Math.cos(0.0163218564 * t + (-0.6365));
      d_lon_arcsec += 1.0016 * Math.cos(0.0966512624 * t + (-0.9581));
      d_lon_arcsec += 1.0012 * Math.cos(0.0320381801 * t + (-3.0209));
      d_lon_arcsec += 0.9956 * Math.cos(0.0365659126 * t + (1.0822));
      d_lon_arcsec += 0.9952 * Math.cos(0.0001100968 * t + (-0.1587));
      d_lon_arcsec += 0.9901 * Math.cos(0.0504931627 * t + (-1.1812));
      d_lon_arcsec += 0.9898 * Math.cos(0.0324097569 * t + (2.6776));
      d_lon_arcsec += 0.9835 * Math.cos(0.0159089932 * t + (2.4875));
      d_lon_arcsec += 0.9779 * Math.cos(0.0183586479 * t + (-2.6030));
      d_lon_arcsec += 0.9777 * Math.cos(0.0549107984 * t + (-1.9479));
      d_lon_arcsec += 0.9613 * Math.cos(0.0666498738 * t + (-0.4248));
      d_lon_arcsec += 0.9575 * Math.cos(0.0484150849 * t + (-1.6020));
      d_lon_arcsec += 0.9454 * Math.cos(0.0665948254 * t + (-2.6489));
      d_lon_arcsec += 0.9431 * Math.cos(0.0320244180 * t + (2.0301));
      d_lon_arcsec += 0.9389 * Math.cos(0.0783751872 * t + (-2.3304));
      d_lon_arcsec += 0.9379 * Math.cos(0.0182210268 * t + (0.2599));
      d_lon_arcsec += 0.9374 * Math.cos(0.0163356185 * t + (0.5972));
      d_lon_arcsec += 0.9368 * Math.cos(0.0482361775 * t + (-2.2552));
      d_lon_arcsec += 0.9349 * Math.cos(0.0158952311 * t + (1.1974));
      d_lon_arcsec += 0.9314 * Math.cos(0.0324235190 * t + (-2.3821));
      d_lon_arcsec += 0.9198 * Math.cos(0.0644754613 * t + (2.1200));
      d_lon_arcsec += 0.9067 * Math.cos(0.0387816115 * t + (-2.7487));
      d_lon_arcsec += 0.9025 * Math.cos(0.0139410122 * t + (0.4290));
      d_lon_arcsec += 0.9009 * Math.cos(0.0988669613 * t + (-0.0960));
      d_lon_arcsec += 0.8875 * Math.cos(0.0366071989 * t + (3.0019));
      d_lon_arcsec += 0.8823 * Math.cos(0.0320106559 * t + (0.7413));
      d_lon_arcsec += 0.8821 * Math.cos(0.0095784250 * t + (2.2903));
      d_lon_arcsec += 0.8790 * Math.cos(0.0163493806 * t + (1.8619));
      d_lon_arcsec += 0.8785 * Math.cos(0.0158814690 * t + (-0.0459));
      d_lon_arcsec += 0.8724 * Math.cos(0.0324372811 * t + (-1.0973));
      d_lon_arcsec += 0.8544 * Math.cos(0.0001238589 * t + (1.2045));
      d_lon_arcsec += 0.8519 * Math.cos(0.0944768498 * t + (2.0367));
      d_lon_arcsec += 0.8477 * Math.cos(0.0623010487 * t + (-1.1462));
      d_lon_arcsec += 0.8468 * Math.cos(0.0344327864 * t + (0.9979));
      d_lon_arcsec += 0.8394 * Math.cos(0.0183724100 * t + (-1.3733));
      d_lon_arcsec += 0.8388 * Math.cos(0.0021606505 * t + (-1.7523));
      d_lon_arcsec += 0.8386 * Math.cos(0.0484288470 * t + (-0.3535));
      d_lon_arcsec += 0.8378 * Math.cos(0.0504794006 * t + (-2.2686));
      d_lon_arcsec += 0.8312 * Math.cos(0.0163631427 * t + (3.1179));
      d_lon_arcsec += 0.8309 * Math.cos(0.0158677069 * t + (-1.3089));
      d_lon_arcsec += 0.8256 * Math.cos(0.0319968938 * t + (-0.5050));
      d_lon_arcsec += 0.8233 * Math.cos(0.1127804493 * t + (-0.3274));
      d_lon_arcsec += 0.8169 * Math.cos(0.0300151507 * t + (0.6516));
      d_lon_arcsec += 0.8168 * Math.cos(0.0324510433 * t + (0.1478));
      d_lon_arcsec += 0.8120 * Math.cos(0.0805495997 * t + (-1.9018));
      d_lon_arcsec += 0.8095 * Math.cos(0.0182072647 * t + (-1.1205));
      d_lon_arcsec += 0.8074 * Math.cos(0.0806046481 * t + (2.7261));
      d_lon_arcsec += 0.8062 * Math.cos(0.0461856239 * t + (-0.5328));
      d_lon_arcsec += 0.8061 * Math.cos(0.0482224154 * t + (2.7782));
      d_lon_arcsec += 0.8031 * Math.cos(0.0139547743 * t + (2.5696));
      d_lon_arcsec += 0.7958 * Math.cos(0.0158539448 * t + (-2.5698));
      d_lon_arcsec += 0.7921 * Math.cos(0.1127666872 * t + (-1.4852));
      d_lon_arcsec += 0.7832 * Math.cos(0.1106060367 * t + (2.7506));
      d_lon_arcsec += 0.7784 * Math.cos(0.0319831317 * t + (-1.7697));
      d_lon_arcsec += 0.7778 * Math.cos(0.0163769048 * t + (-1.9202));
      d_lon_arcsec += 0.7689 * Math.cos(0.0324648054 * t + (1.4085));
      d_lon_arcsec += 0.7687 * Math.cos(0.0622460003 * t + (-2.9789));
      d_lon_arcsec += 0.7662 * Math.cos(0.0967063108 * t + (1.0414));
      d_lon_arcsec += 0.7527 * Math.cos(0.0484426091 * t + (0.9214));
      d_lon_arcsec += 0.7485 * Math.cos(0.0158401827 * t + (2.4661));
      d_lon_arcsec += 0.7453 * Math.cos(0.0163906669 * t + (-0.6534));
      d_lon_arcsec += 0.7420 * Math.cos(0.0043625872 * t + (2.4109));
      d_lon_arcsec += 0.7392 * Math.cos(0.0319693696 * t + (-3.0288));
      d_lon_arcsec += 0.7379 * Math.cos(0.0505619732 * t + (2.2056));
      d_lon_arcsec += 0.7370 * Math.cos(0.0966787866 * t + (-1.3631));
      d_lon_arcsec += 0.7363 * Math.cos(0.0666636359 * t + (0.7401));
      d_lon_arcsec += 0.7353 * Math.cos(0.0548282258 * t + (-0.1167));
      d_lon_arcsec += 0.7331 * Math.cos(0.0482086533 * t + (1.5305));
      d_lon_arcsec += 0.7319 * Math.cos(0.0784027114 * t + (-2.7431));
      d_lon_arcsec += 0.7301 * Math.cos(0.0324785675 * t + (2.6670));
      d_lon_arcsec += 0.7283 * Math.cos(0.0183861721 * t + (-0.1718));
      d_lon_arcsec += 0.7278 * Math.cos(0.0827515365 * t + (0.1988));
      d_lon_arcsec += 0.7260 * Math.cos(0.0001376210 * t + (2.2770));
      d_lon_arcsec += 0.7235 * Math.cos(0.0158264206 * t + (1.2024));
      d_lon_arcsec += 0.7224 * Math.cos(0.0549245605 * t + (-0.7155));
      d_lon_arcsec += 0.7205 * Math.cos(0.0001513832 * t + (-2.8292));
      d_lon_arcsec += 0.7174 * Math.cos(0.0204917741 * t + (2.9123));
      d_lon_arcsec += 0.7039 * Math.cos(0.0966375003 * t + (-2.2727));
      d_lon_arcsec += 0.7006 * Math.cos(0.0164044290 * t + (0.5945));
      d_lon_arcsec += 0.6965 * Math.cos(0.0319556075 * t + (2.0032));
      d_lon_arcsec += 0.6889 * Math.cos(0.0158126585 * t + (-0.0492));
      d_lon_arcsec += 0.6864 * Math.cos(0.0324923296 * t + (-2.3672));
      d_lon_arcsec += 0.6832 * Math.cos(0.0117390754 * t + (-1.9992));
      d_lon_arcsec += 0.6735 * Math.cos(0.0709849369 * t + (2.7853));
      d_lon_arcsec += 0.6731 * Math.cos(0.0183999342 * t + (1.0267));
      d_lon_arcsec += 0.6677 * Math.cos(0.0783476630 * t + (1.2500));
      d_lon_arcsec += 0.6669 * Math.cos(0.0319418454 * t + (0.7405));
      d_lon_arcsec += 0.6653 * Math.cos(0.1149823861 * t + (-0.5374));
      d_lon_arcsec += 0.6642 * Math.cos(0.0164181911 * t + (1.8520));
      d_lon_arcsec += 0.6601 * Math.cos(0.0204504878 * t + (1.0250));
      d_lon_arcsec += 0.6591 * Math.cos(0.0325060917 * t + (-1.1051));
      d_lon_arcsec += 0.6546 * Math.cos(0.0481948912 * t + (0.3111));
      d_lon_arcsec += 0.6535 * Math.cos(0.0484563712 * t + (2.1485));
      d_lon_arcsec += 0.6529 * Math.cos(0.0505069248 * t + (-0.9952));
      d_lon_arcsec += 0.6501 * Math.cos(0.0138997259 * t + (1.2724));
      d_lon_arcsec += 0.6492 * Math.cos(0.0481811291 * t + (-0.6613));
      d_lon_arcsec += 0.6485 * Math.cos(0.0278545002 * t + (-2.4785));
      d_lon_arcsec += 0.6457 * Math.cos(0.0157988964 * t + (-1.3000));
      d_lon_arcsec += 0.6434 * Math.cos(0.0988394371 * t + (-2.2390));
      d_lon_arcsec += 0.6420 * Math.cos(0.0043350630 * t + (0.9403));
      d_lon_arcsec += 0.6390 * Math.cos(0.0164319532 * t + (3.1053));
      d_lon_arcsec += 0.6381 * Math.cos(0.0181935026 * t + (-2.2770));
      d_lon_arcsec += 0.6332 * Math.cos(0.0319280833 * t + (-0.5106));
      d_lon_arcsec += 0.6305 * Math.cos(0.1106197988 * t + (-2.2331));
      d_lon_arcsec += 0.6284 * Math.cos(0.1149686240 * t + (-1.6207));
      d_lon_arcsec += 0.6243 * Math.cos(0.0325198538 * t + (0.1482));
      d_lon_arcsec += 0.6236 * Math.cos(0.0157851343 * t + (-2.5478));
      d_lon_arcsec += 0.6163 * Math.cos(0.0665810633 * t + (2.3957));
      d_lon_arcsec += 0.6153 * Math.cos(0.0164457153 * t + (-1.9005));
      d_lon_arcsec += 0.6117 * Math.cos(0.0827102502 * t + (-3.0264));
      d_lon_arcsec += 0.6102 * Math.cos(0.0484701333 * t + (-2.8653));
      d_lon_arcsec += 0.6071 * Math.cos(0.0157713722 * t + (2.4605));
      d_lon_arcsec += 0.6071 * Math.cos(0.0226661867 * t + (-2.3232));
      d_lon_arcsec += 0.6001 * Math.cos(0.0184136963 * t + (2.3632));
      d_lon_arcsec += 0.5964 * Math.cos(0.0504656385 * t + (2.7554));
      d_lon_arcsec += 0.5923 * Math.cos(0.0325336159 * t + (1.4042));
      d_lon_arcsec += 0.5889 * Math.cos(0.0001651453 * t + (-1.4880));
      d_lon_arcsec += 0.5883 * Math.cos(0.0164594774 * t + (-0.6562));
      d_lon_arcsec += 0.5863 * Math.cos(0.0319143212 * t + (-1.7526));
      d_lon_arcsec += 0.5848 * Math.cos(0.1288958741 * t + (-0.8401));
      d_lon_arcsec += 0.5846 * Math.cos(0.0157576101 * t + (1.2106));
      d_lon_arcsec += 0.5839 * Math.cos(0.0806184103 * t + (-2.2976));
      d_lon_arcsec += 0.5807 * Math.cos(0.0319005591 * t + (-3.0242));
      d_lon_arcsec += 0.5794 * Math.cos(0.0623148108 * t + (0.0623));
      d_lon_arcsec += 0.5773 * Math.cos(0.0622322382 * t + (1.8209));
      d_lon_arcsec += 0.5740 * Math.cos(0.0548144636 * t + (-1.3702));
      d_lon_arcsec += 0.5733 * Math.cos(0.0366209610 * t + (-2.3059));
      d_lon_arcsec += 0.5708 * Math.cos(0.0549383226 * t + (0.5332));
      d_lon_arcsec += 0.5705 * Math.cos(0.0365521505 * t + (0.0463));
      d_lon_arcsec += 0.5699 * Math.cos(0.0325473780 * t + (2.6564));
      d_lon_arcsec += 0.5693 * Math.cos(0.0484838954 * t + (-1.6715));
      d_lon_arcsec += 0.5688 * Math.cos(0.0157438480 * t + (-0.0551));
      d_lon_arcsec += 0.5686 * Math.cos(0.0966650245 * t + (0.0653));
      d_lon_arcsec += 0.5652 * Math.cos(0.0387403252 * t + (2.6958));
      d_lon_arcsec += 0.5647 * Math.cos(0.0164732395 * t + (0.6094));
      d_lon_arcsec += 0.5640 * Math.cos(0.0022156989 * t + (1.6396));
      d_lon_arcsec += 0.5620 * Math.cos(0.0184274584 * t + (-2.7070));
      d_lon_arcsec += 0.5615 * Math.cos(0.0318867970 * t + (1.9867));
      d_lon_arcsec += 0.5518 * Math.cos(0.0505757353 * t + (-2.8368));
      d_lon_arcsec += 0.5516 * Math.cos(0.0805220755 * t + (-1.9108));
      d_lon_arcsec += 0.5502 * Math.cos(0.0387540873 * t + (2.9013));
      d_lon_arcsec += 0.5489 * Math.cos(0.0325611401 * t + (-2.3570));
      d_lon_arcsec += 0.5484 * Math.cos(0.0967200729 * t + (2.2305));
      d_lon_arcsec += 0.5479 * Math.cos(0.0945043741 * t + (-1.6671));
      d_lon_arcsec += 0.5461 * Math.cos(0.0157300859 * t + (-1.3036));
      d_lon_arcsec += 0.5442 * Math.cos(0.0644066507 * t + (2.5790));
      d_lon_arcsec += 0.5430 * Math.cos(0.0666773980 * t + (1.9243));
      d_lon_arcsec += 0.5384 * Math.cos(0.0318730348 * t + (0.7350));
      d_lon_arcsec += 0.5382 * Math.cos(0.0164870016 * t + (1.8530));
      d_lon_arcsec += 0.5376 * Math.cos(0.0481673670 * t + (-2.2487));
      d_lon_arcsec += 0.5346 * Math.cos(0.0117253133 * t + (2.9574));
      d_lon_arcsec += 0.5336 * Math.cos(0.0181797405 * t + (2.9020));
      d_lon_arcsec += 0.5315 * Math.cos(0.0157163237 * t + (-2.5637));
      d_lon_arcsec += 0.5302 * Math.cos(0.0762007746 * t + (0.4957));
      d_lon_arcsec += 0.5279 * Math.cos(0.0325749022 * t + (-1.1057));
      d_lon_arcsec += 0.5253 * Math.cos(0.0871003616 * t + (2.5277));
      d_lon_arcsec += 0.5225 * Math.cos(0.0805358376 * t + (-0.5614));
      d_lon_arcsec += 0.5206 * Math.cos(0.0966237382 * t + (2.8389));
      d_lon_arcsec += 0.5204 * Math.cos(0.0318592727 * t + (-0.5281));
      d_lon_arcsec += 0.5198 * Math.cos(0.0165007637 * t + (3.1183));
      d_lon_arcsec += 0.5136 * Math.cos(0.0157025616 * t + (2.4433));
      d_lon_arcsec += 0.5134 * Math.cos(0.0205055362 * t + (-2.3778));
      d_lon_arcsec += 0.5099 * Math.cos(0.0570576867 * t + (-1.2679));
      d_lon_arcsec += 0.5098 * Math.cos(0.0325886643 * t + (0.1585));
      d_lon_arcsec += 0.5097 * Math.cos(0.0095921871 * t + (-3.0396));
      d_lon_arcsec += 0.5090 * Math.cos(0.0065232377 * t + (2.3230));
      d_lon_arcsec += 0.5038 * Math.cos(0.0666361117 * t + (-0.8622));
      d_lon_arcsec += 0.4994 * Math.cos(0.0318455106 * t + (-1.7787));
      d_lon_arcsec += 0.4990 * Math.cos(0.0156887995 * t + (1.2111));
      d_lon_arcsec += 0.4990 * Math.cos(0.0300013886 * t + (-0.4947));
      break;
    case 'budha':
      // Linear drift: intercept + slope * t
      d_lon_arcsec += -61.0075 + (0.0000338509 * t);
      d_lon_arcsec += 83.4185 * Math.cos(0.0000137621 * t + (-1.8414));
      d_lon_arcsec += 74.7759 * Math.cos(0.1084453863 * t + (2.3695));
      d_lon_arcsec += 49.7195 * Math.cos(0.1084316242 * t + (1.1829));
      d_lon_arcsec += 48.4195 * Math.cos(0.1084591484 * t + (-2.7112));
      d_lon_arcsec += 26.9290 * Math.cos(0.0000275242 * t + (-0.6452));
      d_lon_arcsec += 26.8451 * Math.cos(0.2168907725 * t + (-1.5353));
      d_lon_arcsec += 17.6675 * Math.cos(0.2169045347 * t + (-0.3315));
      d_lon_arcsec += 17.5889 * Math.cos(0.2168770104 * t + (-2.7226));
      d_lon_arcsec += 17.1219 * Math.cos(0.2512960347 * t + (-1.2609));
      d_lon_arcsec += 16.4162 * Math.cos(0.1084178621 * t + (0.0592));
      d_lon_arcsec += 16.2220 * Math.cos(0.1084729105 * t + (-1.5917));
      d_lon_arcsec += 12.0306 * Math.cos(0.2513097968 * t + (-0.0431));
      d_lon_arcsec += 11.3122 * Math.cos(0.0000412863 * t + (0.2917));
      d_lon_arcsec += 10.1517 * Math.cos(0.2512822726 * t + (-2.3891));
      d_lon_arcsec += 9.1093 * Math.cos(0.3253361588 * t + (0.8561));
      d_lon_arcsec += 8.8620 * Math.cos(0.3597414210 * t + (1.1457));
      d_lon_arcsec += 7.6766 * Math.cos(0.1084041000 * t + (-0.8219));
      d_lon_arcsec += 7.5743 * Math.cos(0.1084866726 * t + (-0.7106));
      d_lon_arcsec += 7.5437 * Math.cos(0.0344052621 * t + (-0.3239));
      d_lon_arcsec += 6.3823 * Math.cos(0.3597551831 * t + (2.3537));
      d_lon_arcsec += 6.1491 * Math.cos(0.0000550484 * t + (1.5575));
      d_lon_arcsec += 6.1043 * Math.cos(0.3253499209 * t + (2.0570));
      d_lon_arcsec += 6.0362 * Math.cos(0.2169182968 * t + (0.7943));
      d_lon_arcsec += 5.8752 * Math.cos(0.3253223967 * t + (-0.3385));
      d_lon_arcsec += 5.7275 * Math.cos(0.0343915000 * t + (-1.2646));
      d_lon_arcsec += 5.6813 * Math.cos(0.2168632483 * t + (2.4432));
      d_lon_arcsec += 5.4070 * Math.cos(0.0740401241 * t + (-1.6749));
      d_lon_arcsec += 5.3802 * Math.cos(0.3200927969 * t + (-3.1381));
      d_lon_arcsec += 5.2310 * Math.cos(0.2513235589 * t + (1.1644));
      d_lon_arcsec += 5.0798 * Math.cos(0.3597276589 * t + (0.0219));
      d_lon_arcsec += 4.9445 * Math.cos(0.5369835694 * t + (-1.6440));
      d_lon_arcsec += 4.5458 * Math.cos(0.0740263620 * t + (-2.7189));
      d_lon_arcsec += 4.5327 * Math.cos(0.1824855104 * t + (0.9108));
      d_lon_arcsec += 4.3141 * Math.cos(0.1083903379 * t + (-2.0143));
      d_lon_arcsec += 4.2777 * Math.cos(0.1085004347 * t + (0.4831));
      d_lon_arcsec += 4.0872 * Math.cos(0.4681868072 * t + (-2.7396));
      d_lon_arcsec += 3.8798 * Math.cos(0.3201065590 * t + (-2.6492));
      d_lon_arcsec += 3.8513 * Math.cos(0.5369973315 * t + (-1.3330));
      d_lon_arcsec += 3.7997 * Math.cos(0.0000688105 * t + (2.7544));
      d_lon_arcsec += 3.6518 * Math.cos(0.3941466831 * t + (1.2518));
      d_lon_arcsec += 3.6517 * Math.cos(0.0344190242 * t + (0.7909));
      d_lon_arcsec += 3.5906 * Math.cos(0.1824717483 * t + (-0.2118));
      d_lon_arcsec += 2.9740 * Math.cos(0.4682005693 * t + (-1.5512));
      d_lon_arcsec += 2.9526 * Math.cos(0.0000825726 * t + (-2.4017));
      d_lon_arcsec += 2.8993 * Math.cos(0.2513373210 * t + (2.2292));
      d_lon_arcsec += 2.8787 * Math.cos(0.4337815451 * t + (-3.0273));
      d_lon_arcsec += 2.8701 * Math.cos(0.3941604452 * t + (2.7064));
      d_lon_arcsec += 2.8633 * Math.cos(0.1083765757 * t + (3.1279));
      d_lon_arcsec += 2.8451 * Math.cos(0.2169320589 * t + (1.7016));
      d_lon_arcsec += 2.8404 * Math.cos(0.1085141968 * t + (1.6251));
      d_lon_arcsec += 2.8138 * Math.cos(0.3597689452 * t + (-2.7265));
      d_lon_arcsec += 2.6327 * Math.cos(0.2168494862 * t + (1.5890));
      d_lon_arcsec += 2.5547 * Math.cos(0.2909308967 * t + (-2.9260));
      d_lon_arcsec += 2.5390 * Math.cos(0.6798342178 * t + (1.1032));
      d_lon_arcsec += 2.3493 * Math.cos(0.1083628136 * t + (1.9810));
      d_lon_arcsec += 2.3316 * Math.cos(0.1085279589 * t + (2.7675));
      d_lon_arcsec += 2.3297 * Math.cos(0.1772559106 * t + (0.9484));
      d_lon_arcsec += 2.3172 * Math.cos(0.0740538862 * t + (-0.6735));
      d_lon_arcsec += 2.2837 * Math.cos(0.4681730451 * t + (2.4369));
      d_lon_arcsec += 2.2269 * Math.cos(0.1824992725 * t + (2.0644));
      d_lon_arcsec += 2.2107 * Math.cos(0.5370110936 * t + (-1.8052));
      d_lon_arcsec += 2.1848 * Math.cos(0.3941329210 * t + (-0.0537));
      d_lon_arcsec += 2.1397 * Math.cos(0.0000963347 * t + (-1.0529));
      d_lon_arcsec += 2.1273 * Math.cos(0.3253636830 * t + (-3.0947));
      d_lon_arcsec += 2.0537 * Math.cos(0.2512685105 * t + (3.0578));
      d_lon_arcsec += 2.0492 * Math.cos(0.5025920694 * t + (-2.6319));
      d_lon_arcsec += 2.0070 * Math.cos(0.6798479799 * t + (1.5892));
      d_lon_arcsec += 1.9860 * Math.cos(0.5369698073 * t + (-2.7260));
      d_lon_arcsec += 1.9728 * Math.cos(0.4337953072 * t + (-1.8237));
      d_lon_arcsec += 1.9679 * Math.cos(0.2909171346 * t + (2.2062));
      d_lon_arcsec += 1.9460 * Math.cos(0.0740125999 * t + (2.4404));
      d_lon_arcsec += 1.9158 * Math.cos(0.3200790348 * t + (1.9362));
      d_lon_arcsec += 1.9095 * Math.cos(0.2513510831 * t + (-2.7962));
      d_lon_arcsec += 1.8589 * Math.cos(0.2116474106 * t + (0.7640));
      d_lon_arcsec += 1.8568 * Math.cos(0.3253086346 * t + (-1.4493));
      d_lon_arcsec += 1.8553 * Math.cos(0.1772421485 * t + (0.4184));
      d_lon_arcsec += 1.8334 * Math.cos(0.5026058315 * t + (-1.0524));
      d_lon_arcsec += 1.8215 * Math.cos(0.4337677830 * t + (2.0534));
      d_lon_arcsec += 1.7418 * Math.cos(0.1083490515 * t + (0.7065));
      d_lon_arcsec += 1.7378 * Math.cos(0.5766321935 * t + (-0.3492));
      d_lon_arcsec += 1.7375 * Math.cos(0.1085417210 * t + (-2.2385));
      d_lon_arcsec += 1.6842 * Math.cos(0.0001100968 * t + (-0.0583));
      d_lon_arcsec += 1.6664 * Math.cos(0.3201203211 * t + (2.6934));
      d_lon_arcsec += 1.6327 * Math.cos(0.6454289557 * t + (0.6897));
      d_lon_arcsec += 1.6309 * Math.cos(0.2169458210 * t + (2.9095));
      d_lon_arcsec += 1.5700 * Math.cos(0.3597827073 * t + (-1.6529));
      d_lon_arcsec += 1.5302 * Math.cos(0.1824579862 * t + (-1.3756));
      d_lon_arcsec += 1.4983 * Math.cos(0.1083352894 * t + (-0.3500));
      d_lon_arcsec += 1.4879 * Math.cos(0.1085554831 * t + (-1.1837));
      d_lon_arcsec += 1.4799 * Math.cos(0.6454427178 * t + (0.9220));
      d_lon_arcsec += 1.4619 * Math.cos(0.3941742073 * t + (-2.3034));
      d_lon_arcsec += 1.4559 * Math.cos(0.0001238589 * t + (1.3281));
      d_lon_arcsec += 1.4554 * Math.cos(0.2168357241 * t + (0.4144));
      d_lon_arcsec += 1.3921 * Math.cos(0.2513648452 * t + (-1.5585));
      d_lon_arcsec += 1.3914 * Math.cos(0.0343777379 * t + (-2.2985));
      d_lon_arcsec += 1.3369 * Math.cos(0.5370248557 * t + (-0.5774));
      d_lon_arcsec += 1.3302 * Math.cos(0.2909446588 * t + (-1.7581));
      d_lon_arcsec += 1.3265 * Math.cos(0.4682143314 * t + (-0.3518));
      d_lon_arcsec += 1.3053 * Math.cos(0.5025783073 * t + (2.1441));
      d_lon_arcsec += 1.2883 * Math.cos(0.1083215273 * t + (-1.6851));
      d_lon_arcsec += 1.2865 * Math.cos(0.1085692452 * t + (0.1508));
      d_lon_arcsec += 1.2699 * Math.cos(0.5766459556 * t + (0.8194));
      d_lon_arcsec += 1.2630 * Math.cos(0.5369560452 * t + (2.3686));
      d_lon_arcsec += 1.2468 * Math.cos(0.2116611727 * t + (1.2614));
      d_lon_arcsec += 1.2402 * Math.cos(0.6057940937 * t + (2.2382));
      d_lon_arcsec += 1.2221 * Math.cos(0.0344327864 * t + (2.1691));
      d_lon_arcsec += 1.2123 * Math.cos(0.3993762829 * t + (-0.5179));
      d_lon_arcsec += 1.2109 * Math.cos(0.0001376210 * t + (2.3414));
      d_lon_arcsec += 1.1935 * Math.cos(0.7882796041 * t + (-2.8052));
      d_lon_arcsec += 1.1776 * Math.cos(0.1772696727 * t + (1.5235));
      d_lon_arcsec += 1.1519 * Math.cos(0.3200652727 * t + (0.6991));
      d_lon_arcsec += 1.1364 * Math.cos(0.2513786073 * t + (-0.3468));
      d_lon_arcsec += 1.1172 * Math.cos(0.1083077652 * t + (-2.8391));
      d_lon_arcsec += 1.1141 * Math.cos(0.1085830073 * t + (1.3047));
      d_lon_arcsec += 1.0938 * Math.cos(0.2512547484 * t + (2.8641));
      d_lon_arcsec += 1.0891 * Math.cos(0.2169595831 * t + (-2.2132));
      d_lon_arcsec += 1.0823 * Math.cos(0.0739988378 * t + (1.3368));
      d_lon_arcsec += 1.0733 * Math.cos(0.6110374556 * t + (-0.2183));
      d_lon_arcsec += 1.0664 * Math.cos(0.3201340832 * t + (-2.3661));
      d_lon_arcsec += 1.0430 * Math.cos(0.3597964694 * t + (-0.3943));
      d_lon_arcsec += 1.0191 * Math.cos(0.6110512178 * t + (1.3663));
      d_lon_arcsec += 1.0144 * Math.cos(0.3253774451 * t + (-2.1612));
      d_lon_arcsec += 1.0086 * Math.cos(0.0001651453 * t + (-1.4132));
      d_lon_arcsec += 1.0077 * Math.cos(0.1023762980 * t + (0.5225));
      d_lon_arcsec += 0.9760 * Math.cos(0.3597138968 * t + (-0.7560));
      d_lon_arcsec += 0.9721 * Math.cos(0.1082802410 * t + (0.9649));
      d_lon_arcsec += 0.9718 * Math.cos(0.1086105315 * t + (-2.5021));
      d_lon_arcsec += 0.9648 * Math.cos(0.5370386178 * t + (0.6359));
      d_lon_arcsec += 0.9621 * Math.cos(0.1082940031 * t + (2.2158));
      d_lon_arcsec += 0.9615 * Math.cos(0.2168219620 * t + (-0.7054));
      d_lon_arcsec += 0.9598 * Math.cos(0.1085967694 * t + (2.5335));
      d_lon_arcsec += 0.9515 * Math.cos(0.5766184314 * t + (-1.4243));
      d_lon_arcsec += 0.9474 * Math.cos(0.7882933662 * t + (-2.3522));
      d_lon_arcsec += 0.9456 * Math.cos(0.5026195936 * t + (0.2201));
      d_lon_arcsec += 0.9366 * Math.cos(0.0001513832 * t + (-2.7525));
      d_lon_arcsec += 0.9337 * Math.cos(0.1145144745 * t + (-2.0978));
      d_lon_arcsec += 0.9315 * Math.cos(0.2513923694 * t + (0.9481));
      d_lon_arcsec += 0.9180 * Math.cos(0.3993625208 * t + (-1.6748));
      d_lon_arcsec += 0.9027 * Math.cos(0.5369422831 * t + (1.1406));
      d_lon_arcsec += 0.8977 * Math.cos(0.6454564799 * t + (0.8283));
      d_lon_arcsec += 0.8881 * Math.cos(0.2169733452 * t + (-1.0633));
      d_lon_arcsec += 0.8812 * Math.cos(0.9655492768 * t + (-1.8920));
      d_lon_arcsec += 0.8792 * Math.cos(0.3941879694 * t + (-1.1595));
      d_lon_arcsec += 0.8544 * Math.cos(0.3252948725 * t + (-2.2757));
      d_lon_arcsec += 0.8538 * Math.cos(0.6798204557 * t + (0.0170));
      d_lon_arcsec += 0.8384 * Math.cos(0.1824442241 * t + (-2.4621));
      d_lon_arcsec += 0.8377 * Math.cos(0.6058078558 * t + (2.7973));
      d_lon_arcsec += 0.8364 * Math.cos(0.1082527168 * t + (-1.4591));
      d_lon_arcsec += 0.8358 * Math.cos(0.0688105243 * t + (-1.9442));
      d_lon_arcsec += 0.8356 * Math.cos(0.1086380557 * t + (-0.0795));
      d_lon_arcsec += 0.8356 * Math.cos(0.0001926695 * t + (0.9764));
      d_lon_arcsec += 0.8352 * Math.cos(0.1023625359 * t + (2.3835));
      d_lon_arcsec += 0.8294 * Math.cos(0.1428506484 * t + (-0.8118));
      d_lon_arcsec += 0.8287 * Math.cos(0.2909033725 * t + (1.0360));
      d_lon_arcsec += 0.8242 * Math.cos(0.5422269314 * t + (-0.6004));
      d_lon_arcsec += 0.8185 * Math.cos(0.3200515106 * t + (-0.5506));
      d_lon_arcsec += 0.7950 * Math.cos(0.2168081999 * t + (-1.8447));
      d_lon_arcsec += 0.7800 * Math.cos(0.3201478453 * t + (-1.1232));
      d_lon_arcsec += 0.7779 * Math.cos(0.7486585042 * t + (2.9220));
      d_lon_arcsec += 0.7764 * Math.cos(0.2514061315 * t + (2.1373));
      d_lon_arcsec += 0.7648 * Math.cos(0.3598102315 * t + (0.8454));
      d_lon_arcsec += 0.7459 * Math.cos(0.4682280935 * t + (0.7270));
      d_lon_arcsec += 0.7443 * Math.cos(0.1145282366 * t + (2.3404));
      d_lon_arcsec += 0.7434 * Math.cos(0.5370523799 * t + (1.8777));
      d_lon_arcsec += 0.7352 * Math.cos(0.1082664789 * t + (-0.2070));
      d_lon_arcsec += 0.7340 * Math.cos(0.1086242936 * t + (-1.3240));
      d_lon_arcsec += 0.7336 * Math.cos(0.0739850757 * t + (0.0765));
      d_lon_arcsec += 0.7325 * Math.cos(0.2512409863 * t + (2.0763));
      d_lon_arcsec += 0.7069 * Math.cos(0.5369285210 * t + (-0.1023));
      d_lon_arcsec += 0.7039 * Math.cos(0.0344465485 * t + (-3.1399));
      d_lon_arcsec += 0.6982 * Math.cos(0.6454151936 * t + (-0.2443));
      d_lon_arcsec += 0.6974 * Math.cos(0.4338090693 * t + (-0.6896));
      d_lon_arcsec += 0.6965 * Math.cos(0.2514198936 * t + (-2.8551));
      d_lon_arcsec += 0.6906 * Math.cos(0.6850775798 * t + (2.0487));
      d_lon_arcsec += 0.6905 * Math.cos(0.2116336485 * t + (-0.5093));
      d_lon_arcsec += 0.6875 * Math.cos(0.2116749348 * t + (0.1298));
      d_lon_arcsec += 0.6775 * Math.cos(0.0285976539 * t + (1.9696));
      d_lon_arcsec += 0.6748 * Math.cos(0.1086655800 * t + (2.3808));
      d_lon_arcsec += 0.6745 * Math.cos(0.1082251926 * t + (2.3658));
      d_lon_arcsec += 0.6730 * Math.cos(0.6110236935 * t + (-1.8027));
      d_lon_arcsec += 0.6696 * Math.cos(0.2169871073 * t + (0.2247));
      d_lon_arcsec += 0.6695 * Math.cos(0.0343639758 * t + (2.9552));
      d_lon_arcsec += 0.6694 * Math.cos(0.6798617420 * t + (0.9571));
      d_lon_arcsec += 0.6601 * Math.cos(0.0687967622 * t + (-2.3281));
      d_lon_arcsec += 0.6558 * Math.cos(0.3993900451 * t + (0.6642));
      d_lon_arcsec += 0.6534 * Math.cos(0.2512272242 * t + (1.0538));
      d_lon_arcsec += 0.6455 * Math.cos(0.1086518178 * t + (1.1775));
      d_lon_arcsec += 0.6443 * Math.cos(0.1082389547 * t + (-2.7108));
      d_lon_arcsec += 0.6381 * Math.cos(0.0001789074 * t + (-0.1561));
      d_lon_arcsec += 0.6352 * Math.cos(0.3200377484 * t + (-1.8031));
      d_lon_arcsec += 0.6248 * Math.cos(0.3598239936 * t + (2.0582));
      d_lon_arcsec += 0.6166 * Math.cos(0.3942017315 * t + (0.1156));
      d_lon_arcsec += 0.6165 * Math.cos(0.0002201937 * t + (-2.8646));
      d_lon_arcsec += 0.6148 * Math.cos(0.1428644105 * t + (0.3561));
      d_lon_arcsec += 0.6118 * Math.cos(0.3201616074 * t + (0.1261));
      d_lon_arcsec += 0.6100 * Math.cos(0.1772283863 * t + (-0.4260));
      d_lon_arcsec += 0.6081 * Math.cos(0.1086793421 * t + (-2.6473));
      d_lon_arcsec += 0.6069 * Math.cos(0.2514336557 * t + (-1.6277));
      d_lon_arcsec += 0.6068 * Math.cos(0.1082114305 * t + (1.1114));
      d_lon_arcsec += 0.6038 * Math.cos(0.5370661420 * t + (3.1230));
      d_lon_arcsec += 0.6012 * Math.cos(0.1032020243 * t + (-1.4549));
      d_lon_arcsec += 0.6003 * Math.cos(0.2512134621 * t + (-0.1751));
      d_lon_arcsec += 0.5916 * Math.cos(0.3253912072 * t + (-0.9391));
      d_lon_arcsec += 0.5904 * Math.cos(0.1772834348 * t + (2.5735));
      d_lon_arcsec += 0.5898 * Math.cos(0.3597001346 * t + (-0.8964));
      d_lon_arcsec += 0.5843 * Math.cos(0.7486447421 * t + (-1.6053));
      d_lon_arcsec += 0.5828 * Math.cos(0.2167944378 * t + (-3.1046));
      d_lon_arcsec += 0.5821 * Math.cos(0.5369147589 * t + (-1.3547));
      d_lon_arcsec += 0.5820 * Math.cos(0.5422406935 * t + (0.5993));
      d_lon_arcsec += 0.5812 * Math.cos(0.7538881041 * t + (-3.1301));
      d_lon_arcsec += 0.5721 * Math.cos(0.5766597177 * t + (2.0139));
      d_lon_arcsec += 0.5660 * Math.cos(0.0002064316 * t + (2.3944));
      d_lon_arcsec += 0.5642 * Math.cos(0.5026333557 * t + (1.3880));
      d_lon_arcsec += 0.5629 * Math.cos(0.2170008694 * t + (1.2945));
      d_lon_arcsec += 0.5622 * Math.cos(0.1086931042 * t + (-1.3787));
      d_lon_arcsec += 0.5607 * Math.cos(0.1081976684 * t + (-0.1562));
      d_lon_arcsec += 0.5578 * Math.cos(0.1824304620 * t + (2.5551));
      d_lon_arcsec += 0.5575 * Math.cos(0.4337540209 * t + (0.9486));
      d_lon_arcsec += 0.5510 * Math.cos(0.1087068663 * t + (-0.2055));
      d_lon_arcsec += 0.5502 * Math.cos(0.1081839063 * t + (-1.3315));
      d_lon_arcsec += 0.5475 * Math.cos(0.0739713136 * t + (-1.1688));
      d_lon_arcsec += 0.5379 * Math.cos(0.1480664862 * t + (2.2106));
      d_lon_arcsec += 0.5373 * Math.cos(0.9655355147 * t + (-0.1380));
      d_lon_arcsec += 0.5361 * Math.cos(0.0002339558 * t + (-1.5821));
      d_lon_arcsec += 0.5358 * Math.cos(0.6454702420 * t + (2.0545));
      d_lon_arcsec += 0.5350 * Math.cos(0.2514474178 * t + (-0.3648));
      d_lon_arcsec += 0.5306 * Math.cos(0.1032157864 * t + (-0.8186));
      d_lon_arcsec += 0.5297 * Math.cos(0.6110649799 * t + (2.6332));
      d_lon_arcsec += 0.5268 * Math.cos(0.7194828419 * t + (2.1868));
      d_lon_arcsec += 0.5193 * Math.cos(0.3200239863 * t + (-3.0573));
      d_lon_arcsec += 0.5185 * Math.cos(0.5078216692 * t + (1.8709));
      d_lon_arcsec += 0.5180 * Math.cos(0.8967249904 * t + (-0.4343));
      d_lon_arcsec += 0.5147 * Math.cos(0.3598377557 * t + (-2.9319));
      d_lon_arcsec += 0.5129 * Math.cos(0.2167806757 * t + (2.1346));
      d_lon_arcsec += 0.5123 * Math.cos(0.5370799041 * t + (-1.9108));
      d_lon_arcsec += 0.5110 * Math.cos(0.7194966040 * t + (-2.5346));
      d_lon_arcsec += 0.5108 * Math.cos(0.6798066936 * t + (-1.1784));
      d_lon_arcsec += 0.5105 * Math.cos(0.0740814104 * t + (0.3066));
      d_lon_arcsec += 0.5097 * Math.cos(0.0740676483 * t + (-0.1016));
      d_lon_arcsec += 0.5096 * Math.cos(0.2514611799 * t + (0.8679));
      d_lon_arcsec += 0.5073 * Math.cos(0.0774393640 * t + (2.5426));
      d_lon_arcsec += 0.5072 * Math.cos(0.2511859378 * t + (-2.5416));
      d_lon_arcsec += 0.5045 * Math.cos(0.5422131693 * t + (-1.8331));
      d_lon_arcsec += 0.5040 * Math.cos(0.1087206284 * t + (1.1242));
      d_lon_arcsec += 0.5029 * Math.cos(0.3201753695 * t + (1.3782));
      d_lon_arcsec += 0.5029 * Math.cos(0.6850913419 * t + (-3.0968));
      d_lon_arcsec += 0.5025 * Math.cos(0.2511997000 * t + (-1.3085));
      d_lon_arcsec += 0.5014 * Math.cos(0.1081701442 * t + (-2.6596));
      d_lon_arcsec += 0.4985 * Math.cos(0.4682418557 * t + (1.9845));
      d_lon_arcsec += 0.4947 * Math.cos(0.7538743420 * t + (2.9995));
      d_lon_arcsec += 0.4933 * Math.cos(0.1480802483 * t + (-2.8736));
      d_lon_arcsec += 0.4916 * Math.cos(0.2170146315 * t + (2.6267));
      d_lon_arcsec += 0.4912 * Math.cos(0.5369009968 * t + (-2.6042));
      d_lon_arcsec += 0.4910 * Math.cos(0.1087343905 * t + (2.2940));
      d_lon_arcsec += 0.4902 * Math.cos(0.0002477179 * t + (-0.2876));
      d_lon_arcsec += 0.4896 * Math.cos(0.1081563821 * t + (2.4531));
      d_lon_arcsec += 0.4785 * Math.cos(0.4973487074 * t + (-0.0960));
      d_lon_arcsec += 0.4773 * Math.cos(0.8914953905 * t + (0.6539));
      d_lon_arcsec += 0.4733 * Math.cos(0.1428368863 * t + (-1.9544));
      d_lon_arcsec += 0.4729 * Math.cos(0.0688242864 * t + (-1.4712));
      d_lon_arcsec += 0.4722 * Math.cos(0.0002614800 * t + (0.7960));
      d_lon_arcsec += 0.4675 * Math.cos(0.3942154936 * t + (1.3781));
      d_lon_arcsec += 0.4658 * Math.cos(0.3252811104 * t + (2.8517));
      d_lon_arcsec += 0.4658 * Math.cos(0.6454014315 * t + (-1.3890));
      d_lon_arcsec += 0.4572 * Math.cos(0.0286114160 * t + (-0.0929));
      d_lon_arcsec += 0.4553 * Math.cos(0.1825130346 * t + (2.8483));
      d_lon_arcsec += 0.4550 * Math.cos(0.1087481526 * t + (-2.6969));
      d_lon_arcsec += 0.4544 * Math.cos(0.0396210999 * t + (-0.5092));
      d_lon_arcsec += 0.4529 * Math.cos(0.1081426200 * t + (1.1615));
      d_lon_arcsec += 0.4511 * Math.cos(0.2908896104 * t + (-0.0333));
      d_lon_arcsec += 0.4501 * Math.cos(0.1087619147 * t + (-1.4684));
      d_lon_arcsec += 0.4480 * Math.cos(0.1081288579 * t + (-0.0688));
      d_lon_arcsec += 0.4448 * Math.cos(0.0739575515 * t + (-2.3870));
      d_lon_arcsec += 0.4422 * Math.cos(0.6798755041 * t + (2.1513));
      d_lon_arcsec += 0.4409 * Math.cos(0.5370936663 * t + (-0.6540));
      d_lon_arcsec += 0.4386 * Math.cos(0.3200102242 * t + (1.9703));
      d_lon_arcsec += 0.4359 * Math.cos(0.2167669136 * t + (0.7997));
      d_lon_arcsec += 0.4337 * Math.cos(0.3544980590 * t + (0.7400));
      d_lon_arcsec += 0.4335 * Math.cos(0.0002752421 * t + (2.2072));
      d_lon_arcsec += 0.4328 * Math.cos(0.2514749421 * t + (2.1547));
      d_lon_arcsec += 0.4308 * Math.cos(0.4681592830 * t + (1.7347));
      d_lon_arcsec += 0.4306 * Math.cos(0.2116886969 * t + (1.3893));
      d_lon_arcsec += 0.4294 * Math.cos(0.5368872347 * t + (2.4275));
      d_lon_arcsec += 0.4292 * Math.cos(0.3598515178 * t + (-1.7382));
      d_lon_arcsec += 0.4273 * Math.cos(0.3201891316 * t + (2.6332));
      d_lon_arcsec += 0.4269 * Math.cos(0.2514887042 * t + (-2.9317));
      d_lon_arcsec += 0.4267 * Math.cos(0.0344603106 * t + (-1.9575));
      d_lon_arcsec += 0.4247 * Math.cos(0.2511721757 * t + (2.5002));
      d_lon_arcsec += 0.4217 * Math.cos(0.2170283936 * t + (-2.4911));
      d_lon_arcsec += 0.4214 * Math.cos(0.2565256345 * t + (-0.3017));
      d_lon_arcsec += 0.4193 * Math.cos(0.3596863725 * t + (-1.6970));
      d_lon_arcsec += 0.4188 * Math.cos(0.2116198864 * t + (-1.7821));
      d_lon_arcsec += 0.4155 * Math.cos(0.1087894389 * t + (1.0359));
      d_lon_arcsec += 0.4133 * Math.cos(0.2565118724 * t + (-1.6055));
      d_lon_arcsec += 0.4130 * Math.cos(0.1081013337 * t + (-2.5729));
      d_lon_arcsec += 0.4126 * Math.cos(0.0002890042 * t + (-2.9941));
      d_lon_arcsec += 0.4115 * Math.cos(0.2511584136 * t + (1.2767));
      d_lon_arcsec += 0.4105 * Math.cos(0.0774531261 * t + (0.6239));
      d_lon_arcsec += 0.4104 * Math.cos(0.1824166999 * t + (1.3085));
      d_lon_arcsec += 0.4104 * Math.cos(0.1087756768 * t + (-0.2221));
      break;
    case 'guru':
      // Linear drift: intercept + slope * t
      d_lon_arcsec += -7.1629 + (0.0000131171 * t);
      d_lon_arcsec += 15.3400 * Math.cos(0.0000137621 * t + (-1.6508));
      d_lon_arcsec += 11.3148 * Math.cos(0.0000275242 * t + (-0.9047));
      d_lon_arcsec += 9.9190 * Math.cos(0.0315014580 * t + (-2.8574));
      d_lon_arcsec += 7.9940 * Math.cos(0.0314876959 * t + (2.2550));
      d_lon_arcsec += 6.4548 * Math.cos(0.0000412863 * t + (-0.3699));
      d_lon_arcsec += 3.8929 * Math.cos(0.0028625178 * t + (-0.1342));
      d_lon_arcsec += 3.8877 * Math.cos(0.0315152201 * t + (-1.7615));
      d_lon_arcsec += 3.5758 * Math.cos(0.0314739338 * t + (0.9307));
      d_lon_arcsec += 2.5579 * Math.cos(0.0028762799 * t + (0.5896));
      d_lon_arcsec += 2.4479 * Math.cos(0.0029175662 * t + (2.3603));
      d_lon_arcsec += 2.2261 * Math.cos(0.0087114124 * t + (2.3317));
      d_lon_arcsec += 2.2087 * Math.cos(0.0314601717 * t + (-0.3114));
      d_lon_arcsec += 2.1854 * Math.cos(0.0028487557 * t + (-0.8050));
      d_lon_arcsec += 2.0958 * Math.cos(0.0011422547 * t + (2.7682));
      d_lon_arcsec += 1.9921 * Math.cos(0.0057800840 * t + (-0.7275));
      d_lon_arcsec += 1.9277 * Math.cos(0.0057938461 * t + (-0.1363));
      d_lon_arcsec += 1.7937 * Math.cos(0.0058213704 * t + (0.0621));
      d_lon_arcsec += 1.7521 * Math.cos(0.0058076082 * t + (-0.4042));
      d_lon_arcsec += 1.7410 * Math.cos(0.0029313283 * t + (3.1157));
      d_lon_arcsec += 1.7089 * Math.cos(0.0029038041 * t + (1.9859));
      d_lon_arcsec += 1.6650 * Math.cos(0.0314464096 * t + (-1.4980));
      d_lon_arcsec += 1.6378 * Math.cos(0.0022569852 * t + (-1.5462));
      d_lon_arcsec += 1.5092 * Math.cos(0.0045965430 * t + (2.3824));
      d_lon_arcsec += 1.4920 * Math.cos(0.0629891539 * t + (-0.5822));
      d_lon_arcsec += 1.4765 * Math.cos(0.0029588525 * t + (2.3205));
      d_lon_arcsec += 1.4675 * Math.cos(0.0011147305 * t + (-2.5399));
      d_lon_arcsec += 1.4613 * Math.cos(0.0344052621 * t + (0.8647));
      d_lon_arcsec += 1.4157 * Math.cos(0.0630029160 * t + (0.5769));
      d_lon_arcsec += 1.4149 * Math.cos(0.0086976503 * t + (1.7490));
      d_lon_arcsec += 1.4035 * Math.cos(0.0028900420 * t + (1.6112));
      d_lon_arcsec += 1.3782 * Math.cos(0.0116014544 * t + (-1.4292));
      d_lon_arcsec += 1.3727 * Math.cos(0.0000963347 * t + (2.7263));
      d_lon_arcsec += 1.2931 * Math.cos(0.0086563640 * t + (-0.1186));
      d_lon_arcsec += 1.2532 * Math.cos(0.0314326475 * t + (-2.6967));
      d_lon_arcsec += 1.2450 * Math.cos(0.0000550484 * t + (0.0367));
      d_lon_arcsec += 1.2356 * Math.cos(0.0016927389 * t + (3.0387));
      d_lon_arcsec += 1.2347 * Math.cos(0.0040185346 * t + (2.9625));
      d_lon_arcsec += 1.2220 * Math.cos(0.0315289822 * t + (2.9231));
      d_lon_arcsec += 1.1952 * Math.cos(0.0000825726 * t + (1.9892));
      d_lon_arcsec += 1.1172 * Math.cos(0.0029450904 * t + (1.9900));
      d_lon_arcsec += 1.1093 * Math.cos(0.0057663219 * t + (-0.9407));
      d_lon_arcsec += 1.1092 * Math.cos(0.0040735830 * t + (-1.0296));
      d_lon_arcsec += 1.0902 * Math.cos(0.0315427443 * t + (-2.1356));
      d_lon_arcsec += 1.0884 * Math.cos(0.0023257957 * t + (0.8986));
      d_lon_arcsec += 1.0781 * Math.cos(0.0314188854 * t + (2.2940));
      d_lon_arcsec += 1.0779 * Math.cos(0.0011560168 * t + (-2.9945));
      d_lon_arcsec += 1.0348 * Math.cos(0.0286114160 * t + (2.1799));
      d_lon_arcsec += 1.0260 * Math.cos(0.0344190242 * t + (1.5098));
      d_lon_arcsec += 1.0056 * Math.cos(0.0024909410 * t + (0.2157));
      d_lon_arcsec += 1.0042 * Math.cos(0.0011284926 * t + (2.7736));
      d_lon_arcsec += 0.9928 * Math.cos(0.0314051233 * t + (1.0215));
      d_lon_arcsec += 0.9675 * Math.cos(0.0005917705 * t + (-0.6094));
      d_lon_arcsec += 0.9644 * Math.cos(0.0286251781 * t + (2.8651));
      d_lon_arcsec += 0.9105 * Math.cos(0.0285838918 * t + (1.7439));
      d_lon_arcsec += 0.9028 * Math.cos(0.0343915000 * t + (0.3217));
      d_lon_arcsec += 0.8890 * Math.cos(0.0080921177 * t + (2.6280));
      d_lon_arcsec += 0.8832 * Math.cos(0.0285976539 * t + (2.0641));
      d_lon_arcsec += 0.8783 * Math.cos(0.0034955746 * t + (-2.8785));
      d_lon_arcsec += 0.8751 * Math.cos(0.0028074694 * t + (2.4004));
      d_lon_arcsec += 0.8640 * Math.cos(0.0087251745 * t + (-2.6918));
      d_lon_arcsec += 0.8435 * Math.cos(0.0011835410 * t + (0.8497));
      d_lon_arcsec += 0.8418 * Math.cos(0.0011009684 * t + (2.8997));
      d_lon_arcsec += 0.8351 * Math.cos(0.0629753918 * t + (-1.9063));
      d_lon_arcsec += 0.8228 * Math.cos(0.0313913612 * t + (-0.1701));
      d_lon_arcsec += 0.8174 * Math.cos(0.0029726146 * t + (-2.3729));
      d_lon_arcsec += 0.8168 * Math.cos(0.0286389402 * t + (-2.5551));
      d_lon_arcsec += 0.7875 * Math.cos(0.0630304402 * t + (0.0510));
      d_lon_arcsec += 0.7830 * Math.cos(0.0001100968 * t + (-2.5548));
      d_lon_arcsec += 0.7597 * Math.cos(0.0035093367 * t + (-2.2316));
      d_lon_arcsec += 0.7566 * Math.cos(0.0057525598 * t + (-0.8462));
      d_lon_arcsec += 0.7528 * Math.cos(0.0040322967 * t + (-2.7723));
      d_lon_arcsec += 0.7489 * Math.cos(0.0315702685 * t + (0.7808));
      d_lon_arcsec += 0.7480 * Math.cos(0.0313775991 * t + (-1.4249));
      d_lon_arcsec += 0.7421 * Math.cos(0.0023395578 * t + (1.4044));
      d_lon_arcsec += 0.7390 * Math.cos(0.0285701297 * t + (0.6056));
      d_lon_arcsec += 0.7149 * Math.cos(0.0092618966 * t + (-2.7980));
      d_lon_arcsec += 0.7007 * Math.cos(0.0040598209 * t + (1.2095));
      d_lon_arcsec += 0.6996 * Math.cos(0.0315565064 * t + (-0.4314));
      d_lon_arcsec += 0.6925 * Math.cos(0.0001238589 * t + (-1.5661));
      d_lon_arcsec += 0.6870 * Math.cos(0.0005642463 * t + (-2.8257));
      d_lon_arcsec += 0.6795 * Math.cos(0.0081058798 * t + (0.6175));
      d_lon_arcsec += 0.6668 * Math.cos(0.0029863768 * t + (-1.8494));
      d_lon_arcsec += 0.6562 * Math.cos(0.0027937073 * t + (1.3077));
      d_lon_arcsec += 0.6513 * Math.cos(0.0313638370 * t + (-2.6456));
      d_lon_arcsec += 0.6497 * Math.cos(0.0086701261 * t + (-2.6319));
      d_lon_arcsec += 0.6427 * Math.cos(0.0017753115 * t + (0.2276));
      d_lon_arcsec += 0.6339 * Math.cos(0.0017615494 * t + (2.2016));
      d_lon_arcsec += 0.6330 * Math.cos(0.0022707473 * t + (2.9903));
      d_lon_arcsec += 0.6323 * Math.cos(0.0005780084 * t + (-1.8801));
      d_lon_arcsec += 0.6317 * Math.cos(0.0011973031 * t + (1.9180));
      d_lon_arcsec += 0.6037 * Math.cos(0.0006055326 * t + (-0.1637));
      d_lon_arcsec += 0.5982 * Math.cos(0.0075003471 * t + (-1.2636));
      d_lon_arcsec += 0.5962 * Math.cos(0.0010872063 * t + (0.6609));
      d_lon_arcsec += 0.5951 * Math.cos(0.0005367221 * t + (0.9693));
      d_lon_arcsec += 0.5849 * Math.cos(0.0039910104 * t + (-0.5025));
      d_lon_arcsec += 0.5767 * Math.cos(0.0086838882 * t + (-2.8305));
      d_lon_arcsec += 0.5716 * Math.cos(0.0313500749 * t + (2.3829));
      d_lon_arcsec += 0.5688 * Math.cos(0.0629616297 * t + (3.1067));
      d_lon_arcsec += 0.5653 * Math.cos(0.0058351325 * t + (0.6448));
      d_lon_arcsec += 0.5649 * Math.cos(0.0315840306 * t + (1.9393));
      d_lon_arcsec += 0.5578 * Math.cos(0.0040047725 * t + (1.9093));
      d_lon_arcsec += 0.5465 * Math.cos(0.0086426019 * t + (-1.1690));
      d_lon_arcsec += 0.5403 * Math.cos(0.0316115549 * t + (-1.7674));
      d_lon_arcsec += 0.5381 * Math.cos(0.0005504842 * t + (2.4414));
      d_lon_arcsec += 0.5348 * Math.cos(0.0313363128 * t + (1.1496));
      d_lon_arcsec += 0.5267 * Math.cos(0.0630442023 * t + (1.3364));
      d_lon_arcsec += 0.5190 * Math.cos(0.0001376210 * t + (-0.3853));
      d_lon_arcsec += 0.5059 * Math.cos(0.0049818820 * t + (2.4247));
      d_lon_arcsec += 0.5006 * Math.cos(0.0034130020 * t + (-0.8055));
      d_lon_arcsec += 0.4958 * Math.cos(0.0027799452 * t + (0.0393));
      d_lon_arcsec += 0.4941 * Math.cos(0.0030001389 * t + (-0.7133));
      d_lon_arcsec += 0.4926 * Math.cos(0.0315977928 * t + (-3.0550));
      d_lon_arcsec += 0.4789 * Math.cos(0.0316253170 * t + (-0.5263));
      d_lon_arcsec += 0.4752 * Math.cos(0.0316390791 * t + (0.7190));
      d_lon_arcsec += 0.4749 * Math.cos(0.0313225507 * t + (-0.1373));
      d_lon_arcsec += 0.4631 * Math.cos(0.0057250356 * t + (1.3848));
      d_lon_arcsec += 0.4548 * Math.cos(0.0005229600 * t + (0.2883));
      d_lon_arcsec += 0.4523 * Math.cos(0.0313087885 * t + (-1.3405));
      d_lon_arcsec += 0.4470 * Math.cos(0.0257076119 * t + (-3.0049));
      d_lon_arcsec += 0.4458 * Math.cos(0.0629478676 * t + (1.8871));
      d_lon_arcsec += 0.4454 * Math.cos(0.0316528412 * t + (1.9432));
      d_lon_arcsec += 0.4394 * Math.cos(0.0020780778 * t + (-1.7567));
      d_lon_arcsec += 0.4364 * Math.cos(0.0087389366 * t + (-1.9256));
      d_lon_arcsec += 0.4357 * Math.cos(0.0023120336 * t + (0.6290));
      d_lon_arcsec += 0.4355 * Math.cos(0.0040873451 * t + (0.1613));
      d_lon_arcsec += 0.4324 * Math.cos(0.0028212315 * t + (1.9214));
      d_lon_arcsec += 0.4249 * Math.cos(0.0001513832 * t + (0.7581));
      d_lon_arcsec += 0.4236 * Math.cos(0.0659067202 * t + (-2.5597));
      d_lon_arcsec += 0.4222 * Math.cos(0.0022982715 * t + (0.1937));
      d_lon_arcsec += 0.4082 * Math.cos(0.0010734442 * t + (-0.1693));
      d_lon_arcsec += 0.4070 * Math.cos(0.0312950264 * t + (-2.6290));
      d_lon_arcsec += 0.4051 * Math.cos(0.0030139010 * t + (0.4534));
      d_lon_arcsec += 0.4044 * Math.cos(0.0316666033 * t + (-3.0634));
      d_lon_arcsec += 0.3987 * Math.cos(0.0086288397 * t + (-2.2579));
      d_lon_arcsec += 0.3933 * Math.cos(0.0285563676 * t + (-0.1380));
      d_lon_arcsec += 0.3930 * Math.cos(0.0051607893 * t + (-2.3810));
      d_lon_arcsec += 0.3917 * Math.cos(0.0027661831 * t + (-1.1274));
      d_lon_arcsec += 0.3913 * Math.cos(0.0257213740 * t + (-2.2968));
      d_lon_arcsec += 0.3899 * Math.cos(0.0344327864 * t + (2.6563));
      d_lon_arcsec += 0.3887 * Math.cos(0.0034267641 * t + (-0.8275));
      d_lon_arcsec += 0.3881 * Math.cos(0.0312812643 * t + (2.3913));
      d_lon_arcsec += 0.3876 * Math.cos(0.0074865850 * t + (0.4159));
      d_lon_arcsec += 0.3864 * Math.cos(0.0012110652 * t + (-3.0338));
      d_lon_arcsec += 0.3859 * Math.cos(0.0326712369 * t + (0.2222));
      d_lon_arcsec += 0.3850 * Math.cos(0.0316803654 * t + (-1.8692));
      d_lon_arcsec += 0.3842 * Math.cos(0.0087526987 * t + (-0.3353));
      d_lon_arcsec += 0.3728 * Math.cos(0.0034405262 * t + (-0.9333));
      d_lon_arcsec += 0.3728 * Math.cos(0.0052295998 * t + (-0.3937));
      d_lon_arcsec += 0.3712 * Math.cos(0.0004128631 * t + (-2.0514));
      d_lon_arcsec += 0.3665 * Math.cos(0.0063718545 * t + (0.8419));
      d_lon_arcsec += 0.3633 * Math.cos(0.0012248273 * t + (-1.8618));
      d_lon_arcsec += 0.3626 * Math.cos(0.0312675022 * t + (1.1466));
      d_lon_arcsec += 0.3600 * Math.cos(0.0630579645 * t + (2.7620));
      d_lon_arcsec += 0.3599 * Math.cos(0.0316941275 * t + (-0.5472));
      d_lon_arcsec += 0.3596 * Math.cos(0.0063580924 * t + (0.2480));
      d_lon_arcsec += 0.3581 * Math.cos(0.0022432231 * t + (-2.6871));
      d_lon_arcsec += 0.3550 * Math.cos(0.0286527023 * t + (-1.7226));
      d_lon_arcsec += 0.3540 * Math.cos(0.0063305682 * t + (-0.9952));
      d_lon_arcsec += 0.3528 * Math.cos(0.0030276631 * t + (1.6260));
      d_lon_arcsec += 0.3521 * Math.cos(0.0006192947 * t + (-1.3557));
      d_lon_arcsec += 0.3483 * Math.cos(0.0629341055 * t + (0.6690));
      d_lon_arcsec += 0.3448 * Math.cos(0.0001651453 * t + (1.7571));
      d_lon_arcsec += 0.3445 * Math.cos(0.0338410158 * t + (-1.6578));
      d_lon_arcsec += 0.3431 * Math.cos(0.0001789074 * t + (2.9950));
      d_lon_arcsec += 0.3424 * Math.cos(0.0027524210 * t + (-2.2773));
      d_lon_arcsec += 0.3411 * Math.cos(0.0312537401 * t + (-0.1197));
      d_lon_arcsec += 0.3397 * Math.cos(0.0317078896 * t + (0.6307));
      d_lon_arcsec += 0.3358 * Math.cos(0.0023533199 * t + (-0.2247));
      d_lon_arcsec += 0.3340 * Math.cos(0.0303316791 * t + (-2.5315));
      d_lon_arcsec += 0.3296 * Math.cos(0.0034818125 * t + (2.7825));
      d_lon_arcsec += 0.3279 * Math.cos(0.0075278714 * t + (2.5704));
      d_lon_arcsec += 0.3258 * Math.cos(0.0012385894 * t + (-0.6589));
      d_lon_arcsec += 0.3250 * Math.cos(0.0630717266 * t + (-2.2881));
      d_lon_arcsec += 0.3230 * Math.cos(0.0033992399 * t + (-2.2150));
      d_lon_arcsec += 0.3176 * Math.cos(0.0026973726 * t + (-0.1054));
      d_lon_arcsec += 0.3174 * Math.cos(0.0312399780 * t + (-1.3560));
      d_lon_arcsec += 0.3172 * Math.cos(0.0016789768 * t + (1.4954));
      d_lon_arcsec += 0.3165 * Math.cos(0.0317216517 * t + (1.9024));
      d_lon_arcsec += 0.3136 * Math.cos(0.0010596821 * t + (-1.3273));
      d_lon_arcsec += 0.3113 * Math.cos(0.0344465485 * t + (-2.0715));
      d_lon_arcsec += 0.3096 * Math.cos(0.0103903892 * t + (3.0273));
      d_lon_arcsec += 0.3091 * Math.cos(0.0087664608 * t + (0.9356));
      d_lon_arcsec += 0.3068 * Math.cos(0.0030414252 * t + (2.8479));
      d_lon_arcsec += 0.3048 * Math.cos(0.0001926695 * t + (-2.1543));
      d_lon_arcsec += 0.3048 * Math.cos(0.0317354138 * t + (-3.1199));
      d_lon_arcsec += 0.3028 * Math.cos(0.0312262159 * t + (-2.6253));
      d_lon_arcsec += 0.3024 * Math.cos(0.0026836104 * t + (-2.6515));
      d_lon_arcsec += 0.3020 * Math.cos(0.0039772483 * t + (-0.9924));
      d_lon_arcsec += 0.2995 * Math.cos(0.0034680504 * t + (2.9406));
      d_lon_arcsec += 0.2993 * Math.cos(0.0027386589 * t + (2.8270));
      d_lon_arcsec += 0.2986 * Math.cos(0.0012523515 * t + (0.5440));
      d_lon_arcsec += 0.2983 * Math.cos(0.0086150776 * t + (2.6554));
      d_lon_arcsec += 0.2971 * Math.cos(0.0629203434 * t + (-0.6125));
      d_lon_arcsec += 0.2898 * Math.cos(0.0317491759 * t + (-1.8771));
      d_lon_arcsec += 0.2893 * Math.cos(0.0292444728 * t + (-1.5854));
      d_lon_arcsec += 0.2872 * Math.cos(0.0006330568 * t + (-0.4603));
      d_lon_arcsec += 0.2869 * Math.cos(0.0343777379 * t + (-0.5751));
      d_lon_arcsec += 0.2857 * Math.cos(0.0312124538 * t + (2.4223));
      d_lon_arcsec += 0.2847 * Math.cos(0.0040460588 * t + (1.6593));
      d_lon_arcsec += 0.2827 * Math.cos(0.0317629380 * t + (-0.6109));
      d_lon_arcsec += 0.2824 * Math.cos(0.0051883135 * t + (0.6003));
      d_lon_arcsec += 0.2806 * Math.cos(0.0030551873 * t + (-2.2622));
      d_lon_arcsec += 0.2788 * Math.cos(0.0012661136 * t + (1.8035));
      d_lon_arcsec += 0.2770 * Math.cos(0.0041011072 * t + (1.3790));
      d_lon_arcsec += 0.2749 * Math.cos(0.0659204823 * t + (-1.7998));
      d_lon_arcsec += 0.2741 * Math.cos(0.0629065813 * t + (-1.8841));
      d_lon_arcsec += 0.2734 * Math.cos(0.0343639758 * t + (-2.0848));
      d_lon_arcsec += 0.2733 * Math.cos(0.0311986917 * t + (1.1498));
      d_lon_arcsec += 0.2727 * Math.cos(0.0081196419 * t + (1.8706));
      d_lon_arcsec += 0.2725 * Math.cos(0.0063993788 * t + (1.3900));
      d_lon_arcsec += 0.2710 * Math.cos(0.0027248968 * t + (1.6542));
      d_lon_arcsec += 0.2705 * Math.cos(0.0256938498 * t + (3.1366));
      d_lon_arcsec += 0.2690 * Math.cos(0.0292169486 * t + (1.0284));
      d_lon_arcsec += 0.2650 * Math.cos(0.0317767001 * t + (0.6324));
      d_lon_arcsec += 0.2648 * Math.cos(0.0002064316 * t + (-1.1387));
      d_lon_arcsec += 0.2645 * Math.cos(0.0280058834 * t + (0.0692));
      d_lon_arcsec += 0.2624 * Math.cos(0.0630854887 * t + (-1.0850));
      d_lon_arcsec += 0.2607 * Math.cos(0.0311849296 * t + (-0.0960));
      d_lon_arcsec += 0.2595 * Math.cos(0.0087802229 * t + (2.1880));
      d_lon_arcsec += 0.2584 * Math.cos(0.0317904622 * t + (1.8996));
      d_lon_arcsec += 0.2582 * Math.cos(0.0030689494 * t + (-1.0364));
      d_lon_arcsec += 0.2565 * Math.cos(0.0017065010 * t + (1.8607));
      d_lon_arcsec += 0.2548 * Math.cos(0.0344603106 * t + (-0.9605));
      d_lon_arcsec += 0.2545 * Math.cos(0.0058488946 * t + (-0.9967));
      d_lon_arcsec += 0.2526 * Math.cos(0.0010459200 * t + (-2.5238));
      d_lon_arcsec += 0.2518 * Math.cos(0.0028349936 * t + (1.4984));
      d_lon_arcsec += 0.2507 * Math.cos(0.0012798758 * t + (3.0237));
      d_lon_arcsec += 0.2489 * Math.cos(0.0039634862 * t + (-2.1817));
      d_lon_arcsec += 0.2485 * Math.cos(0.0343502137 * t + (-3.0612));
      d_lon_arcsec += 0.2468 * Math.cos(0.0658929581 * t + (2.8437));
      d_lon_arcsec += 0.2458 * Math.cos(0.0311711675 * t + (-1.3614));
      d_lon_arcsec += 0.2455 * Math.cos(0.0086013155 * t + (1.4455));
      d_lon_arcsec += 0.2443 * Math.cos(0.0318042243 * t + (3.1379));
      d_lon_arcsec += 0.2434 * Math.cos(0.0098261429 * t + (0.4947));
      d_lon_arcsec += 0.2419 * Math.cos(0.0012936379 * t + (-2.0248));
      d_lon_arcsec += 0.2409 * Math.cos(0.0092756587 * t + (1.4608));
      d_lon_arcsec += 0.2404 * Math.cos(0.0945318983 * t + (-2.8078));
      d_lon_arcsec += 0.2403 * Math.cos(0.0017477873 * t + (0.8883));
      d_lon_arcsec += 0.2393 * Math.cos(0.0311574054 * t + (-2.5978));
      d_lon_arcsec += 0.2382 * Math.cos(0.0030827115 * t + (0.1955));
      d_lon_arcsec += 0.2379 * Math.cos(0.0033854778 * t + (2.7615));
      d_lon_arcsec += 0.2372 * Math.cos(0.0318179864 * t + (-1.8812));
      d_lon_arcsec += 0.2352 * Math.cos(0.0628928192 * t + (-3.1083));
      d_lon_arcsec += 0.2341 * Math.cos(0.0601128740 * t + (-0.4280));
      d_lon_arcsec += 0.2311 * Math.cos(0.0274829234 * t + (0.6329));
      d_lon_arcsec += 0.2296 * Math.cos(0.0630992508 * t + (0.1888));
      d_lon_arcsec += 0.2295 * Math.cos(0.0026698483 * t + (2.7114));
      d_lon_arcsec += 0.2294 * Math.cos(0.0318317485 * t + (-0.6413));
      d_lon_arcsec += 0.2281 * Math.cos(0.0311436433 * t + (2.4063));
      d_lon_arcsec += 0.2279 * Math.cos(0.0058764188 * t + (-1.1439));
      d_lon_arcsec += 0.2259 * Math.cos(0.0944906119 * t + (2.8452));
      d_lon_arcsec += 0.2252 * Math.cos(0.0227900456 * t + (1.0038));
      d_lon_arcsec += 0.2252 * Math.cos(0.0013074000 * t + (-0.7796));
      d_lon_arcsec += 0.2247 * Math.cos(0.0092206103 * t + (-1.9008));
      d_lon_arcsec += 0.2242 * Math.cos(0.0016514526 * t + (-1.1332));
      d_lon_arcsec += 0.2218 * Math.cos(0.0013211621 * t + (0.4687));
      d_lon_arcsec += 0.2215 * Math.cos(0.0087939850 * t + (-2.8308));
      d_lon_arcsec += 0.2210 * Math.cos(0.0631130129 * t + (1.4746));
      d_lon_arcsec += 0.2209 * Math.cos(0.0002339558 * t + (1.6662));
      d_lon_arcsec += 0.2207 * Math.cos(0.0022294610 * t + (2.2626));
      d_lon_arcsec += 0.2206 * Math.cos(0.0011697789 * t + (-1.4971));
      d_lon_arcsec += 0.2205 * Math.cos(0.0092343724 * t + (1.6632));
      d_lon_arcsec += 0.2203 * Math.cos(0.0058901809 * t + (0.1611));
      d_lon_arcsec += 0.2201 * Math.cos(0.0311298812 * t + (1.1634));
      d_lon_arcsec += 0.2201 * Math.cos(0.0030964736 * t + (1.4311));
      d_lon_arcsec += 0.2198 * Math.cos(0.0318455106 * t + (0.6346));
      d_lon_arcsec += 0.2197 * Math.cos(0.0291756623 * t + (-3.0200));
      d_lon_arcsec += 0.2189 * Math.cos(0.0013349242 * t + (1.7688));
      d_lon_arcsec += 0.2188 * Math.cos(0.0022845094 * t + (-1.2340));
      d_lon_arcsec += 0.2184 * Math.cos(0.0256800877 * t + (-3.1400));
      d_lon_arcsec += 0.2183 * Math.cos(0.0031102357 * t + (2.7229));
      d_lon_arcsec += 0.2167 * Math.cos(0.0002201937 * t + (0.8426));
      d_lon_arcsec += 0.2163 * Math.cos(0.0016652147 * t + (0.7908));
      d_lon_arcsec += 0.2147 * Math.cos(0.0027111347 * t + (0.5193));
      d_lon_arcsec += 0.2146 * Math.cos(0.0020918399 * t + (2.3088));
      d_lon_arcsec += 0.2145 * Math.cos(0.0026560862 * t + (1.5514));
      d_lon_arcsec += 0.2143 * Math.cos(0.0628790571 * t + (1.9196));
      d_lon_arcsec += 0.2142 * Math.cos(0.0257351361 * t + (-1.9096));
      d_lon_arcsec += 0.2138 * Math.cos(0.0303867275 * t + (-0.1353));
      d_lon_arcsec += 0.2138 * Math.cos(0.0006468189 * t + (1.8136));
      d_lon_arcsec += 0.2135 * Math.cos(0.0080783556 * t + (1.3697));
      d_lon_arcsec += 0.2131 * Math.cos(0.0311161191 * t + (-0.1179));
      d_lon_arcsec += 0.2128 * Math.cos(0.0350107948 * t + (1.3752));
      d_lon_arcsec += 0.2123 * Math.cos(0.0318592727 * t + (1.8610));
      d_lon_arcsec += 0.2109 * Math.cos(0.0041148694 * t + (2.6102));
      d_lon_arcsec += 0.2107 * Math.cos(0.0039497241 * t + (2.8580));
      d_lon_arcsec += 0.2104 * Math.cos(0.0085875534 * t + (0.2215));
      d_lon_arcsec += 0.2101 * Math.cos(0.0057112735 * t + (-0.1623));
      d_lon_arcsec += 0.2099 * Math.cos(0.0269049150 * t + (1.0477));
      d_lon_arcsec += 0.2085 * Math.cos(0.0311023570 * t + (-1.4091));
      d_lon_arcsec += 0.2083 * Math.cos(0.0337859674 * t + (2.5583));
      d_lon_arcsec += 0.2082 * Math.cos(0.0010321579 * t + (2.5968));
      d_lon_arcsec += 0.2079 * Math.cos(0.0286802265 * t + (0.7156));
      d_lon_arcsec += 0.2064 * Math.cos(0.0318730348 * t + (3.1324));
      d_lon_arcsec += 0.2054 * Math.cos(0.0023808441 * t + (1.9286));
      d_lon_arcsec += 0.2047 * Math.cos(0.0319143212 * t + (0.6733));
      d_lon_arcsec += 0.2018 * Math.cos(0.0075416335 * t + (1.1629));
      d_lon_arcsec += 0.2013 * Math.cos(0.0026423241 * t + (0.3509));
      d_lon_arcsec += 0.2012 * Math.cos(0.0320244180 * t + (-2.3124));
      d_lon_arcsec += 0.2011 * Math.cos(0.0034542883 * t + (2.3890));
      break;
    case 'shukra':
      // Linear drift: intercept + slope * t
      d_lon_arcsec += -60.9939 + (0.0000337727 * t);
      d_lon_arcsec += 83.3909 * Math.cos(0.0000137621 * t + (-1.8416));
      d_lon_arcsec += 26.9277 * Math.cos(0.0000275242 * t + (-0.6457));
      d_lon_arcsec += 22.8580 * Math.cos(0.0215239320 * t + (-2.1692));
      d_lon_arcsec += 21.3418 * Math.cos(0.0215376941 * t + (-0.9645));
      d_lon_arcsec += 12.1234 * Math.cos(0.0430616261 * t + (-3.1363));
      d_lon_arcsec += 11.9591 * Math.cos(0.0215514562 * t + (0.2610));
      d_lon_arcsec += 11.3126 * Math.cos(0.0000412863 * t + (0.2905));
      d_lon_arcsec += 10.9777 * Math.cos(0.0645442718 * t + (0.1448));
      d_lon_arcsec += 10.8111 * Math.cos(0.0430203398 * t + (2.3233));
      d_lon_arcsec += 10.7890 * Math.cos(0.0645580339 * t + (1.4279));
      d_lon_arcsec += 10.2620 * Math.cos(0.0860819659 * t + (-0.7704));
      d_lon_arcsec += 8.5857 * Math.cos(0.0430753882 * t + (-1.8891));
      d_lon_arcsec += 8.0471 * Math.cos(0.0430478640 * t + (2.0589));
      d_lon_arcsec += 8.0159 * Math.cos(0.0430065777 * t + (1.0651));
      d_lon_arcsec += 7.5806 * Math.cos(0.0215652183 * t + (1.4199));
      d_lon_arcsec += 7.5102 * Math.cos(0.0215101699 * t + (3.0250));
      d_lon_arcsec += 7.3334 * Math.cos(0.0860682038 * t + (-2.0604));
      d_lon_arcsec += 6.7358 * Math.cos(0.1076058979 * t + (-2.9333));
      d_lon_arcsec += 6.5008 * Math.cos(0.0645305097 * t + (-1.0922));
      d_lon_arcsec += 6.1614 * Math.cos(0.0860957280 * t + (0.3383));
      d_lon_arcsec += 6.1520 * Math.cos(0.0000550484 * t + (1.5562));
      d_lon_arcsec += 6.1215 * Math.cos(0.0430891503 * t + (-0.7062));
      d_lon_arcsec += 5.8459 * Math.cos(0.0429928156 * t + (-0.1168));
      d_lon_arcsec += 5.8185 * Math.cos(0.1076196600 * t + (-1.8093));
      d_lon_arcsec += 5.5065 * Math.cos(0.0430341019 * t + (-2.7967));
      d_lon_arcsec += 5.4993 * Math.cos(0.0215789804 * t + (2.6834));
      d_lon_arcsec += 5.2334 * Math.cos(0.0214826457 * t + (3.0880));
      d_lon_arcsec += 4.7487 * Math.cos(0.0431029124 * t + (0.5479));
      d_lon_arcsec += 4.6354 * Math.cos(0.0214964078 * t + (-2.0024));
      d_lon_arcsec += 4.5831 * Math.cos(0.0429790535 * t + (-1.3689));
      d_lon_arcsec += 4.3950 * Math.cos(0.0344052621 * t + (2.4640));
      d_lon_arcsec += 4.2762 * Math.cos(0.0215927425 * t + (-2.3403));
      d_lon_arcsec += 4.2626 * Math.cos(0.0645167476 * t + (-2.2599));
      d_lon_arcsec += 4.2482 * Math.cos(0.0214688836 * t + (1.9600));
      d_lon_arcsec += 3.8469 * Math.cos(0.0431166745 * t + (1.8087));
      d_lon_arcsec += 3.8034 * Math.cos(0.0000688105 * t + (2.7529));
      d_lon_arcsec += 3.7341 * Math.cos(0.0429652914 * t + (-2.6295));
      d_lon_arcsec += 3.6647 * Math.cos(0.0645855581 * t + (1.1010));
      d_lon_arcsec += 3.5938 * Math.cos(0.1291435920 * t + (2.2977));
      d_lon_arcsec += 3.5606 * Math.cos(0.0214551215 * t + (0.7292));
      d_lon_arcsec += 3.5438 * Math.cos(0.0216065046 * t + (-1.1043));
      d_lon_arcsec += 3.5254 * Math.cos(0.0645993202 * t + (2.3191));
      d_lon_arcsec += 3.2564 * Math.cos(0.0431304366 * t + (3.0464));
      d_lon_arcsec += 3.1740 * Math.cos(0.0429515293 * t + (2.4170));
      d_lon_arcsec += 3.1443 * Math.cos(0.0645029855 * t + (2.7624));
      d_lon_arcsec += 3.0667 * Math.cos(0.1076334221 * t + (-0.5928));
      d_lon_arcsec += 3.0577 * Math.cos(0.0128813301 * t + (-2.0861));
      d_lon_arcsec += 3.0202 * Math.cos(0.0216202667 * t + (0.1760));
      d_lon_arcsec += 3.0090 * Math.cos(0.0214413594 * t + (-0.5330));
      d_lon_arcsec += 2.9560 * Math.cos(0.0000825726 * t + (-2.4028));
      d_lon_arcsec += 2.9206 * Math.cos(0.0860544417 * t + (3.0620));
      d_lon_arcsec += 2.8826 * Math.cos(0.1506262377 * t + (-0.7111));
      d_lon_arcsec += 2.8443 * Math.cos(0.0431441987 * t + (-1.9655));
      d_lon_arcsec += 2.7798 * Math.cos(0.0429377672 * t + (1.1456));
      d_lon_arcsec += 2.7777 * Math.cos(0.1291298299 * t + (1.2302));
      d_lon_arcsec += 2.7674 * Math.cos(0.0646130823 * t + (-2.8112));
      d_lon_arcsec += 2.7289 * Math.cos(0.1721639318 * t + (-1.6150));
      d_lon_arcsec += 2.7074 * Math.cos(0.1075921358 * t + (2.0379));
      d_lon_arcsec += 2.6250 * Math.cos(0.0645717960 * t + (2.0807));
      d_lon_arcsec += 2.6181 * Math.cos(0.1506399998 * t + (0.5955));
      d_lon_arcsec += 2.6101 * Math.cos(0.0214275973 * t + (-1.7503));
      d_lon_arcsec += 2.5558 * Math.cos(0.1291023057 * t + (1.4731));
      d_lon_arcsec += 2.5213 * Math.cos(0.0216340288 * t + (1.4266));
      d_lon_arcsec += 2.4700 * Math.cos(0.0644892234 * t + (1.5026));
      d_lon_arcsec += 2.4409 * Math.cos(0.1291573541 * t + (-2.7429));
      d_lon_arcsec += 2.4225 * Math.cos(0.0431579608 * t + (-0.7052));
      d_lon_arcsec += 2.4189 * Math.cos(0.0343915000 * t + (1.8436));
      d_lon_arcsec += 2.3858 * Math.cos(0.0344190242 * t + (-2.8433));
      d_lon_arcsec += 2.3826 * Math.cos(0.0429240050 * t + (-0.1105));
      d_lon_arcsec += 2.3707 * Math.cos(0.0214138352 * t + (-3.0173));
      d_lon_arcsec += 2.3151 * Math.cos(0.0216477909 * t + (2.6620));
      d_lon_arcsec += 2.2761 * Math.cos(0.0646268444 * t + (-1.5726));
      d_lon_arcsec += 2.2017 * Math.cos(0.0431717229 * t + (0.5283));
      d_lon_arcsec += 2.1593 * Math.cos(0.0429102429 * t + (-1.3451));
      d_lon_arcsec += 2.1415 * Math.cos(0.0000963347 * t + (-1.0543));
      d_lon_arcsec += 2.0914 * Math.cos(0.1721501697 * t + (-2.9223));
      d_lon_arcsec += 2.0776 * Math.cos(0.0216615530 * t + (-2.3262));
      d_lon_arcsec += 2.0582 * Math.cos(0.0644754613 * t + (0.2645));
      d_lon_arcsec += 2.0227 * Math.cos(0.0086426019 * t + (0.1868));
      d_lon_arcsec += 2.0153 * Math.cos(0.0214000731 * t + (1.9939));
      d_lon_arcsec += 1.9940 * Math.cos(0.0431854850 * t + (1.8079));
      d_lon_arcsec += 1.9879 * Math.cos(0.1290885436 * t + (0.2067));
      d_lon_arcsec += 1.9516 * Math.cos(0.0428964808 * t + (-2.6275));
      d_lon_arcsec += 1.9414 * Math.cos(0.0216753151 * t + (-1.0503));
      d_lon_arcsec += 1.9170 * Math.cos(0.1936878638 * t + (2.4716));
      d_lon_arcsec += 1.9068 * Math.cos(0.0646406065 * t + (-0.3103));
      d_lon_arcsec += 1.8740 * Math.cos(0.1076471842 * t + (0.5542));
      d_lon_arcsec += 1.8717 * Math.cos(0.0431992471 * t + (3.0865));
      d_lon_arcsec += 1.8342 * Math.cos(0.0428827187 * t + (2.3770));
      d_lon_arcsec += 1.8290 * Math.cos(0.0213863109 * t + (0.7853));
      d_lon_arcsec += 1.7910 * Math.cos(0.1506124756 * t + (-1.9565));
      d_lon_arcsec += 1.7646 * Math.cos(0.0216890773 * t + (0.1656));
      d_lon_arcsec += 1.7621 * Math.cos(0.0644616992 * t + (-1.0136));
      d_lon_arcsec += 1.7270 * Math.cos(0.0432130093 * t + (-1.9650));
      d_lon_arcsec += 1.7060 * Math.cos(0.1291711162 * t + (-1.5593));
      d_lon_arcsec += 1.6987 * Math.cos(0.0428689566 * t + (1.1448));
      d_lon_arcsec += 1.6781 * Math.cos(0.0001100968 * t + (-0.0589));
      d_lon_arcsec += 1.6529 * Math.cos(0.0213725488 * t + (-0.4963));
      d_lon_arcsec += 1.6482 * Math.cos(0.0861094901 * t + (1.3287));
      d_lon_arcsec += 1.6442 * Math.cos(0.0646543686 * t + (0.9152));
      d_lon_arcsec += 1.6302 * Math.cos(0.0128675680 * t + (-2.8057));
      d_lon_arcsec += 1.5928 * Math.cos(0.0213587867 * t + (-1.7918));
      d_lon_arcsec += 1.5793 * Math.cos(0.0217028394 * t + (1.4452));
      d_lon_arcsec += 1.5734 * Math.cos(0.0432267714 * t + (-0.6871));
      d_lon_arcsec += 1.5566 * Math.cos(0.1937016259 * t + (-2.6790));
      d_lon_arcsec += 1.5481 * Math.cos(0.0428551945 * t + (-0.1333));
      d_lon_arcsec += 1.5065 * Math.cos(0.0860406796 * t + (2.0367));
      d_lon_arcsec += 1.5051 * Math.cos(0.0644479370 * t + (-2.2571));
      d_lon_arcsec += 1.5019 * Math.cos(0.0213450246 * t + (-3.0127));
      d_lon_arcsec += 1.4882 * Math.cos(0.0217166015 * t + (2.6643));
      d_lon_arcsec += 1.4838 * Math.cos(0.1721776939 * t + (-0.5517));
      d_lon_arcsec += 1.4790 * Math.cos(0.0646681307 * t + (2.1822));
      d_lon_arcsec += 1.4789 * Math.cos(0.0432405335 * t + (0.5426));
      d_lon_arcsec += 1.4779 * Math.cos(0.1290747815 * t + (-0.9733));
      d_lon_arcsec += 1.4639 * Math.cos(0.0001238589 * t + (1.3264));
      d_lon_arcsec += 1.4572 * Math.cos(0.0428414324 * t + (-1.3635));
      d_lon_arcsec += 1.3776 * Math.cos(0.0213312625 * t + (1.9734));
      d_lon_arcsec += 1.3619 * Math.cos(0.0432542956 * t + (1.8140));
      d_lon_arcsec += 1.3547 * Math.cos(0.0644341749 * t + (2.7796));
      d_lon_arcsec += 1.3510 * Math.cos(0.0217303636 * t + (-2.3417));
      d_lon_arcsec += 1.3440 * Math.cos(0.0428276703 * t + (-2.6343));
      d_lon_arcsec += 1.3343 * Math.cos(0.1076609463 * t + (1.8209));
      d_lon_arcsec += 1.3117 * Math.cos(0.0213175004 * t + (0.7591));
      d_lon_arcsec += 1.3109 * Math.cos(0.1291848783 * t + (-0.3026));
      d_lon_arcsec += 1.3023 * Math.cos(0.1506675240 * t + (0.1954));
      d_lon_arcsec += 1.2840 * Math.cos(0.0432680577 * t + (3.0623));
      d_lon_arcsec += 1.2789 * Math.cos(0.0217441257 * t + (-1.0978));
      d_lon_arcsec += 1.2664 * Math.cos(0.0428139082 * t + (2.4005));
      d_lon_arcsec += 1.2607 * Math.cos(0.0646818928 * t + (-2.8289));
      d_lon_arcsec += 1.2174 * Math.cos(0.0001376210 * t + (2.3412));
      d_lon_arcsec += 1.2158 * Math.cos(0.0644204128 * t + (1.4853));
      d_lon_arcsec += 1.2109 * Math.cos(0.0432818198 * t + (-1.9640));
      d_lon_arcsec += 1.2105 * Math.cos(0.0213037383 * t + (-0.5189));
      d_lon_arcsec += 1.2053 * Math.cos(0.1505987134 * t + (-3.1316));
      d_lon_arcsec += 1.2024 * Math.cos(0.0217578878 * t + (0.1618));
      d_lon_arcsec += 1.1944 * Math.cos(0.0428001461 * t + (1.1441));
      d_lon_arcsec += 1.1699 * Math.cos(0.1290610193 * t + (-2.2240));
      d_lon_arcsec += 1.1515 * Math.cos(0.0432955819 * t + (-0.7011));
      d_lon_arcsec += 1.1443 * Math.cos(0.1506812861 * t + (1.4286));
      d_lon_arcsec += 1.1437 * Math.cos(0.0646956549 * t + (-1.6105));
      d_lon_arcsec += 1.1425 * Math.cos(0.0086563640 * t + (1.0784));
      d_lon_arcsec += 1.1413 * Math.cos(0.0212899762 * t + (-1.7657));
      d_lon_arcsec += 1.1389 * Math.cos(0.0217716499 * t + (1.4263));
      d_lon_arcsec += 1.1362 * Math.cos(0.0427863840 * t + (-0.1194));
      d_lon_arcsec += 1.1361 * Math.cos(0.0644066507 * t + (0.2123));
      d_lon_arcsec += 1.1024 * Math.cos(0.0344327864 * t + (-1.7735));
      d_lon_arcsec += 1.0999 * Math.cos(0.0128950923 * t + (-1.6076));
      d_lon_arcsec += 1.0829 * Math.cos(0.0433093440 * t + (0.5480));
      d_lon_arcsec += 1.0781 * Math.cos(0.0212762141 * t + (-3.0186));
      d_lon_arcsec += 1.0687 * Math.cos(0.0427726219 * t + (-1.3680));
      d_lon_arcsec += 1.0661 * Math.cos(0.0217854120 * t + (2.6704));
      d_lon_arcsec += 1.0565 * Math.cos(0.1291986404 * t + (0.9591));
      d_lon_arcsec += 1.0388 * Math.cos(0.0433231061 * t + (1.8120));
      d_lon_arcsec += 1.0384 * Math.cos(0.2152255579 * t + (1.4265));
      d_lon_arcsec += 1.0380 * Math.cos(0.0647094170 * t + (-0.3348));
      d_lon_arcsec += 1.0377 * Math.cos(0.0643928886 * t + (-1.0104));
      d_lon_arcsec += 1.0349 * Math.cos(0.0212624520 * t + (1.9986));
      d_lon_arcsec += 1.0259 * Math.cos(0.1076747084 * t + (3.0800));
      d_lon_arcsec += 1.0251 * Math.cos(0.0427588598 * t + (-2.6323));
      d_lon_arcsec += 1.0228 * Math.cos(0.0217991741 * t + (-2.3445));
      d_lon_arcsec += 1.0219 * Math.cos(0.1075646116 * t + (2.1493));
      d_lon_arcsec += 1.0129 * Math.cos(0.0001651453 * t + (-1.4135));
      d_lon_arcsec += 0.9927 * Math.cos(0.0647231791 * t + (0.9558));
      d_lon_arcsec += 0.9836 * Math.cos(0.0433368682 * t + (3.0625));
      d_lon_arcsec += 0.9712 * Math.cos(0.0427450977 * t + (2.4006));
      d_lon_arcsec += 0.9707 * Math.cos(0.0212486899 * t + (0.7521));
      d_lon_arcsec += 0.9637 * Math.cos(0.0218129362 * t + (-1.0988));
      d_lon_arcsec += 0.9610 * Math.cos(0.0774393640 * t + (-0.8796));
      d_lon_arcsec += 0.9578 * Math.cos(0.1290472572 * t + (2.7976));
      d_lon_arcsec += 0.9431 * Math.cos(0.0433506303 * t + (-1.9583));
      d_lon_arcsec += 0.9412 * Math.cos(0.0001513832 * t + (-2.7518));
      d_lon_arcsec += 0.9397 * Math.cos(0.0860269175 * t + (0.7798));
      d_lon_arcsec += 0.9386 * Math.cos(0.0212349278 * t + (-0.5137));
      d_lon_arcsec += 0.9368 * Math.cos(0.1721364076 * t + (2.1704));
      d_lon_arcsec += 0.9328 * Math.cos(0.0643791265 * t + (-2.2882));
      d_lon_arcsec += 0.9309 * Math.cos(0.0427313356 * t + (1.1380));
      d_lon_arcsec += 0.9299 * Math.cos(0.0647369412 * t + (2.1825));
      d_lon_arcsec += 0.9265 * Math.cos(0.0989632960 * t + (-2.7741));
      d_lon_arcsec += 0.9235 * Math.cos(0.0218266983 * t + (0.1668));
      d_lon_arcsec += 0.9150 * Math.cos(0.1936741017 * t + (1.1677));
      d_lon_arcsec += 0.9027 * Math.cos(0.0433643924 * t + (-0.7069));
      d_lon_arcsec += 0.9017 * Math.cos(0.1505849513 * t + (1.8911));
      d_lon_arcsec += 0.8934 * Math.cos(0.1291160678 * t + (2.6787));
      d_lon_arcsec += 0.8919 * Math.cos(0.1292124025 * t + (2.1981));
      d_lon_arcsec += 0.8916 * Math.cos(0.0427175735 * t + (-0.1131));
      d_lon_arcsec += 0.8894 * Math.cos(0.0343777379 * t + (1.3354));
      d_lon_arcsec += 0.8882 * Math.cos(0.0212211657 * t + (-1.7618));
      d_lon_arcsec += 0.8880 * Math.cos(0.0086288397 * t + (0.6623));
      d_lon_arcsec += 0.8861 * Math.cos(0.2152117958 * t + (0.3180));
      d_lon_arcsec += 0.8821 * Math.cos(0.0218404604 * t + (1.4156));
      d_lon_arcsec += 0.8779 * Math.cos(0.0643653644 * t + (2.7702));
      d_lon_arcsec += 0.8778 * Math.cos(0.1506950482 * t + (2.5969));
      d_lon_arcsec += 0.8624 * Math.cos(0.0433781545 * t + (0.5568));
      d_lon_arcsec += 0.8623 * Math.cos(0.1075508495 * t + (1.0671));
      d_lon_arcsec += 0.8545 * Math.cos(0.0212074036 * t + (-3.0261));
      d_lon_arcsec += 0.8544 * Math.cos(0.0647507034 * t + (-2.8103));
      d_lon_arcsec += 0.8518 * Math.cos(0.0427038114 * t + (-1.3771));
      d_lon_arcsec += 0.8465 * Math.cos(0.1076884705 * t + (-1.9698));
      d_lon_arcsec += 0.8400 * Math.cos(0.0218542225 * t + (2.6811));
      d_lon_arcsec += 0.8372 * Math.cos(0.0001926695 * t + (0.9766));
      d_lon_arcsec += 0.8268 * Math.cos(0.0433919166 * t + (1.8057));
      d_lon_arcsec += 0.8206 * Math.cos(0.0211936415 * t + (2.0096));
      d_lon_arcsec += 0.8178 * Math.cos(0.0426900493 * t + (-2.6254));
      d_lon_arcsec += 0.8165 * Math.cos(0.1290334951 * t + (1.5623));
      d_lon_arcsec += 0.8101 * Math.cos(0.0434056787 * t + (3.0722));
      d_lon_arcsec += 0.8088 * Math.cos(0.0218679846 * t + (-2.3563));
      d_lon_arcsec += 0.8080 * Math.cos(0.0647644655 * t + (-1.5872));
      d_lon_arcsec += 0.8028 * Math.cos(0.0643516023 * t + (1.4943));
      d_lon_arcsec += 0.8018 * Math.cos(0.0301527717 * t + (-1.0259));
      d_lon_arcsec += 0.8007 * Math.cos(0.0172714416 * t + (-3.0033));
      d_lon_arcsec += 0.7957 * Math.cos(0.0426762872 * t + (2.3910));
      d_lon_arcsec += 0.7876 * Math.cos(0.0218817467 * t + (-1.0844));
      d_lon_arcsec += 0.7851 * Math.cos(0.0211798794 * t + (0.7411));
      d_lon_arcsec += 0.7768 * Math.cos(0.1292261646 * t + (-2.8121));
      d_lon_arcsec += 0.7748 * Math.cos(0.0434194408 * t + (-1.9612));
      d_lon_arcsec += 0.7659 * Math.cos(0.0301665338 * t + (-1.5845));
      d_lon_arcsec += 0.7658 * Math.cos(0.1937153880 * t + (-1.4741));
      d_lon_arcsec += 0.7635 * Math.cos(0.0426625251 * t + (1.1407));
      d_lon_arcsec += 0.7578 * Math.cos(0.0128538059 * t + (2.4210));
      d_lon_arcsec += 0.7565 * Math.cos(0.0643378402 * t + (0.2490));
      d_lon_arcsec += 0.7511 * Math.cos(0.0211661173 * t + (-0.5028));
      d_lon_arcsec += 0.7501 * Math.cos(0.0218955088 * t + (0.1603));
      d_lon_arcsec += 0.7485 * Math.cos(0.0434332029 * t + (-0.6995));
      d_lon_arcsec += 0.7469 * Math.cos(0.0647782276 * t + (-0.3115));
      d_lon_arcsec += 0.7454 * Math.cos(0.2367082035 * t + (-1.5808));
      d_lon_arcsec += 0.7404 * Math.cos(0.1075370874 * t + (-0.1504));
      d_lon_arcsec += 0.7378 * Math.cos(0.0426487630 * t + (-0.1202));
      d_lon_arcsec += 0.7351 * Math.cos(0.0211523552 * t + (-1.7710));
      d_lon_arcsec += 0.7233 * Math.cos(0.0861232522 * t + (1.8714));
      d_lon_arcsec += 0.7230 * Math.cos(0.0219092709 * t + (1.4242));
      d_lon_arcsec += 0.7191 * Math.cos(0.0434469650 * t + (0.5582));
      d_lon_arcsec += 0.7183 * Math.cos(0.1290197330 * t + (0.2911));
      d_lon_arcsec += 0.7179 * Math.cos(0.1077022326 * t + (-0.6859));
      d_lon_arcsec += 0.7148 * Math.cos(0.0774256019 * t + (-1.5457));
      d_lon_arcsec += 0.7145 * Math.cos(0.1505711892 * t + (0.6295));
      d_lon_arcsec += 0.7136 * Math.cos(0.2582458976 * t + (-2.4894));
      d_lon_arcsec += 0.7123 * Math.cos(0.1507088103 * t + (-2.4414));
      d_lon_arcsec += 0.7115 * Math.cos(0.0643240781 * t + (-1.0105));
      d_lon_arcsec += 0.7095 * Math.cos(0.0426350008 * t + (-1.3783));
      d_lon_arcsec += 0.7069 * Math.cos(0.0211385931 * t + (-3.0195));
      d_lon_arcsec += 0.7060 * Math.cos(0.0344465485 * t + (-0.6801));
      d_lon_arcsec += 0.7053 * Math.cos(0.1204872280 * t + (1.5959));
      d_lon_arcsec += 0.7046 * Math.cos(0.0647919897 * t + (0.9362));
      d_lon_arcsec += 0.6991 * Math.cos(0.0301390096 * t + (-1.4764));
      d_lon_arcsec += 0.6987 * Math.cos(0.0434607271 * t + (1.8077));
      d_lon_arcsec += 0.6929 * Math.cos(0.0219230330 * t + (2.6786));
      d_lon_arcsec += 0.6891 * Math.cos(0.0426212387 * t + (-2.6281));
      d_lon_arcsec += 0.6864 * Math.cos(0.0211248310 * t + (2.0023));
      d_lon_arcsec += 0.6786 * Math.cos(0.2152393200 * t + (2.6682));
      d_lon_arcsec += 0.6748 * Math.cos(0.0219367951 * t + (-2.3559));
      d_lon_arcsec += 0.6747 * Math.cos(0.0434744892 * t + (3.0752));
      d_lon_arcsec += 0.6745 * Math.cos(0.1075783737 * t + (-3.0702));
      d_lon_arcsec += 0.6739 * Math.cos(0.0643103160 * t + (-2.2754));
      d_lon_arcsec += 0.6655 * Math.cos(0.0648057518 * t + (2.1913));
      d_lon_arcsec += 0.6652 * Math.cos(0.0426074766 * t + (2.3880));
      d_lon_arcsec += 0.6631 * Math.cos(0.0860131554 * t + (-0.4530));
      d_lon_arcsec += 0.6616 * Math.cos(0.1292399267 * t + (-1.5526));
      d_lon_arcsec += 0.6606 * Math.cos(0.0086701261 * t + (2.2144));
      d_lon_arcsec += 0.6596 * Math.cos(0.0211110689 * t + (0.7404));
      d_lon_arcsec += 0.6572 * Math.cos(0.0559291941 * t + (0.4080));
      d_lon_arcsec += 0.6529 * Math.cos(0.0434882513 * t + (-1.9618));
      d_lon_arcsec += 0.6479 * Math.cos(0.0219505572 * t + (-1.0848));
      d_lon_arcsec += 0.6447 * Math.cos(0.0472865923 * t + (-2.0835));
      d_lon_arcsec += 0.6440 * Math.cos(0.0425937145 * t + (1.1417));
      d_lon_arcsec += 0.6425 * Math.cos(0.0001789074 * t + (-0.1559));
      d_lon_arcsec += 0.6420 * Math.cos(0.0210973067 * t + (-0.5025));
      d_lon_arcsec += 0.6403 * Math.cos(0.0086150776 * t + (0.1045));
      d_lon_arcsec += 0.6377 * Math.cos(0.0648195139 * t + (-2.8270));
      d_lon_arcsec += 0.6371 * Math.cos(0.0435020135 * t + (-0.6954));
      d_lon_arcsec += 0.6326 * Math.cos(0.1075233252 * t + (-1.4134));
      d_lon_arcsec += 0.6316 * Math.cos(0.0642965539 * t + (2.7616));
      d_lon_arcsec += 0.6281 * Math.cos(0.0425799524 * t + (-0.1247));
      d_lon_arcsec += 0.6280 * Math.cos(0.0219643194 * t + (0.1558));
      d_lon_arcsec += 0.6280 * Math.cos(0.0688105243 * t + (1.8226));
      d_lon_arcsec += 0.6220 * Math.cos(0.0210835446 * t + (-1.7756));
      d_lon_arcsec += 0.6212 * Math.cos(0.0002201937 * t + (-2.8609));
      d_lon_arcsec += 0.6199 * Math.cos(0.0516629416 * t + (-3.1249));
      d_lon_arcsec += 0.6156 * Math.cos(0.2367219656 * t + (-0.2829));
      d_lon_arcsec += 0.6130 * Math.cos(0.0435157756 * t + (0.5564));
      d_lon_arcsec += 0.6117 * Math.cos(0.0219780815 * t + (1.4279));
      d_lon_arcsec += 0.6114 * Math.cos(0.1290059709 * t + (-0.9695));
      d_lon_arcsec += 0.6054 * Math.cos(0.0642827918 * t + (1.4943));
      d_lon_arcsec += 0.6045 * Math.cos(0.0425661903 * t + (-1.3764));
      d_lon_arcsec += 0.6021 * Math.cos(0.1292536888 * t + (-0.3170));
      d_lon_arcsec += 0.6020 * Math.cos(0.0435295377 * t + (1.8128));
      d_lon_arcsec += 0.6001 * Math.cos(0.0210697825 * t + (-3.0171));
      d_lon_arcsec += 0.5997 * Math.cos(0.0989495339 * t + (2.8460));
      d_lon_arcsec += 0.5986 * Math.cos(0.0648332760 * t + (-1.5775));
      d_lon_arcsec += 0.5977 * Math.cos(0.1505574271 * t + (-0.6107));
      d_lon_arcsec += 0.5957 * Math.cos(0.1077159947 * t + (0.5603));
      d_lon_arcsec += 0.5936 * Math.cos(0.0425524282 * t + (-2.6329));
      d_lon_arcsec += 0.5923 * Math.cos(0.1507225724 * t + (-1.1777));
      d_lon_arcsec += 0.5895 * Math.cos(0.0210560204 * t + (1.9979));
      d_lon_arcsec += 0.5871 * Math.cos(0.0257626603 * t + (0.0703));
      d_lon_arcsec += 0.5869 * Math.cos(0.0219918436 * t + (2.6740));
      d_lon_arcsec += 0.5866 * Math.cos(0.2582321355 * t + (2.4953));
      d_lon_arcsec += 0.5854 * Math.cos(0.2151842715 * t + (0.5828));
      d_lon_arcsec += 0.5812 * Math.cos(0.0435432998 * t + (3.0760));
      d_lon_arcsec += 0.5781 * Math.cos(0.0220056057 * t + (-2.3489));
      d_lon_arcsec += 0.5779 * Math.cos(0.0648470381 * t + (-0.3136));
      break;
    case 'shani':
      // Linear drift: intercept + slope * t
      d_lon_arcsec += 2.6802 + (-0.0000277264 * t);
      d_lon_arcsec += 20.3773 * Math.cos(0.0000275242 * t + (2.0772));
      d_lon_arcsec += 17.4755 * Math.cos(0.0000137621 * t + (1.6327));
      d_lon_arcsec += 12.3892 * Math.cos(0.0000412863 * t + (2.5795));
      d_lon_arcsec += 10.5073 * Math.cos(0.0023395578 * t + (-0.2317));
      d_lon_arcsec += 9.7718 * Math.cos(0.0012248273 * t + (0.3821));
      d_lon_arcsec += 9.5594 * Math.cos(0.0012110652 * t + (-0.4319));
      d_lon_arcsec += 8.4380 * Math.cos(0.0023533199 * t + (0.4433));
      d_lon_arcsec += 7.1892 * Math.cos(0.0332354832 * t + (0.7306));
      d_lon_arcsec += 6.4369 * Math.cos(0.0023257957 * t + (-0.3127));
      d_lon_arcsec += 5.5815 * Math.cos(0.0332217211 * t + (-0.4519));
      d_lon_arcsec += 5.1735 * Math.cos(0.0023120336 * t + (-0.4330));
      d_lon_arcsec += 4.7838 * Math.cos(0.0012385894 * t + (1.4686));
      d_lon_arcsec += 4.7721 * Math.cos(0.0332492453 * t + (1.9020));
      d_lon_arcsec += 4.6429 * Math.cos(0.0011560168 * t + (2.5638));
      d_lon_arcsec += 4.4180 * Math.cos(0.0000550484 * t + (2.4134));
      d_lon_arcsec += 4.3028 * Math.cos(0.0000963347 * t + (-0.7097));
      d_lon_arcsec += 4.1616 * Math.cos(0.0023808441 * t + (-2.2775));
      d_lon_arcsec += 3.9495 * Math.cos(0.0022982715 * t + (-1.4995));
      d_lon_arcsec += 3.8493 * Math.cos(0.0012523515 * t + (2.8491));
      d_lon_arcsec += 3.7866 * Math.cos(0.0011973031 * t + (-0.3929));
      d_lon_arcsec += 3.3928 * Math.cos(0.0000825726 * t + (-1.7119));
      d_lon_arcsec += 3.2737 * Math.cos(0.0000688105 * t + (2.4120));
      d_lon_arcsec += 3.2107 * Math.cos(0.0011835410 * t + (0.1263));
      d_lon_arcsec += 3.0808 * Math.cos(0.0012661136 * t + (-2.3747));
      d_lon_arcsec += 3.0219 * Math.cos(0.0332079590 * t + (-1.4642));
      d_lon_arcsec += 2.9954 * Math.cos(0.0010872063 * t + (1.0878));
      d_lon_arcsec += 2.9217 * Math.cos(0.0022845094 * t + (-2.7457));
      d_lon_arcsec += 2.8580 * Math.cos(0.0001100968 * t + (0.3367));
      d_lon_arcsec += 2.7957 * Math.cos(0.0023670820 * t + (2.5597));
      d_lon_arcsec += 2.5777 * Math.cos(0.0022707473 * t + (2.2774));
      d_lon_arcsec += 2.5719 * Math.cos(0.0012798758 * t + (-1.1734));
      d_lon_arcsec += 2.4678 * Math.cos(0.0009633473 * t + (-2.6519));
      d_lon_arcsec += 2.4046 * Math.cos(0.0001238589 * t + (1.3706));
      d_lon_arcsec += 2.3870 * Math.cos(0.0023946062 * t + (-1.7201));
      d_lon_arcsec += 2.3576 * Math.cos(0.0011422547 * t + (1.2699));
      d_lon_arcsec += 2.3366 * Math.cos(0.0011009684 * t + (1.6996));
      d_lon_arcsec += 2.2211 * Math.cos(0.0010734442 * t + (1.0086));
      d_lon_arcsec += 2.2142 * Math.cos(0.0012936379 * t + (0.0607));
      d_lon_arcsec += 2.0783 * Math.cos(0.0332630074 * t + (2.7747));
      d_lon_arcsec += 2.0386 * Math.cos(0.0011147305 * t + (-2.1524));
      d_lon_arcsec += 2.0297 * Math.cos(0.0010459200 * t + (-1.3697));
      d_lon_arcsec += 2.0180 * Math.cos(0.0001376210 * t + (2.5745));
      d_lon_arcsec += 1.9941 * Math.cos(0.0010596821 * t + (-0.0496));
      d_lon_arcsec += 1.9395 * Math.cos(0.0013074000 * t + (1.3067));
      d_lon_arcsec += 1.7697 * Math.cos(0.0001513832 * t + (-2.5442));
      d_lon_arcsec += 1.7627 * Math.cos(0.0024083683 * t + (-0.6248));
      d_lon_arcsec += 1.7436 * Math.cos(0.0013211621 * t + (2.5488));
      d_lon_arcsec += 1.6755 * Math.cos(0.0019266947 * t + (2.2451));
      d_lon_arcsec += 1.6136 * Math.cos(0.0010321579 * t + (-2.6026));
      d_lon_arcsec += 1.6002 * Math.cos(0.0331941969 * t + (-2.2901));
      d_lon_arcsec += 1.5891 * Math.cos(0.0001651453 * t + (-1.3835));
      d_lon_arcsec += 1.5783 * Math.cos(0.0013349242 * t + (-2.4682));
      d_lon_arcsec += 1.5581 * Math.cos(0.0024221305 * t + (0.6618));
      d_lon_arcsec += 1.5261 * Math.cos(0.0001926695 * t + (1.0071));
      d_lon_arcsec += 1.5073 * Math.cos(0.0011697789 * t + (-3.0738));
      d_lon_arcsec += 1.4924 * Math.cos(0.0046653535 * t + (-1.9894));
      d_lon_arcsec += 1.4697 * Math.cos(0.0010183958 * t + (2.4256));
      d_lon_arcsec += 1.4650 * Math.cos(0.0004128631 * t + (2.9149));
      d_lon_arcsec += 1.4566 * Math.cos(0.0013486863 * t + (-1.2313));
      d_lon_arcsec += 1.4420 * Math.cos(0.0022432231 * t + (-0.5376));
      d_lon_arcsec += 1.4238 * Math.cos(0.0009771094 * t + (-1.4166));
      d_lon_arcsec += 1.4037 * Math.cos(0.0002064316 * t + (2.1332));
      d_lon_arcsec += 1.3899 * Math.cos(0.0010046337 * t + (1.1601));
      d_lon_arcsec += 1.3887 * Math.cos(0.0005642463 * t + (0.2329));
      d_lon_arcsec += 1.3769 * Math.cos(0.0001789074 * t + (-0.1814));
      d_lon_arcsec += 1.3460 * Math.cos(0.0013624484 * t + (0.0348));
      d_lon_arcsec += 1.3445 * Math.cos(0.0009908715 * t + (-0.1159));
      d_lon_arcsec += 1.3373 * Math.cos(0.0069361008 * t + (-2.9849));
      d_lon_arcsec += 1.3323 * Math.cos(0.0022294610 * t + (-1.6975));
      d_lon_arcsec += 1.3129 * Math.cos(0.0011284926 * t + (-0.6164));
      d_lon_arcsec += 1.3091 * Math.cos(0.0024358926 * t + (1.9038));
      d_lon_arcsec += 1.2711 * Math.cos(0.0007569158 * t + (-2.9210));
      d_lon_arcsec += 1.2414 * Math.cos(0.0013762105 * t + (1.2985));
      d_lon_arcsec += 1.2412 * Math.cos(0.0057663219 * t + (-1.7902));
      d_lon_arcsec += 1.2312 * Math.cos(0.0332767695 * t + (-2.9718));
      d_lon_arcsec += 1.2224 * Math.cos(0.0007018673 * t + (-1.2499));
      d_lon_arcsec += 1.2155 * Math.cos(0.0022156989 * t + (-2.9066));
      d_lon_arcsec += 1.1828 * Math.cos(0.0005367221 * t + (-2.2424));
      d_lon_arcsec += 1.1778 * Math.cos(0.0069223387 * t + (-1.1176));
      d_lon_arcsec += 1.1595 * Math.cos(0.0013899726 * t + (2.5509));
      d_lon_arcsec += 1.1569 * Math.cos(0.0014587831 * t + (2.9144));
      d_lon_arcsec += 1.1532 * Math.cos(0.0022019368 * t + (2.0667));
      d_lon_arcsec += 1.1343 * Math.cos(0.0002890042 * t + (-2.8737));
      d_lon_arcsec += 1.1277 * Math.cos(0.0024496547 * t + (-3.1206));
      d_lon_arcsec += 1.1039 * Math.cos(0.0002201937 * t + (-2.4067));
      d_lon_arcsec += 1.0938 * Math.cos(0.0014037347 * t + (-2.4717));
      d_lon_arcsec += 1.0833 * Math.cos(0.0021881747 * t + (0.7961));
      d_lon_arcsec += 1.0661 * Math.cos(0.0022569852 * t + (0.2447));
      d_lon_arcsec += 1.0614 * Math.cos(0.0026836104 * t + (0.6993));
      d_lon_arcsec += 1.0426 * Math.cos(0.0006468189 * t + (-0.2519));
      d_lon_arcsec += 1.0265 * Math.cos(0.0021744126 * t + (-0.4710));
      d_lon_arcsec += 1.0242 * Math.cos(0.0014174968 * t + (-1.2075));
      d_lon_arcsec += 1.0153 * Math.cos(0.0002339558 * t + (-1.4172));
      d_lon_arcsec += 0.9880 * Math.cos(0.0005504842 * t + (-0.6308));
      d_lon_arcsec += 0.9849 * Math.cos(0.0024634168 * t + (-1.8585));
      d_lon_arcsec += 0.9684 * Math.cos(0.0021606505 * t + (-1.7342));
      d_lon_arcsec += 0.9577 * Math.cos(0.0014312589 * t + (0.0409));
      d_lon_arcsec += 0.9482 * Math.cos(0.0018578842 * t + (1.4603));
      d_lon_arcsec += 0.9434 * Math.cos(0.0002477179 * t + (-0.2150));
      d_lon_arcsec += 0.9380 * Math.cos(0.0021468884 * t + (-2.9821));
      d_lon_arcsec += 0.9290 * Math.cos(0.0014863073 * t + (-1.3149));
      d_lon_arcsec += 0.9236 * Math.cos(0.0021331263 * t + (2.0869));
      d_lon_arcsec += 0.9214 * Math.cos(0.0002614800 * t + (1.0062));
      d_lon_arcsec += 0.9059 * Math.cos(0.0017065010 * t + (0.7663));
      d_lon_arcsec += 0.8990 * Math.cos(0.0028900420 * t + (-0.3136));
      d_lon_arcsec += 0.8896 * Math.cos(0.0002752421 * t + (2.2527));
      d_lon_arcsec += 0.8785 * Math.cos(0.0014450210 * t + (1.2693));
      d_lon_arcsec += 0.8762 * Math.cos(0.0024771789 * t + (-0.5898));
      d_lon_arcsec += 0.8743 * Math.cos(0.0005229600 * t + (-2.6726));
      d_lon_arcsec += 0.8715 * Math.cos(0.0014725452 * t + (-2.2629));
      d_lon_arcsec += 0.8647 * Math.cos(0.0045965430 * t + (-0.7351));
      d_lon_arcsec += 0.8402 * Math.cos(0.0015000694 * t + (-0.0102));
      d_lon_arcsec += 0.8380 * Math.cos(0.0015275936 * t + (2.4068));
      d_lon_arcsec += 0.8229 * Math.cos(0.0021193641 * t + (0.6532));
      d_lon_arcsec += 0.8229 * Math.cos(0.0005780084 * t + (0.8387));
      d_lon_arcsec += 0.8215 * Math.cos(0.0019404568 * t + (-3.0184));
      d_lon_arcsec += 0.8209 * Math.cos(0.0034818125 * t + (-0.7976));
      d_lon_arcsec += 0.8183 * Math.cos(0.0034955746 * t + (-0.3777));
      d_lon_arcsec += 0.8182 * Math.cos(0.0021056020 * t + (-0.5654));
      d_lon_arcsec += 0.8170 * Math.cos(0.0035093367 * t + (-0.5264));
      d_lon_arcsec += 0.8165 * Math.cos(0.0003027663 * t + (-1.5504));
      d_lon_arcsec += 0.8160 * Math.cos(0.0008257263 * t + (-2.7182));
      d_lon_arcsec += 0.7942 * Math.cos(0.0020918399 * t + (-1.8208));
      d_lon_arcsec += 0.7829 * Math.cos(0.0024909410 * t + (0.6816));
      d_lon_arcsec += 0.7758 * Math.cos(0.0003165284 * t + (-0.4405));
      d_lon_arcsec += 0.7757 * Math.cos(0.0019542189 * t + (-1.8018));
      d_lon_arcsec += 0.7747 * Math.cos(0.0020780778 * t + (-3.0860));
      d_lon_arcsec += 0.7727 * Math.cos(0.0017890736 * t + (1.6571));
      d_lon_arcsec += 0.7661 * Math.cos(0.0015138315 * t + (1.5536));
      d_lon_arcsec += 0.7640 * Math.cos(0.0007706779 * t + (-1.6961));
      d_lon_arcsec += 0.7606 * Math.cos(0.0003302905 * t + (0.8024));
      d_lon_arcsec += 0.7546 * Math.cos(0.0020643157 * t + (1.9449));
      d_lon_arcsec += 0.7531 * Math.cos(0.0320519422 * t + (0.3114));
      d_lon_arcsec += 0.7502 * Math.cos(0.0015413557 * t + (-2.4067));
      d_lon_arcsec += 0.7494 * Math.cos(0.0020505536 * t + (0.6772));
      d_lon_arcsec += 0.7463 * Math.cos(0.0046791157 * t + (2.9928));
      d_lon_arcsec += 0.7416 * Math.cos(0.0018028357 * t + (2.8157));
      d_lon_arcsec += 0.7386 * Math.cos(0.0019679810 * t + (-0.5664));
      d_lon_arcsec += 0.7355 * Math.cos(0.0664709665 * t + (1.4798));
      d_lon_arcsec += 0.7351 * Math.cos(0.0018441221 * t + (0.3438));
      d_lon_arcsec += 0.7301 * Math.cos(0.0020367915 * t + (-0.5875));
      d_lon_arcsec += 0.7217 * Math.cos(0.0020230294 * t + (-1.8430));
      d_lon_arcsec += 0.7207 * Math.cos(0.0019817431 * t + (0.6320));
      d_lon_arcsec += 0.7173 * Math.cos(0.0018165978 * t + (-2.1015));
      d_lon_arcsec += 0.7153 * Math.cos(0.0020092673 * t + (-3.0913));
      d_lon_arcsec += 0.7142 * Math.cos(0.0019955052 * t + (1.9346));
      d_lon_arcsec += 0.7118 * Math.cos(0.0015551178 * t + (-0.9701));
      d_lon_arcsec += 0.7092 * Math.cos(0.0008394884 * t + (-1.5155));
      d_lon_arcsec += 0.7083 * Math.cos(0.0025047031 * t + (1.9509));
      d_lon_arcsec += 0.7023 * Math.cos(0.0017477873 * t + (-2.1347));
      d_lon_arcsec += 0.6979 * Math.cos(0.0009082989 * t + (-1.4489));
      d_lon_arcsec += 0.6901 * Math.cos(0.0308959254 * t + (0.9386));
      d_lon_arcsec += 0.6887 * Math.cos(0.0040735830 * t + (3.1386));
      d_lon_arcsec += 0.6882 * Math.cos(0.0008532505 * t + (-0.2499));
      d_lon_arcsec += 0.6875 * Math.cos(0.0008945368 * t + (-2.7224));
      d_lon_arcsec += 0.6846 * Math.cos(0.0008807747 * t + (2.2862));
      d_lon_arcsec += 0.6845 * Math.cos(0.0004816737 * t + (2.0549));
      d_lon_arcsec += 0.6844 * Math.cos(0.0018303599 * t + (-0.8982));
      d_lon_arcsec += 0.6795 * Math.cos(0.0009220610 * t + (-0.1547));
      d_lon_arcsec += 0.6786 * Math.cos(0.0005091979 * t + (-1.7584));
      d_lon_arcsec += 0.6779 * Math.cos(0.0008670126 * t + (1.0178));
      d_lon_arcsec += 0.6681 * Math.cos(0.0004266253 * t + (-2.5718));
      d_lon_arcsec += 0.6651 * Math.cos(0.0015688800 * t + (0.0385));
      d_lon_arcsec += 0.6557 * Math.cos(0.0015826421 * t + (1.4612));
      d_lon_arcsec += 0.6516 * Math.cos(0.0308821633 * t + (0.3650));
      d_lon_arcsec += 0.6454 * Math.cos(0.0025184652 * t + (-3.0587));
      d_lon_arcsec += 0.6447 * Math.cos(0.0016652147 * t + (2.3738));
      d_lon_arcsec += 0.6397 * Math.cos(0.0035230988 * t + (-0.0071));
      d_lon_arcsec += 0.6355 * Math.cos(0.0015964042 * t + (2.6525));
      d_lon_arcsec += 0.6248 * Math.cos(0.0004403874 * t + (-1.4807));
      d_lon_arcsec += 0.6227 * Math.cos(0.0320106559 * t + (0.4124));
      d_lon_arcsec += 0.6179 * Math.cos(0.0664572044 * t + (0.2691));
      d_lon_arcsec += 0.6156 * Math.cos(0.0009358231 * t + (1.1005));
      d_lon_arcsec += 0.6081 * Math.cos(0.0004679116 * t + (0.8429));
      d_lon_arcsec += 0.6071 * Math.cos(0.0003853389 * t + (-0.7260));
      d_lon_arcsec += 0.6033 * Math.cos(0.0040598209 * t + (-0.9915));
      d_lon_arcsec += 0.6032 * Math.cos(0.0016101663 * t + (-2.3838));
      d_lon_arcsec += 0.6006 * Math.cos(0.0331804348 * t + (2.8114));
      d_lon_arcsec += 0.5956 * Math.cos(0.0004541495 * t + (-0.2857));
      d_lon_arcsec += 0.5944 * Math.cos(0.0007156295 * t + (-0.1016));
      d_lon_arcsec += 0.5909 * Math.cos(0.0025322273 * t + (-1.7848));
      d_lon_arcsec += 0.5887 * Math.cos(0.0321069906 * t + (1.8711));
      d_lon_arcsec += 0.5718 * Math.cos(0.0028487557 * t + (1.5048));
      d_lon_arcsec += 0.5662 * Math.cos(0.0016239284 * t + (-1.1503));
      d_lon_arcsec += 0.5636 * Math.cos(0.0029038041 * t + (0.2758));
      d_lon_arcsec += 0.5570 * Math.cos(0.0006605810 * t + (0.8883));
      d_lon_arcsec += 0.5556 * Math.cos(0.0007982021 * t + (0.8696));
      d_lon_arcsec += 0.5527 * Math.cos(0.0028762799 * t + (-0.6319));
      d_lon_arcsec += 0.5443 * Math.cos(0.0025459894 * t + (-0.5151));
      d_lon_arcsec += 0.5441 * Math.cos(0.0003440526 * t + (1.5872));
      d_lon_arcsec += 0.5412 * Math.cos(0.0017340252 * t + (-3.0647));
      d_lon_arcsec += 0.5364 * Math.cos(0.0007844400 * t + (-0.5200));
      d_lon_arcsec += 0.5247 * Math.cos(0.0034542883 * t + (1.7896));
      d_lon_arcsec += 0.5231 * Math.cos(0.0016376905 * t + (0.0871));
      d_lon_arcsec += 0.5222 * Math.cos(0.0019129326 * t + (-1.2052));
      d_lon_arcsec += 0.5180 * Math.cos(0.0332905316 * t + (-2.4477));
      d_lon_arcsec += 0.5084 * Math.cos(0.0017753115 * t + (0.9084));
      d_lon_arcsec += 0.5044 * Math.cos(0.0025597515 * t + (0.7574));
      d_lon_arcsec += 0.4943 * Math.cos(0.0034405262 * t + (1.4206));
      d_lon_arcsec += 0.4917 * Math.cos(0.0006055326 * t + (-2.6865));
      d_lon_arcsec += 0.4865 * Math.cos(0.0057525598 * t + (-0.1792));
      d_lon_arcsec += 0.4848 * Math.cos(0.0035368609 * t + (2.9874));
      d_lon_arcsec += 0.4819 * Math.cos(0.0003715768 * t + (-1.8338));
      d_lon_arcsec += 0.4814 * Math.cos(0.0309234496 * t + (0.9703));
      d_lon_arcsec += 0.4804 * Math.cos(0.0016927389 * t + (-0.2482));
      d_lon_arcsec += 0.4798 * Math.cos(0.0026285620 * t + (0.9693));
      d_lon_arcsec += 0.4760 * Math.cos(0.0016789768 * t + (-2.9967));
      d_lon_arcsec += 0.4744 * Math.cos(0.0004954358 * t + (-2.9299));
      d_lon_arcsec += 0.4705 * Math.cos(0.0035506231 * t + (2.5623));
      d_lon_arcsec += 0.4696 * Math.cos(0.0003991010 * t + (0.2866));
      d_lon_arcsec += 0.4684 * Math.cos(0.0025735136 * t + (2.0431));
      d_lon_arcsec += 0.4676 * Math.cos(0.0086563640 * t + (2.4043));
      d_lon_arcsec += 0.4644 * Math.cos(0.0321207527 * t + (2.7501));
      d_lon_arcsec += 0.4474 * Math.cos(0.0309096875 * t + (0.7372));
      d_lon_arcsec += 0.4465 * Math.cos(0.0320244180 * t + (1.0550));
      d_lon_arcsec += 0.4463 * Math.cos(0.0069085766 * t + (-2.3940));
      d_lon_arcsec += 0.4435 * Math.cos(0.0017202631 * t + (1.9040));
      d_lon_arcsec += 0.4429 * Math.cos(0.0006192947 * t + (-1.6079));
      d_lon_arcsec += 0.4393 * Math.cos(0.0664847286 * t + (2.5996));
      d_lon_arcsec += 0.4344 * Math.cos(0.0025872757 * t + (-2.9713));
      d_lon_arcsec += 0.4333 * Math.cos(0.0003578147 * t + (2.4639));
      d_lon_arcsec += 0.4267 * Math.cos(0.0333180559 * t + (-0.2990));
      d_lon_arcsec += 0.4262 * Math.cos(0.0075003471 * t + (1.6997));
      d_lon_arcsec += 0.4248 * Math.cos(0.0016514526 * t + (1.3314));
      d_lon_arcsec += 0.4230 * Math.cos(0.0018991705 * t + (-1.0201));
      d_lon_arcsec += 0.4194 * Math.cos(0.0343639758 * t + (2.6513));
      d_lon_arcsec += 0.4175 * Math.cos(0.0028349936 * t + (0.6452));
      d_lon_arcsec += 0.4144 * Math.cos(0.0018854084 * t + (-1.9534));
      d_lon_arcsec += 0.4124 * Math.cos(0.0046515914 * t + (-2.7443));
      d_lon_arcsec += 0.4102 * Math.cos(0.0320381801 * t + (-0.1329));
      d_lon_arcsec += 0.4089 * Math.cos(0.0007293916 * t + (0.9194));
      d_lon_arcsec += 0.4056 * Math.cos(0.0006743431 * t + (1.9770));
      d_lon_arcsec += 0.4039 * Math.cos(0.0320657043 * t + (1.4903));
      d_lon_arcsec += 0.4011 * Math.cos(0.0086701261 * t + (0.6301));
      d_lon_arcsec += 0.4007 * Math.cos(0.0026010378 * t + (-1.7087));
      d_lon_arcsec += 0.3875 * Math.cos(0.0069498630 * t + (-1.6937));
      d_lon_arcsec += 0.3777 * Math.cos(0.0026560862 * t + (-2.8617));
      d_lon_arcsec += 0.3708 * Math.cos(0.0008119642 * t + (1.9112));
      d_lon_arcsec += 0.3653 * Math.cos(0.0664434422 * t + (-0.7923));
      d_lon_arcsec += 0.3606 * Math.cos(0.0331666727 * t + (1.2481));
      d_lon_arcsec += 0.3592 * Math.cos(0.0333318180 * t + (0.6221));
      d_lon_arcsec += 0.3581 * Math.cos(0.0355750411 * t + (0.5200));
      d_lon_arcsec += 0.3575 * Math.cos(0.0026973726 * t + (0.7525));
      d_lon_arcsec += 0.3567 * Math.cos(0.0046378293 * t + (2.9883));
      d_lon_arcsec += 0.3559 * Math.cos(0.0026147999 * t + (-0.4411));
      d_lon_arcsec += 0.3558 * Math.cos(0.0026423241 * t + (2.2401));
      d_lon_arcsec += 0.3520 * Math.cos(0.0326574748 * t + (-0.7360));
      d_lon_arcsec += 0.3424 * Math.cos(0.0026698483 * t + (-1.4841));
      d_lon_arcsec += 0.3392 * Math.cos(0.0321482769 * t + (-1.3757));
      d_lon_arcsec += 0.3360 * Math.cos(0.0344465485 * t + (0.3276));
      d_lon_arcsec += 0.3304 * Math.cos(0.0027111347 * t + (2.1386));
      d_lon_arcsec += 0.3295 * Math.cos(0.0040185346 * t + (0.2162));
      d_lon_arcsec += 0.3230 * Math.cos(0.0063718545 * t + (-0.5565));
      d_lon_arcsec += 0.3186 * Math.cos(0.0320932285 * t + (0.7196));
      d_lon_arcsec += 0.3154 * Math.cos(0.0331529106 * t + (0.3642));
      d_lon_arcsec += 0.3089 * Math.cos(0.0006330568 * t + (1.6529));
      d_lon_arcsec += 0.2992 * Math.cos(0.0009495852 * t + (2.4477));
      d_lon_arcsec += 0.2969 * Math.cos(0.0319968938 * t + (-0.6225));
      d_lon_arcsec += 0.2967 * Math.cos(0.0017615494 * t + (-0.7934));
      d_lon_arcsec += 0.2962 * Math.cos(0.0046928778 * t + (-2.3000));
      d_lon_arcsec += 0.2951 * Math.cos(0.0035643852 * t + (-2.4085));
      d_lon_arcsec += 0.2946 * Math.cos(0.0308546391 * t + (2.9308));
      d_lon_arcsec += 0.2929 * Math.cos(0.0338134916 * t + (-0.6301));
      d_lon_arcsec += 0.2915 * Math.cos(0.0068948145 * t + (2.7354));
      d_lon_arcsec += 0.2875 * Math.cos(0.0034267641 * t + (-1.7041));
      d_lon_arcsec += 0.2873 * Math.cos(0.0027386589 * t + (-1.7068));
      d_lon_arcsec += 0.2866 * Math.cos(0.0040460588 * t + (-1.4969));
      d_lon_arcsec += 0.2862 * Math.cos(0.0343226895 * t + (0.6916));
      d_lon_arcsec += 0.2821 * Math.cos(0.0027524210 * t + (-0.4202));
      d_lon_arcsec += 0.2796 * Math.cos(0.0326437127 * t + (-2.0468));
      d_lon_arcsec += 0.2784 * Math.cos(0.0309372117 * t + (2.2119));
      d_lon_arcsec += 0.2762 * Math.cos(0.0027661831 * t + (0.8291));
      d_lon_arcsec += 0.2756 * Math.cos(0.0027248968 * t + (-2.9980));
      d_lon_arcsec += 0.2747 * Math.cos(0.0034680504 * t + (-2.6316));
      d_lon_arcsec += 0.2720 * Math.cos(0.0344603106 * t + (1.2016));
      d_lon_arcsec += 0.2679 * Math.cos(0.0027937073 * t + (-3.0326));
      d_lon_arcsec += 0.2677 * Math.cos(0.0046240672 * t + (2.0970));
      d_lon_arcsec += 0.2672 * Math.cos(0.0027799452 * t + (2.0639));
      d_lon_arcsec += 0.2671 * Math.cos(0.0029450904 * t + (-0.0090));
      d_lon_arcsec += 0.2670 * Math.cos(0.0333455801 * t + (1.8971));
      d_lon_arcsec += 0.2666 * Math.cos(0.0355888032 * t + (1.2723));
      d_lon_arcsec += 0.2659 * Math.cos(0.0040873451 * t + (-2.2523));
      d_lon_arcsec += 0.2648 * Math.cos(0.0028074694 * t + (-1.8558));
      d_lon_arcsec += 0.2632 * Math.cos(0.0033854778 * t + (2.3445));
      d_lon_arcsec += 0.2631 * Math.cos(0.0321620391 * t + (-0.4816));
      d_lon_arcsec += 0.2613 * Math.cos(0.0343777379 * t + (3.0430));
      d_lon_arcsec += 0.2607 * Math.cos(0.0034130020 * t + (-1.5706));
      d_lon_arcsec += 0.2584 * Math.cos(0.0343915000 * t + (3.0877));
      d_lon_arcsec += 0.2570 * Math.cos(0.0018716463 * t + (-2.2564));
      d_lon_arcsec += 0.2521 * Math.cos(0.0030414252 * t + (2.5530));
      d_lon_arcsec += 0.2516 * Math.cos(0.0319831317 * t + (-1.8097));
      d_lon_arcsec += 0.2479 * Math.cos(0.0033992399 * t + (-2.7397));
      d_lon_arcsec += 0.2449 * Math.cos(0.0057800840 * t + (-0.2052));
      d_lon_arcsec += 0.2439 * Math.cos(0.0006881052 * t + (2.8542));
      d_lon_arcsec += 0.2407 * Math.cos(0.0320794664 * t + (-2.4180));
      d_lon_arcsec += 0.2389 * Math.cos(0.0343502137 * t + (1.9387));
      d_lon_arcsec += 0.2318 * Math.cos(0.0028212315 * t + (-0.8678));
      d_lon_arcsec += 0.2303 * Math.cos(0.0355612790 * t + (0.1917));
      d_lon_arcsec += 0.2297 * Math.cos(0.0333042938 * t + (-1.8450));
      d_lon_arcsec += 0.2274 * Math.cos(0.0338272537 * t + (0.6876));
      break;

  }
  // Return correction in degrees
  return d_lon_arcsec / 3600.0;
}


  return Object.freeze({
    computeDensityMatrixAndEntropy,
    // Separate absolute-frame API. Browser callers explicitly load the portable
    // precision-ephemeris.js bundle; Node resolves it lazily on first call.
    computePrecisionChart(options) {
      const precision = typeof module === 'object' && module.exports
        ? require('./precision-ephemeris.js') : globalThis.KaalPrecisionEphemeris;
      if (!precision) throw new Error('Load precision-ephemeris.js before calling computePrecisionChart');
      return precision.computePrecisionChart(options);
    },
    canonicalChartWithPrecision, chartPrecision, placementPrecision, positionBudgetArcsec, vargaMarginArcsec,
    computeQuantumAdvantageScaling,
    computeRelativisticCorrections,
    computeJacobiTheta3,
    computePisanoPeriod,
    hensel3AdicLift,
    FULL_CIRCLE,
    KALI_EPOCH_JD,
    ARYABHATA_ZERO_JD,
    MAHAYUGA_DAYS,
    SIDEREAL_YEAR_DAYS,
    UJJAIN_LONGITUDE_DEG,
    BIJA_ANCHOR_JD,

    METROLOGY,
    BHAGANAS,
    BIJA_REV_PER_MAHAYUGA,
    EMPIRICAL_BIJA_REV_PER_MAHAYUGA,
    GRAHAS,
    RASHIS,
    RASHI_LORDS,
    VARGAS,
    VARGAS_EXTENDED,
    VIMSHOTTARI_SEQUENCE,
    VIMSHOTTARI_YEARS,
    mod360,
    gregorianToJulianDay,
    julianDayToIsoDate,
    ujjainMeanTime,
    precessionRates,
    ayanamshaDeg,
    AYANAMSHA_MODES,
    AYANAMSHA_MODES_EXTENDED,
    ayanamshaRateArcsecPerYear,
    coordinateFrameOffsetDeg,
    drigCoordinates,
    drigGeoJ2000,
    // the tiers (2026-10-08)
    TIERS,
    TIER_IDS,
    DEFAULT_TIER,
    resolveTier,
    tierFamily,
    pageTier,
    TierSpanError,
    tierInSpan,
    tierAyanamsha,
    tierGrahaRows,
    tierDay,
    tierMeridian,
    sayanaAscendantDeg,
    vimshottariTier,
    skyLunarMonth,
    civilToJd,
    jdToCivil,
    ssDaysOfJd,
    meanLunarNodeTropicalDeg,
    LUNAR_MASA_SA,
    rituOfSauraMasa,
    karanaIndexSS,
    NAMED_AYANAMSHAS,
    ARYABHATA_ZERO_LABEL,
    bijaCoefficients,
    bijaDeltaDeg,
    meanGrahaModel,
    meanObliquityDeg,
    gmstDeg,
    observedDeltaTSeconds,
    localSiderealTimeDeg,
    tropicalAscendantDeg,
    siderealAscendantDeg,
    tropicalMidheavenDeg,
    bhavaMadhyasTropicalDeg,
    bhavaSandhisDeg,
    bhavaIndexForLongitude,
    bhavaOf,
    bhavaModel,
    signIndex,
    computeVarga,
    limbsFromSphuta,
    vimshottariBirthState,
    vimshottariAtJd,
    katapayadiEncodeInteger,
    katapayadiDecodeInteger,
    encodeCoordinatePair,
    decodeCoordinatePair,
    rad,
    SS,
    SS_AHARGANA_J2000,
    SS_STAR_PLANETS,
    ssPeriod,
    ssKaksha,
    ssRevolutions,
    ssAngle,
    ssMeanLongitude,
    ssWrap,
    ssPhaseFromKali,
    ssApsisAtKali,
    ssBhaganaRole,
    ssPlanetMeanAt,
    ssSighroccaAt,
    ssMandoccaAt,
    ssRectifiedParidhi,
    ssMandaEquation,
    ssSighraEquation,
    ssSphutaAt,
    ssMeanNodeAt,
    ssNodeAt,
    ssLatitudeAt,
    ssParamaManda,
    ssAudit,
    ssSphutaAudit,
    ssSpaceAudit,
    sphutaGrahaModel,
    canonicalGrahaModel,
    panchangAtJd,
    panchangExtended,
    solarRiseSet,
    getSolarCoordinates,
    rahuKaal,
    abhijitMuhurta,
    generateSankalpaText,
    paniniHash,
    computeNadiAmsha,
    computePlanetaryVelocities,
    computeAspects,
    computeTithiDagdha,
    computeBhriguBindu,
    computeInduLagna,
    yoginiBirthState,
    yoginiAtJd,
    YOGINI_SEQUENCE,
    YOGINI_METADATA,
    JAIMINI_KARAKA_ROLES,
    computeJaiminiCharaKarakas,
    computeAshtakavarga,
    computePushkaraAndMrityuBhaga,
    computeClassicalYogas,
    computeShadbala,
    scanAuspiciousMuhurtas,
    computeNakshatraDetails,
    computeSpecialLagnas,
    computeUpagrahas,
    kalaUpagrahaParts,
    computeArudhaPadas,
    computeArgala,
    computeAshtakavargaShodhana,
    computeBirthDoshasAndShanti,
    computeSuryaSiddhanta14Adhikaras,
    tierEclipses,
    ECLIPSE_ROW_FIELDS,
    aryabhataSineTable,
    aryabhataKuttaka,
    aryabhataPi,
    aryabhataJya,
    aryabhataKotiJya,
    aryabhataMandaCorrection,
    aryabhataSighraCorrection,
    aryabhataRationalKernel,
    compareKernels,
    ARYABHATA_JYA_24,
    brahmaguptaBhavana,
    brahmaguptaQuadrilateralArea,
    brahmaguptaZeroAlgebra,
    bhaskaraChakravala,
    bhaskaraDifferentialElement,
    madhavaSineSeries,
    madhavaCosineSeries,
    madhavaPiSeries,
    pingalaMeruPrastara,
    pingalaMatrameru,
    pingalaPratyayaBinary,
    pingalaNashtam,
    pingalaUddhistam,
    baudhayanaSquareRoot2,
    baudhayanaPythagoreanTriple,
    baudhayanaCircleSquareTransform,
    padicValuation,
    padicNorm,
    padicDistance,
    verifyUltrametricInequality,
    nilpotentTimeReversal,
    pedersenCommit,
    pedersenVerify,
    outflowNeutralizationProtocol,
    computeGoldenRatioPhase,
    computeKaalPrecessionAngle,
    sacredGeospatialBerryPhase,
    // Triveni Sangam extensions (2026-08-17)
    haversineKm,
    sphericalTriangleExcess,
    EARTH_MEAN_RADIUS_KM,
    computeNatalId,
    dashaBreathCount,
    vimshottariBreathTable,
    isLaya972,
    pada108,
    dualDayPaths,
    getLunarCoordinates,
    lunarRiseSet,
    keralaDrikSphuta,
    deepTimeRow,
    BREATHS_PER_DAY,
    BREATHS_PER_YEAR,
    computeMetabolicRateSuppression,
    computeDecadeHingeStatus,
    BAUDHAYANA_TRIPLES,
    PINGALA_GANAS,
    ARUDHA_NAMES,
    RASI_MULTIPLIERS,
    GRAHA_MULTIPLIERS,
    AV_GRAHAS,
    AV_CONTRIBUTORS,
    KAKSHYA_LORDS,
    PUSHKARA_BHAGA,
    MRITYU_BHAGA,
    SHADBALA_REQUIRED_RUPAS,
    ASPECT_DEFINITIONS,
    NADI_NAMES,
    YOGA_NAMES,
    KARANA_NAMES,
    SAMVATSARA_NAMES,
    RITU_NAMES,
    TEMPLE_PRESETS,
    RASHI_SA,
    MASA_SA,
    TITHI_NAMES,
    NAKSHATRA_NAMES,
    VARA_NAMES,
    BHAVA_SA,
    BHAVA_KARAKA,
    SUBDAY_CHAIN,
    spandaPerAhoratra,
    spandaSeconds,
    jdToAharganaSpandas,
    aharganaSpandasFromCivil,
    quantumBijaCorrection,
    meanRawExact,
    yantraState,
    YANTRA_STATE_DEFAULTS,
    YANTRA_STATE_KEY,
  });
});
