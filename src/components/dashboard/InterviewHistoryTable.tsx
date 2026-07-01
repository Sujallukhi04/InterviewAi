"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteSessionAction, retrySessionAction } from "@/actions/session";
import {
  Trash2,
  FileText,
  Play,
  Loader2,
  CalendarDays,
  SlidersHorizontal,
  MoreVertical,
  MessageSquare,
  Star,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

interface SessionData {
  id: string;
  type: string;
  status: string;
  startedAt: Date | string;
  endedAt: Date | string | null;
  feedback: { id: string; scores: unknown } | null;
}

interface InterviewHistoryTableProps {
  sessions: SessionData[];
}

function getFormatLabel(type: string): string {
  if (type === "SystemDesign") return "System Design";
  if (type === "HRCultureFit") return "HR / Culture Fit";
  return type;
}

function getFormatDotColor(type: string): string {
  switch (type) {
    case "Behavioral":
      return "bg-[#3B82F6]";
    case "Technical":
      return "bg-[#8B5CF6]";
    case "SystemDesign":
      return "bg-[#F97316]";
    case "HRCultureFit":
    default:
      return "bg-[#00FF87]";
  }
}



function getFormattedDuration(startedAtVal: Date | string, endedAtVal: Date | string | null): string {
  if (!endedAtVal) return "—";
  const startedAt = new Date(startedAtVal);
  const endedAt = new Date(endedAtVal);
  const diffMs = endedAt.getTime() - startedAt.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return "< 1 min";
  if (diffMins <= 60) return `${diffMins} min`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}





export default function InterviewHistoryTable({ sessions }: InterviewHistoryTableProps) {
  const router = useRouter();
  const [localSessions, setLocalSessions] = useState<SessionData[]>(sessions);
  const [prevSessions, setPrevSessions] = useState<SessionData[]>(sessions);

  // States
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetryInTable = async (sessionId: string) => {
    setRetryingId(sessionId);
    try {
      const result = await retrySessionAction(sessionId);
      if (result.success && result.newSessionId) {
        toast.success("Retrying session. Redirecting...");
        router.push(`/interview/${result.newSessionId}`);
      } else {
        toast.error(result.error || "Failed to retry session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to retry session.");
    } finally {
      setRetryingId(null);
    }
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Sync prop changes
  if (sessions !== prevSessions) {
    setPrevSessions(sessions);
    setLocalSessions(sessions);
    setCurrentPage(1);
    setSelectedRows(new Set());
    setSelectedDate(null);
  }

  // Pre-calculate chronological interview numbers across all sessions ordered by date ascending
  const chronologicalIds = [...localSessions]
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
    .map((s) => s.id);

  const getInterviewNumber = (id: string): number => {
    return chronologicalIds.indexOf(id) + 1;
  };



  // Reset page when filters change
  const [prevFilterType, setPrevFilterType] = useState(filterType);
  const [prevFilterStatus, setPrevFilterStatus] = useState(filterStatus);
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);

  if (
    filterType !== prevFilterType ||
    filterStatus !== prevFilterStatus ||
    selectedDate !== prevSelectedDate
  ) {
    setPrevFilterType(filterType);
    setPrevFilterStatus(filterStatus);
    setPrevSelectedDate(selectedDate);
    setCurrentPage(1);
  }

  // Filtering
  const filteredSessions = localSessions.filter((session) => {
    if (filterType && session.type !== filterType) return false;
    if (filterStatus && session.status !== filterStatus) return false;
    if (selectedDate) {
      const sessionDate = new Date(session.startedAt);
      if (
        sessionDate.getFullYear() !== selectedDate.getFullYear() ||
        sessionDate.getMonth() !== selectedDate.getMonth() ||
        sessionDate.getDate() !== selectedDate.getDate()
      ) {
        return false;
      }
    }
    return true;
  });

  // Sorting
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    const timeA = new Date(a.startedAt).getTime();
    const timeB = new Date(b.startedAt).getTime();
    return timeB - timeA;
  });

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentPagedSessions = sortedSessions.slice(startIndex, startIndex + pageSize);

  // Checkbox functions
  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allPagedIds = currentPagedSessions.map((s) => s.id);
    const areAllPagedSelected = allPagedIds.every((id) => selectedRows.has(id));

    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (areAllPagedSelected) {
        allPagedIds.forEach((id) => next.delete(id));
      } else {
        allPagedIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Deletions
  const handleDelete = async (sessionId: string) => {
    const originalSessions = localSessions;
    setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(sessionId);
      return next;
    });
    setDeletingId(sessionId);

    const result = await deleteSessionAction(sessionId);
    if (result.success) {
      toast.success("Session deleted successfully");
    } else {
      setLocalSessions(originalSessions);
      toast.error(result.error || "Failed to delete session");
    }
    setDeletingId(null);
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedRows);

    setLocalSessions((prev) => prev.filter((s) => !selectedRows.has(s.id)));
    setSelectedRows(new Set());
    setIsBulkDeleting(true);

    let successCount = 0;
    let failCount = 0;

    for (const id of idsToDelete) {
      const result = await deleteSessionAction(id);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} session(s) deleted`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} session(s)`);
    }
    setIsBulkDeleting(false);
  };

  const isAllPagedSelected =
    currentPagedSessions.length > 0 &&
    currentPagedSessions.every((s) => selectedRows.has(s.id));

  return (
    <div className="space-y-4">
        
        {/* Top Action Bar (Conditional Bulk / Filter) */}
        {selectedRows.size > 0 ? (
          /* Bulk selection bar */
          <div className="flex items-center justify-between bg-[rgba(0,255,135,0.06)] border border-[#00FF87]/20 px-4 py-3 rounded-lg transition-all">
            <span className="text-sm font-semibold text-zinc-100">
              {selectedRows.size} session{selectedRows.size === 1 ? "" : "s"} selected
            </span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedRows(new Set())}
                className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer underline underline-offset-4"
              >
                Clear
              </button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <button className={cn(
                      buttonVariants({ variant: "destructive", size: "sm" }),
                      "bg-red-600 hover:bg-red-500 text-white cursor-pointer h-8 px-3 rounded-md text-xs font-semibold"
                    )}>
                      {isBulkDeleting ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Delete Selected
                    </button>
                  }
                />
                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-50 max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white text-lg">
                      Delete Selected Sessions
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400 text-sm mt-2">
                      This will permanently delete the {selectedRows.size} selected session(s), including all transcripts and feedback reports. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-4 gap-2">
                    <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-500 text-white border-transparent"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          /* Normal top bar */
          <div className="flex items-center justify-between">
            {/* Date Filter Popover */}
            <Popover>
              <PopoverTrigger
                render={
                  <button
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "gap-2 border-zinc-800 hover:bg-zinc-900 text-zinc-300 flex items-center h-9 cursor-pointer text-xs font-semibold px-4 rounded-lg",
                      selectedDate && "border-[#00FF87] text-[#00FF87] hover:text-[#00FF87]"
                    )}
                  >
                    <CalendarDays className={cn("w-4 h-4 text-zinc-400", selectedDate && "text-[#00FF87]")} />
                    {selectedDate
                      ? format(selectedDate, "MMM do, yyyy")
                      : "Filter by date"}
                  </button>
                }
              />
              <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-200" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={(date) => {
                    setSelectedDate(date ?? null);
                    setCurrentPage(1);
                  }}
                />
                {selectedDate && (
                  <div className="p-2 border-t border-[#1A1A1A]">
                    <button
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "w-full text-zinc-500 hover:text-zinc-300 text-xs font-semibold cursor-pointer py-1.5"
                      )}
                      onClick={() => {
                        setSelectedDate(null);
                        setCurrentPage(1);
                      }}
                    >
                      Clear date filter
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Filter Popover */}
            <Popover>
              <PopoverTrigger
                render={
                  <button className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-zinc-800 hover:bg-zinc-900 text-zinc-300 flex items-center h-9 cursor-pointer"
                  )}>
                    <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                    Filter
                    {(filterType || filterStatus) && (
                      <span className="ml-1.5 h-2 w-2 rounded-full bg-[#00FF87] animate-pulse" />
                    )}
                  </button>
                }
              />
              <PopoverContent className="w-80 bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-200 p-4 rounded-xl shadow-2xl space-y-4">
                
                {/* Section 1 - Type */}
                <div>
                  <div className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Type</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Behavioral", "Technical", "SystemDesign", "HRCultureFit"].map((t) => {
                      const isActive = t === "All" ? !filterType : filterType === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setFilterType(t === "All" ? null : t)}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer",
                            isActive
                              ? "bg-[#00FF87] text-black font-semibold border-transparent"
                              : "bg-[#1A1A1A] text-zinc-400 border-zinc-800/60 hover:text-zinc-200"
                          )}
                        >
                          {t === "SystemDesign" ? "System Design" : t === "HRCultureFit" ? "HR / Culture Fit" : t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2 - Status */}
                <div>
                  <div className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Status</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "completed", "in_progress", "completing"].map((s) => {
                      const isActive = s === "All" ? !filterStatus : filterStatus === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setFilterStatus(s === "All" ? null : s)}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer",
                            isActive
                              ? "bg-[#00FF87] text-black font-semibold border-transparent"
                              : "bg-[#1A1A1A] text-zinc-400 border-zinc-800/60 hover:text-zinc-200"
                          )}
                        >
                          {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters */}
                {(filterType || filterStatus) && (
                  <button
                    onClick={() => {
                      setFilterType(null);
                      setFilterStatus(null);
                    }}
                    className="text-xs text-[#00FF87] hover:text-[#00FF87]/80 font-semibold cursor-pointer transition-colors block text-right w-full pt-1"
                  >
                    Clear Filters
                  </button>
                )}

              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Table Container */}
        <div className="w-full overflow-x-auto rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] shadow-lg">
          <Table>
            <TableHeader className="bg-[#0D0D0D] border-b border-[#0F0F0F]">
              <TableRow className="border-b border-[#0F0F0F] hover:bg-transparent">
                
                {/* Checkbox Header */}
                <TableHead className="w-12 text-center pl-4">
                  <Checkbox
                    checked={isAllPagedSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>

                <TableHead className="text-zinc-300 font-medium text-xs uppercase tracking-wider py-3 px-4 min-w-[150px]">
                  Interview
                </TableHead>

                <TableHead className="text-zinc-300 font-medium text-xs uppercase tracking-wider py-3 px-4">
                  Type
                </TableHead>

                <TableHead className="text-zinc-300 font-medium text-xs uppercase tracking-wider py-3 px-4">
                  Status
                </TableHead>



                <TableHead className="text-zinc-300 font-medium text-xs uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                  Duration
                </TableHead>

                <TableHead className="text-zinc-300 font-medium text-xs uppercase tracking-wider py-3 px-4 hidden md:table-cell">
                  Score
                </TableHead>

                <TableHead className="text-right text-zinc-300 font-medium text-xs uppercase tracking-wider py-3 px-4 pr-6">
                  Actions
                </TableHead>

              </TableRow>
            </TableHeader>
            
            <TableBody>
              {currentPagedSessions.length === 0 ? (
                <TableRow className="hover:bg-transparent border-b border-[#0F0F0F]">
                  <TableCell colSpan={8} className="h-40 text-center py-6 text-zinc-500">
                    {localSessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <MessageSquare className="h-10 w-10 text-[#00FF87]" />
                        <div className="text-sm font-semibold text-zinc-300">No interview sessions yet.</div>
                        <Link
                          href="/interview/new"
                          className={cn(
                            buttonVariants({ variant: "default", size: "sm" }),
                            "bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
                          )}
                        >
                          Start Interview
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="text-sm text-zinc-400">No sessions match your current filters.</div>
                        <button
                          onClick={() => {
                            setFilterType(null);
                            setFilterStatus(null);
                          }}
                          className="text-xs text-[#00FF87] hover:text-[#00FF87]/80 font-semibold cursor-pointer transition-colors block underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                currentPagedSessions.map((session) => {
                  const isSelected = selectedRows.has(session.id);
                  const isRowDeleting = deletingId === session.id;
                  const hasReport = !!session.feedback;
                  const overallScore = (session.feedback?.scores as { overall?: number })?.overall;
                  const interviewNumber = getInterviewNumber(session.id);
                  const isExpired =
                    session.status === "failed" ||
                    (session.status === "in_progress" &&
                      // eslint-disable-next-line react-hooks/purity
                      new Date(session.startedAt).getTime() < Date.now() - 30 * 60 * 1000);

                  return (
                    <TableRow
                      key={session.id}
                      onClick={() => toggleRowSelection(session.id)}
                      className={cn(
                        "border-b border-[#0F0F0F] transition-all cursor-pointer",
                        isSelected
                          ? "bg-[rgba(0,255,135,0.03)] hover:bg-[rgba(0,255,135,0.05)]"
                          : "bg-transparent hover:bg-[#111111]"
                      )}
                    >
                      {/* Checkbox Cell */}
                      <TableCell
                        className={cn(
                          "pl-4 text-center py-3 px-4",
                          isSelected && "border-l-2 border-l-[#00FF87]"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(session.id)}
                        />
                      </TableCell>

                      {/* Interview Sequence Label */}
                      <TableCell className="font-semibold text-zinc-100 py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span>Interview #{interviewNumber}</span>
                          {session.status === "in_progress" && !isExpired && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {session.id.substring(0, 8)}...
                        </div>
                      </TableCell>

                      {/* Interview Type (Dot + Text) */}
                      <TableCell className="py-3 px-4 text-white">
                        <div className="flex items-center space-x-2">
                          <span className={cn("w-2 h-2 rounded-full shrink-0", getFormatDotColor(session.type))} />
                          <span className="text-sm font-medium">{getFormatLabel(session.type)}</span>
                        </div>
                      </TableCell>

                      {/* Status (Pill tag) */}
                      <TableCell className="py-3 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">
                            Expired
                          </span>
                        ) : (
                          <>
                            {session.status === "completed" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                                Completed
                              </span>
                            )}
                            {session.status === "in_progress" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400">
                                In Progress
                              </span>
                            )}
                            {session.status === "completing" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Completing
                              </span>
                            )}
                          </>
                        )}
                      </TableCell>



                      {/* Duration */}
                      <TableCell className="py-3 px-4 font-bold text-zinc-100 hidden md:table-cell text-sm">
                        {getFormattedDuration(session.startedAt, session.endedAt)}
                      </TableCell>

                      {/* Score */}
                      <TableCell className="py-3 px-4 hidden md:table-cell">
                        {session.status === "completed" ? (
                          overallScore !== undefined ? (
                            <div className="flex items-center space-x-1 font-bold text-[#00FF87] text-sm">
                              <Star className="size-3.5 fill-[#00FF87] text-[#00FF87]" />
                              <span className="text-white">{overallScore}</span>
                            </div>
                          ) : (
                            <Loader2 className="size-3.5 animate-spin text-zinc-600" />
                          )
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell className="text-right pr-6 py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button className="text-zinc-500 hover:text-white p-1 rounded-md transition-colors outline-none cursor-pointer">
                                  <MoreVertical className="size-4.5" />
                                </button>
                              }
                            />
                            <DropdownMenuContent className="bg-[#0A0A0A] border border-[#1A1A1A] text-zinc-300 rounded-md min-w-40 p-1 shadow-2xl">
                              
                              {/* Resume Option */}
                              {session.status === "in_progress" && !isExpired && (
                                <DropdownMenuItem
                                  render={<Link href={`/interview/${session.id}`} />}
                                  className="flex items-center gap-2 hover:bg-zinc-900 cursor-pointer"
                                >
                                  <Play className="size-4 text-yellow-500" />
                                  <span>Resume Interview</span>
                                </DropdownMenuItem>
                              )}

                              {/* Retry Option */}
                              {isExpired && (
                                <DropdownMenuItem
                                  onClick={() => handleRetryInTable(session.id)}
                                  disabled={retryingId === session.id}
                                  className="flex items-center gap-2 hover:bg-zinc-900 cursor-pointer disabled:opacity-50"
                                >
                                  {retryingId === session.id ? (
                                    <Loader2 className="size-4 animate-spin text-zinc-500" />
                                  ) : (
                                    <RotateCcw className="size-4 text-amber-500" />
                                  )}
                                  <span>Retry Interview</span>
                                </DropdownMenuItem>
                              )}

                              {/* View Report Option */}
                              {session.status === "completed" && hasReport && (
                                <DropdownMenuItem
                                  render={<Link href={`/interview/${session.id}/report`} />}
                                  className="flex items-center gap-2 hover:bg-zinc-900 cursor-pointer"
                                >
                                  <FileText className="size-4 text-[#00FF87]" />
                                  <span>View Report</span>
                                </DropdownMenuItem>
                              )}



                              {/* View Transcript Option */}
                              {session.status === "completed" && (
                                <DropdownMenuItem
                                  render={<Link href={`/interview/${session.id}/transcript`} />}
                                  className="flex items-center gap-2 hover:bg-zinc-900 cursor-pointer"
                                >
                                  <MessageSquare className="size-4 text-blue-400" />
                                  <span>View Transcript</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator className="border-t border-zinc-800 my-1" />

                              {/* Delete Option with AlertDialog */}
                              <AlertDialog>
                                <AlertDialogTrigger
                                  render={
                                    <button
                                      disabled={isRowDeleting}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm text-red-500 hover:bg-red-500/10 cursor-pointer disabled:opacity-50 text-left outline-none"
                                      )}
                                    >
                                      {isRowDeleting ? (
                                        <Loader2 className="size-4 animate-spin text-red-500" />
                                      ) : (
                                        <Trash2 className="size-4 text-red-500" />
                                      )}
                                      <span>Delete</span>
                                    </button>
                                  }
                                />
                                <AlertDialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-50 max-w-sm md:max-w-md">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white text-lg">
                                      Delete Interview Session
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-zinc-400 text-sm mt-2">
                                      This will permanently delete this session, its transcript, and feedback report. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-4 gap-2">
                                    <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-200">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(session.id)}
                                      className="bg-red-600 hover:bg-red-500 text-white border-transparent"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>

                    </TableRow>
                  );
                })
              )}
            </TableBody>

          </Table>
        </div>

        {/* Pagination Footer */}
        {filteredSessions.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4 px-2">
            <span className="text-xs text-zinc-500">
              Total {filteredSessions.length} session{filteredSessions.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center space-x-6">
              <span className="text-xs text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-zinc-800 bg-[#0D0D0D]/50 text-zinc-300 text-xs h-8 px-3 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-900"
                  )}
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-zinc-800 bg-[#0D0D0D]/50 text-zinc-300 text-xs h-8 px-3 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-900"
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );
}
