import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("dashboard loading state", () => {
  it("announces loading and exposes named sections while data is pending", () => {
    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain('role="status"');
    expect(markup).toContain("Loading financial data.");
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('aria-labelledby="kpi-heading"');
    expect(markup).toContain('aria-labelledby="charts-heading"');
  });
});
