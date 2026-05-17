
export interface Game {
    id: number;
    home_team: string;
    away_team: string | null;
    home_score: number | null;
    away_score: number | null;
    week: number;
    bye: boolean;
    playoff_game: boolean;
    league_id: string;
    created_at: string;
    home_team_uuid: string | null;
    away_team_uuid: string | null;
    round: number | null;
  }
  export interface ScheduleObj {
    leagueId: string;
    owner_id: string;
    current_week: number;
    total_weeks: number;
    status: string;
    current_round: number;
    winner_username: string | null;
  }