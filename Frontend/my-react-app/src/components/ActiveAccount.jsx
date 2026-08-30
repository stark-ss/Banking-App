import { useEffect, useState,useCallback,} from "react";
import Deposit from "./DEPOSIT";
import Transfer from "./Transfer";
import Withdraw from "./Withdraw";
import Transactions from "./Transactions";
import Profile from "./Profile";

export default function ActiveAccount({userName,isSidebarOpen,accountId}){
    const [transactions, setTransactions]=useState([]);
    const [accountDetails,setAccountDetails]=useState(null);
    const[loading,setLoading]=useState(true);
  
    const[activeTab,setActiveTab]=useState("dashboard");   
            const fetchTransactions= useCallback(async()=>{
                try{
                    const token=localStorage.getItem("authtoken");
                    const response = await fetch(`http://10.236.16.81:3000/api/transactions/${accountId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }});
                    const data=await response.json();
                    if(response.ok){
                        setAccountDetails(data.account);
                        setTransactions((data.transactions ||[]).slice(0,3));
                    }
                }catch(err){
                    console.error("error loading",err);
                }finally{setLoading(false);}
        },[accountId]);

        useEffect(()=>{
            if(accountId) fetchTransactions();
            else setLoading(false);
        },[accountId,fetchTransactions]);

        if(loading){
            return(
             <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-65px)] text-gray-400">
                Loading dashboard...
            </div>  
            );
        }

        return(
            <div className="flex-1 flex  min-h-[calc(100vh-65px)]">
                <aside className={`w-64 border-r border-gray-800 bg-gray-900/30 p-4 space-y-2 shrink-0 transition-all duration-300 ease-in-out ${isSidebarOpen? 'w-64 opacity-100 translate-x-0':'w-0 -translate-x-full p-0 overflow-hidden'}`}>
                <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("profile");}} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition ${activeTab === 'profile' ? 'bg-emerald-600/50 text-white border border-indigo-500/20' : 'text-gray-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-800/50'}`}>Profile</a>
                <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("dashboard");}} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition ${activeTab === 'dashboard' ? 'bg-emerald-600/50 text-white border border-indigo-500/20' : 'text-gray-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-800/50'}`}>Dashboard</a>
                <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("transfer");}} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition ${activeTab === 'transfer' ? 'bg-emerald-600/50 text-white border border-indigo-500/20' : 'text-gray-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-800/50'}`}>Transfer</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("deposit"); }} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition ${activeTab === 'deposit' ? 'bg-emerald-600/50 text-white border border-indigo-500/20' : 'text-gray-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-800/50'}`}>Deposit</a>
                <a href="#"onClick={(e)=>{e.preventDefault(); setActiveTab("withdraw");}} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition ${activeTab === 'withdraw' ? 'bg-emerald-600/50 text-white border border-indigo-500/20' : 'text-gray-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-800/50'}`}>Withdraw</a>
                <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("transactions");}} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition ${activeTab === 'transactions' ? 'bg-emerald-600/50 text-white border border-indigo-500/20' : 'text-gray-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-800/50'}`}>Transactions</a>
                
                </aside>

                <main className="flex-1 p-8 space-y-8 max-w-4xl mx-auto">
                    {activeTab==="dashboard" && (
                        <>
                    <h2 className="text-2xl font-bold text-white">Welcome, {userName}</h2>
                    {accountDetails ? (
                        <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-200 capitalize">{accountDetails.account_type} Account</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {accountDetails.status}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Account Number</p>
                        <p className="text-base font-mono font-medium text-gray-200">A/C: {accountDetails.account_number}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-800">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Balance</p>
                        <p className="text-3xl font-extrabold text-white">₹{accountDetails.balance}</p>
                    </div>
                    </>
                    ) : (
                        <p className="text-gray-400">Account data Unavailable</p>
                    )}

                    <div className="max-w-md space-y-4">
                        <h3 className="text-lg font-bold text-gray-200 pb-2 border-b border-gray-800">Recent Transactions</h3>
                    </div>

                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <p className="text-sm text-gray-400">No recent transactions</p>
                        ) : (
                        transactions.map((tx) => {
                            const isPos =tx.transaction_type==='deposit' || tx.transaction_type==='receive'; 
                            const showDate=new Date(tx.created_at).toLocaleString();
                            return (
                          <div key={tx.tid} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800/50">
                            <div className="flex flex-col">
                             <span className="font-medium text-gray-100 capitalize">{tx.transaction_type}</span>
                            <span className="text-xs text-gray-300">{showDate}</span>
                            </div>
                            <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isPos ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                            </span>
                          </div>
                        )
                    })
                )}
                    </div>
                    </>
                    )}
                    {activeTab==="deposit" &&(<Deposit accountId={accountId} onSuccess={fetchTransactions}/>)}
                    {activeTab==="transfer" &&(<Transfer accountId={accountId} onSuccess={fetchTransactions}/>)}
                    {activeTab==="withdraw" &&(<Withdraw accountId={accountId} onSuccess={fetchTransactions}/>)}
                    {activeTab==="transactions" &&(<Transactions accountId={accountId}/>)}
                    {activeTab==='profile' && (<Profile accountId={accountId} userName={userName} accountDetails={accountDetails}/>)}

                </main>
            </div>
           );
}