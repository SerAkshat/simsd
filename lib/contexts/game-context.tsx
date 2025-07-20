
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameSession, Round, Team, User } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useSession } from 'next-auth/react';

interface GameState {
  currentGameSession: GameSession | null;
  currentRound: Round | null;
  teams: Team[];
  users: User[];
  leaderboards: {
    individual: any[];
    team: any[];
  };
  loading: boolean;
  error: string | null;
}

type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GAME_SESSION'; payload: GameSession | null }
  | { type: 'SET_CURRENT_ROUND'; payload: Round | null }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_LEADERBOARDS'; payload: { individual: any[]; team: any[] } }
  | { type: 'UPDATE_TEAM_SCORE'; payload: { teamId: string; score: number } }
  | { type: 'UPDATE_USER_SCORE'; payload: { userId: string; score: number } };

const initialState: GameState = {
  currentGameSession: null,
  currentRound: null,
  teams: [],
  users: [],
  leaderboards: {
    individual: [],
    team: []
  },
  loading: false,
  error: null
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_GAME_SESSION':
      return { ...state, currentGameSession: action.payload };
    case 'SET_CURRENT_ROUND':
      return { ...state, currentRound: action.payload };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_LEADERBOARDS':
      return { ...state, leaderboards: action.payload };
    case 'UPDATE_TEAM_SCORE':
      return {
        ...state,
        teams: state.teams.map(team =>
          team.id === action.payload.teamId
            ? { ...team, totalScore: action.payload.score }
            : team
        )
      };
    case 'UPDATE_USER_SCORE':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, individualScore: action.payload.score }
            : user
        )
      };
    default:
      return state;
  }
}

interface GameContextValue extends GameState {
  dispatch: React.Dispatch<GameAction>;
  refreshData: () => Promise<void>;
  loadGameSession: (id: string) => Promise<void>;
  activateRound: (roundId: string) => Promise<void>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameContextProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { data: session } = useSession();

  const refreshData = async () => {
    if (!session?.user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const [teamsData, leaderboardsData] = await Promise.all([
        apiClient.getTeams(),
        apiClient.getLeaderboards()
      ]);

      dispatch({ type: 'SET_TEAMS', payload: teamsData });
      dispatch({ type: 'SET_LEADERBOARDS', payload: leaderboardsData });

      // Load active game session
      const gameSessionsData = await apiClient.getGameSessions();
      const activeSession = gameSessionsData.find((session: GameSession) => session.isActive);
      
      if (activeSession) {
        const fullSessionData = await apiClient.getGameSession(activeSession.id);
        dispatch({ type: 'SET_GAME_SESSION', payload: fullSessionData });
        
        if (fullSessionData.currentRound) {
          dispatch({ type: 'SET_CURRENT_ROUND', payload: fullSessionData.currentRound });
        }
      }

      // Load users if admin
      if (session.user.role === 'ADMIN') {
        const usersData = await apiClient.getUsers();
        dispatch({ type: 'SET_USERS', payload: usersData });
      }

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error refreshing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadGameSession = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionData = await apiClient.getGameSession(id);
      dispatch({ type: 'SET_GAME_SESSION', payload: sessionData });
      
      if (sessionData.currentRound) {
        dispatch({ type: 'SET_CURRENT_ROUND', payload: sessionData.currentRound });
      }
    } catch (error) {
      console.error('Error loading game session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load game session' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const activateRound = async (roundId: string) => {
    try {
      await apiClient.activateRound(roundId);
      await refreshData(); // Refresh to get updated state
    } catch (error) {
      console.error('Error activating round:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to activate round' });
    }
  };

  useEffect(() => {
    if (session?.user) {
      refreshData();
    }
  }, [session]);

  const value: GameContextValue = {
    ...state,
    dispatch,
    refreshData,
    loadGameSession,
    activateRound
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameContextProvider');
  }
  return context;
}
