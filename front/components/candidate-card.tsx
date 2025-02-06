import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Crown, Trophy, Coins } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useState } from "react"

interface CandidateCardProps {
  name: string
  votes: number
  totalVotes: number
  rank: number
  onVote: (amount: number) => void
  onIssueToken: (amount: number) => void
  isVoting: boolean
  isWalletConnected: boolean
  enabled: boolean,
  isTeacherOrDeployer: boolean
}

export function CandidateCard({
  name,
  votes,
  totalVotes,
  rank,
  onVote,
  onIssueToken,
  isVoting,
  isWalletConnected,
  enabled,
  isTeacherOrDeployer: isTeacher
}: CandidateCardProps) {
  const [voteAmount, setVoteAmount] = useState<string>("1")
  const [tokenAmount, setTokenAmount] = useState<string>("1")
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
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {votes.toFixed(2)} votes ({votePercentage.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              {votes * 1e18} tokens
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        {!isTeacher && (
          <div className="flex w-full gap-2">
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={voteAmount}
              onChange={(e) => setVoteAmount(e.target.value)}
              placeholder="Amount"
              disabled={!enabled}
              className="w-1/3"
            />
            <Button
              onClick={handleVote}
              disabled={!enabled || !isWalletConnected || isVoting || Number.parseFloat(voteAmount) <= 0}
              className="w-2/3 relative"
              variant={!enabled ? "secondary" : "default"}
            >
              {isVoting ? null : "Vote"}

              { isVoting && (
                <Spinner className="h-4 w-4 mr-2" />
              )}

            </Button>
          </div>
        )} 

        {isTeacher && (
          <div className="flex w-full gap-2">
            <Input
              type="number"
              min="0"
              step="1"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              placeholder="Tokens"
              className="w-1/3"
            />
            <Button
              onClick={() => onIssueToken(Number.parseFloat(tokenAmount))}
              className="w-2/3"
              variant="outline"
            >
              <Coins className="w-4 h-4 mr-2" />
              Issue Tokens
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

