import { useEffect,useState,useCallback } from "react";
export default function Transactions({accountId}){

    const [transactions,setTransactions]=useState([]);
    useEffect(()=>{
        const fetchTransactions=async ()=>{
            if(!accountId) return;

            try{
                const token=localStorage.getItem("authtoken");
                const response=await fetch(`http://localhost:3000/api/transactions/${accountId}?limit=all`,{headers:{'Authorization':`Bearer ${token}`}});
                
                if(response.status===401 || response.status===403){
                    localStorage.clear();
                    window.location.href="/login.html";
                    return;
                }

                const data=await response.json();
                if(response.ok) 
                    setTransactions(data.transactions || []);
            }catch(err){
                console.error("Error fetching transactions",err);
            }
        };
        fetchTransactions();
        
    },[accountId]);




    return(
        <div className="max-w-md bg-gray-800/50 p-6 rounded-2xl border border-gray-800/50 space-y-4 mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2 pb-2 border-b border-gray-800 text-center">Transactions</h2>
            {transactions.length===0?(
                <p className="text-sm text-gray-400 py-2">No Transactions Found</p>
            ):(
                transactions.map((tx)=>{
                    const isDEposit=tx.transaction_type==='deposit' || tx.transaction_type==='receive';
                    const showDate=new Date(tx.created_at).toLocaleString();
                    return(
                        <div key={tx.tid} className="flex items-center justify-between p-3 rounded-xl bg-gray-800 border border-gray-700/50">
                            <div className="flex flex-col ">
                            <span className="text-gray-200 capitalize font-medium">{tx.transaction_type}</span>
                            <span className="text-xs text-gray-200">{showDate}</span>
                            </div>
                            <span className={`font-bold ${isDEposit? 'text-emerald-400':'text-red-400'}`}>
                                {isDEposit? `+₹${tx.amount}`:`-₹${tx.amount}`}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
}