import { Card } from "@/components/ui/card";
import { useUserBadges } from "@/hooks/useUserBadges";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export const RecentBadges = () => {
  const { badges, loading } = useUserBadges();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Conquistas Recentes</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Conquistas Recentes</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm text-muted-foreground">Ainda não há conquistas.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Complete devocionais para ganhar medalhas!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Conquistas Recentes</h3>
      </div>
      <div className="space-y-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors animate-fade-in"
          >
            <div className="text-3xl">{badge.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{badge.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {badge.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
