import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Crown, Trophy } from "lucide-react"
import { useState } from "react"

interface CandidateCardProps {
  name: string
  votes: number
  totalVotes: number
  rank: number
  onVote: (amount: number) => void
  isVoting: boolean
  isWalletConnected: boolean
  enabled: boolean
}

export function CandidateCard({
  name,
  votes,
  totalVotes,
  rank,
  onVote,
  isVoting,
  isWalletConnected,
  enabled
}: CandidateCardProps) {
  const [voteAmount, setVoteAmount] = useState<string>("1")
  const votePercentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0

  const handleVote = () => {
    const amount = Number.parseFloat(voteAmount)
    if (amount > 0) {
      onVote(amount)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      {rank <= 3 && (
        <div
          className={`absolute top-2 right-2 p-1.5 rounded-full ${
            rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-600"
          }`}
        >
          {rank === 1 ? <Crown className="w-4 h-4 text-white" /> : <Trophy className="w-4 h-4 text-white" />}
        </div>
      )}
      <CardHeader>
        <h3 className="text-lg font-bold">{name}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={votePercentage} className="h-2" />
          <div className="text-sm text-muted-foreground">
            {votes} votes ({votePercentage.toFixed(1)}%)
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex w-full gap-2">
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={voteAmount}
            onChange={(e) => setVoteAmount(e.target.value)}
            placeholder="Amount"
            className="w-1/3"
          />
          <Button
            onClick={handleVote}
            disabled={!enabled || !isWalletConnected || isVoting || Number.parseFloat(voteAmount) <= 0}
            className="w-2/3"
          >
            {isVoting ? "Voting..." : "Vote"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

