import React, {useEffect, useState} from 'react';
import Navbar from './components/Navbar.jsx';
import NoAccount from './components/NoAccount.jsx';
import ActiveAccount from './components/ActiveAccount.jsx';

export default function App(){
  const [user,setUser]=useState({
    name:"",
    hasAcc:false
  });
  const [isLoggedIn,setIsLoggedIn]=useState(false);
  const[isSidebarOpen,setSidebarOpen]=useState(false);

  useEffect(()=>{
    const token=localStorage.getItem("authtoken");
    const savedUserData=localStorage.getItem("user");
    if(token && savedUserData){

      const parseUser=JSON.parse(savedUserData);
      setUser({
        id:parseUser.id,
        name:parseUser.name || parseUser.email.split("@")[0],
        hasAcc:Boolean(parseUser.hasAcc),
        accountId:parseUser.accountId
      });
      setIsLoggedIn(true);
    }
  },[]);

  const handleLogOut=()=>{
    localStorage.removeItem("authtoken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.href="/login.html";
  };
 
  return(
    <div className='min-h-screen bg-gray-900/90 text-gray-100 flex flex-col font-sans select-none mx-auto' >
      {!isLoggedIn ?(
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-200">Access Denied</h2>
        <p className='text-gray-400 text-sm'>Please log in to view your account</p>
        <a href="/login.html" className='px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg cursor-pointer'>Go to LOGIN Page</a>
      </div>
      ):(
        <>
      <Navbar userName={user.name}
      sideBar={()=>setSidebarOpen(!isSidebarOpen)}
      onLogOut={handleLogOut}/>

      {user.hasAcc?(<ActiveAccount userName={user.name} isSidebarOpen={isSidebarOpen} accountId={user.accountId}/>):(<NoAccount  user={user} userName={user.name} onAccountCreated={(newAccountId)=>setUser((prev)=>({...prev,hasAcc:true,accountId:newAccountId}))}/>)}
      </>
      )}
    </div>
  );
}