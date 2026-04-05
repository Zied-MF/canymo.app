"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from '../lib/supabase';

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
  {v:"Prise de poids",icon:"🍖",desc:"Atteindre un poids idéal en augmentant la masse musculaire"},
];
const DAYS=["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const DAYS_SHORT=["L","M","M","J","V","S","D"];

// ─── ADMIN WHITELIST ────────────────────────────────────────────────────────
const ADMIN_EMAILS = [
  'zieed.fekih@gmail.com',
  'zied.fekih@hotmail.com',
];
const checkIsPro = (userEmail, subscription) => {
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) return true;
  return !!(subscription && subscription.status === 'active' && subscription.plan === 'pro');
};

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
.btn-red{background:#DC2626;color:#fff}
.btn-sm{padding:8px 16px;font-size:12px}

/* ONBOARDING */
.ob{max-width:500px;margin:0 auto;padding:26px 22px 60px;animation:fu .3s ease}
@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.pbar{width:100%;height:6px;background:#E5E7EB;border-radius:10px;margin-top:8px;margin-bottom:28px;overflow:hidden}
.pfill{height:100%;background:#2D6444;border-radius:10px;transition:width .3s ease}
.ob-prog{margin-bottom:4px}
.ob-prog-lbl{font-size:11px;color:#6B7280;text-align:center;margin-bottom:6px}
.slbl{display:none}
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
.opts.c3{grid-template-columns:1fr 1fr 1fr}
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
.an{background:var(--gl);border-radius:12px;padding:16px 18px;font-size:14px;color:var(--gm);display:flex;align-items:flex-start;gap:9px;margin-bottom:20px;font-weight:500;line-height:1.8}
.rrow{display:flex;justify-content:space-between;margin-bottom:5px}
.rval{font-family:'Fraunces',serif;font-size:17px;font-weight:800;color:var(--a)}
.rsmall{font-size:11px;color:var(--ts);display:flex;justify-content:space-between;margin-top:2px}
input[type=range]{width:100%;height:5px;border-radius:3px;background:var(--cd);outline:none;-webkit-appearance:none;cursor:pointer;margin:9px 0}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:var(--a);box-shadow:0 2px 6px rgba(232,130,12,.4);cursor:pointer}
.snav{display:flex;gap:9px;margin-top:22px}
.snav .btn{flex:1;justify-content:center}
.chk{position:absolute;top:8px;right:8px;background:var(--gm);color:#fff;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
.err{background:#FEF2F2;border:1.5px solid #FCA5A5;border-radius:10px;padding:11px 15px;font-size:12px;color:#DC2626;line-height:1.5;margin-top:11px}
.warn-box{background:#FFFBEB;border:1.5px solid #FCD34D;border-radius:12px;padding:14px 16px;font-size:12px;color:#92400E;line-height:1.6;display:flex;align-items:flex-start;gap:9px;margin-top:16px}
/* AUTH STEP */
.auth-tabs{display:flex;background:#F3F4F6;border-radius:10px;padding:3px;margin-bottom:20px;gap:3px}
.auth-tab{flex:1;padding:9px;border:none;border-radius:8px;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:#6B7280;cursor:pointer;transition:all .2s}
.auth-tab.active{background:#fff;color:#1C3D2A;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.auth-success{background:#D1FAE5;border-radius:8px;padding:16px;color:#065F46;font-size:13px;line-height:1.7;margin-bottom:16px}
.auth-reset-ok{background:#DBEAFE;border-radius:8px;padding:12px 16px;color:#1E40AF;font-size:12px;line-height:1.6;margin-bottom:12px}
.link-btn{background:none;border:none;color:#2D6444;font-size:12px;font-weight:600;cursor:pointer;text-decoration:underline;font-family:'DM Sans',sans-serif;padding:0}
.google-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;border:1.5px solid #E5E7EB;border-radius:8px;padding:11px 16px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:#1A1209;cursor:pointer;transition:box-shadow .2s;margin-bottom:16px}
.google-btn:hover{box-shadow:0 2px 8px rgba(0,0,0,.12)}
.google-btn:disabled{opacity:.5;cursor:not-allowed}
.auth-sep{display:flex;align-items:center;gap:10px;margin-bottom:16px;color:#9CA3AF;font-size:12px}
.auth-sep::before,.auth-sep::after{content:"";flex:1;height:1px;background:#E5E7EB}
.goal-warn{background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;padding:12px 14px;font-size:12px;color:#92400E;line-height:1.6;margin-bottom:12px}
.warn-box-icon{font-size:15px;flex-shrink:0;margin-top:1px}

/* LOADING */
.ld{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#FFFAF4;padding:40px 28px;text-align:center;animation:fu .4s ease}
.ld-spinner{width:64px;height:64px;border:5px solid #E8F2EC;border-top-color:#1C3D2A;border-radius:50%;animation:spin .9s linear infinite;margin:0 auto 24px}
@keyframes spin{to{transform:rotate(360deg)}}
.lt{font-family:'Fraunces',serif;font-size:20px;font-weight:800;color:#1C3D2A;margin-bottom:10px;line-height:1.3}
.ls{font-size:13px;color:#4A3728;line-height:1.6;min-height:20px;transition:opacity .3s}
.ld-countdown{margin-top:22px;font-size:12px;font-weight:600;color:#2D6444;background:#E8F2EC;padding:7px 18px;border-radius:20px;display:inline-block}
.dot:nth-child(3){animation-delay:.4s}
@keyframes pu{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}

/* DASHBOARD */
.dash{display:flex;flex-direction:column;flex:1;animation:fu .3s ease}

/* HOME HEADER */
.home-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px}
.home-greeting{font-family:'Fraunces',serif;font-size:26px;font-weight:900;color:var(--g);line-height:1.1}
.home-sub{font-size:13px;color:var(--ts);margin-top:5px;line-height:1.5}
.home-avatar{width:46px;height:46px;border-radius:50%;background:var(--g);color:#fff;font-family:'Fraunces',serif;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0}

/* PROFILE CARD */
.profile-card{background:#1C3D2A;border-radius:16px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;color:#fff}
.pc-left{display:flex;align-items:center;gap:12px}
.pc-emoji{font-size:28px;line-height:1}
.pc-name{font-family:'Fraunces',serif;font-size:18px;font-weight:900;line-height:1.1}
.pc-info{font-size:12px;opacity:.75;margin-top:3px}
.pc-badge{background:rgba(255,255,255,.18);color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;white-space:nowrap;flex-shrink:0}
.pc-badge.warn{background:#DC2626}
.pc-badge.under{background:#F59E0B}

/* MINI CARDS */
.mini-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.mini-card{background:#fff;border-radius:14px;padding:14px 8px;text-align:center;box-shadow:0 2px 8px rgba(26,18,9,.06);border:1px solid var(--cd)}
.mc-icon{font-size:20px;margin-bottom:6px;line-height:1}
.mc-val{font-family:'Fraunces',serif;font-size:19px;font-weight:900;color:var(--g);line-height:1}
.mc-unit{font-size:10px;font-weight:600;color:var(--ts);margin-left:1px}
.mc-lbl{font-size:10px;color:var(--ts);font-weight:600;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}

/* PROGRESS CARD */
.prog-card{background:#fff;border-radius:14px;padding:14px 16px;margin-bottom:14px;border:1px solid var(--cd);box-shadow:0 2px 8px rgba(26,18,9,.06)}
.prog-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.prog-title{font-size:13px;font-weight:600;color:var(--tx)}
.prog-count{font-family:'Fraunces',serif;font-size:15px;font-weight:900;color:#B8880A}
.prog-bar{height:8px;background:#E4E8E4;border-radius:10px;overflow:hidden}
.prog-fill{height:100%;background:linear-gradient(90deg,#1C3D2A,#8A9A28);border-radius:10px;transition:width .5s ease}

/* CONSEIL CARD */
.conseil-card{background:#EEF5EF;border-radius:14px;padding:14px 16px;margin-bottom:18px;border:1px solid rgba(45,100,68,.15)}
.cc-title{font-size:13px;font-weight:700;color:var(--tx);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.cc-bullets{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.cc-bullet{font-size:13px;color:var(--tm);line-height:1.6;padding-left:16px;position:relative}
.cc-bullet::before{content:"•";position:absolute;left:0;color:var(--a);font-weight:900;font-size:14px;line-height:1.4}

/* PROGRAMME LINK BUTTON */
.prog-link{display:flex;align-items:center;justify-content:space-between;background:#fff;border-radius:14px;padding:14px 16px;border:1px solid var(--cd);box-shadow:0 2px 8px rgba(26,18,9,.06);cursor:pointer;transition:all .2s;margin-bottom:16px}
.prog-link:hover{border-color:var(--al);box-shadow:var(--sh)}
.prog-link-left{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--tx)}
.prog-link-chevron{font-size:16px;color:var(--ts);transition:transform .2s}
.prog-link.open .prog-link-chevron{transform:rotate(90deg)}

/* LAYOUT */
.dash{padding-top:52px}
.dash-layout{display:flex;flex:1;overflow:hidden}
.dash-main{flex:1;overflow-y:auto;padding:18px 22px 86px}

/* ADD DOG BANNER */
.add-dog-banner{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #E5E7EB;padding:14px 22px;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;font-size:13px;font-weight:600;color:#2D6444;box-shadow:0 -2px 10px rgba(0,0,0,.06);transition:background .2s;z-index:100}
.add-dog-banner:hover{background:#F0FDF4}

/* LOADING SCREEN */
.splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#FFFAF4;gap:18px}
.splash-logo{font-family:'Fraunces',serif;font-size:36px;font-weight:900;color:#1C3D2A}
.splash-logo em{color:#E8820C;font-style:italic}
.splash-sub{font-size:14px;color:#9A8070}

/* WELCOME SCREEN */
.welcome{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;background:#FFFAF4;text-align:center}
.welcome-icon{font-size:64px;margin-bottom:16px}
.welcome-title{font-family:'Fraunces',serif;font-size:30px;font-weight:900;color:#1C3D2A;margin-bottom:10px;line-height:1.15}
.welcome-sub{font-size:16px;color:#6B7280;margin-bottom:40px;max-width:300px;line-height:1.6}
.welcome-btns{width:100%;max-width:320px;display:flex;flex-direction:column;gap:14px}
.welcome-btn-primary{background:#2D6444;color:#fff;border:none;border-radius:14px;padding:17px 24px;font-size:16px;font-weight:700;cursor:pointer;width:100%;transition:background .2s}
.welcome-btn-primary:hover{background:#1C3D2A}
.welcome-btn-secondary{background:transparent;color:#2D6444;border:2px solid #2D6444;border-radius:14px;padding:15px 24px;font-size:16px;font-weight:600;cursor:pointer;width:100%;transition:all .2s}
.welcome-btn-secondary:hover{background:#E8F2EC}

/* LOGIN SCREEN */
.login{min-height:100vh;background:#FFFAF4;padding:20px 22px 40px;max-width:480px;margin:0 auto}
.login-back{background:none;border:none;font-size:22px;cursor:pointer;color:#1C3D2A;padding:0;margin-bottom:24px;display:block;line-height:1}
.login-title{font-family:'Fraunces',serif;font-size:26px;font-weight:900;color:#1C3D2A;margin-bottom:28px}
.login-err{background:#FEE2E2;color:#DC2626;border-radius:10px;padding:12px 14px;font-size:14px;margin-bottom:14px}
.login-sep{display:flex;align-items:center;gap:10px;margin:20px 0}
.login-sep-line{flex:1;height:1px;background:#E5E7EB}
.login-sep-txt{font-size:13px;color:#9A8070}
.login-google{width:100%;background:#fff;color:#1A1209;border:1.5px solid #E5E7EB;border-radius:12px;padding:14px;font-size:15px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:background .2s}
.login-google:hover{background:#F9FAFB}
.login-forgot{text-align:center;margin-top:20px}
.login-forgot button{background:none;border:none;color:#2D6444;cursor:pointer;font-size:14px;text-decoration:underline}

/* INSTALL BANNER */
.install-banner{position:fixed;bottom:0;left:0;right:0;background:#fff;border-radius:12px 12px 0 0;padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 -4px 20px rgba(0,0,0,.12);z-index:150}
.install-icon{font-size:26px;flex-shrink:0}
.install-text{flex:1;font-size:14px;font-weight:600;color:#1C3D2A;line-height:1.3}
.install-btn{background:#2D6444;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}
.install-close{background:none;border:none;font-size:20px;color:#9A8070;cursor:pointer;padding:0 4px;flex-shrink:0;line-height:1}
.install-modal-wrap{position:fixed;inset:0;z-index:400;display:flex;align-items:flex-end;justify-content:center}
.install-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4)}
.install-modal{position:relative;z-index:1;background:#fff;border-radius:16px 16px 0 0;padding:28px 24px 36px;width:100%;max-width:480px}
.install-modal-title{font-family:'Fraunces',serif;font-size:20px;font-weight:900;color:#1C3D2A;margin-bottom:20px}
.install-os{margin-bottom:22px}
.install-os-title{font-size:13px;font-weight:700;color:#9A8070;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px}
.install-steps{display:flex;flex-direction:column;gap:10px}
.install-step{display:flex;align-items:flex-start;gap:10px;font-size:15px;color:#1C3D2A;line-height:1.6}
.install-step-num{width:24px;height:24px;border-radius:50%;background:#2D6444;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.install-modal-close{width:100%;background:#F0E6D3;border:none;border-radius:10px;padding:13px;font-size:15px;font-weight:700;color:#1C3D2A;cursor:pointer;margin-top:8px}

/* PAYWALL */
.paywall-wrap{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:24px}
.paywall-blur{position:fixed;inset:0;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);background:rgba(0,0,0,.45)}
.paywall-card{position:relative;z-index:1;background:#FFFAF4;border-radius:16px;padding:28px 24px;max-width:400px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,.18);text-align:center}
.paywall-icon{font-size:36px;margin-bottom:12px}
.paywall-title{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:#1C3D2A;margin-bottom:8px}
.paywall-sub{font-size:14px;color:#4A3728;margin-bottom:20px;line-height:1.5}
.paywall-list{text-align:left;background:#fff;border:1.5px solid #E5E7EB;border-radius:12px;padding:14px 16px;margin-bottom:20px;display:flex;flex-direction:column;gap:8px}
.paywall-list li{list-style:none;font-size:14px;color:#1A1209;line-height:1.4}
.paywall-cta{width:100%;background:#2D6444;color:#fff;border:none;border-radius:12px;padding:15px;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:8px;transition:background .2s}
.paywall-cta:hover{background:#1C3D2A}
.paywall-hint{font-size:12px;color:#6B7280;margin-bottom:16px}
.paywall-skip{background:none;border:none;color:#9A8070;font-size:13px;cursor:pointer;text-decoration:underline;padding:4px}
.paywall-skip:hover{color:#4A3728}
.pro-badge{display:inline-block;background:#2D6444;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;margin-left:6px;vertical-align:middle;letter-spacing:.5px}

/* DOG SELECT SCREEN */
.dog-select{max-width:480px;margin:0 auto;padding:40px 22px 32px}
.dog-select-title{font-family:'Fraunces',serif;font-size:24px;font-weight:900;color:var(--g);margin-bottom:6px;text-align:center}
.dog-select-sub{font-size:13px;color:var(--ts);text-align:center;margin-bottom:28px}
.dog-list{display:flex;flex-direction:column;gap:12px;margin-bottom:8px}
.dog-card{background:#fff;border:1.5px solid var(--cd);border-radius:12px;padding:16px 18px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .2s;box-shadow:0 1px 4px rgba(26,18,9,.06)}
.dog-card:hover{border-color:#2D6444;box-shadow:0 4px 12px rgba(45,100,68,.12)}
.dog-card-avatar{width:44px;height:44px;border-radius:50%;background:var(--g);color:#fff;font-family:'Fraunces',serif;font-size:18px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dog-card-info{flex:1}
.dog-card-name{font-weight:700;font-size:15px;color:var(--tx);margin-bottom:2px}
.dog-card-meta{font-size:12px;color:var(--ts)}
.dog-card-goal{display:inline-block;margin-top:5px;background:var(--gl);color:var(--gm);font-size:10px;font-weight:700;padding:2px 9px;border-radius:20px}
.dog-card-arrow{font-size:20px;color:var(--ts)}

/* ACCOUNT SCREEN */
.acct{max-width:480px;margin:0 auto;padding:24px 22px 40px}
.acct-header{display:flex;align-items:center;gap:14px;margin-bottom:28px}
.acct-back{background:none;border:none;font-size:20px;cursor:pointer;color:var(--tx);padding:0;line-height:1}
.acct-title{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:var(--g)}
.acct-section{margin-bottom:28px}
.acct-section-title{font-size:11px;font-weight:700;color:var(--ts);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.acct-avatar{width:60px;height:60px;border-radius:50%;background:#2D6444;color:#fff;font-family:'Fraunces',serif;font-size:24px;font-weight:900;display:flex;align-items:center;justify-content:center;margin:0 auto 18px}
.acct-card{background:#fff;border:1.5px solid var(--cd);border-radius:14px;overflow:hidden}
.acct-row{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid var(--cd)}
.acct-row:last-child{border-bottom:none}
.acct-row-label{font-size:13px;color:var(--ts);font-weight:500}
.acct-row-val{font-size:13px;color:var(--tx);font-weight:600}
.acct-row-val.muted{color:var(--ts)}
.acct-inp{width:100%;border:none;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--tx);font-weight:600;background:transparent;outline:none;text-align:right}
.acct-inp::placeholder{color:var(--ts)}
.acct-btn-signout{width:100%;padding:12px;border:1.5px solid #DC2626;border-radius:10px;background:transparent;color:#DC2626;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.acct-btn-signout:hover{background:#FEF2F2}
.acct-delete{text-align:center;margin-top:24px}
.acct-delete-link{background:none;border:none;font-size:12px;color:var(--ts);cursor:pointer;text-decoration:underline;font-family:'DM Sans',sans-serif}
.acct-delete-confirm{background:#FEF2F2;border:1.5px solid #FCA5A5;border-radius:10px;padding:14px;font-size:12px;color:#DC2626;line-height:1.6;margin-top:12px}
.dash-avatar{width:30px;height:30px;border-radius:50%;background:#2D6444;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-family:'DM Sans',sans-serif}
.drawer-account{display:flex;align-items:center;gap:10px;padding:12px 16px;border-top:1px solid var(--cd);margin-top:8px;cursor:pointer;border-radius:10px;transition:background .2s}
.drawer-account:hover{background:var(--gl)}
.drawer-account-avatar{width:34px;height:34px;border-radius:50%;background:#2D6444;color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'DM Sans',sans-serif}
.drawer-account-info{flex:1;min-width:0}
.drawer-account-name{font-size:13px;font-weight:700;color:var(--tx)}
.drawer-account-email{font-size:11px;color:var(--ts);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* DASHBOARD HEADER */
.dash-header{position:fixed;top:0;left:0;right:0;height:52px;background:#fff;border-bottom:1px solid var(--cd);display:flex;align-items:center;justify-content:center;z-index:300;padding:0 16px}
.dash-hamburger{position:absolute;left:16px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;display:flex;flex-direction:column;gap:5px;padding:6px}
.dash-hamburger span{display:block;width:22px;height:2px;background:var(--g);border-radius:2px;transition:all .3s}
.dash-logo{font-family:'Fraunces',serif;font-weight:900;font-size:18px;color:var(--g)}
.dash-logo em{font-style:normal;color:var(--a)}

/* DRAWER OVERLAY */
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:400;opacity:0;pointer-events:none;transition:opacity .3s}
.drawer-overlay.open{opacity:1;pointer-events:auto}

/* DRAWER */
.drawer{position:fixed;top:0;left:0;bottom:0;width:280px;background:#fff;z-index:500;transform:translateX(-100%);transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,.12);display:flex;flex-direction:column}
.drawer.open{transform:translateX(0)}
.drawer-head{padding:20px 20px 16px;border-bottom:1px solid var(--cd);display:flex;align-items:center;justify-content:space-between}
.drawer-logo{font-family:'Fraunces',serif;font-weight:900;font-size:20px;color:var(--g)}
.drawer-logo em{font-style:normal;color:var(--a)}
.drawer-close{background:none;border:none;font-size:22px;cursor:pointer;color:var(--ts);line-height:1;padding:2px 6px}
.drawer-nav{flex:1;display:flex;flex-direction:column;padding:12px 12px;gap:4px;overflow-y:auto}
.dtab{display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;border:none;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;color:var(--tx);transition:all .2s;text-align:left;width:100%}
.dtab:hover{background:var(--gl);color:var(--gm)}
.dtab.active{background:var(--gl);color:var(--g);font-weight:700}
.dtab-icon{font-size:20px;flex-shrink:0}
.drawer-footer{padding:16px 20px;border-top:1px solid var(--cd)}

/* PLAN VIEW */
.ph{background:linear-gradient(135deg,var(--g) 0%,var(--gm) 100%);border-radius:14px;padding:22px 24px;color:#fff;margin-bottom:18px;position:relative;overflow:hidden}
.ph::after{content:"🐾";position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:60px;opacity:.12}
.pbadge{background:rgba(255,255,255,.15);color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:10px;letter-spacing:1px;text-transform:uppercase}
.pname{font-family:'Fraunces',serif;font-size:clamp(20px,4vw,28px);font-weight:900;margin-bottom:5px}
.psub{font-size:12px;opacity:.8}
.pstats{display:flex;gap:7px;margin-top:14px;flex-wrap:wrap}
.pst{background:rgba(255,255,255,.12);border-radius:7px;padding:5px 10px;font-size:11px;font-weight:500}
.sect{font-family:'Fraunces',serif;font-size:18px;font-weight:800;color:var(--g);margin-bottom:14px;margin-top:4px;display:flex;align-items:center;gap:7px}

/* DAY CARDS (used in full week list) */
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

/* DAY CALENDAR */
.day-cal{display:flex;gap:4px;margin-bottom:16px;background:#fff;border-radius:12px;padding:8px;border:1.5px solid var(--cd)}
.day-cell{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 2px;border-radius:9px;cursor:pointer;transition:all .2s;border:none;background:transparent;font-family:'DM Sans',sans-serif}
.day-cell:hover:not(.day-selected){background:var(--ap)}
.day-cell.day-selected{background:var(--a)}
.day-cell.day-today:not(.day-selected){box-shadow:0 0 0 2px var(--a) inset}
.day-cell.day-done:not(.day-selected){background:var(--gl)}
.dc-lbl{font-size:9px;font-weight:700;color:var(--ts);text-transform:uppercase;letter-spacing:.3px}
.dc-num{font-size:13px;font-weight:800;font-family:'Fraunces',serif;color:var(--tx)}
.dc-dot{width:5px;height:5px;border-radius:50%;background:var(--gm);margin-top:1px}
.day-cell.day-selected .dc-lbl,.day-cell.day-selected .dc-num{color:#fff}
.day-cell.day-selected .dc-dot{background:rgba(255,255,255,.7)}

/* DAY DETAIL */
.day-detail{background:#fff;border-radius:14px;border:1.5px solid var(--cd);padding:16px;margin-bottom:16px;cursor:pointer;transition:border-color .2s}
.day-detail:hover{border-color:var(--al)}
.day-detail.ddet-done{border-color:var(--gm);background:var(--gl)}
.ddet-header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.ddet-num{background:var(--ap);color:var(--a);font-family:'Fraunces',serif;font-weight:900;font-size:15px;width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.day-detail.ddet-done .ddet-num{background:var(--gm);color:#fff}
.ddet-meta{flex:1}
.ddet-day{font-size:10px;font-weight:700;color:var(--ts);text-transform:uppercase;letter-spacing:.8px}
.ddet-dur{font-size:12px;color:var(--a);font-weight:600;margin-top:3px;display:flex;align-items:center;gap:5px}
.ddet-activity{font-size:16px;line-height:1.8;color:#1C3D2A;font-weight:500;padding:14px 0 8px}
.act-block{margin-bottom:18px}
.act-block:last-child{margin-bottom:0}
.act-label{font-size:13px;font-weight:700;color:var(--a);margin-bottom:8px;letter-spacing:.2px}
.act-bullets{display:flex;flex-direction:column;gap:7px}
.act-bullet{display:flex;align-items:flex-start;gap:8px;font-size:15px;line-height:1.75;color:#1C3D2A}
.act-bullet::before{content:"•";color:var(--a);font-weight:700;flex-shrink:0;margin-top:1px}
.day-detail.ddet-done .ddet-activity{text-decoration:line-through;opacity:.6}
.ddet-note{font-size:14px;line-height:1.8;color:var(--tm);background:var(--ap);border-radius:12px;padding:16px 18px;margin-top:12px}

/* NUTRITION */
.nc{background:#fff;border-radius:var(--rad);padding:20px 22px;border:1.5px solid var(--cd);margin-bottom:24px}
.nr{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid var(--cd)}
.nr:last-child{border-bottom:none}
.nk{font-size:14px;color:var(--ts);font-weight:500}
.nv{font-size:15px;font-weight:700;color:var(--tx)}
.nv.hl{color:var(--a);font-family:'Fraunces',serif;font-size:19px}
.nv.gr{color:var(--gm)}

/* TIPS */
.tc{background:var(--ap);border-radius:var(--rad);padding:20px 22px;border:1.5px solid rgba(232,130,12,.2);margin-bottom:24px;display:flex;flex-direction:column;gap:14px}
.ti2{display:flex;gap:10px;font-size:15px;color:var(--tm);line-height:1.8}

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
.rc-text{font-size:15px;color:var(--tm);line-height:1.8;margin-bottom:12px}
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
.vet-card{background:#fff;border-radius:var(--rad);border:1.5px solid var(--cd);padding:20px 22px;margin-bottom:16px}
.vet-preview{background:var(--cr);border-radius:12px;padding:16px;border:1px solid var(--cd);font-size:13px;color:var(--tm);line-height:1.9;margin:14px 0;max-height:220px;overflow-y:auto}
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

@media(max-width:900px){
  .opts.c2{grid-template-columns:1fr}
  .opts.c3{grid-template-columns:1fr 1fr}
  .ph::after{display:none}
  .rc-stats{grid-template-columns:repeat(2,1fr)}
  .sidebar{display:none}
  .bbar{display:flex}
  .dash-main{padding-bottom:90px}
}
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────
function parsePlan(txt) {
  try {
    const c = txt.replace(/```[\w]*\n?/g,"").trim();
    const s = c.indexOf("{"), e = c.lastIndexOf("}");
    if (s!==-1&&e!==-1) return JSON.parse(c.slice(s,e+1));
  } catch{}
  return null;
}

// Génère un plan Claude depuis les données d'un chien — utilisable depuis n'importe quel contexte
async function generatePlanForDog(d) {
  const bi = BREEDS[d.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const breedName = d.breed==="Autre race"?(d.custom||"race inconnue"):d.breed;

  let weatherSummary = "Météo non disponible";
  try {
    const wRes = await fetch(`/api/weather?city=${encodeURIComponent(d.city)}`);
    const wData = await wRes.json();
    if (wData.list) {
      weatherSummary = wData.list.map((item,i)=>{
        const day = DAYS[i]||`Jour ${i+1}`;
        const temp = Math.round(item.main.temp);
        const desc = item.weather[0].description;
        return `${day}: ${temp}°C, ${desc}`;
      }).join(" | ");
    }
  } catch {}

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
- Activité actuelle : ${d.activity} | Objectifs : ${(d.goals||[]).join(" + ")}
- Sensibilités race : ${bi.s} | Croquettes : ${d.food||"non précisé"} | Ration : ${d.ration||"non précisée"} g/j
- Pathologies / conditions médicales : ${d.pathologies||"Aucune signalée"}

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

9. Si l'objectif inclut "Prise de poids" :
   - Ne JAMAIS réduire la ration alimentaire — au contraire, augmenter de 10 à 20%
   - Favoriser des exercices de renforcement musculaire (montées de côtes, résistance, jeux de traction)
   - Éviter les exercices cardio intensifs qui brûlent trop de calories
   - Dans le plan nutritionnel, recommended_ration_g doit être SUPÉRIEUR à current_ration_g
   - reduction_pct doit être négatif (ex: -15 signifie +15% de ration)
   - Mentionner dans les breed_tips l'importance des protéines et des graisses saines

8. Adapter chaque jour du programme à la météo réelle :
   - Si température > 28°C : éviter les sorties entre 11h et 17h, mentionner les horaires dans breed_note
   - Si température < 5°C : réduire la durée des sorties pour les races sensibles au froid (Chihuahua, Yorkshire, Bouledogue)
   - Si pluie ou orage : proposer une alternative indoor concrète pour ce jour précis
   - Si beau temps et température idéale (15-25°C) : profiter pour augmenter légèrement la durée

Réponds UNIQUEMENT en JSON valide :
{"weekly_plan":[{"day":"Lundi","activity":"...","duration_min":25,"intensity":2,"is_rest":false,"breed_note":"..."}],"nutrition":{"daily_calories":1350,"recommended_ration_g":280,"current_ration_g":${d.ration||0},"reduction_pct":15,"treats_max_per_day":2,"water_ml":800,"note":"..."},"breed_tips":["conseil 1","conseil 2","conseil 3"],"weekly_goal":"Objectif semaine 1","estimated_weeks":12}`;

  const res = await fetch("/api/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:5000,messages:[{role:"user",content:prompt}]})
  });
  if(!res.ok) throw new Error("Erreur API "+res.status);
  const data = await res.json();
  const txt = data.content?.map(b=>b.text||"").join("")||"";
  console.log("[chat] réponse brute Claude :", txt);
  const plan = parsePlan(txt);
  if(!plan) throw new Error("Format invalide — voir console pour la réponse brute");
  return plan;
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

// ─── HOME VIEW (indépendant, affiché par défaut) ──────────────────────────
function HomeView({ plan, profile, done, currentWeek, user, userName, onAccount }) {
  const todayIdx = new Date().getDay();
  const dayIdx = todayIdx === 0 ? 6 : todayIdx - 1;

  if (!plan) return null;
  const bi = BREEDS[profile.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const breedName = profile.breed==="Autre race"?(profile.custom||profile.breed):profile.breed;
  const isOverweight = profile.weight > ideal + 2;
  const isUnderweight = profile.weight < ideal - 2;
  const totalDays = plan.weekly_plan?.length || 7;
  const doneCount = Object.values(done).filter(Boolean).length;
  const todayPlan = plan.weekly_plan?.[dayIdx];
  const userInitial = userName ? userName[0].toUpperCase() : (user?.email||"?")[0].toUpperCase();

  const rawConseils = todayPlan?.breed_note || "";
  const conseilBullets = rawConseils.length > 0
    ? rawConseils.split(". ").map(s=>s.trim()).filter(Boolean)
    : plan?.breed_tips || [];

  return (
    <div>
      {/* Home header */}
      <div className="home-header">
        <div>
          <div className="home-greeting">{userName ? `Bonjour ${userName} ! 👋` : "Bonjour ! 👋"}</div>
          <div className="home-sub">Voici le plan de {profile.name} aujourd'hui</div>
        </div>
        {user&&(
          <div className="home-avatar" style={{cursor:"pointer"}} onClick={onAccount}>{userInitial}</div>
        )}
      </div>

      {/* Profile card */}
      <div className="profile-card">
        <div className="pc-left">
          <div className="pc-emoji">🐕</div>
          <div>
            <div className="pc-name">{profile.name}</div>
            <div className="pc-info">{breedName} · {profile.age} ans · {profile.weight} kg</div>
          </div>
        </div>
        <div className={`pc-badge${isOverweight?" warn":isUnderweight?" under":""}`}>
          {isOverweight ? "Surpoids" : isUnderweight ? "Sous-poids" : "✓ En forme"}
        </div>
      </div>

      {/* 3 mini cards */}
      <div className="mini-cards">
        <div className="mini-card">
          <div className="mc-icon">🏃</div>
          <div className="mc-val">{todayPlan?.duration_min||"—"}{todayPlan?.duration_min&&<span className="mc-unit">min</span>}</div>
          <div className="mc-lbl">Exercice</div>
        </div>
        <div className="mini-card">
          <div className="mc-icon">🥗</div>
          <div className="mc-val">{plan?.nutrition?.recommended_ration_g||"—"}{plan?.nutrition?.recommended_ration_g&&<span className="mc-unit">g</span>}</div>
          <div className="mc-lbl">Ration</div>
        </div>
        <div className="mini-card">
          <div className="mc-icon">💧</div>
          <div className="mc-val">{plan?.nutrition?.water_ml||"—"}{plan?.nutrition?.water_ml&&<span className="mc-unit">ml</span>}</div>
          <div className="mc-lbl">Eau</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="prog-card">
        <div className="prog-header">
          <span className="prog-title">Objectif semaine {currentWeek}</span>
          <span className="prog-count">{doneCount}/7 jours</span>
        </div>
        <div className="prog-bar">
          <div className="prog-fill" style={{width:`${(doneCount/totalDays)*100}%`}}/>
        </div>
      </div>

      {/* Conseil du jour — bullet points */}
      {conseilBullets.length > 0 && (
        <div className="conseil-card">
          <div className="cc-title">💡 Conseil du jour</div>
          <ul className="cc-bullets">
            {conseilBullets.map((b,i)=>(
              <li key={i} className="cc-bullet">{b}{!b.endsWith(".")?".":""}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/// ─── ACTIVITY TEXT FORMATTER ────────────────────────────────────────────────
function parseActivityBlocks(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matinIdx = lower.search(/\bmatin\b/);
  const soirIdx  = lower.search(/\bsoir\b/);

  if (matinIdx !== -1 && soirIdx !== -1 && matinIdx < soirIdx) {
    return [
      { label: "🌅 Matin", sentences: splitToLines(text.slice(matinIdx, soirIdx)) },
      { label: "🌙 Soir",  sentences: splitToLines(text.slice(soirIdx)) },
    ];
  }
  return [{ label: null, sentences: splitToLines(text) }];
}

function splitToLines(text) {
  return text
    .replace(/\b(matin|soir)\b[^:—]*/i, "") // strip leading keyword+time
    .split(/(?:[.!]\s+|(?:\s—\s)|(?:;\s*))/)
    .map(s => s.replace(/^[,:\s]+|[,:\s]+$/g, "").trim())
    .filter(s => s.length > 6);
}

function ActivityBlocks({ text }) {
  const blocks = parseActivityBlocks(text);
  return (
    <div className="ddet-activity">
      {blocks.map((b, bi) => (
        <div key={bi} className="act-block">
          {b.label && <div className="act-label">{b.label}</div>}
          <div className="act-bullets">
            {b.sentences.map((s, si) => (
              <div key={si} className="act-bullet">{s}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TAB: PROGRAMME ───────────────────────────────────────────────────────
function TabProgramme({ plan, profile, done, onToggle, onHardWeek, isPro, onPaywall }) {
  const todayIdx = new Date().getDay();
  const dayIdx = todayIdx === 0 ? 6 : todayIdx - 1;
  const [selectedDay, setSelectedDay] = useState(dayIdx);

  const handleSelectDay = (i) => {
    if (!isPro && i > 0) { onPaywall && onPaywall(); return; }
    setSelectedDay(i);
  };

  if (!plan) return null;
  const day = plan.weekly_plan?.[selectedDay];

  return (
    <div>
      <div className="day-cal">
        {DAYS_SHORT.map((d,i)=>{
          const isDone = done[i];
          const isToday = i === dayIdx;
          const isSelected = i === selectedDay;
          const isRest = plan.weekly_plan?.[i]?.is_rest;
          let cls = "day-cell";
          if (isSelected) cls += " day-selected";
          else if (isDone) cls += " day-done";
          else if (isToday) cls += " day-today";
          return (
            <button key={i} className={cls} onClick={()=>handleSelectDay(i)}>
              <span className="dc-lbl">{d}</span>
              <span className="dc-num">{!isPro && i > 0 ? "🔒" : isRest ? "💤" : i+1}</span>
              {isDone && <span className="dc-dot"/>}
            </button>
          );
        })}
      </div>

      {day && (
        <div
          className={`day-detail${done[selectedDay]?" ddet-done":""}`}
          onClick={()=>!day.is_rest&&onToggle(selectedDay)}
        >
          <div className="ddet-header">
            <div className="ddet-num">{done[selectedDay]?"✓":selectedDay+1}</div>
            <div className="ddet-meta">
              <div className="ddet-day">
                {DAYS[selectedDay]}{selectedDay===dayIdx?" — Aujourd'hui":""}{day.is_rest?" — Repos":""}
              </div>
              <div className="ddet-dur">
                {day.duration_min} min{!day.is_rest&&<IDots n={day.intensity}/>}
              </div>
            </div>
            {!day.is_rest&&(
              <button
                className={`check-btn${done[selectedDay]?" checked":""}`}
                onClick={e=>{e.stopPropagation();onToggle(selectedDay)}}
              >
                {done[selectedDay]?"✓":""}
              </button>
            )}
          </div>
          <ActivityBlocks text={day.activity}/>
          {day.breed_note&&<div className="ddet-note">💡 {day.breed_note}</div>}
        </div>
      )}

      <div className="hw-card">
        <div className="hw-title">😓 Semaine difficile ?</div>
        <div className="hw-sub">Tu n'as pas pu sortir cette semaine ? L'IA va adapter le programme.</div>
        <button className="btn hw-btn btn-sm" onClick={onHardWeek}>🔄 Adapter</button>
      </div>
    </div>
  );
}

// ─── TAB: NUTRITION ───────────────────────────────────────────────────────
function TabNutrition({ plan }) {
  if (!plan) return null;
  const n = plan.nutrition;
  return (
    <div>
      <div className="sect">🍗 Plan nutritionnel</div>
      <div className="nc">
        <div className="nr"><div className="nk">🔥 Calories/jour</div><div className="nv hl">{n?.daily_calories} kcal</div></div>
        <div className="nr"><div className="nk">🥣 Ration recommandée</div><div className="nv gr">{n?.recommended_ration_g} g/j</div></div>
        {n?.reduction_pct!==0&&n?.reduction_pct!=null&&(
          <div className="nr">
            <div className="nk">{n.reduction_pct<0?"📈 Augmentation vs ration actuelle":"📉 Réduction"}</div>
            <div className="nv" style={{color:n.reduction_pct<0?"var(--gm)":"var(--a)"}}>
              {n.reduction_pct<0?`+${Math.abs(n.reduction_pct)}%`:`-${n.reduction_pct}%`}
            </div>
          </div>
        )}
        <div className="nr"><div className="nk">🦴 Treats max/jour</div><div className="nv">{n?.treats_max_per_day}</div></div>
        <div className="nr"><div className="nk">💧 Eau recommandée</div><div className="nv">{n?.water_ml} ml</div></div>
      </div>
      {n?.note&&(
        <div className="an">💡 <span>{n.note}</span></div>
      )}
    </div>
  );
}

// ─── TAB: CONSEILS ────────────────────────────────────────────────────────
function TabConseils({ plan, profile }) {
  const breedName = profile.breed==="Autre race"?(profile.custom||profile.breed):profile.breed;
  if (!plan?.breed_tips?.length) return (
    <div style={{textAlign:"center",padding:"40px 22px",fontSize:13,color:"var(--ts)"}}>
      Génère un programme pour voir les conseils 🧬
    </div>
  );
  return (
    <div>
      <div className="sect">🧬 Conseils — {breedName}</div>
      <div className="tc">
        {plan.breed_tips.map((t,i)=>(
          <div key={i} className="ti2"><span>🐾</span><span>{t}</span></div>
        ))}
      </div>
      <div className="an">🏥 <span>Ces conseils sont générés par IA. Consulte toujours un vétérinaire pour un suivi médical personnalisé.</span></div>
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
                    <div className="photo-slot-overlay" style={{color:"#fff",fontSize:12,fontWeight:600}}>Changer</div>
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
  const [vetEmail, setVetEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // {ok: bool, msg: string}
  const bi = BREEDS[profile.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const lastWeight = weights[weights.length-1];
  const breedName = profile.breed==="Autre race"?(profile.custom||"race inconnue"):profile.breed;

  const vetReport = `
RAPPORT BIEN-ÊTRE CANIN — Canymo
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

Généré par Canymo — Programme bien-être IA pour chiens
`.trim();

  const handleSendToVet = async () => {
    if (!vetEmail.trim()) return;
    setSending(true);
    setSendResult(null);
    const reportHtml = `
      <h2 style="color:#1C3D2A">Profil de ${profile.name}</h2>
      <p><strong>Race :</strong> ${breedName}</p>
      <p><strong>Âge :</strong> ${profile.age} ans</p>
      <p><strong>Poids actuel :</strong> ${lastWeight?.weight||profile.weight} kg</p>
      <p><strong>Poids idéal estimé :</strong> ${ideal} kg</p>
      <p><strong>Castré/Stérilisé :</strong> ${profile.neutered?"Oui":"Non"}</p>
      <p><strong>Pathologies :</strong> ${profile.pathologies||"Aucune signalée"}</p>
      <p><strong>Objectifs :</strong> ${(profile.goals||[]).join(", ")||"—"}</p>
      <h2 style="color:#1C3D2A">Programme en cours</h2>
      <p><strong>Semaine :</strong> ${profile.currentWeek||1}</p>
      <p><strong>Objectif hebdo :</strong> ${plan?.weekly_goal||"—"}</p>
      <h2 style="color:#1C3D2A">Programme d'exercice</h2>
      <ul>${plan?.weekly_plan?.map(d=>`<li><strong>${d.day} :</strong> ${d.activity} — ${d.duration_min} min</li>`).join("")||"<li>—</li>"}</ul>
      <h2 style="color:#1C3D2A">Plan nutritionnel</h2>
      <p><strong>Calories/jour :</strong> ${plan?.nutrition?.daily_calories||"—"} kcal</p>
      <p><strong>Ration recommandée :</strong> ${plan?.nutrition?.recommended_ration_g||"—"} g/jour</p>
      <p><strong>Eau :</strong> ${plan?.nutrition?.water_ml||"—"} ml/jour</p>
    `;
    try {
      const res = await fetch("/api/send-report", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ vetEmail, dogName: profile.name, reportHtml })
      });
      const data = await res.json();
      if (data.success) {
        setSendResult({ok:true, msg:`✓ Rapport envoyé à ${vetEmail}`});
        setVetEmail("");
      } else {
        setSendResult({ok:false, msg:`Erreur : ${data.error}`});
      }
    } catch {
      setSendResult({ok:false, msg:"Erreur lors de l'envoi"});
    }
    setSending(false);
  };

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
        <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",marginBottom:4}}>Rapport généré automatiquement</div>
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
        <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",marginBottom:8}}>📧 Envoyer par email au vétérinaire</div>
        <div className="wt-add">
          <input className="wt-inp" type="email" placeholder="email@veterinaire.fr"
            value={vetEmail} onChange={e=>{setVetEmail(e.target.value);setSendResult(null);}}
            onKeyDown={e=>e.key==="Enter"&&handleSendToVet()}/>
          <button className="btn btn-g btn-sm" onClick={handleSendToVet}
            disabled={sending||!vetEmail.trim()}>
            {sending?"⏳ Envoi...":"Envoyer"}
          </button>
        </div>
        {sendResult&&(
          <div style={{marginTop:10,padding:"10px 12px",borderRadius:8,fontSize:13,fontWeight:600,
            background:sendResult.ok?"#D1FAE5":"#FEE2E2",
            color:sendResult.ok?"#065F46":"#DC2626"}}>
            {sendResult.msg}
          </div>
        )}
        {!sendResult&&<div className="hint" style={{marginTop:6}}>Le rapport sera envoyé directement à votre vétérinaire.</div>}
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────
function Onboarding({ onComplete, existingDogs = [], user = null }) {
  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [loadMsg, setLoadMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [authTab, setAuthTab] = useState("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPwd, setAuthPwd] = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authOk, setAuthOk] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const isSecondDog = existingDogs.length > 0 && !!user;
  const ownerData = existingDogs[0]?.profile || {};
  const totalOBSteps = isSecondDog ? 8 : 10;
  const displayStep = s => isSecondDog && s >= 6 ? s - 1 : s;

  const [d, setD] = useState({
    name:"",breed:"",custom:"",age:3,gender:null,neutered:true,reproStatus:"none",
    weight:20,
    city: ownerData.city || "",
    housing: ownerData.housing || "",
    waterAccess: ownerData.waterAccess || null,
    waterActivities: ownerData.waterActivities || null,
    activity:"",time:30,goals:[],food:"",ration:"",pathologies:""
  });

  const upd = f => setD(p=>({...p,...f}));
  const go = s => { setStep(s); setErr(""); };
  const bi = BREEDS[d.breed]||BREEDS["Autre race"];
  const ideal = Math.round((bi.ideal[0]+bi.ideal[1])/2);
  const breedName = d.breed==="Autre race"?(d.custom||"race inconnue"):d.breed;
  const toggleGoal = v => {
    if (d.goals.includes(v)) {
      upd({goals: d.goals.filter(x=>x!==v)});
    } else {
      let next = [...d.goals, v];
      if (v==="Perte de poids") next = next.filter(x=>x!=="Prise de poids");
      if (v==="Prise de poids") next = next.filter(x=>x!=="Perte de poids");
      upd({goals: next});
    }
  };
  const housings=[
    {v:"Appartement sans jardin",icon:"🏢",desc:"Accès extérieur limité"},
    {v:"Appartement avec terrasse",icon:"🌿",desc:"Petit espace extérieur"},
    {v:"Maison avec jardin",icon:"🏡",desc:"Espace extérieur disponible"},
  ];
  const pct=[0,11,22,33,44,56,67,78,89,100];

  const handleGoogleAuth = async () => {
    const pendingData = {...d, created_at: new Date().toISOString()};
    // Sauvegarder en localStorage ET sessionStorage (backup si localStorage vidé)
    localStorage.setItem('canymo_pending_dog', JSON.stringify(pendingData));
    sessionStorage.setItem('canymo_pending_dog_backup', JSON.stringify(pendingData));
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://app.canymo.com' }
    });
  };

  const handleForgotPwd = async () => {
    if (!authEmail) { setAuthErr("Entre ton email pour recevoir le lien."); return; }
    setAuthLoading(true); setAuthErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail);
    setAuthLoading(false);
    if (error) { setAuthErr(error.message); return; }
    setResetSent(true);
  };

  const handleAuth = async () => {
    setAuthErr(""); setResetSent(false);
    if (!authEmail || !authPwd) { setAuthErr("Email et mot de passe requis."); return; }
    setAuthLoading(true);
    if (authTab === "signup") {
      if (authPwd.length < 6) { setAuthErr("Le mot de passe doit faire au moins 6 caractères."); setAuthLoading(false); return; }
      if (authPwd !== authConfirm) { setAuthErr("Les mots de passe ne correspondent pas."); setAuthLoading(false); return; }
      const pendingData = {...d, created_at: new Date().toISOString()};
      // Sauvegarde localStorage (même appareil) + métadonnées Supabase (cross-device)
      localStorage.setItem('canymo_pending_dog', JSON.stringify(pendingData));
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPwd,
        options: { data: { pending_dog: JSON.stringify(pendingData) } }
      });
      setAuthLoading(false);
      if (error) { setAuthErr(error.message); return; }
      setAuthOk(true);
    } else {
      console.log('[Auth] Tentative de connexion:', authEmail);
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPwd });
      console.log('[Auth] Résultat:', { session: signInData?.session?.user?.email, error: error?.message });
      setAuthLoading(false);
      if (error) {
        console.error('[Auth] Erreur connexion:', error.message, error);
        setAuthErr(error.message);
        return;
      }
      console.log('[Auth] Connexion réussie, session user:', signInData?.session?.user?.id);
      // Connecté directement → générer le plan maintenant
      generate();
    }
  };

  const generate = async () => {
    setLoading(true); setErr("");
    const msgs=[
      `Analyse du profil de ${d.name}...`,
      "Calcul des besoins nutritionnels...",
      "Création du programme d'exercices...",
      "Personnalisation des conseils...",
      "Finalisation du plan..."
    ];
    let mi=0; setLoadMsg(msgs[0]);
    setCountdown(30);
    const t=setInterval(()=>{mi++;if(mi<msgs.length)setLoadMsg(msgs[mi]);},6000);
    const cdt=setInterval(()=>setCountdown(c=>c>0?c-1:0),1000);
    try {
      const plan = await generatePlanForDog(d);
      clearInterval(t); clearInterval(cdt);
      localStorage.removeItem('canymo_pending_dog');
      onComplete(d, plan);
    } catch(e) {
      clearInterval(t); clearInterval(cdt); setLoading(false);
      setErr(e.message||"Erreur. Réessaie.");
    }
  };

  if (loading) return (
    <div className="ld">
      <div className="ld-spinner"/>
      <div className="lt">Création du programme personnalisé de {d.name}...</div>
      <p className="ls">{loadMsg}</p>
      <div className="ld-countdown">
        {countdown > 0 ? `Environ ${countdown} seconde${countdown>1?"s":""} restante${countdown>1?"s":""}` : "Presque terminé..."}
      </div>
    </div>
  );

  return (
    <div className="ob">
      <div className="ob-prog">
        <div className="ob-prog-lbl">Étape {step} sur 9</div>
        <div className="pbar"><div className="pfill" style={{width:`${pct[step]||0}%`}}/></div>
      </div>

      {step===1&&<>
        <div className="slbl">Étape 1 sur {totalOBSteps}</div>
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
        <div className="slbl">Étape 2 sur {totalOBSteps}</div>
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
        <div className="slbl">Étape 3 sur {totalOBSteps}</div>
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
        <div className="slbl">Étape 4 sur {totalOBSteps}</div>
        <div className="stitle">Le poids de {d.name} ?</div>
        <div className="ssub">Poids idéal estimé pour {breedName} : {bi.ideal[0]}–{bi.ideal[1]} kg.</div>
        <div className="rrow"><span className="flbl">Poids actuel</span><span className="rval">{d.weight} kg</span></div>
        <input type="range" min="1" max="80" step="0.5" value={d.weight} onChange={e=>upd({weight:parseFloat(e.target.value)})}/>
        <div className="wi">{(()=>{const diff=d.weight-ideal;if(diff>2)return `⚠️ ${d.name} est en surpoids de +${diff.toFixed(1)} kg — programme perte de poids recommandé`;if(diff<-2)return `📈 ${d.name} est en sous-poids de ${Math.abs(diff).toFixed(1)} kg — programme prise de poids recommandé`;return `✅ ${d.name} est dans la fourchette idéale pour sa race`;})()}</div>
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(3)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(isSecondDog?6:5)}>Continuer →</button>
        </div>
      </>}

      {!isSecondDog&&step===5&&<>
        <div className="slbl">Étape 5 sur {totalOBSteps}</div>
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
        <div className="slbl">Étape {displayStep(6)} sur {totalOBSteps}</div>
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
          <button className="btn btn-ghost" onClick={()=>go(isSecondDog?4:5)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(7)} disabled={!d.activity}>Continuer →</button>
        </div>
      </>}

      {step===7&&<>
        <div className="slbl">Étape {displayStep(7)} sur {totalOBSteps}</div>
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
        {d.goals.includes("Prise de poids")&&d.weight>ideal&&(
          <div className="goal-warn">⚠️ <strong>{d.name}</strong> est actuellement au-dessus de son poids idéal. Êtes-vous sûr de vouloir un objectif de prise de poids ?</div>
        )}
        {d.goals.includes("Perte de poids")&&d.weight<ideal&&(
          <div className="goal-warn">⚠️ <strong>{d.name}</strong> semble déjà en dessous de son poids idéal. Êtes-vous sûr de vouloir un objectif de perte de poids ?</div>
        )}
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(6)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(8)} disabled={!d.goals.length}>Continuer →</button>
        </div>
      </>}

      {step===8&&<>
        <div className="slbl">Étape {displayStep(8)} sur {totalOBSteps}</div>
        <div className="stitle">Votre chien a-t-il des pathologies particulières ?</div>
        <div className="ssub">Problèmes articulaires, cardiaques, respiratoires, allergies, etc.</div>
        <div className="fg">
          <textarea
            className="inp"
            rows={4}
            placeholder="Ex : Arthrose légère, souffle au cœur, allergie au poulet..."
            value={d.pathologies}
            onChange={e=>upd({pathologies:e.target.value})}
            style={{resize:"none",lineHeight:1.6}}
          />
        </div>
        <div className="warn-box">
          <span className="warn-box-icon">⚠️</span>
          <span>Canymo ne remplace pas un avis vétérinaire. En cas de doute sur la santé de votre chien, consultez un professionnel.</span>
        </div>
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(7)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>go(9)}>Continuer →</button>
        </div>
      </>}

      {step===9&&<>
        <div className="slbl">Étape {displayStep(9)} sur {totalOBSteps}</div>
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
        <div className="an">🤖 <span>L'IA va générer le programme de {d.name}{d.city?` à ${d.city}`:""}. ~15 secondes.</span></div>
        <div className="snav">
          <button className="btn btn-ghost" onClick={()=>go(8)}>← Retour</button>
          <button className="btn btn-g" onClick={()=>{
            if (isSecondDog) {
              generate();
            } else {
              localStorage.setItem('canymo_pending_dog', JSON.stringify({...d, created_at: new Date().toISOString()}));
              go(10);
            }
          }}>Continuer →</button>
        </div>
      </>}

      {step===10&&<>
        <div className="slbl">Étape 10 sur 10</div>
        <div className="stitle">Dernière étape avant le programme de {d.name} !</div>
        <div className="ssub">Créez votre compte pour accéder à votre programme depuis n'importe quel appareil.</div>
        <div className="auth-tabs">
          <button className={`auth-tab${authTab==="signup"?" active":""}`} onClick={()=>{setAuthTab("signup");setAuthErr("");setResetSent(false);}}>Créer un compte</button>
          <button className={`auth-tab${authTab==="signin"?" active":""}`} onClick={()=>{setAuthTab("signin");setAuthErr("");setResetSent(false);}}>J'ai déjà un compte</button>
        </div>

        {authOk ? (
          <div className="auth-success">✉️ Un email de confirmation a été envoyé à <strong>{authEmail}</strong>.<br/><br/>Vérifie ta boîte mail puis reviens ici pour voir le programme de <strong>{d.name}</strong> !</div>
        ) : (<>
          {resetSent&&<div className="auth-reset-ok">📩 Lien de réinitialisation envoyé à {authEmail}.</div>}
          <button className="google-btn" onClick={handleGoogleAuth}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuer avec Google
          </button>
          <div className="auth-sep">ou</div>
          <div className="fg">
            <label className="flbl">Email</label>
            <input className="inp" type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="ton@email.com" autoComplete="email"/>
          </div>
          <div className="fg">
            <label className="flbl">Mot de passe</label>
            <input className="inp" type="password" value={authPwd} onChange={e=>setAuthPwd(e.target.value)} placeholder="6 caractères minimum" autoComplete={authTab==="signup"?"new-password":"current-password"}/>
          </div>
          {authTab==="signup"&&(
            <div className="fg">
              <label className="flbl">Confirmer le mot de passe</label>
              <input className="inp" type="password" value={authConfirm} onChange={e=>setAuthConfirm(e.target.value)} placeholder="Répète le mot de passe" autoComplete="new-password"/>
            </div>
          )}
          {authErr&&<div className="err">❌ {authErr}</div>}
          {authTab==="signin"&&(
            <div style={{textAlign:"right",marginBottom:12}}>
              <button className="link-btn" onClick={handleForgotPwd}>Mot de passe oublié ?</button>
            </div>
          )}
          <div className="snav">
            <button className="btn btn-ghost" onClick={()=>go(9)}>← Retour</button>
            <button className="btn btn-g" onClick={handleAuth} disabled={authLoading}>
              {authLoading?"...":(authTab==="signup"?"Créer mon compte":"Me connecter")}
            </button>
          </div>
        </>)}
      </>}
    </div>
  );
}

// ─── PAYWALL OVERLAY ────────────────────────────────────────────────────────
function PaywallOverlay({ dogName, onClose }) {
  return (
    <div className="paywall-wrap">
      <div className="paywall-blur" onClick={onClose}/>
      <div className="paywall-card">
        <div className="paywall-icon">✨</div>
        <div className="paywall-title">Débloquez tout le programme</div>
        <div className="paywall-sub">Accédez au programme complet de {dogName} et à tous les outils de suivi</div>
        <ul className="paywall-list">
          <li>✅ Programme personnalisé 7j/7</li>
          <li>✅ Suivi nutritionnel complet</li>
          <li>✅ Conseils adaptés à la race</li>
          <li>✅ Historique et bilan de progression</li>
          <li>✅ Fiches vétérinaires</li>
        </ul>
        <button className="paywall-cta" onClick={()=>{ console.log("Rediriger vers Stripe Checkout"); }}>
          Passer à Pro — 5,99€/mois
        </button>
        <div className="paywall-hint">Annulable à tout moment</div>
        <button className="paywall-skip" onClick={onClose}>Non merci, continuer en gratuit</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard({ dogId, profile, plan, onSwitchDog, onDeleteDog, onAddDog, onPlanUpdate, user, onAccount }) {
  const [tab, setTab] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [userName, setUserName] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [done, setDone] = useState({});
  const [weights, setWeights] = useState([{date: today(), weight: profile.weight}]);
  const [photos, setPhotos] = useState({});
  const [notifs, setNotifs] = useState({morning:false,evening:false,weekly:false,weight:false});
  const [recaps, setRecaps] = useState({});
  const [doneHistory, setDoneHistory] = useState({});
  const [currentPlan, setCurrentPlan] = useState(plan);

  const bi = BREEDS[profile.breed]||BREEDS["Autre race"];
  const breedName = profile.breed==="Autre race"?(profile.custom||profile.breed):profile.breed;
  const currentWeek = profile.currentWeek || 1;
  const doneCount = Object.values(done).filter(Boolean).length;

  useEffect(()=>{
    const k = dogId;
    Promise.all([
      load(`cny_done_${k}`),load(`cny_weights_${k}`),load(`cny_photos_${k}`),
      load(`cny_notifs_${k}`),load(`cny_recaps_${k}`),load(`cny_dh_${k}`)
    ]).then(([d,w,p,n,r,dh])=>{
      if(d) setDone(d);
      if(w) setWeights(w);
      if(p) setPhotos(p);
      if(n) setNotifs(n);
      if(r) setRecaps(r);
      if(dh) setDoneHistory(dh);
    });
  },[dogId]);

  useEffect(()=>{
    if (!user) return;
    supabase.from("profiles").select("first_name").eq("id", user.id).single()
      .then(({data})=>{ if(data?.first_name) setUserName(data.first_name); });
  },[user]);

  useEffect(()=>{
    if (!user) return;
    supabase.from("subscriptions").select("status,plan").eq("user_id", user.id).single()
      .then(({data})=>{ setIsPro(checkIsPro(user.email, data)); });
  },[user]);

  const toggleDone = useCallback(async (i)=>{
    const next = {...done,[i]:!done[i]};
    setDone(next);
    await save(`cny_done_${dogId}`,next);
  },[done,dogId]);

  const addWeight = useCallback(async (entry)=>{
    const next=[...weights,entry];
    setWeights(next);
    await save(`cny_weights_${dogId}`,next);
  },[weights,dogId]);

  const handlePhoto = useCallback(async (type,data)=>{
    const next={...photos,[type]:data};
    setPhotos(next);
    await save(`cny_photos_${dogId}`,next);
  },[photos,dogId]);

  const toggleNotif = useCallback(async (key,val)=>{
    if(val && "Notification" in window) {
      Notification.requestPermission().then(p=>{
        if(p==="granted") { new Notification(`Canymo — ${profile.name}`,{body:"Les rappels sont activés 🐾",icon:"🐕"}); }
      });
    }
    const next={...notifs,[key]:val};
    setNotifs(next);
    await save(`cny_notifs_${dogId}`,next);
  },[notifs,profile.name,dogId]);

  const generateBilan = useCallback(async (weekNum)=>{
    if(weekNum==="new") {
      const newHistory={...doneHistory,[currentWeek]:done};
      setDoneHistory(newHistory);
      setDone({});
      await save(`cny_done_${dogId}`,{});
      await save(`cny_dh_${dogId}`,newHistory);
      return;
    }
    const weekDone=doneHistory[weekNum]||done;
    const wDoneCount=Object.values(weekDone).filter(Boolean).length;
    const lastW=weights[weights.length-1];
    const bi2 = BREEDS[profile.breed]||BREEDS["Autre race"];
    const ideal2 = Math.round((bi2.ideal[0]+bi2.ideal[1])/2);
    const prompt=`Tu es un coach vétérinaire bienveillant. Génère un bilan de semaine pour ce chien.

Chien : ${profile.name} (${breedName}, ${profile.age} ans)
Semaine ${weekNum} — Activités réalisées : ${wDoneCount}/7
Dernier poids : ${lastW?.weight||profile.weight} kg (objectif : ${ideal2} kg)
Objectifs : ${(profile.goals||[]).join(", ")}

Écris un bilan encourageant de 3-4 phrases en français. Sois précis, positif et donne 1 conseil concret pour la semaine suivante. Maximum 80 mots.`;

    const res=await fetch("/api/chat",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:200,messages:[{role:"user",content:prompt}]})
    });
    if(!res.ok) return;
    const data=await res.json();
    const txt=data.content?.map(b=>b.text||"").join("")||"";
    const next={...recaps,[weekNum]:txt};
    setRecaps(next);
    await save(`cny_recaps_${dogId}`,next);
  },[doneHistory,done,weights,profile,breedName,recaps,currentWeek,dogId]);

  const handleHardWeek = async ()=>{
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
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:800,messages:[{role:"user",content:prompt}]})
      });
      if(res.ok){
        const data=await res.json();
        const txt=data.content?.map(b=>b.text||"").join("")||"";
        const newPlan=parsePlan(txt);
        if(newPlan){setCurrentPlan(newPlan);setDone({});onPlanUpdate&&onPlanUpdate(newPlan);}
      }
    } catch {}
  };

  const tabs=[
    {k:null,  icon:"🏠",label:"Accueil"},
    {k:"programme",icon:"🏃",label:"Programme"},
    {k:"nutrition",icon:"🍗",label:"Nutrition", pro:true},
    {k:"conseils", icon:"🧬",label:"Conseil",   pro:true},
    {k:"suivi",    icon:"📊",label:"Suivi",     pro:true},
    {k:"bilan",    icon:"🏆",label:"Bilan",     pro:true},
    {k:"veto",     icon:"🏥",label:"Véto",      pro:true},
  ];

  const PRO_TABS = new Set(["nutrition","conseils","suivi","bilan","veto"]);

  const openDrawer  = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  const selectTab   = (k) => {
    if (!isPro && k !== null && k !== "programme" && PRO_TABS.has(k)) {
      setPaywallOpen(true); closeDrawer(); return;
    }
    setTab(tab===k?null:k); closeDrawer();
  };

  return (
    <div className="dash">
      {/* Fixed header */}
      <header className="dash-header">
        <button className="dash-hamburger" onClick={openDrawer} aria-label="Menu">
          <span/><span/><span/>
        </button>
        <div className="dash-logo">Can<em>ymo</em></div>
      </header>

      {/* Drawer overlay */}
      <div className={`drawer-overlay${drawerOpen?" open":""}`} onClick={closeDrawer}/>

      {/* Drawer */}
      <nav className={`drawer${drawerOpen?" open":""}`}>
        <div className="drawer-head">
          <div className="drawer-logo">Can<em>ymo</em></div>
          <button className="drawer-close" onClick={closeDrawer}>✕</button>
        </div>
        <div className="drawer-nav">
          {tabs.map(t=>(
            <button key={t.k} className={`dtab${tab===t.k?" active":""}`} onClick={()=>selectTab(t.k)}>
              <span className="dtab-icon">{t.icon}</span>
              {t.label}
              {t.pro && !isPro && <span className="pro-badge">PRO</span>}
            </button>
          ))}
        </div>
        <div className="drawer-footer">
          {user&&(
            <div className="drawer-account" onClick={()=>{closeDrawer();onAccount&&onAccount();}}>
              <div className="drawer-account-avatar">{(user.email||"?")[0].toUpperCase()}</div>
              <div className="drawer-account-info">
                <div className="drawer-account-name">Mon compte</div>
                <div className="drawer-account-email">{user.email}</div>
              </div>
            </div>
          )}
          {onSwitchDog&&(
            <button className="rb" onClick={()=>{closeDrawer();onSwitchDog();}}>🔀 Changer de chien</button>
          )}
          {!deleteConfirm ? (
            <button className="rb" style={{color:"#DC2626",marginTop:8}} onClick={()=>setDeleteConfirm(true)}>
              🗑 Supprimer ce profil
            </button>
          ) : (
            <div style={{marginTop:8}}>
              <div style={{fontSize:12,color:"#92400E",background:"#FEF3C7",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                Supprimer {profile.name} ? Cette action est irréversible.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setDeleteConfirm(false)}>Annuler</button>
                <button className="btn btn-red btn-sm" onClick={()=>{closeDrawer();onDeleteDog&&onDeleteDog();}}>Confirmer</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Add dog banner */}
      <div className="add-dog-banner" onClick={()=>{closeDrawer();onAddDog&&onAddDog();}}>
        <span>🐾</span>
        <span>Ajouter un autre Boule de poils</span>
      </div>

      {/* Content */}
      <div className="dash-layout">
        <div className="dash-main">
          {tab===null&&(
            <HomeView plan={currentPlan} profile={profile} done={done} currentWeek={currentWeek} user={user} userName={userName} onAccount={onAccount}/>
          )}
          {tab==="programme"&&(
            <TabProgramme plan={currentPlan} profile={profile} done={done}
              onToggle={toggleDone} onHardWeek={handleHardWeek}
              isPro={isPro} onPaywall={()=>setPaywallOpen(true)}/>
          )}
          {tab==="nutrition"&&(
            <TabNutrition plan={currentPlan}/>
          )}
          {tab==="conseils"&&(
            <TabConseils plan={currentPlan} profile={profile}/>
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
        </div>
      </div>

      {paywallOpen && (
        <PaywallOverlay dogName={profile.name} onClose={()=>{ setPaywallOpen(false); setTab(null); }}/>
      )}
    </div>
  );
}

// ─── ACCOUNT SCREEN ──────────────────────────────────────────────────────
function AccountScreen({ user, dogs, onBack, onAddDog, onSignOut, onDeleteAccount }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [origFirst, setOrigFirst] = useState("");
  const [origLast, setOrigLast] = useState("");

  useEffect(()=>{
    if (!user) return;
    supabase.from("profiles").select("first_name,last_name").eq("id", user.id).single()
      .then(({data})=>{
        if (data) {
          setFirstName(data.first_name||""); setOrigFirst(data.first_name||"");
          setLastName(data.last_name||""); setOrigLast(data.last_name||"");
        }
      });
  },[user]);

  const hasChanges = firstName !== origFirst || lastName !== origLast;

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").upsert({id: user.id, first_name: firstName, last_name: lastName});
    setSaving(false); setSaved(true); setOrigFirst(firstName); setOrigLast(lastName);
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div className="acct">
      <div className="acct-header">
        <button className="acct-back" onClick={onBack}>←</button>
        <div className="acct-title">Mon compte</div>
      </div>


      {/* Profil */}
      <div className="acct-section">
        <div className="acct-section-title">Profil</div>
        <div className="acct-card">
          <div className="acct-row">
            <span className="acct-row-label">Prénom</span>
            <input className="acct-inp" placeholder="Optionnel" value={firstName} onChange={e=>setFirstName(e.target.value)}/>
          </div>
          <div className="acct-row">
            <span className="acct-row-label">Nom</span>
            <input className="acct-inp" placeholder="Optionnel" value={lastName} onChange={e=>setLastName(e.target.value)}/>
          </div>
          <div className="acct-row">
            <span className="acct-row-label">Email</span>
            <span className="acct-row-val muted">{user?.email||"—"}</span>
          </div>
        </div>
        {hasChanges&&(
          <button className="btn btn-g" onClick={handleSave} disabled={saving} style={{width:"100%",justifyContent:"center",marginTop:10}}>
            {saving?"Enregistrement...":saved?"✓ Enregistré":"Enregistrer"}
          </button>
        )}
      </div>

      {/* Abonnement */}
      <div className="acct-section">
        <div className="acct-section-title">Abonnement</div>
        <div className="acct-card">
          <div className="acct-row">
            <span className="acct-row-label">Plan actuel</span>
            <span className="acct-row-val">Gratuit</span>
          </div>
        </div>
        <button className="btn btn-g" style={{width:"100%",justifyContent:"center",marginTop:10}}>
          ✨ Passer à Pro — 5,99€/mois
        </button>
      </div>

      {/* Mes chiens */}
      <div className="acct-section">
        <div className="acct-section-title">Mes chiens</div>
        <div className="acct-card">
          {dogs.map(dog=>(
            <div key={dog.id} className="acct-row">
              <span className="acct-row-label">🐕 {dog.profile?.name}</span>
              <span className="acct-row-val muted">{dog.profile?.breed==="Autre race"?(dog.profile?.custom||dog.profile?.breed):dog.profile?.breed}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost" onClick={onAddDog} style={{width:"100%",justifyContent:"center",marginTop:10}}>
          ➕ Ajouter un chien
        </button>
      </div>

      {/* Déconnexion */}
      <div className="acct-section">
        <button className="acct-btn-signout" onClick={onSignOut}>Se déconnecter</button>
      </div>

      {/* Supprimer le compte */}
      <div className="acct-delete">
        {!deleteConfirm ? (
          <button className="acct-delete-link" onClick={()=>setDeleteConfirm(true)}>
            Supprimer mon compte et mes données
          </button>
        ) : (
          <div className="acct-delete-confirm">
            Êtes-vous sûr ? Cette action est irréversible et supprimera tous vos chiens et données.
            <div style={{display:"flex",gap:8,marginTop:12,justifyContent:"center"}}>
              <button className="btn btn-ghost btn-sm" onClick={()=>setDeleteConfirm(false)}>Annuler</button>
              <button className="btn btn-red btn-sm" onClick={onDeleteAccount}>Confirmer la suppression</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DOG SELECT ──────────────────────────────────────────────────────────
function DogSelect({ dogs, onSelect, onAdd }) {
  return (
    <div className="dog-select">
      <div className="dog-select-title">Qui coache-t-on aujourd'hui ?</div>
      <div className="dog-select-sub">Sélectionne un profil pour accéder au dashboard</div>
      <div className="dog-list">
        {dogs.map(dog=>(
          <div key={dog.id} className="dog-card" onClick={()=>onSelect(dog.id)}>
            <div className="dog-card-avatar">{(dog.profile.name||"?")[0].toUpperCase()}</div>
            <div className="dog-card-info">
              <div className="dog-card-name">{dog.profile.name}</div>
              <div className="dog-card-meta">
                {dog.profile.breed==="Autre race"?(dog.profile.custom||dog.profile.breed):dog.profile.breed} · {dog.profile.weight} kg
              </div>
              {dog.profile.goals?.[0]&&<div className="dog-card-goal">{dog.profile.goals[0]}</div>}
            </div>
            <span className="dog-card-arrow">›</span>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost" onClick={onAdd} style={{width:"100%",justifyContent:"center",marginTop:16}}>
        ➕ Ajouter un chien
      </button>
    </div>
  );
}

// ─── WELCOME SCREEN ──────────────────────────────────────────────────────
function WelcomeScreen({ onStart, onLogin }) {
  return (
    <div className="welcome">
      <div className="welcome-icon">🐾</div>
      <div className="welcome-title">Bienvenue sur<br/>Can<em style={{color:"#E8820C",fontStyle:"italic"}}>ymo</em></div>
      <div className="welcome-sub">Le coaching bien-être personnalisé pour ton chien</div>
      <div className="welcome-btns">
        <button className="welcome-btn-primary" onClick={onStart}>
          Créer le programme de mon chien 🐾
        </button>
        <button className="welcome-btn-secondary" onClick={onLogin}>
          J'ai déjà un compte
        </button>
      </div>
      <div className="stats" style={{marginTop:40}}>
        <div><div className="sn">59%</div><div className="sl">des chiens en surpoids</div></div>
        <div><div className="sn">200+</div><div className="sl">races supportées</div></div>
        <div><div className="sn">2,5 ans</div><div className="sl">de vie gagnés</div></div>
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────
function LoginScreen({ onBack, onSignIn }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !pwd) { setErr("Email et mot de passe requis."); return; }
    setLoading(true); setErr("");
    console.log('[LoginScreen] Tentative connexion:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    console.log('[LoginScreen] Résultat:', { user: data?.user?.email, error: error?.message });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    onSignIn(data.user);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://app.canymo.com' }
    });
  };

  const handleReset = async () => {
    if (!email) { setErr("Saisis ton email d'abord."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) { setErr(error.message); return; }
    setResetSent(true);
  };

  return (
    <div className="login">
      <button className="login-back" onClick={onBack}>←</button>
      <div className="login-title">Content de te revoir ! 🐕</div>

      {err && <div className="login-err">{err}</div>}
      {resetSent && <div className="an">📧 <span>Email de réinitialisation envoyé !</span></div>}

      <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="flbl">Email</label>
            <input className="inp" type="email" placeholder="ton@email.com" value={email}
              onChange={e=>{setEmail(e.target.value);setErr("");}} autoComplete="email"/>
          </div>
          <div className="fg">
            <label className="flbl">Mot de passe</label>
            <input className="inp" type="password" placeholder="Ton mot de passe" value={pwd}
              onChange={e=>{setPwd(e.target.value);setErr("");}} autoComplete="current-password"/>
          </div>
          <button type="submit" className="welcome-btn-primary" disabled={loading}
            style={{marginTop:8,borderRadius:12,padding:"15px"}}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

      <div className="login-sep">
        <div className="login-sep-line"/>
        <div className="login-sep-txt">ou</div>
        <div className="login-sep-line"/>
      </div>

      <button className="login-google" onClick={handleGoogle}>
        <span style={{fontSize:18}}>G</span>
        Continuer avec Google
      </button>

      <div className="login-forgot">
        <button onClick={handleReset}>Mot de passe oublié ?</button>
      </div>
    </div>
  );
}

// ─── INSTALL BANNER ──────────────────────────────────────────────────────
function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(()=>{
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    const dismissed = localStorage.getItem("cny_install_dismissed");
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setVisible(isMobile && !isStandalone && !dismissed);
  },[]);

  const dismiss = () => {
    localStorage.setItem("cny_install_dismissed","1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="install-banner">
        <div className="install-icon">📲</div>
        <div className="install-text">Installe Canymo sur ton téléphone</div>
        <button className="install-btn" onClick={()=>setModalOpen(true)}>Comment faire ?</button>
        <button className="install-close" onClick={dismiss} aria-label="Fermer">×</button>
      </div>
      {modalOpen&&(
        <div className="install-modal-wrap">
          <div className="install-modal-bg" onClick={()=>setModalOpen(false)}/>
          <div className="install-modal">
            <div className="install-modal-title">📲 Installer Canymo</div>
            <div className="install-os">
              <div className="install-os-title">🍎 iPhone / iPad</div>
              <div className="install-steps">
                <div className="install-step"><div className="install-step-num">1</div><span>Appuie sur le bouton Partager <strong>↑</strong> en bas du navigateur</span></div>
                <div className="install-step"><div className="install-step-num">2</div><span>Fais défiler et choisis <strong>"Sur l'écran d'accueil"</strong></span></div>
                <div className="install-step"><div className="install-step-num">3</div><span>Appuie sur <strong>"Ajouter"</strong> en haut à droite</span></div>
              </div>
            </div>
            <div className="install-os">
              <div className="install-os-title">🤖 Android</div>
              <div className="install-steps">
                <div className="install-step"><div className="install-step-num">1</div><span>Appuie sur le menu <strong>⋮</strong> en haut à droite du navigateur</span></div>
                <div className="install-step"><div className="install-step-num">2</div><span>Choisis <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></span></div>
              </div>
            </div>
            <button className="install-modal-close" onClick={()=>setModalOpen(false)}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SUPABASE MAPPING ────────────────────────────────────────────────────
function dogToSupabaseRow(userId, profile, plan) {
  return {
    user_id: userId,
    name: profile.name || null,
    breed: profile.custom || profile.breed || null,
    age_years: profile.age ? Number(profile.age) : null,
    gender: profile.gender || null,
    current_weight: profile.weight ? Number(profile.weight) : null,
    ideal_weight: profile.idealWeight ? Number(profile.idealWeight) : null,
    initial_weight: profile.weight ? Number(profile.weight) : null,
    activity_level: profile.activity || null,
    pathologies: profile.pathologies || null,
    objectives: Array.isArray(profile.goals) ? profile.goals : (typeof profile.goals === 'string' && profile.goals ? profile.goals.split(',').map(o => o.trim()) : []),
    current_week: profile.currentWeek || 1,
    current_plan: plan || null,
    plan_generated_at: new Date().toISOString(),
    program_start_date: new Date().toISOString().split('T')[0],
    status: 'active',
  };
}

// ─── MAIN APP ────────────────────────────────────────────────────────────
export default function App() {
  const [scr, setScr] = useState("loading"); // "loading"|"welcome"|"login"|"select"|"onboarding"|"dashboard"|"account"
  const [dogs, setDogs] = useState([]);
  const [activeDogId, setActiveDogId] = useState(null);
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [appPaywallOpen, setAppPaywallOpen] = useState(false);

  const activeDog = dogs.find(d=>d.id===activeDogId)||null;
  const initDoneRef = useRef(false); // true après que init() a terminé

  const loadUserDogs = useCallback(async (userId) => {
    const { data: rows, error } = await supabase.from("dogs").select("*").eq("user_id", userId);
    console.log('[loadUserDogs]', rows?.length ?? 0, 'chiens', error ? `erreur: ${error.message}` : 'ok');
    if (rows && rows.length > 0) {
      const formatted = rows.map(r => ({id:r.id, profile:r, plan:r.current_plan}));
      setDogs(formatted);
      const activeId = await load("cny_active");
      const preferred = formatted.find(d=>d.id===activeId) ? activeId : formatted[0].id;
      setActiveDogId(preferred);
      setScr(formatted.length > 1 ? "select" : "dashboard");
      return true;
    }
    return false;
  }, []);

  // Écoute les changements de session — uniquement SIGNED_OUT ici
  useEffect(()=>{
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth event]', event, session?.user?.email ?? 'no session');
      if (event === 'SIGNED_OUT') {
        // Vérifier qu'il n'y a vraiment plus de session avant de rediriger
        // (Supabase peut émettre SIGNED_OUT lors d'un refresh raté, même si la session existe encore)
        await new Promise(r => setTimeout(r, 1000));
        const { data: { session: check } } = await supabase.auth.getSession();
        if (check) {
          console.log('[Auth] SIGNED_OUT ignoré — session encore valide');
          return;
        }
        console.log('[Auth] SIGNED_OUT confirmé → welcome');
        setUser(null); setDogs([]); setActiveDogId(null); setScr("welcome");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(()=>{
    let initHandled = false; // évite double exécution avec onAuthStateChange
    const init = async () => {
      // Timeout de sécurité : si init bloque > 8s, aller au welcome
      const safetyTimeout = setTimeout(() => {
        if (!initHandled) {
          console.warn('[Init] Timeout de sécurité déclenché → welcome');
          initHandled = true;
          initDoneRef.current = true;
          setScr("welcome");
        }
      }, 8000);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Init] Session:', session ? `user=${session.user.email}` : 'null');
        if (session) {
          setUser(session.user);
          console.log('[Init] Email confirmé:', session.user.email_confirmed_at ? 'oui' : 'non');

          // 1. Charger les chiens depuis Supabase EN PREMIER (source de vérité)
          const { data: existingRows, error: rowsErr } = await supabase.from("dogs").select("*").eq("user_id", session.user.id);
          console.log('[Init] Chiens en base:', existingRows?.length ?? 0, rowsErr ? `(erreur: ${rowsErr.message})` : '');

          // 2. S'il existe des chiens → dashboard directement, TOUJOURS (peu importe localStorage)
          if (existingRows && existingRows.length > 0) {
            // Nettoyer localStorage pour éviter tout conflit futur
            localStorage.removeItem('canymo_pending_dog');
            try { await supabase.auth.updateUser({ data: { pending_dog: null } }); } catch {}
            const formatted = existingRows.map(r => ({id:r.id, profile:r, plan:r.current_plan}));
            setDogs(formatted);
            const activeId = await load("cny_active");
            const preferred = formatted.find(d=>d.id===activeId) ? activeId : formatted[0].id;
            setActiveDogId(preferred);
            setScr(formatted.length > 1 ? "select" : "dashboard");
            return;
          }

          // Si erreur Supabase (RLS, réseau) → ne pas tomber dans pending_dog, utiliser localStorage
          if (rowsErr) {
            console.error('[Init] Erreur fetch dogs, fallback localStorage');
            const [dogsData, activeId] = await Promise.all([load("cny_dogs"), load("cny_active")]);
            if (dogsData && dogsData.length > 0) {
              setDogs(dogsData);
              setActiveDogId(activeId || dogsData[0].id);
              setScr(dogsData.length > 1 ? "select" : "dashboard");
            } else {
              setScr("welcome");
            }
            return;
          }

          // 3. Aucun chien en Supabase — vérifier si cny_dogs localStorage a déjà un plan
          const [localDogs, localActiveId] = await Promise.all([load("cny_dogs"), load("cny_active")]);
          if (localDogs && localDogs.length > 0 && localDogs.some(d => d.plan)) {
            console.log('[Init] Chiens trouvés en localStorage avec plan → dashboard');
            localStorage.removeItem('canymo_pending_dog');
            setDogs(localDogs);
            const preferred = localDogs.find(d=>d.id===localActiveId) ? localActiveId : localDogs[0].id;
            setActiveDogId(preferred);
            setScr(localDogs.length > 1 ? "select" : "dashboard");
            return;
          }

          // 4. Rien en local non plus → vérifier pending_dog (premier onboarding après inscription)
          const localRaw = localStorage.getItem('canymo_pending_dog');
          const metaRaw = session.user.user_metadata?.pending_dog;
          const pendingRaw = localRaw || metaRaw || null;
          console.log('[Init] pending_dog source:', localRaw ? 'localStorage' : metaRaw ? 'user_metadata' : 'aucun');
          if (pendingRaw) {
            try {
              const pending = JSON.parse(pendingRaw);
              const hoursOld = (Date.now() - new Date(pending.created_at).getTime()) / 3600000;
              console.log('[Init] pending_dog âge:', hoursOld.toFixed(1), 'h, chien:', pending.name);
              if (hoursOld < 24) {
                setScr("generating");
                let plan = null;
                try {
                  plan = await generatePlanForDog(pending);
                  console.log('[Init] Plan généré pour:', pending.name);
                } catch (genErr) {
                  console.error('[Init] Erreur génération plan:', genErr);
                  // Génération échouée → nettoyer et aller au welcome pour éviter boucle infinie
                  localStorage.removeItem('canymo_pending_dog');
                  try { await supabase.auth.updateUser({ data: { pending_dog: null } }); } catch {}
                  setScr("welcome");
                  return;
                }
                // Nettoyer AVANT de sauvegarder pour éviter toute boucle
                localStorage.removeItem('canymo_pending_dog');
                try { await supabase.auth.updateUser({ data: { pending_dog: null } }); } catch {}
                const userId = session.user.id;
                const p = {...pending, currentWeek:1};
                const id = `local_${Date.now()}`;
                const newDog = {id, profile:{...p, id}, plan};
                // Sauvegarder en localStorage EN PREMIER (toujours fiable)
                await save("cny_dogs", [newDog]);
                await save("cny_active", id);
                // Puis tenter Supabase (peut échouer sans casser l'app)
                try {
                  await supabase.from("profiles").upsert({ id: userId }, { onConflict: 'id' });
                  const row = dogToSupabaseRow(userId, p, plan);
                  const { data: inserted, error: insertErr } = await supabase.from("dogs").insert(row).select().single();
                  if (insertErr) console.error('[Init] Erreur insert Supabase (local sauvegardé):', insertErr.message);
                  else {
                    console.log('[Init] Chien sauvegardé Supabase ✓ id:', inserted.id);
                    // Mettre à jour avec l'ID Supabase
                    const supabaseDog = {id: inserted.id, profile:{...p, id: inserted.id}, plan};
                    await save("cny_dogs", [supabaseDog]);
                    await save("cny_active", inserted.id);
                    setDogs([supabaseDog]);
                    setActiveDogId(inserted.id);
                    setScr("dashboard");
                    return;
                  }
                } catch (e) { console.error('[Init] Exception Supabase:', e); }
                setDogs([newDog]);
                setActiveDogId(id);
                setScr("dashboard");
                return;
              }
            } catch (e) { console.error('[Init] Erreur parsing pending_dog:', e); }
            localStorage.removeItem('canymo_pending_dog');
          }

          // 4. Aucun chien, aucun pending → écran d'accueil
          setScr("welcome");
          return;
        }
      } catch (e) { console.error('[Init] Exception globale:', e); }
      // Fallback localStorage
      const [dogsData, activeId] = await Promise.all([load("cny_dogs"), load("cny_active")]);
      if (dogsData && dogsData.length > 0) {
        setDogs(dogsData);
        setActiveDogId(activeId || dogsData[0].id);
        setScr("select");
      } else {
        setScr("welcome");
      }
      initHandled = true;
      initDoneRef.current = true;
      clearTimeout(safetyTimeout);
    };
    init();
  },[loadUserDogs]);

  useEffect(()=>{
    if (!user) { setIsPro(false); return; }
    supabase.from("subscriptions").select("status,plan").eq("user_id", user.id).single()
      .then(({data})=>{ setIsPro(checkIsPro(user.email, data)); });
  },[user]);

  const handleSignIn = useCallback(async (signedInUser) => {
    setUser(signedInUser);
    // 1. Chiens en Supabase
    const loaded = await loadUserDogs(signedInUser.id);
    if (loaded) return;
    // 2. Chiens en localStorage avec plan
    const localDogs = await load("cny_dogs");
    if (localDogs && localDogs.length > 0 && localDogs.some(d => d.plan)) {
      localStorage.removeItem('canymo_pending_dog');
      setDogs(localDogs);
      setActiveDogId(localDogs[0].id);
      setScr(localDogs.length > 1 ? "select" : "dashboard");
      return;
    }
    // 3. Pending dog
    const pendingRaw = localStorage.getItem('canymo_pending_dog') || sessionStorage.getItem('canymo_pending_dog_backup');
    if (pendingRaw) { setScr("generating"); return; } // init() prendra le relais au prochain render
    // 4. Rien → onboarding
    setScr("onboarding");
  }, [loadUserDogs]);

  const handleComplete = async (profileData, planData) => {
    const p={...profileData,currentWeek:1};
    let id = `local_${Date.now()}`;
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log('[handleComplete] Session courante:', currentSession ? `user=${currentSession.user.id}` : 'null');
      if (currentSession?.user) {
        // Ensure profile exists (FK constraint: dogs.user_id → profiles.id)
        const { error: profErr } = await supabase.from("profiles").upsert({ id: currentSession.user.id }, { onConflict: 'id' });
        if (profErr) console.error('[handleComplete] Erreur upsert profile:', profErr.message);
        else console.log('[handleComplete] Profile assuré ✓');
        const row = dogToSupabaseRow(currentSession.user.id, p, planData);
        console.log('[handleComplete] Insertion Supabase:', JSON.stringify(row, null, 2));
        const { data: inserted, error: insertErr } = await supabase.from("dogs").insert(row).select().single();
        if (insertErr) console.error('[handleComplete] Erreur insert dog:', insertErr.message);
        else { id = inserted.id; console.log('[handleComplete] Chien sauvegardé dans Supabase ✓ id:', id); }
      } else {
        console.log('[handleComplete] Pas de session active — chien sauvegardé en local uniquement');
      }
    } catch(e) { console.error('[handleComplete] Exception:', e); }
    const newDog={id,profile:{...p,id},plan:planData};
    const newDogs=[...dogs,newDog];
    setDogs(newDogs);
    setActiveDogId(id);
    setScr("dashboard");
    await save("cny_dogs",newDogs);
    await save("cny_active",id);
  };

  const handleSelectDog = async (id) => {
    setActiveDogId(id);
    setScr("dashboard");
    await save("cny_active",id);
  };

  const handleAddDog = () => {
    if (!isPro) { setAppPaywallOpen(true); return; }
    setScr("onboarding");
  };

  const handleSwitchDog = () => setScr("select");

  const handleDeleteDog = async () => {
    const newDogs=dogs.filter(d=>d.id!==activeDogId);
    setDogs(newDogs);
    await save("cny_dogs",newDogs);
    if(newDogs.length===0){
      setActiveDogId(null);
      setScr("welcome");
    } else {
      setActiveDogId(null);
      setScr("select");
    }
  };

  const handlePlanUpdate = async (newPlan) => {
    const newDogs=dogs.map(d=>d.id===activeDogId?{...d,plan:newPlan}:d);
    setDogs(newDogs);
    await save("cny_dogs",newDogs);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setDogs([]); setActiveDogId(null);
    localStorage.removeItem('canymo_pending_dog');
    await save("cny_dogs",[]); await save("cny_active",null);
    setScr("welcome");
  };

  const handleDeleteAccount = async () => {
    // Delete all dog data from Supabase
    if (user) {
      try { await supabase.from("dogs").delete().eq("user_id", user.id); } catch {}
      try { await supabase.from("profiles").delete().eq("id", user.id); } catch {}
    }
    await handleSignOut();
  };

  const handleAccount = () => setScr("account");

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {scr==="onboarding"&&(
          <nav className="nav">
            <div className="logo">Can<span>ymo</span></div>
            <div className="badge">BETA</div>
          </nav>
        )}
        {scr==="loading"&&(
          <div className="splash">
            <div className="splash-logo">Can<em>ymo</em></div>
            <div className="ld-spinner"/>
            <div className="splash-sub">Chargement...</div>
            <button onClick={()=>setScr("welcome")} style={{marginTop:32,background:"transparent",border:"1px solid #ccc",borderRadius:8,color:"#9A8070",padding:"8px 20px",fontSize:13,cursor:"pointer"}}>Continuer manuellement</button>
          </div>
        )}
        {scr==="welcome"&&<WelcomeScreen onStart={()=>setScr("onboarding")} onLogin={()=>setScr("login")}/>}
        {scr==="login"&&<LoginScreen onBack={()=>setScr("welcome")} onSignIn={handleSignIn}/>}
        {scr==="select"&&<DogSelect dogs={dogs} onSelect={handleSelectDog} onAdd={handleAddDog}/>}
        {appPaywallOpen&&<PaywallOverlay dogName={activeDog?.profile?.name||"votre chien"} onClose={()=>setAppPaywallOpen(false)}/>}
        {scr==="onboarding"&&<Onboarding onComplete={handleComplete} existingDogs={dogs} user={user}/>}
        {scr==="generating"&&(
          <div className="ld">
            <div className="ld-spinner"/>
            <div className="lt">Création de votre programme en cours...</div>
            <p className="ls">Bienvenue ! On génère le plan personnalisé de votre chien.</p>
            <div className="ld-countdown">Environ 30 secondes...</div>
          </div>
        )}
        {scr==="account"&&(
          <AccountScreen
            user={user}
            dogs={dogs}
            onBack={()=>setScr(activeDog?"dashboard":"select")}
            onAddDog={handleAddDog}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
        {scr==="dashboard"&&activeDog&&(
          <Dashboard
            dogId={activeDog.id}
            profile={activeDog.profile}
            plan={activeDog.plan}
            onSwitchDog={handleSwitchDog}
            onDeleteDog={handleDeleteDog}
            onAddDog={handleAddDog}
            onPlanUpdate={handlePlanUpdate}
            user={user}
            onAccount={handleAccount}
          />
        )}
      </div>
      <InstallBanner/>
    </>
  );
}
