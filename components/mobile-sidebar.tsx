import{
    Sheet,
    SheetContent,
    SheetTrigger
}from "@/components/ui/sheet";

import { Sidebar } from "@/components/sidebar";
import { Menu } from "lucide-react";
export const MobileSidebar = () => {
    return (
        <Sheet>
            <SheetTrigger>
                <Menu size={24} className="text-white"/>
            </SheetTrigger>
            <SheetContent className="p-0 z-[100]" side="left">
                <Sidebar/>
            </SheetContent>
        </Sheet>
    );
}