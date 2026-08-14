import React, { Suspense } from "react";
import NewPropertyClient from "../new-property-client";

function NewPropertyLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse text-sm text-gray-500">Loading form...</div>
    </div>
  );
}

export default function NewPaoPropertyPage() {
  return (
    <Suspense fallback={<NewPropertyLoading />}>
      <NewPropertyClient />
    </Suspense>
  );
}
