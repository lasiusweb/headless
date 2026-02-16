import * as React from "react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "../card";

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface ChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  type: "bar" | "line" | "pie";
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  className?: string;
}

const Chart: React.FC<ChartProps> = ({
  title,
  description,
  data,
  type,
  dataKey = "value",
  nameKey = "name",
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"],
  className,
}) => {
  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart width={400} height={300} data={data}>
            <Bar dataKey={dataKey} nameKey={nameKey}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );
      case "line":
        return (
          <LineChart width={400} height={300} data={data}>
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              nameKey={nameKey} 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart width={400} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export { Chart, type ChartData };