import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton() {
  return (
    <Card className="border-border/60" role="status" aria-label="Loading chart">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-3 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export class ChartErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Failed to render financial chart", error, info);
  }

  render() {
    if (this.state.failed) {
      return (
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Chart unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[280px] flex-col items-center justify-center gap-3 text-center text-sm">
              <p role="alert">The chart could not be loaded.</p>
              <button
                type="button"
                className="min-h-11 rounded-md border border-current px-3 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
