export interface TourStep {
  id: string;
  title: string;
  body: string;
  /** Matches a data-tour="..." attribute somewhere in the scene. */
  anchor: string;
  /** What the final step's Next button does instead of advancing:
   *  navigate to the next screen, scenario param appended automatically. */
  advanceTo?: "/reports" | "/reports/program-spend" | "/analytics" | "/home";
}

export type TourSceneId = "home" | "reports" | "spend" | "analytics";

/** Label on the last step's Next button, per destination. */
export const ADVANCE_LABELS: Record<NonNullable<TourStep["advanceTo"]>, string> = {
  "/reports": "Open the report catalog",
  "/reports/program-spend": "Open Program Spend",
  "/analytics": "See how the team uses it",
  "/home": "Back to the overview",
};

/** The guided tour, screen by screen. The UI stays fully interactive the
 *  whole time; these are captions, not a cage. */
export const TOURS: Record<TourSceneId, readonly TourStep[]> = {
  home: [
    {
      id: "pulse",
      title: "The morning picture",
      body: "Open claims, month to date payments and open questions for the whole program, refreshed overnight from the warehouse.",
      anchor: "home-kpis",
    },
    {
      id: "files",
      title: "Work in motion",
      body: "The newest claims with their incident, coverage and running payments. Every figure on this screen comes from the same governed model the reports use.",
      anchor: "home-files",
      advanceTo: "/reports",
    },
  ],
  reports: [
    {
      id: "catalog",
      title: "One catalog, every report",
      body: "Finance, operations and partner reporting in one place. Each row is a live report with its own tabs, slicers and export. Open the flagship one.",
      anchor: "report-rows",
      advanceTo: "/reports/program-spend",
    },
  ],
  spend: [
    {
      id: "slicers",
      title: "A report, not a static page",
      body: "Account, region, coverage and date range scope everything at once: the summary tiles, the charts and the table view.",
      anchor: "spend-slicers",
    },
    {
      id: "charts",
      title: "The built in views",
      body: "Each report ships with curated charts kept faithful to the governed figures. The table toggle shows the same data line by line.",
      anchor: "spend-charts",
    },
    {
      id: "dock",
      title: "Ask the report a question",
      body: "Type plain English into the dock and watch the run: context, matching, an access check, the query, then a chart. The pills in the header replay four different questions.",
      anchor: "ask-dock",
    },
    {
      id: "result",
      title: "The answer, where it belongs",
      body: "A finished answer lands as a chart with a short written read of the numbers. Saving pins it to the report for everyone with access.",
      anchor: "ask-result",
      advanceTo: "/analytics",
    },
  ],
  analytics: [
    {
      id: "usage",
      title: "Adoption you can measure",
      body: "Questions asked, charts saved and the reports people actually open, week by week. Drawn with plain SVG straight from the workspace fixtures.",
      anchor: "usage-charts",
    },
    {
      id: "teams",
      title: "Who runs on it",
      body: "Finance Operations leads, but every team saves charts of its own. That spread is the point: one governed model, many hands.",
      anchor: "usage-teams",
      advanceTo: "/home",
    },
  ],
};
