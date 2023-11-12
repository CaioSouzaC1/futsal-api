export interface createPlayerI {
  name: string;
  number: number;
  teamId: string;
}

export interface createPlayerResponseI {
  status: number;
  message: string;
  player_id?: number;
}

export interface editPlayerI {
  id: string;
  name: string;
  number: number;
  teamId: number;
}

export interface editPlayerResponseI {
  status: number;
  message: string;
  player?: object;
}
