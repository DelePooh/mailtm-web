const API = "https://api.mail.tm";

let token = localStorage.getItem("mailtm_token") || "";
let currentOTP = "";

async function login() {
    const address = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!address || !password) {
        alert("Isi email dan password.");
        return;
    }

    try {
        const res = await fetch(API + "/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                address,
                password
            })
        });

        const data = await res.json();

        if (!data.token) {
            alert("Login gagal.");
            return;
        }

        token = data.token;
        localStorage.setItem("mailtm_token", token);

        alert("Login berhasil.");

        loadInbox();

    } catch (e) {
        alert("Tidak dapat terhubung.");
    }
}

async function loadInbox() {

    if (!token) return;

    const res = await fetch(API + "/messages", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    const data = await res.json();

    const list = document.getElementById("mailList");

    list.innerHTML = "";

    data["hydra:member"].forEach(mail => {

        list.innerHTML += `
        <div class="mailItem"
        onclick="openMail('${mail.id}')">

        <div class="mailSubject">
        ${mail.subject}
        </div>

        <div class="mailFrom">
        ${mail.from.address}
        </div>

        <div class="mailTime">
        ${new Date(mail.createdAt).toLocaleString()}
        </div>

        </div>
        `;

    });

}

async function refreshInbox(){
    loadInbox();
}

async function openMail(id){

    const res = await fetch(API+"/messages/"+id,{
        headers:{
            Authorization:"Bearer "+token
        }
    });

    const mail = await res.json();

    document.getElementById("welcome").style.display="none";
    document.getElementById("viewer").style.display="block";

    document.getElementById("subject").innerText=mail.subject;
    document.getElementById("from").innerText=mail.from.address;

    const text=(mail.text||mail.html||"");

    document.getElementById("body").innerHTML=text;

    const otp=text.match(/\b\d{4,8}\b/);

    if(otp){

        currentOTP=otp[0];

        document.getElementById("otp").innerText=currentOTP;

    }else{

        document.getElementById("otp").innerText="------";

        currentOTP="";

    }

}

function copyOTP(){

    if(!currentOTP) return;

    navigator.clipboard.writeText(currentOTP);

    alert("OTP berhasil disalin.");

}

function searchMail(){

    const keyword=document.getElementById("search").value.toLowerCase();

    document.querySelectorAll(".mailItem").forEach(item=>{

        item.style.display=item.innerText.toLowerCase().includes(keyword)
        ?"block":"none";

    });

}

setInterval(()=>{

    if(token){

        loadInbox();

    }

},5000);

if(token){

    loadInbox();

}