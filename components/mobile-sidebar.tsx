import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import { Sidebar } from "@/components/sidebar";
import { Menu } from "lucide-react";
import { ClerkLoaded, UserButton } from "@clerk/nextjs";
export const MobileSidebar = () => {
    return (
      <>
      <div className="fixed top-3 right-4 z-[200]">
                <ClerkLoaded>
                    <UserButton />
                </ClerkLoaded>
            </div>
      <Sheet>
        <SheetTrigger>
          <Menu size={24} className="text-white" />
        </SheetTrigger>
        <SheetContent className="p-0 z-[100]" side="left">
          {/* Thêm tiêu đề ẩn để hỗ trợ accessibility */}
          <SheetHeader>
            <SheetTitle></SheetTitle>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>
      </>
    );
  };