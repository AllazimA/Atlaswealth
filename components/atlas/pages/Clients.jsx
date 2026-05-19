import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, ChevronRight, Calendar, Phone, Mail,
  MessageCircle, User, AlertTriangle,
  FileText, X, Edit2, Trash2, ExternalLink
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ClientForm from "../components/clients/ClientForm";
import { format, isPast } from "date-fns";

// ── colour maps ───────────────────────────────────────────────────────────────
const profileColors = {
  conservative: "bg-slate-600 text-slate-100 border-slate-500",
  moderate:     "bg-amber-600 text-white border-amber-500",
  aggressive:   "bg-blue-600 text-white border-blue-500",
};
const statusColors = {
  pending:  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  active:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-700/30 text-slate-400 border-slate-600/30",
  archived: "bg-slate-700/30 text-slate-400 border-slate-600/30",
};
const avatarBg = [
  "bg-orange-500/20 text-orange-400",
  "bg-blue-500/20 text-blue-400",
  "bg-amber-500/20 text-amber-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
  "bg-rose-500/20 text-rose-400",
];

// ── main ──────────────────────────────────────────────────────────────────────
export default function Clients() {
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();
  const [showForm, setShowForm]           = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selected, setSelected]           = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterRisk, setFilterRisk]       = useState("all");
  const [noteText, setNoteText]           = useState("");
  const [activeTab, setActiveTab]         = useState("notes");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("new") === "true") setShowForm(true);
  }, []);

  // ── queries ──────────────────────────────────────────────────────────────
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date", 200),
  });

  const { data: interactions = [], refetch: refetchInteractions } = useQuery({
    queryKey: ["interactions", selected?.id],
    queryFn: () => base44.entities.ClientInteraction.filter({ client_id: selected.id }, "-created_date", 50),
    enabled: !!selected?.id,
  });

  const { data: clientPortfolios = [] } = useQuery({
    queryKey: ["clientPortfolios", selected?.id],
    queryFn: () => base44.entities.Portfolio.filter({ client_id: selected.id }),
    enabled: !!selected?.id,
  });

  // Load all portfolios to calculate AUM per client in the list
  const { data: allPortfolios = [] } = useQuery({
    queryKey: ["allPortfolios"],
    queryFn: () => base44.entities.Portfolio.list(),
  });
  const aumByClient = allPortfolios.reduce((acc, p) => {
    if (p.client_id) acc[p.client_id] = (acc[p.client_id] || 0) + (p.total_value || 0);
    return acc;
  }, {});

  // ── mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowForm(false);
      setSelected(newClient);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setSelected(updated);
      setShowForm(false);
      setEditingClient(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setSelected(null);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (text) => base44.entities.ClientInteraction.create({
      client_id: selected.id,
      type: "note",
      notes: text,
      date: new Date().toISOString(),
    }),
    onSuccess: () => {
      setNoteText("");
      refetchInteractions();
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.ClientInteraction.delete(id),
    onSuccess: () => refetchInteractions(),
  });

  // ── filter ────────────────────────────────────────────────────────────────
  const filtered = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchName  = !q || `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
                         || (c.email || "").toLowerCase().includes(q)
                         || (c.phone || "").includes(q);
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchRisk   = filterRisk === "all" || c.risk_profile === filterRisk;
    return matchName && matchStatus && matchRisk;
  });

  const handleSave = (formData) => {
    if (editingClient) updateMutation.mutate({ id: editingClient.id, data: formData });
    else createMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Delete ${selected.first_name} ${selected.last_name}? This cannot be undone.`)) return;
    deleteMutation.mutate(selected.id);
  };

  // keep selected in sync with fresh query data
  useEffect(() => {
    if (selected) {
      const fresh = clients.find(c => c.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [clients]);

  const selectedIdx = selected ? clients.findIndex(c => c.id === selected.id) : -1;

  // ── notes filter ──────────────────────────────────────────────────────────
  const notes    = interactions.filter(i => i.type === "note");
  const calls    = interactions.filter(i => i.type === "call" || i.type === "phone");
  const emails   = interactions.filter(i => i.type === "email");
  const meetings = interactions.filter(i => i.type === "meeting");

  // ── alerts for selected client ────────────────────────────────────────────
  const alerts = selected ? (() => {
    const a = [];
    if (selected.next_review_date && isPast(new Date(selected.next_review_date)))
      a.push({ color: "text-red-400", label: "Review overdue" });
    if (!selected.risk_profile)
      a.push({ color: "text-amber-400", label: "No risk profile" });
    const activePortfolios = clientPortfolios.filter(p => p.status === "active");
    if (activePortfolios.length === 0)
      a.push({ color: "text-blue-400", label: "No active portfolio" });
    return a;
  })() : [];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Clients</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your client portfolio</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setShowForm(true); }}
          className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="w-4 h-4 mr-1.5" /> New Client
        </Button>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input placeholder="Search clients..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#1e293b] border-[#334155] text-slate-100 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 bg-[#1e293b] border-[#334155] text-slate-100 h-9 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-[#334155]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRisk} onValueChange={setFilterRisk}>
          <SelectTrigger className="w-36 bg-[#1e293b] border-[#334155] text-slate-100 h-9 text-xs">
            <SelectValue placeholder="Risk Profile" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-[#334155]">
            <SelectItem value="all">All Risk Profiles</SelectItem>
            <SelectItem value="conservative">Conservative</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="aggressive">Aggressive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Two-panel layout ────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* LEFT: Client List */}
        <div className={`flex flex-col ${selected ? "w-[55%]" : "w-full"} min-w-0 transition-all duration-200`}>
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-[#0f172a] rounded-t-xl border border-[#334155] border-b-0">
            <span>Client</span>
            <span>Status</span>
            <span>Risk Profile</span>
            <span className="hidden md:block">AUM</span>
            <span></span>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#1e293b] rounded-b-xl border border-[#334155]">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full bg-slate-700" />
                    <div className="flex-1"><Skeleton className="h-3.5 w-32 mb-1.5 bg-slate-700" /><Skeleton className="h-3 w-20 bg-slate-700" /></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <User className="w-8 h-8 text-slate-600" />
                <p className="text-sm text-slate-400">No clients found</p>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => setShowForm(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add First Client
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {filtered.map((client, i) => {
                  const isSelected = selected?.id === client.id;
                  const isOverdue  = client.next_review_date && isPast(new Date(client.next_review_date));
                  return (
                    <div key={client.id}
                      onClick={() => setSelected(isSelected ? null : client)}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center px-4 py-3 cursor-pointer transition-all ${
                        isSelected ? "bg-orange-500/10 border-l-2 border-orange-500" : "hover:bg-slate-700/20 border-l-2 border-transparent"
                      }`}>
                      {/* Name + avatar */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          {client.photo_url && <AvatarImage src={client.photo_url} alt={`${client.first_name} ${client.last_name}`} />}
                          <AvatarFallback className={`${avatarBg[i % avatarBg.length]} text-xs font-bold`}>
                            {client.first_name?.[0]}{client.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-slate-100 truncate">
                            {client.first_name} {client.last_name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {client.risk_profile ? client.risk_profile.charAt(0).toUpperCase() + client.risk_profile.slice(1) : "Unassessed"}
                          </p>
                        </div>
                      </div>
                      {/* Status */}
                      <Badge variant="outline" className={`text-[10px] px-2 h-5 font-bold w-fit ${statusColors[client.status] || statusColors.pending}`}>
                        {client.status || "pending"}
                      </Badge>
                      {/* Risk */}
                      <Badge variant="outline" className={`text-[10px] px-2 h-5 font-bold w-fit ${profileColors[client.risk_profile] || "bg-slate-700/30 text-slate-400 border-slate-600/30"}`}>
                        {client.risk_profile || "—"}
                      </Badge>
                      {/* AUM */}
                      <span className="hidden md:block text-[13px] font-semibold text-slate-100">
                        ${(aumByClient[client.id] || 0).toLocaleString()}
                      </span>
                      {/* Alerts */}
                      <div className="flex items-center gap-1.5">
                        {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        {client.next_review_date && !isOverdue && <Calendar className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer count */}
          <p className="text-xs text-slate-500 mt-2 px-1">
            {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* RIGHT: Client Detail Panel */}
        {selected && (
          <div className="w-[45%] flex flex-col bg-[#1e293b] rounded-xl border border-[#334155] min-h-0 overflow-hidden flex-shrink-0">
            {/* Panel header */}
            <div className="p-4 border-b border-[#334155] flex items-start gap-3">
              <Avatar className="w-12 h-12 flex-shrink-0">
                {selected.photo_url && <AvatarImage src={selected.photo_url} alt={`${selected.first_name} ${selected.last_name}`} />}
                <AvatarFallback className={`${avatarBg[selectedIdx % avatarBg.length]} text-sm font-bold`}>
                  {selected.first_name?.[0]}{selected.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[15px] font-bold text-slate-100">{selected.first_name} {selected.last_name}</h2>
                  <Badge variant="outline" className={`text-[10px] px-2 h-5 font-bold ${statusColors[selected.status] || statusColors.pending}`}>
                    {selected.status || "pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {selected.email && <span className="text-[11px] text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" />{selected.email}</span>}
                  {selected.phone && <span className="text-[11px] text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{selected.phone}</span>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 divide-x divide-[#334155] border-b border-[#334155]">
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">AUM</p>
                <p className="text-sm font-bold text-[#D4AF37]">
                  ${clientPortfolios.reduce((sum, p) => sum + (p.total_value || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Horizon</p>
                <p className="text-sm font-bold text-slate-100">{selected.investment_horizon || "—"}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Portfolios</p>
                <p className="text-sm font-bold text-slate-100">{clientPortfolios.filter(p => p.status === "active").length}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 p-3 border-b border-[#334155] flex-wrap">
              {selected.phone && (
                <a href={`tel:${selected.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              )}
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700/20 hover:bg-emerald-700/30 text-emerald-300 rounded-lg text-xs font-medium transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}
              <button onClick={() => { setEditingClient(selected); setShowForm(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 rounded-lg text-xs font-medium transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => navigate(createPageUrl("ClientDetail") + `?id=${selected.id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg text-xs font-medium transition-colors ml-auto">
                Full Profile <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="px-3 py-2 border-b border-[#334155] flex gap-2 flex-wrap">
                {alerts.map((a, i) => (
                  <span key={i} className={`text-[11px] flex items-center gap-1 ${a.color}`}>
                    <AlertTriangle className="w-3 h-3" />{a.label}
                  </span>
                ))}
              </div>
            )}

            {/* Tabs: Notes / Activity */}
            <div className="flex border-b border-[#334155]">
              {[
                { key: "notes", label: "Notes", count: notes.length },
                { key: "activity", label: "Activity", count: interactions.length },
                { key: "portfolios", label: "Portfolios", count: clientPortfolios.length },
              ].map(tab => (
                <button key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === tab.key ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-400 hover:text-slate-200"
                  }`}>
                  {tab.label}
                  {tab.count > 0 && <span className="text-[10px] bg-slate-700 rounded-full px-1.5">{tab.count}</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">

              {/* Notes tab */}
              {activeTab === "notes" && (
                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note for this client..."
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      className="bg-[#0f172a] border-[#334155] text-slate-100 text-xs resize-none h-16"
                      onKeyDown={e => {
                        if (e.key === "Enter" && e.metaKey && noteText.trim()) {
                          addNoteMutation.mutate(noteText.trim());
                        }
                      }}
                    />
                  </div>
                  <Button size="sm" onClick={() => noteText.trim() && addNoteMutation.mutate(noteText.trim())}
                    disabled={!noteText.trim() || addNoteMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-7 px-3">
                    Save Note
                  </Button>
                  {notes.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No notes yet</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {notes.map(n => (
                        <div key={n.id} className="bg-[#0f172a] rounded-lg p-3 border border-[#334155] group">
                          <p className="text-xs text-slate-200 leading-relaxed">{n.notes}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-slate-500">
                              {format(new Date(n.created_date || n.date), "MMM d, yyyy · h:mm a")}
                            </span>
                            <button onClick={() => deleteNoteMutation.mutate(n.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity tab */}
              {activeTab === "activity" && (
                <div className="p-3 space-y-2">
                  {interactions.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No activity yet</p>
                  ) : (
                    interactions.map(item => (
                      <div key={item.id} className="flex items-start gap-2.5 p-2.5 bg-[#0f172a] rounded-lg border border-[#334155]">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          item.type === "note"    ? "bg-blue-500/10 text-blue-400"
                        : item.type === "call"    ? "bg-emerald-500/10 text-emerald-400"
                        : item.type === "email"   ? "bg-orange-500/10 text-orange-400"
                        : item.type === "meeting" ? "bg-purple-500/10 text-purple-400"
                        : "bg-slate-700/30 text-slate-400"
                        }`}>
                          {item.type === "call"    ? <Phone className="w-3 h-3" />
                         : item.type === "email"   ? <Mail className="w-3 h-3" />
                         : item.type === "meeting" ? <Calendar className="w-3 h-3" />
                         : <FileText className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-200 capitalize font-medium">{item.type}</p>
                          {item.notes && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.notes}</p>}
                          <p className="text-[10px] text-slate-500 mt-1">
                            {format(new Date(item.created_date || item.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Portfolios tab */}
              {activeTab === "portfolios" && (
                <div className="p-3 space-y-2">
                  {clientPortfolios.length === 0 ? (
                    <div className="text-center py-4 space-y-2">
                      <p className="text-xs text-slate-500">No portfolios yet</p>
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs h-7"
                        onClick={() => navigate(createPageUrl("PortfolioBuilder"))}>
                        Build Portfolio
                      </Button>
                    </div>
                  ) : (
                    clientPortfolios.map(p => (
                      <div key={p.id} className="bg-[#0f172a] rounded-lg p-3 border border-[#334155]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-100">{p.name || "Portfolio"}</p>
                          <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${p.status === "active" ? "text-emerald-400 border-emerald-500/30" : "text-slate-400 border-slate-600/30"}`}>
                            {p.status}
                          </Badge>
                        </div>
                        <div className="flex gap-3 mt-1.5">
                          {p.return_pct !== undefined && (
                            <span className={`text-[11px] font-medium ${(p.return_pct || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {(p.return_pct || 0) >= 0 ? "+" : ""}{(p.return_pct || 0).toFixed(1)}% return
                            </span>
                          )}
                          {p.needs_rebalancing && <span className="text-[11px] text-amber-400">Needs rebalancing</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Bottom action */}
            <div className="p-3 border-t border-[#334155] flex gap-2">
              <Button size="sm" variant="outline"
                className="flex-1 border-[#334155] text-slate-300 hover:text-slate-100 text-xs h-8"
                onClick={() => navigate(createPageUrl("ClientAssessment") + `?clientId=${selected.id}`)}>
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Assessment
              </Button>
              <Button size="sm"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
                onClick={() => navigate(createPageUrl("ClientDetail") + `?id=${selected.id}`)}>
                Full Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingClient(null); }}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
