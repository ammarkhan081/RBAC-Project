import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const q = (body.question || "").toLowerCase();
  const role = body.role || "General";

  // Check for unauthorized access attempts / attacks
  if (
    q.includes("salary") ||
    q.includes("compensation") ||
    q.includes("executive payroll") ||
    (q.includes("hr") && role !== "HR" && role !== "C-Level")
  ) {
    return NextResponse.json({
      id: Date.now().toString(),
      user: body.username || "User",
      role: role,
      mode: "BLOCKED",
      answer: `Access Denied: Role '${role}' is not authorized to access restricted HR executive compensation data under current RBAC policies.`,
      text: `Access Denied: Role '${role}' is not authorized to access restricted HR executive compensation data under current RBAC policies.`,
      error: true,
      citations: [],
    });
  }

  // SQL query (e.g. employee performance ratings)
  if (q.includes("rating") || q.includes("employee") || q.includes("eng") || q.includes("performance")) {
    const tableMarkdown = `Found **3 employees** matching performance rating **5** in the engineering directory:

| Employee Name | Department | Role | Performance Rating | Status |
| :--- | :--- | :--- | :---: | :---: |
| **Tony Stark** | Engineering | Principal Architect | 5.0 | Active |
| **Peter Parker** | Engineering | Systems Engineer | 5.0 | Active |
| **Bruce Banner** | Engineering | Lead Data Scientist | 5.0 | Active |

*Data retrieved from DuckDB view \`v_eng_performance_engineering\` with active column-level masking.*`;

    return NextResponse.json({
      id: Date.now().toString(),
      user: body.username || "User",
      role: role,
      mode: "SQL",
      answer: tableMarkdown,
      text: tableMarkdown,
      citations: [
        {
          type: "sql",
          view: "v_eng_performance_engineering",
          query: "SELECT name, department, role, rating, status FROM v_eng_performance WHERE rating = 5.0;",
          result: [
            { name: "Tony Stark", department: "Engineering", role: "Principal Architect", rating: 5.0, status: "Active" },
            { name: "Peter Parker", department: "Engineering", role: "Systems Engineer", rating: 5.0, status: "Active" },
            { name: "Bruce Banner", department: "Engineering", role: "Lead Data Scientist", rating: 5.0, status: "Active" },
          ],
        },
      ],
    });
  }

  // RAG query (e.g. corporate leave policy)
  if (q.includes("policy") || q.includes("leave") || q.includes("vacation") || q.includes("pto")) {
    const ragMarkdown = `Corporate Leave & PTO Policy Summary:

* **Annual Paid Leave:** Full-time employees accrue **20 paid days** per calendar year (accruing at 1.66 days/month).
* **Sick & Medical Leave:** **10 days** fully paid per annum with standard practitioner certification for absences exceeding 2 consecutive days.
* **Parental Leave:** **16 weeks** fully paid for primary caregivers; 8 weeks for secondary caregivers.
* **Carryover Limit:** A maximum of **5 unused days** may roll over into Q1 of the following fiscal year (must be utilized by March 31).`;

    return NextResponse.json({
      id: Date.now().toString(),
      user: body.username || "User",
      role: role,
      mode: "RAG",
      answer: ragMarkdown,
      text: ragMarkdown,
      citations: [
        {
          type: "document",
          source: "hr_global_leave_policy_2026.md",
          section: "Section 4.2 - Accrual & Carryover Limits",
          department: "HR",
          passage: "Full-time personnel accrue 1.66 paid leave days per calendar month, up to 20 days per annum. A maximum of 5 unused leave days can be carried over into Q1 of the following fiscal year.",
        },
      ],
    });
  }

  // HYBRID query (e.g. Q3 marketing expense variance)
  const hybridMarkdown = `Q3 marketing expenses totaled **$245,000**, which was **$45,000 over budget** (budgeted at $200,000).

According to quarterly executive financial reports, this variance was primarily driven by:
1. **Enterprise Rebranding Campaign:** Accelerated deployment across North American digital channels in August ($32,000).
2. **Fintech World Summit Sponsorship:** Premium keynote tier reservation in September ($13,000).`;

  return NextResponse.json({
    id: Date.now().toString(),
    user: body.username || "Bruce",
    role: role,
    mode: "HYBRID",
    answer: hybridMarkdown,
    text: hybridMarkdown,
    citations: [
      {
        type: "sql",
        view: "v_marketing_expenses_marketing",
        query: "SELECT quarter, SUM(amount) AS total_expense, budget, (SUM(amount) - budget) AS variance FROM v_marketing_expenses_marketing WHERE quarter = 'Q3' GROUP BY quarter, budget;",
        result: [
          { quarter: "Q3", total_expense: 245000, budget: 200000, variance: 45000 },
        ],
      },
      {
        type: "document",
        source: "marketing_report_q3_2024.md",
        section: "Executive Summary - Budget Adjustments",
        department: "Marketing",
        passage: "Marketing expenditures in Q3 peaked due to the nationwide rebranding initiative launched in August ($32k) and the flagship Q3 Fintech World Summit keynote sponsorship ($13k).",
      },
    ],
    reconciliation: "Agreement: The $45,000 variance in Q3 is directly corroborated by documented brand campaign and summit investments in marketing_report_q3_2024.md.",
  });
}