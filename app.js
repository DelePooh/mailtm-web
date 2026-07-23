let token="";
async function login(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;
const r=await fetch("https://api.mail.tm/token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({address:email,password})});
const j=await r.json();
if(!j.token){status.textContent="Login gagal";return;}
token=j.token;status.textContent="Login berhasil";refreshInbox();}
async function refreshInbox(){
const r=await fetch("https://api.mail.tm/messages",{headers:{Authorization:"Bearer "+token}});
const j=await r.json();
const box=document.getElementById("inbox");box.innerHTML="";
(j["hydra:member"]||[]).forEach(m=>{let d=document.createElement("div");d.className="mail";d.innerHTML="<b>"+m.subject+"</b><br>"+m.createdAt;d.onclick=()=>openMail(m.id);box.appendChild(d);});}
async function openMail(id){
const r=await fetch("https://api.mail.tm/messages/"+id,{headers:{Authorization:"Bearer "+token}});
const m=await r.json();
const h=(m.html&&m.html[0])||"";
const x=h.match(/>(\d{4,8})<\/p>/);
document.getElementById("viewer").innerHTML="<h3>"+m.subject+"</h3>"+(x?"<div class='otp'>"+x[1]+"</div>":"OTP tidak ditemukan");}
setInterval(()=>{if(token)refreshInbox()},5000);