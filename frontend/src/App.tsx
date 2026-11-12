import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import {
  ChartErrorBoundary,
  ChartSkeleton,
} from "@/components/dashboard/chart-loading";
import { type FinancialMovement } from "@/lib/financial-types";
import {
  computeKPIs,
  computeMonthlyData,
  formatPeriod,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);
const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

async function fetchFinancialData(
  signal: AbortSignal,
): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [movements, setMovements] = useState<FinancialMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchFinancialData(controller.signal)
      .then((movements) => {
        if (active) {
          setMovements(movements);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) {
          return;
        }
        console.error("Failed to fetch financial data", cause);
        setError(
          "We couldn't load financial data. Check your connection and try again.",
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryCount]);

  const metrics = movements ? computeKPIs(movements) : null;
  const monthlyData = movements ? computeMonthlyData(movements) : [];
  const period = loading
    ? "Loading..."
    : error
      ? "Unavailable"
      : formatPeriod(movements ?? []);

  function retryFetch() {
    if (loading) return;
    setError(null);
    setMovements(null);
    setLoading(true);
    setRetryCount((count) => count + 1);
  }

  return (
    <>
      <p className="sr-only" role="status">
        {loading ? "Loading financial data." : ""}
      </p>
      <main
        className="dark min-h-screen bg-background text-foreground"
        aria-busy={loading}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <DashboardHeader period={period} />

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                <p role="alert">{error}</p>
                <button
                  type="button"
                  className="mt-3 min-h-11 rounded-md border border-current px-3 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                  onClick={retryFetch}
                >
                  Try again
                </button>
              </div>
            ) : null}

            <section aria-labelledby="kpi-heading">
              <h2 id="kpi-heading" className="sr-only">
                Key performance indicators
              </h2>
              <KPIRow metrics={metrics} loading={loading} />
            </section>

            <section aria-labelledby="charts-heading">
              <h2 id="charts-heading" className="sr-only">
                Financial charts
              </h2>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ChartErrorBoundary>
                  <Suspense fallback={<ChartSkeleton />}>
                    <IncomeOutcomeChart data={monthlyData} loading={loading} />
                  </Suspense>
                </ChartErrorBoundary>
                <ChartErrorBoundary>
                  <Suspense fallback={<ChartSkeleton />}>
                    <ProfitPercentChart data={monthlyData} loading={loading} />
                  </Suspense>
                </ChartErrorBoundary>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
