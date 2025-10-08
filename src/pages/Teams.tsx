import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

import { TeamCard } from "@/components/team/TeamCard";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://3.109.139.206:3000/api/team/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            touranmentId: "671b0a000000000000000001",
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();
        if (!Array.isArray(data.data[0]?.teams)) {
          console.warn("API response does not contain a valid teams array. Setting teams to an empty array.");
          setTeams([]);
        } else {
          console.log("Fetched teams:", data.data[0].teams);
          setTeams(data.data[0].teams);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 rounded-full bg-card border-2 border-primary shadow-glow">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Tournament Teams</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-primary bg-clip-text text-transparent mb-4">
            All Teams
          </h1>
          <p className="text-xl text-muted-foreground">
            {teams.length} teams competing for glory
          </p>
        </div>

        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {teams.map((team, index) => (
            <div
              key={team.name}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TeamCard team={team} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teams;
