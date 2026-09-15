import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { fetchEvaluate } from "../api/evaluate";
import { fetchLeague, refreshLeague, setLineup } from "../api/league";
import { claimWaiver, fetchWaivers } from "../api/waivers";
import { isDataTableWidth } from "../layout";
import {
  ActionButton,
  Card,
  Chip,
  EmptyState,
  InlineBanner,
  LoadingState,
  SectionHeader,
  StatPill,
} from "../ui/primitives";
import { colors, radii, spacing, typography } from "../ui/theme";
import { useWindowWidth } from "../useWindowWidth";
import Workshop from "./Workshop";

function recordText(record) {
  return `${record.wins}-${record.losses}-${record.ties}`;
}

function displayNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "—";
  }
  return String(Number(number.toFixed(1)));
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

function lineupLabel(player, showLineup) {
  if (!showLineup || typeof player.recommendedStarter !== "boolean") {
    return "";
  }
  return player.recommendedStarter ? "Start" : "Sit";
}

function playerTestID(player, injuredStarter) {
  return injuredStarter
    ? `injury-starter-${player.id}`
    : `player-${player.id}`;
}

function PlayerRow({ player, onPress, selected, showLineup }) {
  const injuredStarter = isInjuredStarter(player);
  const lineup = lineupLabel(player, showLineup);

  return (
    <Pressable
      testID={playerTestID(player, injuredStarter)}
      accessibilityRole="button"
      accessibilityLabel={`${player.name}, ${player.position}, ${player.slot}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.playerRow,
        injuredStarter && styles.injuredStarter,
        selected && styles.playerSelected,
        pressed && styles.rowPressed,
      ]}
    >
      <Text style={[styles.cellSlot, styles.playerCell]}>{player.slot}</Text>
      <Text style={[styles.cellPos, styles.playerCell]}>{player.position}</Text>
      <View style={styles.cellName}>
        <Text numberOfLines={1} style={styles.playerName}>
          {player.name}
        </Text>
        {lineup ? (
          <Text
            testID={player.recommendedStarter ? "lineup-start" : "lineup-sit"}
            style={[
              styles.lineupBadge,
              player.recommendedStarter ? styles.lineupStart : styles.lineupSit,
            ]}
          >
            {lineup}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.cellNum, styles.playerStat]}>
        {player.projectedPts}
      </Text>
      <Text style={[styles.cellNum, styles.playerStat]}>{player.actualPts}</Text>
      <Text style={[styles.cellNum, styles.playerStat]}>
        {player.positionRank}
      </Text>
      <Text
        style={[
          styles.cellInjury,
          styles.playerCell,
          player.injury ? styles.injuryText : null,
        ]}
      >
        {player.injury}
      </Text>
    </Pressable>
  );
}

function PlayerCard({ player, onPress, selected, showLineup }) {
  const injuredStarter = isInjuredStarter(player);
  const lineup = lineupLabel(player, showLineup);

  return (
    <Pressable
      testID={playerTestID(player, injuredStarter)}
      accessibilityRole="button"
      accessibilityLabel={`${player.name}, ${player.position}, ${player.slot}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.playerCard,
        injuredStarter && styles.injuredStarter,
        selected && styles.playerSelected,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.playerCardTop}>
        <View style={styles.positionMark}>
          <Text style={styles.positionText}>{player.position}</Text>
        </View>
        <View style={styles.playerIdentity}>
          <Text numberOfLines={1} style={styles.playerName}>
            {player.name}
          </Text>
          <Text style={styles.playerSlot}>{player.slot}</Text>
        </View>
        <View style={styles.playerBadges}>
          {lineup ? (
            <Text
              testID={player.recommendedStarter ? "lineup-start" : "lineup-sit"}
              style={[
                styles.lineupBadge,
                player.recommendedStarter ? styles.lineupStart : styles.lineupSit,
              ]}
            >
              {lineup}
            </Text>
          ) : null}
          {player.injury ? (
            <Text style={styles.injuryBadge}>{player.injury}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.mobileStats}>
        <View style={styles.mobileStat}>
          <Text style={styles.mobileStatLabel}>Projected</Text>
          <Text style={styles.mobileStatValue}>{player.projectedPts}</Text>
        </View>
        <View style={styles.mobileStat}>
          <Text style={styles.mobileStatLabel}>Actual</Text>
          <Text style={styles.mobileStatValue}>{player.actualPts}</Text>
        </View>
        <View style={styles.mobileStat}>
          <Text style={styles.mobileStatLabel}>Pos rank</Text>
          <Text style={styles.mobileStatValue}>{player.positionRank}</Text>
        </View>
      </View>
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

function tagTone(tag) {
  if (tag.endsWith("+")) {
    return "positive";
  }
  if (tag.endsWith("-")) {
    return "warning";
  }
  return "default";
}

function TeamCard({
  desktop,
  forceExpanded,
  onPlayerPress,
  selectedPlayerIds,
  team,
}) {
  const [expanded, setExpanded] = useState(Boolean(team.isYou));
  const showRoster = forceExpanded || expanded;

  return (
    <Card
      testID={`team-${team.id}`}
      style={[styles.teamCard, team.isYou && styles.cardYou]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${team.name} roster`}
        accessibilityHint="Expands or collapses the team roster"
        accessibilityState={{ expanded: showRoster }}
        onPress={() => setExpanded((current) => !current)}
        style={({ pressed }) => [styles.teamHead, pressed && styles.rowPressed]}
      >
        <View style={styles.teamTitleRow}>
          <View
            style={[
              styles.teamAvatar,
              team.isYou && styles.teamAvatarYou,
            ]}
          >
            <Text
              style={[
                styles.teamAvatarText,
                team.isYou && styles.teamAvatarTextYou,
              ]}
            >
              {(team.name || "?").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.teamTitleCopy}>
            <View style={styles.teamNameRow}>
              <Text style={styles.teamName}>{team.name}</Text>
              {team.isYou ? <Text style={styles.youBadge}>You</Text> : null}
            </View>
            <Text style={styles.teamRecord}>{recordText(team.record)}</Text>
          </View>
        </View>
        <View style={[styles.expandMark, showRoster && styles.expandMarkOpen]}>
          <Text style={styles.expandText}>⌄</Text>
        </View>
      </Pressable>
      <View style={styles.standings}>
        <View style={styles.teamStat}>
          <Text style={styles.teamStatLabel}>Points for</Text>
          <Text style={styles.teamStatValue}>PF {team.pointsFor}</Text>
        </View>
        <View style={styles.teamStat}>
          <Text style={styles.teamStatLabel}>Points against</Text>
          <Text style={styles.teamStatValue}>PA {team.pointsAgainst}</Text>
        </View>
        {team.playoffSeed != null ? (
          <View style={styles.teamStat}>
            <Text style={styles.teamStatLabel}>Playoff</Text>
            <Text style={styles.teamStatValue}>Seed {team.playoffSeed}</Text>
          </View>
        ) : null}
        {team.waiverRank != null ? (
          <View style={styles.teamStat}>
            <Text style={styles.teamStatLabel}>Priority</Text>
            <Text style={styles.teamStatValue}>
              Waiver rank {team.waiverRank}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.tagStrip}>
        {(team.surplusNeed || []).map((tag) => (
          <StatPill key={tag} label={tag} tone={tagTone(tag)} />
        ))}
      </View>
      {showRoster ? (
        desktop ? (
          <View testID={`roster-table-${team.id}`} style={styles.rosterTable}>
            <PlayerHeader />
            {team.players.map((player) => (
              <PlayerRow
                key={String(player.id)}
                player={player}
                selected={selectedPlayerIds.has(player.id)}
                showLineup={team.isYou}
                onPress={() => onPlayerPress(player, team.isYou)}
              />
            ))}
          </View>
        ) : (
          <View testID={`roster-cards-${team.id}`} style={styles.rosterCards}>
            {team.players.map((player) => (
              <PlayerCard
                key={String(player.id)}
                player={player}
                selected={selectedPlayerIds.has(player.id)}
                showLineup={team.isYou}
                onPress={() => onPlayerPress(player, team.isYou)}
              />
            ))}
          </View>
        )
      ) : null}
    </Card>
  );
}

export default function LeagueBoard({
  leagueId,
  reloadToken = 0,
  onReload,
  workshopOwner,
  setWorkshopOwner,
}) {
  const width = useWindowWidth();
  const desktop = isDataTableWidth(width);
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
  const [evaluating, setEvaluating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lineupBusy, setLineupBusy] = useState(false);
  const [waiverBusy, setWaiverBusy] = useState(false);
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
      setEvaluating(false);
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
        setEvaluating(false);
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
        setEvaluating(false);
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
    setEvaluating(true);
    fetchEvaluate(
      leagueId,
      nextYou.map((row) => row.id).join("+"),
      nextThem.map((row) => row.id).join("+")
    )
      .then((trade) => {
        setWorkshop(trade);
        setWorkshopOwner?.("board");
      })
      .catch(() => setBoardError("Could not evaluate"))
      .finally(() => setEvaluating(false));
  }

  function clearSelection() {
    setYouPlayers([]);
    setThemPlayers([]);
    setWorkshop(null);
    setWorkshopOwner?.(null);
    setEvaluating(false);
  }

  function onRefresh() {
    setRefreshing(true);
    refreshLeague(leagueId)
      .then(() => onReload?.())
      .catch((err) => setBoardError(err.body?.error || "Refresh failed"))
      .finally(() => setRefreshing(false));
  }

  function onSetLineup() {
    setLineupBusy(true);
    setLineup(leagueId)
      .then(() => onReload?.())
      .catch((err) => setBoardError(err.body?.error || "Lineup failed"))
      .finally(() => setLineupBusy(false));
  }

  function onClaimWaiver() {
    if (!suggested) {
      return;
    }
    setWaiverBusy(true);
    claimWaiver(leagueId, suggested.add.id, suggested.drop.id)
      .then(() => onReload?.())
      .catch((err) => setBoardError(err.body?.error || "Claim failed"))
      .finally(() => setWaiverBusy(false));
  }

  if (loading) {
    return <LoadingState testID="league-loading" label="Loading league board" />;
  }

  if (!leagueId) {
    return (
      <EmptyState
        title="Add a league in settings, then pick it here."
        description="Connect ESPN above to unlock roster, lineup, and waiver intelligence."
      />
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
  const hasSelection = youPlayers.length > 0 || themPlayers.length > 0;
  const selectedPlayerIds = new Set(
    [...youPlayers, ...themPlayers].map((player) => player.id)
  );

  return (
    <View style={styles.board}>
      <SectionHeader
        eyebrow="Roster intelligence"
        title="League board"
        subtitle="Search every roster, spot lineup leaks, and build a deal."
      />
      <Card style={styles.controlPanel}>
        <View style={styles.searchWrap}>
          <View style={styles.searchMark}>
            <Text style={styles.searchMarkText}>⌕</Text>
          </View>
          <TextInput
            accessibilityLabel="Search players"
            placeholder="Search players"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            style={styles.search}
          />
        </View>
        <View style={styles.toolbar}>
          <Chip
            label={sortLabel}
            onPress={() =>
              setSort((current) =>
                current === "slot"
                  ? "proj"
                  : current === "proj"
                    ? "rank"
                    : "slot"
              )
            }
          />
          <ActionButton
            testID="board-refresh"
            label="Refresh"
            busyLabel="Refreshing"
            busy={refreshing}
            onPress={onRefresh}
            variant="secondary"
            style={styles.toolbarAction}
          />
          <ActionButton
            label="Set lineup on ESPN"
            busyLabel="Setting lineup"
            busy={lineupBusy}
            onPress={onSetLineup}
            style={styles.toolbarAction}
          />
        </View>
        {fetchedAt ? (
          <View style={styles.syncRow}>
            <View style={styles.syncDot} />
            <Text style={styles.syncLabel}>Last sync</Text>
            <Text style={styles.syncValue}>{fetchedAt}</Text>
          </View>
        ) : null}
      </Card>
      {boardError ? (
        <InlineBanner
          tone="danger"
          title="League data needs attention"
          message={boardError}
          actionLabel="Retry"
          onAction={loadBoard}
        />
      ) : null}
      {hasSelection && !showWorkshop ? (
        <Card testID="trade-selection" style={styles.selectionCard}>
          <View style={styles.selectionHeader}>
            <View>
              <Text style={styles.selectionEyebrow}>Quick evaluation</Text>
              <Text style={styles.selectionTitle}>Trade builder</Text>
            </View>
            <ActionButton
              label="Clear selection"
              variant="ghost"
              onPress={clearSelection}
            />
          </View>
          <View style={styles.selectionSides}>
            <View style={styles.selectionSide}>
              <Text style={styles.selectionLabel}>Your side</Text>
              {youPlayers.length ? (
                youPlayers.map((player) => (
                  <View
                    key={player.id}
                    testID={`selected-your-${player.id}`}
                    style={styles.selectionPlayer}
                  >
                    <Text style={styles.selectionPlayerText}>{player.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.selectionEmpty}>Pick your player</Text>
              )}
            </View>
            <Text style={styles.selectionSwap}>⇄</Text>
            <View style={styles.selectionSide}>
              <Text style={styles.selectionLabel}>Their side</Text>
              {themPlayers.length ? (
                themPlayers.map((player) => (
                  <View
                    key={player.id}
                    testID={`selected-their-${player.id}`}
                    style={styles.selectionPlayer}
                  >
                    <Text style={styles.selectionPlayerText}>{player.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.selectionEmpty}>Pick their player</Text>
              )}
            </View>
          </View>
          <Text style={styles.selectionHint}>
            {evaluating
              ? "Evaluating matchup…"
              : "Select players from both sides to evaluate the deal."}
          </Text>
        </Card>
      ) : null}
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
          desktop={desktop}
          team={team}
          onPlayerPress={onPlayerPress}
          forceExpanded={Boolean(needle)}
          selectedPlayerIds={selectedPlayerIds}
        />
      ))}
      <View style={styles.waiverSection}>
        <SectionHeader
          eyebrow="Free agent edge"
          title="Waivers"
          subtitle="Prioritize moves that improve your weekly starter floor."
        />
        {suggested ? (
          <Card testID="waiver-suggestion" style={styles.waiverHero} elevated>
            <View style={styles.waiverHeroCopy}>
              <Text style={styles.waiverEyebrow}>Recommended move</Text>
              <Text style={styles.waiverMove}>
                {`Add ${suggested.add.name}, drop ${suggested.drop.name}`}
              </Text>
              <Text style={styles.waiverHelper}>
                The strongest available upgrade based on projected starter value.
              </Text>
            </View>
            <ActionButton
              testID="waiver-claim"
              label="File waiver on ESPN"
              busyLabel="Filing waiver"
              busy={waiverBusy}
              onPress={onClaimWaiver}
              style={styles.waiverAction}
            />
          </Card>
        ) : null}
        {waivers.length ? (
          <View style={styles.waiverList}>
            {waivers.map((player) => (
              <Card key={String(player.id)} style={styles.waiverPlayer}>
                <View style={styles.waiverIdentity}>
                  <View style={styles.positionMark}>
                    <Text style={styles.positionText}>{player.position}</Text>
                  </View>
                  <View style={styles.waiverNameWrap}>
                    <Text style={styles.waiverName}>{player.name}</Text>
                    <Text style={styles.waiverProjection}>
                      {player.position} · {displayNumber(player.projectedPts)} projected
                    </Text>
                  </View>
                </View>
                <View style={styles.waiverTags}>
                  <StatPill
                    label={`${player.deltaVsWorstStarter > 0 ? "+" : ""}${displayNumber(player.deltaVsWorstStarter)}`}
                    tone={player.deltaVsWorstStarter > 0 ? "positive" : "default"}
                  />
                  {player.beatsStarter ? (
                    <StatPill label="beats starter" tone="positive" />
                  ) : null}
                  {player.streamer ? (
                    <StatPill label="streamer" tone="warning" />
                  ) : null}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No free agents."
            description="The wire is quiet right now. Refresh after ESPN updates."
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  controlPanel: {
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
  },
  searchWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.canvasMuted,
    flexDirection: "row",
    alignItems: "center",
  },
  searchMark: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchMarkText: {
    color: colors.textMuted,
    fontSize: 22,
  },
  search: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    ...typography.body,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  toolbarAction: {
    flexGrow: 1,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  syncLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  syncValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  selectionCard: {
    gap: spacing.md,
    borderColor: colors.info,
    backgroundColor: colors.infoSoft,
  },
  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  selectionEyebrow: {
    ...typography.sectionLabel,
    color: colors.info,
    marginBottom: 2,
  },
  selectionTitle: {
    ...typography.title,
    color: colors.text,
  },
  selectionSides: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectionSide: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  selectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  selectionPlayer: {
    minHeight: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  selectionPlayerText: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  selectionEmpty: {
    ...typography.caption,
    color: colors.textMuted,
    paddingVertical: 10,
  },
  selectionSwap: {
    color: colors.info,
    fontSize: 20,
  },
  selectionHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  teamCard: {
    padding: 0,
    overflow: "hidden",
  },
  cardYou: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  teamHead: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  teamAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  teamAvatarYou: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  teamAvatarText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "900",
  },
  teamAvatarTextYou: {
    color: colors.accent,
  },
  teamTitleCopy: {
    flex: 1,
    minWidth: 0,
  },
  teamNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  teamName: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
  },
  youBadge: {
    ...typography.caption,
    backgroundColor: colors.accent,
    color: colors.accentInk,
    fontWeight: "900",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
    borderRadius: radii.pill,
  },
  teamRecord: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  expandMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "0deg" }],
  },
  expandMarkOpen: {
    transform: [{ rotate: "180deg" }],
  },
  expandText: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 23,
    marginTop: -5,
  },
  standings: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.canvasMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamStat: {
    minWidth: 92,
    flexGrow: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  teamStatLabel: {
    ...typography.sectionLabel,
    color: colors.textMuted,
  },
  teamStatValue: {
    ...typography.stat,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagStrip: {
    minHeight: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rosterCards: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  rosterTable: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  playerCard: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.md,
    gap: spacing.md,
  },
  playerCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  positionMark: {
    minWidth: 38,
    height: 34,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: colors.info,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    ...typography.caption,
    color: colors.info,
    fontWeight: "900",
  },
  playerIdentity: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    ...typography.bodyStrong,
    color: colors.text,
    flexShrink: 1,
  },
  playerSlot: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  playerBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  lineupBadge: {
    ...typography.caption,
    fontWeight: "900",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  lineupStart: {
    color: colors.success,
    backgroundColor: colors.successSoft,
  },
  lineupSit: {
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
  },
  injuryBadge: {
    ...typography.caption,
    color: colors.danger,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    overflow: "hidden",
    fontWeight: "900",
  },
  mobileStats: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  mobileStat: {
    flex: 1,
  },
  mobileStatLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  mobileStatValue: {
    ...typography.stat,
    color: colors.textSecondary,
    marginTop: 1,
  },
  injuredStarter: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
  },
  playerSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  rowPressed: {
    opacity: 0.72,
  },
  playerHeader: {
    minHeight: 42,
    backgroundColor: colors.surfaceMuted,
  },
  headerText: {
    ...typography.sectionLabel,
    color: colors.textMuted,
  },
  playerCell: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  playerStat: {
    ...typography.stat,
    color: colors.textSecondary,
  },
  cellSlot: {
    flexBasis: 48,
    flexGrow: 0,
    flexShrink: 0,
  },
  cellPos: {
    flexBasis: 42,
    flexGrow: 0,
    flexShrink: 0,
  },
  cellName: {
    flex: 2,
    minWidth: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cellNum: {
    flex: 0.75,
    minWidth: 46,
    textAlign: "right",
  },
  cellInjury: {
    flexBasis: 70,
    flexGrow: 0,
    flexShrink: 0,
    textAlign: "right",
  },
  injuryText: {
    color: colors.danger,
    fontWeight: "800",
  },
  waiverSection: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  waiverHero: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.lg,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  waiverHeroCopy: {
    flex: 2,
    minWidth: 220,
  },
  waiverEyebrow: {
    ...typography.sectionLabel,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  waiverMove: {
    ...typography.title,
    color: colors.text,
  },
  waiverHelper: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  waiverAction: {
    flexGrow: 1,
  },
  waiverList: {
    gap: spacing.sm,
  },
  waiverPlayer: {
    minHeight: 72,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    padding: spacing.md,
  },
  waiverIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    minWidth: 180,
  },
  waiverNameWrap: {
    flex: 1,
    minWidth: 0,
  },
  waiverName: {
    ...typography.bodyStrong,
    color: colors.text,
  },
  waiverProjection: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  waiverTags: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
