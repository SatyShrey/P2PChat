"use strict";
// Import the functions from firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, get, set, update, remove, ref } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

//web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqeQaQfNfj_dhnnypvVKL_63K1P1Oeky8",
    authDomain: "chatapp-a5e1e.firebaseapp.com",
    projectId: "chatapp-a5e1e",
    storageBucket: "chatapp-a5e1e.appspot.com",
    messagingSenderId: "926918260577",
    appId: "1:926918260577:web:db46a6c445dde72b3b7720",
    measurementId: "G-P9F29Q6EXF"
};

// Initialize global Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
var form;
var email;
var alert;
var email2;
var recheck;

///my function
function snd(query){return document.querySelector(query);}
function sndC(query){return document.createElement(query);}


//event listener..........................
document.addEventListener('DOMContentLoaded',()=>{
    loginPage();
})



//functions.......................................
function loginPage(){
    snd('.container').innerHTML=
    `<form id="loginForm">
            <input required type="email" name="email" placeholder="Email">
            <input required type="password" name="password" placeholder="Password">
            <p id='alert'></p>
            <button type="submit">Login</button>
            <button id="flip">Go to signup.</button>
        </form>`;
        form=snd('#loginForm');
        alert=snd('#alert');
        snd('#flip').addEventListener('click',()=>{
            signupPage();
          })
        form.addEventListener('submit',(e)=>{
            e.preventDefault();           
            signInWithEmailAndPassword(auth,form.email.value,form.password.value).then(()=>{
                login();
            }).catch((err)=>{alert.innerHTML=err.toString();setTimeout(()=>{alert.innerHTML=''},1200)});
        })
}

function signupPage(){
    snd('.container').innerHTML=
    `<form id="signupForm">
            <input required type="email" name="email" placeholder="Email">
            <input required type="password" name="password" placeholder="Password">
            <p id="alert"></p>
            <button type="submit">Signup</button>
            <button id="flip">Go to login.</button>
        </form>`;
        form=snd('#signupForm');
        alert=snd('#alert');
        snd('#flip').addEventListener('click',()=>{
            loginPage();
          })
        form.addEventListener('submit',(e)=>{
            e.preventDefault();
            createUserWithEmailAndPassword(auth,form.email.value,form.password.value).then(()=>{
                signup();
            }).catch((err)=>{alert.innerHTML=err.toString();setTimeout(()=>{alert.innerHTML=''},1200)})
        })
}

function loadContacts(){
   snd('.container').innerHTML='<h3>Contacts</h3><div class="list">Loading....</div>';
   get(ref(db,'/contacts')).then((data)=>{
      var dataVal=data.val();
      snd('.list').innerHTML='';
      var personArray=dataVal.filter(obj=>obj.email===email);
      var contacts=personArray.map(person=>person.contacts)[0].split(',');
      for(var x in contacts){
        var contact=sndC('p');
        contact.setAttribute('class','contact');
        contact.innerHTML=contacts[x];
        snd('.list').appendChild(contact);
      }
   });
}

function login(){
    email=form.email.value;
    alert.innerHTML='Login Success...';
    setTimeout(loadContacts,1000);
}

function signup(){
    form.innerHTML='Signup Success...';
    setTimeout(loginPage,1000);
}

document.addEventListener('click',(e)=>{
    if(e.target.className==='contact'){
        email2=e.target.innerHTML;
        snd('.container').innerHTML=`<h3>Chats</h3><div class="chats">Loading....</div>
        <div class="inputBar">
            <button id="back">Back</button><textarea id="msg"></textarea><button id="send">Send</button>
        </div>`;


        get(ref(db,'/chats')).then((data)=>{
            snd('.chats').innerHTML='';
            var dataVal=data.val();
            var chatBox=[];
            for(var x in dataVal){
                if((dataVal[x].p1===email && dataVal[x].p2===email2) || (dataVal[x].p2===email && dataVal[x].p1===email2)){
                    chatBox.push(dataVal[x])
                }
            }
            chatBox.map(obj=>{
                var div=sndC('div');
                if(obj.p1===email){div.setAttribute('class','p1')}
                else{div.setAttribute('class','p2')}
                div.innerHTML=`<pre>${obj.chat}</pre>`;
                snd('.chats').appendChild(div);
            });
        }).then(()=>{checkMsg();});


        snd('#send').addEventListener('click',()=>{
            if(snd('#msg').value.trim()!=''){
                set(ref(db,`/chats/${Date.now()}`),{
                    p1:email,
                    p2:email2,
                    chat:snd('#msg').value
                });
                var div=sndC('div');
                div.innerHTML=`<pre>${snd('#msg').value}</pre>`;
                div.setAttribute('class','p1');
                snd('.chats').appendChild(div);
                snd('#msg').value='';
                var sent=new Audio('sent.mp3');
                sent.play();
                snd('.chats').scrollTop = snd('.chats').scrollHeight;
            }
        })

    }
})


function checkMsg(){
    recheck=setInterval(()=>{

       var chatCount=document.querySelectorAll('.p2');

        get(ref(db,'/chats')).then((data)=>{

            var dataVal=data.val();
            var p2Count=[];
            for(var x in dataVal){
                if(dataVal[x].p2===email && dataVal[x].p1===email2){
                   p2Count.push(dataVal[x].chat);
                   if(p2Count.length > chatCount.length){
                     
                    var div=sndC('div');
                    div.setAttribute('class','p2');
                    div.innerHTML=`<pre>${p2Count[p2Count.length-1]}</pre>`;
                    snd('.chats').appendChild(div);
                    var received=new Audio('received.mp3');
                    received.play();
                    snd('.chats').scrollTop = snd('.chats').scrollHeight;

                   }
                }
            }

        });

    },500);
}

