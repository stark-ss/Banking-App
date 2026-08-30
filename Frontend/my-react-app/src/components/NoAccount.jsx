import { useState } from "react";
import CreateAccount from "./createAcc.jsx";

export default function NoAccount({user,userName,onAccountCreated}){
    const [isCreating,setIsCreated]=useState(false);

    if(isCreating){
        return(<CreateAccount
            userId={user?.id}
            userName={userName}
            onCancel={()=>setIsCreated(false)}
            onSuccess={onAccountCreated}/>
        );
    }

    return (<main className=" mx-auto flex-1 max-w-4xl  w-full p-6 space-y-8">
            <h2 className="text-2xl font-semibold text-white-1000 text-center">Dashboard</h2>
            <div className="text-center py-2">
             <h3 className="text-3xl text-bold ">Welcome,{userName}</h3>
            </div>
            <div className="max-w-md mx-auto border border-gray-800 bg-gray-900 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <h4 className="text-xl font-semibold text-white">You don't have a account yet   
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">Create a bank account to start using banking services</p>
            <button onClick={()=>setIsCreated(true)} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer">+Create Account
            </button>
            </div>
            <div className="space-y-4 pt-4">
                <h4 className="text-base font-semibold text-gray-300 text-center">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-center">
                    <div className="border border-gray-800 bg-gray-900/40 rounded-xl p-5 text-center opacity-60 flex flex-col items-center justify-center space-y-2 cursor-not-allowed">
                     <span className="font-semibold text-gray-300">Deposit</span>
                     <span className="text-xl">🔒</span>
                     <span className="text-xs text-gray-400">Create a account first</span>
                    </div>
                    <div className="border border-gray-800 bg-gray-900/40 rounded-xl p-5 text-center opacity-60 flex flex-col
                    items-center justify-center space-y-2 cursor-not-allowed">
                     <span className="font-semibold text-gray-300">Withdraw</span>
                     <span className="text-xl">🔒</span>
                     <span className="text-xs text-gray-400">Create a account first</span>
                    </div> 

                </div>
            </div>
        </main>);
}