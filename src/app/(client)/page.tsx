import { redirect } from "next/navigation";

export const metadata = {
    title: 'Client',
    description: 'Client',
}

export function ClientPage() {
    return redirect('/dashboard');
}

export default ClientPage;