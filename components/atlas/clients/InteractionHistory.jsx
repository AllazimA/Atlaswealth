import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, FileText, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const interactionIcons = {
  call: Phone,
  meeting: Calendar,
  email: Mail,
  note: FileText,
  follow_up: Clock
};

const outcomeColors = {
  positive: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  neutral: { bg: "bg-slate-700/30", text: "text-slate-400", border: "border-slate-600" },
  action_required: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  concern: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" }
};

export default function InteractionHistory({ clientId }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ["clientInteractions", clientId],
    queryFn: () => base44.entities.ClientInteraction.filter({ client_id: clientId }, "-created_date", 50),
    enabled: !!clientId
  });

  const completeFollowUpMutation = useMutation({
    mutationFn: async (interactionId) => {
      return await base44.entities.ClientInteraction.update(interactionId, { completed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientInteractions", clientId] });
      toast.success("Follow-up marked complete");
    }
  });

  const filteredInteractions = interactions.filter(interaction => {
    if (filter === "all") return true;
    if (filter === "follow_ups") return interaction.follow_up_required && !interaction.completed;
    return interaction.interaction_type === filter;
  });

  const pendingFollowUps = interactions.filter(i => i.follow_up_required && !i.completed && new Date(i.follow_up_date) <= new Date());

  return (
    <Card className="border-[#334155] bg-[#1e293b]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-100">Communication History</CardTitle>
          {pendingFollowUps.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {pendingFollowUps.length} Pending
            </Badge>
          )}
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {["all", "call", "meeting", "email", "follow_ups"].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                filter === type
                  ? "bg-[#D4AF37] text-slate-900"
                  : "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              {type.replace("_", " ").charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-700/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredInteractions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No interactions logged yet</p>
        ) : (
          <div className="space-y-3">
            {filteredInteractions.map(interaction => {
              const Icon = interactionIcons[interaction.interaction_type] || FileText;
              const colors = outcomeColors[interaction.outcome] || outcomeColors.neutral;
              const isOverdue = interaction.follow_up_required && !interaction.completed && new Date(interaction.follow_up_date) < new Date();

              return (
                <div
                  key={interaction.id}
                  className={`border rounded-lg p-3 ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">{interaction.subject}</h4>
                        <Badge className={`${colors.bg} ${colors.text} ${colors.border} text-[9px] flex-shrink-0`}>
                          {interaction.outcome.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{format(new Date(interaction.created_date), "MMM d, yyyy • h:mm a")}</p>
                      {interaction.duration_minutes > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">{interaction.duration_minutes} minutes</p>
                      )}

                      {interaction.notes && (
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2">{interaction.notes}</p>
                      )}

                      {interaction.ai_summary && (
                        <div className="mt-2 bg-[#0f172a] border border-slate-700/50 rounded p-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                            <span className="text-[10px] font-semibold text-[#D4AF37]">AI Summary</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed">{interaction.ai_summary}</p>
                        </div>
                      )}

                      {interaction.ai_suggestions && interaction.ai_suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {interaction.ai_suggestions.slice(0, 2).map((suggestion, idx) => (
                            <div key={idx} className="text-[10px] text-slate-400 flex items-start gap-1.5">
                              <span className="text-[#D4AF37] mt-0.5">→</span>
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}

                      {interaction.follow_up_required && !interaction.completed && (
                        <div className={`mt-3 pt-3 border-t ${isOverdue ? 'border-red-500/30' : 'border-slate-700/50'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-400' : 'text-amber-400'}`} />
                                <span className={`text-xs font-semibold ${isOverdue ? 'text-red-400' : 'text-amber-400'}`}>
                                  Follow-up {isOverdue ? 'Overdue' : 'Due'}: {format(new Date(interaction.follow_up_date), "MMM d, yyyy")}
                                </span>
                              </div>
                              {interaction.follow_up_notes && (
                                <p className="text-[10px] text-slate-400 mt-1 ml-5">{interaction.follow_up_notes}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => completeFollowUpMutation.mutate(interaction.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[10px] px-2"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      )}

                      {interaction.completed && interaction.follow_up_required && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-medium">Follow-up completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}