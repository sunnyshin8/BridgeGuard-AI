
"use client";

import { useState, useEffect } from 'react';
import {
    Shield,
    Activity,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    Globe,
    Bell,
    User,
    Menu,
    ChevronRight,
    TrendingUp,
    Boxes
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { TransactionVolumeChart, AnomalyDistributionChart } from '@/components/Charts'; // We will create this next

export default function Dashboard() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedNetwork, setSelectedNetwork] = useState('qie');

    // Validator State
    const [stats, setStats] = useState({
        activeBridges: 12,
        anomalies24h: 0,
        validationRate: 99.9,
        modelAccuracy: 98.5
    });

    const [nodeStatus, setNodeStatus] = useState({
        synced: true,
        height: 1245032,
        moniker: 'BridgeGuard AI Validator',
        network: 'qie-testnet-3'
    });

    const [transactions, setTransactions] = useState([
        { hash: "0x7a8b...9c2d", type: "MsgSend", time: "2s ago", from: "qie1...9k2l", amt: "1,500 QIE" },
        { hash: "0xe3f1...5a8b", type: "MsgDelegate", time: "12s ago", from: "qie1...p4m9", amt: "50,000 QIE" },
        { hash: "0x9c2d...1e4f", type: "MsgVote", time: "45s ago", from: "qie1...x8r2", amt: "-" },
        { hash: "0x4f1a...3b9d", type: "MsgSend", time: "1m ago", from: "qie1...v3n7", amt: "250 QIE" },
        { hash: "0x1e2f...8c4a", type: "MsgWithdraw", time: "2m ago", from: "qie1...k9l2", amt: "12.5 QIE" },
    ]);

    // Live Block Updates and transactions
    useEffect(() => {
        const interval = setInterval(() => {
            setNodeStatus(prev => ({ ...prev, height: prev.height + 1 }));

            // Add new Transaction
            const newTx = {
                hash: "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4),
                type: ["MsgSend", "MsgDelegate", "MsgVote", "MsgWithdraw"][Math.floor(Math.random() * 4)],
                time: "Just now",
                from: "qie1..." + Math.random().toString(36).substr(2, 4),
                amt: (Math.random() * 1000).toFixed(2) + " QIE"
            };

            setTransactions(prev => [newTx, ...prev.slice(0, 9)]);

            // Randomly toggle anomalies rarely
            if (Math.random() > 0.95) {
                setStats(prev => ({ ...prev, anomalies24h: prev.anomalies24h + 1 }));
            }
        }, 3000); // Update every 3 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen ? 0 : -300 }}
                className={`fixed md:relative z-40 w-64 h-full bg-slate-800 border-r border-slate-700 flex flex-col transition-transform duration-300`}
            >
                <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">BridgeGuard</h1>
                </div>

                {/* Node Status Widget */}
                <div className="mx-4 mt-6 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">QIE Node</span>
                        <div className={`w-2 h-2 rounded-full ${nodeStatus.synced ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`}></div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Height</span>
                            <span className="text-green-400 font-mono">#{nodeStatus.height.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Status</span>
                            <span className={nodeStatus.synced ? 'text-green-400' : 'text-yellow-400'}>
                                {nodeStatus.synced ? 'Synced' : 'Syncing...'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: Activity },
                        { id: 'transactions', label: 'Transactions', icon: Globe },
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'validators', label: 'Validators', icon: CheckCircle },
                        { id: 'alerts', label: 'Alerts', icon: Bell },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                            {activeSection === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                        </button>
                    ))}
                </nav>

                {/* User / Contact Section */}
                <div className="p-4 border-t border-slate-700 space-y-2">
                    <button
                        onClick={() => setActiveSection('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'profile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        <User className="w-5 h-5" />
                        UserProfile
                    </button>

                    <a href="/contact" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-all">
                        <div className="w-5 h-5 flex items-center justify-center">📧</div>
                        Contact Us
                    </a>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 z-10 sticky top-0">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-400 hover:text-white">
                        <Menu />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="hidden md:flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                            {['qie', 'qie-testnet', 'eth'].map(net => (
                                <button
                                    key={net}
                                    onClick={() => setSelectedNetwork(net)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${selectedNetwork === net ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {net.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <button className="relative text-slate-400 hover:text-white transition">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        </button>

                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 border-2 border-slate-800" />
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-white capitalize">{activeSection.replace('-', ' ')}</h2>
                                <p className="text-slate-400 mt-1">Real-time monitoring and security insights</p>
                            </div>
                            <div className="text-right hidden md:block">
                                <div className="text-sm text-slate-500">Last updated</div>
                                <div className="font-mono text-green-400">Just now</div>
                            </div>
                        </div>

                        {/* Dynamic Content Switching */}
                        <AnimatePresence mode="wait">
                            {activeSection === 'dashboard' && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <MetricCard label="Active Bridges" value={stats.activeBridges} icon={Boxes} color="blue" />
                                        <MetricCard label="Anomalies (24h)" value={stats.anomalies24h} icon={AlertTriangle} color="red" />
                                        <MetricCard label="Validation Rate" value={stats.validationRate + '%'} icon={CheckCircle} color="green" />
                                        <MetricCard label="Model Prediction" value={stats.modelAccuracy + '%'} icon={TrendingUp} color="purple" />
                                    </div>

                                    {/* Charts Area with Mock Visuals */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
                                            <h3 className="text-lg font-semibold mb-4">Transaction Volume (24h)</h3>
                                            <div className="h-64 flex items-end justify-between gap-2 px-2">
                                                {[35, 45, 30, 60, 75, 50, 65, 80, 70, 55, 40, 60].map((h, i) => (
                                                    <div key={i} className="w-full bg-blue-500/20 rounded-t-sm relative group">
                                                        <div
                                                            style={{ height: `${h}%` }}
                                                            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm transition-all duration-500 group-hover:bg-blue-400"
                                                        ></div>
                                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10">{h * 12} Txs</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
                                            <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
                                            <div className="h-64 flex flex-col justify-center gap-4">
                                                {['Low Risk', 'Medium Risk', 'High Risk'].map((label, i) => (
                                                    <div key={label}>
                                                        <div className="flex justify-between text-sm mb-1 text-slate-400">
                                                            <span>{label}</span>
                                                            <span>{['85%', '12%', '3%'][i]}</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${['bg-green-500', 'bg-yellow-500', 'bg-red-500'][i]}`}
                                                                style={{ width: ['85%', '12%', '3%'][i] }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'transactions' && (
                                <motion.div
                                    key="transactions"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl"
                                >
                                    <div className="p-6 border-b border-slate-700">
                                        <h3 className="text-xl font-bold">Latest Transactions</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
                                                <tr>
                                                    <th className="p-4">Tx Hash</th>
                                                    <th className="p-4">Type</th>
                                                    <th className="p-4">Age</th>
                                                    <th className="p-4">From</th>
                                                    <th className="p-4">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700">
                                                {transactions.map((tx, i) => (
                                                    <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                                        <td className="p-4 font-mono text-blue-400">{tx.hash}</td>
                                                        <td className="p-4"><span className="px-2 py-1 rounded bg-slate-700 text-xs">{tx.type}</span></td>
                                                        <td className="p-4 text-slate-400">{tx.time}</td>
                                                        <td className="p-4 font-mono text-slate-400">{tx.from}</td>
                                                        <td className="p-4 font-medium">{tx.amt}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'validators' && (
                                <motion.div
                                    key="validators"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    {[1, 2, 3, 4, 5, 6].map((v) => (
                                        <div key={v} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                                                    {['👑', '🛡️', '⚡', '🔒', '🌐', '💎'][v - 1]}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold">{['Cosmos Hub', 'Smart Stake', 'BridgeGuard AI', 'Everstake', 'Polkachu', 'Imperator'][v - 1]}</h4>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        Active
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Voting Power</span>
                                                    <span className="font-mono">{(Math.random() * 5 + 1).toFixed(2)}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Uptime</span>
                                                    <span className="text-green-400">99.9{v}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeSection === 'alerts' && (
                                <motion.div
                                    key="alerts"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-4">
                                        <AlertTriangle className="text-red-500 w-6 h-6 shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-red-400">High Anomaly Detected</h4>
                                            <p className="text-slate-300 text-sm mt-1">Transaction 0x8a7...2b9 exhibited unusual patterns. Similarity score: 0.12 (Threshold: 0.85).</p>
                                            <div className="mt-2 text-xs text-slate-500">2 minutes ago • Module: ML-Bridge-Sentinel</div>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-4">
                                        <Activity className="text-yellow-500 w-6 h-6 shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-yellow-400">Validator Set Change</h4>
                                            <p className="text-slate-300 text-sm mt-1">Voting power distribution changed by &gt;5% in the last epoch.</p>
                                            <div className="mt-2 text-xs text-slate-500">1 hour ago • Module: Governance-Monitor</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'analytics' && (
                                <motion.div
                                    key="analytics"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    {/* Analytics Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                            <div className="text-slate-400 text-sm mb-1">Avg Block Time</div>
                                            <div className="text-3xl font-bold flex items-end gap-2">
                                                2.1s <span className="text-green-400 text-sm mb-1">(-0.2s)</span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
                                                <div className="bg-green-500 h-full w-[85%]"></div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                            <div className="text-slate-400 text-sm mb-1">Peak TPS (24h)</div>
                                            <div className="text-3xl font-bold flex items-end gap-2">
                                                4,250 <span className="text-blue-400 text-sm mb-1">(+12%)</span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full w-[65%]"></div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                            <div className="text-slate-400 text-sm mb-1">Total Gas Used</div>
                                            <div className="text-3xl font-bold flex items-end gap-2">
                                                85.2M <span className="text-purple-400 text-sm mb-1">Gwei</span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
                                                <div className="bg-purple-500 h-full w-[45%]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Network Traffic Chart */}
                                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold">Network Traffic Load</h3>
                                            <select className="bg-slate-900 border border-slate-700 rounded text-sm text-slate-400 px-2 py-1 outline-none">
                                                <option>Last 24 Hours</option>
                                                <option>Last 7 Days</option>
                                            </select>
                                        </div>
                                        <div className="h-64 flex items-end justify-between gap-1">
                                            {Array.from({ length: 24 }).map((_, i) => {
                                                const height = Math.floor(Math.random() * 80) + 10;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                        <div
                                                            className="w-full bg-blue-500/20 rounded-md relative transition-all duration-300 group-hover:bg-blue-500/30"
                                                            style={{ height: `${height}%` }}
                                                        >
                                                            <div
                                                                style={{ height: `${height * 0.7}%` }}
                                                                className="absolute bottom-0 w-full bg-blue-500 rounded-md opacity-60"
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100">{i}:00</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Cross-Chain Bridge Stats */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                            <h3 className="text-lg font-bold mb-4">Bridge Liquidity</h3>
                                            <div className="space-y-4">
                                                {['Ethereum', 'BSC', 'Polygon', 'Avalanche'].map((chain, i) => (
                                                    <div key={chain} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'][i]}`}></div>
                                                            <span className="text-slate-300 font-medium">{chain}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-mono text-white">${(Math.random() * 5 + 1).toFixed(2)}M</div>
                                                            <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                                                +{Math.floor(Math.random() * 10)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                                            <h3 className="text-lg font-bold mb-4">Contract Calls Distribution</h3>
                                            <div className="flex gap-2 h-4 mb-4 rounded-full overflow-hidden bg-slate-900">
                                                <div className="w-[40%] bg-blue-500 h-full"></div>
                                                <div className="w-[30%] bg-green-500 h-full"></div>
                                                <div className="w-[20%] bg-purple-500 h-full"></div>
                                                <div className="w-[10%] bg-yellow-500 h-full"></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> DeFis (40%)</div>
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> NFTs (30%)</div>
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Bridges (20%)</div>
                                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Gaming (10%)</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="max-w-3xl mx-auto"
                                >
                                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                                        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                                            <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full bg-slate-800 p-1">
                                                <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center text-4xl">
                                                    👽
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-16 pb-8 px-8">
                                            <h2 className="text-2xl font-bold">Validator Operator</h2>
                                            <p className="text-slate-400">admin@bridgeguard.ai</p>
                                            <div className="flex gap-2 mt-4">
                                                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">Active Validator</span>
                                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">Testnet</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Contact Us Redirect/Placeholder */}
                            {activeSection === 'contact' && (
                                <div className="text-center py-20">Redirecting...</div>
                                // Logic usually handled by Link or router
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </main>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, color }) {
    const colors = {
        blue: 'text-blue-400 bg-blue-400/10',
        red: 'text-red-400 bg-red-400/10',
        green: 'text-green-400 bg-green-400/10',
        purple: 'text-purple-400 bg-purple-400/10',
    };

    return (
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{label}</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-blue-500'} w-[70%]`}></div>
            </div>
        </div>
    );
}
