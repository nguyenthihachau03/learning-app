"use client";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '01-03', value: 1200 },
  { date: '02-03', value: 2100 },
  { date: '03-03', value: 800 },
  { date: '04-03', value: 2780 },
  { date: '05-03', value: 1890 },
  { date: '06-03', value: 2390 },
  { date: '07-03', value: 3490 },
];

const Dashboard = () => {
  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Tổng quan hệ thống
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Tổng số khóa học</Typography>
              <Typography variant="h4" fontWeight={600}>12</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Lịch sử truy cập / tuần</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#7c4dff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
