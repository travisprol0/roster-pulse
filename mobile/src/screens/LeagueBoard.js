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

function isInjuredStarter(player) {
  const injury = (player.injury || "").toUpperCase();
  const slot = player.slot || "";
  if (!injury || slot === "BE" || slot === "IR") {
    return false;
  }
  return (
    injury === "OUT" ||
    injury === "QUESTIONABLE" ||
    injury === "DOUBTFUL" ||
    injury === "IR"
  );
}

function PlayerRow({ player, onPress, showLineup }) {
  let lineup = null;
  if (showLineup && typeof player.recommendedStarter === "boolean") {
    lineup = (
      <Text testID={player.recommendedStarter ? "lineup-start" : "lineup-sit"} style={styles.cellLineup}>
        {player.recommendedStarter ? "Start" : "Sit"}
      </Text>
    );
  }
  const injuredStarter = isInjuredStarter(player);
  return (
    <Pressable
      testID={injuredStarter ? `injury-starter-${player.id}` : undefined}
      onPress={onPress}
      style={[styles.playerRow, injuredStarter && styles.injuredStarter]}
    >
      <Text style={styles.cellSlot}>{player.slot}</Text>
      <Text style={styles.cellPos}>{player.position}</Text>
      <Text style={styles.cellName} onPress={onPress}>
        {player.name}
      </Text>
      {lineup}
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

function sortPlayers(players, sort) {
  if (sort === "slot") {
    return players;
  }
  const ranked = players.map((player, index) => ({ player, index }));
  ranked.sort((a, b) => {
    let cmp = 0;
    if (sort === "proj") {
      cmp = (b.player.projectedPts || 0) - (a.player.projectedPts || 0);
    } else {
      cmp = (a.player.positionRank || 99) - (b.player.positionRank || 99);
    }
    return cmp !== 0 ? cmp : a.index - b.index;
  });
  return ranked.map((row) => row.player);
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
      <View style={styles.standings}>
        {(team.surplusNeed || []).map((tag) => (
          <Text key={tag} style={styles.meta}>
            {tag}
          </Text>
        ))}
      </View>
      {showRoster ? (
        <View style={styles.table}>
          <PlayerHeader />
          {team.players.map((player) => (
            <PlayerRow
              key={String(player.id)}
              player={player}
              showLineup={team.isYou}
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
  const [sort, setSort] = useState("slot");

  useEffect(() => {
    if (!leagueId) {
      setLoading(false);
      setTeams([]);
      setYouPlayer(null);
      setThemPlayer(null);
      setWorkshop(null);
      setQuery("");
      setSort("slot");
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
        setSort("slot");
        setLoading(false);
      })
      .catch(() => {
        setTeams([]);
        setYouPlayer(null);
        setThemPlayer(null);
        setWorkshop(null);
        setQuery("");
        setSort("slot");
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
      players: sortPlayers(
        needle
          ? team.players.filter((player) =>
              (player.name || "").toLowerCase().includes(needle)
            )
          : team.players,
        sort
      ),
    }))
    .filter((team) => !needle || team.players.length > 0);

  const sortLabel = sort === "slot" ? "Sort: Slot" : sort === "proj" ? "Sort: Proj" : "Sort: Rank";

  function cycleSort() {
    setSort((current) =>
      current === "slot" ? "proj" : current === "proj" ? "rank" : "slot"
    );
  }

  return (
    <View style={styles.board}>
      <TextInput
        placeholder="Search players"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        style={styles.search}
      />
      <Pressable onPress={cycleSort}>
        <Text onPress={cycleSort}>{sortLabel}</Text>
      </Pressable>
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
  injuredStarter: {
    backgroundColor: "#fecaca",
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
  cellLineup: {
    width: 48,
    fontWeight: "700",
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
