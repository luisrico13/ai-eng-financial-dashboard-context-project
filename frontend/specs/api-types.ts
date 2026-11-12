import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types";

/** Available filter values and movement date bounds returned by the facets API. */
export interface FacetsResponse {
  /** Operation types present in the data; valid values are income and outcome. */
  operation_types: OperationType[];

  /** Business segments present in the data; valid values are B2B and B2C. */
  business_types: BusinessType[];

  /** Available categories: suppliers, sales, operational, administrative, others. */
  categories: Category[];

  /** Earliest movement date available, formatted as YYYY-MM-DD. */
  min_date: string;

  /** Latest movement date available, formatted as YYYY-MM-DD. */
  max_date: string;
}

/** A period whose outcome amount exceeds its historical baseline threshold. */
export interface AlertEntry {
  /** Period key: YYYY-MM-DD for day, YYYY-Www for week, or YYYY-MM for month. */
  period: string;

  /** Numeric sum of outcome amounts recorded in this period. */
  outcome_total: number;

  /** Numeric average of outcome amounts across earlier periods in the grouping. */
  baseline_average: number;

  /** Relative increase over the baseline, expressed as a ratio (0.3 means 30%). */
  increase_ratio: number;
}

/** Alert rows returned by the metrics alerts endpoint. */
export type AlertsResponse = AlertEntry[];

/** One operation/category total returned by the top categories endpoint. */
export interface CategoryEntry {
  /** Category: suppliers, sales, operational, administrative, or others. */
  category: Category;

  /** Whether this row represents income or outcome. */
  operation_type: OperationType;

  /** Numeric sum of amounts for this category and operation type. */
  total_amount: number;
}

/** Category rows for one selected business segment and operation type. */
export type TopCategoriesResponse = CategoryEntry[];