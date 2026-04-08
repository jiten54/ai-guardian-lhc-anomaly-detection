import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { 
  Activity, 
  AlertTriangle, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  History,
  LayoutDashboard,
  Settings,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SensorData {
  timestamp: string;
  voltage: number;
  current: number;
  temperature: number;
  score: number;
  isAnomaly: boolean;
}

interface Alert {
  id: string;
  type: "CRITICAL" | "WARNING" | "INFO";
  message: string;
  timestamp: string;
}

export default function App() {
  const [data, setData] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("connect", () => setIsConnected(true));
    socketRef.current.on("disconnect", () => setIsConnected(false));

    socketRef.current.on("sensor_data", (newData: SensorData) => {
      setData((prev) => {
        const updated = [...prev, newData];
        return updated.slice(-50); // Keep last 50 points
      });
    });

    socketRef.current.on("alert", (newAlert: Omit<Alert, "id">) => {
      setAlerts((prev) => [
        { ...newAlert, id: Math.random().toString(36).substr(2, 9) },
        ...prev.slice(0, 9),
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const latest = data[data.length - 1];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] font-sans selection:bg-orange-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-16 md:w-64 bg-[#121214] border-r border-white/5 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="hidden md:block font-bold tracking-tight text-lg">AI Guardian</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Activity size={20} />} label="Live Streams" />
          <NavItem icon={<History size={20} />} label="Historical Data" />
          <NavItem icon={<Bell size={20} />} label="Alert Logs" />
          <NavItem icon={<Settings size={20} />} label="System Config" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500")} />
            <span className="hidden md:block text-xs font-medium text-zinc-500 uppercase tracking-widest">
              {isConnected ? "System Online" : "System Offline"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-16 md:ml-64 p-4 md:p-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Superconducting Magnet Circuit B12</h1>
            <p className="text-zinc-500 mt-1">Real-time anomaly detection & failure prediction pipeline</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-[#1C1C1F] border border-white/5 rounded-lg flex items-center gap-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Anomaly Score</span>
              <span className={cn(
                "font-mono font-bold text-xl",
                latest?.isAnomaly ? "text-red-500" : "text-green-500"
              )}>
                {latest ? (latest.score * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Voltage" 
            value={latest ? `${latest.voltage.toFixed(4)} V` : "---"} 
            icon={<Zap className="text-blue-400" />}
            trend={latest?.voltage > 0.1 ? "Critical" : "Stable"}
            status={latest?.voltage > 0.1 ? "error" : "success"}
          />
          <StatCard 
            title="Current" 
            value={latest ? `${(latest.current / 1000).toFixed(2)} kA` : "---"} 
            icon={<Activity className="text-orange-400" />}
            trend={latest?.current < 11000 ? "Dropping" : "Nominal"}
            status={latest?.current < 11000 ? "warning" : "success"}
          />
          <StatCard 
            title="Temperature" 
            value={latest ? `${latest.temperature.toFixed(2)} K` : "---"} 
            icon={<Thermometer className="text-red-400" />}
            trend={latest?.temperature > 2.5 ? "Rising" : "Cryogenic"}
            status={latest?.temperature > 2.5 ? "error" : "success"}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Voltage & Current Dynamics">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis yAxisId="left" stroke="#60A5FA" fontSize={12} tickFormatter={(v) => `${v}V`} />
                <YAxis yAxisId="right" orientation="right" stroke="#F97316" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#60A5FA" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="current" stroke="#F97316" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Anomaly Probability Index">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis domain={[0, 1]} stroke="#A1A1AA" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "8px" }}
                />
                <Area type="monotone" dataKey="score" stroke="#EF4444" fillOpacity={1} fill="url(#colorScore)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Alerts & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell size={18} className="text-orange-500" />
                Live Alert Stream
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Real-time Analysis</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-zinc-600 italic">No critical events detected</div>
                ) : (
                  alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className={cn(
                        "mt-1 p-1.5 rounded",
                        alert.type === "CRITICAL" ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                      )}>
                        <AlertTriangle size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            alert.type === "CRITICAL" ? "text-red-500" : "text-orange-500"
                          )}>
                            {alert.type}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 mt-1">{alert.message}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-[#121214] border border-white/5 rounded-xl p-6 space-y-6">
            <h3 className="font-semibold">Model Performance</h3>
            <div className="space-y-4">
              <MetricRow label="Precision" value="98.2%" />
              <MetricRow label="Recall" value="99.5%" />
              <MetricRow label="F1 Score" value="0.988" />
              <MetricRow label="Latency" value="12ms" />
            </div>
            <div className="pt-6 border-t border-white/5">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Active Models</h4>
              <div className="space-y-2">
                <ModelBadge name="Isolation Forest" status="Active" />
                <ModelBadge name="LSTM Autoencoder" status="Standby" />
                <ModelBadge name="Transformer-AD" status="Training" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
      active 
        ? "bg-orange-600/10 text-orange-500 border border-orange-500/20" 
        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
    )}>
      {icon}
      <span className="hidden md:block text-sm font-medium">{label}</span>
    </button>
  );
}

function StatCard({ title, value, icon, trend, status }: { title: string; value: string; icon: React.ReactNode; trend: string; status: "success" | "warning" | "error" }) {
  return (
    <div className="bg-[#121214] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded",
          status === "success" ? "bg-green-500/10 text-green-500" :
          status === "warning" ? "bg-orange-500/10 text-orange-500" :
          "bg-red-500/10 text-red-500"
        )}>
          {trend}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-zinc-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold tracking-tight font-mono">{value}</p>
      </div>
    </div>
  );
}

function ChartContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#121214] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-zinc-300">{title}</h3>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500/50" />
          <div className="w-2 h-2 rounded-full bg-orange-500/50" />
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono font-semibold text-zinc-200">{value}</span>
    </div>
  );
}

function ModelBadge({ name, status }: { name: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
      <span className="text-xs font-medium text-zinc-300">{name}</span>
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded",
        status === "Active" ? "bg-green-500/20 text-green-400" :
        status === "Standby" ? "bg-blue-500/20 text-blue-400" :
        "bg-zinc-500/20 text-zinc-400"
      )}>
        {status}
      </span>
    </div>
  );
}
