let form=document.querySelector("#form");
let accemail=document.querySelector("#accemail");
let emailmsg=document.querySelector("#emailmsg");
let signin=document.querySelector("#sign_in");
let pass=document.querySelector("#pass");
let showbutton=document.querySelector("#show-button");
let valid1=false;
let valid2=false;

form.addEventListener("submit",async (e)=>{
    e.preventDefault();

    if(!valid1 || !valid2) return;

    const emailval=accemail.value.trim().toLowerCase();
    const passval=pass.value;
    signin.disabled=true;
    signin.textContent="Signing in...";
    signin.style.cursor="not-allowed";
    signin.title="Signing in";
    accemail.disabled = true;
    pass.disabled = true;
    try{
        const response=await fetch("http://localhost:3000/api/login",{
            method:"post",
            headers:{
                "Content-Type": "application/json",},
                body: JSON.stringify({
                  account_email:emailval,
                  user_password:passval 
                }),
            });

        const data=await response.json();
        
        if(response.ok){
          console.log("login succes");
        
         if(data.token){
            localStorage.setItem("authtoken",data.token);
        }
        if(data.user){
            localStorage.setItem("user",JSON.stringify(data.user))
        }
        window.location.href="/";
    } else{
        alert(data.message || "Invalid email or password");
        signin.textContent="SIGN IN";
        updatebutton();
        accemail.disabled = false;
        pass.disabled = false;
    }
} catch(error){
    console.error("network problem");
    alert("please check the network");
    signin.textContent="SIGN IN";
    updatebutton();
    accemail.disabled = false;
    pass.disabled = false;
}


});

function updatebutton(){
    if(valid1 && valid2){
        signin.disabled=false;
        signin.style.cursor="pointer";
    }
    else{
        signin.disabled=true;
        signin.style.cursor="not-allowed";
    }
}
 updatebutton();

accemail.addEventListener("input",()=>{
    const email=accemail.value.trim().toLowerCase();
    valid1=cond(email);
    updatebutton();
});
function cond (email){
        if(email===""){
            accemail.style.borderColor="";
            accemail.style.boxShadow="";
            return false;
        }
        if(!email.includes("@") || !email.includes(".com")){
            accemail.style.borderColor="#ff3333";
            accemail.style.boxShadow = "0 0 5px #ff3333, 0 0 10px rgba(255, 51, 51, 0.33)";
            accemail.style.outline = "none";
            return false;
         }
            else{
              
                accemail.style.borderColor="";
                accemail.style.boxShadow="";
                return true;
            }
    };


pass.addEventListener("input",()=>{
const password=pass.value;
valid2=cond2(password);
updatebutton();
});

function cond2(password){
    if(password===""){
           pass.style.borderColor="";
            pass.style.boxShadow="";
            return false ;
    }
    if(password.length<5){
            pass.style.borderColor="#ff3333";
            pass.style.boxShadow = "0 0 5px #ff3333, 0 0 10px rgba(255, 51, 51, 0.33)";
            pass.style.outline = "none";
            return false;
    }
     else{
              
                pass.style.borderColor="";
                pass.style.boxShadow="";
                return true;
            }
}
const toggleicon=document.querySelector("#toggleicon");
showbutton.addEventListener("click",()=>{
   if(pass.type==="password"){
    pass.type="text";
    showbutton.title="Hide Password";
    toggleicon.classList.replace("fa-eye", "fa-eye-slash");
   }
   else{
    pass.type="password";
    showbutton.title="Show Password";
    toggleicon.classList.replace("fa-eye-slash", "fa-eye");
   }
});
window.addEventListener("pageshow", (event) => {
    
    form.reset();
    
    accemail.disabled = false;
    pass.disabled = false;
    
    signin.textContent = "SIGN IN";
    signin.title = "";
    
    valid1 = false;
    valid2 = false;
    updatebutton();
});

