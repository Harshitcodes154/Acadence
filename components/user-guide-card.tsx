import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export function UserGuideCard() {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Getting Started
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Fill in your department name (e.g., Computer Science,
                Electrical Engineering)
              </li>
              <li>• Enter the semester (e.g., 1st, 2nd, 3rd, etc.)</li>
              <li>• Specify the number of available classrooms</li>
              <li>• Add the number of student batches/sections</li>
              <li>• Set maximum classes per day limit</li>
              <li>
                • Add subjects by typing them in the subjects field and clicking
                Add
              </li>
            </ul>
            <p className="text-sm text-blue-700 mt-2 font-medium">
              All fields are required to generate your custom timetable.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
