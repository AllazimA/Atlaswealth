import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function HoldingsPreview({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
        <p className="text-sm text-slate-400">No holdings to display</p>
      </div>
    );
  }

  const totalWeight = holdings.reduce((sum, h) => sum + (h.weight || 0), 0);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-100">Holdings Preview</h3>
        <p className="text-xs text-slate-400 mt-1">
          Total Weight: {totalWeight.toFixed(2)}% {totalWeight !== 100 && "(Must equal 100%)"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-400">Ticker</TableHead>
              <TableHead className="text-slate-400">Name</TableHead>
              <TableHead className="text-slate-400">Type</TableHead>
              <TableHead className="text-slate-400 text-right">Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding, idx) => (
              <TableRow key={idx} className="border-slate-700 hover:bg-slate-700/50">
                <TableCell className="font-medium text-slate-100">{holding.ticker}</TableCell>
                <TableCell className="text-slate-300 text-sm">{holding.name}</TableCell>
                <TableCell className="text-slate-400 text-xs uppercase">{holding.asset_type}</TableCell>
                <TableCell className="text-right text-slate-100">{holding.weight}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}