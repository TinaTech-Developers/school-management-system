import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function generateFinanceReport({
  fees,
  stats,
}: {
  fees: any[];
  stats: {
    today: number;
    month: number;
    pending: number;
    overdue: number;
  };
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Havano ERP";
  workbook.created = new Date();

  /* ===================== SUMMARY ===================== */
  const summary = workbook.addWorksheet("Summary");

  summary.addRow(["FINANCE REPORT"]);
  summary.addRow([]);
  summary.addRow(["Collected Today", stats.today]);
  summary.addRow(["This Month", stats.month]);
  summary.addRow(["Pending", stats.pending]);
  summary.addRow(["Overdue Invoices", stats.overdue]);

  summary.getColumn(1).width = 30;
  summary.getColumn(2).width = 20;

  summary.getRow(1).font = { bold: true };

  /* ===================== FEES ===================== */
  const feesSheet = workbook.addWorksheet("Fees");

  feesSheet.columns = [
    { header: "Student", key: "student", width: 25 },
    { header: "Class", key: "class", width: 15 },
    { header: "Total Amount", key: "amount", width: 15 },
    { header: "Paid Amount", key: "paid", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];

  fees.forEach((f) => {
    feesSheet.addRow({
      student: f.studentId.name,
      class: f.classId.name,
      amount: f.amount,
      paid: f.paidAmount,
      status: f.status,
    });
  });

  /* ===================== PAYMENT HISTORY ===================== */
  const history = workbook.addWorksheet("Payment History");

  history.columns = [
    { header: "Student", key: "student", width: 25 },
    { header: "Class", key: "class", width: 15 },
    { header: "Amount Paid", key: "amount", width: 15 },
    { header: "Method", key: "method", width: 15 },
    { header: "Reference", key: "reference", width: 20 },
    { header: "Date", key: "date", width: 20 },
  ];

  fees.forEach((f) => {
    f.paymentHistory.forEach((p: any) => {
      history.addRow({
        student: f.studentId.name,
        class: f.classId.name,
        amount: p.amount,
        method: p.method,
        reference: p.reference || "-",
        date: new Date(p.date).toLocaleString(),
      });
    });
  });

  /* ===================== DOWNLOAD ===================== */
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `fees-report-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}
