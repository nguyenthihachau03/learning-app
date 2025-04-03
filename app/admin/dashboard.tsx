import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@mui/material";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/components/RevenueChart"), { ssr: false });

const periods: Record<"thisMonth", [Dayjs, Dayjs]> = {
    thisMonth: [dayjs().startOf("month"), dayjs().endOf("month")],
};

export default function Dashboard() {
    const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });

    useEffect(() => {
        const [start, end] = periods.thisMonth;
        axios
            .get("/api/revenue/summary", {
                params: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                },
            })
            .then((res) => setSummary(res.data))
            .catch((err) => console.error("Lỗi API summary:", err));
    }, []);

    return (
        <div>
            <div style={{ display: "flex", gap: 20 }}>
                <Card sx={{ flex: 1, bgcolor: "#7c4dff", color: "white" }}>
                    <CardHeader title="Tổng doanh thu" />
                    <CardContent>
                        <h2>{summary.totalRevenue.toLocaleString()} VND</h2>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1, bgcolor: "#ede7f6" }}>
                    <CardHeader title="Tổng đơn hàng" />
                    <CardContent>
                        <h2 style={{ color: "#7c4dff" }}>{summary.totalOrders} đơn hàng</h2>
                    </CardContent>
                </Card>
            </div>

            <Card sx={{ marginTop: 4 }}>
                <CardContent>
                    <RevenueChart />
                </CardContent>
            </Card>
        </div>
    );
}