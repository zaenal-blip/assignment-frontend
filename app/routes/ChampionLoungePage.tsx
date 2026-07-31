import { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Scan,
  Camera,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router";
import { Scanner } from "@yudiel/react-qr-scanner";
import { getQccParticipants, scanQccParticipant } from "@/lib/api";
import type { BackendQccParticipant } from "@/lib/api";

type TicketStatus = "Waiting" | "Checked In";

// Hexagon Pattern Background component
const HexagonBackground = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
          <path d="M25 0 L50 14.4 L50 43.4 L25 29 Z" fill="currentColor" />
          <path d="M25 0 L0 14.4 L0 43.4 L25 29 Z" fill="currentColor" />
          <path d="M0 14.4 L25 29 L50 14.4 L25 0 Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagons)" className="text-gray-900" />
    </svg>
  </div>
);

export default function ChampionLoungePage() {
  const [participants, setParticipants] = useState<BackendQccParticipant[]>([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, waiting: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Checked In" | "Waiting">("All");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Scanner State
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "error" | "not_found">("idle");
  const [scannedParticipant, setScannedParticipant] = useState<BackendQccParticipant | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [cameraMode, setCameraMode] = useState<"environment" | "user">("environment");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Audio refs
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Real-time clock interval
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Fetch initial data
    loadParticipants();

    // Auto focus scanner input
    const focusScanner = () => {
      if (inputRef.current && scanState === "idle") {
        inputRef.current.focus();
      }
    };
    
    focusScanner();
    document.addEventListener("click", focusScanner);
    
    return () => {
      clearInterval(timer);
      document.removeEventListener("click", focusScanner);
    };
  }, [scanState]);

  const loadParticipants = async () => {
    try {
      const data = await getQccParticipants();
      setParticipants(data.participants);
      setStats(data.stats);
    } catch (err) {
      console.error("Failed to load participants", err);
    }
  };

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio not supported or blocked");
    }
  };

  const playErrorSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not supported or blocked");
    }
  };

  // Scan Processor
  const processScanCode = async (code: string) => {
    if (scanState === "scanning") return;
    setScanState("scanning");
    
    try {
      const res = await scanQccParticipant(code);
      
      setTimeout(() => {
        if (res.success && res.status === "SUCCESS") {
          setScannedParticipant(res.participant!);
          setScanState("success");
          playSuccessSound();
          loadParticipants(); // Refresh list
        } else if (res.success && res.status === "ALREADY_CHECKED_IN") {
          setScannedParticipant(res.participant!);
          setScanState("error");
          playErrorSound();
        } else {
          setScannedParticipant(null);
          setScanState("not_found");
          playErrorSound();
        }

        setTimeout(() => {
          setScanState("idle");
          setScannedParticipant(null);
        }, 3000);
      }, 500); // Small delay for animation
    } catch (error) {
       setScannedParticipant(null);
       setScanState("not_found");
       playErrorSound();
       setTimeout(() => setScanState("idle"), 3000);
    }
  };

  // Keyboard Scanner handler
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const code = inputValue.trim();
    setInputValue("");
    await processScanCode(code);
  };


  const totalTickets = stats.total;
  const checkedInCount = stats.checkedIn;
  const waitingCount = stats.waiting;
  const progressPercent = totalTickets > 0 ? Math.round((checkedInCount / totalTickets) * 100) : 0;

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "All" ? true : p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const recentCheckIns = [...participants]
    .filter(p => p.status === "Checked In" && p.checkInTime)
    .sort((a, b) => (b.checkInTime || "").localeCompare(a.checkInTime || ""))
    .slice(0, 5);

  return (
    <div className="min-h-screen lg:h-screen bg-[#F5F7FA] text-[#1F2937] font-sans relative flex flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      <HexagonBackground />
      
      {/* Toyota Decorative Red Lines */}
      <div className="absolute top-0 left-0 w-32 h-2 bg-[#E60012] z-10" />
      <div className="absolute top-2 left-0 w-16 h-2 bg-[#E60012] z-10 opacity-70" />
      <div className="absolute bottom-0 right-0 w-32 h-2 bg-[#E60012] z-10" />
      <div className="absolute bottom-2 right-0 w-16 h-2 bg-[#E60012] z-10 opacity-70" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm relative z-20 px-4 md:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:opacity-80 transition-opacity flex items-center gap-2 md:gap-3">
             <img src="/toyota.png" alt="Toyota" className="h-6 md:h-10 w-auto object-contain" />
             <div className="h-8 md:h-10 w-[1px] bg-gray-300 mx-1 md:mx-2" />
             <img src="/qcc.png" alt="QCC 2026" className="h-8 md:h-12 w-auto object-contain" />
          </Link>
        </div>
        
        <div className="text-center flex-1 mx-2 md:mx-4">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight text-[#1F2937] uppercase">Champion Lounge</h1>
          <p className="text-[#E60012] font-semibold text-xs md:text-sm tracking-widest mt-1">Event Check-In System</p>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-xl md:text-2xl font-bold text-gray-800 tabular-nums">
               {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </span>
             <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
               {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden p-1 shrink-0">
             <img src="/maskot.png" alt="Mascot" className="h-full w-full object-contain" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-4 max-w-[1600px] flex flex-col lg:flex-row gap-4 md:gap-6 relative z-10 min-h-0 lg:overflow-hidden overflow-visible">
        
        {/* Left Column - Scanner */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 md:gap-6 lg:min-h-0 pb-4 md:pb-0">
          {/* Scanner Card */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-5 md:p-6 flex flex-col relative overflow-hidden flex-1 min-h-[400px] lg:min-h-0">
             {/* Subtle top red line on card */}
             <div className="absolute top-0 left-0 w-full h-1 bg-[#E60012]/80" />
             
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <Scan className="h-6 w-6 text-[#E60012]" />
                 Scan QR Ticket
               </h2>
             </div>

             {/* Camera Preview Placeholder / Active Area */}
             <div className="bg-[#0F172A] rounded-xl flex-1 min-h-[250px] lg:min-h-0 flex items-center justify-center relative overflow-hidden shadow-inner group border-4 border-gray-800">
                <Scanner 
                   constraints={{ facingMode: cameraMode }}
                   onScan={(result) => {
                     if (result && result.length > 0) {
                        processScanCode(result[0].rawValue);
                     }
                   }}
                   allowMultiple={true}
                   scanDelay={2000}
                   styles={{ container: { width: '100%', height: '100%' } }}
                />

                {scanState === "scanning" && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#16A34A]/20 backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#16A34A] shadow-[0_0_15px_#16A34A] animate-[scan_2s_ease-in-out_infinite]" />
                    <Scan className="h-16 w-16 text-white/80 animate-bounce" />
                  </div>
                )}
                
                {/* Camera Toggle Button */}
                <button 
                  onClick={() => setCameraMode(prev => prev === "environment" ? "user" : "environment")}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all border border-white/20 shadow-lg flex items-center gap-2"
                  title="Switch Camera"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                    {cameraMode === "environment" ? "Back Cam" : "Front Cam"}
                  </span>
                </button>

                {/* Hidden Input for Physical Scanner */}
                <form onSubmit={handleScanSubmit} className="absolute opacity-0 pointer-events-none">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                  />
                </form>
                
                {/* Corner Markers */}
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/50 rounded-tl" />
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/50 rounded-tr" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/50 rounded-bl" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/50 rounded-br" />
             </div>

             {/* Scan Status Display below camera */}
             <div className="mt-6">
                {scanState === "idle" || scanState === "scanning" ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center animate-in fade-in">
                    <p className="text-gray-500 font-medium text-lg flex items-center justify-center gap-2">
                      <Scan className="h-5 w-5 animate-pulse" />
                      Waiting for QR Code...
                    </p>
                  </div>
                ) : scanState === "success" && scannedParticipant ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{scannedParticipant.name}</h3>
                        <p className="text-green-700 font-medium">{scannedParticipant.code}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm bg-white p-3 rounded-lg border border-green-100">
                       <div>
                         <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Area</p>
                         <p className="font-medium text-gray-800">{scannedParticipant.area || "-"}</p>
                       </div>
                       <div>
                         <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Table</p>
                         <p className={`font-bold ${scannedParticipant.tableNo ? 'text-[#E60012]' : 'text-blue-600'}`}>
                           {scannedParticipant.tableNo ? `Table No. ${scannedParticipant.tableNo}` : "Free Table"}
                         </p>
                       </div>
                       <div>
                         <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Check-in Time</p>
                         <p className="font-medium text-gray-800">
                            {scannedParticipant.checkInTime ? new Date(scannedParticipant.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                         </p>
                       </div>
                    </div>
                    <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20">
                      <UserCheck className="h-5 w-5" />
                      Checked In Successfully
                    </button>
                  </div>
                ) : scanState === "error" && scannedParticipant ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-red-100 p-3 rounded-full">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-red-900">Already Checked In</h3>
                        <p className="text-red-700 font-medium">Ticket: {scannedParticipant.code}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-red-100 text-center">
                       <div>
                         <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Table</p>
                         <p className={`font-bold ${scannedParticipant.tableNo ? 'text-[#E60012]' : 'text-blue-600'}`}>
                           {scannedParticipant.tableNo ? `Table No. ${scannedParticipant.tableNo}` : "Free Table"}
                         </p>
                       </div>
                       <div>
                         <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Previous Check-in</p>
                         <p className="font-bold text-red-600">
                            {scannedParticipant.checkInTime ? new Date(scannedParticipant.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                         </p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center animate-in slide-in-from-bottom-4">
                    <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-yellow-900">Ticket Not Found</h3>
                    <p className="text-yellow-700 mt-1">The scanned QR code is invalid or not registered.</p>
                  </div>
                )}
             </div>


          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-4 md:p-5 flex flex-col overflow-hidden relative shrink-0 h-[220px] md:h-[250px]">
             <div className="flex items-center gap-2 mb-3 md:mb-4 relative z-10">
               <Clock className="h-5 w-5 text-gray-500" />
               <h2 className="text-lg font-bold text-gray-800">Recent Check-In</h2>
             </div>
             <div className="space-y-4 overflow-y-auto">
               {recentCheckIns.length > 0 ? (
                 recentCheckIns.map(p => (
                   <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold border border-gray-200 shadow-sm">
                         {p.name.charAt(0)}
                       </div>
                       <div>
                         <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                         <p className="text-xs text-gray-500 font-medium">{p.area || "-"}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-md">
                         {p.checkInTime ? new Date(p.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                       </span>
                     </div>
                   </div>
                 ))
               ) : (
                 <p className="text-center text-gray-400 py-4 text-sm font-medium">No recent check-ins</p>
               )}
             </div>
          </div>
        </div>

        {/* Right Column - Stats & Table */}
        <div className="w-full lg:w-[60%] flex flex-col gap-4 md:gap-6 lg:min-h-0 pb-10 lg:pb-0">
          
          {/* Statistic Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Tickets" value={totalTickets} icon={<Users className="h-5 w-5 text-blue-500" />} color="from-blue-500 to-blue-600" bg="bg-blue-50" text="text-blue-600" />
            <StatCard title="Checked In" value={checkedInCount} icon={<UserCheck className="h-5 w-5 text-green-500" />} color="from-green-500 to-green-600" bg="bg-green-50" text="text-green-600" />
            <StatCard title="Waiting" value={waitingCount} icon={<Clock className="h-5 w-5 text-orange-500" />} color="from-orange-500 to-orange-600" bg="bg-orange-50" text="text-orange-600" />
            <StatCard title="Progress" value={`${progressPercent}%`} icon={<TrendingUp className="h-5 w-5 text-purple-500" />} color="from-purple-500 to-purple-600" bg="bg-purple-50" text="text-purple-600" />
          </div>

          {/* Participant Table */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex-1 flex flex-col overflow-hidden relative min-h-[400px] lg:min-h-0">
             <div className="p-3 md:p-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white z-10">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Participant List</h2>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search name or ticket..." 
                      className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#E60012]/20 focus:border-[#E60012] w-full sm:w-64 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex bg-gray-100 p-1 rounded-full w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {(["All", "Checked In", "Waiting"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                          filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             <div className="flex-1 overflow-auto">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm shadow-gray-100/50">
                   <tr>
                     <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No</th>
                     <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket Number</th>
                     <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Participant Name</th>
                     <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Area</th>
                     <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                     <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Time</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {filteredParticipants.map((p, index) => (
                     <tr key={p.id} className="hover:bg-gray-50/80 transition-colors group">
                       <td className="py-4 px-6 text-sm text-gray-400 font-medium group-hover:text-gray-600">{index + 1}</td>
                       <td className="py-4 px-6 text-sm font-bold text-gray-700">{p.code}</td>
                       <td className="py-4 px-6">
                         <span className="text-sm font-bold text-gray-900">{p.name}</span>
                       </td>
                       <td className="py-4 px-6 text-sm text-gray-500 font-medium">{p.area || "-"}</td>
                       <td className="py-4 px-6">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                           p.status === "Checked In" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                         }`}>
                           {p.status === "Checked In" && <CheckCircle2 className="h-3 w-3" />}
                           {p.status}
                         </span>
                       </td>
                       <td className="py-4 px-6 text-sm font-medium text-gray-600 text-right">
                         {p.checkInTime ? new Date(p.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                       </td>
                     </tr>
                   ))}
                   {filteredParticipants.length === 0 && (
                     <tr>
                       <td colSpan={6} className="py-12 text-center text-gray-400">
                         <div className="flex flex-col items-center justify-center gap-2">
                           <Search className="h-8 w-8 opacity-20" />
                           <p>No participants found.</p>
                         </div>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 relative z-20 shrink-0">
        <div className="container mx-auto px-4 md:px-6 max-w-[1600px] flex flex-col sm:flex-row items-center justify-between text-[10px] md:text-xs font-medium text-gray-500 gap-2 text-center sm:text-left">
          <p>Toyota Motor Manufacturing Indonesia</p>
          <p className="uppercase tracking-widest font-bold text-[#E60012]/80">QCC 2026 Champion Lounge</p>
        </div>
      </footer>

      {/* Full Screen Welcome/Error Modals Overlay */}
      {scanState === "success" && scannedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_20px_50px_rgba(22,163,74,0.3)] transform animate-in zoom-in-95 duration-500 border border-green-100 relative overflow-hidden">
             {/* Decorative Background Glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/20 blur-3xl rounded-full pointer-events-none" />
             
             <div className="relative z-10">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 mb-6 animate-bounce">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">WELCOME</h2>
                <h3 className="text-3xl font-bold text-green-600 mb-1">{scannedParticipant.name}</h3>
                <p className="text-lg font-medium text-gray-500 mb-2">{scannedParticipant.area || "-"}</p>
                <div className={`inline-block border px-4 py-1 rounded-full font-bold mb-6 ${scannedParticipant.tableNo ? 'bg-red-50 text-[#E60012] border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {scannedParticipant.tableNo ? `Table No. ${scannedParticipant.tableNo}` : "Free Table"}
                </div>
                
                <div className="inline-block bg-green-50 border border-green-200 rounded-full px-6 py-2 text-green-800 font-bold tracking-wide uppercase text-sm mb-4">
                  Check-In Success
                </div>
                
                <p className="text-4xl font-bold text-gray-800 tabular-nums">
                  {scannedParticipant.checkInTime ? new Date(scannedParticipant.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                </p>
             </div>
          </div>
        </div>
      )}

      {scanState === "error" && scannedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_20px_50px_rgba(220,38,38,0.3)] transform animate-in zoom-in-95 duration-500 border border-red-100 relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400/20 blur-3xl rounded-full pointer-events-none" />
             
             <div className="relative z-10">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-xl shadow-red-600/30 mb-6">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-red-700 tracking-tight mb-2">Already Checked In</h2>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{scannedParticipant.name}</h3>
                <div className={`inline-block border px-4 py-1 rounded-full font-bold mb-6 text-sm ${scannedParticipant.tableNo ? 'bg-red-50 text-[#E60012] border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {scannedParticipant.tableNo ? `Table No. ${scannedParticipant.tableNo}` : "Free Table"}
                </div>
                
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Previous Check-in</p>
                  <p className="text-3xl font-bold text-red-600 tabular-nums">
                    {scannedParticipant.checkInTime ? new Date(scannedParticipant.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                  </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {scanState === "not_found" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-yellow-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-[0_20px_50px_rgba(234,179,8,0.3)] transform animate-in zoom-in-95 duration-500 border border-yellow-100 relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/20 blur-3xl rounded-full pointer-events-none" />
             
             <div className="relative z-10">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/30 mb-6">
                  <AlertCircle className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-yellow-600 tracking-tight mb-2">Ticket Not Found</h2>
                <p className="text-gray-600 font-medium">The scanned QR code is invalid or not registered in the system.</p>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, text }: { title: string, value: string | number, icon: React.ReactNode, color: string, bg: string, text: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-4 md:p-5 flex flex-col relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 relative z-10">
        <div className={`p-2 rounded-xl ${bg}`}>
          {icon}
        </div>
        <p className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wide uppercase">{title}</p>
      </div>
      <p className={`text-2xl md:text-3xl font-black ${text} tabular-nums relative z-10 tracking-tight`}>{value}</p>
    </div>
  );
}
