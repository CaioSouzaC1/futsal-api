export interface createGameI {
  date: string;
  homeTeamId: string;
  visitorTeamId: string;
  start: string;
  end: string;
  homeTeamGoals: number;
  visitorTeamGoals: number;
}

export interface createGameResponseI {
  status: number;
  message: string;
  game_id?: number;
}

export interface editGameI {
  id: string;
  date: string;
  homeTeamId: string;
  visitorTeamId: string;
  start: string;
  end: string;
  homeTeamGoals: number;
  visitorTeamGoals: number;
}

export interface updatePointsGameI {
  id: string | number;
  date: string;
  homeTeamId: string | number;
  visitorTeamId: string | number;
  start: string;
  end: string;
  homeTeamGoals: number;
  visitorTeamGoals: number;
}

export interface editGameResponseI {
  status: number;
  message: string;
  game?: number;
}
