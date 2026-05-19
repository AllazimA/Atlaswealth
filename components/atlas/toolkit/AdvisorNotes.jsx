import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Save, Archive, Paperclip, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdvisorNotes() {
  const [notes, setNotes] = useState([
    { 
      id: 1, 
      content: "Fed rate decision coming up - prepare client briefing on bond portfolio impact", 
      tag: "market", 
      date: new Date(),
      archived: false
    },
    { 
      id: 2, 
      content: "Review Johnson portfolio - rebalancing needed after tech rally", 
      tag: "portfolio", 
      date: new Date(),
      archived: false
    }
  ]);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("market");
  const [filter, setFilter] = useState("all");

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      content: newNote,
      tag: newTag,
      date: new Date(),
      archived: false
    };
    
    setNotes([note, ...notes]);
    setNewNote("");
    toast.success("Note saved");
  };

  const archiveNote = (id) => {
    setNotes(notes.map(n => n.id === id ? {...n, archived: true} : n));
    toast.success("Note archived");
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success("Note deleted");
  };

  const filteredNotes = notes.filter(n => {
    if (filter === "archived") return n.archived;
    if (filter === "all") return !n.archived;
    return !n.archived && n.tag === filter;
  });

  const tagColors = {
    market: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    client: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    portfolio: "bg-violet-500/20 text-violet-400 border-violet-500/30"
  };

  return (
    <Card className="border-[#334155] bg-[#1e293b] h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            Advisor Notes & Scratchpad
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 h-7 text-xs bg-[#0f172a] border-[#334155] text-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-[#334155]">
              <SelectItem value="all">Active</SelectItem>
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="portfolio">Portfolio</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* New Note Input */}
        <div className="space-y-2 p-3 rounded-lg bg-[#0f172a]/50 border border-[#334155]">
          <Textarea 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a quick note..."
            className="min-h-[80px] bg-[#0f172a] border-[#334155] text-slate-100 resize-none"
          />
          <div className="flex items-center gap-2">
            <Select value={newTag} onValueChange={setNewTag}>
              <SelectTrigger className="w-32 h-8 text-xs bg-[#0f172a] border-[#334155] text-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-[#334155]">
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm"
              onClick={addNote}
              disabled={!newNote.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
            >
              <Save className="w-3 h-3 mr-1" />
              Save Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-auto space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No notes yet</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div 
                key={note.id}
                className={`p-3 rounded-lg border transition-colors ${
                  note.archived 
                    ? "bg-slate-800/30 border-slate-700/30" 
                    : "bg-[#0f172a]/50 border-[#334155] hover:border-orange-500/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={`${tagColors[note.tag]} text-xs`}>
                    {note.tag}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {!note.archived && (
                      <>
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs text-slate-500 hover:text-orange-400 hover:bg-orange-500/10"
                        >
                          <Paperclip className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => archiveNote(note.id)}
                          className="h-6 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-700/30"
                        >
                          <Archive className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNote(note.id)}
                      className="h-6 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${note.archived ? "text-slate-500" : "text-slate-300"}`}>
                  {note.content}
                </p>
                <p className="text-xs text-slate-600 mt-2">
                  {format(note.date, "MMM d, yyyy • h:mm a")}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}