import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function ClientReviewTimeline({ client, tasks = [] }) {
  if (!client) return null;

  const today = new Date();
  const lastReview = client.last_review_date ? new Date(client.last_review_date) : null;
  const nextReview = client.next_review_date ? new Date(client.next_review_date) : null;
  
  const daysSinceLastReview = lastReview ? differenceInDays(today, lastReview) : null;
  const daysUntilNextReview = nextReview ? differenceInDays(nextReview, today) : null;

  const pendingTasks = tasks.filter(t => t.client_id === client.id && t.status !== "completed");
  const isOverdue = daysUntilNextReview !== null && daysUntilNextReview < 0;

  return (
    <Card className="border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Review Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Last Review */}
        {lastReview && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-800">Last Review</p>
              <p className="text-xs text-gray-500">{format(lastReview, "MMM d, yyyy")}</p>
              {daysSinceLastReview !== null && (
                <p className="text-xs text-gray-400 mt-0.5">{daysSinceLastReview} days ago</p>
              )}
            </div>
          </div>
        )}

        {/* Next Review */}
        {nextReview && (
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isOverdue ? "bg-red-50" : "bg-blue-50"
            }`}>
              {isOverdue ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <Clock className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-800">Next Review</p>
                {isOverdue && (
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">Overdue</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">{format(nextReview, "MMM d, yyyy")}</p>
              {daysUntilNextReview !== null && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {isOverdue ? `${Math.abs(daysUntilNextReview)} days overdue` : `in ${daysUntilNextReview} days`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pending Actions */}
        {pendingTasks.length > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-800 mb-2">Pending Actions ({pendingTasks.length})</p>
            <div className="space-y-2">
              {pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <p className="text-gray-600 flex-1">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!lastReview && !nextReview && pendingTasks.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">No review history available</p>
        )}
      </CardContent>
    </Card>
  );
}