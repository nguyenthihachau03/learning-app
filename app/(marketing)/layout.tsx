"use client";

import React from "react";
import { Footer } from "./footer";
import { Header } from "./header";

type Props = {
    children: React.ReactNode;
};

const MarketingLayout = ({ children }: Props) => {
    React.useEffect(() => {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker
            .register("/service-worker.js")
            .then((registration) => {
              console.log("Service Worker registered with scope:", registration.scope);
            })
            .catch((error) => {
              console.error("Service Worker registration failed:", error);
            });
        }
      }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default MarketingLayout;