import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StatCardPayload } from "../../../types/index"; 
import { TrendingUp, TrendingDown } from 'lucide-react'
 
type StatCardProps = {
    title: string;
    payload: StatCardPayload;
}
export const StatCard = ({ title, payload }: StatCardProps) => {
    return <>
    <Card className="w-full max-w-xs">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardTitle>{payload.value}</CardTitle>
      </CardHeader>
      {payload.delta && (
        <CardContent className="flex items-center space-x-2">
        {payload.up ? (
          <TrendingUp className="text-green-500" />
        ) : (
          <TrendingDown className="text-red-500" />
        )}
        <p>{payload.delta} {payload.vs}</p>
      </CardContent>
      )}
      
    </Card>
    </>
}