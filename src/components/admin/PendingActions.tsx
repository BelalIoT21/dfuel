
import { PendingBookingsCard } from "./PendingBookingsCard";

export const PendingActions = () => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Actions</h2>
      <div className="space-y-4">
        <PendingBookingsCard />
      </div>
    </div>
  );
};
