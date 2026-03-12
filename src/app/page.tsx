import { Progress } from "@/components/ui/progress";
import { Github } from "lucide-react";


export const metadata = {
  title: "Hostito",
  description: "Hostito - Free open-source WHMCS alternative",
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">


      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl">Hostito - Open-source billing software</h1>
          <p className="text-sm text-muted-foreground">We're working hard to bring you free Hosting billing software.</p>
        </div>
        <Progress value={20} className={'w-[300px]'} />

        <div className="flex gap-2">
          <a className="text-sm text-muted-foreground border border-border rounded-md px-2 py-1 flex items-center gap-2" href='https://github.com/webito-io' target="_blank">
            <Github className="h-4 w-4" />
            Follow on Github
          </a>
        </div>
      </div>
    </div>
  );
}
