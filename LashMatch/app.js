'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const modal=$('#modal'),content=$('#modal-content');
let user=null,csrf='',selected='Hybrid',studios=[],timer,pendingMatch=null;
const looks={
 Classic:{detail:'Light definition · Natural finish',description:'Light, defined lashes for an effortless everyday look.'},
 Hybrid:{detail:'Soft volume · Wispy finish',description:'A blend of natural definition and soft fullness, with a little extra texture.'},
 Wispy:{detail:'Airy texture · Fluttery finish',description:'Varying lengths create an airy, textured finish. Personalize the placement with your lash artist.'},
 Volume:{detail:'Full texture · Statement finish',description:'A fuller, expressive look for extra definition. Discuss suitable lash weight with your artist.'}
};
const demos=[
{id:1,name:'Blush & Bloom Lash Studio',city:'Makati',address:'Sample listing · Salcedo Village, Makati',description:'A calm, blush-toned space for soft, everyday lash looks.',specialties:['Classic','Hybrid'],is_demo:1},
{id:2,name:'The Lash Edit',city:'Quezon City',address:'Sample listing · Diliman, Quezon City',description:'Fluttery textures and a little extra personality for your lash routine.',specialties:['Wispy','Hybrid'],is_demo:1},
{id:3,name:'Petal Lash Lounge',city:'Mandaluyong',address:'Sample listing · Greenfield District, Mandaluyong',description:'Expressive lash inspiration, from natural definition to fuller volume.',specialties:['Classic','Volume'],is_demo:1}
];
function escapeHTML(v){const el=document.createElement('span');el.textContent=String(v);return el.innerHTML;}
function open(html){content.innerHTML=html;if(!modal.open)modal.showModal();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),4000);}
async function api(action,data){
 let response;try{response=await fetch('api.php?action='+encodeURIComponent(action),{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:data?JSON.stringify(data):undefined,credentials:'same-origin'});}catch{throw new Error('Cannot reach the server. Open this page through PHP; see SETUP.md.');}
 let result;try{result=await response.json();}catch{throw new Error('PHP is unavailable. Open this project through your PHP server; see SETUP.md.');}
 if(!response.ok)throw new Error(result.error||'Something went wrong. Please try again.');return result;
}
function account(){
 $$('[data-auth]').forEach(b=>b.setAttribute('aria-label',user?'Your LashMatch account':b.dataset.auth==='login'?'Login':'Sign Up'));
}
function showAccount(){
 open('<p class="eyebrow">YOUR ACCOUNT</p><h2>Hello, '+escapeHTML(user.name)+'.</h2><p>'+escapeHTML(user.email)+'</p><button class="button" id="account-quiz">Find My Match</button><button class="text-button" id="logout">Log out</button><div class="message" role="alert"></div>');
 $('#account-quiz').onclick=quiz;
 $('#logout').onclick=async()=>{
 const message=$('.message',content);
 try{await api('logout',{});user=null;csrf='';account();modal.close();toast('You have been logged out.');}catch(error){message.textContent=error.message;}
 };
}
function auth(mode){location.assign(mode==='login'?'login.html':'signup.html');}
function quiz(){
 open('<p class="eyebrow">LET’S FIND YOUR MATCH</p><h2>A little about your look.</h2><p>Three quick questions. One lovely starting point.</p><form id="quiz-form"><label>Your eye shape<select name="eye_shape"><option value="almond">Almond</option><option value="round">Round</option><option value="hooded">Hooded</option><option value="monolid">Monolid</option><option value="unsure">Not sure</option></select></label><label>Your ideal finish<select name="finish"><option value="natural">Natural & effortless</option><option value="balanced">Soft & balanced</option><option value="textured">Wispy & textured</option><option value="dramatic">Full & dramatic</option></select></label><label>Your occasion<select name="occasion"><option value="everyday">Everyday confidence</option><option value="event">A special occasion</option></select></label><button class="button">Reveal My Match <svg><use href="#spark"/></svg></button></form>');
 $('#quiz-form').onsubmit=e=>{e.preventDefault();showResult(Object.fromEntries(new FormData(e.target)));};
}
function showResult(answers){
 pendingMatch=answers;const match={natural:'Classic',balanced:'Hybrid',textured:'Wispy',dramatic:'Volume'}[answers.finish];setStyle(match);
 const notes={almond:'Ask your artist about a balanced map or a gentle outer-corner lift.',round:'Ask your artist whether a subtle outer-corner emphasis suits your desired look.',hooded:'Ask your artist about curl and placement that keep lashes visible above the lid.',monolid:'Ask your artist about curl and length that complement your lid and natural lash direction.',unsure:'Your lash artist can help identify your eye shape and personalize your lash map.'};
 open('<p class="eyebrow">IT’S A MATCH</p><h2>Your <em>'+match+'</em> era.</h2><p>'+looks[match].description+'</p><p>'+notes[answers.eye_shape]+'</p><p>'+(answers.occasion==='event'?'For your event, bring a reference photo and discuss the final look with your artist.':'For daily wear, discuss a comfortable length and your maintenance routine with your artist.')+'</p><p class="notice">Style inspiration only. Your artist should assess which extensions suit your natural lashes.</p><button class="button" id="save">'+(user?'Save My Match':'Sign Up to Save')+'</button><button class="text-button" id="result-preview">Preview this style</button><div class="message" role="status"></div>');
 $('#result-preview').onclick=preview;
 $('#save').onclick=async()=>{if(!user){auth('signup');return;}const button=$('#save'),message=$('.message',content);button.disabled=true;try{await api('save_match',answers);pendingMatch=null;message.textContent='Your '+match+' match is saved to your account.';button.textContent='Saved ✓';}catch(error){message.textContent=error.message;button.disabled=false;}};
}
function setStyle(style){selected=style;}
function preview(){
 open('<p class="eyebrow">LASH STYLE GUIDE</p><h2>'+selected+' <em>Lash</em></h2><div class="preview-options">'+Object.keys(looks).map(style=>'<button class="button outline" data-option="'+style+'" aria-pressed="'+(style===selected)+'">'+style+'</button>').join('')+'</div><p>'+looks[selected].description+'</p><p class="notice">Camera-based virtual try-on is not connected yet. You can explore lash styles and find your match with the quiz.</p><button class="button" id="preview-quiz">Find My Match</button>');
 $$('[data-option]',content).forEach(b=>b.onclick=()=>{setStyle(b.dataset.option);preview();});
 $('#preview-quiz').onclick=quiz;
}
function showStudios(){
 open('<p class="eyebrow">FIND LASH STUDIOS NEAR YOU</p><h2>Beauty, <em>Closer</em> to You</h2><label>Search by studio, city, or style<input type="search" id="search" placeholder="Try Makati or Quezon City" maxlength="100"></label><p class="notice">These are fictional sample listings. The map and statistics on the landing page are part of your supplied design; live studio verification and booking are not connected.</p><div id="studio-list" aria-live="polite"></div>');
 $('#search').oninput=render;render();
}
function render(){ if(!$("#studio-list"))return;
 const query=$('#search').value.toLowerCase().trim(),list=studios.filter(s=>(s.name+' '+s.city+' '+s.specialties.join(' ')).toLowerCase().includes(query));
 $('#studio-list').innerHTML=list.length?list.map(s=>'<article class="studio-item"><svg><use href="#pin"/></svg><h3>'+escapeHTML(s.name)+'</h3><p class="city">'+escapeHTML(s.city)+(Number(s.is_demo)?' · Demo studio':'')+'</p><p>'+escapeHTML(s.description)+'</p><div class="tags">'+s.specialties.map(tag=>'<span class="tag">'+escapeHTML(tag)+'</span>').join('')+'</div><button class="button outline" data-studio="'+Number(s.id)+'">View Studio <svg><use href="#arrow"/></svg></button></article>').join(''):'<p class="empty">No studios found. Try another name, city, or lash style.</p>';
 $$('[data-studio]').forEach(b=>b.onclick=()=>{const s=studios.find(s=>Number(s.id)===Number(b.dataset.studio));open('<p class="eyebrow">STUDIO SPOTLIGHT'+(Number(s.is_demo)?' · DEMO':'')+'</p><h2>'+escapeHTML(s.name)+'</h2><p>'+escapeHTML(s.address)+'</p><p>'+escapeHTML(s.description)+'</p><p>'+(Number(s.is_demo)?'This is a fictional sample listing. Contact details and appointments will be available when real studios are added.':'Online booking is not available yet.')+'</p><button class="button" id="studio-quiz">Find a Style to Bring</button>');$('#studio-quiz').onclick=quiz;});
}
$('#close').onclick=()=>modal.close();
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
$$('[data-auth]').forEach(b=>b.onclick=()=>user?showAccount():auth(b.dataset.auth));
$$('[data-quiz]').forEach(b=>b.onclick=quiz);
$$('[data-preview]').forEach(b=>b.onclick=preview);
$$('[data-studios]').forEach(b=>b.onclick=showStudios);
const panels={
 features:['Made for your eyes.','Explore personalized lash recommendations, find your preferred style, and browse lash studios.','Get Started'],
 how:['Find your perfect lash look.','1. Tell us your eye shape and preferred finish.<br>2. Explore your recommended lash style.<br>3. Find a studio and discuss your look with a lash artist.','Find My Match'],
 about:['Beauty meets you.','LashMatch: A Personalized Lash Recommendation, Virtual Try-On, and Studio Locater System.','Find My Match']
};
$$('[data-panel]').forEach(b=>b.onclick=()=>{const p=panels[b.dataset.panel];open('<p class="eyebrow">LASHMATCH</p><h2>'+p[0]+'</h2><p>'+p[1]+'</p><button class="button" id="panel-quiz">'+p[2]+'</button>');$('#panel-quiz').onclick=quiz;});
studios=demos;
if(location.protocol!=='file:'){
 api('session').then(r=>{csrf=r.csrf;user=r.user;account();}).catch(()=>{});
 api('studios').then(r=>{studios=r.studios;render();}).catch(()=>{});
}
if(location.hash==='#signup')auth('signup');
