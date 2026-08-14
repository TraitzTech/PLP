"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Camera,
  ListChecks,
  MapPin,
  Plus,
  History,
} from "lucide-react";
import { paoService } from "@/services/paoService";
import type {
  Landlord,
  PaoProperty,
  PaoTask,
  PaoTaskRequest,
  PaoTaskType,
  PaoVisit,
  PaoVisitRequest,
} from "@/services/types";
import {
  PaoEmptyState,
  PaoErrorState,
  TaskTypeBadge,
  formatDate,
  todayISO,
} from "@/components/dashboard/pao/pao-ui";

/** Radix Select can't hold an empty string value, so optional selects use this sentinel. */
const NONE = "none";

const TASK_TYPES: { value: PaoTaskType; label: string }[] = [
  { value: "call", label: "📞 Call" },
  { value: "visit", label: "📍 Visit" },
  { value: "verify", label: "✅ Verify" },
  { value: "follow_up", label: "🔁 Follow up" },
  { value: "other", label: "🗒️ Other" },
];

type TaskFormState = {
  type: PaoTaskType;
  title: string;
  landlord_id: string;
  listing_id: string;
  due_date: string;
};

const emptyTaskForm: TaskFormState = {
  type: "call",
  title: "",
  landlord_id: NONE,
  listing_id: NONE,
  due_date: "",
};

type VisitFormState = {
  mode: "existing" | "unlisted";
  listing_id: string;
  property_label: string;
  landlord_id: string;
  visit_date: string;
  notes: string;
  status: "completed" | "follow_up_needed";
};

const buildEmptyVisitForm = (): VisitFormState => ({
  mode: "existing",
  listing_id: NONE,
  property_label: "",
  landlord_id: NONE,
  visit_date: todayISO(),
  notes: "",
  status: "completed",
});

