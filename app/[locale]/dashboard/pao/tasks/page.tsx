import React, { Suspense } from "react";
import TasksClient from "../tasks-client";

function TasksLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-sm text-gray-500">Loading tasks...</div>
    </div>
  );
}

export default function PaoTasksPage() {
  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksClient />
    </Suspense>
  );
}
