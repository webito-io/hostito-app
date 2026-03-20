import { Order } from "@/types/orders"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Separator } from "@/components/ui/separator"

interface OrderDetailsProps {
    order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
    const isActive = order.status === "ACTIVE";

    return (
        <div className="bg-background border rounded-lg overflow-hidden">
            {/* Minimal Header */}
            <div className="p-6 border-b flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        Order <span className="text-muted-foreground font-mono font-medium">#{order.id}</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <StatusBadge 
                    active={isActive} 
                    activeLabel={order.status} 
                    inactiveLabel={order.status} 
                />
            </div>

            {/* Content Area */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/5">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Organization</h4>
                        <div className="text-sm font-semibold">ID: #{order.organizationId}</div>
                    </div>
                </div>

                <div className="space-y-3 bg-white p-6 rounded border border-dashed text-sm">
                    <div className="flex justify-between font-medium">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="tabular-nums">${order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.tax > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                            <span>Tax</span>
                            <span className="tabular-nums">+${order.tax.toFixed(2)}</span>
                        </div>
                    )}
                    {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                            <span>Discount</span>
                            <span className="tabular-nums">-${order.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-end pt-1">
                        <span className="text-sm font-bold">Total Charge</span>
                        <div className="text-2xl font-black text-primary tabular-nums">
                            ${order.total.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
