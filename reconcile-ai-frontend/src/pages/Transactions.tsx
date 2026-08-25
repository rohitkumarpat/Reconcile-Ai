import { useEffect, useState } from "react";
import { Table } from "../components/ui/Table";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { useTransactionsApi } from "../services/transactions";




interface Txn {
  id: string;
  merchant: string;
  amount: number;
  category: string | null;
  date: string;
}

export default function Transactions() {
  const { list } = useTransactionsApi();
  const [txns, setTxns] = useState<Txn[] | null>(null);



  useEffect(() => {
    list().then(setTxns);
  }, []);

  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">
        Transactions
      </h1>



      {txns === null && <Skeleton className="h-40" />}

      {txns?.length === 0 && (
        <EmptyState
          title="No transactions yet"
          description="Transactions will appear here once documents are processed."
        />
      )}

      {txns && txns.length > 0 && (
        <Table headers={["Merchant", "Amount", "Category", "Date"]}>
          {txns.map((t) => (
            <tr
              key={t.id}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3">{t.merchant}</td>

              <td className="px-4 py-3 font-figures">
                ₹{t.amount.toFixed(2)}
              </td>

              <td className="px-4 py-3">
                {t.category ?? "Uncategorized"}
              </td>

              <td className="px-4 py-3 text-muted">
                {new Date(t.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}       