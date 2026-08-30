export default function Navbar({userName,sideBar,onLogOut}) {
    return(
     <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className=" flex items-center space-x-2">
         <button onClick={sideBar} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition cursor-pointer" title="Toggle Sidebar">
         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
         </svg>
         </button>
         <span className="text-4xl">🏦</span>   
        <h1 className="font-bold text-2xl text-white">MyBank</h1>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-xl text-gray-300 font-medium">🩻{userName}</span>
            <button onClick={onLogOut} className="text-sm font-semibold text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">LogOut</button>
        </div>
     </header>
    );
}