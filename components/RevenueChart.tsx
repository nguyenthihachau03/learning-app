"use client";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useCallback, useEffect, useState } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { Card, CardHeader, CardContent, Box, IconButton, Typography } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import axios from "axios";
import debounce from "lodash/debounce";

const RevenueChart = () => {
    const [month, setMonth] = useState(new Date());
    const [data, setData] = useState<{ date: string; revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hàm fetchRevenue với debounce
    const fetchRevenue = useCallback(
        debounce(async (monthStr: string) => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/revenue/daily?month=${monthStr}`, {
                    headers: { "Cache-Control": "no-cache" }, // Tắt cache để đảm bảo dữ liệu mới
                });
                const data = await response.json();
                console.log(`[RevenueChart] Dữ liệu trả về cho tháng ${monthStr}:`, data);

                if (response.ok && Array.isArray(data)) {
                    setData(data); // Cập nhật dữ liệu vào state
                } else {
                    throw new Error("Dữ liệu trả về không hợp lệ");
                }
            } catch (err) {
                console.error("Lỗi khi fetch dữ liệu doanh thu:", err);
                setError("Không thể tải dữ liệu doanh thu.");
            } finally {
                setLoading(false);
            }
        }, 500), // Chờ 500ms trước khi gửi yêu cầu
        []
    );

    // Gọi fetchRevenue khi month thay đổi
    useEffect(() => {
        const monthStr = format(month, "yyyy-MM"); // Định dạng YYYY-MM
        console.log(`[RevenueChart] Gọi fetchRevenue cho tháng: ${monthStr}`);
        fetchRevenue(monthStr);
    }, [month, fetchRevenue]);

    const handlePrev = () => setMonth((prev) => subMonths(prev, 1));
    const handleNext = () => setMonth((prev) => addMonths(prev, 1));

    return (
        <Card>
            <CardHeader
                title={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={600}>Doanh thu theo ngày</Typography>
                        <Box>
                            <IconButton onClick={handlePrev}><ArrowBackIosNew fontSize="small" /></IconButton>
                            <Typography variant="body1" component="span" mx={1}>
                                {format(month, "MM/yyyy")}
                            </Typography>
                            <IconButton onClick={handleNext}><ArrowForwardIos fontSize="small" /></IconButton>
                        </Box>
                    </Box>
                }
            />
            <CardContent>
                {loading ? (
                    <Typography>Đang tải dữ liệu...</Typography>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : data.every(item => item.revenue === 0) ? (
                    <Typography>Không có doanh thu trong tháng này.</Typography>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(d) => {
                                    const [y, m, day] = d.split("-");
                                    return `${day}/${m}`;
                                }}
                            />
                            <YAxis />
                            <Tooltip formatter={(val: number) => `${val.toLocaleString()}₫`} />
                            <Line type="monotone" dataKey="revenue" stroke="#7C4DFF" name="Doanh thu" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default RevenueChart;