import type {
  BusinessType,
  OperationType,
} from "../src/lib/financial-types";

/** Valid grouping values accepted by the summary and alerts endpoints. */
export type GroupBy = "day" | "week" | "month";

/** Optional inclusive date bounds shared by filtered metrics endpoints. */
export interface DateRangeFilter {
  /** Inclusive start date in YYYY-MM-DD format. */
  start_date?: string;

  /** Inclusive end date in YYYY-MM-DD format. */
  end_date?: string;
}

/** Query parameters accepted by the metrics alerts endpoint. */
export interface AlertsParams extends DateRangeFilter {
  /** Minimum relative increase required for an alert; must be >= 0, defaults to 0.3. */
  threshold?: number;

  /** Period used to group outcomes; accepts day, week, or month and defaults to month. */
  group_by?: GroupBy;

  /** Optional segment filter; valid values are B2B and B2C. */
  business_type?: BusinessType;
}

/** Query parameters accepted by the top categories endpoint. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type to rank; accepts income or outcome and defaults to outcome. */
  operation_type?: OperationType;

  /** Maximum number of category rows, from 1 to 20; defaults to 5. */
  limit?: number;

  /** Optional segment filter (B2B or B2C); query each separately for comparison. */
  business_type?: BusinessType;
}