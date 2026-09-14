import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { fetchLeague } from "../api/league";

function recordText(record) {
  return `${record.wins}-${record.losses}-${record.ties}`;
}

function PlayerHeader() {
  return (
    <View style={[styles.playerRow, styles.playerHeader]}>
      <Text style={[styles.cellSlot, styles.headerText]}>Slot</Text>
      <Text style={[styles.cellPos, styles.headerText]}>Pos</Text>
      <Text style={[styles.cellName, styles.headerText]}>Name</Text>
      <Text style={[styles.cellNum, styles.headerText]}>Proj</Text>
      <Text style={[styles.cellNum, styles.headerText]}>Actual</Text>
      <Text style={[styles.cellNum, styles.headerText]}>Rank</Text>
      <Text style={[styles.cellInjury, styles.headerText]}>Injury</Text>
    </View>
  );
}

function PlayerRow({ player }) {
  return (
    <View style={styles.playerRow}>
      <Text style={styles.cellSlot}>{player.slot}</Text>
      <Text style={styles.cellPos}>{player.position}</Text>
      <Text style={styles.cellName}>{player.name}</Text>
      <Text style={styles.cellNum}>{player.projectedPts}</Text>
      <Text style={styles.cellNum}>{player.actualPts}</Text>
      <Text style={styles.cellNum}>{player.positionRank}</Text>
      <Text style={styles.cellInjury}>{player.injury}</Text>
    </View>
  );
}

function TeamCard({ team }) {
  return (
    <View testID={`team-${team.id}`} style={[styles.card, team.isYou && styles.cardYou]}>
      <View style={styles.teamHead}>
        <Text style={styles.teamName}>{team.name}</Text>
        {team.isYou ? <Text style={styles.youBadge}>You</Text> : null}
      </View>
      <View style={styles.standings}>
        <Text style={styles.meta}>{recordText(team.record)}</Text>
        <Text style={styles.meta}>PF {team.pointsFor}</Text>
        <Text style={styles.meta}>PA {team.pointsAgainst}</Text>
        {team.playoffSeed != null ? <Text style={styles.meta}>Seed {team.playoffSeed}</Text> : null}
        {team.waiverRank != null ? <Text style={styles.meta}>Waivers {team.waiverRank}</Text> : null}
      </View>
      <View style={styles.table}>
        <PlayerHeader />
        {team.players.map((player) => (
          <PlayerRow key={String(player.id)} player={player} />
        ))}
      </View>
    </View>
  );
}

export default function LeagueBoard({ leagueId }) {
  const [loading, setLoading] = useState(Boolean(leagueId));
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (!leagueId) {
      setLoading(false);
      setTeams([]);
      return;
    }
    setLoading(true);
    fetchLeague(leagueId)
      .then((data) => {
        setTeams(data.teams || []);
        setLoading(false);
      })
      .catch(() => {
        setTeams([]);
        setLoading(false);
      });
  }, [leagueId]);

  if (loading) {
    return <ActivityIndicator testID="league-loading" />;
  }

  if (!leagueId) {
    return (
      <Text style={styles.empty}>Add a league in settings, then pick it here.</Text>
    );
  }

  return (
    <View style={styles.board}>
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  cardYou: {
    borderColor: "#18181b",
    borderWidth: 2,
  },
  teamHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "700",
  },
  youBadge: {
    backgroundColor: "#18181b",
    color: "#fafafa",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
    borderRadius: 4,
  },
  standings: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  meta: {
    color: "#3f3f46",
    fontWeight: "600",
  },
  table: {
    overflow: "auto",
  },
  playerRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    minWidth: 640,
  },
  playerHeader: {
    backgroundColor: "#f4f4f5",
  },
  headerText: {
    fontWeight: "700",
    color: "#18181b",
  },
  cellSlot: {
    width: 56,
  },
  cellPos: {
    width: 48,
  },
  cellName: {
    width: 160,
  },
  cellNum: {
    width: 72,
  },
  cellInjury: {
    width: 88,
  },
  empty: {
    padding: 16,
    color: "#52525b",
  },
});
