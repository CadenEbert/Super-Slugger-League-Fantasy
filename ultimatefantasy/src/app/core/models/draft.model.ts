export interface DraftState {
  id: string;
  league_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  current_pick: number;
  round: number;
  number_of_rounds: number;
  pick_order: string[];
  current_pick_index: number;
  current_round: number;
  timer_seconds: number;
  timer_running: boolean;
  draft_type: string;
  player_pool: number[];
}

export interface DraftPick {
  id: string;
  draft_id: string;
  member_picking: string;
  character_picked: number;
  pick_number: number;
  league_id: string;
}

export interface playerPool {
  id: number;
  name: string;
}

export interface CharacterStats {
  id: number | string;
  character_name: string;
  weight: number;
  captain: boolean;
  bunting: number;
  speed: number;
  fielding: number;
  curve: number;
  traj: number;
  stamina: number;
  pitching_arm: string;
  batting_arm: string;
  character_class: string;
  star_pitch: string;
  fielding_ability: number;
  star_swing: string;
  baserunning_ability: number;
  slap_size: number;
  charge_size: number;
  slap_power: number;
  charge_power: number;
  outfield_throwing: number;
  displayed_pitching: number;
  displayed_batting: number;
  displayed_fielding: number;
  dis_speed: number;
  curveball_speed: number;
  charge_pitch_speed: number;
  hit_curve: number;
  star_pitch_type: string;
}

export interface DraftedPlayer {
  character: CharacterStats;
  member_picking: string;
  pick_number: number;
}