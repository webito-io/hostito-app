import { StatusBadge } from "@/components/admin/StatusBadge";
import { Invoice } from "@/types/invoices";

interface InvoiceDetailsProps {
    invoice: Invoice
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
    const isPaid = invoice.status.toLowerCase() === "paid";

    return (
        <div className="bg-white border rounded-md overflow-hidden font-sans text-slate-900">
            <div className="p-10 flex flex-col md:flex-row justify-between items-start border-b border-slate-100 bg-slate-50/30">
                <div className="space-y-6">
                    <div className="text-3xl font-black tracking-tighter text-primary">HOSTITO.</div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Number</p>
                        <p className="text-sm font-mono font-bold text-slate-600">INV-{invoice.id.toString().padStart(5, '0')}</p>
                    </div>
                </div>
                <div className="md:text-right space-y-4 pt-2">
                    <StatusBadge active={isPaid} activeLabel={invoice.status} inactiveLabel={invoice.status} />
                </div>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-16 border-b border-slate-50">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billed To</h4>
                    <div className="space-y-1">
                        <div className="text-xl font-black text-slate-800">{invoice.organization?.name}</div>
                    </div>
                </div>
                <div className="md:text-right space-y-6">
                    <div className="grid grid-cols-2 md:block md:space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">Date Issued</h4>
                            <p className="text-sm font-bold text-slate-600">{new Date(invoice.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                        </div>
                        <div className="space-y-1 mt-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-slate-400">Due Date</h4>
                            <p className={`text-sm font-bold ${!isPaid && new Date(invoice.dueDate) < new Date() ? 'text-red-500' : 'text-slate-600'}`}>
                                {new Date(invoice.dueDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-10 py-8">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-4 text-left font-bold uppercase text-[10px] tracking-widest text-slate-400">Description</th>
                            <th className="py-4 text-center font-bold uppercase text-[10px] tracking-widest text-slate-400 px-4">Qty</th>
                            <th className="py-4 text-right font-bold uppercase text-[10px] tracking-widest text-slate-400 px-4">Price</th>
                            <th className="py-4 text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {
                            invoice.items?.map((item, idx) => (
                                <tr key={idx} className="group transition-colors hover:bg-slate-50/50">
                                    <td className="py-6 font-bold text-slate-700">
                                        {typeof item === 'string' ? item : item.description}
                                    </td>
                                    <td className="py-6 text-center tabular-nums text-slate-500 font-medium">
                                        {typeof item === 'string' ? '1' : item.quantity}
                                    </td>
                                    <td className="py-6 text-right tabular-nums text-slate-500 font-medium px-4">
                                        ${typeof item === 'string' ? '—' : (item.unitPrice || 0).toFixed(2)}
                                    </td>
                                    <td className="py-6 text-right tabular-nums font-black text-slate-900 pr-1">
                                        ${typeof item === 'string' ? '—' : (item.total || (item.quantity * item.unitPrice) || 0).toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>

            <div className="p-10 pt-4 flex flex-col items-end bg-slate-50/20">
                <div className="w-full md:w-80 space-y-4">
                    <div className="flex justify-between items-center text-sm py-2 px-1 text-slate-500">
                        <span className="uppercase text-[10px] font-bold tracking-widest">Subtotal</span>
                        <span className="font-bold tabular-nums text-slate-800 tracking-tight">${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    {invoice.tax > 0 && (
                        <div className="flex justify-between items-center text-sm py-2 px-1 text-slate-500 border-t border-slate-100">
                            <span className="uppercase text-[10px] font-bold tracking-widest">Tax</span>
                            <span className="tabular-nums font-bold text-slate-800">+${invoice.tax.toFixed(2)}</span>
                        </div>
                    )}
                    {invoice.discount > 0 && (
                        <div className="flex justify-between items-center text-sm py-2 px-1 text-emerald-600 border-t border-emerald-100 bg-emerald-50/50 rounded-lg px-3">
                            <span className="uppercase text-[10px] font-bold tracking-widest">Discount</span>
                            <span className="tabular-nums font-black">-${invoice.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-end pt-8 px-2 border-t-2 border-slate-900 mt-6 pb-2">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Total Amount</span>
                            <span className="text-sm font-bold text-slate-400 invisible">Placeholder</span>
                        </div>
                        <span className="text-4xl font-black tabular-nums text-primary tracking-tighter">
                            ${invoice.total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
