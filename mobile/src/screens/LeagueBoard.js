import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { fetchEvaluate } from "../api/evaluate";
import { fetchLeague, refreshLeague, setLineup } from "../api/league";
import { claimWaiver, fetchWaivers } from "../api/waivers";
import Workshop from "./Workshop";

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
      <Text style={styles.cellName}>{player.name}</Text>
      {lineup}
      <Text style={styles.cellNum}>{player.projectedPts}</Text>
      <Text style={styles.cellNum}>{player.actualPts}</Text>
      <Text style={styles.cellNum}>{player.positionRank}</Text>
      <Text style={styles.cellInjury}>{player.injury}</Text>
    </Pressable>
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

function togglePick(list, player, max) {
  if (list.some((row) => row.id === player.id)) {
    return list.filter((row) => row.id !== player.id);
  }
  return [...list, player].slice(-max);
}

function TeamCard({ team, onPlayerPress, forceExpanded }) {
  const [expanded, setExpanded] = useState(Boolean(team.isYou));
  const showRoster = forceExpanded || expanded;

  return (
    <View testID={`team-${team.id}`} style={[styles.card, team.isYou && styles.cardYou]}>
      <Pressable onPress={() => setExpanded((current) => !current)} style={styles.teamHead}>
        <Text style={styles.teamName}>{team.name}</Text>
        {team.isYou ? <Text style={styles.youBadge}>You</Text> : null}
      </Pressable>
      <View style={styles.standings}>
        <Text style={styles.meta}>{recordText(team.record)}</Text>
        <Text style={styles.meta}>PF {team.pointsFor}</Text>
        <Text style={styles.meta}>PA {team.pointsAgainst}</Text>
        {team.playoffSeed != null ? <Text style={styles.meta}>Seed {team.playoffSeed}</Text> : null}
        {team.waiverRank != null ? <Text style={styles.meta}>Waiver rank {team.waiverRank}</Text> : null}
      </View>
      <View style={styles.standings}>
        {(team.surplusNeed || []).map((tag) => (
          <Text key={tag} style={styles.meta}>
            {tag}
          </Text>
        ))}
      </View>
      {showRoster ? (
        <ScrollView horizontal>
          <View>
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
        </ScrollView>
      ) : null}
    </View>
  );
}

export default function LeagueBoard({
  leagueId,
  reloadToken = 0,
  onReload,
  workshopOwner,
  setWorkshopOwner,
}) {
  const [loading, setLoading] = useState(Boolean(leagueId));
  const [teams, setTeams] = useState([]);
  const [youPlayers, setYouPlayers] = useState([]);
  const [themPlayers, setThemPlayers] = useState([]);
  const [workshop, setWorkshop] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("slot");
  const [fetchedAt, setFetchedAt] = useState("");
  const [boardError, setBoardError] = useState("");
  const [waivers, setWaivers] = useState([]);
  const [suggested, setSuggested] = useState(null);
  const seq = useRef(0);

  function loadBoard() {
    if (!leagueId) {
      setLoading(false);
      setTeams([]);
      setYouPlayers([]);
      setThemPlayers([]);
      setWorkshop(null);
      setQuery("");
      setSort("slot");
      setFetchedAt("");
      setBoardError("");
      setWaivers([]);
      setSuggested(null);
      return;
    }
    const token = seq.current + 1;
    seq.current = token;
    setLoading(true);
    Promise.all([fetchLeague(leagueId), fetchWaivers(leagueId)])
      .then(([data, waiverData]) => {
        if (seq.current !== token) {
          return;
        }
        setTeams(data.teams || []);
        setYouPlayers([]);
        setThemPlayers([]);
        setWorkshop(null);
        setQuery("");
        setSort("slot");
        setFetchedAt(data.fetchedAt || "");
        setBoardError(data.error || waiverData.error || "");
        setWaivers(waiverData.waivers || []);
        setSuggested(waiverData.suggested || null);
        setLoading(false);
      })
      .catch(() => {
        if (seq.current !== token) {
          return;
        }
        setTeams([]);
        setYouPlayers([]);
        setThemPlayers([]);
        setWorkshop(null);
        setQuery("");
        setSort("slot");
        setFetchedAt("");
        setBoardError("Could not load league");
        setWaivers([]);
        setSuggested(null);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadBoard();
  }, [leagueId, reloadToken]);

  function onPlayerPress(player, isYou) {
    const nextYou = isYou ? togglePick(youPlayers, player, 2) : youPlayers;
    const nextThem = isYou ? themPlayers : togglePick(themPlayers, player, 2);
    setYouPlayers(nextYou);
    setThemPlayers(nextThem);
    const total = nextYou.length + nextThem.length;
    if (!nextYou.length || !nextThem.length || total > 3) {
      return;
    }
    fetchEvaluate(
      leagueId,
      nextYou.map((row) => row.id).join("+"),
      nextThem.map((row) => row.id).join("+")
    )
      .then((trade) => {
        setWorkshop(trade);
        setWorkshopOwner?.("board");
      })
      .catch(() => setBoardError("Could not evaluate"));
  }

  function clearSelection() {
    setYouPlayers([]);
    setThemPlayers([]);
    setWorkshop(null);
    setWorkshopOwner?.(null);
  }

  function onRefresh() {
    refreshLeague(leagueId)
      .then(() => onReload?.())
      .catch((err) => setBoardError(err.body?.error || "Refresh failed"));
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

  const showWorkshop = workshop && workshopOwner !== "trades";

  return (
    <View style={styles.board}>
      <TextInput
        placeholder="Search players"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        style={styles.search}
      />
      <Pressable onPress={() => setSort((current) => (current === "slot" ? "proj" : current === "proj" ? "rank" : "slot"))}>
        <Text>{sortLabel}</Text>
      </Pressable>
      <Pressable onPress={onRefresh}>
        <Text>Refresh</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          setLineup(leagueId)
            .then(() => onReload?.())
            .catch((err) => setBoardError(err.body?.error || "Lineup failed"))
        }
      >
        <Text>Set lineup on ESPN</Text>
      </Pressable>
      {boardError ? (
        <View>
          <Text>{boardError}</Text>
          <Pressable onPress={loadBoard}>
            <Text>Retry</Text>
          </Pressable>
        </View>
      ) : null}
      {fetchedAt ? <Text>{fetchedAt}</Text> : null}
      {showWorkshop ? (
        <Workshop
          trade={workshop}
          onClear={clearSelection}
          clearLabel="Clear selection"
          leagueId={leagueId}
          onReload={onReload}
        />
      ) : null}
      {visibleTeams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onPlayerPress={onPlayerPress}
          forceExpanded={Boolean(needle)}
        />
      ))}
      <View>
        <Text>Waivers</Text>
        {suggested ? (
          <View>
            <Text>
              Add {suggested.add.name}, drop {suggested.drop.name}
            </Text>
            <Pressable
              onPress={() =>
                claimWaiver(leagueId, suggested.add.id, suggested.drop.id)
                  .then(() => onReload?.())
                  .catch((err) => setBoardError(err.body?.error || "Claim failed"))
              }
            >
              <Text>File waiver on ESPN</Text>
            </Pressable>
          </View>
        ) : null}
        {waivers.length ? (
          waivers.map((player) => (
            <View key={String(player.id)}>
              <Text>{player.name}</Text>
              <Text>
                {player.position} {player.projectedPts} {player.deltaVsWorstStarter}
                {player.beatsStarter ? " beats starter" : ""}
                {player.streamer ? " streamer" : ""}
              </Text>
            </View>
          ))
        ) : (
          <Text>No free agents.</Text>
        )}
      </View>
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
});
