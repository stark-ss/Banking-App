import { useState } from "react";

export default function CreateAccount({userId,userName,onCancel,onSuccess}){
    const [accType,setAccType]=useState('Savings');
    const[loading,setLoading]=useState(false);
    const handleSubmit=async (e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const token=localStorage.getItem('authtoken');
            const response=await fetch('http://10.236.16.81:3000/api/accounts',{
                method:'POST',
                headers:{'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                },
                body:JSON.stringify({uid:userId,acc_type:accType})
            });
            const data=await response.json();
            if(response.ok){
                const savedUser=JSON.parse(localStorage.getItem('user') || '{}');
                savedUser.hasAcc=true;
                savedUser.accountId=data.account.id;
                localStorage.setItem('user',JSON.stringify(savedUser));
                if (onSuccess) onSuccess(data.account.id);
            }
        } catch(err){console.error('Account Creation Error',err)
        }finally{setLoading(false);}
    };
    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-900/90 text-gray-100 mx-auto">
            <div className="w-full max-w-md bg-gray-800/80 border border-gray-700/60 rounded-2xl p-6 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-center text-white">Create Bank Acount</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
            
                {['Savings','Current'].map((type)=>(
                    <label key={type} className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                        accType===type?'border-indigo-500/50 bg-emerald-600/70':'border-gray-700 bg-gray-900/40'
                    }`}>
                        <input type="radio"
                        name="accountType"
                        value={type}
                        checked={accType===type}
                        onChange={()=>setAccType(type)}
                        className="accent-indigo-500" />
                        <span className="font-medium text-white">{type} Account</span>
                    </label>
                )
                )}
                <div className="pt-2 space-y-2">
                    <button type="submit" disabled={loading} className="w-full  py-3 bg-indigo-600 hover:bg-indigo-400 disabled:opacity-50 text-white font-semibold rounded-xl transition cursor-pointer">
                        {loading?'Creating...':'Create Account'}
                    </button>
                    <button type="button" onClick={onCancel} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition text-sm cursor-pointer">Cancel</button>
                </div>
            </form>
            </div>
        </div>
    );
}
