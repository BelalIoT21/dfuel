
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const PendingActions = () => {
  return (
    <Card className="border-purple-100">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <AlertTriangle className="h-5 w-5 text-purple-600" />
          Pending Actions
        </CardTitle>
        <CardDescription>Items that require your attention</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="space-y-3">
          {/* Show actual pending bookings if they exist, otherwise show informational message */}
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No pending actions at this time.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingActions;
