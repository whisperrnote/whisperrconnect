'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

type ColorModeContextType = {
  toggleColorMode: () => void;
  mode: 'light' | 'dark';
};

const ColorModeContext = createContext<ColorModeContextType>({ toggleColorMode: () => {}, mode: 'light' });

export const useColorMode = () => useContext(ColorModeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#FFC700', // Sun yellow
            light: '#FFCF40',
            dark: '#D6A300',
            contrastText: '#1a1a1a',
          },
          secondary: {
            main: '#3d2f26', // Muted brown
            light: '#6b5b4f',
            dark: '#1a120e',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'light' ? '#f8f8f8' : '#0f0f0f',
            paper: mode === 'light' ? '#ffffff' : '#1a1a1a',
          },
          text: {
            primary: mode === 'light' ? '#0f0a08' : '#faf8f6',
            secondary: mode === 'light' ? '#3d2f26' : '#c4b5a8',
          },
          divider: mode === 'light' ? '#e8e8e8' : '#2a2a2a',
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(15, 15, 15, 0.85)',
                        color: mode === 'light' ? '#0f0a08' : '#faf8f6',
                        backdropFilter: 'blur(24px)',
                        borderBottom: `1px solid ${mode === 'light' ? '#e8e8e8' : '#2a2a2a'}`,
                        boxShadow: 'none',
                    }
                }
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#f8f8f8' : '#0f0f0f',
                        borderRight: `1px solid ${mode === 'light' ? '#e8e8e8' : '#2a2a2a'}`,
                    }
                }
            },
            MuiButton: {
              styleOverrides: {
                root: {
                  borderRadius: 12,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                },
                containedPrimary: {
                  color: '#1a1a1a',
                }
              }
            },
            MuiPaper: {
              styleOverrides: {
                root: {
                  backgroundImage: 'none',
                }
              }
            }
        }
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};
