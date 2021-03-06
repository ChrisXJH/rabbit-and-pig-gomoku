import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  requestUpdate,
  playMove,
  restartGame,
  endGame,
} from '../../redux/actions';
import {
  gameIdSelector,
  gameBoardSelector,
  playerIdSelector,
  gameIsOwnerSelector,
} from '../../redux/selectors';
import { Redirect } from 'react-router-dom';
import {
  Container,
  makeStyles,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
} from '@material-ui/core';

const UPDATE_INTERVAL = 1000;

const cellSize = 28;
const clickableSize = 14;

const colorMapper = ['#000', '#fff'];

const useStyles = makeStyles((theme) => ({
  layout: {
    marginTop: theme.spacing(6),
  },
  boardContainer: {
    position: 'relative',
  },
  arenaTable: {
    border: '1px solid #444',
    borderCollapse: 'collapse',
    boxSizing: 'border-box',
  },
  cell: {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    border: '1px solid #444',
    boxSizing: 'border-box',
    backgroundColor: 'rgb(241, 236, 211)',
  },
  spot: {
    display: 'inline-block',
    position: 'absolute',
    borderRadius: '50%',
    boxSizing: 'border-box',
    cursor: 'pointer',
    width: `${clickableSize}px`,
    height: `${clickableSize}px`,
    border: '1px solid transparent',
  },
  wrapper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  actions: {
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));

const GameLayout = (props) => {
  const {
    gameId,
    requestUpdate,
    restartGame,
    playMove,
    endGame,
    board,
    playerId,
    isOwner,
  } = props;
  const classNames = useStyles();

  useEffect(() => {
    if (gameId) {
      requestUpdate({ gameId });

      const interval = setInterval(() => {
        requestUpdate({ gameId });
      }, UPDATE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [gameId, requestUpdate]);

  const handleRestartGame = useCallback(() => {
    if (isOwner) restartGame({ gameId });
  }, [isOwner, gameId, restartGame]);

  const handleEndGame = useCallback(() => {
    if (isOwner) endGame({ gameId })
  }, [isOwner, gameId, endGame]);

  if (!gameId) return <Redirect to="/" />;

  const handleCellClick = (x, y) => {
    playMove({ gameId, playerId, x, y });
  };

  const n = board.length;
  const m = (board[0] || []).length;
  const gameArena = [];

  for (let i = 0; i <= n; ++i) {
    const row = [];
    for (let j = 0; j <= m; ++j) {
      row.push(<td key={j} className={classNames.cell} />);
    }
    gameArena.push(<tr key={i}>{row}</tr>);
  }

  return (
    <Container className={classNames.layout}>
      <Grid container>
        <Grid item md={8}>
          <Box display="flex" justifyContent="center">
            <div className={classNames.boardContainer}>
              <div>
                {board.map((row, y) =>
                  row.map((cell, x) => (
                    <span
                      key={`${x},${y}`}
                      className={classNames.spot}
                      style={{
                        top: `${(y + 1) * cellSize - clickableSize / 2}px`,
                        left: `${(x + 1) * cellSize - clickableSize / 2}px`,
                        backgroundColor: colorMapper[cell],
                        borderColor: ![0, 1].includes(cell)
                          ? 'transparent'
                          : '#555',
                      }}
                      onClick={() => handleCellClick(x, y)}
                    />
                  ))
                )}
              </div>
              <table className={classNames.arenaTable}>
                <tbody>{gameArena}</tbody>
              </table>
            </div>
          </Box>
        </Grid>
        <Grid item md={4}>
          <Paper className={classNames.wrapper}>
            <Typography variant="h6">Info</Typography>
            <br />
            <Typography variant="body1">ID: {gameId}</Typography>
          </Paper>
          <Paper className={classNames.wrapper}>
            <Typography variant="h6">Actions</Typography>
            <br />
            <div className={classNames.actions}>
              <Button
                variant="contained"
                disabled={!isOwner}
                onClick={handleRestartGame}
              >
                Restart
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={!isOwner}
                onClick={handleEndGame}
              >
                End game
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

GameLayout.propTypes = {
  gameId: PropTypes.string,
  playerId: PropTypes.string,
  isOwner: PropTypes.bool.isRequired,
  board: PropTypes.arrayOf(PropTypes.array),
  requestUpdate: PropTypes.func.isRequired,
  playMove: PropTypes.func.isRequired,
  restartGame: PropTypes.func.isRequired,
  endGame: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  gameId: gameIdSelector(state),
  playerId: playerIdSelector(state),
  isOwner: gameIsOwnerSelector(state),
  board: gameBoardSelector(state),
});

const mapDispatchToProps = {
  requestUpdate,
  playMove,
  restartGame,
  endGame,
};
export default connect(mapStateToProps, mapDispatchToProps)(GameLayout);
