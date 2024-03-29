import React, { Suspense, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';

import { defaultTheme } from './theme';
import systemSlice from './redux/systemSlice';
import TitlePage from './components/TitlePage';
import GamePage from './components/GamePage';

const { actions: systemActions } = systemSlice;
const theme = createTheme(defaultTheme);

const Wrapper = styled(Box)(({ theme }) => ({ height: '100vh' }));

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const onFullscreenChange = () => {
      dispatch(
        systemActions.setIsFullscreen(document.fullscreenElement != null),
      );
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (document.fullscreenElement == null) {
      document.documentElement.requestFullscreen();
    } else if (typeof document.exitFullscreen === 'function') {
      document.exitFullscreen();
    }
  }, [document.fullscreenElement]);

  const Loading = 'loading';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Wrapper>
        <Suspense fallback={Loading}>
          <Routes>
            <Route
              path="/"
              element={<TitlePage toggleFullScreen={toggleFullScreen} />}
            />
            <Route
              path="/game"
              element={<GamePage toggleFullScreen={toggleFullScreen} />}
            />
          </Routes>
        </Suspense>
      </Wrapper>
    </ThemeProvider>
  );
}

App.propTypes = {
  //
};

export default App;
