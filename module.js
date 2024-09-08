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
var received=new Audio('received.mp3');
var sent=new Audio('sent.mp3');
var authError='FirebaseError: Firebase: Error (auth/invalid-credential).';
var existError="FirebaseError: Firebase: Error (auth/email-already-in-use).";
var passwordError="FirebaseError: Firebase: Password should be at least 6 characters (auth/weak-password).";
var accessError="FirebaseError: Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).";

///my function
function snd(query){return document.querySelector(query);}
function sndC(query){return document.createElement(query);}


//event listener..........................
document.addEventListener('DOMContentLoaded',()=>{
  if(sessionStorage.getItem('email')){
        loadContacts();
  }else{
    loginPage();
  }
})

//functions.......................................
function loginPage(){
    snd('.container').innerHTML=
    `<form id="loginForm">
            <h2>User Login</h2>
            <dl>
               <dt><label >Email</label></dt>
               <dd><input required type='email' name='email'></dd>
               <dt><label for="password">Password</label></dt>
               <dd><input required type="password" name="password"></dd>
            </dt>
            <button type="submit">Login</button>
            <p id="flip">Go to signup.</p>
            <div id="alert"></div>
        </form>`;
        form=snd('#loginForm');
        Alert=snd('#alert');
        snd('#flip').addEventListener('click',()=>{
            signupPage();
          })
        form.addEventListener('submit',(e)=>{
            e.preventDefault();
            email=form.email.value;
            Alert.innerHTML=`<div class="loaderContainer"><div class="loader"></div></div>`;          
            signInWithEmailAndPassword(auth,email,form.password.value).then(()=>{
                form.innerHTML=`<i class="success">Login success...</i>`;
                sessionStorage.setItem('email',email);
                setTimeout(()=>{loadContacts();},900);
            }).catch((err)=>{
                if(err.toString()===authError){
                    Alert.innerHTML='<i>Error: Invalid credentials.</i>';
                }else if(err.toString()===accessError){
                    Alert.innerHTML='<i>Error: So many attempts. Please try again later.</i>';
                }
                else{Alert.innerHTML=`<i>${err}</i>`;}
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
               <dt><label for="confirmPassword">Confirm Password</label></dt>
               <dd><input required type="password" name="confirmPassword"></dd>
            </dt>
            <button type="submit">Signup</button>
            <p id="flip">Go to login.</p>
            <div id="alert"></div>
        </form>`;
        form=snd('#signupForm');
        Alert=snd('#alert');
        snd('#flip').addEventListener('click',()=>{
            loginPage();
          })
        form.addEventListener('submit',(e)=>{
            e.preventDefault();
            email=form.email.value;
            Alert.innerHTML='<div class="loaderContainer"><div class="loader"></div></div>';
            if(form.password.value===form.confirmPassword.value){
                createUserWithEmailAndPassword(auth,email,form.password.value).then(()=>{
                    form.innerHTML=`<i class="success">Signup success...</i>`;
                    set(ref(db,`/profiles/${Date.now()}`),`${email}`);
                    setTimeout(()=>{loginPage();},900);
                }).catch((err)=>{
                    if(err.toString()===existError){
                        Alert.innerHTML=`<i>Error: Email already in use.</i>`;
                    }
                    else if(err.toString()===passwordError){
                        Alert.innerHTML=`<i>Error: Password must have six digits.</i>`;
                    }
                    else{
                        Alert.innerHTML=`<i>${err}</i>`;
                    }
                    setTimeout(()=>{Alert.innerHTML=''},1500)
                })
            }else{
                Alert.innerHTML=`<i>Error: Confirm your password.</i>`;
                setTimeout(()=>{Alert.innerHTML=''},1500)
            }
        })
}

function loadContacts(){
    email=sessionStorage.getItem('email');
   snd('.container').innerHTML=`<div class="contacts">
      <b>🥰${email} </b><button id="logout">🔒Logout</button>
      <div class="list">
        <div class="loaderContainer"><div class="loader"></div></div>
      </div>
   </div><div id="alert"></div>`;

   Alert=document.getElementById('alert');

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

   //logout...............................................................
   snd('#logout').addEventListener('click',()=>{
    Alert.innerHTML=`<div class="alertBox">
        <p>Are you sure to logout?</p>
        <button id="yes">yes</button><button id="no">no</button>
    </div>`;
    document.querySelector('.contacts').style.pointerEvents='none';

    //confirm logout............................
    document.getElementById('yes').addEventListener('click',()=>{
        sessionStorage.removeItem('email');
        loginPage();
    })

    //cancel logout............................
    document.getElementById('no').addEventListener('click',()=>{
        document.querySelector('.contacts').style.pointerEvents='all';
        Alert.innerHTML='';
    })

   })
}

//go to chatting screen.........................
document.addEventListener('click',(e)=>{
    if(e.target.className==='contact'){
        email2=e.target.id;
        snd('.container').innerHTML=`<div class='chatSection'>
        <div class="person">🥰${email2}</div><div class="chats"><div class="loaderContainer"><div class="loader"></div></div></div>
        <div class="inputBar">
            <button id="back">🔙</button><textarea id="msg"></textarea>
            <button id="send">&#10148;</button>
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
                div.setAttribute('id',obj.chatId);
                div.innerHTML=`<pre>${obj.chat}</pre>`;
                snd('.chats').appendChild(div);
            });
        }).then(()=>{
            snd('.chats').scrollTop = snd('.chats').scrollHeight;
            checkMsg();
        });


        snd('#send').addEventListener('click',()=>{
            if(snd('#msg').value.trim()!=''){
                sent.play();
                set(ref(db,`/chats/${Date.now()}`),{
                    p1:email,
                    p2:email2,
                    chat:snd('#msg').value,
                    chatId:Date.now()
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
        var p2Array=document.querySelectorAll('.p2');
        var msgId=p2Array[p2Array.length-1].id;
       var msgArray=[];
       get(ref(db,'/chats')).then((data)=>{
       var dataVal=data.val();
       for(var x in dataVal){
        if(dataVal[x].p2===email && dataVal[x].p1===email2){
            msgArray.push(dataVal[x]);
        }
       }
       }).then(()=>{
        if(msgArray[msgArray.length-1].chatId != msgId){
            var div=sndC('div');
            div.setAttribute('class','p2');
            div.setAttribute('id',msgArray[msgArray.length-1].chatId);
            div.innerHTML=`<pre>${msgArray[msgArray.length-1].chat}</pre>`;
            snd('.chats').appendChild(div);
            received.play();
            snd('.chats').scrollTop = snd('.chats').scrollHeight;
        }
       })
    },500);
}
