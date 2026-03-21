"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const BREEDS = {
  "Labrador Retriever":{ideal:[25,36],s:"Chaleur, articulations"},
  "Golden Retriever":{ideal:[25,34],s:"Articulations, fourrure"},
  "Berger Allemand":{ideal:[22,40],s:"Hanches, stress"},
  "Bouledogue Français":{ideal:[8,14],s:"Chaleur, respiration"},
  "Beagle":{ideal:[9,11],s:"Alimentation (glouton)"},
  "Caniche":{ideal:[3,30],s:"Dents, anxiété"},
  "Chihuahua":{ideal:[1.5,3],s:"Froid, os fragiles"},
  "Yorkshire Terrier":{ideal:[2,3.5],s:"Dents, os"},
  "Cocker Spaniel":{ideal:[12,16],s:"Oreilles, poids"},
  "Husky Sibérien":{ideal:[16,27],s:"Chaleur (nordique)"},
  "Border Collie":{ideal:[14,20],s:"Stimulation mentale"},
  "Rottweiler":{ideal:[35,60],s:"Articulations, chaleur"},
  "Boxer":{ideal:[25,32],s:"Chaleur, respiration"},
  "Shih Tzu":{ideal:[4,7.5],s:"Chaleur, yeux"},
  "Autre race":{ideal:[5,30],s:"Variable selon la race"},
};
const ACTS=[
  {v:"Sédentaire",icon:"😴",title:"Très peu d'exercice",tip:"Sort à peine pour ses besoins. Peu ou pas de jeux, presque pas de vraies balades.",ex:["Moins de 20 min/jour","Sort surtout pour faire ses besoins","Peu ou pas de jeux"]},
  {v:"Modéré",icon:"🚶",title:"Quelques balades",tip:"Balades de 15-30 min sans intensité particulière. Le chien bouge mais n'est pas vraiment sportif.",ex:["1 à 2 balades de 15-30 min/jour","Quelques sessions de jeux","Actif mais sans programme régulier"]},
  {v:"Actif",icon:"🏃",title:"Exercice régulier",tip:"Plus de 45 min d'activité intense/jour : jogging, fetch, agility... Plein d'énergie, bien musclé.",ex:["Plus de 45 min d'activité/jour","Jogging, fetch, agility, natation...","Niveau d'énergie élevé"]},
];
const GOALS=[
  {v:"Perte de poids",icon:"⚖️",desc:"Retrouver un poids idéal progressivement"},
  {v:"Maintien du poids",icon:"🎯",desc:"Rester dans la bonne fourchette"},
  {v:"Remise en forme",icon:"💪",desc:"Améliorer l'endurance et la musculature"},
  {v:"Stimulation mentale",icon:"🧠",desc:"Réduire l'anxiété et l'ennui"},
];
const DAYS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const DAYS_SHORT=["L","M","M","J","V","S","D"];

// ─── STYLES ─────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --a:#E8820C;--ap:#FFF3E0;--al:#FBA84A;
  --g:#1C3D2A;--gm:#2D6444;--gl:#E8F2EC;
  --cr:#FFFAF4;--cd:#F0E6D3;
  --tx:#1A1209;--tm:#4A3728;--ts:#9A8070;
  --wh:#fff;--rad:14px;--sh:0 2px 12px rgba(26,18,9,.08);
}
body,#root{font-family:'DM Sans',system-ui,sans-serif;background:var(--cr);color:var(--tx);min-height:100vh}
.app{display:flex;flex-direction:column;min-height:100vh}