export default function TasksClient() {
  const searchParams = useSearchParams();
  const shouldAutoOpenVisit = searchParams.get("action") === "record-visit";

  const [todayTasks, setTodayTasks] = useState<PaoTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<PaoTask[]>([]);
  const [visits, setVisits] = useState<PaoVisit[]>([]);
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [properties, setProperties] = useState<PaoProperty[]>([]);

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [completingIds, setCompletingIds] = useState<number[]>([]);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm);
  const [savingTask, setSavingTask] = useState(false);

  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [visitForm, setVisitForm] = useState<VisitFormState>(buildEmptyVisitForm);
  const [visitPhotos, setVisitPhotos] = useState<File[]>([]);
  const [savingVisit, setSavingVisit] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [today, pending, visitList, landlordList, propertyList] = await Promise.all([
        paoService.getTasks({ today_only: true, status: "pending" }),
        paoService.getTasks({ status: "pending" }),
        paoService.getVisits().catch(() => [] as PaoVisit[]),
        paoService.getLandlords().catch(() => [] as Landlord[]),
        paoService.getProperties().catch(() => [] as PaoProperty[]),
      ]);

      const todaySafe = Array.isArray(today) ? today : [];
      const pendingSafe = Array.isArray(pending) ? pending : [];
      const todayIds = new Set(todaySafe.map((task) => task.id));

      setTodayTasks(todaySafe);
      setUpcomingTasks(pendingSafe.filter((task) => !todayIds.has(task.id)));
      setVisits(Array.isArray(visitList) ? visitList : []);
      setLandlords(Array.isArray(landlordList) ? landlordList : []);
      setProperties(Array.isArray(propertyList) ? propertyList : []);
    } catch (error: any) {
      console.error("Error loading tasks and visits:", error);
      toast.error(error?.message || "Failed to load your tasks");
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (shouldAutoOpenVisit) setVisitDialogOpen(true);
  }, [shouldAutoOpenVisit]);

  const refreshTasks = useCallback(async () => {
    try {
      const [today, pending] = await Promise.all([
        paoService.getTasks({ today_only: true, status: "pending" }),
        paoService.getTasks({ status: "pending" }),
      ]);
      const todaySafe = Array.isArray(today) ? today : [];
      const pendingSafe = Array.isArray(pending) ? pending : [];
      const todayIds = new Set(todaySafe.map((task) => task.id));
      setTodayTasks(todaySafe);
      setUpcomingTasks(pendingSafe.filter((task) => !todayIds.has(task.id)));
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  }, []);

  /** Optimistically drop the task, restore it if the request fails. */
  const handleCompleteTask = async (task: PaoTask, isToday: boolean) => {
    if (completingIds.includes(task.id)) return;
    setCompletingIds((prev) => [...prev, task.id]);

    const setter = isToday ? setTodayTasks : setUpcomingTasks;
    setter((prev) => prev.filter((item) => item.id !== task.id));

    try {
      await paoService.completeTask(task.id);
      toast.success("Task completed");
    } catch (error: any) {
      console.error("Error completing task:", error);
      toast.error(error?.message || "Failed to complete the task");
      setter((prev) => [task, ...prev]);
    } finally {
      setCompletingIds((prev) => prev.filter((id) => id !== task.id));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingTask) return;

    if (!taskForm.title.trim()) {
      toast.error("Please give the task a title.");
      return;
    }

    const payload: PaoTaskRequest = {
      type: taskForm.type,
      title: taskForm.title.trim(),
      landlord_id: taskForm.landlord_id === NONE ? null : parseInt(taskForm.landlord_id, 10),
      listing_id: taskForm.listing_id === NONE ? null : parseInt(taskForm.listing_id, 10),
      due_date: taskForm.due_date || null,
    };

    setSavingTask(true);
    try {
      await paoService.createTask(payload);
      toast.success("Task added");
      setTaskForm(emptyTaskForm);
      setTaskDialogOpen(false);
      await refreshTasks();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error?.message || "Failed to add the task");
    } finally {
      setSavingTask(false);
    }
  };

  const handleRecordVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingVisit) return;

    if (!visitForm.visit_date) {
      toast.error("Please pick the visit date.");
      return;
    }
    if (visitForm.mode === "existing" && visitForm.listing_id === NONE) {
      toast.error("Choose a property, or switch to \"Not listed yet\".");
      return;
    }
    if (visitForm.mode === "unlisted" && !visitForm.property_label.trim()) {
      toast.error("Please name the property you visited.");
      return;
    }

    const payload: PaoVisitRequest = {
      visit_date: visitForm.visit_date,
      status: visitForm.status,
      listing_id:
        visitForm.mode === "existing" && visitForm.listing_id !== NONE
          ? parseInt(visitForm.listing_id, 10)
          : null,
      property_label: visitForm.mode === "unlisted" ? visitForm.property_label.trim() : null,
      landlord_id: visitForm.landlord_id === NONE ? null : parseInt(visitForm.landlord_id, 10),
      notes: visitForm.notes.trim() ? visitForm.notes.trim() : null,
      photos: visitPhotos.length > 0 ? visitPhotos : undefined,
    };

    setSavingVisit(true);
    try {
      const created = await paoService.recordVisit(payload);
      setVisits((prev) => [created, ...prev]);
      toast.success("Visit recorded");
      setVisitForm(buildEmptyVisitForm());
      setVisitPhotos([]);
      setVisitDialogOpen(false);
    } catch (error: any) {
      console.error("Error recording visit:", error);
      toast.error(error?.message || "Failed to record the visit");
    } finally {
      setSavingVisit(false);
    }
  };

  const renderTaskRow = (task: PaoTask, isToday: boolean) => (
    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border min-h-[56px]">
      <Checkbox
        className="mt-1 h-5 w-5"
        checked={false}
        disabled={completingIds.includes(task.id)}
        onCheckedChange={(checked) => {
          if (checked === true) handleCompleteTask(task, isToday);
        }}
        aria-label={`Complete task: ${task.title}`}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 leading-snug">{task.title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <TaskTypeBadge type={task.type} />
          {task.due_date ? (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(task.due_date)}
            </span>
          ) : (
            <span className="text-xs text-gray-400">No due date</span>
          )}
          {task.landlord?.name ? (
            <span className="text-xs text-gray-500">· {task.landlord.name}</span>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout userType="pao">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tasks &amp; Visits</h1>
            <p className="text-gray-600 mt-1">Everything on your plate today.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setTaskDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button
              className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white"
              onClick={() => setVisitDialogOpen(true)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Record Visit
            </Button>
          </div>
        </div>

        {failed && !loading ? (
          <PaoErrorState message="We couldn't load your tasks and visits." onRetry={loadAll} />
        ) : null}

        {/* Today's tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="w-5 h-5 text-plp-purple" />
              Today's Tasks
              {!loading ? (
                <Badge variant="secondary" className="ml-1">
                  {todayTasks.length}
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : todayTasks.length === 0 ? (
              <PaoEmptyState
                icon={ListChecks}
                title="Nothing left for today"
                description="Add a task or record a visit to keep your day moving."
              />
            ) : (
              <div className="space-y-3">{todayTasks.map((task) => renderTaskRow(task, true))}</div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        {!loading && upcomingTasks.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <button
                type="button"
                className="flex items-center justify-between w-full text-left min-h-[44px]"
                onClick={() => setShowUpcoming((prev) => !prev)}
              >
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="w-5 h-5 text-gray-500" />
                  Upcoming
                  <Badge variant="secondary" className="ml-1">
                    {upcomingTasks.length}
                  </Badge>
                </CardTitle>
                {showUpcoming ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </CardHeader>
            {showUpcoming ? (
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => renderTaskRow(task, false))}
                </div>
              </CardContent>
            ) : null}
          </Card>
        ) : null}

        {/* Past visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5 text-plp-purple" />
              Past Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : visits.length === 0 ? (
              <PaoEmptyState
                icon={MapPin}
                title="No visits recorded yet"
                description="Record a visit right after you leave a property."
              />
            ) : (
              <div className="space-y-3">
                {visits.map((visit) => {
                  const photoCount = visit.photos?.length ?? 0;
                  const label =
                    visit.listing?.title ||
                    visit.property_label ||
                    visit.landlord?.name ||
                    "Visit";
                  return (
                    <div key={visit.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 line-clamp-1">{label}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {formatDate(visit.visit_date)}
                            </span>
                            {visit.landlord?.name && visit.listing?.title ? (
                              <span>· {visit.landlord.name}</span>
                            ) : null}
                            {photoCount > 0 ? (
                              <span className="flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5" />
                                {photoCount}
                              </span>
                            ) : null}
                          </div>
                          {visit.notes ? (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{visit.notes}</p>
                          ) : null}
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            visit.status === "completed"
                              ? "border-transparent bg-green-100 text-green-800 whitespace-nowrap"
                              : "border-transparent bg-amber-100 text-amber-800 whitespace-nowrap"
                          }
                        >
                          {visit.status === "completed" ? "Completed" : "Follow up"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add task dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Quickly note something you need to do.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">Type</Label>
              <Select
                value={taskForm.type}
                onValueChange={(value) =>
                  setTaskForm((prev) => ({ ...prev, type: value as PaoTaskType }))
                }
              >
                <SelectTrigger id="taskType" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskTitle">Title *</Label>
              <Input
                id="taskTitle"
                className="h-11"
                value={taskForm.title}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Call Mr. Ndi about the Bonapriso flat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskLandlord">Landlord</Label>
              <Select
                value={taskForm.landlord_id}
                onValueChange={(value) => setTaskForm((prev) => ({ ...prev, landlord_id: value }))}
              >
                <SelectTrigger id="taskLandlord" className="h-11">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {landlords.map((landlord) => (
                    <SelectItem key={landlord.id} value={String(landlord.id)}>
                      {landlord.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskListing">Property</Label>
              <Select
                value={taskForm.listing_id}
                onValueChange={(value) => setTaskForm((prev) => ({ ...prev, listing_id: value }))}
              >
                <SelectTrigger id="taskListing" className="h-11">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={String(property.id)}>
                      {property.title || `Property #${property.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDue">Due date</Label>
              <Input
                id="taskDue"
                type="date"
                className="h-11"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm((prev) => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white"
                disabled={savingTask}
              >
                {savingTask ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record visit dialog */}
      <Dialog open={visitDialogOpen} onOpenChange={setVisitDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Visit</DialogTitle>
            <DialogDescription>Log the property you just visited.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordVisit} className="space-y-4">
            {/* Existing vs unlisted toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisitForm((prev) => ({ ...prev, mode: "existing" }))}
                className={`h-11 rounded-lg border text-sm font-medium transition ${
                  visitForm.mode === "existing"
                    ? "bg-plp-purple text-white border-plp-purple"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                Existing property
              </button>
              <button
                type="button"
                onClick={() => setVisitForm((prev) => ({ ...prev, mode: "unlisted" }))}
                className={`h-11 rounded-lg border text-sm font-medium transition ${
                  visitForm.mode === "unlisted"
                    ? "bg-plp-purple text-white border-plp-purple"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                Not listed yet
              </button>
            </div>

            {visitForm.mode === "existing" ? (
              <div className="space-y-2">
                <Label htmlFor="visitListing">Property</Label>
                <Select
                  value={visitForm.listing_id}
                  onValueChange={(value) =>
                    setVisitForm((prev) => ({ ...prev, listing_id: value }))
                  }
                >
                  <SelectTrigger id="visitListing" className="h-11">
                    <SelectValue placeholder="Choose one of your properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={String(property.id)}>
                        {property.title || `Property #${property.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="propertyLabel">Property name</Label>
                <Input
                  id="propertyLabel"
                  className="h-11"
                  value={visitForm.property_label}
                  onChange={(e) =>
                    setVisitForm((prev) => ({ ...prev, property_label: e.target.value }))
                  }
                  placeholder="e.g. 3-bedroom near Bonamoussadi market"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="visitLandlord">Landlord</Label>
              <Select
                value={visitForm.landlord_id}
                onValueChange={(value) => setVisitForm((prev) => ({ ...prev, landlord_id: value }))}
              >
                <SelectTrigger id="visitLandlord" className="h-11">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {landlords.map((landlord) => (
                    <SelectItem key={landlord.id} value={String(landlord.id)}>
                      {landlord.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitDate">Date *</Label>
              <Input
                id="visitDate"
                type="date"
                className="h-11"
                value={visitForm.visit_date}
                onChange={(e) => setVisitForm((prev) => ({ ...prev, visit_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitPhotos">Photos</Label>
              <input
                id="visitPhotos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setVisitPhotos(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-plp-purple/10 file:text-plp-purple hover:file:bg-plp-purple/20"
              />
              {visitPhotos.length > 0 ? (
                <p className="text-xs text-gray-500">
                  {visitPhotos.length} photo{visitPhotos.length === 1 ? "" : "s"} selected
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitNotes">Notes</Label>
              <Textarea
                id="visitNotes"
                rows={3}
                value={visitForm.notes}
                onChange={(e) => setVisitForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="What happened during the visit?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitStatus">Status</Label>
              <Select
                value={visitForm.status}
                onValueChange={(value) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    status: value as VisitFormState["status"],
                  }))
                }
              >
                <SelectTrigger id="visitStatus" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="follow_up_needed">Follow up needed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setVisitDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 bg-plp-purple hover:bg-plp-purple/90 text-white"
                disabled={savingVisit}
              >
                {savingVisit ? "Saving..." : "Save Visit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
