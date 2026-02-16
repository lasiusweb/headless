import * as React from "react";
import { Award, Gift, Percent, Star, TrendingUp, Calendar, Clock } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";

interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
  icon: React.ReactNode;
}

interface LoyaltyProgramProps {
  user: {
    points: number;
    tier: string;
    nextTier?: {
      name: string;
      minPoints: number;
      progress: number; // 0-100 percentage
    };
    rewardsAvailable: number;
    lastEarnedPoints?: number;
    lastEarnedDate?: string;
  };
  tiers: LoyaltyTier[];
  onRedeemReward?: () => void;
  className?: string;
}

const LoyaltyProgram = React.forwardRef<
  HTMLDivElement,
  LoyaltyProgramProps
>(({
  user,
  tiers,
  onRedeemReward,
  className
}, ref) => {
  const currentTier = tiers.find(tier => tier.name === user.tier);
  const nextTier = user.nextTier;

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Loyalty Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>Earn points with every purchase and unlock exclusive rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">{user.points}</div>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </div>
            
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {user.tier}
              </div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
            </div>
            
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold">{user.rewardsAvailable}</div>
              <p className="text-sm text-muted-foreground">Rewards Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Current Tier */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentTier?.icon}
                {currentTier?.name || 'Bronze'}
              </CardTitle>
              <CardDescription>
                {currentTier?.benefits.join(', ') || 'Basic loyalty benefits'}
              </CardDescription>
            </div>
            <Badge variant="outline" className={cn("border-2", `border-${currentTier?.color || 'gray'}`)}>
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {nextTier && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextTier.name}</span>
                <span>{nextTier.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${nextTier.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                {nextTier.minPoints - user.points} more points to reach {nextTier.name} tier
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Loyalty Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
          <CardDescription>Unlock better benefits as you earn more points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <div 
                key={tier.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  user.tier === tier.name ? "border-primary bg-primary/5" : ""
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-full", `bg-${tier.color}-100`)}>
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.minPoints}+ points required</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">Benefits</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tier.benefits.slice(0, 2).map((benefit, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                    {tier.benefits.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{tier.benefits.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.lastEarnedPoints && user.lastEarnedDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Points Earned</p>
                    <p className="text-sm text-muted-foreground">Earned {user.lastEarnedDate}</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+{user.lastEarnedPoints} pts</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Special Offer</p>
                  <p className="text-sm text-muted-foreground">Available now</p>
                </div>
              </div>
              <Badge variant="outline">New</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
          <CardDescription>Redeem your points for exclusive offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Gift className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">Redeem for free shipping on any order</p>
              </div>
              <div className="text-right">
                <p className="font-bold">500 pts</p>
                <Button size="sm" variant="outline">Redeem</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Percent className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">10% Discount</h3>
                <p className="text-sm text-muted-foreground">Get 10% off your next order</p>
              </div>
              <div className="text-right">
                <p className="font-bold">1000 pts</p>
                <Button size="sm" variant="outline">Redeem</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

LoyaltyProgram.displayName = "LoyaltyProgram";

export { LoyaltyProgram };