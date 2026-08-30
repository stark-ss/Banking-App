import { useState } from "react";
export default function Transfer({accountId,onSuccess}){
    const [recipientAccount, setRecipientAccount] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTransfer=async(e)=>{
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try{
        const token=localStorage.getItem("authtoken");
        const response=await fetch("http://10.236.16.81:3000/api/transfer",{
            method:"POST",headers:{"Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },body:JSON.stringify({
                senderAccountId:accountId,
                recipientAccountNumber:recipientAccount,
                amount:parseFloat(amount),
                description:description 
            })
           
        });
        const data=await response.json();

        if(response.ok){
            setMessage({type:"success",text:"Transfer successfull"});
            setRecipientAccount("");
            setAmount("");
            setDescription("");
            if(onSuccess) onSuccess();
        }
        else setMessage({type:"error",text:data.message || "Transfer failed"});
        }catch(err){
            console.error("Transfer error",err);
            setMessage({type:"error",text:"Something went wrong. please try again"});
        }finally{ setLoading(false);}
    };
    return(
        <div className="max-w-md spacey-6 mx-auto">
            <h2 className="text-2xl font-bold text-white text-center ">Transfer Money</h2>
            {message &&(
                <div className={`p3 rounded-xl text-sm ${message.type==='success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20':'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{message.text}</div>
            )}
            <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Recipient Account Number</label>
                    <input type="text" value={recipientAccount} onChange={(e)=>setRecipientAccount(e.target.value)} placeholder="Enter Account Number" required className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"/>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                        Amount
                    </label>
                    <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)}
                    placeholder="0.00" min="1" step="any" required className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                        Description (Optional)
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What's this for?"
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition duration-200 disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Transfer Money"}
                </button>
            </form>
        </div>
    );
}