"use client"

import { PageHeader } from "@/components/admin/PageHeader"
import { InvoiceDetails } from "@/components/invoices/details"
import { Skeleton } from "@/components/ui/skeleton"
import { invoicesService } from "@/lib/api/invoices"
import { Invoice } from "@/types/invoices"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function AdminInvoiceDetailsPage() {
    const { id } = useParams()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const data = await invoicesService.findOne(Number(id))
                setInvoice(data)
            } catch (error) {
                toast.error("Failed to load invoice details")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchInvoice()
    }, [id])

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6">
            <PageHeader title={loading ? `Loading Invoice...` : `Invoice Details`} />

            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-[100px] w-full rounded-xl" />
                </div>
            ) : invoice ? (
                <InvoiceDetails invoice={invoice} />
            ) : (
                <div className="text-center py-20 border rounded-xl bg-muted/20">
                    <p className="text-muted-foreground font-medium">Invoice was not found in the system registry.</p>
                </div>
            )}
        </div>
    )
}
