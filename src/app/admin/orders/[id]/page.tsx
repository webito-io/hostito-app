"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Order } from "@/types/orders"
import { ordersService } from "@/lib/api/orders"
import { OrderDetails } from "@/components/orders/details"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/admin/PageHeader"
import { toast } from "sonner"

export default function AdminOrderDetailsPage() {
    const { id } = useParams()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await ordersService.findOne(Number(id))
                setOrder(data)
            } catch (error) {
                toast.error("Failed to load order details")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchOrder()
    }, [id])

    return (
        <div className="flex-1 p-4 md:p-8 space-y-6">
            <PageHeader title={loading ? `Processing...` : `Order Overview`} />

            {loading ? (
                <div className="space-y-6">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-[100px] w-full rounded-xl" />
                </div>
            ) : order ? (
                <OrderDetails order={order} />
            ) : (
                <div className="text-center py-20 border-dashed border-2 rounded-xl bg-muted/20">
                    <p className="text-muted-foreground font-medium">Record for Order #{id} not found.</p>
                </div>
            )}
        </div>
    )
}
