(function(){
const W=751,H=430,V=THREE.Vector3;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,k)=>a+(b-a)*k;
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
const back=k=>{const c=1.1,x=k-1;return 1+(c+1)*x*x*x+c*x*x};
const img=new Image();img.onload=init;img.src="assets/mics/campus-map.webp";

function init(){
