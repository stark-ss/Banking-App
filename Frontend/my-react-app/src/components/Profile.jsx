import { useState, useEffect } from "react";
export default function Profile({userName,accountId,accountDetails }) {
    const[email,setEmail]=useState("Loading...");
    const[member,setMember]=useState("Loading...");
   
    
    useEffect(()=>{
       const fetchProfile= async ()=>{
       try{
        const token=localStorage.getItem("authtoken");
        if(!token) return;

        const savedUser=JSON.parse(localStorage.getItem("user") ||"{}");
        setEmail(savedUser.email || "Not Available");

        if(accountId){
            const response=await fetch(`http://10.236.16.81:3000/api/credentials/${accountId}`,{
                headers:{'Authorization':`Bearer ${token}`}
            });
            const data=await response.json();
            if (response.ok && data.created_at)
            setMember(new Date(data.created_at).toLocaleDateString());
             else  setMember("Not available");        
        }
       } catch(err){
        console.error("Error loading profile data:", err);
        setMember("Error loading date");
       }
    };
     fetchProfile();
    },[accountId]);

    const firstLetter=userName?userName.charAt(0).toUpperCase():"U";
    
 return(
    <div className=" mx-auto max-w-md p-6 bg-gray-900/50 border border-gray-800/50 rounded-2xl text-white space-y-6">
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-800">
            <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
                    {firstLetter}
                </div>
                <div>
                    <h2 className="text-xl font-bold">{userName || "User"}</h2>
                    <p className="text-xs text-gray-400">{email}</p>
                </div>
            </div>

            {accountDetails && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                    {accountDetails.status}
                </span>
            )}
            </div>

            <div className="space-y-4">
                <div className="bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/40">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Account Number</p>
                <p className="text-base font-mono font-medium text-gray-200 mt-0.5">
                    {accountDetails ? `A/C: ${accountDetails.account_number}` : "Loading..."}
                </p>
            </div>
                <div className="bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/40">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Username</p>
                    <p className="text-base font-medium text-gray-200 mt-0.5">{userName || "User"}</p>
                </div>
                <div className="bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/40">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email Address</p>
                    <p className="text-base font-medium text-gray-200 mt-0.5">{email}</p>
                </div>
                <div className="bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/40">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Member Since</p>
                    <p className="text-base font-medium text-gray-200 mt-0.5">{member}</p>
                </div>
            </div>
    
    </div>
 );
}