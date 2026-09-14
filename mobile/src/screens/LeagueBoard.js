import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { fetchEvaluate } from "../api/evaluate";
import { fetchLeague } from "../api/league";
import { copyText } from "../clipboard";

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function pitchText(trade) {
  return `Send ${trade.send} to ${trade.teamBName} for ${trade.receive}. Your delta ${trade.teamADelta}, their delta ${trade.teamBDelta}.`;
}

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

function PlayerRow({ player, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.playerRow}>
      <Text style={styles.cellSlot}>{player.slot}</Text>
      <Text style={styles.cellPos}>{player.position}</Text>
      <Text style={styles.cellName} onPress={onPress}>
        {player.name}
      </Text>
      <Text style={styles.cellNum}>{player.projectedPts}</Text>
      <Text style={styles.cellNum}>{player.actualPts}</Text>
      <Text style={styles.cellNum}>{player.positionRank}</Text>
      <Text style={styles.cellInjury}>{player.injury}</Text>
    </Pressable>
  );
}

function Workshop({ trade, onClear }) {
  return (
    <View style={styles.workshop}>
      <Text style={styles.workshopTitle}>Workshop</Text>
      <Text>{trade.teamBName}</Text>
      <Text>{trade.send}</Text>
      <Text>{trade.receive}</Text>
      <Text>{formatDelta(trade.teamADelta)}</Text>
      <Text>{formatDelta(trade.teamBDelta)}</Text>
      <Text>{trade.beforeA}</Text>
      <Text>{trade.afterA}</Text>
      <Text>{trade.beforeB}</Text>
      <Text>{trade.afterB}</Text>
      <Pressable onPress={() => copyText(pitchText(trade))}>
        <Text onPress={() => copyText(pitchText(trade))}>Copy pitch</Text>
      </Pressable>
      <Pressable onPress={onClear}>
        <Text onPress={onClear}>Clear selection</Text>
      </Pressable>
    </View>
  );
}

function TeamCard({ team, onPlayerPress, forceExpanded }) {
  const [expanded, setExpanded] = useState(Boolean(team.isYou));
  const showRoster = forceExpanded || expanded;

  function toggle() {
    setExpanded((current) => !current);
  }

  return (
    <View testID={`team-${team.id}`} style={[styles.card, team.isYou && styles.cardYou]}>
      <Pressable onPress={toggle} style={styles.teamHead}>
        <Text onPress={toggle} style={styles.teamName}>
          {team.name}
        </Text>
        {team.isYou ? <Text style={styles.youBadge}>You</Text> : null}
      </Pressable>
      <View style={styles.standings}>
        <Text style={styles.meta}>{recordText(team.record)}</Text>
        <Text style={styles.meta}>PF {team.pointsFor}</Text>
        <Text style={styles.meta}>PA {team.pointsAgainst}</Text>
        {team.playoffSeed != null ? <Text style={styles.meta}>Seed {team.playoffSeed}</Text> : null}
        {team.waiverRank != null ? <Text style={styles.meta}>Waivers {team.waiverRank}</Text> : null}
      </View>
      {showRoster ? (
        <View style={styles.table}>
          <PlayerHeader />
          {team.players.map((player) => (
            <PlayerRow
              key={String(player.id)}
              player={player}
              onPress={() => onPlayerPress(player, team.isYou)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function LeagueBoard({ leagueId }) {
  const [loading, setLoading] = useState(Boolean(leagueId));
  const [teams, setTeams] = useState([]);
  const [youPlayer, setYouPlayer] = useState(null);
  const [themPlayer, setThemPlayer] = useState(null);
  const [workshop, setWorkshop] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!leagueId) {
      setLoading(false);
      setTeams([]);
      setYouPlayer(null);
      setThemPlayer(null);
      setWorkshop(null);
      setQuery("");
      return;
    }
    setLoading(true);
    fetchLeague(leagueId)
      .then((data) => {
        setTeams(data.teams || []);
        setYouPlayer(null);
        setThemPlayer(null);
        setWorkshop(null);
        setQuery("");
        setLoading(false);
      })
      .catch(() => {
        setTeams([]);
        setYouPlayer(null);
        setThemPlayer(null);
        setWorkshop(null);
        setQuery("");
        setLoading(false);
      });
  }, [leagueId]);

  function onPlayerPress(player, isYou) {
    const nextYou = isYou ? player : youPlayer;
    const nextThem = isYou ? themPlayer : player;
    setYouPlayer(nextYou);
    setThemPlayer(nextThem);
    if (!nextYou || !nextThem) {
      return;
    }
    fetchEvaluate(leagueId, nextYou.id, nextThem.id).then(setWorkshop);
  }

  function clearSelection() {
    setYouPlayer(null);
    setThemPlayer(null);
    setWorkshop(null);
  }

  if (loading) {
    return <ActivityIndicator testID="league-loading" />;
  }

  if (!leagueId) {
    return (
      <Text style={styles.empty}>Add a league in settings, then pick it here.</Text>
    );
  }

  const needle = query.trim().toLowerCase();
  const visibleTeams = teams
    .map((team) => ({
      ...team,
      players: needle
        ? team.players.filter((player) =>
            (player.name || "").toLowerCase().includes(needle)
          )
        : team.players,
    }))
    .filter((team) => !needle || team.players.length > 0);

  return (
    <View style={styles.board}>
      <TextInput
        placeholder="Search players"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        style={styles.search}
      />
      {workshop ? (
        <Workshop trade={workshop} onClear={clearSelection} />
      ) : null}
      {visibleTeams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onPlayerPress={onPlayerPress}
          forceExpanded={Boolean(needle)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: 12,
    marginBottom: 16,
  },
  search: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
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
  workshop: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  workshopTitle: {
    fontWeight: "700",
  },
});
