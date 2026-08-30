import { useState } from "react";

export default function Deposit({accountId,onSuccess}){
    const[amount,setAmount]=useState("");
    const[message,setMessage]=useState({text:"",type:""});
    const[loading, setLoading]=useState(false);

    const handleWithdraw=async (e)=>{
        e.preventDefault();
        if(!amount || amount<=0){
            setMessage({text:"please enter a valid amount",type:"error"});
            return;
        }
        setLoading(true);
        setMessage({text:"",type:""});
        
        try{
            const token=localStorage.getItem("authtoken");
            const response=await fetch(`http://10.236.16.81:3000/api/withdraw`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                },
                body:JSON.stringify({accountId,amount:parseFloat(amount)})
            });
            const data=await response.json();

            if(response.ok){
                setMessage({text:`Withdrew ₹${amount}`,type:"success"});
                setAmount("");
                if(onSuccess) onSuccess();
            } else
                setMessage({text:data.message || "Withdrawal failed",type:"error"});
        }catch(err){
            console.error(err);
            setMessage({text:"Server error",type:"error"});
        }finally{ setLoading(false);}
    };
    return(
        <div className="mx-auto max-w-md bg-gray-900/50 p-6 rounded-2xl border border-gray-800/50">
            <h2 className="text-xl font-bold text-white mb-6 pb-2 border-b border-gray-800">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw} className="space-y-5">
                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount (₹)</label>
                    <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="Enter amount to withdraw"
                    min="1" step="any" required />
                </div>
                {message.text && (
                    <p className={`text-sm font-medium ${message.type==='success' ? 'text-emerald-400':'text-red-400'}`}>{message.text}</p>
                )}
                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">{loading?"Processing...":"Confirm Withdrawal"}</button>
            </form>
        </div>
    );
}