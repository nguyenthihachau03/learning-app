import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ExitModel } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import "./globals.css";
import ChatComponent from "@/components/chat/chat-component";

const font = Nunito({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Learning App",
//   description: "Ứng dụng học tiếng",
// };

export const metadata: Metadata = {
  // ... title, description ...
  applicationName: 'LearningApp',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default', // hoặc 'black-translucent'
    title: 'LearningApp',
    // startupImage: [ ... ] // Có thể thêm ảnh khởi động cho iOS
  },
  formatDetection: {
    telephone: false,
  },
  // Nếu dùng manifest.ts thì không cần link manifest ở đây
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={font.className}>
          <ChatComponent />
          <Toaster />
          <ExitModel />
          <HeartsModal />
          <PracticeModal />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
