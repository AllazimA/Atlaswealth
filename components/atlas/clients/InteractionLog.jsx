import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Mail, Calendar, FileText, Plus, Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";

const interactionIcons = {
  call: Phone,
  meeting: Calendar,
  email: Mail,
  note: FileText,
  follow_up: Clock
};

export default function InteractionLog({ clientId, client, portfolios }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    interaction_type: "call",
    subject: "",
    notes: "",
    outcome: "neutral",
    follow_up_required: false,
    follow_up_date: "",
    follow_up_notes: "",
    duration_minutes: 0
  });

  const generateAISummary = () => {
    if (!formData.notes || formData.notes.length < 20) {
      toast.error("Add more detailed notes first");
      return;
    }

    setAiGenerating(true);
    const type = formData.interaction_type;
    const outcome = formData.outcome;
    const clientName = `${client?.first_name || ""} ${client?.last_name || ""}`.trim();
    const profile = client?.risk_profile || "moderate";

    const summary = `${type.charAt(0).toUpperCase() + type.slice(1)} with ${clientName} regarding "${formData.subject || "portfolio matters"}". Outcome was ${outcome.replace("_", " ")}.`;

    const suggestionSets = {
      call: ["Schedule a follow-up meeting within 30 days", "Send meeting summary email to client", "Update client file with discussed items"],
      meeting: ["Prepare action items and send to client", "Update CRM with meeting outcomes", "Review portfolio performance since last meeting"],
      email: ["Follow up if no response within 3 business days", "Log key points in client notes", "Action any requests mentioned in the email"],
      note: ["Review note during next client contact", "Flag any concerns for senior advisor review"],
      follow_up: ["Confirm completion of previous action items", "Set next review date", "Update client status accordingly"],
    };

    const suggestions = suggestionSets[type] || suggestionSets.note;
    if (outcome === "action_required") suggestions.unshift("Create urgent task for required action item");
    if (profile === "conservative") suggestions.push("Reassure client on capital preservation strategy");

    setFormData(prev => ({ ...prev, ai_summary: summary, ai_suggestions: suggestions }));
    toast.success("Summary generated");
    setAiGenerating(false);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.ClientInteraction.create({
        client_id: clientId,
        ...formData,
        ai_summary: formData.ai_summary || null,
        ai_suggestions: formData.ai_suggestions || []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientInteractions", clientId] });
      toast.success("Interaction logged");
      setOpen(false);
      setFormData({
        interaction_type: "call",
        subject: "",
        notes: "",
        outcome: "neutral",
        follow_up_required: false,
        follow_up_date: "",
        follow_up_notes: "",
        duration_minutes: 0
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900">
          <Plus className="w-4 h-4 mr-2" />
          Log Interaction
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1e293b] border-[#334155] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Log Client Interaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-400">Interaction Type</Label>
              <Select value={formData.interaction_type} onValueChange={(v) => setFormData({ ...formData, interaction_type: v })}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {["call", "meeting", "email", "note", "follow_up"].map(type => (
                    <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Outcome</Label>
              <Select value={formData.outcome} onValueChange={(v) => setFormData({ ...formData, outcome: v })}>
                <SelectTrigger className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e293b] border-[#334155]">
                  {["positive", "neutral", "action_required", "concern"].map(outcome => (
                    <SelectItem key={outcome} value={outcome}>{outcome.replace("_", " ").charAt(0).toUpperCase() + outcome.slice(1).replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              placeholder="e.g. Q4 Portfolio Review"
            />
          </div>

          {(formData.interaction_type === "call" || formData.interaction_type === "meeting") && (
            <div>
              <Label className="text-xs text-slate-400">Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                placeholder="30"
              />
            </div>
          )}

          <div>
            <Label className="text-xs text-slate-400">Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
              rows={5}
              placeholder="Detailed notes from the interaction..."
            />
          </div>

          <Button
            onClick={generateAISummary}
            disabled={aiGenerating || !formData.notes}
            variant="outline"
            className="w-full border-[#334155] text-slate-300 hover:bg-slate-700/30"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {aiGenerating ? "Generating..." : "Generate AI Summary & Suggestions"}
          </Button>

          {formData.ai_summary && (
            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-3">
              <p className="text-xs font-semibold text-[#D4AF37] mb-2">AI Summary</p>
              <p className="text-xs text-slate-300 leading-relaxed">{formData.ai_summary}</p>
              {formData.ai_suggestions && formData.ai_suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Suggested Actions</p>
                  <ul className="space-y-1">
                    {formData.ai_suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-[#D4AF37] mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.follow_up_required}
              onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
              className="rounded"
            />
            <Label className="text-xs text-slate-400">Follow-up required</Label>
          </div>

          {formData.follow_up_required && (
            <div className="space-y-3 pl-6">
              <div>
                <Label className="text-xs text-slate-400">Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-400">Follow-up Notes</Label>
                <Textarea
                  value={formData.follow_up_notes}
                  onChange={(e) => setFormData({ ...formData, follow_up_notes: e.target.value })}
                  className="mt-1 bg-[#0f172a] border-[#334155] text-slate-100"
                  rows={3}
                  placeholder="Action items for follow-up..."
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!formData.subject || createMutation.isPending}
              className="flex-1 bg-[#D4AF37] hover:bg-[#C49F27] text-slate-900"
            >
              {createMutation.isPending ? "Saving..." : "Save Interaction"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#334155] text-slate-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}