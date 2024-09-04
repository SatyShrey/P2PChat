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
var Alert;
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
            <h2>User Login</h2>
            <dl>
               <dt><label for="email">Email</label></dt>
               <dd><input required type="email" name="email"></dd>
               <dt><label for="password">Password</label></dt>
               <dd><input required type="password" name="password"></dd>
            </dt>
            <p id='alert'></p>
            <button type="submit">Login</button>
            <p id="flip">Go to signup.</p>
        </form>`;
        form=snd('#loginForm');
        Alert=snd('#alert');
        snd('#flip').addEventListener('click',()=>{
            signupPage();
          })
        form.addEventListener('submit',(e)=>{
            e.preventDefault();
            email=form.email.value;
            Alert.innerHTML=`<div class="loader"></div>`;          
            signInWithEmailAndPassword(auth,email,form.password.value).then(()=>{
                form.innerHTML=`<i class="success">Login success...</i>`;
                setTimeout(()=>{loadContacts();},1000);
            }).catch((err)=>{Alert.innerHTML=err.toString().replace('FirebaseError: Firebase:','');
                setTimeout(()=>{Alert.innerHTML=''},1500)
            });
        })
}

function signupPage(){
    snd('.container').innerHTML=
    `<form id="signupForm">
            <h2>New user registration</h2>
              <dl>
               <dt><label for="email">Email</label></dt>
               <dd><input required type="email" name="email"></dd>
               <dt><label for="password">Password</label></dt>
               <dd><input required type="password" name="password"></dd>
            </dt>
            <p id="alert"></p>
            <button type="submit">Signup</button>
            <p id="flip">Go to login.</p>
        </form>`;
        form=snd('#signupForm');
        Alert=snd('#alert');
        snd('#flip').addEventListener('click',()=>{
            loginPage();
          })
        form.addEventListener('submit',(e)=>{
            e.preventDefault();
            email=form.email.value;
            Alert.innerHTML='<div class="loader"></div>';
            createUserWithEmailAndPassword(auth,email,form.password.value).then(()=>{
                form.innerHTML=`<i class="success">Signup success...</i>`;
                set(ref(db,`/profiles/${Date.now()}`),`${email}`);
                setTimeout(()=>{loginPage();},1000);
            }).catch((err)=>{Alert.innerHTML=err.toString().replace('FirebaseError: Firebase:','');
                setTimeout(()=>{Alert.innerHTML=''},1500)
            })
        })
}

function loadContacts(){
   snd('.container').innerHTML=`<div class="contacts">
      <b>🥰${email} </b><button id="logout">🔒Logout</button>
      <div class="list">
        <div class="loader"></div>
      </div>
   </div>`;

   get(ref(db,'/profiles')).then((data)=>{
      var dataVal=data.val();
      snd('.list').innerHTML='';
      if(dataVal != null){
        for(var x in dataVal){
            if(dataVal[x] != email){
                var contact=sndC('p');
                contact.setAttribute('class','contact');
                contact.innerHTML=`☺️${dataVal[x]} <span>✉️</span>`;
                contact.setAttribute('id',dataVal[x]);
                snd('.list').appendChild(contact);
            }
          }
      } else{snd('.list').innerHTML='<i>Sorry no accounts found for chatting.</i>'}
   });

   snd('#logout').addEventListener('click',()=>{
    loginPage();
   })


}

document.addEventListener('click',(e)=>{
    if(e.target.className==='contact'){
        email2=e.target.id;
        snd('.container').innerHTML=`<div class='chatSection'>
        <div class="person">🥰${email2}</div><div class="chats"><div class="loader"></div></div>
        <div class="inputBar">
            <button id="back">🔙</button><textarea id="msg"></textarea>
            <button id="send">Send</button>
        </div></div>`;

        snd('#back').addEventListener('click',()=>{
            clearInterval(recheck);
            loadContacts();
        })

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
                var sent=new Audio('sent.mp3');
                sent.play();
                set(ref(db,`/chats/${Date.now()}`),{
                    p1:email,
                    p2:email2,
                    chat:snd('#msg').value
                });
                var div=sndC('div');
                div.innerHTML=`<pre>${snd('#msg').value.replaceAll("<","&lt;").replaceAll(">","&gt;")}</pre>`;
                div.setAttribute('class','p1');
                snd('.chats').appendChild(div);
                snd('#msg').value='';
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

