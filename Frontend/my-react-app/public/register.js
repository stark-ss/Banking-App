let form=document.querySelector("#form");
const user_name=document.querySelector("#user_name");
const newmail=document.querySelector("#newmail");
const new_password=document.querySelector("#new_password");
let show_password=document.querySelector("#show_password");
let meter=document.querySelector("#meter");
let strength_text=document.querySelector("#strength_text");
let confirm_password=document.querySelector("#confirm_password");
let name_error=document.querySelector("#name_error");
let mail_error=document.querySelector("#mail_error");
let password_error=document.querySelector("#password_error");
let tooltip=document.querySelector(".tooltip");
let confirm_error=document.querySelector("#confirm_error");
let register=document.querySelector("#register");

document.addEventListener("DOMContentLoaded", () => {
    form.reset();

    user_name.setCustomValidity("");
    newmail.setCustomValidity("");
    new_password.setCustomValidity("");
    confirm_password.setCustomValidity("");

    name_error.textContent = "";
    mail_error.textContent = "";
    password_error.textContent = "";
    confirm_error.textContent = "";

    if (meter) {
        meter.style.width = "0%";
        meter.style.backgroundColor = "transparent";
    }
});

 form.addEventListener('submit',async(e)=>{
   e.preventDefault();
   namecheck(user_name.value.trim());
   mailcheck(newmail.value.trim().toLowerCase());
   checkStrength();
   passCheck();

   if(!form.checkValidity()){
    form.reportValidity();
    return;
   }
   const payload={
    name:user_name.value.trim(),
    email:newmail.value.trim().toLowerCase(),
    password:new_password.value
   };

   register.disabled=true;
   
   register.textContent="REGISTERING...";

   try{
    const response=await fetch('http://10.236.16.81:3000/api/register',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(payload)
    });

    const data=await response.json();
    if(response.ok){
        alert(data.message || "Account created successfully");
       window.location.href="../login/login.html";
    }
    else{
        let errorMsg="";
        if(data.errors && data.errors.email)
            errorMsg=data.errors.email;
        else if(data.message)
            errorMsg=data.message;
        else
            errorMsg="Email already registered";

       alert(errorMsg)

    }
       
   } catch (error){
    alert("Unable to connect to server please try again later...");
   }
   finally{
    register.disabled=false;
    register.textContent="REGISTER";
   } 
 
 });
 
 user_name.addEventListener("input",()=>{
    if(user_name.value.trim()!=="") namecheck(user_name.value.trim());
    else{
        user_name.setCustomValidity("");
        name_error.textContent="";
    }
 });
user_name.addEventListener("blur",()=> namecheck(user_name.value.trim()));

 function namecheck(check){
    const namePat=/^[A-Za-z\s]+$/;
    if(check===""){
        user_name.setCustomValidity("Please enter your name");
        name_error.textContent="";
 }
 else if(!namePat.test(check)){
    user_name.setCustomValidity("Name can only contain letters");
    name_error.textContent="Name can only contain letters";
 }
 else if(check.length<5){
    user_name.setCustomValidity("Please enter a valid name");
    name_error.textContent="Please enter a valid name";
 }
 else{
    user_name.setCustomValidity("");
    name_error.textContent="";
     }
 }


 newmail.addEventListener("input",()=>{
      mailcheck(newmail.value.trim().toLowerCase());
 });
 newmail.addEventListener("blur",()=> {
    mailcheck(newmail.value.trim().toLowerCase())
});

 function mailcheck(val){
    const pat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(val===""){
        newmail.setCustomValidity("Please enter an e-mail");
        mail_error.textContent="";
    }
    else if(!pat.test(val)){
        newmail.setCustomValidity("Please enter a valid mail");
        mail_error.textContent="Please enter a valid email";
    }
    else{
        newmail.setCustomValidity("");
        mail_error.textContent="";
    }
 }

 show_password.addEventListener("click",()=>{
    if(new_password.type==="password"){
        new_password.type="text";
        show_password.title="Hide Password";
        toggle.classList.replace("fa-eye", "fa-eye-slash");
    }
    else{
        new_password.type="password";
        show_password.title="Show Password";
         toggle.classList.replace("fa-eye-slash", "fa-eye");
    }
 });

 new_password.addEventListener("input",checkStrength);

 function checkStrength(){
    const val=new_password.value;
    if(val.length===0){
        meter.style.width="0%";
        meter.style.backgroundColor="transparent";
        new_password.setCustomValidity("");
        password_error.textContent="";
        tooltip.style.opacity="";
        tooltip.style.pointerEvents="auto";
        return;
    }
    const up=/[A-Z]/.test(val); 
    const low=/[a-z]/.test(val);
    const num=/[0-9]/.test(val); 
    const sym=/[^A-Za-z0-9]/.test(val);

    const type=[up,low,num,sym].filter(Boolean).length;

       if(type===1){
            meter.style.width="20%";
            meter.style.backgroundColor="#f91616";
            new_password.setCustomValidity("Password too weak");
            password_error.textContent="Password too weak"; 
            tooltip.style.opacity="";
            tooltip.style.pointerEvents="auto";
       }
       
       else if(type===2 ){
            meter.style.width="40%";
            meter.style.backgroundColor="#f5800b";
            new_password.setCustomValidity("Password too weak");
            password_error.textContent="Password too weak"; 
            tooltip.style.opacity="";
            tooltip.style.pointerEvents="auto";
       } 
         
       else if(type===3 ){
            meter.style.width="60%";
            meter.style.backgroundColor="#f6e60a";
            new_password.setCustomValidity("Password too weak");
            password_error.textContent="Password too weak"; 
            tooltip.style.opacity="";
            tooltip.style.pointerEvents="auto";
        }
         
        else if(type===4 && val.length>=6 ){
            meter.style.width="100%";
            meter.style.backgroundColor="#00ff1e";
            new_password.setCustomValidity("");
            password_error.textContent=""; 
            tooltip.style.opacity="0";
            tooltip.style.pointerEvents="none";
       }

              else if(type===4  ){
            meter.style.width="80%";
            meter.style.backgroundColor="#a2ff00";
            new_password.setCustomValidity("Password  weak");
            password_error.textContent="Password weak"; 
              tooltip.style.opacity="";
              tooltip.style.pointerEvents="auto";
           
       }
       if(confirm_password.value!=="") passCheck();
         
 }

 confirm_password.addEventListener("input",()=>{
    passCheck();
 });
 confirm_password.addEventListener("blur",()=>{
  passCheck();
 });

 function passCheck(){
    const passval=new_password.value;
    const passConfirm=confirm_password.value;
    if(passConfirm===""){
        confirm_password.setCustomValidity("Please confirm your password");
        confirm_error.textContent="";}
    else if(passConfirm!==passval){
        confirm_password.setCustomValidity("Passwords do not match");
        confirm_error.textContent="Passwords do not match";}
    else{
        confirm_password.setCustomValidity("");
        confirm_error.textContent="";}
 }