/* NAV */
.nav{padding:13px 22px;display:flex;align-items:center;justify-content:space-between;background:var(--cr);border-bottom:1px solid var(--cd);position:sticky;top:0;z-index:100}
.logo{font-family:'Fraunces',serif;font-weight:900;font-size:19px;color:var(--g)}
.logo span{color:var(--a)}
.badge{background:var(--g);color:#fff;font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px}

/* HERO */
.hero{max-width:720px;margin:0 auto;padding:50px 22px 40px;text-align:center}
.pill{display:inline-flex;align-items:center;gap:6px;background:var(--gl);color:var(--gm);font-size:12px;font-weight:600;padding:5px 14px;border-radius:40px;margin-bottom:20px}
.pill::before{content:"🐾";font-size:13px}
h1{font-family:'Fraunces',serif;font-size:clamp(32px,6vw,58px);font-weight:900;color:var(--g);line-height:1.05;margin-bottom:14px;letter-spacing:-1.5px}
h1 em{font-style:italic;color:var(--a)}
.sub{font-size:15px;color:var(--tm);line-height:1.6;max-width:400px;margin:0 auto 30px}
.stats{display:flex;justify-content:center;gap:32px;margin-bottom:32px;flex-wrap:wrap}
.sn{font-family:'Fraunces',serif;font-size:28px;font-weight:900;color:var(--a)}
.sl{font-size:10px;color:var(--ts);text-transform:uppercase;letter-spacing:.8px;margin-top:3px}

/* BUTTONS */
.btn{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;border:none;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:7px}
.btn-g{background:var(--g);color:#fff;box-shadow:0 4px 16px rgba(28,61,42,.25)}
.btn-g:hover{background:var(--gm);transform:translateY(-1px)}
.btn-g:disabled{opacity:.4;cursor:not-allowed;transform:none}
.btn-ghost{background:transparent;color:var(--tm);border:1.5px solid var(--cd)}
.btn-ghost:hover{border-color:var(--ts)}
.btn-a{background:var(--a);color:#fff}
.btn-a:hover{background:var(--al)}
.btn-red{background:#DC2626;color:#fff}
.btn-sm{padding:8px 16px;font-size:12px}

/* ONBOARDING */
.ob{max-width:500px;margin:0 auto;padding:26px 22px 60px;animation:fu .3s ease}
@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.pbar{width:100%;height:4px;background:var(--cd);border-radius:10px;margin-bottom:32px;overflow:hidden}
.pfill{height:100%;background:linear-gradient(90deg,var(--a),var(--al));border-radius:10px;transition:width .4s}
.slbl{font-size:11px;font-weight:600;color:var(--a);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}
.stitle{font-family:'Fraunces',serif;font-size:clamp(20px,4vw,26px);font-weight:700;color:var(--g);margin-bottom:5px;letter-spacing:-.3px}
.ssub{font-size:13px;color:var(--ts);margin-bottom:22px;line-height:1.5}
.flbl{display:block;font-size:11px;font-weight:600;color:var(--tm);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.inp{width:100%;padding:12px 15px;border:2px solid var(--cd);border-radius:12px;font-family:'DM Sans',sans-serif;font-size:15px;color:var(--tx);background:#fff;outline:none;transition:border-color .2s;-webkit-appearance:none}
.inp:focus{border-color:var(--a)}
.inp::placeholder{color:var(--ts)}
.fg{margin-bottom:15px}
.hint{font-size:11px;color:var(--ts);margin-top:4px;font-style:italic}
.opts{display:grid;gap:9px}
.opts.c2{grid-template-columns:1fr 1fr}
.oc{padding:13px 15px;border:2px solid var(--cd);border-radius:12px;cursor:pointer;transition:all .2s;background:#fff;display:flex;align-items:flex-start;gap:11px}
.oc:hover{border-color:var(--al);background:var(--ap)}
.oc.sel{border-color:var(--a);background:var(--ap);box-shadow:0 0 0 3px rgba(232,130,12,.1)}
.oc.msel{border-color:var(--gm);background:var(--gl);box-shadow:0 0 0 3px rgba(45,100,68,.1)}
.oi{font-size:19px;flex-shrink:0;margin-top:1px}
.ot{font-size:13px;font-weight:700;color:var(--tx)}
.od{font-size:11px;color:var(--ts);margin-top:2px;line-height:1.4}
.ac{background:#fff;border:2px solid var(--cd);border-radius:12px;padding:13px 15px;cursor:pointer;transition:all .2s;margin-bottom:9px}
.ac:hover{border-color:var(--al);background:var(--ap)}
.ac.sel{border-color:var(--a);background:var(--ap)}
.ah{display:flex;align-items:center;gap:9px;margin-bottom:7px}
.ai{font-size:19px}
.at{font-size:13px;font-weight:700;color:var(--tx);flex:1}
.aex{font-size:11px;color:var(--ts);display:flex;gap:5px;margin-bottom:3px;line-height:1.4}
.tip{position:relative;display:inline-flex;align-items:center}
.ti{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:var(--cd);color:var(--ts);font-size:9px;font-weight:700;cursor:help;margin-left:4px;transition:all .2s}
.ti:hover{background:var(--a);color:#fff}
.tb{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:#1A1209;color:#fff;font-size:11px;line-height:1.5;padding:8px 11px;border-radius:8px;width:185px;z-index:200;pointer-events:none;opacity:0;transition:opacity .2s;white-space:normal}
.tb::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#1A1209}
.tip:hover .tb{opacity:1}
.wi{background:var(--gl);border-radius:8px;padding:10px 13px;font-size:12px;color:var(--gm);font-weight:500;margin-top:9px}
.mh{font-size:12px;color:var(--gm);background:var(--gl);padding:8px 13px;border-radius:8px;margin-bottom:11px;font-weight:500}
.an{background:var(--gl);border-radius:10px;padding:11px 15px;font-size:12px;color:var(--gm);display:flex;align-items:flex-start;gap:7px;margin-bottom:15px;font-weight:500;line-height:1.5}
.rrow{display:flex;justify-content:space-between;margin-bottom:5px}
.rval{font-family:'Fraunces',serif;font-size:17px;font-weight:800;color:var(--a)}
.rsmall{font-size:11px;color:var(--ts);display:flex;justify-content:space-between;margin-top:2px}
input[type=range]{width:100%;height:5px;border-radius:3px;background:var(--cd);outline:none;-webkit-appearance:none;cursor:pointer;margin:9px 0}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--a);box-shadow:0 2px 6px rgba(232,130,12,.4);cursor:pointer}
.snav{display:flex;gap:9px;margin-top:22px}
.snav .btn{flex:1;justify-content:center}
.chk{position:absolute;top:8px;right:8px;background:var(--gm);color:#fff;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
.err{background:#FEF2F2;border:1.5px solid #FCA5A5;border-radius:10px;padding:11px 15px;font-size:12px;color:#DC2626;line-height:1.5;margin-top:11px}

/* LOADING */
.ld{max-width:400px;margin:0 auto;padding:56px 22px;text-align:center;animation:fu .4s ease}
.ldog{font-size:54px;animation:bou 1s ease infinite;display:block;margin-bottom:18px}
@keyframes bou{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.lt{font-family:'Fraunces',serif;font-size:21px;font-weight:800;color:var(--g);margin-bottom:7px}
.ls{font-size:13px;color:var(--ts);line-height:1.6}
.dots{display:flex;justify-content:center;gap:6px;margin-top:20px}
.dot{width:8px;height:8px;border-radius:50%;background:var(--a);animation:pu 1.2s ease infinite}
.dot:nth-child(2){animation-delay:.2s}
.dot:nth-child(3){animation-delay:.4s}
@keyframes pu{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}

/* DASHBOARD */
.dash{display:flex;flex-direction:column;flex:1;animation:fu .3s ease}
.dhead{background:linear-gradient(135deg,var(--g) 0%,var(--gm) 100%);padding:22px 22px 0;color:#fff}
.dhead-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}
.dog-info h2{font-family:'Fraunces',serif;font-size:22px;font-weight:900;margin-bottom:3px}
.dog-info p{font-size:12px;opacity:.8}
.dog-avatar{width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:26px;overflow:hidden;flex-shrink:0}
.dog-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.week-badge{background:rgba(255,255,255,.15);padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-top:10px;display:inline-block}
.progress-ring{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;opacity:.9}
.tabs{display:flex;gap:2px;background:rgba(0,0,0,.2);border-radius:10px 10px 0 0;padding:4px 4px 0;margin-top:16px}
.tab{flex:1;padding:9px 4px;text-align:center;font-size:11px;font-weight:600;color:rgba(255,255,255,.6);cursor:pointer;border-radius:8px 8px 0 0;transition:all .2s;border:none;background:transparent}
.tab.active{background:var(--cr);color:var(--g)}
.tab:hover:not(.active){color:#fff}
.tab-icon{font-size:14px;display:block;margin-bottom:2px}
.dcontent{flex:1;padding:18px 22px 80px;max-width:720px;width:100%;margin:0 auto}

/* PLAN VIEW */
.ph{background:linear-gradient(135deg,var(--g) 0%,var(--gm) 100%);border-radius:14px;padding:22px 24px;color:#fff;margin-bottom:18px;position:relative;overflow:hidden}
.ph::after{content:"🐾";position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:60px;opacity:.12}
.pbadge{background:rgba(255,255,255,.15);color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:10px;letter-spacing:1px;text-transform:uppercase}
.pname{font-family:'Fraunces',serif;font-size:clamp(20px,4vw,28px);font-weight:900;margin-bottom:5px}
.psub{font-size:12px;opacity:.8}
.pstats{display:flex;gap:7px;margin-top:14px;flex-wrap:wrap}
.pst{background:rgba(255,255,255,.12);border-radius:7px;padding:5px 10px;font-size:11px;font-weight:500}
.sect{font-family:'Fraunces',serif;font-size:17px;font-weight:800;color:var(--g);margin-bottom:11px;display:flex;align-items:center;gap:7px}

/* DAY CARDS */
.dg{display:grid;gap:9px;margin-bottom:22px}
.dc{background:#fff;border-radius:12px;padding:13px 17px;border:1.5px solid var(--cd);display:flex;gap:13px;align-items:flex-start;transition:all .2s;position:relative}
.dc:hover{border-color:var(--al);box-shadow:var(--sh)}
.dc.rest{background:var(--gl);border-color:var(--gl)}
.dc.done{border-color:var(--gm);background:var(--gl)}
.dc.done .da{text-decoration:line-through;opacity:.6}
.dn{background:var(--ap);color:var(--a);font-family:'Fraunces',serif;font-weight:900;font-size:14px;width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dc.rest .dn{background:rgba(45,100,68,.15);color:var(--gm)}
.dc.done .dn{background:var(--gm);color:#fff}
.dct{flex:1}
.dnm{font-size:10px;font-weight:700;color:var(--ts);text-transform:uppercase;letter-spacing:.8px;margin-bottom:2px}
.da{font-size:13px;font-weight:700;color:var(--tx);margin-bottom:2px}
.dd{font-size:11px;color:var(--a);font-weight:600}
.dnote{font-size:10px;color:var(--ts);margin-top:4px;font-style:italic;line-height:1.4}
.ids{display:flex;gap:3px;align-items:center;margin-left:7px}
.id{width:4px;height:4px;border-radius:50%;background:var(--cd)}
.id.on{background:var(--a)}
.check-btn{width:30px;height:30px;border-radius:50%;border:2px solid var(--cd);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;font-size:14px}
.check-btn:hover{border-color:var(--gm);background:var(--gl)}
.check-btn.checked{border-color:var(--gm);background:var(--gm);color:#fff}

/* NUTRITION */
.nc{background:#fff;border-radius:var(--rad);padding:18px 22px;border:1.5px solid var(--cd);margin-bottom:22px}
.nr{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--cd)}
.nr:last-child{border-bottom:none}
.nk{font-size:12px;color:var(--ts);font-weight:500}
.nv{font-size:13px;font-weight:700;color:var(--tx)}
.nv.hl{color:var(--a);font-family:'Fraunces',serif;font-size:17px}
.nv.gr{color:var(--gm)}

/* TIPS */
.tc{background:var(--ap);border-radius:var(--rad);padding:16px 20px;border:1.5px solid rgba(232,130,12,.2);margin-bottom:22px}
.ti2{display:flex;gap:9px;margin-bottom:9px;font-size:12px;color:var(--tm);line-height:1.5}
.ti2:last-child{margin-bottom:0}

/* WEIGHT TRACKER */
.wt-card{background:#fff;border-radius:var(--rad);border:1.5px solid var(--cd);margin-bottom:16px;overflow:hidden}
.wt-head{padding:14px 18px;border-bottom:1px solid var(--cd);display:flex;align-items:center;justify-content:space-between}
.wt-title{font-weight:700;font-size:14px;color:var(--tx)}
.wt-body{padding:16px 18px}
.wt-add{display:flex;gap:9px;align-items:center;margin-bottom:14px}
.wt-inp{flex:1;padding:10px 14px;border:2px solid var(--cd);border-radius:10px;font-family:inherit;font-size:14px;outline:none;transition:border-color .2s}
.wt-inp:focus{border-color:var(--a)}
.weight-chart{width:100%;height:140px;position:relative;margin-bottom:8px}
.weight-entries{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto}
.we{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--cr);border-radius:8px;font-size:12px}
.we-date{color:var(--ts)}
.we-weight{font-weight:700;color:var(--tx);font-family:'Fraunces',serif;font-size:15px}
.we-diff{font-size:11px;font-weight:600}
.we-diff.down{color:var(--gm)}
.we-diff.up{color:#DC2626}
.we-diff.same{color:var(--ts)}
.ideal-line{background:var(--gl);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--gm);font-weight:500;display:flex;align-items:center;gap:6px}

/* WEEKLY PROGRESS DOTS */
.week-prog{background:#fff;border-radius:var(--rad);border:1.5px solid var(--cd);padding:16px 18px;margin-bottom:16px}
.wp-title{font-weight:700;font-size:13px;color:var(--tx);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}
.wp-days{display:flex;gap:6px;justify-content:space-between}
.wp-day{flex:1;text-align:center}
.wp-dot{width:32px;height:32px;border-radius:50%;border:2px solid var(--cd);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-size:13px;cursor:pointer;transition:all .2s}
.wp-dot.done{background:var(--gm);border-color:var(--gm);color:#fff}
.wp-dot.rest{background:var(--gl);border-color:var(--gl);color:var(--gm)}
.wp-dot.today{border-color:var(--a);box-shadow:0 0 0 3px rgba(232,130,12,.15)}
.wp-lbl{font-size:10px;color:var(--ts);font-weight:600}
.wp-score{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:var(--a)}
.wp-score-lbl{font-size:11px;color:var(--ts)}

/* HARD WEEK MODE */
.hw-card{background:linear-gradient(135deg,#7C3AED,#9F5EF5);border-radius:var(--rad);padding:16px 18px;margin-bottom:16px;color:#fff}
.hw-title{font-weight:700;font-size:14px;margin-bottom:5px;display:flex;align-items:center;gap:8px}
.hw-sub{font-size:12px;opacity:.85;margin-bottom:12px;line-height:1.5}
.hw-btn{background:rgba(255,255,255,.2);color:#fff;border:1.5px solid rgba(255,255,255,.3);backdrop-filter:blur(4px)}
.hw-btn:hover{background:rgba(255,255,255,.3)}

/* RECAP / BILAN */
.recap-card{background:#fff;border-radius:var(--rad);border:1.5px solid var(--cd);margin-bottom:14px;overflow:hidden}
.rc-head{padding:14px 18px;background:var(--cr);border-bottom:1px solid var(--cd);display:flex;align-items:center;justify-content:space-between}
.rc-week{font-weight:700;font-size:13px;color:var(--g)}
.rc-score{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:var(--a)}
.rc-body{padding:14px 18px}
.rc-text{font-size:12px;color:var(--tm);line-height:1.6;margin-bottom:12px}
.rc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.rc-stat{background:var(--cr);border-radius:8px;padding:10px;text-align:center}
.rc-stat-n{font-family:'Fraunces',serif;font-size:18px;font-weight:900;color:var(--g)}
.rc-stat-l{font-size:10px;color:var(--ts);margin-top:2px}
.bilan-loading{text-align:center;padding:20px;font-size:13px;color:var(--ts)}

/* PHOTOS */
.photo-section{background:#fff;border-radius:var(--rad);border:1.5px solid var(--cd);padding:16px 18px;margin-bottom:16px}
.photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.photo-slot{border-radius:10px;overflow:hidden;aspect-ratio:1;border:2px dashed var(--cd);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;background:var(--cr);position:relative}
.photo-slot:hover{border-color:var(--a);background:var(--ap)}
.photo-slot img{width:100%;height:100%;object-fit:cover;border-radius:8px}
.photo-slot-icon{font-size:28px;margin-bottom:6px}
.photo-slot-lbl{font-size:11px;color:var(--ts);font-weight:600;text-align:center}
.photo-slot-overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;border-radius:8px}
.photo-slot:hover .photo-slot-overlay{opacity:1}
.photo-upload{display:none}

/* VET SHARE */
.vet-card{background:#fff;border-radius:var(--rad);border:1.5px solid var(--cd);padding:16px 18px;margin-bottom:14px}
.vet-preview{background:var(--cr);border-radius:10px;padding:14px;border:1px solid var(--cd);font-size:12px;color:var(--tm);line-height:1.7;margin:12px 0;max-height:200px;overflow-y:auto}
.vet-actions{display:flex;gap:8px;flex-wrap:wrap}

/* NOTIFICATIONS */
.notif-card{background:#fff;border-radius:var(--rad);border:1.5px solid var(--cd);padding:14px 18px;margin-bottom:14px}
.notif-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--cd)}
.notif-row:last-child{border-bottom:none}
.notif-lbl{font-size:13px;color:var(--tx);font-weight:500}
.notif-sub{font-size:11px;color:var(--ts);margin-top:2px}
.toggle{width:42px;height:24px;background:var(--cd);border-radius:12px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
.toggle.on{background:var(--gm)}
.toggle-knob{width:18px;height:18px;background:#fff;border-radius:50%;position:absolute;top:3px;left:3px;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.toggle.on .toggle-knob{left:21px}

/* CTA */
.cta{background:var(--g);border-radius:var(--rad);padding:20px 24px;color:#fff;text-align:center;margin-bottom:12px}
.ctit{font-family:'Fraunces',serif;font-size:17px;font-weight:800;margin-bottom:5px}
.csub{font-size:12px;opacity:.8;margin-bottom:14px}
.rb{width:100%;padding:12px;background:transparent;border:2px solid var(--cd);border-radius:100px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:var(--ts);cursor:pointer;transition:all .2s}
.rb:hover{border-color:var(--ts);color:var(--tx)}
.tag{display:inline-flex;align-items:center;gap:4px;background:var(--ap);color:var(--a);font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:.5px}
.tag.green{background:var(--gl);color:var(--gm)}
.tag.purple{background:#EDE9FE;color:#7C3AED}
@media(max-width:480px){.opts.c2{grid-template-columns:1fr}.ph::after{display:none}.rc-stats{grid-template-columns:repeat(2,1fr)}.tabs .tab-label{display:none}}
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────
function parsePlan(txt) {
  try {
    const c = txt.replace(/```json|```/g,"").trim();
    const s = c.indexOf("{"), e = c.lastIndexOf("}");
    if (s!==-1&&e!==-1) return JSON.parse(c.slice(s,e+1));
  } catch{}
  return null;
}

function today() {
  return new Date().toLocaleDateString("fr-FR");
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
}

// ─── STORAGE ─────────────────────────────────────────────────────────────────
async function load(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

async function save(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

// ─── SUB COMPONENTS ──────────────────────────────────────────────────────────
function Tip({ text }) {
  return (
    <span className="tip">
      <span className="ti">?</span>
      <span className="tb">{text}</span>
    </span>
  );
}

function IDots({ n }) {
  return (
    <span className="ids">
      {[1,2,3].map(i=><span key={i} className={`id${i<=n?" on":""}`}/>)}
    </span>
  );
}

function Toggle({ on, onChange }) {
  return (
    <div className={`toggle${on?" on":""}`} onClick={()=>onChange(!on)}>
      <div className="toggle-knob"/>
    </div>
  );
}

// ─── WEIGHT CHART ─────────────────────────────────────────────────────────
function WeightChart({ entries, ideal }) {
  if (!entries || entries.length < 2) return (
    <div style={{textAlign:"center",padding:"20px",fontSize:12,color:"var(--ts)"}}>
      Ajoute au moins 2 pesées pour voir le graphique 📊
    </div>
  );
  const w = 320, h = 120, pad = 20;
  const weights = entries.map(e=>e.weight);
  const minW = Math.min(...weights, ideal) - 1;
  const maxW = Math.max(...weights, ideal) + 1;
  const scaleY = v => h - pad - ((v - minW) / (maxW - minW)) * (h - 2*pad);
  const scaleX = i => pad + (i / (entries.length-1)) * (w - 2*pad);
  const points = entries.map((e,i)=>`${scaleX(i)},${scaleY(e.weight)}`).join(" ");
  const idealY = scaleY(ideal);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:h}}>
      <line x1={pad} y1={idealY} x2={w-pad} y2={idealY} stroke="var(--gm)" strokeWidth="1.5" strokeDasharray="4,3"/>
      <text x={w-pad+2} y={idealY+4} fontSize="9" fill="var(--gm)" fontWeight="600">Idéal</text>
      <polyline points={points} fill="none" stroke="var(--a)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {entries.map((e,i)=>(
        <circle key={i} cx={scaleX(i)} cy={scaleY(e.weight)} r="4" fill="var(--a)" stroke="#fff" strokeWidth="2"/>
      ))}
      {entries.map((e,i)=>(
        <text key={i} x={scaleX(i)} y={h-4} fontSize="8" fill="var(--ts)" textAnchor="middle">{e.date.split("/")[0]}</text>
      ))}
    </svg>
  );
}

// ─── TAB: CETTE SEMAINE ───────────────────────────────────────────────────
function TabSemaine({ plan, profile, done, onToggle, onHardWeek, notifs, onToggleNotif, currentWeek }) {
  if (!plan) return null;
  const todayIdx = new Date().getDay();
  const dayIdx = todayIdx === 0 ? 6 : todayIdx - 1;
  const totalDays = plan.weekly_plan?.length || 7;
  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <div>
      {/* Progress */}
      <div className="week-prog">
        <div className="wp-title">
          <span>Semaine {currentWeek} en cours</span>
          <div>
            <span className="wp-score">{doneCount}</span>
            <span className="wp-score-lbl">/{totalDays} activités</span>
          </div>
        </div>
        <div className="wp-days">
          {DAYS_SHORT.map((d,i)=>{
            const dayPlan = plan.weekly_plan?.[i];
            const isDone = done[i];
            const isRest = dayPlan?.is_rest;
            const isToday = i === dayIdx;
            return (
              <div key={i} className="wp-day">
                <div
                  className={`wp-dot${isDone?" done":""}${isRest&&!isDone?" rest":""}${isToday?" today":""}`}
                  onClick={()=>!isRest&&onToggle(i)}
                  title={dayPlan?.activity||""}
                >
                  {isDone ? "✓" : isRest ? "💤" : d}
                </div>
                <div className="wp-lbl">{d}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hard week mode */}
      <div className="hw-card">
        <div className="hw-title">😓 Semaine difficile ?</div>
        <div className="hw-sub">
          Tu n'as pas pu sortir cette semaine ? Pas de stress — l'IA va adapter le programme pour toi.
        </div>
        <button className="btn hw-btn btn-sm" onClick={onHardWeek}>
          🔄 Adapter le programme
        </button>
      </div>

      {/* Today's activity */}
      <div className="sect">📅 Programme du jour</div>
      {plan.weekly_plan?.[dayIdx] && (
        <div className={`dc${plan.weekly_plan[dayIdx].is_rest?" rest":""}${done[dayIdx]?" done":""}`}
          style={{marginBottom:16,cursor:"pointer"}} onClick={()=>!plan.weekly_plan[dayIdx].is_rest&&onToggle(dayIdx)}>
          <div className="dn">{dayIdx+1}</div>
          <div className="dct">
            <div className="dnm">{DAYS[dayIdx]} — Aujourd'hui</div>
            <div className="da">{plan.weekly_plan[dayIdx].activity}</div>
            <div style={{display:"flex",alignItems:"center",marginTop:3}}>
              <span className="dd">{plan.weekly_plan[dayIdx].duration_min} min</span>
              {!plan.weekly_plan[dayIdx].is_rest && <IDots n={plan.weekly_plan[dayIdx].intensity}/>}
            </div>
            {plan.weekly_plan[dayIdx].breed_note && <div className="dnote">💡 {plan.weekly_plan[dayIdx].breed_note}</div>}
          </div>
          <button className={`check-btn${done[dayIdx]?" checked":""}`} onClick={e=>{e.stopPropagation();!plan.weekly_plan[dayIdx].is_rest&&onToggle(dayIdx)}}>
            {done[dayIdx]?"✓":""}
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="sect">🔔 Rappels</div>
      <div className="notif-card">
        {[
          {key:"morning", label:`Rappel matin pour ${profile.name}`, sub:"7h30 — Heure de la balade du matin 🐾"},
          {key:"evening", label:"Rappel soir", sub:"18h30 — Balade du soir"},
          {key:"weekly", label:"Bilan hebdomadaire", sub:"Dimanche 20h — Résumé de la semaine"},
          {key:"weight", label:"Pesée hebdomadaire", sub:"Lundi matin — Pense à peser "+profile.name},
        ].map(n=>(
          <div key={n.key} className="notif-row">
            <div>
              <div className="notif-lbl">{n.label}</div>
              <div className="notif-sub">{n.sub}</div>
            </div>
            <Toggle on={notifs[n.key]} onChange={v=>onToggleNotif(n.key,v)}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB: SUIVI ──────────────────────────────────────────────────────────
function TabSuivi({ profile, weights, onAddWeight, photos, onPhoto }) {
  const [newW, setNewW] = useState("");
  const bi = BREEDS[profile.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);

  const handleAdd = () => {
    const v = parseFloat(newW);
    if (!v || isNaN(v)) return;
    onAddWeight({date: today(), weight: v});
    setNewW("");
  };

  const handlePhoto = (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onPhoto(type, ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* Weight tracker */}
      <div className="sect">⚖️ Suivi du poids</div>
      <div className="wt-card">
        <div className="wt-head">
          <span className="wt-title">Courbe de progression</span>
          <span className="tag">{weights.length} pesées</span>
        </div>
        <div className="wt-body">
          <div className="wt-add">
            <input className="wt-inp" type="number" placeholder={`Poids de ${profile.name} (kg)`}
              value={newW} onChange={e=>setNewW(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleAdd()}
              step="0.1" min="0" max="100"/>
            <button className="btn btn-g btn-sm" onClick={handleAdd}>+ Ajouter</button>
          </div>
          <div className="weight-chart">
            <WeightChart entries={weights} ideal={ideal}/>
          </div>
          <div className="ideal-line">🎯 Poids idéal : <strong>{ideal} kg</strong> — {weights.length>0?`actuel : ${weights[weights.length-1].weight} kg`:"Ajoute ta première pesée"}</div>
          {weights.length > 0 && (
            <div className="weight-entries" style={{marginTop:10}}>
              {[...weights].reverse().map((e,i)=>{
                const prev = weights[weights.length-2-i];
                const diff = prev ? (e.weight - prev.weight).toFixed(1) : null;
                return (
                  <div key={i} className="we">
                    <span className="we-date">{e.date}</span>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {diff !== null && (
                        <span className={`we-diff${parseFloat(diff)<0?" down":parseFloat(diff)>0?" up":" same"}`}>
                          {parseFloat(diff)>0?"+":""}{diff} kg
                        </span>
                      )}
                      <span className="we-weight">{e.weight} kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Before/After photos */}
      <div className="sect">📸 Photos avant / après</div>
      <div className="photo-section">
        <div style={{fontSize:12,color:"var(--ts)",marginBottom:4}}>
          Documente la transformation de {profile.name} pour voir les progrès — et partager sur TikTok 🎬
        </div>
        <div className="photo-grid">
          {["before","after"].map(type=>(
            <div key={type}>
              <div style={{fontSize:11,fontWeight:600,color:"var(--ts)",textAlign:"center",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>
                {type==="before"?"Avant":"Après"}
              </div>
              <div className="photo-slot" onClick={()=>(type==="before"?beforeRef:afterRef).current?.click()}>
                {photos[type] ? (
                  <>
                    <img src={photos[type]} alt={type}/>
                    <div className="photo-slot-overlay" style={{color:"#fff",fontSize:12,fontWeight:600}}>
                      Changer
                    </div>
                  </>
                ) : (
                  <>
                    <div className="photo-slot-icon">📷</div>
                    <div className="photo-slot-lbl">Ajouter une photo</div>
                  </>
                )}
                <input type="file" accept="image/*" className="photo-upload"
                  ref={type==="before"?beforeRef:afterRef}
                  onChange={e=>handlePhoto(type,e)}/>
              </div>
            </div>
          ))}
        </div>
        {photos.before && photos.after && (
          <div className="an" style={{marginTop:12}}>
            🎬 <span>Parfait pour une vidéo TikTok "semaine {profile.currentWeek||1}" ! Partage la transformation de {profile.name}.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: BILAN ─────────────────────────────────────────────────────────
function TabBilan({ profile, plan, recaps, onGenerateBilan, doneHistory, weights }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (weekNum) => {
    setGenerating(true);
    await onGenerateBilan(weekNum);
    setGenerating(false);
  };

  const currentWeek = profile.currentWeek || 1;

  return (
    <div>
      <div className="sect">📊 Bilan hebdomadaire</div>
      <div className="an">🤖 <span>L'IA analyse ta semaine et génère des recommandations personnalisées.</span></div>

      {/* Current week recap */}
      {Array.from({length: currentWeek}, (_,i)=>i+1).reverse().map(w=>{
        const recap = recaps[w];
        const weekDone = doneHistory[w] || {};
        const doneCount = Object.values(weekDone).filter(Boolean).length;
        const weekWeights = weights.filter((_,i)=>i>=(w-1)*1&&i<=w*1);

        return (
          <div key={w} className="recap-card">
            <div className="rc-head">
              <div className="rc-week">Semaine {w}</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className="tag green">{doneCount}/7 activités</span>
                <span className="rc-score">{Math.round((doneCount/7)*100)}%</span>
              </div>
            </div>
            <div className="rc-body">
              <div className="rc-stats">
                <div className="rc-stat">
                  <div className="rc-stat-n">{doneCount}</div>
                  <div className="rc-stat-l">Activités faites</div>
                </div>
                <div className="rc-stat">
                  <div className="rc-stat-n">{7-doneCount}</div>
                  <div className="rc-stat-l">Manquées</div>
                </div>
                <div className="rc-stat">
                  <div className="rc-stat-n">{weekWeights.length>0?weekWeights[weekWeights.length-1].weight+"kg":"—"}</div>
                  <div className="rc-stat-l">Dernier poids</div>
                </div>
              </div>
              {recap ? (
                <div className="rc-text" style={{marginTop:12}}>{recap}</div>
              ) : (
                <div style={{marginTop:12}}>
                  {generating ? (
                    <div className="bilan-loading">🤖 Génération du bilan en cours...</div>
                  ) : (
                    <button className="btn btn-g btn-sm" onClick={()=>handleGenerate(w)}>
                      🤖 Générer le bilan IA
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* New week button */}
      <button className="btn btn-g" style={{width:"100%",justifyContent:"center",marginTop:8}}
        onClick={()=>onGenerateBilan("new")}>
        🚀 Démarrer la semaine {currentWeek+1}
      </button>
    </div>
  );
}

// ─── TAB: VÉTO ──────────────────────────────────────────────────────────
function TabVeto({ profile, plan, weights }) {
  const [copied, setCopied] = useState(false);
  const bi = BREEDS[profile.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const lastWeight = weights[weights.length-1];
  const breedName = profile.breed==="Autre race"?(profile.custom||"race inconnue"):profile.breed;

  const vetReport = `
RAPPORT BIEN-ÊTRE CANIN — LetsGoBoy
Date : ${today()}

═══════════════════════════════
PROFIL DE ${(profile.name||"").toUpperCase()}
═══════════════════════════════
Race : ${breedName}
Âge : ${profile.age} ans
Poids au départ : ${profile.weight} kg
Poids idéal estimé : ${ideal} kg
${lastWeight?`Dernier poids mesuré : ${lastWeight.weight} kg (${lastWeight.date})`:""}
Castré/Stérilisé : ${profile.neutered?"Oui":"Non"}
Objectifs : ${(profile.goals||[]).join(", ")}

═══════════════════════════════
PROGRAMME D'EXERCICE SEMAINE EN COURS
═══════════════════════════════
${plan?.weekly_plan?.map((d,i)=>`${DAYS[i]} : ${d.activity} — ${d.duration_min} min (intensité: ${d.intensity}/3)${d.breed_note?"\n  💡 "+d.breed_note:""}`).join("\n")||"Plan non généré"}

═══════════════════════════════
PLAN NUTRITIONNEL
═══════════════════════════════
Calories journalières : ${plan?.nutrition?.daily_calories||"—"} kcal
Ration recommandée : ${plan?.nutrition?.recommended_ration_g||"—"} g/jour
Eau recommandée : ${plan?.nutrition?.water_ml||"—"} ml/jour
Treats max/jour : ${plan?.nutrition?.treats_max_per_day||"—"}

═══════════════════════════════
CONSEILS SPÉCIFIQUES À LA RACE
═══════════════════════════════
${plan?.breed_tips?.join("\n• ")||"—"}

Généré par LetsGoBoy — Programme bien-être IA pour chiens
letsgoboy.com
`.trim();

  const handleCopy = () => {
    navigator.clipboard?.writeText(vetReport).then(()=>{
      setCopied(true);
      setTimeout(()=>setCopied(false),2000);
    }).catch(()=>{});
  };

  const handlePrint = () => {
    const win = window.open("","_blank");
    win.document.write(`<pre style="font-family:monospace;font-size:13px;padding:20px;white-space:pre-wrap">${vetReport}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <div>
      <div className="sect">🏥 Partage avec le véto</div>
      <div className="an">📋 <span>Un rapport complet du programme de <strong>{profile.name}</strong> à partager avec votre vétérinaire.</span></div>

      <div className="vet-card">
        <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",marginBottom:4}}>
          Rapport généré automatiquement
        </div>
        <div style={{fontSize:12,color:"var(--ts)",marginBottom:8}}>
          Inclut le programme d'exercice, le plan nutritionnel, le suivi du poids et les conseils de race.
        </div>
        <div className="vet-preview">{vetReport}</div>
        <div className="vet-actions">
          <button className="btn btn-g btn-sm" onClick={handleCopy}>
            {copied?"✓ Copié !":"📋 Copier le rapport"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handlePrint}>
            🖨️ Imprimer
          </button>
        </div>
      </div>

      <div className="vet-card">
        <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",marginBottom:8}}>
          📧 Envoyer par email
        </div>
        <div className="wt-add">
          <input className="wt-inp" type="email" placeholder="email@veterinaire.fr"/>
          <button className="btn btn-g btn-sm">Envoyer</button>
        </div>
        <div className="hint" style={{marginTop:6}}>Le rapport sera envoyé directement à votre vétérinaire.</div>
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [loadMsg, setLoadMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState({
    name:"",breed:"",custom:"",age:3,gender:null,neutered:true,reproStatus:"none",
    weight:20,city:"",housing:"",waterAccess:null,waterActivities:null,
    activity:"",time:30,goals:[],food:"",ration:""
  });

  const upd = f => setD(p=>({...p,...f}));
  const go = s => { setStep(s); setErr(""); };
  const bi = BREEDS[d.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const breedName = d.breed==="Autre race"?(d.custom||"race inconnue"):d.breed;
  const toggleGoal = v => upd({goals: d.goals.includes(v)?d.goals.filter(x=>x!==v):[...d.goals,v]});
  const housings=[
    {v:"Appartement sans jardin",icon:"🏢",desc:"Accès extérieur limité"},
    {v:"Appartement avec terrasse",icon:"🌿",desc:"Petit espace extérieur"},
    {v:"Maison avec jardin",icon:"🏡",desc:"Espace extérieur disponible"},
  ];
  const pct=[0,12,25,37,50,62,75,87,100];

  const generate = async () => {
    setLoading(true);
    setErr("");
    const msgs=[`Analyse du profil de ${d.name}...`,"Calcul du poids idéal...","Programme d'exercice...","Plan nutritionnel...","Finalisation..."];
    let mi=0; setLoadMsg(msgs[0]);
    const t=setInterval(()=>{mi++;if(mi<msgs.length)setLoadMsg(msgs[mi]);},2000);
    try {
      let weatherSummary = "Météo non disponible";
      try {
        const wRes = await fetch(`/api/weather?city=${encodeURIComponent(d.city)}`);
        const wData = await wRes.json();
        if (wData.list) {
          weatherSummary = wData.list.map((item, i) => {
            const day = DAYS[i] || `Jour ${i+1}`;
            const temp = Math.round(item.main.temp);
            const desc = item.weather[0].description;
            return `${day}: ${temp}°C, ${desc}`;
          }).join(" | ");
        }
      } catch(e) {
        weatherSummary = "Météo non disponible";
      }
      console.log("Météo récupérée :", weatherSummary);

      const prompt=`Tu es un coach sportif et nutritionniste vétérinaire expert. Génère un programme bien-être personnalisé.
PROFIL :
- Nom : ${d.name} | Race : ${breedName} | Âge : ${d.age} ans
- Poids actuel : ${d.weight} kg | Poids idéal : ${ideal} kg | Castré : ${d.neutered?"Oui":"Non"}
- Ville : ${d.city} | Logement : ${d.housing} | Dispo : ${d.time} min/j
- Météo de la semaine à ${d.city} : ${weatherSummary}
- Sexe : ${d.gender === "male" ? "Mâle" : "Femelle"}
- Statut reproducteur : ${d.reproStatus === "pregnant" ? "⚠️ GESTANTE — pas d'effort intense, nutrition renforcée obligatoire" : d.reproStatus === "nursing" ? "⚠️ ALLAITANTE — besoins caloriques très élevés, exercice léger uniquement" : "Non applicable"}
- Accès aquatique : ${d.waterAccess === "none" ? "Aucun" : d.waterAccess === "pool" ? "Piscine privée" : d.waterAccess === "lake_river" ? "Lac ou rivière" : "Plage"}
- Activités aquatiques souhaitées : ${d.waterActivities === "yes" ? "Oui" : "Non — ne jamais proposer d'activités aquatiques"}
- Activité actuelle : ${d.activity} | Objectifs : ${d.goals.join(" + ")}
- Sensibilités race : ${bi.s} | Croquettes : ${d.food||"non précisé"} | Ration : ${d.ration||"non précisée"} g/j

RÈGLES STRICTES — respecter sans exception :

1. Chaque activité doit être ultra-concrète et actionnable. Jamais vague.
   - ❌ "Stimulation mentale"
   - ✅ "Jeu du gobelet : cache une friandise sous 3 gobelets retournés, fais chercher le bon (10 min)"
   - ❌ "Jeux de rapport"
   - ✅ "Fetch avec balle : lance à 15m, commande rapport, récompense au retour (20 min)"
   - ❌ "Étirements"
   - ✅ "Étirements passifs : tiens la patte avant tendue 10 secondes x3, puis patte arrière x3 — aide à la récupération musculaire après effort"

2. Activités aquatiques : si waterActivities === "no", ne JAMAIS proposer natation, baignade, lac, rivière, piscine ou plage. Avoir accès à une piscine ou une plage ne signifie pas que l'utilisateur veut l'utiliser.

3. Stimulation mentale — utiliser UNIQUEMENT ces activités concrètes :
   - Tapis de léchage (étale de la pâtée sur un tapis à picots)
   - Jeu du gobelet (cache friandise sous gobelet retourné)
   - Kong congelé (rempli de croquettes + bouillon de légumes congelé)
   - Recherche olfactive (cache friandises dans différentes pièces)
   - Apprentissage d'un ordre nouveau (nom des jouets, "va chercher", "ferme la porte")
   - Parcours d'obstacles DIY (chaises, coussins, cartons)

4. Pour les races à fort instinct de travail (Malinois, Border Collie, Berger Allemand, Husky, Bouvier), inclure obligatoirement au moins 3 activités de stimulation mentale dans la semaine.

5. Adapter toutes les activités au logement : si appartement → aucune activité nécessitant un grand espace extérieur privé.

6. Si la femelle est gestante ou allaitante : programme doux uniquement, pas d'effort intense, pas de sauts, pas de course. Nutrition renforcée obligatoire dans les conseils.

7. La durée affichée doit être réaliste et inclure la préparation si nécessaire. Ex : "Kong congelé : 5 min de préparation la veille + 20 min d'occupation".

8. Adapter chaque jour du programme à la météo réelle :
   - Si température > 28°C : éviter les sorties entre 11h et 17h, mentionner les horaires dans breed_note
   - Si température < 5°C : réduire la durée des sorties pour les races sensibles au froid (Chihuahua, Yorkshire, Bouledogue)
   - Si pluie ou orage : proposer une alternative indoor concrète pour ce jour précis
   - Si beau temps et température idéale (15-25°C) : profiter pour augmenter légèrement la durée

Réponds UNIQUEMENT en JSON valide :
{"weekly_plan":[{"day":"Lundi","activity":"...","duration_min":25,"intensity":2,"is_rest":false,"breed_note":"..."}],"nutrition":{"daily_calories":1350,"recommended_ration_g":280,"current_ration_g":${d.ration||0},"reduction_pct":15,"treats_max_per_day":2,"water_ml":800,"note":"..."},"breed_tips":["conseil 1","conseil 2","conseil 3"],"weekly_goal":"Objectif semaine 1","estimated_weeks":12}`;

      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,messages:[{role:"user",content:prompt}]})
      });
      clearInterval(t);
      if(!res.ok) throw new Error("Erreur API "+res.status);
      const data=await res.json();
      const txt=data.content?.map(b=>b.text||"").join("")||"";
      const plan=parsePlan(txt);
      if(!plan) throw new Error("Format invalide");
      onComplete(d, plan);
    } catch(e) {
      clearInterval(t); setLoading(false);
      setErr(e.message||"Erreur. Réessaie.");
    }
  };

  if (loading) return (
    <div className="ld">
      <span className="ldog">🐕</span>
      <div className="lt">Génération en cours...</div>
      <p className="ls">{loadMsg}</p>
      <div className="dots"><div className="dot"/><div className="dot"/><div className="dot"/></div>
    </div>
  );

  return (
    <div className="ob">
      <div className="pbar"><div className="pfill" style={{width:`${pct[step]||0}%`}}/></div>

      {step===1&&<>
        <div className="slbl">Étape 1 sur 8</div>
        <div className="stitle">Comment s'appelle ton chien ?</div>
        <div className="ssub">On va créer un programme 100% personnalisé pour lui.</div>
        <div className="fg">
          <label className="flbl">Prénom</label>
          <input className="inp" placeholder="Ex: Rex, Luna, Max..." value={d.name}
            onChange={e=>upd({name:e.target.value})} autoFocus
            style={{fontSize:18,fontFamily:"'Fraunces',serif",fontWeight:800}}/>
        </div>
        <div className="snav">
          <button className="btn btn-g" onClick={()=>go(2)} disabled={!d.name.trim()}>Continuer →</button>
        </div>
      </>}

      {step===2&&<>
        <div className="slbl">Étape 2 sur 8</div>
        <div className="stitle">La race de {d.name} ?</div>
        <div className="ssub">Chaque race a des besoins différents. C'est là que la magie opère.</div>
        <div className="fg">
          <label className="flbl">Race</label>
          <select className="inp" value={d.breed} onChange={e=>upd({breed:e.target.value,custom:""})}>
            <option value="">Sélectionne une race...</option>
            {Object.keys(BREEDS).map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {d.breed==="Autre race"&&<div className="fg">
          <label className="flbl">Précise la race</label>
          <input className="inp" placeholder="Ex: Malinois, Samoyède..." value={d.custom||""}
            onChange={e=>upd({custom:e.target.value})} autoFocus/>
          <div className="hint">💡 L'IA adaptera le programme avec ces informations.</div>
        </div>}
        {d.breed&&d.breed!=="Autre race"&&<div className="an">🧬 <span>Sensibilités : <strong>{BREEDS[d.breed]?.s}</strong></span></div>}
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(1)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(3)} disabled={!d.breed||(d.breed==="Autre race"&&!d.custom?.trim())}>Continuer →</button>
        </div>
      </>}

      {step===3&&<>
        <div className="slbl">Étape 3 sur 8</div>
        <div className="stitle">Quel âge a {d.name} ?</div>
        <div className="ssub">L'âge influence l'intensité et les précautions.</div>
        <div className="rrow"><span className="flbl">Âge</span><span className="rval">{d.age} {d.age<=1?"an":"ans"}</span></div>
        <input type="range" min="0" max="18" value={d.age} onChange={e=>upd({age:parseInt(e.target.value)})}/>
        <div className="rsmall"><span>Chiot</span><span>Senior</span></div>
        <div style={{marginTop:16}}>
          <label className="flbl" style={{marginBottom:9,display:"block"}}>Sexe</label>
          <div className="opts c2">
            {[{v:"male",l:"Mâle",i:"🐕"},{v:"female",l:"Femelle",i:"🐩"}].map(o=>(
              <div key={o.v} className={`oc${d.gender===o.v?" sel":""}`} onClick={()=>upd({gender:o.v,reproStatus:o.v==="male"||d.neutered?"none":null})}>
                <span className="oi">{o.i}</span><div><div className="ot">{o.l}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop:16}}>
          <label className="flbl" style={{marginBottom:9,display:"block"}}>{d.gender==="female"?"Stérilisée ?":"Castré ?"}</label>
          <div className="opts c2">
            {[{v:true,l:"Oui",i:"✂️"},{v:false,l:"Non",i:d.gender==="female"?"🐩":"🐕"}].map(o=>(
              <div key={String(o.v)} className={`oc${d.neutered===o.v?" sel":""}`} onClick={()=>upd({neutered:o.v,reproStatus:o.v||d.gender!=="female"?"none":null})}>
                <span className="oi">{o.i}</span><div><div className="ot">{o.l}</div></div>
              </div>
            ))}
          </div>
        </div>
        {d.gender==="female"&&!d.neutered&&<div style={{marginTop:16}}>
          <label className="flbl" style={{marginBottom:9,display:"block"}}>Est-elle gestante ou allaitante ?</label>
          <div className="opts c3">
            {[{v:"pregnant",l:"Gestante",i:"🤰"},{v:"nursing",l:"Allaitante",i:"🍼"},{v:"none",l:"Non",i:"❌"}].map(o=>(
              <div key={o.v} className={`oc${d.reproStatus===o.v?" sel":""}`} onClick={()=>upd({reproStatus:o.v})}>
                <span className="oi">{o.i}</span><div><div className="ot">{o.l}</div></div>
              </div>
            ))}
          </div>
        </div>}
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(2)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(4)} disabled={!d.gender||(d.gender==="female"&&!d.neutered&&d.reproStatus===null)}>Continuer →</button>
        </div>
      </>}

      {step===4&&<>
        <div className="slbl">Étape 4 sur 8</div>
        <div className="stitle">Le poids de {d.name} ?</div>
        <div className="ssub">Poids idéal estimé pour {breedName} : {bi.ideal[0]}–{bi.ideal[1]} kg.</div>
        <div className="rrow"><span className="flbl">Poids actuel</span><span className="rval">{d.weight} kg</span></div>
        <input type="range" min="1" max="80" step="0.5" value={d.weight} onChange={e=>upd({weight:parseFloat(e.target.value)})}/>
        <div className="wi">{d.weight-ideal>0?`⚠️ ${d.name} est en surpoids de +${(d.weight-ideal).toFixed(1)} kg`:`✅ ${d.name} est dans la fourchette idéale`}</div>
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(3)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(5)}>Continuer →</button>
        </div>
      </>}

      {step===5&&<>
        <div className="slbl">Étape 5 sur 8</div>
        <div className="stitle">Où vit {d.name} ?</div>
        <div className="ssub">La ville permet d'adapter les sorties à la météo.</div>
        <div className="fg">
          <label className="flbl">Ta ville</label>
          <input className="inp" placeholder="Ex: Paris, Lyon, Marseille..." value={d.city||""}
            onChange={e=>upd({city:e.target.value})} autoFocus/>
          <div className="hint">🌤️ Pour adapter les sorties selon la météo</div>
        </div>
        <label className="flbl" style={{marginBottom:9,display:"block"}}>Logement</label>
        <div className="opts">
          {housings.map(h=>(
            <div key={h.v} className={`oc${d.housing===h.v?" sel":""}`} onClick={()=>upd({housing:h.v})}>
              <span className="oi">{h.icon}</span>
              <div><div className="ot">{h.v}</div><div className="od">{h.desc}</div></div>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <label className="flbl" style={{marginBottom:9,display:"block"}}>Accès à un espace aquatique ?</label>
          <div className="opts">
            {[{v:"pool",l:"Piscine privée",i:"🏊"},{v:"lake_river",l:"Lac ou rivière à proximité",i:"🏞️"},{v:"beach",l:"Plage à proximité",i:"🏖️"},{v:"none",l:"Aucun accès",i:"❌"}].map(o=>(
              <div key={o.v} className={`oc${d.waterAccess===o.v?" sel":""}`} onClick={()=>upd({waterAccess:o.v,waterActivities:o.v==="none"?"no":null})}>
                <span className="oi">{o.i}</span><div><div className="ot">{o.l}</div></div>
              </div>
            ))}
          </div>
        </div>
        {d.waterAccess&&d.waterAccess!=="none"&&<div style={{marginTop:16}}>
          <label className="flbl" style={{marginBottom:9,display:"block"}}>Inclure des activités aquatiques ?</label>
          <div className="opts c2">
            {[{v:"yes",l:"Oui, mon chien adore l'eau",i:"✅"},{v:"no",l:"Non, on préfère éviter",i:"❌"}].map(o=>(
              <div key={o.v} className={`oc${d.waterActivities===o.v?" sel":""}`} onClick={()=>upd({waterActivities:o.v})}>
                <span className="oi">{o.i}</span><div><div className="ot">{o.l}</div></div>
              </div>
            ))}
          </div>
        </div>}
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(4)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(6)} disabled={!d.city?.trim()||!d.housing||!d.waterAccess||(d.waterAccess!=="none"&&!d.waterActivities)}>Continuer →</button>
        </div>
      </>}

      {step===6&&<>
        <div className="slbl">Étape 6 sur 8</div>
        <div className="stitle">Niveau d'activité de {d.name}</div>
        <div className="ssub">Sois honnête — pour un programme réaliste et progressif.</div>
        {ACTS.map(a=>(
          <div key={a.v} className={`ac${d.activity===a.v?" sel":""}`} onClick={()=>upd({activity:a.v})}>
            <div className="ah">
              <span className="ai">{a.icon}</span>
              <span className="at">{a.title}</span>
              <Tip text={a.tip}/>
            </div>
            {a.ex.map((e,i)=><div key={i} className="aex"><span style={{color:"var(--a)"}}>·</span><span>{e}</span></div>)}
          </div>
        ))}
        <div style={{marginTop:16}}>
          <div className="rrow"><label className="flbl">Ta disponibilité quotidienne</label><span className="rval">{d.time} min/j</span></div>
          <input type="range" min="10" max="120" step="5" value={d.time} onChange={e=>upd({time:parseInt(e.target.value)})}/>
          <div className="rsmall"><span>10 min</span><span>2h+</span></div>
        </div>
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(5)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(7)} disabled={!d.activity}>Continuer →</button>
        </div>
      </>}

      {step===7&&<>
        <div className="slbl">Étape 7 sur 8</div>
        <div className="stitle">Objectifs pour {d.name}</div>
        <div className="ssub">Le programme sera adapté en conséquence.</div>
        <div className="mh">✓ Tu peux sélectionner plusieurs objectifs</div>
        <div className="opts c2">
          {GOALS.map(g=>{
            const sel=d.goals.includes(g.v);
            return (
              <div key={g.v} className={`oc${sel?" msel":""}`} onClick={()=>toggleGoal(g.v)}
                style={{flexDirection:"column",alignItems:"flex-start",position:"relative"}}>
                {sel&&<div className="chk">✓</div>}
                <span className="oi">{g.icon}</span>
                <div className="ot">{g.v}</div>
                <div className="od">{g.desc}</div>
              </div>
            );
          })}
        </div>
        {d.goals.length>=2&&<div className="an" style={{marginTop:11}}>🤖 <span>Combinaison : <strong>{d.goals.join(" + ")}</strong></span></div>}
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(6)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(8)} disabled={!d.goals.length}>Continuer →</button>
        </div>
      </>}

      {step===8&&<>
        <div className="slbl">Étape 8 sur 8</div>
        <div className="stitle">Nutrition actuelle</div>
        <div className="ssub">Optionnel mais recommandé pour des conseils précis.</div>
        <div className="fg">
          <label className="flbl">Marque de croquettes</label>
          <input className="inp" placeholder="Ex: Royal Canin, Hills, Purina..." value={d.food} onChange={e=>upd({food:e.target.value})}/>
        </div>
        <div className="fg">
          <label className="flbl">Ration actuelle (g / jour)</label>
          <input className="inp" type="number" placeholder="Ex: 300" value={d.ration} onChange={e=>upd({ration:e.target.value})}/>
        </div>
        <div className="an">🤖 <span>L'IA va générer le programme de {d.name} à {d.city}. ~15 secondes.</span></div>
        {err&&<div className="err">❌ {err}</div>}
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(7)}>← Retour</button>
          <button className="btn btn-g" onClick={generate}>Générer le programme 🚀</button>
        </div>
      </>}
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ profile, plan, onReset }) {
  const [tab, setTab] = useState("semaine");
  const [done, setDone] = useState({});
  const [weights, setWeights] = useState([{date: today(), weight: profile.weight}]);
  const [photos, setPhotos] = useState({});
  const [notifs, setNotifs] = useState({morning:false,evening:false,weekly:false,weight:false});
  const [recaps, setRecaps] = useState({});
  const [doneHistory, setDoneHistory] = useState({});
  const [hardWeekLoading, setHardWeekLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(plan);

  const bi = BREEDS[profile.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const breedName = profile.breed==="Autre race"?(profile.custom||profile.breed):profile.breed;
  const currentWeek = profile.currentWeek || 1;
  const doneCount = Object.values(done).filter(Boolean).length;

  // Load persisted data
  useEffect(()=>{
    Promise.all([
      load("lgb_done"),load("lgb_weights"),load("lgb_photos"),
      load("lgb_notifs"),load("lgb_recaps"),load("lgb_doneHistory")
    ]).then(([d,w,p,n,r,dh])=>{
      if(d) setDone(d);
      if(w) setWeights(w);
      if(p) setPhotos(p);
      if(n) setNotifs(n);
      if(r) setRecaps(r);
      if(dh) setDoneHistory(dh);
    });
  },[]);

  const toggleDone = useCallback(async (i)=>{
    const next = {...done,[i]:!done[i]};
    setDone(next);
    await save("lgb_done",next);
  },[done]);

  const addWeight = useCallback(async (entry)=>{
    const next=[...weights,entry];
    setWeights(next);
    await save("lgb_weights",next);
  },[weights]);

  const handlePhoto = useCallback(async (type,data)=>{
    const next={...photos,[type]:data};
    setPhotos(next);
    await save("lgb_photos",next);
  },[photos]);

  const toggleNotif = useCallback(async (key,val)=>{
    if(val && "Notification" in window) {
      Notification.requestPermission().then(p=>{
        if(p==="granted") { new Notification(`LetsGoBoy — ${profile.name}`,{body:"Les rappels sont activés 🐾",icon:"🐕"}); }
      });
    }
    const next={...notifs,[key]:val};
    setNotifs(next);
    await save("lgb_notifs",next);
  },[notifs,profile.name]);

  const generateBilan = useCallback(async (weekNum)=>{
    if(weekNum==="new") {
      // Save current week done to history
      const newHistory={...doneHistory,[currentWeek]:done};
      setDoneHistory(newHistory);
      setDone({});
      await save("lgb_done",{});
      await save("lgb_doneHistory",newHistory);
      // Update profile week... simplified here
      return;
    }
    const weekDone=doneHistory[weekNum]||done;
    const doneCount=Object.values(weekDone).filter(Boolean).length;
    const lastW=weights[weights.length-1];
    const prompt=`Tu es un coach vétérinaire bienveillant. Génère un bilan de semaine pour ce chien.

Chien : ${profile.name} (${breedName}, ${profile.age} ans)
Semaine ${weekNum} — Activités réalisées : ${doneCount}/7
Dernier poids : ${lastW?.weight||profile.weight} kg (objectif : ${ideal} kg)
Objectifs : ${(profile.goals||[]).join(", ")}

Écris un bilan encourageant de 3-4 phrases en français. Sois précis, positif et donne 1 conseil concret pour la semaine suivante. Maximum 80 mots.`;

    const res=await fetch("/api/chat",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,messages:[{role:"user",content:prompt}]})
    });
    if(!res.ok) return;
    const data=await res.json();
    const txt=data.content?.map(b=>b.text||"").join("")||"";
    const next={...recaps,[weekNum]:txt};
    setRecaps(next);
    await save("lgb_recaps",next);
  },[doneHistory,done,weights,profile,breedName,ideal,recaps,currentWeek]);

  const handleHardWeek = async ()=>{
    setHardWeekLoading(true);
    const prompt=`Tu es un coach vétérinaire compréhensif. Cette semaine a été difficile pour ${profile.name} (${breedName}, ${profile.age} ans).
Le propriétaire n'a pu faire que ${doneCount}/7 activités.
Génère un programme adapté de 7 jours plus léger et progressif.
Objectifs : ${(profile.goals||[]).join(", ")}
Disponibilité : ${profile.time} min/j
Réponds UNIQUEMENT en JSON :
{"weekly_plan":[{"day":"Lundi","activity":"...","duration_min":20,"intensity":1,"is_rest":false,"breed_note":"..."}],"nutrition":{"daily_calories":1300,"recommended_ration_g":260,"current_ration_g":0,"reduction_pct":10,"treats_max_per_day":2,"water_ml":800,"note":"..."},"breed_tips":["reprends progressivement","sois patient"],"weekly_goal":"Semaine de reprise douce","estimated_weeks":14}`;

    try {
      const res=await fetch("/api/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompt}]})
      });
      if(res.ok){
        const data=await res.json();
        const txt=data.content?.map(b=>b.text||"").join("")||"";
        const newPlan=parsePlan(txt);
        if(newPlan){setCurrentPlan(newPlan);setDone({});}
      }
    } finally { setHardWeekLoading(false); }
  };

  const tabs=[
    {k:"semaine",icon:"📅",label:"Semaine"},
    {k:"programme",icon:"🏃",label:"Programme"},
    {k:"suivi",icon:"📊",label:"Suivi"},
    {k:"bilan",icon:"🏆",label:"Bilan"},
    {k:"veto",icon:"🏥",label:"Véto"},
  ];

  return (
    <div className="dash">
      <div className="dhead">
        <div className="dhead-top">
          <div className="dog-info">
            <h2>Bonjour, {profile.name} 🐾</h2>
            <p>{breedName} · {profile.age} ans · {profile.city}</p>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              <span className="week-badge">Semaine {currentWeek}</span>
              <span style={{fontSize:12,opacity:.8}}>{doneCount}/7 activités ✓</span>
            </div>
          </div>
          <div className="dog-avatar">🐕</div>
        </div>
        <div className="tabs">
          {tabs.map(t=>(
            <button key={t.k} className={`tab${tab===t.k?" active":""}`} onClick={()=>setTab(t.k)}>
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dcontent">
        {tab==="semaine"&&(
          <TabSemaine plan={currentPlan} profile={profile} done={done}
            onToggle={toggleDone} onHardWeek={handleHardWeek}
            notifs={notifs} onToggleNotif={toggleNotif} currentWeek={currentWeek}/>
        )}

        {tab==="programme"&&(
          <div>
            <div className="ph">
              <div className="pbadge">Programme Semaine {currentWeek}</div>
              <div className="pname">Plan de {profile.name}</div>
              <div className="psub">{currentPlan?.weekly_goal}</div>
              <div className="pstats">
                <div className="pst">⚖️ {profile.weight}kg → {ideal}kg</div>
                <div className="pst">🎯 {(profile.goals||[]).join(" + ")}</div>
                <div className="pst">📅 ~{currentPlan?.estimated_weeks}sem</div>
              </div>
            </div>

            <div className="sect">🏃 Les 7 jours</div>
            <div className="dg">
              {currentPlan?.weekly_plan?.map((day,i)=>(
                <div key={i} className={`dc${day.is_rest?" rest":""}${done[i]?" done":""}`}>
                  <div className="dn">{done[i]?"✓":i+1}</div>
                  <div className="dct">
                    <div className="dnm">{DAYS[i]}</div>
                    <div className="da">{day.activity}</div>
                    <div style={{display:"flex",alignItems:"center",marginTop:3}}>
                      <span className="dd">{day.duration_min} min</span>
                      {!day.is_rest&&<IDots n={day.intensity}/>}
                    </div>
                    {day.breed_note&&<div className="dnote">💡 {day.breed_note}</div>}
                  </div>
                  {!day.is_rest&&(
                    <button className={`check-btn${done[i]?" checked":""}`} onClick={()=>toggleDone(i)}>
                      {done[i]?"✓":""}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="sect">🍗 Plan nutritionnel</div>
            <div className="nc">
              <div className="nr"><div className="nk">🔥 Calories/jour</div><div className="nv hl">{currentPlan?.nutrition?.daily_calories} kcal</div></div>
              <div className="nr"><div className="nk">🥣 Ration recommandée</div><div className="nv gr">{currentPlan?.nutrition?.recommended_ration_g} g/j</div></div>
              {currentPlan?.nutrition?.reduction_pct>0&&<div className="nr"><div className="nk">📉 Réduction</div><div className="nv" style={{color:"var(--a)"}}>-{currentPlan.nutrition.reduction_pct}%</div></div>}
              <div className="nr"><div className="nk">🦴 Treats max/jour</div><div className="nv">{currentPlan?.nutrition?.treats_max_per_day}</div></div>
              <div className="nr"><div className="nk">💧 Eau recommandée</div><div className="nv">{currentPlan?.nutrition?.water_ml} ml</div></div>
              {currentPlan?.nutrition?.note&&<div style={{marginTop:10,padding:"9px 12px",background:"var(--ap)",borderRadius:8,fontSize:11,color:"var(--tm)",fontStyle:"italic"}}>💡 {currentPlan.nutrition.note}</div>}
            </div>

            {currentPlan?.breed_tips?.length>0&&(
              <>
                <div className="sect">🧬 Conseils — {breedName}</div>
                <div className="tc">{currentPlan.breed_tips.map((t,i)=><div key={i} className="ti2"><span>🐾</span><span>{t}</span></div>)}</div>
              </>
            )}
          </div>
        )}

        {tab==="suivi"&&(
          <TabSuivi profile={profile} weights={weights} onAddWeight={addWeight}
            photos={photos} onPhoto={handlePhoto}/>
        )}

        {tab==="bilan"&&(
          <TabBilan profile={{...profile,currentWeek}} plan={currentPlan}
            recaps={recaps} onGenerateBilan={generateBilan}
            doneHistory={doneHistory} weights={weights}/>
        )}

        {tab==="veto"&&(
          <TabVeto profile={profile} plan={currentPlan} weights={weights}/>
        )}

        <div style={{marginTop:24}}>
          <button className="rb" onClick={onReset}>← Créer un programme pour un autre chien</button>
        </div>
      </div>
    </div>
  );
}

// ─── HERO ────────────────────────────────────────────────────────────────
function Hero({ onStart }) {
  return (
    <div className="hero">
      <div className="pill">Programme bien-être IA pour chiens</div>
      <h1>Ton chien mérite<br/>d'être <em>au top</em>.</h1>
      <p className="sub">Programme personnalisé exercice + nutrition, généré par IA en 3 min. Adapté à la race, l'âge et le mode de vie.</p>
      <div className="stats">
        <div><div className="sn">59%</div><div className="sl">des chiens en surpoids</div></div>
        <div><div className="sn">200+</div><div className="sl">races supportées</div></div>
        <div><div className="sn">2,5 ans</div><div className="sl">de vie gagnés</div></div>
      </div>
      <button className="btn btn-g" onClick={onStart} style={{fontSize:15,padding:"14px 34px"}}>
        Créer le programme de mon chien 🐾
      </button>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────
export default function App() {
  const [scr, setScr] = useState("hero");
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);

  // Try to restore session
  useEffect(()=>{
    Promise.all([load("lgb_profile"),load("lgb_plan")]).then(([p,pl])=>{
      if(p&&pl){setProfile(p);setPlan(pl);setScr("dashboard");}
    });
  },[]);

  const handleComplete = async (profileData, planData) => {
    const p={...profileData,currentWeek:1};
    setProfile(p); setPlan(planData); setScr("dashboard");
    await save("lgb_profile",p);
    await save("lgb_plan",planData);
  };

  const handleReset = async () => {
    setScr("hero"); setProfile(null); setPlan(null);
    try{await window.storage.delete("lgb_profile");await window.storage.delete("lgb_plan");}catch{}
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="nav">
          <div className="logo">Let's<span>Go</span>Boy</div>
          <div className="badge">BETA</div>
        </nav>
        {scr==="hero"&&<Hero onStart={()=>setScr("onboarding")}/>}
        {scr==="onboarding"&&<Onboarding onComplete={handleComplete}/>}
        {scr==="dashboard"&&profile&&plan&&<Dashboard profile={profile} plan={plan} onReset={handleReset}/>}
      </div>
    </>
  );
}
